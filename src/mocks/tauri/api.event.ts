/* eslint-disable no-console */
import type * as ApiEvent from '@tauri-apps/api/event';

import { __preStoreFile } from './plugin-fs.js';

export const listen: typeof ApiEvent.listen<Event> = async (name, handler) => {
  console.info('tauri:', 'start listening', name);

  function eventHandler(domEvent: Event) {
    // our payload piggy bag
    const extras: { paths?: string[] } = {};

    // dragover and drop events need to be prevented from bubbling up
    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#prevent_the_browsers_default_drag_behavior
    if (name === TauriEvent.DRAG_DROP || name === TauriEvent.DRAG_ENTER) {
      domEvent.preventDefault();
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#process_the_drop
    if (name === TauriEvent.DRAG_DROP) {
      const { dataTransfer } = domEvent as DragEvent;
      extras.paths = Array
        // we need a proper array instead of a list
        .from(dataTransfer?.items ?? [])
        // pre-store the files and hand out the identifiers
        .map(item => __preStoreFile(item.getAsFile() as File));
    }

    handler({ id: 0, event: name, payload: { ...domEvent, ...extras } });
  }

  window.addEventListener(name, eventHandler);

  return () => {
    console.info('tauri:', 'stop listening', event);
    window.removeEventListener(name, eventHandler);
  };
};

// recycle the enum with DOM events 🤓
export enum TauriEvent {
  DRAG_DROP = 'drop',
  DRAG_ENTER = 'dragover',
  DRAG_LEAVE = 'dragout',
}
