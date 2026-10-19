import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

function loadCssTokens(): Record<string, string> {
  const cssPath = path.resolve(__dirname, '../app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  const tokens: Record<string, string> = {};
  const tokenRegex = /--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8});/g;

  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(cssContent)) !== null) {
    const key = match[1];
    const value = match[2];
    if (key && value) {
      tokens[key] = value;
    }
  }

  return tokens;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0]! + clean[0]!, 16);
    const g = parseInt(clean[1]! + clean[1]!, 16);
    const b = parseInt(clean[2]! + clean[2]!, 16);
    return [r, g, b];
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb: [number, number, number]): number {
  const r = srgbToLinear(rgb[0]);
  const g = srgbToLinear(rgb[1]);
  const b = srgbToLinear(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(color1Hex: string, color2Hex: string): number {
  const l1 = relativeLuminance(hexToRgb(color1Hex));
  const l2 = relativeLuminance(hexToRgb(color2Hex));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function blendHex(fgHex: string, bgHex: string, alpha: number): string {
  const [r1, g1, b1] = hexToRgb(fgHex);
  const [r2, g2, b2] = hexToRgb(bgHex);
  const r = Math.round(r1 * alpha + r2 * (1 - alpha));
  const g = Math.round(g1 * alpha + g2 * (1 - alpha));
  const b = Math.round(b1 * alpha + b2 * (1 - alpha));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

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

describe('Contrastes WCAG — tokens globals.css et composants réels', () => {
  const tokens = loadCssTokens();
  const WHITE = '#FFFFFF';

  it('lit correctement les tokens essentiels depuis globals.css', () => {
    expect(tokens['brand-500']).toBeDefined();
    expect(tokens['brand-600']).toBeDefined();
    expect(tokens['brand-700']).toBeDefined();
    expect(tokens['brand-100']).toBeDefined();
    expect(tokens['ink']).toBeDefined();
    expect(tokens['ink-page']).toBeDefined();
    expect(tokens['muted']).toBeDefined();
    expect(tokens['muted-page']).toBeDefined();
    expect(tokens['line']).toBeDefined();
    expect(tokens['control-border']).toBeDefined();
    expect(tokens['canvas']).toBeDefined();
    expect(tokens['canvas-light']).toBeDefined();
    expect(tokens['canvas-dark']).toBeDefined();
    expect(tokens['surface']).toBeDefined();
    expect(tokens['surface-2']).toBeDefined();
    expect(tokens['error']).toBeDefined();
    expect(tokens['warning-bg']).toBeDefined();
  });

  describe('Texte normal (seuil WCAG AA >= 4.5:1)', () => {
    it('texte principal --ink sur surfaces (surface, surface-2, canvas) et --ink-page sur le dégradé du canvas (base, clair, foncé)', () => {
      const onSurface = getContrastRatio(tokens['ink']!, tokens['surface']!);
      const onSurface2 = getContrastRatio(tokens['ink']!, tokens['surface-2']!);
      const onCanvas = getContrastRatio(tokens['ink']!, tokens['canvas']!);
      const onCanvasBase = getContrastRatio(tokens['ink-page']!, tokens['canvas']!);
      const onCanvasLight = getContrastRatio(tokens['ink-page']!, tokens['canvas-light']!);
      const onCanvasDark = getContrastRatio(tokens['ink-page']!, tokens['canvas-dark']!);

      expect(onSurface).toBeGreaterThanOrEqual(4.5);
      expect(onSurface2).toBeGreaterThanOrEqual(4.5);
      expect(onCanvas).toBeGreaterThanOrEqual(4.5);
      expect(onCanvasBase).toBeGreaterThanOrEqual(4.5);
      expect(onCanvasLight).toBeGreaterThanOrEqual(4.5);
      expect(onCanvasDark).toBeGreaterThanOrEqual(4.5);
    });

    it('texte secondaire --muted sur surfaces (surface, surface-2, brand-100) et --muted-page sur le dégradé du canvas (base, clair, foncé)', () => {
      const onSurface = getContrastRatio(tokens['muted']!, tokens['surface']!);
      const onSurface2 = getContrastRatio(tokens['muted']!, tokens['surface-2']!);
      const onBrand100 = getContrastRatio(tokens['muted']!, tokens['brand-100']!);
      const onCanvasBase = getContrastRatio(tokens['muted-page']!, tokens['canvas']!);
      const onCanvasLight = getContrastRatio(tokens['muted-page']!, tokens['canvas-light']!);
      const onCanvasDark = getContrastRatio(tokens['muted-page']!, tokens['canvas-dark']!);

      expect(onSurface).toBeGreaterThanOrEqual(4.5);
      expect(onSurface2).toBeGreaterThanOrEqual(4.5);
      expect(onBrand100).toBeGreaterThanOrEqual(4.5);
      expect(onCanvasBase).toBeGreaterThanOrEqual(4.5);
      expect(onCanvasLight).toBeGreaterThanOrEqual(4.5);
      expect(onCanvasDark).toBeGreaterThanOrEqual(4.5);
    });

    it('exemples de l état vide des questions sur fond blanc (surface ou WHITE) avec texte >= 4.5:1', () => {
      const onWhite = getContrastRatio(tokens['ink']!, WHITE);
      const onSurface = getContrastRatio(tokens['ink']!, tokens['surface']!);
      expect(onWhite).toBeGreaterThanOrEqual(4.5);
      expect(onSurface).toBeGreaterThanOrEqual(4.5);
    });

    it('texte blanc sur fonds sombres d action (--brand-600, --brand-700, --ink, --line)', () => {
      const onBrand600 = getContrastRatio(WHITE, tokens['brand-600']!);
      const onBrand700 = getContrastRatio(WHITE, tokens['brand-700']!);
      const onInk = getContrastRatio(WHITE, tokens['ink']!);
      const onLine = getContrastRatio(WHITE, tokens['line']!);
      // Bouton « Réinitialiser » de la barre d'action (rouge de marque) : texte blanc, repos et survol
      const onReset = getContrastRatio(WHITE, tokens['reset']!);
      const onResetHover = getContrastRatio(WHITE, tokens['reset-hover']!);
      // Bouton discret « Voir le résultat » : texte blanc sur fond de la barre (--line / bg-line/92) et survol (bg-white/10)
      const barBg = blendHex(tokens['line']!, tokens['canvas-light']!, 0.92);
      const onBarBg = getContrastRatio(WHITE, barBg);
      const onBarHover = getContrastRatio(WHITE, blendHex(WHITE, barBg, 0.1));

      expect(onBrand600).toBeGreaterThanOrEqual(4.5);
      expect(onBrand700).toBeGreaterThanOrEqual(4.5);
      expect(onInk).toBeGreaterThanOrEqual(4.5);
      expect(onLine).toBeGreaterThanOrEqual(4.5);
      expect(onReset).toBeGreaterThanOrEqual(4.5);
      expect(onResetHover).toBeGreaterThanOrEqual(4.5);
      expect(onBarBg).toBeGreaterThanOrEqual(4.5);
      expect(onBarHover).toBeGreaterThanOrEqual(4.5);
    });

    it('liens interactifs et accents --brand-600 et --brand-700 sur surfaces de travail (surface, surface-2, brand-100)', () => {
      const onSurface = getContrastRatio(tokens['brand-600']!, tokens['surface']!);
      const onSurface2 = getContrastRatio(tokens['brand-600']!, tokens['surface-2']!);
      const onBrand100 = getContrastRatio(tokens['brand-600']!, tokens['brand-100']!);
      const brand700OnSurface2 = getContrastRatio(tokens['brand-700']!, tokens['surface-2']!);

      expect(onSurface).toBeGreaterThanOrEqual(4.5);
      expect(onSurface2).toBeGreaterThanOrEqual(4.5);
      expect(onBrand100).toBeGreaterThanOrEqual(4.5);
      expect(brand700OnSurface2).toBeGreaterThanOrEqual(4.5);
    });

    it('erreur --error sur surface et sur fond d erreur teinté', () => {
      const onSurface = getContrastRatio(tokens['error']!, tokens['surface']!);
      expect(onSurface).toBeGreaterThanOrEqual(4.5);

      // bg-error/10 sur fond surface
      const tintedErrorBg = blendHex(tokens['error']!, tokens['surface']!, 0.1);
      const onTinted = getContrastRatio(tokens['error']!, tintedErrorBg);
      expect(onTinted).toBeGreaterThanOrEqual(4.5);

      // Texte --ink sur fond d erreur teinté (utilisé dans GenerationStatus)
      const textInkOnTinted = getContrastRatio(tokens['ink']!, tintedErrorBg);
      expect(textInkOnTinted).toBeGreaterThanOrEqual(4.5);
    });

    it('texte --ink sur --warning-bg', () => {
      const ratio = getContrastRatio(tokens['ink']!, tokens['warning-bg']!);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('pastilles de badge sur leur fond respectif', () => {
      // Badge template : text-brand-700 sur bg-brand-100
      const brandBadgeRatio = getContrastRatio(tokens['brand-700']!, tokens['brand-100']!);
      expect(brandBadgeRatio).toBeGreaterThanOrEqual(4.5);

      // Badge custom : text-ink sur bg-surface-2
      const neutralBadgeRatio = getContrastRatio(tokens['ink']!, tokens['surface-2']!);
      expect(neutralBadgeRatio).toBeGreaterThanOrEqual(4.5);

      // Bouton citation : text-ink sur bg-brand-100
      const citationBadgeRatio = getContrastRatio(tokens['ink']!, tokens['brand-100']!);
      expect(citationBadgeRatio).toBeGreaterThanOrEqual(4.5);

      // Ligne de question sélectionnée (Lot 6.5) : text-ink et text-muted sur fond bg-brand-500/10
      const selectedRowBg = blendHex(tokens['brand-500']!, tokens['surface']!, 0.1);
      const selectedInkRatio = getContrastRatio(tokens['ink']!, selectedRowBg);
      expect(selectedInkRatio).toBeGreaterThanOrEqual(4.5);
      const selectedMutedRatio = getContrastRatio(tokens['muted']!, selectedRowBg);
      expect(selectedMutedRatio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Composants d interface et grand texte (seuil WCAG AA >= 3:1)', () => {
    it('bordures de champs --control-border sur --surface et --canvas', () => {
      const onSurface = getContrastRatio(tokens['control-border']!, tokens['surface']!);
      const onCanvas = getContrastRatio(tokens['control-border']!, tokens['canvas']!);

      expect(onSurface).toBeGreaterThanOrEqual(3.0);
      expect(onCanvas).toBeGreaterThanOrEqual(3.0);
    });

    it('bouton action et texte blanc sur accent --brand-500 et --brand-600', () => {
      const whiteOnBrand500 = getContrastRatio(WHITE, tokens['brand-500']!);
      const whiteOnBrand600 = getContrastRatio(WHITE, tokens['brand-600']!);

      expect(whiteOnBrand500).toBeGreaterThanOrEqual(4.5);
      expect(whiteOnBrand600).toBeGreaterThanOrEqual(4.5);
    });

    it('anneau de focus --brand-600 sur les surfaces de travail', () => {
      const onSurface = getContrastRatio(tokens['brand-600']!, tokens['surface']!);
      const onSurface2 = getContrastRatio(tokens['brand-600']!, tokens['surface-2']!);

      expect(onSurface).toBeGreaterThanOrEqual(3.0);
      expect(onSurface2).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe('Garde-fous des composants (src/components/**/*.tsx)', () => {
    it('aucune chaîne className ne contient à la fois bg-canvas et text-muted ou text-brand-', () => {
      const componentsDir = path.resolve(__dirname, '../components');
      const files = getTsxFilesRecursively(componentsDir);
      expect(files.length).toBeGreaterThan(0);

      const classNameRegex = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|{`([^`]*)`}|{'([^']*)'}|{"([^"]*)"})/gs;
      const violations: string[] = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        let match: RegExpExecArray | null;
        while ((match = classNameRegex.exec(content)) !== null) {
          const classStr = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? '';
          if (classStr.includes('bg-canvas') && (classStr.includes('text-muted') || classStr.includes('text-brand-'))) {
            violations.push(`${path.relative(componentsDir, file)}: "${classStr.trim()}"`);
          }
        }
      }

      expect(violations).toEqual([]);
    });

    it('toutes les classes brand-<n> utilisées dans src/components/** correspondent à des tokens définis dans globals.css', () => {
      const componentsDir = path.resolve(__dirname, '../components');
      const files = getTsxFilesRecursively(componentsDir);
      expect(files.length).toBeGreaterThan(0);

      const classNameRegex = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|{`([^`]*)`}|{'([^']*)'}|{"([^"]*)"})/gs;
      const brandClassRegex = /\b(?:[a-zA-Z0-9:-]+:)?(?:[a-zA-Z]+-)?brand-(\d+)(?:\/[a-zA-Z0-9.]+)?\b/g;
      const violations: string[] = [];
      let totalBrandMatches = 0;

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        let match: RegExpExecArray | null;
        while ((match = classNameRegex.exec(content)) !== null) {
          const classStr = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? '';
          let brandMatch: RegExpExecArray | null;
          while ((brandMatch = brandClassRegex.exec(classStr)) !== null) {
            totalBrandMatches++;
            const tokenNum = brandMatch[1];
            const tokenKey = `brand-${tokenNum}`;
            if (!tokens[tokenKey]) {
              violations.push(
                `${path.relative(componentsDir, file)}: classe inconnue "${brandMatch[0]}" (token "${tokenKey}" absent de globals.css)`
              );
            }
          }
        }
      }

      expect(totalBrandMatches).toBeGreaterThan(0);
      expect(violations).toEqual([]);
    });
  });
});

