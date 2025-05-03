
const { windowManager } = require("./dist/index");

function printWindow(window) {
  if (!window) return;

  console.log(`Window: ${window.getTitle()} (${window.path})`);

  const bounds = window.getBounds();
  if (bounds) {
    console.log(
      `  Bounds: x=${bounds.x}, y=${bounds.y}, width=${bounds.width}, height=${bounds.height}`
    );
  }

  if (process.platform === "darwin") {
    const axWindows = window.getAXWindows();

    if (axWindows && axWindows.length > 0) {
      console.log("  AXWindows:");

      axWindows.forEach((axWin) => {
        console.log(
          `    [${axWin.focused ? "FOCUSED" : "       "}] ${
            axWin.title
          } | role: ${axWin.role} | subrole: ${axWin.subrole}`
        );
      });
    }
  }
}

console.log("Request Accessibility :", windowManager.requestAccessibility()); // required on macOS

// Monitors list (sadece başta bir kere)
console.log("Monitors list");
windowManager.getMonitors().forEach((monitor) => {
  console.log(monitor.getWorkArea());
});

// Tüm pencereleri ve AXWindow'larını başta listele
console.log("Windows list");
windowManager.getWindows().forEach((window) => {
  if (window.isVisible()) {
    printWindow(window);
  }
});

// window-activated eventinde aktif pencereyi ve AXWindow'larını yazdır
windowManager.on("window-activated", (window) => {
  console.log("\n======== Window Activated ========");
  printWindow(window);
});

// Simulate focus cycle example
async function simulateFocusCycleExample() {
  const activeWindow = windowManager.getActiveWindow();
  if (activeWindow) {
    console.log("\n======== Simulating Focus Cycle ========");
    console.log(`Window before focus cycle: ${activeWindow.getTitle()}`);
    
    // Simulate focus cycle
    await activeWindow.simulateFocusCycle();
    
    console.log("Focus cycle completed");
  }
}

// Run the example after a delay to ensure other examples are visible
setTimeout(simulateFocusCycleExample, 5000);