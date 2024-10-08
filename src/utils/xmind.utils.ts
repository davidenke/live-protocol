import JSZip from 'jszip';
import { Workbook } from 'xmind-model';

export async function readMindMap(data: Uint8Array): Promise<Workbook> {
  const zip = await JSZip.loadAsync(data);
  const content = await zip?.file('content.json')?.async('text');
  return new Workbook(JSON.parse(content ?? '[]'));
}
