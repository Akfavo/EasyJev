/**
 * Validation et normalisation de l'URL du site pour les balises canonical et hreflang.
 * Obligatoire et strictement validée en environnement de production (Vercel).
 */

export interface SiteUrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

/**
 * Valide l'URL du site en fonction de l'environnement d'exécution.
 * 
 * Règles :
 * - En production (`env === 'production'`) :
 *   - La variable doit être présente et non vide.
 *   - Elle doit impérativement débuter par 'https://'.
 *   - Elle ne doit pas se terminer par un slash de fin ('/').
 *   - Elle doit être une URL syntaxiquement valide.
 * - Hors production (développement, prévisualisation, tests) :
 *   - L'absence ou une chaîne vide est tolérée (laisse les liens relatifs sans bloquer le build).
 *   - Si une valeur est fournie, les slashs de fin sont nettoyés pour assurer la cohérence.
 */
export function validateSiteUrl(
  value: string | undefined,
  env?: string
): SiteUrlValidationResult {
  const isProduction = env === 'production';
  const trimmed = (value ?? '').trim();

  if (trimmed.length === 0) {
    if (isProduction) {
      return {
        isValid: false,
        error:
          'NEXT_PUBLIC_SITE_URL est obligatoire en production (ex. : https://easyjev.com).',
      };
    }
    return {
      isValid: true,
      normalizedUrl: '',
    };
  }

  if (isProduction) {
    if (!trimmed.startsWith('https://')) {
      return {
        isValid: false,
        error:
          'NEXT_PUBLIC_SITE_URL doit obligatoirement commencer par https:// en production.',
      };
    }

    if (trimmed.endsWith('/')) {
      return {
        isValid: false,
        error:
          'NEXT_PUBLIC_SITE_URL ne doit pas comporter de barre oblique finale (/) en production.',
      };
    }
  }

  // Vérification de la syntaxe d'URL
  try {
    const parsed = new URL(trimmed);
    if (!parsed.protocol || !parsed.host) {
      return {
        isValid: false,
        error: 'NEXT_PUBLIC_SITE_URL n’est pas une URL valide.',
      };
    }
  } catch {
    return {
      isValid: false,
      error: 'NEXT_PUBLIC_SITE_URL n’est pas une URL valide.',
    };
  }

  const normalized = trimmed.replace(/\/+$/, '');
  return {
    isValid: true,
    normalizedUrl: normalized,
  };
}
