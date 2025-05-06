import { IAXWindow } from "../interfaces";
export declare class AXWindow {
    handle: number;
    title: string;
    role: string;
    subrole: string;
    focused: boolean;
    constructor(data: IAXWindow);
    /**
     * Focus this AXWindow (macOS only)
     */
    focus(): boolean;
}
