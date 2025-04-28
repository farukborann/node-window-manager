import { addon } from "..";

import { IAXWindow } from "../interfaces";

export class AXWindow {
  handle: number;
  title: string;
  role: string;
  subrole: string;
  focused: boolean;

  constructor(data: IAXWindow) {
    this.handle = data.handle;
    this.title = data.title;
    this.role = data.role;
    this.subrole = data.subrole;
    this.focused = data.focused;
  }

  /**
   * Focus this AXWindow (macOS only)
   */
  focus(): boolean {
    if (process.platform !== "darwin" || !addon || !addon.focusAXWindow)
      return false;
    return !!addon.focusAXWindow(this.handle);
  }
}