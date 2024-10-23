export async function listen(event: string) {
  console.info('tauri:', 'start listening', event);
  return () => {
    console.info('tauri:', 'stop listening', event);
  };
}

export enum TauriEvent {
  DRAG_DROP = 'DRAG_DROP',
  DRAG_ENTER = 'DRAG_ENTER',
  DRAG_LEAVE = 'DRAG_LEAVE',
}
