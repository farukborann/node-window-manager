"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Window = void 0;
const __1 = require("..");
const ax_window_1 = require("./ax-window");
const empty_monitor_1 = require("./empty-monitor");
const monitor_1 = require("./monitor");
class Window {
    constructor(id) {
        if (!__1.addon)
            return;
        this.id = id;
        const { processId, path } = __1.addon.initWindow(id);
        this.processId = processId;
        this.path = path;
    }
    getBounds() {
        if (!__1.addon)
            return;
        const bounds = __1.addon.getWindowBounds(this.id);
        if (process.platform === "win32") {
            const sf = this.getMonitor().getScaleFactor();
            bounds.x = Math.floor(bounds.x / sf);
            bounds.y = Math.floor(bounds.y / sf);
            bounds.width = Math.floor(bounds.width / sf);
            bounds.height = Math.floor(bounds.height / sf);
        }
        return bounds;
    }
    setBounds(bounds) {
        if (!__1.addon)
            return;
        const newBounds = Object.assign(Object.assign({}, this.getBounds()), bounds);
        if (process.platform === "win32") {
            const sf = this.getMonitor().getScaleFactor();
            newBounds.x = Math.floor(newBounds.x * sf);
            newBounds.y = Math.floor(newBounds.y * sf);
            newBounds.width = Math.floor(newBounds.width * sf);
            newBounds.height = Math.floor(newBounds.height * sf);
            __1.addon.setWindowBounds(this.id, newBounds);
        }
        else if (process.platform === "darwin") {
            __1.addon.setWindowBounds(this.id, newBounds);
        }
    }
    getTitle() {
        if (!__1.addon)
            return;
        return __1.addon.getWindowTitle(this.id);
    }
    getMonitor() {
        if (!__1.addon || !__1.addon.getMonitorFromWindow)
            return new empty_monitor_1.EmptyMonitor();
        return new monitor_1.Monitor(__1.addon.getMonitorFromWindow(this.id));
    }
    show() {
        if (!__1.addon || !__1.addon.showWindow)
            return;
        __1.addon.showWindow(this.id, "show");
    }
    hide() {
        if (!__1.addon || !__1.addon.showWindow)
            return;
        __1.addon.showWindow(this.id, "hide");
    }
    minimize() {
        if (!__1.addon)
            return;
        if (process.platform === "win32") {
            __1.addon.showWindow(this.id, "minimize");
        }
        else if (process.platform === "darwin") {
            __1.addon.setWindowMinimized(this.id, true);
        }
    }
    restore() {
        if (!__1.addon)
            return;
        if (process.platform === "win32") {
            __1.addon.showWindow(this.id, "restore");
        }
        else if (process.platform === "darwin") {
            __1.addon.setWindowMinimized(this.id, false);
        }
    }
    maximize() {
        if (!__1.addon)
            return;
        if (process.platform === "win32") {
            __1.addon.showWindow(this.id, "maximize");
        }
        else if (process.platform === "darwin") {
            __1.addon.setWindowMaximized(this.id);
        }
    }
    bringToTop() {
        if (!__1.addon)
            return;
        if (process.platform === "darwin") {
            __1.addon.bringWindowToTop(this.id, this.processId);
        }
        else {
            __1.addon.bringWindowToTop(this.id);
        }
    }
    forceFocus() {
        if (!__1.addon || process.platform !== "win32")
            return;
        return __1.addon.forceFocus(this.id);
    }
    redraw() {
        if (!__1.addon || !__1.addon.redrawWindow)
            return;
        __1.addon.redrawWindow(this.id);
    }
    isWindow() {
        if (!__1.addon)
            return;
        if (process.platform === "win32") {
            return this.path && this.path !== "" && __1.addon.isWindow(this.id);
        }
        else if (process.platform === "darwin") {
            return this.path && this.path !== "" && !!__1.addon.initWindow(this.id);
        }
    }
    isVisible() {
        if (!__1.addon || !__1.addon.isWindowVisible)
            return true;
        return __1.addon.isWindowVisible(this.id);
    }
    toggleTransparency(toggle) {
        if (!__1.addon || !__1.addon.toggleWindowTransparency)
            return;
        __1.addon.toggleWindowTransparency(this.id, toggle);
    }
    setOpacity(opacity) {
        if (!__1.addon || !__1.addon.setWindowOpacity)
            return;
        __1.addon.setWindowOpacity(this.id, opacity);
    }
    getOpacity() {
        if (!__1.addon || !__1.addon.getWindowOpacity)
            return 1;
        return __1.addon.getWindowOpacity(this.id);
    }
    setOwner(window) {
        if (!__1.addon || !__1.addon.setWindowOwner)
            return;
        let handle = window;
        if (window instanceof Window) {
            handle = window.id;
        }
        else if (!window) {
            handle = 0;
        }
        __1.addon.setWindowOwner(this.id, handle);
    }
    getOwner() {
        if (!__1.addon || !__1.addon.getWindowOwner)
            return;
        return new Window(__1.addon.getWindowOwner(this.id));
    }
    /**
     * Returns all AXWindows for this window's process (macOS only)
     */
    getAXWindows() {
        if (process.platform !== "darwin" || !__1.addon || !__1.addon.getAXWindows)
            return [];
        const arr = __1.addon.getAXWindows(this.id) || [];
        return arr.map((data) => new ax_window_1.AXWindow(data));
    }
}
exports.Window = Window;
//# sourceMappingURL=window.js.map