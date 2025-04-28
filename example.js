
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

// Empty window test
console.log("\nEmpty window test:");
const empty1 = windowManager.createEmptyWindow({
  title: "Empty 1",
  width: 300,
  height: 200,
  show: true,
  frame: false,
  transparent: true,
  resizable: false,
  movable: false,
  alwaysOnTop: true,
  skipTaskbar: true,
});

if (empty1) {
  console.log("Created empty1:", empty1.getTitle(), empty1.getBounds());
  console.log("empty1 id:", empty1 && empty1.id);
  console.log("empty1 isWindow:", empty1 && empty1.isWindow());
  console.log("empty1 isVisible:", empty1 && empty1.isVisible());
  console.log("empty1 title:", empty1 && empty1.getTitle());
  console.log("empty1 bounds:", empty1 && empty1.getBounds());
  setTimeout(() => {
    console.log("Closing empty1 window...");
    windowManager.exitEmptyWindow(empty1.id);
  }, 2000);
}