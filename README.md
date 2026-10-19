# EasyJev

**Describe. Adjust. Copy.** Set up **Jev**, TypeSafe AI's decision model, in your n8n workflows without writing JSON.

🌐 **[easyjev.vercel.app](https://easyjev.vercel.app)** · [English](#english) · [Français](#français)

---

## English

You describe in plain words what Jev should decide. EasyJev turns it into a ready-to-paste n8n node.

### Features

- **1. Describe** — Write your need ("sort customer emails by type and urgency"). Optionally paste your n8n node's OUTPUT: EasyJev detects the fields and Claude picks the relevant ones. Claude then drafts the questions for Jev.
- **Ready-made templates** — Triage requests, detect urgency, qualify a lead, analyse a review, or start from scratch. No API key needed.
- **2. Adjust** — Edit what Jev reads and the questions, in three formats: **Category** (pick one option), **Rating** (ordered scale), **Yes / No** (with optional conditions). Errors are flagged as you type.
- **3. Copy** — Choose your Jev access (TypeSafe key or Vercel AI Gateway) and copy a complete n8n node: URL, headers and body are already set. Paste it into n8n with Ctrl/Cmd+V.
- **Read the answers** — Ready-to-copy n8n expressions for each question, including Yes / No turned into text.
- **Built-in help** — Step-by-step n8n setup, manual configuration and troubleshooting.
- **Interactive demo** — A 30-second animated walkthrough on the "How it works?" page.
- **French and English** — Language detected from your browser, switchable anytime.

### Privacy

- No EasyJev server, no account, no database: everything runs in your browser.
- Only the **names** of your fields go to Claude, never their values.
- Your Claude key goes straight from your browser to Anthropic. It stays in memory unless you choose to remember it on your device.
- Claude models: Haiku 5.5 (default) or Sonnet 5.5. Generating questions costs a fraction of a cent.

Technical details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

### License

© 2026 EasyJev Authors · All rights reserved ([`LICENSE`](LICENSE))

---

## Français

Tu décris en quelques mots ce que Jev doit décider. EasyJev en fait un nœud n8n prêt à coller.

### Fonctionnalités

- **1. Décris** — Écris ton besoin (« trier les e-mails clients par type et par urgence »). Tu peux coller la sortie OUTPUT de ton nœud n8n : EasyJev repère les champs et Claude choisit les bons. Claude rédige ensuite les questions pour Jev.
- **Modèles prêts à l'emploi** — Trier les demandes, détecter l'urgence, qualifier un lead, analyser un avis, ou partir de zéro. Aucune clé nécessaire.
- **2. Ajuste** — Modifie ce que Jev lit et les questions, en trois formats : **Catégorie** (une option parmi plusieurs), **Note** (échelle ordonnée), **Oui / Non** (avec conditions facultatives). Les erreurs s'affichent au fil de la saisie.
- **3. Copie** — Choisis ton accès à Jev (clé TypeSafe ou Vercel AI Gateway) et copie un nœud n8n complet : adresse, en-têtes et contenu sont déjà réglés. Colle-le dans n8n avec Ctrl/Cmd+V.
- **Lire les réponses** — Expressions n8n prêtes à copier pour chaque question, y compris Oui / Non converti en texte.
- **Aide intégrée** — Mise en place pas à pas dans n8n, configuration manuelle et dépannage.
- **Démo interactive** — Une animation de 30 secondes sur la page « Comment ça marche ? ».
- **Français et anglais** — Langue détectée depuis ton navigateur, modifiable à tout moment.

### Confidentialité

- Aucun serveur EasyJev, aucun compte, aucune base de données : tout se passe dans ton navigateur.
- Seuls les **noms** de tes champs partent vers Claude, jamais leurs valeurs.
- Ta clé Claude va directement de ton navigateur à Anthropic. Elle reste en mémoire, sauf si tu choisis de la mémoriser sur ton appareil.
- Modèles Claude : Haiku 5.5 (par défaut) ou Sonnet 5.5. Une génération coûte une fraction de centime.

Détails techniques : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

### Licence

© 2026 EasyJev Authors · Tous droits réservés ([`LICENSE`](LICENSE))
