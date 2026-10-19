import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

interface VercelHasCondition {
  type: string;
  key?: string;
  value?: string;
}

interface VercelRedirect {
  source: string;
  has?: VercelHasCondition[];
  destination: string;
  permanent?: boolean;
}

interface VercelHeaderItem {
  key: string;
  value: string;
}

interface VercelHeaderConfig {
  source: string;
  headers: VercelHeaderItem[];
}

interface VercelConfig {
  headers?: VercelHeaderConfig[];
  redirects?: VercelRedirect[];
}

describe('Configuration vercel.json — Redirections et règle Accept-Language', () => {
  const vercelJsonPath = path.resolve(__dirname, '../../vercel.json');

  it('le fichier vercel.json existe et est un JSON valide', () => {
    expect(fs.existsSync(vercelJsonPath)).toBe(true);
    const raw = fs.readFileSync(vercelJsonPath, 'utf-8');
    const parsed = JSON.parse(raw) as VercelConfig;
    expect(parsed).toBeTypeOf('object');
  });

  it('retrouve la règle de redirection linguistique basée sur Accept-Language', () => {
    const raw = fs.readFileSync(vercelJsonPath, 'utf-8');
    const parsed = JSON.parse(raw) as VercelConfig;

    expect(Array.isArray(parsed.redirects)).toBe(true);

    const langRule = parsed.redirects?.find(r =>
      r.has?.some(
        h =>
          h.type === 'header' &&
          h.key?.toLowerCase() === 'accept-language'
      )
    );

    expect(langRule).toBeDefined();
    expect(langRule?.destination).toBe('/fr');
    expect(langRule?.permanent).toBe(false);

    const headerCondition = langRule?.has?.find(
      h =>
        h.type === 'header' &&
        h.key?.toLowerCase() === 'accept-language'
    );
    expect(headerCondition).toBeDefined();
    expect(headerCondition?.value).toBe('^fr');
  });

  it('la valeur de la règle compile comme une RegExp JavaScript sans drapeau', () => {
    const raw = fs.readFileSync(vercelJsonPath, 'utf-8');
    const parsed = JSON.parse(raw) as VercelConfig;

    const langRule = parsed.redirects?.find(r =>
      r.has?.some(
        h =>
          h.type === 'header' &&
          h.key?.toLowerCase() === 'accept-language'
      )
    );

    const pattern = langRule?.has?.find(
      h =>
        h.type === 'header' &&
        h.key?.toLowerCase() === 'accept-language'
    )?.value;

    expect(pattern).toBeDefined();
    expect(pattern).not.toContain('(?i)'); // Aucun drapeau en ligne non garanti

    // Compilation en RegExp sans drapeaux
    const regex = new RegExp(pattern as string);
    expect(regex.flags).toBe('');

    // Correspondances requises par la spécification du lot
    expect(regex.test('fr-FR,fr;q=0.9,en;q=0.8')).toBe(true);
    expect(regex.test('fr')).toBe(true);
    expect(regex.test('fr-CA,fr;q=0.8')).toBe(true);

    // Non-correspondances requises par la spécification du lot
    expect(regex.test('en-US,en;q=0.9,fr;q=0.8')).toBe(false);
    expect(regex.test('en')).toBe(false);
    expect(regex.test('de-DE,de;q=0.9')).toBe(false);
  });

  it('conserve les en-têtes Content-Security-Policy inchangés', () => {
    const raw = fs.readFileSync(vercelJsonPath, 'utf-8');
    const parsed = JSON.parse(raw) as VercelConfig;

    const rootHeaders = parsed.headers?.find(h => h.source === '/(.*)');
    expect(rootHeaders).toBeDefined();

    const cspHeader = rootHeaders?.headers?.find(
      h => h.key === 'Content-Security-Policy'
    );
    expect(cspHeader).toBeDefined();
    expect(cspHeader?.value).toBe(
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://api.anthropic.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    );
  });

  it('définit les trois en-têtes de sécurité avec exactement les valeurs requises', () => {
    const raw = fs.readFileSync(vercelJsonPath, 'utf-8');
    const parsed = JSON.parse(raw) as VercelConfig;

    const rootHeaders = parsed.headers?.find(h => h.source === '/(.*)');
    expect(rootHeaders).toBeDefined();

    const xContentType = rootHeaders?.headers?.find(
      h => h.key === 'X-Content-Type-Options'
    );
    expect(xContentType).toBeDefined();
    expect(xContentType?.value).toBe('nosniff');

    const referrerPolicy = rootHeaders?.headers?.find(
      h => h.key === 'Referrer-Policy'
    );
    expect(referrerPolicy).toBeDefined();
    expect(referrerPolicy?.value).toBe('no-referrer');

    const permissionsPolicy = rootHeaders?.headers?.find(
      h => h.key === 'Permissions-Policy'
    );
    expect(permissionsPolicy).toBeDefined();
    expect(permissionsPolicy?.value).toBe(
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
    );
  });

  it('Permissions-Policy ne contient ni clipboard ni fullscreen afin de préserver le presse-papiers', () => {
    const raw = fs.readFileSync(vercelJsonPath, 'utf-8');
    const parsed = JSON.parse(raw) as VercelConfig;

    const rootHeaders = parsed.headers?.find(h => h.source === '/(.*)');
    const permissionsPolicy = rootHeaders?.headers?.find(
      h => h.key === 'Permissions-Policy'
    );

    expect(permissionsPolicy).toBeDefined();
    expect(permissionsPolicy?.value.toLowerCase()).not.toContain('clipboard');
    expect(permissionsPolicy?.value.toLowerCase()).not.toContain('fullscreen');
  });
});

