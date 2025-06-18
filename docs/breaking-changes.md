# Breaking changes

List of breaking changes between major versions.

## Planned Breaking API Changes (2.0)

### `windowManager.getScaleFactor(monitor: number)`

```typescript
// Deprecated
windowManager.getScaleFactor(windowManager.getActiveWindow().getMonitor());
// Replace with
windowManager.getActiveWindow().getMonitor().getScaleFactor();
```

### `windowManager.requestAccessibility()` `macOS`

The `windowManager.requestAccessibility` method won't be required before each operation on windows anymore. Only on:

- `window.setBounds`
- `window.maximize`
- `window.minimize`
- `window.restore`
- `window.bringToTop`
- `window.getTitle`

### `window.getMonitor(): number`

Now the `window.getMonitor` method returns [`Monitor`](monitor.md) object.

### `window.getInfo()`

`window.getInfo` method has been removed.

```typescript
// Deprecated
const { title } = window.getInfo();
// Replace with
const title = window.getTitle();
```

## Released in v2.3.0

- **API changes:**

  - **REMOVED:** `windowManager.createProcess()` method has been removed
  - **REMOVED:** `window.getIcon()` method has been removed

- **New features:**

  - **macOS AXWindow support:** Enhanced accessibility window support for macOS
  - New `window.getAXWindows()` method returns array of AXWindow objects
  - AXWindow class with `focus()` method for precise window control
  - Enhanced multi-window application support on macOS

- **Development environment improvements:**

  - Migrated from TSLint to ESLint for better TypeScript support
  - Updated to modern ESLint v9 with flat config format
  - Upgraded TypeScript to v5.4 for better type safety
  - Enhanced C++ build system with C++17 standard support

- **Documentation improvements:**
  - Added comprehensive installation prerequisites for Windows (Visual Studio + C++ tools)
  - Enhanced API documentation with better examples
  - Added yarn support documentation
  - Added dedicated AXWindow documentation

## Released in v2.2.5

- **Bug fixes and minor improvements**
