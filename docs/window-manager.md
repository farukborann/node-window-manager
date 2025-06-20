## `windowManager`

Get monitors and opened windows.

```typescript
import { windowManager } from "node-window-manager";

// Request accessibility permission on macOS
windowManager.requestAccessibility();

const window = windowManager.getActiveWindow();

// Prints the currently focused window title.
console.log(window.getTitle());
```

### Instance methods

#### windowManager.requestAccessibility() `macOS`

If the accessibility permission is not granted on `macOS`, it opens an accessibility permission request dialog.

The method is required to call before calling the following methods:

- `window.setBounds`
- `window.maximize`
- `window.minimize`
- `window.restore`
- `window.bringToTop`
- `window.getTitle`

Returns `boolean`

#### windowManager.getActiveWindow() `Windows` `macOS`

Returns [`Window`](window.md)

#### windowManager.getWindows() `Windows` `macOS`

Returns [`Window[]`](window.md)

#### windowManager.getMonitors() `Windows`

> NOTE: on macOS this method returns `[]` for compatibility.

- Returns [`Monitor[]`](monitor.md)

#### windowManager.getPrimaryMonitor() `Windows`

> NOTE: on macOS this method returns an `EmptyMonitor` object for compatibility.

- Returns [`Monitor`](monitor.md)

### macOS AXWindow (Accessibility Window) Support

On macOS, you can access all accessibility windows (AXWindow) for a window's process:

```js
const axWindows = window.getAXWindows();
axWindows.forEach((axWin) => {
  console.log(axWin.title, axWin.role, axWin.subrole, axWin.focused);
  if (!axWin.focused) axWin.focus();
});
```

- Only available on macOS.
- See Window.getAXWindows() and AXWindow class in the window documentation.

### Events

#### Event 'window-activated' `Windows` `macOS`

Returns:

- [`Window`](window.md)

Emitted when a window has been activated.
