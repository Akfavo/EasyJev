import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getCodeFilesRecursively(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getCodeFilesRecursively(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  return files;
}

export function findExternalUrls(content: string): string[] {
  // Matches http:// or https:// (ignoring XML namespaces like xmlns="http://www.w3.org/2000/svg")
  const urlRegex = /https?:\/\/[^\s"'`<>]+/g;
  const matches = content.match(urlRegex) ?? [];
  return matches.filter(url => !url.startsWith('http://www.w3.org/2000/svg'));
}

describe('Garde-fou de sécurité démo : aucune URL externe', () => {
  const demoComponentsDir = path.resolve(__dirname, '../components/demo');
  const demoModulesDir = path.resolve(__dirname, '../modules/demo');

  it('scanne bien les fichiers des répertoires demo', () => {
    const componentFiles = getCodeFilesRecursively(demoComponentsDir);
    const moduleFiles = getCodeFilesRecursively(demoModulesDir);

    expect(componentFiles.length).toBeGreaterThanOrEqual(4);
    expect(moduleFiles.length).toBeGreaterThanOrEqual(2);
  });

  it('aucun fichier de src/components/demo ou src/modules/demo ne contient d’URL http(s) externe', () => {
    const allFiles = [
      ...getCodeFilesRecursively(demoComponentsDir),
      ...getCodeFilesRecursively(demoModulesDir),
    ];

    const violations: string[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const found = findExternalUrls(content);
      if (found.length > 0) {
        violations.push(`${path.basename(file)}: [${found.join(', ')}]`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('détecte correctement les URL http:// et https:// externes hors svg xmlns', () => {
    expect(findExternalUrls('const url = "https://evil.com/api";')).toEqual(['https://evil.com/api']);
    expect(findExternalUrls('const url = "http://example.com";')).toEqual(['http://example.com']);
    expect(findExternalUrls('xmlns="http://www.w3.org/2000/svg"')).toEqual([]);
  });
});
