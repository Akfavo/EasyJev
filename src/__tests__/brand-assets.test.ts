import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // 89 50 4E 47
const ICO_SIGNATURE = Buffer.from([0x00, 0x00, 0x01, 0x00]); // 00 00 01 00

describe('Brand & Icon Assets', () => {
  const rootDir = process.cwd();

  const brandPngFiles = [
    'public/brand/logo-cubes-96.png',
  ];

  const appIconPngFiles = [
    'src/app/icon.png',
    'src/app/apple-icon.png',
  ];

  const allPngFiles = [...brandPngFiles, ...appIconPngFiles];
  const icoFile = 'src/app/favicon.ico';

  describe('Existence and non-emptiness', () => {
    for (const relativePath of [...allPngFiles, icoFile]) {
      it(`file "${relativePath}" exists and is not empty`, () => {
        const fullPath = path.resolve(rootDir, relativePath);
        expect(fs.existsSync(fullPath)).toBe(true);

        const stats = fs.statSync(fullPath);
        expect(stats.size).toBeGreaterThan(0);
      });
    }
  });

  describe('Poids des icônes', () => {
    // L'icône est téléchargée par chaque visiteur : elle doit rester légère.
    for (const relativePath of [...appIconPngFiles, icoFile]) {
      it(`"${relativePath}" pèse moins de 30 Ko`, () => {
        const stats = fs.statSync(path.resolve(rootDir, relativePath));
        expect(stats.size).toBeLessThan(30 * 1024);
      });
    }
  });

  describe('Binary file signatures', () => {
    for (const relativePath of allPngFiles) {
      it(`PNG file "${relativePath}" starts with standard PNG signature (89 50 4E 47)`, () => {
        const fullPath = path.resolve(rootDir, relativePath);
        const buffer = fs.readFileSync(fullPath);

        expect(buffer.length).toBeGreaterThanOrEqual(4);
        expect(buffer.subarray(0, 4).equals(PNG_SIGNATURE)).toBe(true);
      });
    }

    it('favicon.ico starts with standard ICO header (00 00 01 00)', () => {
      const fullPath = path.resolve(rootDir, icoFile);
      const buffer = fs.readFileSync(fullPath);

      expect(buffer.length).toBeGreaterThanOrEqual(4);
      expect(buffer.subarray(0, 4).equals(ICO_SIGNATURE)).toBe(true);
    });
  });
});
