import { WindowManager } from "..";
import { EventEmitter } from "events";

import { Window } from "./window";
import { WindowEvent, WindowEventKeys, IRectangle } from "../interfaces";

export class WindowEventManager extends EventEmitter {
  private _lastActiveId: number | undefined;
  private _prevWindows: Map<number, { title: string; bounds: IRectangle }>;
  private _interval: any = null;
  private _registeredEvents: Set<WindowEvent> = new Set();
  private _windowManager: WindowManager;

  constructor(windowManager: WindowManager) {
    super();
    this._prevWindows = new Map();
    this._windowManager = windowManager;

    this.on("newListener", (event: string) => {
      if (WindowEventKeys.includes(event)) {
        const typedEvent = event as WindowEvent;
        if (!this._registeredEvents.has(typedEvent)) {
          this._registeredEvents.add(typedEvent);
          if (this._interval === null) {
            this._startPolling();
          }
        }
      }
    });

    this.on("removeListener", (event: string) => {
      if (WindowEventKeys.includes(event)) {
        const typedEvent = event as WindowEvent;
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

  private _pollActivated(windows: Window[], events: Set<WindowEvent>) {
    if (!events.has("window-activated")) return;

    const activeId = this._windowManager.getActiveWindow().id;

    if (this._lastActiveId !== activeId) {
      this._lastActiveId = activeId;
      const win = windows.find((w) => w.id === activeId);
      if (win) this.emit("window-activated", { window: win });
    }
  }

  private _pollCreatedDestroyed(windows: Window[], events: Set<WindowEvent>) {
    const prevIds = new Set(this._prevWindows.keys());
    const currentIds = new Set<number>(windows.map((w) => w.id));

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

  private _pollTitleChanged(windows: Window[], events: Set<WindowEvent>) {
    if (!events.has("window-title-changed")) return;

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

  private _pollBoundsChanged(windows: Window[], events: Set<WindowEvent>) {
    if (!events.has("window-bounds-changed")) return;

    for (const win of windows) {
      const prev = this._prevWindows.get(win.id);
      const newBounds = win.getBounds();

      if (
        prev &&
        prev.bounds &&
        newBounds &&
        (prev.bounds.x !== newBounds.x ||
          prev.bounds.y !== newBounds.y ||
          prev.bounds.width !== newBounds.width ||
          prev.bounds.height !== newBounds.height)
      ) {
        this.emit("window-bounds-changed", {
          window: win,
          oldBounds: prev.bounds,
          newBounds,
        });
      }
    }
  }

  private _startPolling() {
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
