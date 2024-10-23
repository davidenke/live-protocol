export async function open({ filters }: { filters: { name: string; extensions: string[] }[] }) {
  const extension = filters[0].extensions[0];
  console.info('tauri:', 'open', extension);
  return `/business-plan.${extension}`;
}

export async function save({ filters }: { filters: { name: string; extensions: string[] }[] }) {
  const extension = filters[0].extensions[0];
  console.info('tauri:', 'save', extension);
  return `/business-plan.${extension}`;
}
