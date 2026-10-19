# EasyJev

[English](#english) | [Français](#français)

---

## English

EasyJev is a lightweight, single-page web assistant (in French and English) that lets anyone configure **Jev** (TypeSafe AI's judgment and decision model) without writing JSON by hand.

### How it works

1. **Describe:** Write in your own words what Jev should decide and, optionally, paste the JSON from your n8n node's OUTPUT panel. One click on "Generate" lets Claude write the questions and pick the useful fields (only the field names are sent to Claude, never the values). You can also start from a ready-to-use template or build the questions by hand, without any key.
2. **Adjust:** Fine-tune the questions (category, rating scale, yes/no), the fields Jev reads (with a list of the other detected fields) and the technical details, with real-time validation.
3. **Copy:** Copy the ready-to-paste n8n node (or the Jev request JSON). The embedded help covers adding your key, reading the answers and turning yes/no numbers into text. An "About" window explains what Jev is and how your data and key are handled.

### Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run typecheck`: Runs strict TypeScript type checking (`tsc --noEmit`).
- `npm run lint`: Runs ESLint CLI across the codebase.
- `npm run test`: Runs the Vitest automated test suite.
- `npm run build`: Generates the static export in the `out/` directory.

### Environment Variables

EasyJev uses a single environment variable for canonical and hreflang meta tags:

- `NEXT_PUBLIC_SITE_URL`: Base URL of the website.
  - In local development: `http://localhost:3000` (defaults to empty string if omitted).
  - In production (`VERCEL_ENV=production`): **Mandatory**. Must start with `https://` and must not contain a trailing slash (e.g., `https://easyjev.com`). The build will intentionally fail if this requirement is not met.

See `.env.example` for details.

### Project Structure

```text
src/
├── app/                  # Next.js App Router (static routes /fr, /en, root)
├── components/           # React UI components (editor, generation, templates, trust)
├── config/               # Application configuration and external links
├── lib/                  # Browser utilities (clipboard, key storage)
└── modules/              # Pure, testable business logic
    ├── ai-settings/      # Shared AI settings state (key, model) and in-memory session store
    ├── claude-client/    # Direct browser client for Anthropic Claude API
    ├── editor/           # Pure state reducer and question management
    ├── generators/       # Jev JSON payload and n8n expression generators
    ├── i18n/             # Typed French and English dictionaries and SEO metadata
    ├── spec/             # Spec types, key derivation, and field renaming
    ├── templates/        # Ready-to-use domain templates (triage, urgency, lead, review)
    └── validators/       # Strict validation rules according to Jev specifications
```

### Configuration & Customization

- **Claude Models:** Model identifiers, pricing, and request strategies are defined in [`src/modules/claude-client/config.ts`](src/modules/claude-client/config.ts).
- **Donation Link:** The donation link (GitHub Sponsors, Buy Me a Coffee) is configured in [`src/config/links.ts`](src/config/links.ts) via `DONATION_URL`. If left empty, the support card remains hidden.

### Deployment on Vercel

EasyJev is configured for static export (`output: 'export'`) on Vercel's Hobby plan:

- Pre-rendered static HTML/CSS/JS deployed to global CDN.
- Root language detection and redirects managed via platform rules in `vercel.json`.
- A Content Security Policy (CSP) restricts where the page may send data, with no external script dependencies. It still allows inline scripts, a known limit documented in `docs/ARCHITECTURE.md`.

### Privacy and Security

- **Zero EasyJev Servers:** EasyJev has no backend, no database, and no accounts. All configuration logic runs entirely in your browser.
- **Direct Claude API Calls:** When generating questions with AI, your Claude API key is sent directly from your browser to `https://api.anthropic.com/v1/messages` via an encrypted HTTPS connection. It is never transmitted to EasyJev; the only third party that receives it is Anthropic, the recipient of the request.
- **In-Memory by Default:** Your API key stays in memory during your session and is discarded when the tab is closed or the page is reloaded. If you choose the optional "Remember on this device" setting, the key is saved in your browser's `localStorage`.
- **Honest Security Posture:** No system is 100% invulnerable. Like any client-side web application, network requests can be inspected in your browser's developer tools. We recommend creating a dedicated Anthropic API key with spend limits.

### License

All rights reserved. Copyright © 2026 EasyJev Authors. The source code is visible but no right to reuse it is granted without written permission. See [`LICENSE`](LICENSE).

---

## Français

EasyJev est un assistant web d'une seule page (en français et en anglais) qui permet à quiconque de configurer **Jev** (le modèle de jugement et de décision de TypeSafe AI) sans écrire de JSON à la main.

### Fonctionnement

1. **Décrire :** Écris avec tes mots ce que Jev doit décider et, si tu veux, colle le JSON du panneau OUTPUT de ton nœud n8n. Un clic sur « Générer » : Claude rédige les questions et choisit les champs utiles (seuls les noms des champs partent vers Claude, jamais les valeurs). Tu peux aussi partir d'un modèle prêt à l'emploi ou créer les questions à la main, sans clé.
2. **Ajuster :** Affine les questions (catégorie, note, oui/non), les champs que Jev lit (avec la liste des autres champs détectés) et les détails techniques, avec validation en temps réel.
3. **Copier :** Copie le nœud n8n prêt à coller (ou le JSON de la requête Jev). L'aide intégrée explique l'ajout de la clé, la lecture des réponses et la transformation des nombres oui/non en texte. Une fenêtre « À propos » explique ce qu'est Jev et le traitement de tes données et de ta clé.

### Démarrage rapide

```bash
# Installation des dépendances
npm install

# Lancement du serveur local
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

### Scripts disponibles

- `npm run dev` : Lance le serveur de développement Next.js.
- `npm run typecheck` : Vérifie strictement les types TypeScript (`tsc --noEmit`).
- `npm run lint` : Exécute ESLint CLI sur l'ensemble du projet.
- `npm run test` : Lance la suite de tests automatisés Vitest.
- `npm run build` : Génère l'export statique dans le dossier `out/`.

### Variables d'environnement

EasyJev utilise une variable d'environnement pour renseigner les balises canoniques et hreflang :

- `NEXT_PUBLIC_SITE_URL` : URL de base du site.
  - En développement local : `http://localhost:3000` (chaîne vide par défaut si omise).
  - En production (`VERCEL_ENV=production`) : **Obligatoire**. Doit obligatoirement commencer par `https://` et ne pas comporter de slash final (ex. : `https://easyjev.com`). Le build échouera explicitement si cette condition n'est pas remplie.

Consulte `.env.example` pour plus de précisions.

### Structure du projet

```text
src/
├── app/                  # Next.js App Router (routes statiques /fr, /en, redirection racine)
├── components/           # Composants React accessibles (éditeur, génération, modèles, confiance)
├── config/               # Configuration et liens externes
├── lib/                  # Utilitaires navigateur (presse-papier, stockage de clé)
└── modules/              # Logique métier pure et testée
    ├── ai-settings/      # État des réglages IA partagés (clé, modèle) et mémoire de session
    ├── claude-client/    # Client navigateur direct vers l'API Claude d'Anthropic
    ├── editor/           # Réducteur d'état pur et gestion des questions
    ├── generators/       # Générateur de corps JSON Jev et expressions de lecture n8n
    ├── i18n/             # Dictionnaires typés FR/EN et métadonnées SEO
    ├── spec/             # Types de la spec, dérivation de clés et renommage de champs
    ├── templates/        # Modèles prêts à l'emploi (triage, urgence, lead, avis)
    └── validators/       # Règles de validation strictes conformes aux contrats Jev
```

### Configuration et personnalisation

- **Modèles Claude :** Les identifiants de modèles, la tarification indicative et les stratégies de requête sont configurés dans [`src/modules/claude-client/config.ts`](src/modules/claude-client/config.ts).
- **Lien de soutien :** Le lien de don (GitHub Sponsors, Buy Me a Coffee) est paramétré dans [`src/config/links.ts`](src/config/links.ts) via `DONATION_URL`. S'il est vide, la carte de soutien reste masquée.

### Déploiement sur Vercel

EasyJev est configuré pour un export 100 % statique (`output: 'export'`) sur le plan Vercel Hobby :

- Pages HTML/CSS/JS pré-rendues au build et distribuées sur CDN global.
- Détection linguistique et redirections à la racine gérées par les règles de plateforme dans `vercel.json`.
- En-têtes Content Security Policy (CSP) : elle limite les destinations autorisées pour les données de la page, sans dépendance externe. Elle autorise encore les scripts intégrés à la page, limite connue documentée dans `docs/ARCHITECTURE.md`.

### Vie privée et sécurité

- **Zéro serveur EasyJev :** EasyJev n'a ni backend, ni base de données, ni système de comptes. Tout s'exécute localement dans ton navigateur.
- **Appels directs à l'API Claude :** Lors de la génération par description, ta clé API Claude part directement de ton navigateur vers `https://api.anthropic.com/v1/messages` via une connexion chiffrée HTTPS. Elle n'est jamais transmise à EasyJev ; le seul tiers qui la reçoit est Anthropic, destinataire de la requête.
- **En mémoire par défaut :** La clé reste en mémoire vive pendant ta session et disparaît à la fermeture de l'onglet ou au rechargement de la page. Si tu choisis l'option « Mémoriser sur cet appareil », elle est stockée dans le `localStorage` de ton navigateur.
- **Transparence sur la sécurité :** Aucun système n'est garanti à 100 %. Comme toute application web cliente, les requêtes réseau sont visibles dans les outils de développement de ton navigateur. Nous te conseillons d'utiliser une clé API Anthropic dédiée avec un plafond de dépense.

### Licence

Tous droits réservés. Copyright © 2026 EasyJev Authors. Le code source est consultable, mais aucun droit de réutilisation n'est accordé sans autorisation écrite. Voir [`LICENSE`](LICENSE).
