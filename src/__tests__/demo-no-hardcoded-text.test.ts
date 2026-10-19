import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

function getFilesRecursively(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Strips comments from code:
 * - Block comments /* ... * /
 * - Line comments // ...
 */
export function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * Set of allowed fictive field names and punctuation/symbols
 */
const ALLOWED_TOKENS = new Set([
  'game',
  'publisher',
  'total_reviews',
  'categorie',
  'is_popular',
  'game_genre',
]);

const ACCENT_REGEX = /[éèêëàâäôöùûüîïçÉÈÊËÀÂÄÔÖÙÛÜÎÏÇ]/;

const COMMON_FRENCH_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd',
  'en', 'dans', 'sur', 'sous', 'par', 'pour', 'avec', 'sans',
  'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
  'qui', 'que', 'quoi', 'dont', 'ce', 'cet', 'cette', 'ces',
  'mon', 'ton', 'son', 'notre', 'votre', 'leur',
  'mes', 'tes', 'ses', 'nos', 'vos', 'leurs',
  'est', 'sont', 'ete', 'etre', 'avoir', 'fait', 'faire',
  'autre', 'autres', 'champ', 'champs', 'etape', 'etapes',
  'donnee', 'donnees', 'reduire', 'generation', 'panneau',
  'reponse', 'reponses', 'jeu', 'jeux', 'succes', 'confirme',
  'suivant', 'precedent', 'elements', 'element', 'items', 'item',
]);

export interface TextViolation {
  file: string;
  line: number;
  snippet: string;
  reason: string;
}

/**
 * Extracts visible JSX text nodes and user-facing JSX attributes (aria-label, placeholder, title, alt).
 */
export function findHardcodedTextViolations(filePath: string, content: string): TextViolation[] {
  const violations: TextViolation[] = [];
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  function checkText(rawText: string, node: ts.Node, context: string) {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    // Check for accents
    if (ACCENT_REGEX.test(trimmed)) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      violations.push({
        file: path.basename(filePath),
        line: line + 1,
        snippet: trimmed,
        reason: `Lettre accentuée trouvée dans ${context} : "${trimmed}"`,
      });
      return;
    }

    // Split into words, ignoring allowed fictive fields and symbols
    const words = trimmed
      .toLowerCase()
      .split(/[\s,.;:!?()[\]{}"'`<>=/\\~*|+-]+/)
      .filter(w => w.length > 0 && !/^\d+$/.test(w) && !/^s$/.test(w)); // ignore numbers and unit "s" (seconds)

    for (const word of words) {
      if (ALLOWED_TOKENS.has(word)) continue;
      if (COMMON_FRENCH_WORDS.has(word)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push({
          file: path.basename(filePath),
          line: line + 1,
          snippet: trimmed,
          reason: `Mot français courant en dur ("${word}") dans ${context} : "${trimmed}"`,
        });
        break;
      }
    }
  }

  function visit(node: ts.Node) {
    // 1. Direct JSX text node
    if (ts.isJsxText(node)) {
      checkText(node.getText(sourceFile), node, 'texte JSX');
    }

    // 2. User-facing attributes like aria-label, placeholder, title, alt
    if (ts.isJsxAttribute(node)) {
      const attrName = node.name.getText(sourceFile);
      if (['aria-label', 'placeholder', 'title', 'alt', 'aria-description'].includes(attrName)) {
        if (node.initializer && ts.isStringLiteral(node.initializer)) {
          checkText(node.initializer.text, node.initializer, `attribut ${attrName}`);
        }
      }
    }

    // 3. String literal passed directly as JSX child expression: <span>{'some text'}</span>
    if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression)) {
      checkText(node.expression.text, node.expression, 'expression JSX');
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

describe('Garde-fou : aucun texte en dur (accents ou mots français) dans src/components/demo/', () => {
  const demoComponentsDir = path.resolve(__dirname, '../components/demo');
  const demoFiles = getFilesRecursively(demoComponentsDir);

  it('scanne bien les fichiers de composants demo', () => {
    expect(demoFiles.length).toBeGreaterThanOrEqual(4);
  });

  it('aucun fichier dans src/components/demo/ ne contient de lettre accentuée hors commentaires', () => {
    const accentViolations: string[] = [];

    for (const file of demoFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const cleanContent = stripComments(content);
      const lines = cleanContent.split('\n');

      lines.forEach((line, index) => {
        if (ACCENT_REGEX.test(line)) {
          accentViolations.push(`${path.basename(file)}:${index + 1}: ${line.trim()}`);
        }
      });
    }

    expect(accentViolations).toEqual([]);
  });

  it('aucun texte JSX visible en dur (accents ou mots français) n’est présent dans les composants de la démo', () => {
    const allViolations: TextViolation[] = [];

    for (const file of demoFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const fileViolations = findHardcodedTextViolations(file, content);
      allViolations.push(...fileViolations);
    }

    expect(allViolations).toEqual([]);
  });

  it('les champs fictifs autorisés (game, publisher, total_reviews, categorie) ne déclenchent pas d’erreur', () => {
    const mockCode = `
      export function Test() {
        return (
          <div>
            <span>game</span>
            <span>publisher</span>
            <span>total_reviews</span>
            <span>categorie</span>
          </div>
        );
      }
    `;
    const violations = findHardcodedTextViolations('test.tsx', mockCode);
    expect(violations).toEqual([]);
  });

  it('détecte correctement un mot français ou un accent dans du JSX en dur', () => {
    const badCodeAccented = `
      export function Test() {
        return <span>Génération...</span>;
      }
    `;
    const violationsAccented = findHardcodedTextViolations('test.tsx', badCodeAccented);
    expect(violationsAccented.length).toBeGreaterThan(0);
    expect(violationsAccented[0]!.reason).toContain('Lettre accentuée');

    const badCodeFrenchWord = `
      export function Test() {
        return <span>autres champs</span>;
      }
    `;
    const violationsFrench = findHardcodedTextViolations('test.tsx', badCodeFrenchWord);
    expect(violationsFrench.length).toBeGreaterThan(0);
    expect(violationsFrench[0]!.reason).toContain('Mot français courant');

    const badCodeAria = `
      export function Test() {
        return <nav aria-label="Étapes de la démo" />;
      }
    `;
    const violationsAria = findHardcodedTextViolations('test.tsx', badCodeAria);
    expect(violationsAria.length).toBeGreaterThan(0);
  });
});
