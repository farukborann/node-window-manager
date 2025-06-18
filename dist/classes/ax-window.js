"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AXWindow = void 0;
const __1 = require("..");
class AXWindow {
    constructor(data) {
        this.handle = data.handle;
        this.title = data.title;
        this.role = data.role;
        this.subrole = data.subrole;
        this.focused = data.focused;
    }
    /**
     * Focus this AXWindow (macOS only)
     */
    focus() {
        if (process.platform !== "darwin" || !__1.addon || !__1.addon.focusAXWindow)
            return false;
        return !!__1.addon.focusAXWindow(this.handle);
    }
}
exports.AXWindow = AXWindow;
//# sourceMappingURL=ax-window.js.map