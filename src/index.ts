import { EventEmitter } from "events";
import { platform } from "os";
import { resolve } from "path";

import { AXWindow } from "./classes/ax-window";
import { EmptyMonitor } from "./classes/empty-monitor";
import { Monitor } from "./classes/monitor";
import { Window } from "./classes/window";
import { IAXWindow, IRectangle, IMonitorInfo } from "./interfaces";

let addon: any;

if (platform() === "win32" || platform() === "darwin") {
  addon = require(`node-gyp-build`)(resolve(__dirname, ".."));
}

class WindowManager extends EventEmitter {
  private interval: any = null;
  private lastId: number | null = null;

  constructor(interval: number = 50) {
    super();

    if (!addon) return;

    this.on("newListener", (event) => {
      if (event === "window-activated") {
        if (this.listenerCount("window-activated") === 0) {
          this.lastId = addon.getActiveWindow();

          this.interval = setInterval(async () => {
            const win = addon.getActiveWindow();

            if (this.lastId !== win) {
              this.lastId = win;
              this.emit("window-activated", new Window(win));
            }
          }, interval);
        }
      }
    });

    this.on("removeListener", (event) => {
      if (event === "window-activated") {
        if (this.listenerCount("window-activated") === 0) {
          if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
          }
        }
      }
    });
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

  destroy = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.removeAllListeners();
    this.lastId = null;
  };
}

export {
  WindowManager,
  Window,
  Monitor,
  EmptyMonitor,
  AXWindow,
  IAXWindow,
  IRectangle,
  IMonitorInfo,
  addon,
};
