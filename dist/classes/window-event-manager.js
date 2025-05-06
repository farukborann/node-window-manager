"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const interfaces_1 = require("../interfaces");
class WindowEventManager extends events_1.EventEmitter {
    constructor(windowManager) {
        super();
        this._interval = null;
        this._registeredEvents = new Set();
        this._prevWindows = new Map();
        this._windowManager = windowManager;
        this.on("newListener", (event) => {
            if (interfaces_1.WindowEventKeys.includes(event)) {
                const typedEvent = event;
                if (!this._registeredEvents.has(typedEvent)) {
                    this._registeredEvents.add(typedEvent);
                    if (this._interval === null) {
                        this._startPolling();
                    }
                }
            }
        });
        this.on("removeListener", (event) => {
            if (interfaces_1.WindowEventKeys.includes(event)) {
                const typedEvent = event;
                if (this.listenerCount(event) === 0) {
                    this._registeredEvents.delete(typedEvent);
                    if (this._registeredEvents.size === 0 && this._interval) {
                        clearInterval(this._interval);
                        this._interval = null;
                    }
                }
            }
        });
    }
    _pollActivated(windows, events) {
        if (!events.has("window-activated"))
            return;
        const activeId = this._windowManager.getActiveWindow().id;
        if (this._lastActiveId !== activeId) {
            this._lastActiveId = activeId;
            const win = windows.find((w) => w.id === activeId);
            if (win)
                this.emit("window-activated", { window: win });
        }
    }
    _pollCreatedDestroyed(windows, events) {
        const prevIds = new Set(this._prevWindows.keys());
        const currentIds = new Set(windows.map((w) => w.id));
        // created
        if (events.has("window-created")) {
            for (const win of windows) {
                if (!this._prevWindows.has(win.id)) {
                    this.emit("window-created", { window: win });
                }
            }
        }
        // destroyed
        if (events.has("window-destroyed")) {
            for (const prevId of prevIds) {
                if (!currentIds.has(prevId)) {
                    this.emit("window-destroyed", { windowId: prevId });
                }
            }
        }
    }
    _pollTitleChanged(windows, events) {
        if (!events.has("window-title-changed"))
            return;
        for (const win of windows) {
            const prev = this._prevWindows.get(win.id);
            const newTitle = win.getTitle();
            if (prev && prev.title !== newTitle) {
                this.emit("window-title-changed", {
                    window: win,
                    oldTitle: prev.title,
                    newTitle,
                });
            }
        }
    }
    _pollBoundsChanged(windows, events) {
        if (!events.has("window-bounds-changed"))
            return;
        for (const win of windows) {
            const prev = this._prevWindows.get(win.id);
            const newBounds = win.getBounds();
            if (prev &&
                prev.bounds &&
                newBounds &&
                (prev.bounds.x !== newBounds.x ||
                    prev.bounds.y !== newBounds.y ||
                    prev.bounds.width !== newBounds.width ||
                    prev.bounds.height !== newBounds.height)) {
                this.emit("window-bounds-changed", {
                    window: win,
                    oldBounds: prev.bounds,
                    newBounds,
                });
            }
        }
    }
    _startPolling() {
        this._lastActiveId = undefined;
        this._prevWindows.clear();
        this._interval = setInterval(() => {
            const events = this._registeredEvents;
            const windows = this._windowManager
                .getWindows()
                .filter((w) => w.isVisible());
            this._pollActivated(windows, events);
            this._pollCreatedDestroyed(windows, events);
            this._pollTitleChanged(windows, events);
            this._pollBoundsChanged(windows, events);
            // update prevWindows
            this._prevWindows.clear();
            for (const win of windows) {
                this._prevWindows.set(win.id, {
                    title: win.getTitle(),
                    bounds: win.getBounds(),
                });
            }
        }, 100);
    }
}
exports.WindowEventManager = WindowEventManager;
//# sourceMappingURL=window-event-manager.js.map