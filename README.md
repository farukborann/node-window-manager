# node-window-manager

Manage windows in Windows, macOS and ~~Linux~~(WIP)

# Install

To install this package, just run

```bash
$ yarn add node-window-manager
```

## Prerequisites

### Windows

Before installing on Windows, you need to have Visual Studio installed with C++ desktop development tools:

1. Install [Visual Studio](https://visualstudio.microsoft.com/downloads/) (Community version is free)
2. During installation, make sure to select **"Desktop development with C++"** workload
3. This includes the MSVC compiler and Windows SDK required for building native modules

### macOS

On macOS, you'll need Xcode Command Line Tools:

```bash
$ xcode-select --install
```

# Quick start

The following example shows how to get the currently focused window's title and hide it.

```javascript
const { windowManager } = require("node-window-manager");

const window = windowManager.getActiveWindow();

// Prints the currently focused window bounds.
console.log(window.getBounds());

// This method has to be called on macOS before changing the window's bounds, otherwise it will throw an error.
// It will prompt an accessibility permission request dialog, if needed.
windowManager.requestAccessibility();

// Sets the active window's bounds.
window.setBounds({ x: 0, y: 0 });
```

# Development

This project uses yarn as the package manager and includes native C++ modules.

## Building from source

```bash
# Clone the repository
$ git clone https://github.com/sentialx/node-window-manager.git
$ cd node-window-manager

# Install dependencies
$ yarn install

# Build the project
$ yarn build

# Run linting
$ yarn lint

# Run example
$ yarn example
```

The build process will automatically compile the native C++ modules using node-gyp.

# Documentation

The documentation and API references are located in the [`docs`](docs) directory.
