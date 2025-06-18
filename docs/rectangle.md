## Interface `IRectangle`

Rectangle object used for window bounds and monitor areas.

### Properties

- `x` number (optional) - horizontal position in pixels
- `y` number (optional) - vertical position in pixels
- `width` number (optional) - width in pixels
- `height` number (optional) - height in pixels

### Usage

```typescript
import { windowManager } from "node-window-manager";

const window = windowManager.getActiveWindow();

// Get current bounds
const bounds = window.getBounds();
console.log(
  `Window is at ${bounds.x}, ${bounds.y} with size ${bounds.width}x${bounds.height}`
);

// Set new bounds (all properties are optional)
window.setBounds({
  x: 100,
  y: 100,
  width: 800,
  height: 600,
});

// You can also set partial bounds
window.setBounds({ width: 1000 }); // Only change width
```
