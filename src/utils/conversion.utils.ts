import HTMLtoDOCX from '@turbodocx/html-to-docx';
import { parse } from 'marked';
import type { Sheet, Topic, Workbook } from 'xmind-model';

/**
 * Re-exported types from xmind-model
 */
export type MindMap = Workbook;

export interface ConversionOptions {
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

  /**
   * Topics carrying one of these labels (case-insensitive) are omitted
   * from the protocol, including all of their subtopics.
   * @default ['nicht im protokoll', 'not in protocol']
   */
  excludeLabels: string[];

  /**
   * Topics carrying one of these labels (case-insensitive) keep their own
   * title, but all of their subtopics are replaced by the internal placeholder.
   * @default ['intern', 'internal']
   */
  internalLabels: string[];

  /**
   * Text rendered in place of the subtopics of internal topics.
   * @default 'intern besprochen – ohne Protokoll'
   */
  internalPlaceholder: string;

  /**
   * Filter topics not meant to be part of the protocol:
   * placeholder topics, empty headlines (except the root topic),
   * as well as topics with exclude or internal labels.
   * @default true
   */
  filterTopics: boolean;
}

export function conversionOptionsWithDefaults(
  options: Partial<ConversionOptions> = {}
): ConversionOptions {
  return {
    useUntilLevel: Infinity,
    useHeadlinesUntilLevel: 2,
    useOrderedListsUntilLevel: 4,
    useUnorderedListsUntilLevel: Infinity,
    excludeLabels: ['nicht im protokoll', 'not in protocol'],
    internalLabels: ['intern', 'internal'],
    internalPlaceholder: 'intern besprochen – ohne Protokoll',
    filterTopics: true,
    ...options,
  };
}

/**
 * Convert a given set of sheets into markdown
 */
export function convertToMarkdown(mindMap: MindMap, options?: Partial<ConversionOptions>): string {
  const resolved = conversionOptionsWithDefaults(options);
  return mindMap
    .getSheets()
    .map(sheet => convertSheetToMarkdown(sheet, resolved))
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
    // a4 portrait in twip (defaults to us letter otherwise)
    pageSize: { width: 11906, height: 16838 },
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
 * Normalizes a label for comparison
 */
const normalizeLabel = (label: string): string => label.trim().toLowerCase();

/**
 * Checks if a topic carries at least one of the given labels (case-insensitive)
 */
export function hasLabel(topic: Topic, labels: string[]): boolean {
  const wanted = labels.map(normalizeLabel);
  return (topic.getLabels() ?? []).some(label => wanted.includes(normalizeLabel(label)));
}

/**
 * Placeholder topics are either blank or still carry the default title
 * given by XMind (e.g. "Subtopic 3" or "Unterknoten 3").
 */
export function isPlaceholderTopic(topic: Topic): boolean {
  const { titleUnedited } = topic.toJSON() as { titleUnedited?: boolean };
  return titleUnedited === true || (topic.getTitle() ?? '').trim() === '';
}

/**
 * Determines whether a topic (and all of its subtopics) shall be rendered at all
 */
export function isVisibleTopic(topic: Topic, options: ConversionOptions): boolean {
  if (!options.filterTopics) {
    return true;
  }
  return !isPlaceholderTopic(topic) && !hasLabel(topic, options.excludeLabels);
}

/**
 * Convert a single given topic into markdown.
 */
export function convertTopicToMarkdown(
  topic: Topic,
  level: number,
  options: ConversionOptions
): string {
  const { useUntilLevel, useHeadlinesUntilLevel, filterTopics } = options;
  const text = convertTopicByLevel(topic, level, options);
  if (level >= useUntilLevel) {
    return text;
  }

  // internal topics keep their title, but hide all details
  if (filterTopics && hasLabel(topic, options.internalLabels)) {
    return `${text}${convertTitleByLevel(options.internalPlaceholder, level + 1, options)}`;
  }

  const attachedTopics = topic
    .getChildrenByType(['attached'])
    .filter(child => isVisibleTopic(child, options))
    .map(child => convertTopicToMarkdown(child, level + 1, options))
    .join('');

  // omit headlines without contents (but always keep the root topic)
  const isHeadline = level <= useHeadlinesUntilLevel;
  if (filterTopics && isHeadline && level > 1 && attachedTopics === '') {
    return '';
  }

  return `${text}${attachedTopics}`;
}

export function convertTopicByLevel(
  topic: Topic,
  level: number,
  options: ConversionOptions
): string {
  return convertTitleByLevel(topic.getTitle() ?? '', level, options);
}

export function convertTitleByLevel(
  title: string,
  level: number,
  options: ConversionOptions
): string {
  const { useHeadlinesUntilLevel, useOrderedListsUntilLevel, useUnorderedListsUntilLevel } =
    options;

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
  return `${hN} ${toInlineMarkdown(text)}\n`;
}

/**
 * Render a list item at a given depth
 */
export function renderListItem(text: string, depth: number, ordered = false): string {
  const inset = ''.padStart((depth - 1) * 4, ' ');
  const bullet = ordered ? '1.' : '*';
  return `${inset}${bullet} ${toInlineMarkdown(text)}\n`;
}

/**
 * Render text node
 */
export function renderText(text: string, depth: number): string {
  // TODO implement me
  const inset = ''.padStart((depth - 1) * 4, ' ');
  return `${inset}→ ${toInlineMarkdown(text)}\n`;
}

/**
 * Replaces line breaks (and surrounding whitespace) within a given string by a single space
 */
export function removeLineBreaks(text: string): string {
  return text.replace(/\s*(\r\n|\n|\r)+\s*/g, ' ').trim();
}

/**
 * Escapes characters which would otherwise be interpreted as markdown syntax,
 * so that topic titles are always rendered literally.
 */
export function escapeMarkdown(text: string): string {
  return (
    text
      // inline syntax: emphasis, code, links, html, strikethrough, tables
      .replace(/[\\`*_[\]<>~|]/g, '\\$&')
      // block syntax at the start: ordered lists (e.g. "9. Sitzung"), bullets, headlines
      .replace(/^(\d+)([.)])(?=\s|$)/, '$1\\$2')
      .replace(/^([-+#=])/, '\\$1')
  );
}

/**
 * Prepares a topic title to be used as inline markdown
 */
export function toInlineMarkdown(text: string): string {
  return escapeMarkdown(removeLineBreaks(text));
}
