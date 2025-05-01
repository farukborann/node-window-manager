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

// window-created eventinde yeni pencereyi ve AXWindow'larını yazdır
windowManager.onWindowCreated(({ window }) => {
  console.log("[window-created]", window.getTitle(), window.id);
});

// window-destroyed eventinde silinen pencereyi yazdır
windowManager.onWindowDestroyed(({ windowId }) => {
  console.log("[window-destroyed]", windowId);
});

// // window-title-changed eventinde pencere başlığının değiştiğini yazdır
// windowManager.onWindowTitleChanged(({ window, oldTitle, newTitle }) => {
//   console.log(
//     `[window-title-changed] ${window.id}: '${oldTitle}' -> '${newTitle}'`
//   );
// });

// // window-bounds-changed eventinde pencere sınırlarının değiştiğini yazdır
// windowManager.onWindowBoundsChanged(({ window, oldBounds, newBounds }) => {
//   console.log(
//     `[window-bounds-changed] ${window.id}:`,
//     oldBounds,
//     "->",
//     newBounds
//   );
// });

// // window-activated eventinde aktif pencereyi ve AXWindow'larını yazdır
// windowManager.onWindowActivated(({ window }) => {
//   console.log("[window-activated]", window.getTitle(), window.id);
//   printWindow(window);
// });
