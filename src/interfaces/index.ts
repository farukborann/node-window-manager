export interface IRectangle {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface IMonitorInfo {
  id: number;
  bounds?: IRectangle;
  isPrimary?: boolean;
  workArea?: IRectangle;
}

export interface IAXWindow {
  handle: number;
  title: string;
  role: string;
  subrole: string;
  focused: boolean;
}

export type WindowEvent =
  | "window-activated"
  | "window-created"
  | "window-destroyed"
  | "window-title-changed"
  | "window-bounds-changed";

export const WindowEventKeys = [
  "window-activated",
  "window-created",
  "window-destroyed",
  "window-title-changed",
  "window-bounds-changed",
];

export interface WindowActivatedEvent {
  window: import("../classes/window").Window;
}
export interface WindowCreatedEvent {
  window: import("../classes/window").Window;
}
export interface WindowDestroyedEvent {
  windowId: number;
}
export interface WindowTitleChangedEvent {
  window: import("../classes/window").Window;
  oldTitle: string;
  newTitle: string;
}
export interface WindowBoundsChangedEvent {
  window: import("../classes/window").Window;
  oldBounds: IRectangle;
  newBounds: IRectangle;
}
