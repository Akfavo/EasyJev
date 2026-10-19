# DESIGN — EasyJev

> Direction artistique et règles d'interface : **Piste A « OS verre »** (validée le 2026-09-29, finitions appliquées).
> Référence visuelle : hybride rétro Mac OS 1-bit (barre de titre noire, titres pixel en minuscules, case carrée, double filet, tramage dither) inspiré du site officiel de TypeSafe AI, fusionné avec des panneaux en **verre dépoli translucide (liquid glass)** aux reflets subtils.
> Identité visuelle définitive (Lot L1) : logo « empilement de cubes de verre rose-violet dans une bulle » (variante violette, sans aucun bleu), favicon et icônes intégrées.

## Principes

- **Compréhensible en un coup d'œil.** Une phrase explique Jev, un seul chemin : choisir, ajuster, copier.
- **Ambiance unique et amicale.** Fond rose poudré en dégradé avec tramage discret, fenêtres rétro Mac OS 1-bit (`.app`), corps en verre dépoli blanc lumineux.
- **Ergonomie intacte.** Parcours en trois temps (Décris. → Ajuste. → Copie.), éditeur à deux volets (liste à gauche, détail à droite), barre d'action flottante, pop-up Réglages IA sur deux colonnes, fenêtre d’import n8n avec détection locale des champs et sélection par cases à cocher.
- **Accessibilité stricte.** Contrastes WCAG 2.1 AA partout (texte sombre `#3C2C2F` sur fond rose (couleur de texte de TypeSafe AI, validée par l'utilisateur le 2026-09-29 ; contraste 5,45:1 sur le fond de base, 4,9:1 sur l'arrêt le plus foncé du dégradé), jamais de blanc sur rose ; texte de lecture ≥ 12 px et ≥ 16 px sur blanc dépoli ≥ 88 % d'opacité, jamais sur tramage ; police pixel strictement réservée aux titres de fenêtres et badges courts ; cibles ≥ 32 px pour les commandes de titre et ≥ 44 px pour les contrôles principaux ; focus visible 2 à 3 px net ; repli sans `backdrop-filter` et respect de `prefers-reduced-transparency` / `prefers-reduced-motion`).
- **Comportement pop-up fiable.** Fermeture au clic extérieur uniquement si l'appui souris (`mousedown`) ET le relâchement (`click`) ont le fond pour cible, évitant la fermeture lors de sélections de texte.

## Origine, choix assumés et limites

- **Choix assumés de l'utilisateur, à ne pas « corriger »** : le fond rose (`#F385A1`) et la couleur du texte sur le rose (`#3C2C2F`), repris du site de TypeSafe AI ; les gros titres en grotesque serré (Inter Tight). Seules les combinaisons de texte trop peu contrastées se corrigent, sans toucher à ces choix
- **Inspiration, pas copie** : on s'inspire de typesafe.ai (couleurs, typographie, esprit des fenêtres à barre de titre noire) mais on ne reproduit ni son logo, ni son nom stylisé, ni ses textes. Le pied de page affiche « Outil indépendant, non affilié à TypeSafe AI » (traduit en anglais)
- **Règle de couleur** : sur le fond rose, seulement du texte `--ink` ou `--ink-page` ; les cartes de contenu posées dans une fenêtre sont sur `--surface`, `--surface-2` ou `--brand-100`, jamais sur `--canvas` avec du texte magenta ou gris
- **Pas d'écran de chargement** : décision de l'utilisateur (le site reste léger ; les pages statiques s'affichent tout de suite)
- **Pistes écartées** (variantes B et C du Design Lab, logo pixel, variantes de couleur du logo, bulle dans le slogan) : voir `CONTEXT.md`, section « Décisions écartées »

## Tokens

```css
:root {
  /* Identité & Actions */
  --brand-500: #9D2E7C;       /* Magenta de marque */
  --brand-600: #9D2E7C;       /* Action principale, liens, accent-color (contraste 6.74:1 avec blanc) */
  --brand-700: #852467;       /* Survol action */
  --brand-100: #F6E4F0;       /* Fond de sélection doux */

  /* Encres */
  --ink: #181419;             /* Texte principal sur verre et cartes */
  --ink-page: #3C2C2F;        /* Texte sur fond rose poudré (couleur de texte de TypeSafe AI ; 5.45:1 sur le fond nominal, 4.9:1 sur l'arrêt foncé, 6.41:1 sur l'arrêt clair) */
  --muted: #5B535D;           /* Texte secondaire sur verre */
  --muted-page: #3C2C2F;      /* Texte secondaire sur rose poudré : même valeur que --ink-page (la hiérarchie passe par la taille et la graisse) */

  /* Surfaces & Dégradé de fond */
  --canvas: #F385A1;          /* Fond rose nominal */
  --canvas-light: #F59BB2;    /* Arrêt le plus clair du dégradé (18% blanc) */
  --canvas-dark: #E67E99;     /* Arrêt le plus foncé du dégradé (6% noir-brun, coin bas droit) */
  --surface: #FFFFFF;         /* Fond opaque (cartes intérieures et repli accessibilité) */
  --surface-glass: rgba(255, 255, 255, 0.88); /* Corps de fenêtre en verre dépoli */
  --surface-2: #FAF8FA;       /* Survol neutre et champs */
  --line: #141115;            /* Noir d'OS rétro (barres de titre, bordures extérieures) */
  --line-subtle: #E4DFE4;     /* Séparateurs intérieurs fins */
  --control-border: #634450;  /* Bordure des champs */

  /* Alertes & États */
  --success: #0F5B35;
  --success-bg: #D7F5E5;
  --error: #991B1B;
  --error-bg: #FDE4E4;
  --reset: #902F44;           /* Bouton « Réinitialiser » (rouge de marque, texte blanc 7.9:1) */
  --reset-hover: #7A2739;     /* Survol du bouton « Réinitialiser » (texte blanc 9.6:1) */
  --warning-bg: #FEEAA2;      /* Avec texte --warning-text */
  --warning-text: #3B2900;

  /* Formes & Rayons */
  --radius-win: 14px;         /* Fenêtres d'OS rétro */
  --radius-card: 14px;
  --radius-control: 8px;
  --radius-pill: 999px;

  /* Typographies */
  --font-sans: var(--font-inter-tight), system-ui, -apple-system, sans-serif;
  --font-pixel: var(--font-silkscreen), monospace;
  --font-mono: var(--font-jetbrains), monospace;
}
```

## Contrastes (calculés WCAG 2.1 AA)

- **Dégradé du fond de page** : le fond est un dégradé radial variant de `--canvas-light` (`#F59BB2`) à `--canvas-dark` (`#E67E99`).
  - `--ink-page` (`#3C2C2F`) sur `--canvas-dark` : **4.9:1** (conforme AA texte normal).
  - `--ink-page` sur `--canvas` : **5.45:1**.
  - `--ink-page` sur `--canvas-light` : **6.41:1**.
  - `--muted-page` a la même valeur que `--ink-page` : mêmes ratios.
- **Sous-titres d'étape** : stylés en `text-ink-page font-medium` pour garantir un ratio ≥ 4.9:1 sur l'intégralité du dégradé.
- **Règle absolue : aucun texte blanc directement sur le fond rose** (ratio ~2.5:1 insuffisant).
- **Règle : sur le rose (`--canvas`), seulement `--ink` ou `--ink-page` en texte.** Jamais `--brand-600` (environ 2.8:1) ni `--muted` (environ 3.1:1) : les cartes de contenu posées dans une fenêtre utilisent `--surface`, `--surface-2` ou `--brand-100`, pas `--canvas`.
- **Corps de texte sur verre dépoli** (`--surface` ou `--surface-glass` 88 %) : `--ink` donne **16.36:1**, `--muted` donne **6.64:1**.
- **État vide des questions** : exemples sur fond blanc (`bg-white border border-line`) avec texte `--ink` pour un ratio **16.36:1** (sans opacité intermédiaire).
- **Zéro `opacity-*` sur texte de lecture** : aucun modificateur d'opacité n'est appliqué aux textes de lecture (disclaimer du footer et sous-titres nets).
- **Blanc sur action `--brand-600`** (`#9D2E7C`) : **6.74:1** (conforme AA).
- **Blanc sur barre de titre `--line`** (`#141115`) : **18.74:1**.
- **Blanc sur le bouton `--reset`** (`#902F44`) : **7.9:1** ; sur `--reset-hover` (`#7A2739`) : **9.6:1**.
- **Cases à cocher et boutons radio** : `accent-color: var(--color-brand-600)` (magenta) pour une cohérence chromatique complète.

## Mise en page & Détails d'interface

- **Outil de bureau** : écrans d'ordinateur de 13 à 32 pouces. Conteneur `.page-container` (plafond 1920 px, marges fluides).
- **Internationalisation des fenêtres OS (`.os-window`)** :
  - Barres de titre traduites via les dictionnaires FR/EN :
    - `explications.app` (FR) / `about.app` (EN)
    - `decris.app` (FR) / `describe.app` (EN)
    - `ajuste.app` (FR) / `adjust.app` (EN) avec badge gérant strictement les pluriels (`0/1 question` en FR vs `0/2+ questions` en EN)
    - `copie.app` (FR) / `copy.app` (EN)
    - `reglages.app` (FR) / `settings.app` (EN)
    - `n8n-aide.app` (FR) / `n8n-help.app` (EN)
  - Boutons de réduction / ouverture traduits (`[ Réduire ]` / `[ Ouvrir ]` en FR, `[ Collapse ]` / `[ Expand ]` en EN).
  - Cibles des boutons de barre de titre ≥ 32 px.
  - Focus visible net blanc (`focus-visible:outline-white`) sur toutes les barres de titre noires.
- **Hero & Slogan** :
  - Titre monumental « Décris. Ajuste. Copie. » en `Inter Tight` très serré (`letter-spacing: -0.04em`), couleur brun sombre `--ink-page`.
  - Repères de coupe `⌜ ⌝ ⌞ ⌟` aux quatre coins du bloc.
  - Phrase d'accroche centrée sous le titre (`max-w-2xl`, `text-balance`), sans logo ni illustration : le grand titre est le seul héros.
  - Plus de bandeau explicatif sous le slogan : les explications et les encadrés de confiance sont dans une fenêtre « À propos » (`explications.app`), ouverte par un bouton de l'en-tête (lot B, 2026-10-02) ; dans « Copie », un seul geste principal (« Copier le nœud n8n »), le JSON est replié sous « Voir le JSON » ; dans « Ajuste », un seul bouton « + Ajouter une question » qui déplie le choix du type.
- **Étape 1 : Décris** (`decris.app` / `describe.app`) :
  - Repliable via l'unique bouton « [ Réduire ] » de la barre de titre ; reste **ouverte** après le chargement d'un modèle ou une génération ; son contenu reste monté (masqué par `hidden`) quand elle est repliée.
  - Deux cases côte à côte (dès 900 px) : description à gauche, données n8n collées à droite (pastilles de champs cochables, magenta plein une fois cochées), un seul bouton « Générer » dessous ; les modèles prêts à l'emploi et « Créer à la main » sont dans une section repliable sous le bouton.
  - Zones de saisie plafonnées à 20 rem (`max-h-[20rem]`).
  - Modèles prêts à l'emploi plus compacts (`py-2 sm:py-2.5`, `gap-2`).
- **Étape 2 : Ajuste** (`ajuste.app` / `adjust.app`) :
  - Import n8n : si des questions citent un champ retiré, une fenêtre propose de le remplacer par un champ importé (liste déroulante par champ, « Ne pas remplacer » possible).
  - Bandeau compact « Jev va lire le champ [avis] » avec bouton d'ajout de champ ; en mode multi-champs n8n, pastilles de champs côte à côte sur une seule ligne.
  - Éditeur à deux volets : liste des questions à gauche (citations de champs affichées comme de petites pastilles mono sur fond clair), détail à droite sur deux sous-colonnes dès 1280 px avec clé technique n8n repliée par défaut sous un lien discret « Avancé ».
  - Après une génération : bandeau d'information (nombre de questions, modèle, coût réel estimé) en tête de fenêtre, sans bouton de fermeture ; le coût n'est affiché qu'ici.
- **Étape 3 : Copie** (`copie.app` / `copy.app`, refonte UX du 2026-10-02) : grille en deux colonnes dès 1000 px. À gauche : choix d'accès « Clé TypeSafe / Vercel AI Gateway » (contrôle segmenté), gros bouton magenta « Copier le nœud n8n » (56 px), liens « Copier seulement le JSON » et « Configuration manuelle et dépannage », JSON repliable. À droite : « Ensuite, dans n8n » (coller, ajouter la clé, vérifier, lire les réponses) avec les expressions de lecture de chaque question prêtes à copier (`ReadingExpressions`, Oui / Non en texte pour les questions oui/non). Erreurs bloquantes affichées en premier, cliquables.
- **Titres d'étapes** : pastille ronde numérotée (1, 2, 3) devant « Décris. / Ajuste. / Copie. », verte avec une coche quand l'étape est faite (1 : des questions existent ; 2 : tout est valide). « Tout effacer » est en haut à droite de « Ajuste ».
- **Décris** : modèles et « Partir de zéro » toujours visibles sous le bouton Générer, en cartes compactes (grille de 5 colonnes en très grand écran).
- **Ajuste** : « Ce que Jev lit » sur une seule ligne (pastilles de champs renommables, croix de suppression s'il y en a plusieurs, « + Ajouter un champ », « Importer depuis n8n » qui ramène à la case de données de « Décris », champs détectés à ajouter).
- **Barre d'action flottante** : capsule noire dépolie en bas d'écran, visible seulement quand « Copie » est hors de l'écran : résumé, « Voir le résultat », « Copier le nœud n8n ». Sur téléphone, le bouton de copie seul.
- **Pop-ups & dialogues (`AiSettingsDialog`, `ConfirmReplaceDialog`, `N8nHelpDialog`, `FieldRemapDialog`)** :
  - Dialogue d'aide n8n (`N8nHelpDialog`) : ne contient plus que la configuration manuelle en 14 étapes (dépliée) et le bloc « Si ça ne marche pas ».
  - Fermeture au clic extérieur fiable : fermeture uniquement si `mousedown` ET `click` ont le backdrop natif pour cible.
  - Pour `ConfirmReplaceDialog`, le clic extérieur équivaut à « Conserver mon travail » (`onCancel`).
  - Échap et restauration du focus inchangés.
- **Pied de page** : mention bilingue via `dict.footer.disclaimer` sans opacité (`text-xs text-muted-page`).
- **En-tête sur téléphone** : libellés courts (« Démo », « Infos », « Clé »), nom « EASYJEV » masqué, étiquette des barres de fenêtre masquée. Masqué entièrement sur la page de démo.
- **Page « Comment ça marche ? » (`/<locale>/demo`)** : sans barre de menu ; titre, phrase, gros bouton « Essayer EasyJev » au-dessus de la démo. Démo en motion design, 6 scènes / 29 s, deux écrans côte à côte (« Ton workflow » sombre à gauche, « EasyJev » à droite, un seul actif ; sur téléphone seul l'écran actif s'affiche) : textes animés d'accroche, saisie, apparitions en cascade avec rebond, nœud copié qui vole en arc vers un emplacement « Ctrl+V », câble dessiné puis parcouru par une impulsion, réponses Oui / Non en cascade, bandeau final « Décris. Ajuste. Copie. ». Sous la scène : légende de l'étape, bouton Lecture / Pause / Rejouer et 6 étapes cliquables avec leur barre de progression. Agrandissement (`.demo-zoom`) seulement si la fenêtre est assez grande. Respect de `prefers-reduced-motion` (pas de lecture automatique).

## Logo & Identité Visuelle

- **Motif & Thème** : Empilement de cubes de verre translucides aux teintes rose-magenta-violet enfermés dans une bulle de verre glossy 3D. Variante chromatique « violet » exclusive, excluant tout composant bleu pour une symbiose parfaite avec le fond rose (`#F385A1`) et l'accent magenta (`#9D2E7C`).
- **Fichiers & Usages** :
  - **Cubes seuls (`logo-cubes-*.png`)** : Réservés aux petites tailles d'affichage (jusqu'à environ 64 px), où la bulle extérieure encombrerait la lisibilité des détails géométriques. Utilisés également pour la favicon du navigateur (`favicon.ico`, `icon.png`).
  - **Bulle complète (`logo-bulle-*.png`)** : Plus affichée dans l'interface (retirée du slogan le 2026-09-29 : redondante avec le logo de l'en-tête, mal alignée et trop lourde visuellement). Conservée seulement comme fichier source dans `assets-logo/` (non publié) pour de futurs usages (image de partage, page introuvable) ; copies `public/brand/logo-bulle-*` supprimées le 2026-10-19.
- **Tailles retenues dans l'interface** :
  - **En-tête (`Header`)** : Cubes seuls (`public/brand/logo-cubes-96.png`) affichés à **36 × 36 px** (densité Retina), placés à gauche du logo textuel pixel `EASYJEV`. Rendu décoratif (`alt=""`).
  - **Slogan / Hero (`Page`)** : Aucun logo : le grand titre est le seul héros ; la phrase d'accroche est centrée dessous (`max-w-2xl`, `text-balance`).
  - **Favicon et icônes** : Gérées via les conventions de fichiers de métadonnées Next.js (`src/app/favicon.ico`, `src/app/icon.png` en 512 px, `src/app/apple-icon.png` en 180 px avec fond rose opaque `#F385A1`).
- **Fonds validés** :
  - Fond rose du site (`--canvas` / `#F385A1`, dégradé radial).
  - Fond blanc dépoli (`--surface` / `--surface-glass`).
  - Fond noir d'OS rétro (`--line` / `#141115`).
- **Interdictions strictes** :
  - **Pas de recoloration** : le dégradé rose-violet original ne doit être altéré sous aucun prétexte.
  - **Pas de déformation** : ratio 1:1 strict impératif.
  - **Pas d'ombre portée ajoutée** : ne pas rajouter de `drop-shadow` artificielle qui alourdirait le détourage soigné du verre.
  - **Pas de logo sur une couleur vive** : ne jamais superposer le logo sur un aplat saturé ou criard (vert, orange, rouge, etc.).



