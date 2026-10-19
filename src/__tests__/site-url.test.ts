import { describe, it, expect } from 'vitest';
import { validateSiteUrl } from '@/modules/i18n/site-url';

describe('Module i18n — validateSiteUrl (NEXT_PUBLIC_SITE_URL)', () => {
  describe('En environnement de production (VERCEL_ENV=production)', () => {
    const env = 'production';

    it('rejette une variable absente ou indéfinie', () => {
      const res = validateSiteUrl(undefined, env);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('obligatoire en production');
    });

    it('rejette une chaîne vide ou composée uniquement d’espaces', () => {
      const res1 = validateSiteUrl('', env);
      expect(res1.isValid).toBe(false);

      const res2 = validateSiteUrl('   ', env);
      expect(res2.isValid).toBe(false);
    });

    it('rejette une URL non https://', () => {
      const res = validateSiteUrl('http://easyjev.com', env);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('https://');
    });

    it('rejette une URL se terminant par une barre oblique finale (/)', () => {
      const res = validateSiteUrl('https://easyjev.com/', env);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('barre oblique finale');
    });

    it('rejette une chaîne qui ne constitue pas une URL valide', () => {
      const res = validateSiteUrl('https://invalid domain with spaces', env);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('URL valide');
    });

    it('valide une URL HTTPS conforme sans slash final', () => {
      const res = validateSiteUrl('https://easyjev.com', env);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
      expect(res.normalizedUrl).toBe('https://easyjev.com');
    });

    it('valide un sous-domaine HTTPS conforme', () => {
      const res = validateSiteUrl('https://app.easyjev.vercel.app', env);
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe('https://app.easyjev.vercel.app');
    });
  });

  describe('Hors production (développement, prévisualisation, test)', () => {
    it('accepte une variable indéfinie sans erreur', () => {
      const res = validateSiteUrl(undefined, 'development');
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe('');
    });

    it('accepte une chaîne vide sans erreur', () => {
      const res = validateSiteUrl('', 'preview');
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe('');
    });

    it('accepte une URL http de développement local et nettoie le slash final', () => {
      const res = validateSiteUrl('http://localhost:3000/', 'development');
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe('http://localhost:3000');
    });

    it('fonctionne également si env n’est pas spécifié', () => {
      const res = validateSiteUrl('http://localhost:3000');
      expect(res.isValid).toBe(true);
      expect(res.normalizedUrl).toBe('http://localhost:3000');
    });
  });
});
