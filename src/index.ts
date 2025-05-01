import { platform } from "os";
import { resolve } from "path";

import { EmptyMonitor } from "./classes/empty-monitor";
import { Monitor } from "./classes/monitor";
import { Window } from "./classes/window";
import { WindowEventManager } from "./classes/window-event-manager";
import {
  WindowActivatedEvent,
  WindowCreatedEvent,
  WindowDestroyedEvent,
  WindowTitleChangedEvent,
  WindowBoundsChangedEvent,
} from "./interfaces";

let addon: any;

if (platform() === "win32" || platform() === "darwin") {
  addon = require(`node-gyp-build`)(resolve(__dirname, ".."));
}

export class WindowManager {
  private windowEventManager: WindowEventManager;

  constructor() {
    this.windowEventManager = new WindowEventManager(this);
    if (!addon) return;
  }

  requestAccessibility = () => {
    if (!addon || !addon.requestAccessibility) return true;
    return addon.requestAccessibility();
  };

  getActiveWindow = () => {
    if (!addon) return;
    return new Window(addon.getActiveWindow());
  };

  getWindows = (): Window[] => {
    if (!addon || !addon.getWindows) return [];
    return addon
      .getWindows()
      .map((win: any) => new Window(win))
      .filter((x: Window) => x.isWindow());
  };

  getMonitors = (): Monitor[] => {
    if (!addon || !addon.getMonitors) return [];
    return addon.getMonitors().map((mon: any) => new Monitor(mon));
  };

  getPrimaryMonitor = (): Monitor | EmptyMonitor => {
    if (process.platform === "win32") {
      return this.getMonitors().find((x) => x.isPrimary);
    } else {
      return new EmptyMonitor();
    }
  };

  createProcess = (path: string, cmd = ""): number => {
    if (!addon || !addon.createProcess) return;
    return addon.createProcess(path, cmd);
  };

  /**
   * Listen for window-activated event
   */
  onWindowActivated(cb: (payload: WindowActivatedEvent) => void) {
    return this.windowEventManager.on("window-activated", cb);
  }
  /**
   * Listen for window-created event
   */
  onWindowCreated(cb: (payload: WindowCreatedEvent) => void) {
    return this.windowEventManager.on("window-created", cb);
  }
  /**
   * Listen for window-destroyed event
   */
  onWindowDestroyed(cb: (payload: WindowDestroyedEvent) => void) {
    return this.windowEventManager.on("window-destroyed", cb);
  }
  /**
   * Listen for window-title-changed event
   */
  onWindowTitleChanged(cb: (payload: WindowTitleChangedEvent) => void) {
    return this.windowEventManager.on("window-title-changed", cb);
  }
  /**
   * Listen for window-bounds-changed event
   */
  onWindowBoundsChanged(cb: (payload: WindowBoundsChangedEvent) => void) {
    return this.windowEventManager.on("window-bounds-changed", cb);
  }
}

const windowManager = new WindowManager();

export { windowManager, Window, addon };
