/// <reference types="node" />
import { WindowManager } from "..";
import { EventEmitter } from "events";
export declare class WindowEventManager extends EventEmitter {
    private _lastActiveId;
    private _prevWindows;
    private _interval;
    private _registeredEvents;
    private _windowManager;
    constructor(windowManager: WindowManager);
    private _pollActivated;
    private _pollCreatedDestroyed;
    private _pollTitleChanged;
    private _pollBoundsChanged;
    private _startPolling;
}
