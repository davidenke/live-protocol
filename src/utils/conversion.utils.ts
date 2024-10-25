import HTMLtoDOCX from '@turbodocx/html-to-docx';
import { parse } from 'marked';
import type { Sheet, Topic, Workbook } from 'xmind-model';

/**
 * Re-exported types from xmind-model
 */
export type MindMap = Workbook;

export type ConversionOptions = {
  /**
   * Topics until this level will be visible.
   * Minimum value is 1, no maximum value, default is Infinity.
   * @default Infinity
   */
  useUntilLevel: number;

  /**
   * Topics until this level will be rendered as headlines.
   * Minimum value is 0, maximum value is 6, default is 2.
   * @default 2
   */
  useHeadlinesUntilLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Topics until this level will be rendered as ordered lists.
   * Minimum value is 0, no maximum value, default is 4.
   * @default 4
   */
  useOrderedListsUntilLevel: number;

  /**
   * Topics until this level will be rendered as unordered lists.
   * Minimum value is 0, no maximum value, default is Infinity.
   * @default Infinity
   */
  useUnorderedListsUntilLevel: number;
};

export function conversionOptionsWithDefaults(options: Partial<ConversionOptions> = {}): ConversionOptions {
  return {
    useUntilLevel: Infinity,
    useHeadlinesUntilLevel: 2,
    useOrderedListsUntilLevel: 4,
    useUnorderedListsUntilLevel: Infinity,
    ...options,
  };
}

/**
 * Convert a given set of sheets into markdown
 */
export function convertToMarkdown(mindMap: MindMap, options?: ConversionOptions): string {
  options = conversionOptionsWithDefaults(options);
  return mindMap
    .getSheets()
    .map(sheet => convertSheetToMarkdown(sheet, options))
    .join('\n\n');
}

/**
 * Convert markdown to html
 */
export async function convertToHtml(markdown: string): Promise<string> {
  return parse(markdown);
}

/**
 * Convert html to docx
 * https://github.com/turbodocx/html-to-docx
 */
export async function convertToDocx(html: string): Promise<Uint8Array> {
  return HTMLtoDOCX(html, undefined, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
    font: '',
    preprocessing: { skipHTMLMinify: false },
  });
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
  const { useUntilLevel } = options;
  const text = convertTopicByLevel(topic, level, options);
  if (level >= useUntilLevel) return text;

  const attachedTopics = topic
    .getChildrenByType(['attached'])
    .map(child => convertTopicToMarkdown(child, level + 1, options))
    .join('');
  return `${text}${attachedTopics}`;
}

export function convertTopicByLevel(topic: Topic, level: number, options: ConversionOptions): string {
  const { useHeadlinesUntilLevel, useOrderedListsUntilLevel, useUnorderedListsUntilLevel } = options;
  const title = topic.getTitle();

  // headlines come first, as they can not be within lists
  if (level <= useHeadlinesUntilLevel) {
    return renderHeadline(title, level);
  }

  // go on with the base trim right away, once we left fancy list town...
  if (level > Math.max(useOrderedListsUntilLevel, useUnorderedListsUntilLevel)) {
    return renderText(title, level - useHeadlinesUntilLevel);
  }

  // determine which list type to use first; depends on the level and the list responsible
  const useOrderedList =
    // this means in a tie (both shall be used up to the same level), ordered lists win
    useOrderedListsUntilLevel > useUnorderedListsUntilLevel
      ? // use unordered lists first, ordered lists afterwards
        level <= useOrderedListsUntilLevel && level > useUnorderedListsUntilLevel
      : // use ordered lists first, unordered lists afterwards
        level <= useOrderedListsUntilLevel;
  // render the list item as last since all conditions have been checked before
  return renderListItem(title, level - useHeadlinesUntilLevel, useOrderedList);
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
  const inset = ''.padStart((depth - 1) * 4, ' ');
  const bullet = ordered ? '1.' : '*';
  return `${inset}${bullet} ${removeLineBreaks(text)}\n`;
}

/**
 * Render text node
 */
export function renderText(text: string, depth: number): string {
  // TODO implement me
  const inset = ''.padStart((depth - 1) * 4, ' ');
  return `${inset}→ ${removeLineBreaks(text)}\n`;
}

/**
 * Removes line breaks from a given string
 */
export function removeLineBreaks(headline: string): string {
  return headline.replace(/(\r\n|\n|\r)/gm, '');
}
