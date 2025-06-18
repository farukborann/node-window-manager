## Class `AXWindow` `macOS`

Accessibility Window (AXWindow) support for macOS applications.

AXWindow represents an accessibility element in macOS that can be used to interact with windows that are part of an application's process. This is particularly useful for applications that have multiple windows or complex UI structures.

### Usage

```typescript
import { windowManager } from "node-window-manager";

const window = windowManager.getActiveWindow();

// Get all AXWindows for this window's process
const axWindows = window.getAXWindows();

axWindows.forEach((axWin) => {
  console.log(`Title: ${axWin.title}`);
  console.log(`Role: ${axWin.role}`);
  console.log(`Subrole: ${axWin.subrole}`);
  console.log(`Focused: ${axWin.focused}`);

  // Focus a specific AXWindow if it's not already focused
  if (!axWin.focused) {
    const success = axWin.focus();
    console.log(`Focus success: ${success}`);
  }
});
```

### Constructor

#### new AXWindow(data: IAXWindow)

- `data` IAXWindow - accessibility window data

> NOTE: AXWindow instances are typically created internally by calling `window.getAXWindows()`. You don't usually create them manually.

### Instance Properties

#### axWindow.handle

- Type: `number`
- The native handle/reference to the accessibility window

#### axWindow.title

- Type: `string`
- The title/name of the accessibility window

#### axWindow.role

- Type: `string`
- The accessibility role of the window (e.g., "AXWindow", "AXDialog", etc.)

#### axWindow.subrole

- Type: `string`
- The accessibility subrole providing more specific information about the window type

#### axWindow.focused

- Type: `boolean`
- Whether this accessibility window currently has focus

### Instance Methods

#### axWindow.focus() `macOS`

Attempts to focus this accessibility window.

Returns `boolean` - `true` if the focus operation succeeded, `false` otherwise

### Platform Support

- ✅ **macOS**: Full support through macOS Accessibility API
- ❌ **Windows**: Not available
- ❌ **Linux**: Not available

### Requirements

- macOS only
- Accessibility permissions must be granted (see `windowManager.requestAccessibility()`)
- The target application must support accessibility features

### Examples

#### Finding and focusing a specific window

```typescript
const window = windowManager.getActiveWindow();
const axWindows = window.getAXWindows();

// Find a window by title
const targetWindow = axWindows.find((ax) => ax.title.includes("Settings"));
if (targetWindow && !targetWindow.focused) {
  targetWindow.focus();
}
```

#### Listing all accessibility windows

```typescript
const window = windowManager.getActiveWindow();
const axWindows = window.getAXWindows();

console.log(`Found ${axWindows.length} accessibility windows:`);
axWindows.forEach((ax, index) => {
  console.log(
    `${index + 1}. ${ax.title} (${ax.role}/${ax.subrole}) - Focused: ${
      ax.focused
    }`
  );
});
```

### Interface `IAXWindow`

The data structure used internally for AXWindow creation:

```typescript
interface IAXWindow {
  handle: number;
  title: string;
  role: string;
  subrole: string;
  focused: boolean;
}
```
