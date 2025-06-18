"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addon = exports.WindowManager = void 0;
const events_1 = require("events");
const os_1 = require("os");
const path_1 = require("path");
const empty_monitor_1 = require("./classes/empty-monitor");
const monitor_1 = require("./classes/monitor");
const window_1 = require("./classes/window");
let addon;
if ((0, os_1.platform)() === "win32" || (0, os_1.platform)() === "darwin") {
    exports.addon = addon = require(`node-gyp-build`)((0, path_1.resolve)(__dirname, ".."));
}
class WindowManager extends events_1.EventEmitter {
    constructor(interval = 50) {
        super();
        this.interval = null;
        this.lastId = null;
        this.requestAccessibility = () => {
            if (!addon || !addon.requestAccessibility)
                return true;
            return addon.requestAccessibility();
        };
        this.getActiveWindow = () => {
            if (!addon)
                return;
            return new window_1.Window(addon.getActiveWindow());
        };
        this.getWindows = () => {
            if (!addon || !addon.getWindows)
                return [];
            return addon
                .getWindows()
                .map((win) => new window_1.Window(win))
                .filter((x) => x.isWindow());
        };
        this.getMonitors = () => {
            if (!addon || !addon.getMonitors)
                return [];
            return addon.getMonitors().map((mon) => new monitor_1.Monitor(mon));
        };
        this.getPrimaryMonitor = () => {
            if (process.platform === "win32") {
                return this.getMonitors().find((x) => x.isPrimary);
            }
            else {
                return new empty_monitor_1.EmptyMonitor();
            }
        };
        this.destroy = () => {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
            this.removeAllListeners();
            this.lastId = null;
        };
        if (!addon)
            return;
        this.on("newListener", (event) => {
            if (event === "window-activated") {
                if (this.listenerCount("window-activated") === 0) {
                    this.lastId = addon.getActiveWindow();
                    this.interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                        const win = addon.getActiveWindow();
                        if (this.lastId !== win) {
                            this.lastId = win;
                            this.emit("window-activated", new window_1.Window(win));
                        }
                    }), interval);
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
}
exports.WindowManager = WindowManager;
//# sourceMappingURL=index.js.map