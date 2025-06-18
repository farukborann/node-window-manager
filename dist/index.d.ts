import { EventEmitter } from "events";
import { AXWindow } from "./classes/ax-window";
import { EmptyMonitor } from "./classes/empty-monitor";
import { Monitor } from "./classes/monitor";
import { Window } from "./classes/window";
import { IAXWindow, IRectangle, IMonitorInfo } from "./interfaces";
declare let addon: any;
declare class WindowManager extends EventEmitter {
    private interval;
    private lastId;
    constructor(interval?: number);
    requestAccessibility: () => any;
    getActiveWindow: () => Window;
    getWindows: () => Window[];
    getMonitors: () => Monitor[];
    getPrimaryMonitor: () => Monitor | EmptyMonitor;
    destroy: () => void;
}
export { WindowManager, Window, Monitor, EmptyMonitor, AXWindow, IAXWindow, IRectangle, IMonitorInfo, addon, };
