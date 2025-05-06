/// <reference types="node" />
import { AXWindow } from "./ax-window";
import { EmptyMonitor } from "./empty-monitor";
import { Monitor } from "./monitor";
import { IRectangle } from "../interfaces";
export declare class Window {
    id: number;
    processId: number;
    path: string;
    constructor(id: number);
    getBounds(): IRectangle;
    setBounds(bounds: IRectangle): void;
    getTitle(): string;
    getMonitor(): Monitor | EmptyMonitor;
    show(): void;
    hide(): void;
    minimize(): void;
    restore(): void;
    maximize(): void;
    bringToTop(): void;
    forceFocus(): any;
    redraw(): void;
    isWindow(): boolean;
    isVisible(): boolean;
    toggleTransparency(toggle: boolean): void;
    setOpacity(opacity: number): void;
    getOpacity(): any;
    getIcon(size?: 16 | 32 | 64 | 256): Buffer;
    setOwner(window: Window | null | number): void;
    getOwner(): Window;
    /**
     * Returns all AXWindows for this window's process (macOS only)
     */
    getAXWindows(): AXWindow[];
}
