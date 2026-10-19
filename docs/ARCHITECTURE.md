# ARCHITECTURE — EasyJev

> Document d'architecture logicielle (Jalon 2). Conforme à `CONTEXT.md` et `DESIGN.md`. Aucune dépendance superflue, aucun `any`. Resynchronisé avec le code le 2026-09-29 (refonte visuelle « OS verre », lots 6.x, L1, G1).

---

## 1. Choix de stack

| Critère | (a) Next.js (App Router, Export Statique) | (b) Vite + React (SPA) | (c) Astro + React |
|---|---|---|---|
| **CSP sans script tiers** | Bonne (scripts d'hydratation Next.js avec `script-src 'self' 'unsafe-inline'`) | Excellente (`script-src 'self'` pur, bundle statique) | Excellente (HTML statique + îlots isolés) |
| **Routes `/fr` et `/en`** | Natif via `app/[lang]`, pré-rendu HTML au build | Routage client (`react-router`) ou multi-page HTML manuel | Natif via `astro/i18n`, routes statiques directes |
| **Hébergement Vercel Hobby** | Idéal : export statique pur (`output: 'export'`) + `vercel.json` | Idéal : fichiers statiques purs | Idéal : adaptateur statique Vercel |
| **SEO de la landing** | Maximal : HTML pré-rendu au build avec métadonnées par langue | Faible : coquille vide sans hydratation JS client | Maximal : contenu statique pur sans JS obligatoire |
| **Familiarité utilisateur** | Maximale : l'utilisateur connaît déjà Next.js | Bonne (React classique), mais outillage manuel | Faible : apprentissage de la syntaxe et des îlots Astro |

**Recommandation :** Next.js (App Router avec `output: 'export'`, SSG sur `/fr` et `/en`, redirections conditionnelles de `/` dans `vercel.json`).  
**Compromis :** Next.js garantit un pré-rendu HTML optimal de la landing bilingue et un confort de travail immédiat pour l'utilisateur sans aucun serveur d'exécution. En contrepartie, la redirection depuis `/` selon la langue repose sur les règles d'en-tête de `vercel.json` (à valider au déploiement, avec repli possible sur un middleware `proxy.ts`).

**Dépendances proposées :**
- `next` : Framework React avec export statique pur (`output: 'export'`), routage par dossier et typage intégré.
- `react`, `react-dom` : Moteur d'interface déclarative pour l'éditeur réactif.
- `tailwindcss` (v4) et `@tailwindcss/postcss` : Moteur CSS utilitaire sans runtime pour implémenter les tokens et le style « OS verre » (fenêtres, verre dépoli).
- *(Icônes)* Aucune bibliothèque d'icônes : icônes SVG en ligne dans les composants.
- *(Typographie)* `next/font/google` : Inter Tight, Silkscreen et JetBrains Mono, auto-hébergées au build (`src/app/fonts.ts`), sans requête externe à l'exécution.
- *(Dev)* `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, `eslint` et `eslint-config-next`, `vitest`, `postcss` : typage statique strict (zéro `any`), contrôle de style et tests.
- *(Volontairement absents)* `lucide-react`, `clsx` et `tailwind-merge` avaient été proposés au jalon 2 mais n'ont jamais été ajoutés au projet.

---

## 2. Modules et leur rôle

1. **`spec` (`src/modules/spec/`)** : Modèle de données interne (champs lus, questions, modèles prêts à l'emploi, cible Jev typée).
2. **`validators` (`src/modules/validators/`)** : Règles métier Jev (noms ASCII uniques, score 2 à 10 niveaux, limite 255 choix, détection des citations de champs entre accents graves).
3. **`generators` (`src/modules/generators/`)** :
   - *JSON Jev* : Construction du payload POST (`state` en texte ou objet d'expressions n8n, `model`, `questions`).
   - *Expressions n8n* : Génération des expressions de lecture des réponses (`answers.<clé>.noul`, etc.).
4. **`editor` (`src/modules/editor/`)** : Gestionnaire d'état pur de l'éditeur (actions et réducteur pour champs, questions, choix, scores, noul, provider, replaceContent ; dérivation automatique et unicité des clés, insertion de citation, découpage lexical du JSON, détection hasUserContent, fonction pure `isStartingPointOpen` pour le repli du point de départ, logique pure de barre d'action `shouldShowActionBar`, `getActionBarStatus` et `getActionBarSummary`, fonctions pures de sélection de questions `resolveSelectedQuestionId` et `getSelectionAfterDelete` dans `question-selection.ts`, magasin de session en mémoire vive `editorSessionStore` préservant le travail au changement de langue).
5. **`ai-settings` (`src/modules/ai-settings/`)** : Logique pure d'état des réglages IA partagés (clé API, modèle sélectionné, mémorisation locale, visibilité du dialogue modal). Réducteur pur `aiSettingsReducer`, actions typées, magasin de session `aiSettingsSessionStore`, fonctions pures `toSessionSettings` et `fromSessionSettings` avec validation du modèle et `index.ts`.
6. **`templates` (`src/modules/templates/`)** : Modèles prêts à l'emploi (`triage`, `urgence`, `lead`, `avis`) en FR et EN avec clés techniques anglaises identiques et citations strictes de champs.
7. **`i18n` (`src/modules/i18n/`)** : Dictionnaires bilingues typés (FR/EN), gestion du cookie `easyjev_lang` et balises `hreflang`.
8. **Aide n8n (pas de module dédié)** : étape « Copie » (`editor-output.tsx` : choix du fournisseur, copie du nœud, « Ensuite, dans n8n ») avec `reading-expressions.tsx` (expressions de lecture de `generators/n8n-expressions.ts`, prêtes à copier) ; panneau `N8nHelpDialog` réduit à la configuration manuelle en 14 étapes et au dépannage ; mise en forme `**gras**` / `` `code` `` partagée dans `format-help-text.tsx` ; textes bilingues `dict.editor.help`. Supprimés le 2026-10-02 : `n8n-input-dialog.tsx` (import doublon de la case de données de « Décris ») et `field-example-input.tsx` (mode « Autre outil » retiré de l'interface, toujours géré par le générateur). Le module `src/modules/n8n-help/` prévu au jalon 2 n'a jamais été créé.
9. **`claude-client` (`src/modules/claude-client/`)** : Appel direct du navigateur vers `api.anthropic.com` (fichiers `config`, `prompt`, `tool`, `request`, `parse`, `client`, `types` ; gardes de type TypeScript sans Zod, une tentative de relance automatique sur `bad_output`, libellés courts de modèles `getModelShortLabel`, stratégie de requête par modèle `getRequestStrategy`, estimation du coût réel `estimateCostUsd` à partir de tarifs codés en dur dans `config.ts`, zéro fuite de clé). La langue de l'interface (`InterfaceLanguage = 'fr' | 'en'`) est transmise à Claude comme repli : si la langue de la description est ambiguë (trop courte, mêlée de termes techniques), Claude écrit dans la langue de l'interface ; sans ce paramètre, le comportement actuel est conservé.
10. **`demo` (`src/modules/demo/`)** : Définition pure de la chronologie en 6 scènes (`timeline.ts` : `hook`, `describe`, `adjust`, `copy`, `run`, `result`, 29 s), calcul de progression (`getSceneAt`), navigation (`nextSceneStart`, `previousSceneStart`), courbes de motion design (`easing.ts` : `between`, `easeOutCubic`, `easeInOutCubic`, `easeOutBack`, `quadBezier`), trajet du curseur (`cursor-path.ts`, `cursorAt` avec courbe optionnelle), règle Oui / Non des résultats (`demo-results.ts`) et données fictives (`demo-data.ts`). Affichage : `src/components/demo/demo-player.tsx` (lecteur rAF) et `demo-stage.tsx` (scène, fonction pure de la progression).

---

## 3. Interfaces TypeScript (signatures pures)

```typescript
// --- CONTRATS OFFICIELS JEV (CONTEXT.md) ---

export type TypeSafeDirectModel = 'jev-latest' | 'jev-1.13.0';
export type VercelGatewayModel = 'typesafe-ai/jev';

// Modèle et fournisseur cohérents : aucune combinaison invalide n'est représentable
export type JevTargetConfig =
  | { provider: 'typesafe'; model: TypeSafeDirectModel }
  | { provider: 'vercel-gateway'; model: VercelGatewayModel };

export type QuestionType = 'noul' | 'choice' | 'score';

export interface JevNoulCriteria {
  true?: string;
  false?: string;
}

export type JevChoiceCriteria = Record<string, string | null>; // Jusqu'à 255 choix
export type JevScoreCriteria = string[]; // Tableau ordonné de 2 à 10 niveaux

export type JevCriteria = JevNoulCriteria | JevChoiceCriteria | JevScoreCriteria;

export interface JevQuestionPayload {
  type: QuestionType;
  instructions: string;
  criteria?: JevCriteria;
}

export interface JevRequestBody {
  state: string | Record<string, string>;
  model: TypeSafeDirectModel | VercelGatewayModel;
  questions: Record<string, JevQuestionPayload>;
}

export interface JevAnswer {
  type: QuestionType;
  noul?: number; // Valeur numérique de 0 à 1 (pas un boolean)
  choice?: string;
  score?: number;
  confidence?: number;
  probabilities?: Record<string, number>;
  legend?: Record<string, string>;
}

export interface JevResponse {
  model: string;
  answers: Record<string, JevAnswer>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

// --- SPEC EASYJEV & ÉDITEUR ---

export interface SpecField {
  id: string;
  name: string; // ASCII, sans espace, unique
  exampleValue?: string;
}

export interface BaseQuestionSpec {
  id: string;
  key: string; // ASCII, clé unique dans le JSON
  label: string; // Titre éditable UI
  instructions: string; // Ex: "Le message `message` exprime-t-il de l'urgence ?"
  isKeyCustomized?: boolean; // Clé modifiée manuellement par l'utilisateur (figée)
}

export interface NoulQuestionSpec extends BaseQuestionSpec {
  type: 'noul';
  criteria?: {
    trueCondition?: string;
    falseCondition?: string;
  };
}

export interface ChoiceOption {
  key: string;
  description?: string;
}

export interface ChoiceQuestionSpec extends BaseQuestionSpec {
  type: 'choice';
  options: ChoiceOption[]; // Jusqu'à 255
}

export interface ScoreQuestionSpec extends BaseQuestionSpec {
  type: 'score';
  levels: string[]; // De 2 à 10 libellés ordonnés (ex: ["Faible", "Moyen", "Élevé"])
}

export type QuestionSpec = NoulQuestionSpec | ChoiceQuestionSpec | ScoreQuestionSpec;

export interface EasyJevSpec {
  fields: SpecField[];
  questions: QuestionSpec[];
  target: JevTargetConfig;
  outputMode: 'n8n-expression' | 'example-text';
}

// --- VALIDATION & GÉNÉRATEURS ---

export type ValidationSeverity = 'error' | 'warning';

export type ValidationCode =
  | 'NO_FIELDS'
  | 'FIELD_NAME_INVALID'
  | 'FIELD_NAME_DUPLICATE'
  | 'NO_QUESTIONS'
  | 'QUESTION_KEY_INVALID'
  | 'QUESTION_KEY_DUPLICATE'
  | 'QUESTION_INSTRUCTIONS_EMPTY'
  | 'QUESTION_NO_FIELD_CITED'
  | 'QUESTION_CITES_UNKNOWN_FIELD'
  | 'CHOICE_OPTIONS_TOO_FEW'
  | 'CHOICE_OPTIONS_TOO_MANY'
  | 'CHOICE_OPTION_KEY_EMPTY'
  | 'CHOICE_OPTION_DUPLICATE'
  | 'SCORE_LEVEL_EMPTY'
  | 'SCORE_LEVELS_OUT_OF_RANGE'
  | 'TEXT_CONTAINS_N8N_DELIMITERS';

export interface ValidationIssue {
  code: ValidationCode;
  severity: ValidationSeverity;
  params?: Record<string, string | number>;
  fieldId?: string;
  questionId?: string;
}

export interface ValidationResult {
  isValid: boolean; // false si au moins 1 'error'
  issues: ValidationIssue[];
}

export interface GeneratedJevOutput {
  rawObject: JevRequestBody;
  jsonString: string;
  endpointUrl: string;
  authHeaderPrefix: string;
}

export interface GeneratedN8nNode {
  rawObject: unknown;
  jsonString: string;
}

export interface N8nReadingExpressions {
  byQuestionKey: Record<string, {
    primaryPath: string; // Ex: "{{ $json.answers.urgency.noul }}" (nombre 0 à 1)
    secondaryPaths?: Record<string, string>; // Ex: confidence, probabilities
  }>;
}

// --- SIGNATURES DES FONCTIONS MÉTIER ---

export function validateSpec(spec: EasyJevSpec): ValidationResult;

// Fonction pure : renomme le champ, propage dans instructions (`old` -> `new`) si noms valides et non pris, spec inchangée si oldName introuvable ou identique
export function renameField(
  spec: EasyJevSpec,
  oldName: string,
  newName: string
): EasyJevSpec;

export class InvalidSpecError extends Error {
  readonly issues: readonly ValidationIssue[];
}

export function generateJevOutput(spec: EasyJevSpec): GeneratedJevOutput;

// Pour une question oui/non, Jev renvoie un nombre de 0 à 1 : secondaryPaths.yesNo (seuil 0,5) et
// secondaryPaths.yesMaybeNo (oui > 0,7, non < 0,3, sinon peut-être) le transforment en texte avec les libellés fournis
export interface N8nAnswerLabels { yes: string; no: string; maybe: string }
export function generateN8nExpressions(spec: EasyJevSpec, labels?: N8nAnswerLabels): N8nReadingExpressions;

export function generateN8nNode(
  spec: EasyJevSpec,
  makeId?: () => string
): GeneratedN8nNode;

// --- CLIENT CLAUDE (GÉNÉRATION) ---

export type ClaudeErrorType =
  | 'invalid_input'
  | 'invalid_key'
  | 'forbidden'
  | 'billing'
  | 'bad_request'
  | 'rate_limited'
  | 'overloaded'
  | 'network'
  | 'aborted'
  | 'bad_output'
  | 'model_unavailable'
  | 'timeout'
  | 'refused';

export interface ClaudeUsage {
  inputTokens: number;
  outputTokens: number;
}

export type ClaudeGenerationResult =
  | {
      ok: true;
      questions: QuestionSpec[];
      fieldsUsed: string[]; // champs jugés utiles par Claude (sous-ensemble des champs fournis)
      usage: ClaudeUsage;
      model: string;
    }
  | {
      ok: false;
      error: ClaudeErrorType;
      status?: number;
      apiErrorType?: string;
    };

// Langue de l'interface transmise à Claude (repli quand la langue de la description est ambiguë)
export type InterfaceLanguage = 'fr' | 'en';

export interface ClaudeGenerationParams {
  apiKey: string;
  description: string;
  fields: SpecField[];
  model?: string; // Défini dans config.ts (par défaut : claude-haiku-5-5)
  language?: InterfaceLanguage; // Absent : comportement historique (langue de la description seule)
}

export interface ClaudeGenerationDeps {
  fetch?: typeof fetch;
  makeId: () => string;
  signal?: AbortSignal;
}

export function generateQuestionsFromDescription(
  params: ClaudeGenerationParams,
  deps: ClaudeGenerationDeps
): Promise<ClaudeGenerationResult>;

export function buildSystemPrompt(language?: InterfaceLanguage): string;

// Stratégie de requête selon le modèle : Haiku 5.5 = outil forcé ; Sonnet 5.5 = outil auto strict + réflexion entre les outils
export function getRequestStrategy(modelId: string): 'forced-tool' | 'auto-tool-strict';

// Coût réel estimé en dollars (tarifs codés en dur) ; null si le modèle est inconnu
export function estimateCostUsd(usage: ClaudeUsage, modelId: string): number | null;

export function getModelShortLabel(modelId: string): string;

// --- RÉGLAGES IA PARTAGÉS (src/modules/ai-settings/) ---

export interface AiSettingsState {
  apiKey: string;
  rememberKey: boolean;
  selectedModel: ClaudeModelId;
  isDialogOpen: boolean;
}

export type AiSettingsAction =
  | { type: 'SET_API_KEY'; key: string }
  | { type: 'SET_REMEMBER_KEY'; remember: boolean }
  | { type: 'SET_MODEL'; modelId: ClaudeModelId }
  | { type: 'OPEN_DIALOG' }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'FORGET_KEY' };

export function aiSettingsReducer(
  state: AiSettingsState,
  action: AiSettingsAction
): AiSettingsState;

// --- AFFICHAGE & BARRE D'ACTION ÉDITEUR (src/modules/editor/) ---

export type StartingPointMode = 'auto' | 'open' | 'closed';

export function isStartingPointOpen(mode: StartingPointMode, hasWork: boolean): boolean;

export function shouldShowActionBar(questionsCount: number, isResultVisible: boolean): boolean;

export type ActionBarStatus = 'ready' | 'errors';

export interface ActionBarLabels {
  barSummaryReady: (count: number) => string;
  barSummaryErrors: (count: number) => string;
}

export function getActionBarStatus(isValid: boolean): ActionBarStatus;

export function getActionBarSummary(
  questionCount: number,
  isValid: boolean,
  errorCount: number,
  labels: ActionBarLabels
): string;

// --- CITATIONS DE CHAMPS DANS LES QUESTIONS (src/modules/editor/citations.ts) ---

export type CitationSegmentType = 'text' | 'field';

export interface CitationSegment {
  type: CitationSegmentType;
  value: string;
}

export function splitCitations(text: string): CitationSegment[];

// Remplace les champs cités entre accents graves (ancien nom -> nouveau nom) ; le texte hors citation est inchangé
export function remapFieldCitations(text: string, mapping: Record<string, string>): string;

// --- IMPORT DE CHAMPS DEPUIS N8N (src/modules/editor/n8n-input.ts) ---

export type N8nInputParseError =
  | 'invalid_json'
  | 'not_object'
  | 'empty'
  | 'too_large'
  | 'table_view';

export interface ImportedField {
  name: string;
  kind: 'text' | 'number' | 'other' | 'nested';
  preview: string;
  exampleValue?: string;
  usable: boolean;
  unusableReason?: 'nested' | 'invalid_name';
}

export type N8nInputParseResult =
  | { ok: true; fields: ImportedField[] }
  | { ok: false; error: N8nInputParseError };

export function parseN8nInput(text: string): N8nInputParseResult;
```

---

## 4. Flux de données et structure de l'interface

### A. Structure de la page en trois temps (« Décris. Ajuste. Copie. »)

L'application adopte une disposition de bureau pleine largeur (`.page-container` centré avec marge fluide, échelle de texte fluide `clamp()` sur `html`), découpée selon les trois temps du slogan produit :

1. **Étape 1 : « Décris. » (`#step-describe-title`)** :
   - Zone de point de départ (lot A, 2026-10-02) : deux cases côte à côte dans `GenerationCard` : à gauche la description (`GenerationDescription`), à droite les données n8n collées (`GenerationDataBox`, facultatif, JSON du panneau OUTPUT du nœud précédent). Un seul bouton « Générer ». Le JSON collé est analysé localement (`parseN8nInput`) et reste dans l'état de la carte (jamais stocké) ; les champs détectés et utilisables (60 au plus, `MAX_DETECTED_FIELDS_SENT`) s'affichent en pastilles cochables. Rien de coché : Claude reçoit les noms de tous les champs détectés et renvoie `fields_used` (les champs utiles) ; des champs cochés : Claude ne reçoit qu'eux. Les valeurs ne partent jamais vers Claude. La fonction pure `resolveGeneratedFields` fixe les champs lus par Jev (cochés, ou choisis par Claude plus tout champ détecté cité dans une question, repli sur le premier champ détecté) ; `spec/replaceContent` remplace champs et questions ; les noms détectés sont gardés dans `EditorState.detectedFields` (action `detected/set`, noms seulement) pour proposer « + N autres champs détectés » dans « Ajuste » (`EditorReads`). Sans données collées, comportement inchangé (champs actuels, `spec/replaceQuestions`). Le bouton « Utiliser les champs cochés » applique les champs sans IA. Les modèles prêts à l'emploi et « Créer à la main » sont dans une section repliable `<details>` sous le bouton (contenu toujours monté).
   - Fenêtre `decris.app` (`OsWindow` repliable) ; état via `isStartingPointOpen(startingPointMode, hasWork)` : en mode `'auto'` (état initial), ouverte sans travail et repliée si du travail existe (cas d'un travail restauré après un changement de langue).
   - Après le chargement d'un modèle ou une génération, l'éditeur passe le mode à `'open'` : la fenêtre **reste ouverte** (l'utilisateur peut ajuster sa description et relancer) ; elle ne se replie que sur action explicite (bouton unique « [ Réduire ] » de la barre de titre, mode `'closed'`). Le contenu de la fenêtre reste monté quand elle est repliée (attribut `hidden`) : la saisie et l'état de la génération ne sont pas perdus.
   - Une seule source de défilement après génération ou chargement : `Editor.handleContentLoaded` amène le début d'« Ajuste » à l'écran (attente de deux images pour que la mise en page soit stable, focus de la question sans déplacer la page).

2. **Étape 2 : « Ajuste. » (`#editor-workspace`)** :
   - Bloc « Ce que Jev lit » (`EditorReads`) : version compacte tenant sur une seule ligne en mode standard (`Jev lit : [message] + Ajouter un champ · Importer depuis n8n`) et pastilles côte à côte avec bouton « × » sur une ligne en mode multi-champs n8n (plus de cartes empilées), gestion des champs avec renommage pur (`renameField`) et mise à jour synchronisée des citations.
   - Import des champs depuis n8n (depuis le 2026-10-02, plus de fenêtre dédiée) : case « Tes données » de l'étape « Décris » (`generation-data-box.tsx`, piloté par `generation-card.tsx`) où l'on colle le JSON du panneau OUTPUT du nœud précédent ; analyse purement locale (`parseN8nInput`), sélection par cases à cocher des champs de premier niveau, remplacement ordonné dans le réducteur (`field/replaceAll`) en conservant l'identifiant et l'exemple des champs de même nom. Le lien « Importer depuis n8n » du bloc « Ce que Jev lit » ramène à cette case. En cas de retrait d'un champ cité par des questions, confirmation préalable (`ConfirmReplaceDialog`, « Appliquer quand même » / « Revenir ») et `FieldRemapDialog` propose pour chaque champ retiré un remplacement par l'un des champs cochés (présélectionné seulement s'il y a un seul champ retiré et un seul champ coché) : `field/replaceAll` accepte alors un `remap` (ancien nom -> nouveau nom) qui réécrit, via `remapFieldCitations`, les citations entre accents graves des questions (les mots écrits en clair ne sont pas modifiés). Confidentialité stricte : le texte collé n'est jamais stocké ; seuls les noms des champs choisis partent vers Claude, jamais les valeurs.
   - Éditeur de questions à deux volets (`QuestionList`, `QuestionRow`, `QuestionEditor`, suppression définitive de l'ancien accordéon `QuestionItem`) : dès 1100 px, liste des questions à gauche (`minmax(280px, 360px)`, sticky avec navigation clavier flèches/Home/End, sélection visible par teinte et bordure `brand-600`, et citations de champs affichées en pastilles mono sur fond clair via `splitCitations`) et détail de la question active à droite (`minmax(0, 1fr)`). Dès 1280 px, `QuestionEditor` s'organise lui-même en deux colonnes (colonne gauche : consigne, citations, sélecteur de type, clé technique n8n repliée par défaut sous un lien discret « Avancé : clé n8n », validation ; colonne droite : critères propres au type avec options dont la description n'est jamais tronquée). Sélection garantie par les fonctions pures `resolveSelectedQuestionId` et `getSelectionAfterDelete`.
   - Après une génération, un bandeau (`role="status"`) en tête de la fenêtre `ajuste.app` indique le nombre de questions générées, le modèle et le **coût réel estimé** (tokens en entrée et en sortie, composant `GenerationReportLine`). Il disparaît au chargement d'un modèle ou à la réinitialisation. Le coût n'est affiché qu'à cet endroit.

3. **Étape 3 : « Copie. » (`#result`)** (les explications « C'est quoi Jev ? / Et EasyJev, ça sert à quoi ? » et les encadrés de confiance ne sont plus dans la page : ils sont dans la fenêtre « À propos » `AboutDialog`, ouverte depuis l'en-tête ; dans « Ajuste », un seul bouton « + Ajouter une question » ouvre le choix du type) :
   - Panneau de résultat pleine largeur en bas de page (`EditorOutput`), libérant l'espace d'édition (lot B, 2026-10-02) : un geste principal (gros bouton « Copier le nœud n8n » avec trois étapes courtes à côté ; hors n8n, « Copier le JSON » seul), « Copier le JSON » en bouton secondaire, le JSON dans une section repliable `<details>` « Voir le JSON ». Les erreurs bloquantes et avertissements restent visibles.
   - Coloration syntaxique pure sans `dangerouslySetInnerHTML` (`JsonHighlighter`).
   - Liste des erreurs bloquantes cliquables pointant directement sur le champ ou la question concernée.
   - Bouton de copie du JSON avec confirmation animée (`aria-live`).
   - Bouton « Copier le nœud n8n » en mode `n8n-expression` (générateur pur `generateN8nNode` produisant le JSON d'un nœud HTTP Request prêt à être collé sur le canvas n8n, sans credentials ni clés).
   - Dialogue d'aide n8n (`N8nHelpDialog`) : bouton de copie du nœud en tête, parcours nominal en 4 étapes courtes (avec mini-aide pour la création de la clé dans les credentials n8n et expressions de lecture dynamiques), et section repliée native `<details>` offrant les 14 étapes de configuration manuelle regroupées en 5 blocs.

4. **Barre d'action fixe en bas d'écran** :
   - Composant flottant ancré en bas de l'écran, affiché **uniquement s'il y a au moins une question et que la section `#result` est hors écran** (fonction pure `shouldShowActionBar`).
   - Capsule élargie (`max-w-[min(64rem,calc(100vw-2rem))]`) avec retour à la ligne propre sur écran étroit (`flex-wrap`, `justify-center`), focus visible blanc et cibles interactives conformes (≥ 44 px).
   - Synthèse de la spec calculée par la fonction pure `getActionBarSummary` (nombre de questions et état « prêt », ou nombre d'erreurs bloquantes à corriger).
   - Bouton « Voir le résultat » qui défile de façon fluide jusqu'à `#result` (masquant alors la barre d'action).
   - Bouton « Copier le JSON » (magenta plein, texte blanc) permettant la copie directe du JSON pour Jev sans défilement préalable.
   - Bouton « Copier le nœud n8n » (contour clair, affiché uniquement en mode `n8n-expression`) permettant de copier le nœud n8n directement depuis la barre d'action.
   - Bouton « Réinitialiser » (rouge de marque `--color-reset`, texte blanc) : demande une confirmation (`ConfirmReplaceDialog`) puis remet à zéro champs, questions et description saisie (cible, mode de sortie, clé et modèle conservés), efface le bandeau de génération et ramène l'écran sur « Décris ».
   - Padding bas `pb-28` sur le conteneur principal afin que la barre ne masque aucun contenu textuel ou interactif.

### B. Réglages IA en pop-up (`AiSettingsProvider` & `AiSettingsDialog`) et flux « clé absente »

- **État global partagé :** Géré par `AiSettingsProvider` au niveau du layout de la route `[lang]`. Contient la clé API en mémoire, le modèle Claude choisi (`CLAUDE_MODELS`, Haiku 4.5 par défaut ou Sonnet 5.5), la visibilité du dialogue et l'option de mémorisation locale (`localStorage`).
- **Protection anti-course et hydratation sûre (`isHydrated`) :**
  - Un indicateur local `isHydrated` (initialisé à `false`) garantit qu'aucune écriture dans `localStorage` n'est déclenchée avant la fin complète de la lecture initiale des réglages mémorisés.
  - Élimine toute course d'écrasement du modèle (par exemple Sonnet 5.5 écrasé par Haiku 4.5 au premier passage d'effet) et résiste de façon éprouvée aux doubles exécutions d'effets du mode strict de React en développement.
- **Mémoire de session en JavaScript pur (`createSessionStore`) :**
  - Deux magasins indépendants en mémoire vive (`src/lib/session-store.ts`) : `aiSettingsSessionStore` pour les réglages IA (clé, mémorisation, modèle ; sans `isDialogOpen`) et `editorSessionStore` pour l'état complet de l'éditeur (`EditorState`).
  - **Survie à la navigation bilingue :** Lors de la navigation côté client entre `/fr` et `/en`, l'arbre React est démonté et remonté par Next.js, mais les modules JavaScript restent chargés en mémoire vive : les variables de module conservent leur valeur, ce qui permet à l'utilisateur de retrouver sa clé, son modèle et son travail en cours sans rupture.
  - **Disparition au rechargement :** Au rechargement complet de la page (F5 / Cmd+R) ou à la fermeture de l'onglet, l'environnement JavaScript repart de zéro et la session est vide. La promesse de confidentialité reste rigoureusement respectée : **aucun usage de `sessionStorage`, aucune écriture dans `localStorage`** pour les données non explicitement mémorisées.
  - **Zéro écart d'hydratation (SSR) :** La session n'est lue que pendant l'initialisation de l'état (`buildInitialState`), jamais dans le corps du rendu. Au premier chargement de la page, la session étant vide, le premier rendu client est strictement identique au rendu serveur.
  - **Action « Oublier la clé » :** Efface la clé du `localStorage` persistant ET de la mémoire de session `aiSettingsSessionStore`.
- **Champ de clé sans gestionnaire de mots de passe :** le champ de la clé est un champ texte masqué visuellement par CSS (`-webkit-text-security`) et non un champ mot de passe, pour que le gestionnaire de mots de passe du navigateur (qui ignore `autocomplete="off"` sur ces champs) ne propose pas de l'enregistrer après une génération.
- **Bouton d'en-tête :** Situé à droite avec le sélecteur de langue, avec indicateur textuel explicite (« Clé prête · Haiku 5.5 » ou « Clé manquante »).
- **Pop-up `<dialog>` natif sans défilement :**
  - Largeur d'environ 900 px (`w-[min(56rem,calc(100vw-3rem))]`) sur deux colonnes dès 768 px (clé à gauche, choix du modèle à droite).
  - Hauteur contenue sans barre de défilement verticale aux résolutions de bureau cibles (1280×720 et au-dessus).
  - Gestion du focus à l'ouverture : focus placé automatiquement sur le champ de clé si celui-ci est vide, ou sur le bouton « Terminé » si la clé est déjà configurée (éliminant l'anneau de focus sur la croix de fermeture).
- **Flux « clé absente » lors de la génération :**
  1. L'utilisateur clique sur « Générer les questions » sans clé renseignée.
  2. La validité de la description est contrôlée en premier. Si invalide, l'erreur s'affiche sans ouvrir le dialogue.
  3. Si la description est valide, `pendingGenerateRef` est armé à `true` et le pop-up `AiSettingsDialog` s'ouvre avec le bandeau d'invite (« Ajoute ta clé Claude pour générer les questions »).
  4. À la fermeture du pop-up : si une clé valide est présente, la génération est déclenchée **automatiquement une seule fois** ; sans clé, l'action est annulée et `pendingGenerateRef` est réinitialisé à `false`.

```mermaid
graph TD
  A["Écran d'Accueil (/fr ou /en)"] -->|Choix A: Modèle prêt à l'emploi| B["Chargement de la spec modèle"]
  A -->|Choix B: Créer à la main| C["Spec par défaut (1 champ 'message')"]
  A -->|Choix C: Décrire son besoin| D["Saisie description dans Étape 1"]
  
  D -->|Clic Générer sans clé| D1["Ouverture AiSettingsDialog + invite"]
  D1 -->|Saisie clé + Fermeture dialog| D2["Génération auto unique (fromPending)"]
  D -->|Clic Générer avec clé prête| D2
  
  D2 -->|POST direct api.anthropic.com| E{"Appel Claude (tool submit_questions)"}
  E -->|Succès parseGeneratedQuestions| F["Injection dans Spec (questions + usage)"]
  E -->|Échec bad_output (tentative 1)| G1["Relance automatique unique avec erreurs de validation"]
  G1 --> E
  E -->|Erreur 401/403/400/429/529/bad_output final| G2["Affichage Erreur spécifique dict.generation.errors"]

  B --> H["Étape 2 : Espace de travail (Ajuste)"]
  C --> H
  F --> H

  H -->|Action utilisateur: Renommer champ| I["renameField: MAJ questions et `champs`"]
  I --> H

  H --> J["Validateur Spec (Temps réel)"]
  J -->|Erreurs: nom invalide, score hors bornes| K["Erreurs bloquantes, Copie désactivée"]
  J -->|Warning: question sans `champ` cité| L["Avertissement informatif"]
  J -->|Conforme| M["Générateurs"]

  M --> N["Étape 3 : Résultat JSON pleine largeur (Copie)"]
  N -->|IntersectionObserver: Résultat hors écran| BAR["Barre d'action fixe en bas"]
  BAR -->|Clic 'Voir le résultat'| N
  BAR -->|Clic 'Copier'| P["Clipboard API"]

  N -->|Clic Bouton Copier| P
  P -->|Succès| Q["Bouton 'Copié' (coche 1.6s)"]
  P -->|Refus permissions| R["Fallback execCommand"]
```

### C. Erreurs possibles et affichage UI :
- `Claude 401 Unauthorized (invalid_key)` : Encadré sous le champ de clé ("Clé invalide ou expirée").
- `Claude 403 Forbidden (forbidden)` : Droits d'accès insuffisants ou clé restreinte.
- `Claude 400 Billing (billing)` : Crédits Anthropic insuffisants, invitant à recharger sur la console.
- `Claude 400 Bad Request (bad_request)` : Requête mal formée ou paramètres invalides.
- `Claude 404 Not Found (model_unavailable)` : Identifiant de modèle indisponible ou modifié, invitant à basculer sur l'autre modèle.
- `Claude 429 Rate limit (rate_limited)` : Quota temporairement dépassé ("Limite atteinte, réessaie dans quelques instants").
- `Claude 529 / 5xx Overloaded (overloaded)` : Service Anthropic temporairement surchargé.
- `Réseau / Déconnexion (network)` : Erreur réseau ou coupure de connexion.
- `Interruption (aborted)` : Génération annulée par l'utilisateur.
- `Délai maximal (timeout)` : 60 secondes écoulées sans réponse complète de l'API Claude.
- `Refus documenté (refused)` : Le modèle a refusé de traiter la demande (`stop_reason: 'refusal'`), sans relance automatique ("Claude n'a pas pu traiter cette description. Reformule ton besoin.").
- `Sortie inexploitable (bad_output)` : Absence d'appel d'outil, dépassement de max_tokens (4096), JSON inexploitable ou spec invalide. **Une seule relance automatique** injectant la liste des erreurs de validation (et rejet des citations de champs inconnus à la 1re tentative) ; usage cumulé sur les deux tentatives ; si le second appel échoue, erreur signalée à l'utilisateur sans relance supplémentaire.
- `Validation Jev bloquante` (nom de champ non-ASCII, doublon, score < 2 ou > 10 niveaux) : Message d'erreur explicite sous le champ fautif, bouton de copie désactivé.
- `Avertissement Jev` (champ non cité dans une question multi-champs) : Badge ambré non bloquant indiquant que Jev analysera l'objet complet.
- `Refus Clipboard` : Sélection automatique du texte JSON dans un conteneur visible avec consigne `Ctrl+C`.

---

## 5. Langues (FR / EN)

- **Structure des routes :**
  - `/fr` et `/en` : Pages statiques pré-rendues au build via `output: 'export'` (éditeur et accueil).
  - `/fr/demo` et `/en/demo` : Route de démonstration animée « Comment ça marche ? » pré-rendue statiquement au build, avec balises canonical et hreflang dédiées.
  - `/` (racine) : Redirection gérée au niveau de la plateforme via `vercel.json` (aucun serveur ni middleware à l'exécution) :
    1. Règle avec condition `has` sur le cookie `easyjev_lang=fr` -> `/fr`.
    2. Règle avec condition `has` sur le cookie `easyjev_lang=en` -> `/en`.
    3. Règle avec condition `has` sur l'en-tête `Accept-Language` (`^fr`) -> `/fr`.
    4. Règle de repli par défaut vers `/en`.
    *(Note : Le filtrage regex précis sur `Accept-Language` dans `vercel.json` reste à valider en conditions réelles au premier déploiement de prévisualisation ; plan B disponible ci-dessous).*
    5. Hors Vercel (ou en développement, où `vercel.json` ne s'applique pas), la page de secours `src/app/(root)/page.tsx` affiche un lien vers chaque langue et `(root)/layout.tsx` redirige par `<meta http-equiv="refresh">` vers `/en` (filet de sécurité volontairement redondant).
- **Bascule FR/EN :** Contrôle segmenté dans l'en-tête qui met à jour le cookie `easyjev_lang` (`SameSite=Lax; Max-Age=31536000; path=/`) en JavaScript côté client et navigue vers l'autre route.
- **Dictionnaires typés :**
  ```typescript
  // src/modules/i18n/fr.ts exporte `fr` et le type `Dictionary` ; en.ts doit le satisfaire strictement (aucune divergence de clés)
  export function getDictionary(locale: Locale): Dictionary; // dictionaries.ts
  ```
- **SEO & hreflang :**
  - `<link rel="alternate" hreflang="fr" href="${NEXT_PUBLIC_SITE_URL}/fr" />`
  - `<link rel="alternate" hreflang="en" href="${NEXT_PUBLIC_SITE_URL}/en" />`
  - `<link rel="alternate" hreflang="x-default" href="${NEXT_PUBLIC_SITE_URL}/en" />`
  - Balise `<html lang="fr">` ou `<html lang="en">` générée dans le HTML statique de chaque page. Le domaine est injecté via la variable de configuration `NEXT_PUBLIC_SITE_URL` (domaine réel défini au jalon 7).

---

## 6. Confiance et sécurité

- **Rétention de la clé Claude en mémoire :**
  - La clé API réside exclusivement en mémoire vive : état React du fournisseur de réglages et mémoire de session JavaScript (`aiSettingsSessionStore`, variable de module) qui la conserve pendant les changements de langue.
  - Aucune persistance par défaut (effacée au rechargement de la page ou à la fermeture de l'onglet).
  - Option explicite « Mémoriser sur cet appareil » : enregistrement dans `localStorage` accompagné d'un message d'avertissement clair.
- **Protection et CSP :**
  - **Zéro serveur relais :** L'appel part directement du navigateur vers `https://api.anthropic.com/v1/messages`.
  - **Zéro script tiers :** Aucun traceur, pub, script analytics ni police externe (polices intégrées au build).
  - **Honnêteté sur la CSP :** Avec `'unsafe-inline'` requis sur `script-src` pour l'hydratation du framework, la politique ne peut pas être qualifiée d'étanche face à des scripts injectés. La sécurité repose concrètement sur :
    1. `connect-src 'self' https://api.anthropic.com` qui empêche toute exfiltration vers un serveur tiers ;
    2. L'absence absolue de dépendance ou script tiers exécuté ;
    3. Des restrictions sévères sur `img-src 'self' data:`, `form-action 'self'`, `base-uri 'self'`, et `object-src 'none'`.
    *(Note : L'usage de nonces ou hashes SHA-256 permettrait d'éliminer 'unsafe-inline', mais ajouterait une complexité significative sur un export statique pur).*
  - **Content Security Policy (en-tête HTTP dans `vercel.json`) :**
    ```http
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    font-src 'self';
    img-src 'self' data:;
    connect-src 'self' https://api.anthropic.com;
    object-src 'none';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    ```
  - **En-têtes de sécurité HTTP (`vercel.json`) :** `X-Content-Type-Options: nosniff` (protection contre le reniflage MIME), `Referrer-Policy: no-referrer` (aucun Referer sortant) et `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()` (accès matériel et APIs sensibles désactivés ; presse-papiers non bloqué pour préserver le bouton « Copier »).
  - **Liens externes (Dons, TypeSafe, Anthropic) :** Balises `<a>` munies de `rel="noopener noreferrer"`.
  - **Zéro clé dans les logs :** La clé n'apparaît jamais dans les URL, paramètres d'erreur, ni dans la console.

---

## 7. Questions ouvertes et challenge du brief

1. **Redirection racine `/` via `vercel.json` et Plan B :**  
   Le choix d'un export statique pur (`output: 'export'`) sans serveur implique de déléguer la redirection linguistique de la racine aux règles `has` de `vercel.json`. Le filtrage sur l'en-tête `Accept-Language` reste à tester lors du premier déploiement sur Vercel.  
   *Plan B :* Si le comportement d'en-tête s'avère incomplet sur Vercel Hobby en statique pur, nous basculerons sur un middleware Next.js standard (nommé `proxy.ts` depuis Next.js 16).
2. **Mode Expression n8n (test réel validé sur n8n 2.33.4) :**  
   Pour que l'expression n8n `{{ JSON.stringify($json.message) }}` (ou l'objet avec plusieurs champs) soit évaluée, le champ de n8n doit être en mode **Expression**. Le test réel pas à pas mené sur une instance réelle (n8n 2.33.4) a confirmé que coller le JSON dans un champ vide bascule automatiquement le champ en mode Expression (icône fx à gauche), colore l'expression et affiche correctement l'aperçu du texte entre guillemets. L'étape 5 de l'aide n8n adopte définitivement ce comportement constaté, tout en précisant la bascule manuelle en repli si le champ restait en texte simple.
3. **Modèles Claude Haiku et Sonnet :**  
   L'identifiant Haiku est `claude-haiku-5-5` depuis le 2026-10-19 (avant : `claude-haiku-4-5-20251001`) avec stratégie d'outil forcé (`forced-tool`). L'identifiant Sonnet 5.5 est confirmé (`claude-sonnet-5-5`) et testé avec une vraie clé (génération réussie, 2026-09-29), avec stratégie `auto-tool-strict` (`tool_choice: { type: 'auto' }`, `strict: true` sur le schéma d'outil avec `additionalProperties: false`, et réflexion adaptative `thinking: { type: 'between_tools' }`), suite au constat officiel du refus des outils forcés et de `thinking: disabled` sur ce modèle.
4. **Précision du remplacement lors du renommage de champ :**  
   Afin de ne pas altérer de sous-chaînes dans les questions (ex: renommer un champ `id` ne doit pas modifier le mot « idée »), le remplacement dans les instructions cible strictement le nom entouré de backticks via un découpage/recollage exact de chaîne : ``instructions.split(`\`${oldName}\``).join(`\`${newName}\``)``, garantissant l'absence de régression ou d'effet secondaire lié à des caractères spéciaux.
5. **Visibilité de la clé dans les DevTools :**  
   La clé part du navigateur de l'utilisateur directement vers Anthropic et n'est jamais envoyée à EasyJev ; elle est visible dans les outils de développement de son propre navigateur, comme toute requête réseau cliente. L'encadré de confiance doit le formuler avec cette même clarté.
6. **Schéma d'outil de génération plus étroit que les validateurs :**  
   Le schéma donné à Claude demande 2 à 8 choix par question et 3 à 5 niveaux de note, alors que les validateurs de la spec acceptent 2 à 255 choix et 2 à 10 niveaux (limites réelles de Jev). C'est volontaire : on guide le modèle vers des questions courtes et lisibles sans limiter ce que l'utilisateur peut saisir à la main.
7. **Tarifs des modèles codés en dur :**  
   `config.ts` contient les prix par million de tokens (Haiku 5.5 : 0,10 $ en entrée / 0,50 $ en sortie, relevés le 2026-10-19 ; Sonnet 5.5 : 2 $ / 10 $, relevés le 2026-09-28) utilisés par `estimateCostUsd`. Si Anthropic change sa grille, le coût affiché devient faux : à revérifier avant chaque publication.
