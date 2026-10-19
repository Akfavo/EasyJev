import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getTsxFilesRecursively(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getTsxFilesRecursively(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

interface DialogTag {
  tagContent: string;
  className: string | null;
}

export function extractDialogTags(content: string): DialogTag[] {
  const results: DialogTag[] = [];
  const dialogRegex = /<dialog\b/g;
  let match: RegExpExecArray | null;

  while ((match = dialogRegex.exec(content)) !== null) {
    const startIndex = match.index;
    let i = startIndex + match[0].length;
    let braceDepth = 0;
    let inString: string | null = null;
    let tagContent = '';

    while (i < content.length) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';

      if (inString) {
        if (char === inString && prevChar !== '\\') {
          inString = null;
        }
      } else {
        if (char === '"' || char === "'" || char === '`') {
          inString = char;
        } else if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
        } else if (char === '>' && braceDepth === 0) {
          tagContent = content.slice(startIndex, i + 1);
          break;
        }
      }
      i++;
    }

    if (tagContent) {
      const classNameMatch = tagContent.match(
        /className\s*=\s*(?:"([^"]*)"|'([^']*)'|{`([^`]*)`}|{'([^']*)'}|{"([^"]*)"})/s
      );
      const className = classNameMatch
        ? (classNameMatch[1] ?? classNameMatch[2] ?? classNameMatch[3] ?? classNameMatch[4] ?? classNameMatch[5] ?? null)
        : null;

      results.push({ tagContent, className });
    }
  }

  return results;
}

const DISALLOWED_DISPLAY_UTILITIES = new Set([
  'flex',
  'inline-flex',
  'grid',
  'block',
  'inline-block',
  'contents',
]);

export function findDialogDisplayViolations(className: string): string[] {
  const tokens = className.split(/\s+/).filter(Boolean);
  const violations: string[] = [];

  for (const token of tokens) {
    if (token.startsWith('open:')) {
      continue;
    }
    const parts = token.split(':');
    const utility = parts[parts.length - 1];
    if (utility && DISALLOWED_DISPLAY_UTILITIES.has(utility)) {
      violations.push(token);
    }
  }

  return violations;
}

describe('Garde-fou des classes sur la balise dialog (src/components/**/*.tsx)', () => {
  it('trouve au moins 4 balises <dialog> dans src/components', () => {
    const componentsDir = path.resolve(__dirname, '../components');
    const files = getTsxFilesRecursively(componentsDir);
    expect(files.length).toBeGreaterThan(0);

    let totalDialogs = 0;
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const dialogs = extractDialogTags(content);
      totalDialogs += dialogs.length;
    }

    expect(totalDialogs).toBeGreaterThanOrEqual(4);
  });

  it('aucune balise <dialog> ne contient d utilitaire d affichage sans préfixe open:', () => {
    const componentsDir = path.resolve(__dirname, '../components');
    const files = getTsxFilesRecursively(componentsDir);
    const violations: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const dialogs = extractDialogTags(content);

      for (const dialog of dialogs) {
        if (!dialog.className) continue;
        const badTokens = findDialogDisplayViolations(dialog.className);
        if (badTokens.length > 0) {
          violations.push(
            `${path.relative(componentsDir, file)}: classe(s) interdite(s) [${badTokens.join(', ')}] sur <dialog>`
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('détecte correctement les classes interdites et autorise le préfixe open:', () => {
    expect(findDialogDisplayViolations('p-4 rounded-win')).toEqual([]);
    expect(findDialogDisplayViolations('open:flex open:flex-col')).toEqual([]);
    expect(findDialogDisplayViolations('open:grid open:block')).toEqual([]);
    expect(findDialogDisplayViolations('open:inline-flex')).toEqual([]);
    expect(findDialogDisplayViolations('flex flex-col')).toEqual(['flex']);
    expect(findDialogDisplayViolations('inline-flex items-center')).toEqual(['inline-flex']);
    expect(findDialogDisplayViolations('grid grid-cols-2')).toEqual(['grid']);
    expect(findDialogDisplayViolations('block w-full')).toEqual(['block']);
    expect(findDialogDisplayViolations('inline-block text-sm')).toEqual(['inline-block']);
    expect(findDialogDisplayViolations('contents')).toEqual(['contents']);
    expect(findDialogDisplayViolations('sm:flex')).toEqual(['sm:flex']);
  });
});
