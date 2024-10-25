import type * as ApiWindow from '@tauri-apps/api/window';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class LogicalSize implements ApiWindow.LogicalSize {
  public type = 'LogicalSize';

  constructor(
    public width: number,
    public height: number,
  ) {}

  toPhysical() {
    return {} as ApiWindow.PhysicalSize;
  }
}

export const getCurrentWindow: typeof ApiWindow.getCurrentWindow = () => {
  return {
    onCloseRequested: (...args: any[]) => console.info('tauri:', 'onCloseRequested', args),
    setResizable: (...args: any[]) => console.info('tauri:', 'setResizable', args),
    setSize: (...args: any[]) => console.info('tauri:', 'setSize', args),
    setTitle: (...args: any[]) => console.info('tauri:', 'setTitle', args),
    setTitleBarStyle: (...args: any[]) => console.info('tauri:', 'setTitleBarStyle', args),
    startDragging: (...args: any[]) => console.info('tauri:', 'startDragging', args),
  } as ApiWindow.Window;
};
