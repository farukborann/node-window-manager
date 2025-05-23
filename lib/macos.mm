#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <ApplicationServices/ApplicationServices.h>
#include <napi.h>
#include <string>
#include <map>
#include <thread>
#include <fstream>

extern "C" AXError _AXUIElementGetWindow(AXUIElementRef, CGWindowID* out);

// CGWindowID to AXUIElementRef windows map
std::map<int, AXUIElementRef> windowsMap;

bool _requestAccessibility(bool showDialog) {
  NSDictionary* opts = @{static_cast<id> (kAXTrustedCheckOptionPrompt): showDialog ? @YES : @NO};
  return AXIsProcessTrustedWithOptions(static_cast<CFDictionaryRef> (opts));
}

Napi::Boolean requestAccessibility(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};
  return Napi::Boolean::New(env, _requestAccessibility(true));
}

NSDictionary* getWindowInfo(int handle) {
  CGWindowListOption listOptions = kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements;
  CFArrayRef windowList = CGWindowListCopyWindowInfo(listOptions, kCGNullWindowID);

  for (NSDictionary *info in (NSArray *)windowList) {
    NSNumber *windowNumber = info[(id)kCGWindowNumber];

    if ([windowNumber intValue] == handle) {
        // Retain property list so it doesn't get release w. windowList
        CFRetain((CFPropertyListRef)info);
        CFRelease(windowList);
        return info;
    }
  }

  CFRelease(windowList);

  return NULL;
}

AXUIElementRef getAXWindow(int pid, int handle) {
  auto app = AXUIElementCreateApplication(pid);

  CFArrayRef windows;
  AXUIElementCopyAttributeValues(app, kAXWindowsAttribute, 0, 100, &windows);

  for (id child in  (NSArray *)windows) {
    AXUIElementRef window = (AXUIElementRef) child;

    CGWindowID windowId;
    _AXUIElementGetWindow(window, &windowId);

    if ((int)windowId == handle) {
      // Retain returned window so it doesn't get released with rest of list
      CFRetain(window);
      CFRelease(windows);
      return window;
    }
  }

  if (windows) {
    CFRelease(windows);
  }
  return NULL;
}

void cacheWindow(int handle, int pid) {
  if (_requestAccessibility(false)) {
    if (windowsMap.find(handle) == windowsMap.end()) {
      windowsMap[handle] = getAXWindow(pid, handle);
    }
  }
}

void cacheWindowByInfo(NSDictionary* info) {
  if (info) {
    NSNumber *ownerPid = info[(id)kCGWindowOwnerPID];
    NSNumber *windowNumber = info[(id)kCGWindowNumber];
    // Release dictionary info property since we're done with it
    CFRelease((CFPropertyListRef)info);
    cacheWindow([windowNumber intValue], [ownerPid intValue]);
  }
}

void findAndCacheWindow(int handle) {
  cacheWindowByInfo(getWindowInfo(handle));
}

AXUIElementRef getAXWindowById(int handle) {
  auto win = windowsMap[handle];

  if (!win) {
    findAndCacheWindow(handle);
    win = windowsMap[handle];
  }

  return win;
}

Napi::Array getWindows(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  CGWindowListOption listOptions = kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements;
  CFArrayRef windowList = CGWindowListCopyWindowInfo(listOptions, kCGNullWindowID);

  std::vector<Napi::Number> vec;

  for (NSDictionary *info in (NSArray *)windowList) {
    NSNumber *ownerPid = info[(id)kCGWindowOwnerPID];
    NSNumber *windowNumber = info[(id)kCGWindowNumber];

    auto app = [NSRunningApplication runningApplicationWithProcessIdentifier: [ownerPid intValue]];
    auto path = app ? [app.bundleURL.path UTF8String] : NULL;

    if (app && path != NULL) {
      vec.push_back(Napi::Number::New(env, [windowNumber intValue]));
    }
  }

  auto arr = Napi::Array::New(env, vec.size());

  for (int i = 0; i < (int)vec.size(); i++) {
    arr[i] = vec[i];
  }

  CFRelease(windowList);

  return arr;
}

Napi::Number getActiveWindow(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  CGWindowListOption listOptions = kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements;
  CFArrayRef windowList = CGWindowListCopyWindowInfo(listOptions, kCGNullWindowID);

  for (NSDictionary *info in (NSArray *)windowList) {
    NSNumber *ownerPid = info[(id)kCGWindowOwnerPID];
    NSNumber *windowNumber = info[(id)kCGWindowNumber];

    auto app = [NSRunningApplication runningApplicationWithProcessIdentifier: [ownerPid intValue]];

    if (![app isActive]) {
      continue;
    }

    CFRelease(windowList);
    return Napi::Number::New(env, [windowNumber intValue]);
  }

  if (windowList) {
    CFRelease(windowList);
  }
  return Napi::Number::New(env, 0);
}

Napi::Object initWindow(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  int handle = info[0].As<Napi::Number>().Int32Value();

  auto wInfo = getWindowInfo(handle);

  if (wInfo) {
    NSNumber *ownerPid = wInfo[(id)kCGWindowOwnerPID];
    NSRunningApplication *app = [NSRunningApplication runningApplicationWithProcessIdentifier: [ownerPid intValue]];

    auto obj = Napi::Object::New(env);
    obj.Set("processId", [ownerPid intValue]);
    obj.Set("path", [app.bundleURL.path UTF8String]);

    cacheWindow(handle, [ownerPid intValue]);

    return obj;
  }

  return Napi::Object::New(env);
}

Napi::String getWindowTitle(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  int handle = info[0].As<Napi::Number>().Int32Value();

  auto wInfo = getWindowInfo(handle);

  if (wInfo) {
    NSString *windowName = wInfo[(id)kCGWindowOwnerName];
    return Napi::String::New(env, [windowName UTF8String]);
  }

  return Napi::String::New(env, "");
}

Napi::Object getWindowBounds(const Napi::CallbackInfo &info) {
   Napi::Env env{info.Env()};

  int handle = info[0].As<Napi::Number>().Int32Value();

  auto wInfo = getWindowInfo(handle);

  if (wInfo) {
    CGRect bounds;
    CGRectMakeWithDictionaryRepresentation((CFDictionaryRef)wInfo[(id)kCGWindowBounds], &bounds);

    auto obj = Napi::Object::New(env);
    obj.Set("x", bounds.origin.x);
    obj.Set("y", bounds.origin.y);
    obj.Set("width", bounds.size.width);
    obj.Set("height", bounds.size.height);

    return obj;
  }

  return Napi::Object::New(env);
}

Napi::Boolean setWindowBounds(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  auto handle = info[0].As<Napi::Number>().Int32Value();
  auto bounds = info[1].As<Napi::Object>();

  auto x = bounds.Get("x").Unwrap().As<Napi::Number>().DoubleValue();
  auto y = bounds.Get("y").Unwrap().As<Napi::Number>().DoubleValue();
  auto width = bounds.Get("width").Unwrap().As<Napi::Number>().DoubleValue();
  auto height = bounds.Get("height").Unwrap().As<Napi::Number>().DoubleValue();

  auto win = getAXWindowById(handle);

  if (win) {
    NSPoint point = NSMakePoint((CGFloat) x, (CGFloat) y);
    NSSize size = NSMakeSize((CGFloat) width, (CGFloat) height);

    CFTypeRef positionStorage = (CFTypeRef)(AXValueCreate((AXValueType)kAXValueCGPointType, (const void *)&point));
    AXUIElementSetAttributeValue(win, kAXPositionAttribute, positionStorage);

    CFTypeRef sizeStorage = (CFTypeRef)(AXValueCreate((AXValueType)kAXValueCGSizeType, (const void *)&size));
    AXUIElementSetAttributeValue(win, kAXSizeAttribute, sizeStorage);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Boolean bringWindowToTop(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  auto handle = info[0].As<Napi::Number>().Int32Value();
  auto pid = info[1].As<Napi::Number>().Int32Value();

  auto app = AXUIElementCreateApplication(pid);
  auto win = getAXWindowById(handle);

  AXUIElementSetAttributeValue(app, kAXFrontmostAttribute, kCFBooleanTrue);
  AXUIElementSetAttributeValue(win, kAXMainAttribute, kCFBooleanTrue);

  return Napi::Boolean::New(env, true);
}

Napi::Boolean setWindowMinimized(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  auto handle = info[0].As<Napi::Number>().Int32Value();
  auto toggle = info[1].As<Napi::Boolean>();

  auto win = getAXWindowById(handle);

  if (win) {
    AXUIElementSetAttributeValue(win, kAXMinimizedAttribute, toggle ? kCFBooleanTrue : kCFBooleanFalse);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Boolean setWindowMaximized(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};
  auto handle = info[0].As<Napi::Number>().Int32Value();
  auto win = getAXWindowById(handle);

  if(win) {
    NSRect screenSizeRect = [[NSScreen mainScreen] frame];
    int screenWidth = screenSizeRect.size.width;
    int screenHeight = screenSizeRect.size.height;

    NSPoint point = NSMakePoint((CGFloat) 0, (CGFloat) 0);
    NSSize size = NSMakeSize((CGFloat) screenWidth, (CGFloat) screenHeight);

    CFTypeRef positionStorage = (CFTypeRef)(AXValueCreate((AXValueType)kAXValueCGPointType, (const void *)&point));
    AXUIElementSetAttributeValue(win, kAXPositionAttribute, positionStorage);

    CFTypeRef sizeStorage = (CFTypeRef)(AXValueCreate((AXValueType)kAXValueCGSizeType, (const void *)&size));
    AXUIElementSetAttributeValue(win, kAXSizeAttribute, sizeStorage);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Array getAXWindows(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};
  int handle = info[0].As<Napi::Number>().Int32Value();

  auto wInfo = getWindowInfo(handle);
  if (!wInfo) {
    return Napi::Array::New(env);
  }
  NSNumber *ownerPid = wInfo[(id)kCGWindowOwnerPID];
  int pid = [ownerPid intValue];

  AXUIElementRef app = AXUIElementCreateApplication(pid);
  CFArrayRef windows = NULL;
  AXUIElementCopyAttributeValues(app, kAXWindowsAttribute, 0, 100, &windows);

  Napi::Array result = Napi::Array::New(env);
  if (windows) {
    CFIndex count = CFArrayGetCount(windows);
    uint32_t idx = 0;

    for (CFIndex i = 0; i < count; i++) {
      AXUIElementRef win = (AXUIElementRef)CFArrayGetValueAtIndex(windows, i);
      CGWindowID windowId;
      Napi::Object obj = Napi::Object::New(env);
    
      if (_AXUIElementGetWindow(win, &windowId) == kAXErrorSuccess) {
        obj.Set("handle", (int)windowId);
      } else {
        obj.Set("handle", -1);
      }

      CFTypeRef titleValue = NULL;
      if (AXUIElementCopyAttributeValue(win, kAXTitleAttribute, &titleValue) == kAXErrorSuccess && titleValue) {
        if (CFGetTypeID(titleValue) == CFStringGetTypeID()) {
          NSString *title = (__bridge NSString *)titleValue;
          obj.Set("title", std::string([title UTF8String]));
        }
        CFRelease(titleValue);
      } else {
        obj.Set("title", "");
      }
      
      CFTypeRef roleValue = NULL;
      if (AXUIElementCopyAttributeValue(win, kAXRoleAttribute, &roleValue) == kAXErrorSuccess && roleValue) {
        if (CFGetTypeID(roleValue) == CFStringGetTypeID()) {
          NSString *role = (__bridge NSString *)roleValue;
          obj.Set("role", std::string([role UTF8String]));
        }
        CFRelease(roleValue);
      } else {
        obj.Set("role", "");
      }
      
      CFTypeRef subroleValue = NULL;
      if (AXUIElementCopyAttributeValue(win, kAXSubroleAttribute, &subroleValue) == kAXErrorSuccess && subroleValue) {
        if (CFGetTypeID(subroleValue) == CFStringGetTypeID()) {
          NSString *subrole = (__bridge NSString *)subroleValue;
          obj.Set("subrole", std::string([subrole UTF8String]));
        }
        CFRelease(subroleValue);
      } else {
        obj.Set("subrole", "");
      }
      
      CFTypeRef focusedValue = NULL;
      bool isFocused = false;
      if (AXUIElementCopyAttributeValue(win, kAXFocusedAttribute, &focusedValue) == kAXErrorSuccess && focusedValue) {
        if (CFGetTypeID(focusedValue) == CFBooleanGetTypeID()) {
          isFocused = CFBooleanGetValue((CFBooleanRef)focusedValue);
        }
        CFRelease(focusedValue);
      }
      obj.Set("focused", isFocused);

      result[idx++] = obj;
    }

    CFRelease(windows);
  }

  CFRelease((CFPropertyListRef)wInfo);
  
  return result;
}

Napi::Boolean focusAXWindow(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};
  
  int handle = info[0].As<Napi::Number>().Int32Value();
  auto wInfo = getWindowInfo(handle);
  if (!wInfo) {
    return Napi::Boolean::New(env, false);
  }

  NSNumber *ownerPid = wInfo[(id)kCGWindowOwnerPID];
  int pid = [ownerPid intValue];

  AXUIElementRef app = AXUIElementCreateApplication(pid);
  CFArrayRef windows = NULL;
  AXUIElementCopyAttributeValues(app, kAXWindowsAttribute, 0, 100, &windows);

  bool focused = false;
  if (windows) {
    CFIndex count = CFArrayGetCount(windows);

    for (CFIndex i = 0; i < count; i++) {
      AXUIElementRef win = (AXUIElementRef)CFArrayGetValueAtIndex(windows, i);
      CGWindowID windowId;
    
      if (_AXUIElementGetWindow(win, &windowId) == kAXErrorSuccess && (int)windowId == handle) {
        AXUIElementSetAttributeValue(win, kAXMainAttribute, kCFBooleanTrue);
        AXUIElementSetAttributeValue(win, kAXFocusedAttribute, kCFBooleanTrue);
        focused = true;
        break;
      }
    }
    
    CFRelease(windows);
  }
  
  CFRelease((CFPropertyListRef)wInfo);
  
  return Napi::Boolean::New(env, focused);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "getWindows"),
                Napi::Function::New(env, getWindows));
    exports.Set(Napi::String::New(env, "getActiveWindow"),
                Napi::Function::New(env, getActiveWindow));
    exports.Set(Napi::String::New(env, "setWindowBounds"),
                Napi::Function::New(env, setWindowBounds));
    exports.Set(Napi::String::New(env, "getWindowBounds"),
                Napi::Function::New(env, getWindowBounds));
    exports.Set(Napi::String::New(env, "getWindowTitle"),
                Napi::Function::New(env, getWindowTitle));
    exports.Set(Napi::String::New(env, "initWindow"),
                Napi::Function::New(env, initWindow));
    exports.Set(Napi::String::New(env, "bringWindowToTop"),
                Napi::Function::New(env, bringWindowToTop));
    exports.Set(Napi::String::New(env, "setWindowMinimized"),
                Napi::Function::New(env, setWindowMinimized));
    exports.Set(Napi::String::New(env, "setWindowMaximized"),
                Napi::Function::New(env, setWindowMaximized));
    exports.Set(Napi::String::New(env, "requestAccessibility"),
                Napi::Function::New(env, requestAccessibility));
    exports.Set(Napi::String::New(env, "getAXWindows"),
                Napi::Function::New(env, getAXWindows));
    exports.Set(Napi::String::New(env, "focusAXWindow"),
                Napi::Function::New(env, focusAXWindow));

    return exports;
}

NODE_API_MODULE(addon, Init)
