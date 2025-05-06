/// <reference types="node" />
import { EventEmitter } from "events";
import { EmptyMonitor } from "./classes/empty-monitor";
import { Monitor } from "./classes/monitor";
import { Window } from "./classes/window";
declare let addon: any;
declare class WindowManager extends EventEmitter {
    constructor();
    requestAccessibility: () => any;
    getActiveWindow: () => Window;
    getWindows: () => Window[];
    getMonitors: () => Monitor[];
    getPrimaryMonitor: () => EmptyMonitor | Monitor;
    createProcess: (path: string, cmd?: string) => number;
}
declare const windowManager: WindowManager;
export { windowManager, Window, addon };
