import type { Sheet, Topic, Workbook } from 'xmind-model';

export type ConversionOptions = {
  /**
   * Topics until this level will be rendered as headlines.
   * Minimum value is 1, default is 2, maximum value is 6.
   * @default 2
   */
  useHeadlinesUntilLevel: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Topics until this level will be rendered as lists.
   * Minimum value is the value of `useHeadlinesUntilLevel`, default is 4 if higher.
   * No maximum value.
   *
   * @default 4 if higher than `useHeadlinesUntilLevel`
   *
   * Unused right now, as no explicit rendering beyond lists is implemented.
   */
  useListsUntilLevel: number;
};

export function conversionOptionsWithDefaults(options: Partial<ConversionOptions> = {}): ConversionOptions {
  return {
    useHeadlinesUntilLevel: 2,
    useListsUntilLevel: Math.max(4, options.useHeadlinesUntilLevel ?? 2),
    ...options,
  };
}

/**
 * Convert a given set of sheets into markdown
 */
export function convertToMarkdown(workbook: Workbook, options?: ConversionOptions): string {
  options = conversionOptionsWithDefaults(options);
  return workbook
    .getSheets()
    .map(sheet => convertSheetToMarkdown(sheet, options))
    .join('\n\n');
}

/**
 * Convert a single given sheet into markdown
 */
export function convertSheetToMarkdown(sheet: Sheet, options: ConversionOptions): string {
  return convertTopicToMarkdown(sheet.getRootTopic(), 1, options);
}

/**
 * Convert a single given topic into markdown.
 */
export function convertTopicToMarkdown(topic: Topic, level: number, options: ConversionOptions): string {
  const { useHeadlinesUntilLevel, useListsUntilLevel } = options;
  const title = topic.getTitle();
  const text =
    level > useHeadlinesUntilLevel
      ? level > useListsUntilLevel
        ? renderText(title, level - useListsUntilLevel)
        : renderListItem(title, level - useHeadlinesUntilLevel)
      : renderHeadline(title, level);
  const attachedTopics = topic
    .getChildrenByType(['attached'])
    .map(child => convertTopicToMarkdown(child, level + 1, options))
    .join('');

  return `${text}${attachedTopics}`;
}

/**
 * Render a headline with a given level
 */
export function renderHeadline(text: string, level: number): string {
  const hN = '#'.repeat(level);
  return `${hN} ${removeLineBreaks(text)}\n`;
}

/**
 * Render a list item at a given depth
 */
export function renderListItem(text: string, depth: number, ordered = false): string {
  const inset = ''.padStart(depth * 2, ' ');
  const bullet = ordered ? '1.' : '*';
  return `${inset}${bullet} ${removeLineBreaks(text)}\n`;
}

/**
 * Render text node
 */
export function renderText(text: string, depth: number): string {
  // TODO implement me
  return renderListItem(text, depth, true);
}

/**
 * Removes line breaks from a given string
 */
export function removeLineBreaks(headline: string): string {
  return headline.replace(/(\r\n|\n|\r)/gm, '');
}
