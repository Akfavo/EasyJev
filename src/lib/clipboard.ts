/**
 * Copie un texte dans le presse-papiers avec gestion robuste des replis
 * (Clipboard API moderne puis repli textarea + document.execCommand).
 * Renvoie true si la copie a effectivement réussi, false sinon.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  // 1. Essai via l'API Clipboard moderne
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Échec (ex: permissions restreintes, focus perdu) -> repli vers execCommand
    }
  }

  // 2. Repli textarea + document.execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Position fixe hors de l'écran pour éviter tout défilement visible
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    return Boolean(successful);
  } catch {
    return false;
  }
}
