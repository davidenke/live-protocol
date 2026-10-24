import { describe, expect, it } from 'vitest';
import { Workbook } from 'xmind-model';

import {
  convertToHtml,
  convertToMarkdown,
  escapeMarkdown,
  removeLineBreaks,
} from './conversion.utils.js';

interface TopicInput {
  title: string;
  labels?: string[];
  titleUnedited?: boolean;
  children?: TopicInput[];
}

let id = 0;
const toTopicData = ({ children, ...topic }: TopicInput): object => ({
  id: `t${++id}`,
  class: 'topic',
  ...topic,
  ...(children ? { children: { attached: children.map(toTopicData) } } : {}),
});

const mindMap = (root: TopicInput): Workbook =>
  new Workbook([
    { id: 's', class: 'sheet', title: 'Sheet', rootTopic: toTopicData(root) },
  ] as never);

describe('conversion.utils', () => {
  describe('removeLineBreaks', () => {
    it('replaces line breaks by a single space', () => {
      expect(removeLineBreaks('nach Sitzung StuKo IV\n\n-> Wie weiter?')).toBe(
        'nach Sitzung StuKo IV -> Wie weiter?'
      );
    });
  });

  describe('escapeMarkdown', () => {
    it.each`
      input                       | expected
      ${'9. Sitzung (informell)'} | ${'9\\. Sitzung (informell)'}
      ${'1) first'}               | ${'1\\) first'}
      ${'- dash'}                 | ${'\\- dash'}
      ${'+ plus'}                 | ${'\\+ plus'}
      ${'# hash'}                 | ${'\\# hash'}
      ${'Kappa *'}                | ${'Kappa \\*'}
      ${'snake_case'}             | ${'snake\\_case'}
      ${'<b>html</b>'}            | ${'\\<b\\>html\\</b\\>'}
      ${'09.06.2026 | 19:00'}     | ${'09.06.2026 \\| 19:00'}
      ${'Fabian :-)'}             | ${'Fabian :-)'}
    `('escapes "$input"', ({ input, expected }) => {
      expect(escapeMarkdown(input)).toBe(expected);
    });

    it('renders titles literally', async () => {
      const md = convertToMarkdown(
        mindMap({
          title: 'Root',
          children: [{ title: 'Termine', children: [{ title: '9. Sitzung (informell)' }] }],
        })
      );
      const html = await convertToHtml(md);
      expect(html).toContain('9. Sitzung (informell)');
      expect(html).not.toContain('<ol start="9">');
    });
  });

  describe('convertToMarkdown', () => {
    it('omits blank and unedited placeholder topics', () => {
      const md = convertToMarkdown(
        mindMap({
          title: 'Root',
          children: [
            {
              title: 'Agenda',
              children: [
                { title: 'kept' },
                { title: '' },
                { title: 'Unterknoten 3', titleUnedited: true },
              ],
            },
          ],
        })
      );
      expect(md).toBe('# Root\n## Agenda\n1. kept\n');
    });

    it('omits topics labeled to be excluded, including subtopics', () => {
      const md = convertToMarkdown(
        mindMap({
          title: 'Root',
          children: [
            { title: 'Agenda', children: [{ title: 'kept' }] },
            {
              title: 'Backlog',
              labels: ['Nicht im Protokoll'],
              children: [{ title: 'secret' }],
            },
          ],
        })
      );
      expect(md).toBe('# Root\n## Agenda\n1. kept\n');
    });

    it('replaces subtopics of internal topics by a placeholder', () => {
      const md = convertToMarkdown(
        mindMap({
          title: 'Root',
          children: [{ title: 'Internal', labels: ['intern'], children: [{ title: 'secret' }] }],
        })
      );
      expect(md).toBe('# Root\n## Internal\n1. intern besprochen – ohne Protokoll\n');
    });

    it('omits empty headlines, but keeps the root topic', () => {
      const md = convertToMarkdown(
        mindMap({
          title: 'Root',
          children: [
            { title: 'kurze Pause' },
            { title: 'only placeholders', children: [{ title: '' }] },
          ],
        })
      );
      expect(md).toBe('# Root\n');
    });

    it('renders all topics if filtering is disabled', () => {
      const md = convertToMarkdown(
        mindMap({
          title: 'Root',
          children: [
            { title: 'kurze Pause' },
            { title: 'Internal', labels: ['intern'], children: [{ title: 'secret' }] },
            { title: 'Backlog', labels: ['nicht im Protokoll'], children: [{ title: 'idea' }] },
          ],
        }),
        { filterTopics: false }
      );
      expect(md).toBe('# Root\n## kurze Pause\n## Internal\n1. secret\n## Backlog\n1. idea\n');
    });

    it('keeps leaf list items', () => {
      const md = convertToMarkdown(
        mindMap({
          title: 'Root',
          children: [{ title: 'Blitzlichter', children: [{ title: 'Falken' }] }],
        })
      );
      expect(md).toBe('# Root\n## Blitzlichter\n1. Falken\n');
    });
  });
});
