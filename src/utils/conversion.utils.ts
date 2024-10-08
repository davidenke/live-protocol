import type { Sheet, Topic, Workbook } from 'xmind-model';

/**
 * Convert a given set of sheets into markdown
 */
export function convertToMarkdown(workbook: Workbook): string {
  return workbook.getSheets().map(convertSheetToMarkdown).join('\n\n');
}

/**
 * Convert a single given sheet into markdown
 */
export function convertSheetToMarkdown(sheet: Sheet): string {
  return convertTopicToMarkdown(sheet.getRootTopic(), 1);
}

/**
 * Convert a single given topic into markdown.
 */
export function convertTopicToMarkdown(topic: Topic, level = 1): string {
  const title = topic.getTitle();
  const text = level > 2 ? renderListItem(title, level - 2) : renderHeadline(title, level);
  const attachedTopics = topic
    .getChildrenByType(['attached'])
    .map(child => convertTopicToMarkdown(child, level + 1))
    .join('');

  return `${text}${attachedTopics}`;
}

/**
 * Render a headline with a given level
 */
export function renderHeadline(text: string, level: number): string {
  const hN = '#'.repeat(level);
  return `${hN} ${sanitizeHeadline(text)}\n`;
}

/**
 * Render a list item at a given depth
 */
export function renderListItem(text: string, depth: number, ordered = false): string {
  const inset = ''.padStart(depth * 2, ' ');
  const bullet = ordered ? '1.' : '*';
  return `${inset}${bullet} ${sanitizeHeadline(text)}\n`;
}

/**
 * Sanitize a headline by removing newlines
 */
export function sanitizeHeadline(headline: string): string {
  return headline.replace(/(\r\n|\n|\r)/gm, '');
}
