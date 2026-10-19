import { validationMessagesFr } from './validation-messages';
import type { ClaudeModelId } from '../claude-client';

export const fr = {
  meta: {
    title: 'EasyJev — Décris. Ajuste. Copie.',
    description:
      "Configure Jev sans écrire de JSON : décris ce qu'il doit décider, corrige, puis copie la requête pour ton workflow n8n.",
  },
  skipLink: 'Aller au contenu',
  header: {
    brand: 'EasyJev',
    langAriaLabel: "Langue de l'interface",
    howItWorksButton: 'Comment ça marche ?',
    howItWorksShort: 'Démo',
    howItWorksAriaLabel: 'Comment ça marche : voir la démo animée',
    aboutButton: 'À propos',
    aboutShort: 'Infos',
    aboutAriaLabel: 'À propos d’EasyJev : ce qu’est Jev, confiance et sécurité',
    aiSettings: {
      buttonLabel: 'Clé & modèle',
      buttonShort: 'Clé',
      keyReady: 'Clé prête',
      keyMissing: 'Clé manquante',
      done: 'Terminé',
      keyPrompt: 'Ajoute ta clé Claude pour générer les questions',
      modelLine: (modelLabel: string) => `Modèle : ${modelLabel} · Changer`,
    },
    languages: {
      fr: 'Français',
      en: 'English',
    },
  },
  footer: {
    productName: 'EasyJev',
    disclaimer: 'Outil indépendant, non affilié à TypeSafe AI.',
  },
  windows: {
    collapse: 'Réduire',
    expand: 'Ouvrir',
    close: 'Fermer',
    collapseAria: 'Réduire la fenêtre',
    expandAria: 'Agrandir la fenêtre',
    closeAria: 'Fermer la fenêtre',
    about: {
      title: 'explications.app',
      badge: 'v1.0 · SYSTEM ONE',
    },
    describe: {
      title: 'decris.app',
      badge: 'LANGAGE NATUREL & MODÈLES',
    },
    adjust: {
      title: 'ajuste.app',
      badge: (count: number) =>
        `ÉDITEUR 2 VOLETS · ${count} ${count > 1 ? 'QUESTIONS' : 'QUESTION'}`,
    },
    copy: {
      title: 'copie.app',
      badgeReady: 'JSON PRÊT',
      badgeBlocked: 'ATTENTION REQUISE',
    },
    settings: {
      title: 'reglages.app',
      badge: 'ANTHROPIC CLAUDE',
    },
    n8nHelp: {
      title: 'n8n-aide.app',
      badge: 'GUIDE INTÉGRATION',
    },
  },
  home: {
    title: 'Décris. Ajuste. Copie.',
    subtitle:
      "Configure Jev sans écrire de JSON : décris ce qu'il doit décider, corrige, puis copie la requête pour ton workflow n8n.",
    pitch: {
      heroLine:
        'Jev tranche en une fraction de seconde. EasyJev t’aide à lui parler avec tes propres mots.',
      jev: {
        title: 'C’est quoi Jev ?',
        text: 'Jev, c’est un modèle d’IA créé par TypeSafe AI, un labo de San Francisco. Ce n’est pas un chatbot : il lit du texte comme un LLM (ChatGPT, Claude…), mais au lieu d’écrire une réponse, il tranche. Tu lui donnes un texte et des questions, il répond par un choix, une note ou un oui/non, avec un niveau de confiance. D’après TypeSafe, c’est très rapide et très peu cher : idéal pour trier, router ou noter des messages dans un automatisme, là où un LLM serait trop lent, trop cher ou trop bavard.',
      },
      easy: {
        title: 'Et EasyJev, ça sert à quoi ?',
        text: 'Jev ne comprend qu’un format précis : du JSON avec ton texte et tes questions. EasyJev le fabrique pour toi. Tu décris avec tes mots ce que Jev doit décider, et une IA (Claude, d’Anthropic, avec ta propre clé) rédige les questions à ta place. Tu les ajustes si besoin, puis tu copies la requête, prête à coller dans ton workflow n8n ou dans tout outil qui envoie une requête web. Pas envie d’IA ? Pars d’un modèle ou crée tes questions à la main : ça marche sans clé.',
      },
    },
    templates: {
      sectionTitle: 'Pas de clé Claude ? Pars d’un modèle :',
      sectionSubtitle:
        'Démarre en un clic avec une configuration éprouvée, ou compose ta requête sur mesure.',
      custom: {
        title: 'Partir de zéro',
        description:
          'Pars d’une feuille vierge avec un champ par défaut et définis tes propres questions.',
        meta: 'Questions à la main',
      },
      items: {
        triage: {
          title: 'Trier les demandes clients',
          description:
            'Classifie le motif de chaque demande et évalue son degré d’urgence opérationnelle.',
        },
        urgence: {
          title: 'Détecter l’urgence',
          description:
            'Identifie les situations critiques et quantifie la priorité d’intervention.',
        },
        lead: {
          title: 'Qualifier un lead',
          description:
            'Évalue l’intention d’achat, la maturité du projet et le pouvoir de décision du contact.',
        },
        avis: {
          title: 'Analyser un avis client',
          description:
            'Mesure la tonalité, isole le sujet principal et filtre les demandes nécessitant une réponse.',
        },
      },
      templateMeta: (questionsCount: number, fieldsCount: number) =>
        `${questionsCount} question${questionsCount > 1 ? 's' : ''} · ${fieldsCount} champ${fieldsCount > 1 ? 's' : ''}`,
      confirmDialog: {
        title: 'Remplacer le contenu en cours ?',
        message:
          'Ton éditeur contient déjà du travail (questions ou champs modifiés). Continuer remplacera les champs et questions actuels.',
        confirm: 'Remplacer',
        cancel: 'Conserver mon travail',
      },
      templateLoaded: (title: string) => `Modèle chargé : ${title}`,
    },
    steps: {
      describe: 'Décris',
      adjust: 'Ajuste',
      copy: 'Copie',
      adjustSubtitle: 'Vérifie ce que Jev lit et retouche les questions.',
    },
    startingPoint: {
      sectionTitle: 'Point de départ',
      sectionSubtitle: 'Décris ce que Jev doit décider : Claude rédige les questions pour toi.',
      collapse: 'Réduire',
      expand: 'Ouvrir',
    },
  },
  trust: {
    sectionAriaLabel: 'Sécurité et transparence',
    data: {
      title: 'Où vont tes données ?',
      item1:
        'Sans génération, ce que tu saisis n’est envoyé à aucun serveur : tout reste dans ton navigateur.',
      item2:
        'Avec la génération, ta description, les noms de tes champs et ta clé partent directement vers api.anthropic.com, sans serveur EasyJev ni stockage.',
      item3:
        'Le traitement des données côté Anthropic dépend de tes conditions d’utilisation avec eux.',
    },
    key: {
      title: 'Où va ma clé ?',
      item1:
        'La clé n’est envoyée qu’à api.anthropic.com, dans un en-tête de chaque requête, via une connexion HTTPS.',
      item2:
        'Elle reste uniquement en mémoire (perdue à la fermeture de l’onglet) sauf si tu coches la mémorisation sur cet appareil.',
      item3:
        'Comme toute requête faite depuis ton navigateur, elle est visible dans les outils de développement de ton propre navigateur.',
    },
    boundaries: {
      title: 'Ce qu’EasyJev ne fait pas',
      item1:
        'Ne génère pas de workflow n8n complet : seulement un nœud HTTP Request à coller (ou le corps JSON), sans jamais y mettre ta clé Jev.',
      item2: 'N’appelle pas l’API de Jev à ta place.',
      item3: 'Ne stocke pas tes questions, tes champs ni ta description.',
      item4: 'Ce qui reste à ta charge : conserver ta clé secrète dans tes identifiants n8n.',
    },
    recommendations: {
      title: 'Ce que nous te conseillons',
      item1: 'Crée une clé d’API dédiée à EasyJev dans la console Anthropic.',
      item2: 'Fixe-lui une limite de dépense dans la console pour garder le contrôle de ton budget.',
      item3: 'Révoque-la immédiatement si tu penses qu’elle a pu être exposée.',
      item4: 'Ne coche pas la mémorisation de la clé sur un appareil partagé.',
    },
  },
  donate: {
    title: 'Soutenir EasyJev',
    description:
      'EasyJev est un outil gratuit, sans publicité ni sponsor. Si ce projet t’est utile, tu peux soutenir son hébergement et son développement.',
    button: 'Faire un don',
    ariaLabel: 'Faire un don pour soutenir EasyJev (nouvelle fenêtre)',
  },
  generation: {
    ui: {
      cardSubtitle:
        'Décris ton cas d’usage, Claude propose des questions prêtes pour Jev.',
      descriptionLabel: 'Décris ce que Jev doit décider',
      descriptionPlaceholder:
        'Ex. : Jev doit trier les retours clients d’un restaurant en évaluant le sentiment (positif/négatif), identifier le plat mentionné et signaler si le client demande un remboursement.',
      charCount: (current: number, min: number, max: number) =>
        `${current} / ${max} caractères (min. ${min})`,
      fieldsReadPrefix: 'Jev lira :',
      fieldsLink: 'Modifier les champs',
      dataLabel: 'Tes données',
      dataOptional: 'facultatif',
      dataPlaceholder: 'Colle ici le JSON du panneau OUTPUT de ton nœud n8n…',
      dataHint:
        'Dans n8n, ouvre le nœud juste avant Jev, passe son panneau OUTPUT en vue JSON, copie tout et colle ici. Ce que tu colles reste dans ton navigateur : seuls les noms des champs partent vers Claude, jamais les valeurs.',
      dataDetected: (count: number) =>
        count > 1 ? `${count} champs détectés` : `${count} champ détecté`,
      dataFieldsAria: 'Champs détectés dans tes données',
      dataPickHint:
        'Rien de coché : Claude choisit les champs utiles. Coche des champs pour imposer ceux que Jev lit.',
      dataSkipped: (count: number) =>
        count > 1
          ? `${count} champs ignorés (contenu imbriqué ou nom non compatible)`
          : `${count} champ ignoré (contenu imbriqué ou nom non compatible)`,
      dataTruncated: (max: number) => `Seuls les ${max} premiers champs sont proposés.`,
      dataUseSelected: (count: number) => `Utiliser les champs cochés (${count})`,
      dataClear: 'Effacer les données',
      apiKeyLabel: 'Clé API Claude',
      apiKeyPlaceholder: 'sk-ant-...',
      showApiKey: 'Afficher la clé',
      hideApiKey: 'Masquer la clé',
      apiKeySoftWarning: 'La clé devrait commencer par sk-ant-',
      createApiKeyLink: 'Créer une clé dans la console Anthropic',
      apiKeyWhereSummary: 'Où va ma clé ?',
      apiKeyWhereDetails:
        'La clé n’est envoyée qu’à api.anthropic.com, dans un en-tête de chaque requête, via une connexion HTTPS. Elle reste en mémoire par défaut. Comme toute requête faite depuis ton navigateur, elle est visible dans tes outils de développement.',
      rememberKeyLabel: 'Mémoriser sur cet appareil',
      rememberKeyWarning:
        'La clé est stockée en clair dans le navigateur de cet appareil (localStorage). Tout script exécuté sur ce site pourrait la lire. Ne l’utilise pas sur un ordinateur partagé.',
      forgetKeyButton: 'Oublier la clé',
      modelSelectLabel: 'Modèle Claude',
      modelDescriptions: {
        'claude-haiku-5-5':
          'Rapide et économique, idéal pour la génération de questions structurées',
        'claude-sonnet-5-5':
          'Raisonnement approfondi pour cas complexes ou nuancés',
      } as Record<ClaudeModelId, string>,
      pricingIndicative: (input: number, output: number) =>
        `$${input} / $${output} par million de tokens`,
      generateButton: 'Générer les questions',
      generatingButton: 'Génération en cours…',
      cancelButton: 'Annuler',
      loadingState: 'Claude analyse ta description et formule les questions Jev…',
      cancelledAnnouncement: 'Génération annulée.',
      questionsGeneratedAnnouncement: (count: number) =>
        `${count} question${count > 1 ? 's' : ''} générée${count > 1 ? 's' : ''}`,
      costEstimate: (costFormatted: string, inputTokens: number, outputTokens: number) =>
        `Coût estimé : environ ${costFormatted} (${inputTokens} tokens en entrée, ${outputTokens} en sortie)`,
      generatedNotice: (count: number, modelLabel: string) =>
        `${count} question${count > 1 ? 's' : ''} générée${count > 1 ? 's' : ''} avec ${modelLabel}`,
      retryButton: 'Réessayer',
      openConsoleLink: 'Ouvrir la console Anthropic',
      technicalDetailsSummary: 'Détails techniques',
      technicalDetails: (status?: number, apiErrorType?: string) =>
        `HTTP ${status ?? '?'} · ${apiErrorType ?? 'inconnu'}`,
    },
    errors: {
      invalid_input:
        'La description doit comporter entre 10 et 4 000 caractères et la clé API doit être renseignée.',
      invalid_key:
        'Clé API Claude invalide ou expirée. Vérifie ta clé dans la console Anthropic.',
      forbidden:
        'Accès refusé par l’API Anthropic pour cette clé.',
      billing:
        'Crédits insuffisants sur ton compte Anthropic. Ajoute des crédits dans la console pour continuer.',
      bad_request:
        'L’API Claude a refusé la requête. Essaie avec l’autre modèle ou raccourcis ta description. Si le problème persiste, ouvre les détails techniques ci-dessous.',
      rate_limited:
        'Limite de requêtes atteinte. Patiente quelques secondes avant de réessayer.',
      overloaded:
        'Les serveurs d’Anthropic sont temporairement surchargés. Réessaie dans un instant.',
      network:
        'Impossible de joindre l’API Claude. Vérifie ta connexion Internet.',
      aborted:
        'Génération interrompue.',
      bad_output:
        'Claude n’a pas pu produire des questions conformes pour Jev. Modifie ta description ou configure-les à la main.',
      model_unavailable:
        'Ce modèle n’est pas accessible avec ta clé ou son identifiant a changé. Essaie de choisir l’autre modèle.',
      timeout:
        'Le délai maximal de 60 secondes est dépassé. Claude n’a pas répondu à temps, réessaie.',
      refused:
        'Claude n’a pas pu traiter cette description. Reformule ton besoin.',
    },
  },
  editor: {
    reads: {
      title: 'Ce que Jev lit',
      multipleFieldsHelp: 'Dans chaque question, cite le champ concerné entre accents graves (bouton « Insérer » au-dessus de la consigne).',
      singleFieldHelp:
        'C’est le champ du nœud précédent que Jev analyse. Clique sur son nom pour le renommer.',
      addField: 'Ajouter un champ',
      removeFieldAriaLabel: (name: string) => `Supprimer le champ ${name}`,
      fieldNameLabel: (name: string) => `Nom du champ ${name}`,
      importFromN8n: 'Importer depuis n8n',
      otherDetectedTitle: 'Aussi dans tes données :',
      addDetectedAria: (name: string) => `Ajouter le champ ${name} à ce que Jev lit`,
    },
    n8nImport: {
      errorTooLarge: 'Le texte collé dépasse la limite de 1 Mo.',
      errorInvalidJson: 'Le JSON est invalide. Vérifie que tu as bien tout copié.',
      errorNotObject: 'Les données collées ne contiennent pas d’objet.',
      errorEmpty: 'Aucune donnée ou aucun champ trouvé.',
      errorTableView:
        'Ce n’est pas du JSON. Tu as peut-être copié la vue Table : passe en vue JSON dans n8n.',
      remapTitle: 'Remplacer les champs cités dans tes questions',
      remapIntro:
        'Tes questions parlent de champs qui n’existent plus dans tes données. Choisis par quoi les remplacer, ou laisse tel quel pour les corriger toi-même.',
      remapCitedIn: (count: number) =>
        count > 1 ? `cité dans ${count} questions` : 'cité dans 1 question',
      remapLabel: 'Le remplacer par',
      remapKeep: 'Ne pas remplacer (je corrigerai moi-même)',
      remapNote: 'Seuls les noms écrits entre accents graves sont remplacés.',
      remapApply: 'Appliquer',
      remapCancel: 'Revenir',
    },
    questions: {
      sectionTitle: 'Questions pour Jev',
      listAriaLabel: 'Liste des questions pour Jev',
      selectedAnnouncement: (index: number, total: number) =>
        `Question ${index} sur ${total} sélectionnée`,
      detailHeading: (index: number, total: number, typeLabel: string) =>
        `Question ${index} sur ${total} · ${typeLabel}`,
      emptyState: {
        title: 'Ajoute ta première question',
        subtitle: 'Choisis le format qui correspond le mieux à ta décision :',
        choice: {
          title: 'Catégorie',
          description: 'Trier parmi plusieurs options mutuellement exclusives.',
          example: 'Ex. : Type de demande (devis, support, partenariat)',
          action: 'Créer une catégorie',
        },
        score: {
          title: 'Note',
          description: 'Évaluer un niveau sur une échelle ordonnée de 2 à 10.',
          example: 'Ex. : Urgence (faible, moyenne, critique)',
          action: 'Créer une note',
        },
        noul: {
          title: 'Oui / Non',
          description: 'Trancher une question binaire avec conditions facultatives.',
          example: 'Ex. : Le client demande-t-il un rappel ?',
          action: 'Créer un oui/non',
        },
      },
      addQuestion: '+ Ajouter une question',
      addQuestionAria: 'Ajouter une question : choisir son type',
      addButtons: {
        choice: '+ Catégorie',
        score: '+ Note',
        noul: '+ Oui / Non',
      },
      item: {
        newQuestionTitle: 'Nouvelle question',
        instructionLabel: 'Ta question pour Jev',
        instructionPlaceholder: "Ex. : Quel est l'objet principal de cette demande ?",
        typeLabel: 'Type de question',
        types: {
          choice: 'Catégorie',
          score: 'Note',
          noul: 'Oui / Non',
        },
        typeHelp: {
          choice: 'Définit des options mutuellement exclusives. Jev choisira la plus pertinente.',
          score: 'Évalue sur une échelle ordonnée de 2 à 10 niveaux.',
          noul: 'Question fermée oui/non. Précise si besoin les conditions.',
        },
        typeSummary: {
          choice: (count: number) => `Catégorie, ${count} option${count > 1 ? 's' : ''}`,
          score: (count: number) => `Note, ${count} niveau${count > 1 ? 'x' : ''}`,
          noul: () => 'Oui / Non',
        },
        errorsBadge: (count: number) =>
          count <= 1 ? `${count} erreur` : `${count} erreurs`,
        warningsBadge: (count: number) =>
          count <= 1 ? `${count} avertissement` : `${count} avertissements`,
        citation: {
          label: 'Citer un champ :',
        },
        choice: {
          optionKeyHeader: 'Option',
          optionDescHeader: 'Description (facultatif)',
          optionKeyPlaceholder: 'Ex. : devis',
          optionDescPlaceholder: 'Ex. : Demande de tarif ou proposition',
          addOption: 'Ajouter une option',
          removeOptionAria: (key: string) => `Supprimer l'option ${key || 'sans nom'}`,
        },
        score: {
          levelHeader: 'Niveaux ordonnés',
          levelPlaceholder: (index: number) => `Niveau ${index}`,
          addLevel: 'Ajouter un niveau',
          removeLevelAria: (index: number) => `Supprimer le niveau ${index}`,
        },
        noul: {
          trueLabel: 'Condition pour « Oui » (facultatif)',
          truePlaceholder: 'Ex. : Le texte contient une demande explicite',
          falseLabel: 'Condition pour « Non » (facultatif)',
          falsePlaceholder: 'Ex. : Aucune demande de rappel',
        },
        keySection: {
          advanced: 'Avancé : clé n8n',
          toggle: (key: string) => `Clé dans n8n : ${key}`,
          label: 'Clé technique dans le JSON',
          help: 'Lettres sans accent, chiffres et tirets bas sans commencer par un chiffre.',
        },
        actions: {
          duplicate: 'Dupliquer',
          delete: 'Supprimer',
          collapse: 'Replier la question',
          expand: 'Déplier la question',
        },
      },
    },
    output: {
      cardSubtitle: 'Copie le nœud, colle-le dans ton workflow n8n : la requête est déjà réglée.',
      copyNodeHint:
        'Le nœud contient toute la requête pour Jev. Il ne reste qu’à ajouter ta clé dans n8n (voir l’étape 2).',
      copyJsonOnly: 'Copier seulement le JSON',
      nextStepsTitle: 'Ensuite, dans n8n',
      copy: 'Copier le JSON',
      copied: 'Copié !',
      copyNode: 'Copier le nœud n8n',
      nodeCopied: 'Nœud copié !',
      showJson: 'Voir le JSON',
      copyNodeDisabledNotice: 'Corrige les erreurs bloquantes ci-dessous pour copier le nœud n8n.',
      blockingErrorsTitle: 'Erreurs à corriger',
      warningsTitle: 'Avertissements',
      helpButtonText: 'Configuration manuelle et dépannage',
      barSummaryReady: (count: number) =>
        `${count} question${count > 1 ? 's' : ''} · JSON prêt`,
      barSummaryErrors: (count: number) =>
        `${count} erreur${count > 1 ? 's' : ''} à corriger`,
      barViewResult: 'Voir le résultat',
      barAriaLabel: 'Résumé et actions de copie',
      barReset: 'Tout effacer',
      resetConfirmTitle: 'Tout réinitialiser ?',
      resetConfirmMessage:
        'Les champs, les questions et la description en cours seront effacés. Ta clé Claude et ton modèle ne sont pas touchés.',
      resetConfirmAction: 'Réinitialiser',
      resetConfirmCancel: 'Conserver mon travail',
    },
    help: {
      closeAria: 'Fermer le panneau d’aide',
      copyNode: 'Copier le nœud n8n',
      nodeCopied: 'Nœud copié !',
      provider: {
        legend: 'Ton accès à Jev',
        typesafe: 'Clé TypeSafe',
        vercel: 'Vercel AI Gateway',
        modelLabel: 'Modèle',
        copied: 'Copié !',
      },
      shortSteps: {
        title: 'Configurer Jev en 4 étapes simples',
        step1: {
          title: '1. Colle le nœud',
          desc: 'Clique sur la toile du workflow n8n, puis fais **Ctrl+V** (**Cmd+V** sur Mac). Un nœud « Jev » apparaît avec tous ses réglages. Relie-le au nœud qui fournit le texte à analyser.',
        },
        step2: {
          title: '2. Ajoute ta clé (une seule fois)',
          desc: 'Ouvre le nœud ; dans **Credential for Header Auth**, choisis **Create new credential** ; renseigne **Name** = `Authorization` et **Value** = `Bearer ` (avec l’espace) suivi de ta clé, puis clique sur **Save**. Précision : la clé reste dans les accès enregistrés de n8n, jamais dans EasyJev ni dans le nœud copié.',
          descTypesafe:
            'Ouvre le nœud ; dans **Credential for Header Auth**, choisis **Create new credential** ; renseigne **Name** = `Authorization` et **Value** = `Bearer ` (avec l’espace) suivi de ta clé TypeSafe (obtenue sur console.typesafe.ai), puis clique sur **Save**. Précision : la clé reste dans les accès enregistrés de n8n, jamais dans EasyJev ni dans le nœud copié.',
          descVercel:
            'Ouvre le nœud ; dans **Credential for Header Auth**, choisis **Create new credential** ; renseigne **Name** = `Authorization` et **Value** = `Bearer ` (avec l’espace) suivi de ta clé Vercel AI Gateway, puis clique sur **Save**. Précision : la clé reste dans les accès enregistrés de n8n, jamais dans EasyJev ni dans le nœud copié.',
        },
        step3: {
          title: '3. Vérifie',
          desc: 'Dans le champ **JSON**, l’icône `fx` est active et l’aperçu montre ton texte entre guillemets (le nœud lit le champ du nœud précédent : le nom du champ doit exister dans ses données).',
        },
        step4: {
          title: '4. Lire les réponses',
          desc: 'Chaque question produit un résultat exploitable directement dans les nœuds suivants (If, Switch, etc.) :',
        },
      },
      manual: {
        title: 'Configurer à la main (si le collage ne marche pas)',
        summary: 'Afficher les 14 étapes de configuration manuelle',
      },
      steps: {
        title: 'Les 14 étapes de configuration',
        groups: {
          node: 'Bloc 1 — Le nœud',
          auth: 'Bloc 2 — La clé (l’authentification)',
          headers: 'Bloc 3 — L’en-tête qui dit « c’est du JSON »',
          body: 'Bloc 4 — Le contenu envoyé',
          reading: 'Bloc 5 — Lire les réponses',
        },
        step1: {
          title: '1. Ajouter un nœud HTTP Request',
          desc: 'Dans ton workflow n8n, insère un nœud **HTTP Request**. C’est le nœud qui envoie la requête (la demande) à Jev.',
        },
        step2: {
          title: '2. Méthode POST',
          desc: 'Dans **Method**, choisis **POST** pour transmettre les données à évaluer.',
        },
        step3: {
          title: '3. Adresse de Jev (URL)',
          desc: 'Dans **URL**, colle l’adresse de Jev selon le fournisseur choisi plus haut : `https://api.typesafe.ai/v1/systemone` (TypeSafe) ou `https://ai-gateway.vercel.sh/typesafe/v1/systemone` (Vercel AI Gateway).',
          descTypesafe:
            'Dans **URL**, colle l’adresse de l’API TypeSafe : `https://api.typesafe.ai/v1/systemone` (ou clique sur **Copier l’URL** plus haut).',
          descVercel:
            'Dans **URL**, colle l’adresse de la passerelle Vercel : `https://ai-gateway.vercel.sh/typesafe/v1/systemone` (ou clique sur **Copier l’URL** plus haut).',
        },
        step4: {
          title: '4. Authentification générique',
          desc: 'Dans **Authentication**, choisis **Generic Credential Type**.',
        },
        step5: {
          title: '5. Type d’accès Header Auth',
          desc: 'Dans **Generic Auth Type**, choisis **Header Auth** pour transmettre ta clé dans un en-tête HTTP.',
        },
        step6: {
          title: '6. Créer et enregistrer l’accès',
          desc: 'Crée l’accès : **Name** = `Authorization`, **Value** = `Bearer ` suivi de ta clé (TypeSafe ou Vercel AI Gateway selon ton choix), puis clique sur **Save**. Ta clé reste enregistrée dans n8n et n’est jamais transmise à EasyJev.',
          descTypesafe:
            'Crée l’accès : **Name** = `Authorization`, **Value** = `Bearer ` suivi de ta clé TypeSafe (obtenue sur console.typesafe.ai), puis clique sur **Save**. Ta clé reste enregistrée dans n8n et n’est jamais transmise à EasyJev.',
          descVercel:
            'Crée l’accès : **Name** = `Authorization`, **Value** = `Bearer ` suivi de ta clé Vercel AI Gateway, puis clique sur **Save**. Ta clé reste enregistrée dans n8n et n’est jamais transmise à EasyJev.',
        },
        step7: {
          title: '7. Activer les en-têtes',
          desc: 'Active **Send Headers**. Un en-tête (header) est une métadonnée qui décrit l’envoi à l’API.',
        },
        step8: {
          title: '8. Spécifier les champs d’en-tête',
          desc: 'Dans **Specify Headers**, choisis **Using Fields Below** pour définir l’en-tête manuellement.',
        },
        step9: {
          title: '9. Ajouter l’en-tête Content-Type',
          desc: 'Dans **Headers**, ajoute une ligne avec **Name** = `Content-Type` et **Value** = `application/json`. Cela prévient Jev que le contenu envoyé est au format JSON.',
        },
        step10: {
          title: '10. Activer le corps de requête',
          desc: 'Active **Send Body**. Le corps (body) est le contenu principal transmis à Jev (les champs à analyser et tes questions).',
        },
        step11: {
          title: '11. Type de contenu JSON',
          desc: 'Dans **Body Content Type**, choisis **JSON**.',
        },
        step12: {
          title: '12. Spécifier le corps en JSON',
          desc: 'Dans **Specify Body**, choisis **Using JSON** pour coller directement le JSON produit par EasyJev.',
        },
        step13: {
          title: '13. Coller le JSON en mode Expression',
          desc: 'Dans **JSON**, colle le JSON copié depuis EasyJev. Au collage, n8n bascule seul le champ en mode Expression (icône `fx` à gauche, vérifié sur n8n 2.33.4). Une expression n8n (notée entre doubles accolades `{{ ... }}`) calcule dynamiquement la valeur au moment de l’exécution. Vérifie l’aperçu sous le champ : il doit afficher ton texte entre guillemets. Si le champ reste en texte simple, clique sur l’icône `fx` pour passer en Expression à la main. Avec plusieurs champs, chacun a sa propre expression (ex. : `{{ JSON.stringify($json.message) }}`).',
        },
        step14: {
          title: '14. Lire les réponses',
          desc: 'Chaque question produit un résultat exploitable directement dans les nœuds suivants (If, Switch, etc.) :',
          copyExpr: 'Copier',
          copied: 'Copié !',
          answerYes: 'Oui',
          answerNo: 'Non',
          answerMaybe: 'Peut-être',
          yesNoLabel: 'En texte « Oui » ou « Non » :',
          thresholdNote:
            'Jev renvoie un nombre : sa certitude que la réponse est « oui ». Pour régler les seuils (0,5 ; ou 0,7 et 0,3), change les chiffres dans l’expression.',
          typeExpl: {
            noul: 'Valeur numérique de 0 à 1 (ex. : à tester avec > 0.5 dans un nœud If)',
            choice: 'Option retenue (.choice) et indice de confiance (.confidence)',
            score: 'Score numérique (.score) et détail des probabilités',
          },
        },
        emptyReadingHelp:
          'Configure des questions valides dans l’éditeur pour afficher les expressions de lecture adaptées à ton cas.',
      },
      troubleshooting: {
        title: 'Si ça ne marche pas',
        errPaste:
          'Si le collage ne fait rien ou si n8n signale un nœud inconnu : déplie la section « Configurer à la main » ci-dessus pour régler le nœud pas à pas.',
        errBody:
          'Corps illisible ou vide : vérifie l’en-tête Content-Type (étapes 7 à 9) et que le champ JSON est bien en mode Expression (étape 13).',
        err401: '401 : Clé API absente, mal renseignée ou expirée.',
        err422: '422 : Corps de requête mal formé (modèle manquant ou échelle hors limite 2-10).',
        err429: '429 / 529 : Quotas atteints ou service temporairement surchargé.',
        testCmdTitle: 'Vérification rapide de ta clé :',
        testCmd: 'curl -H "Authorization: Bearer <CLE>" https://api.typesafe.ai/v1/models',
      },
    },
  },
  demo: {
    meta: {
      title: 'Comment ça marche ? — Démo interactive EasyJev',
      description:
        'Découvre en 30 secondes comment EasyJev configure Jev pour tes workflows n8n, sans écrire de JSON.',
    },
    title: 'Comment ça marche ?',
    subtitle:
      'De ton besoin à une décision dans n8n, sans écrire de JSON.',
    notice: 'Démo : données fictives, aucune connexion à n8n ni à Claude.',
    controls: {
      play: 'Lecture',
      pause: 'Pause',
      replay: 'Rejouer',
      stepAria: (index: number, title: string) => `Étape ${index} : ${title}`,
      stepsNavAria: 'Étapes de la démo',
    },
    scenes: {
      hook: {
        title: '1. Le besoin',
        legend: 'Jev tranche vite, mais il attend un JSON très précis. EasyJev l’écrit à ta place.',
      },
      describe: {
        title: '2. Décrire',
        legend: 'Décris ce que Jev doit décider et colle tes données : EasyJev détecte les champs.',
      },
      adjust: {
        title: '3. Ajuster',
        legend: 'Claude propose les questions. Tu les retouches en un clic si besoin.',
      },
      copy: {
        title: '4. Copier le nœud',
        legend: 'Un clic : le nœud n8n complet est copié, requête comprise.',
      },
      run: {
        title: '5. Coller et lancer',
        legend: 'Colle le nœud dans ton workflow, ajoute ta clé et exécute.',
      },
      result: {
        title: '6. Résultat',
        legend: 'Jev répond pour chaque ligne. Une expression prête à copier aiguille ton flux.',
      },
    },
    stage: {
      workflowPane: 'Ton workflow',
      easyjevPane: 'EasyJev',
      hookLine1: 'Trier des messages, qualifier des leads, noter des avis…',
      hookLine2: 'Jev tranche en une fraction de seconde.',
      hookLine3: 'Mais il ne comprend qu’un JSON très précis.',
      hookLine4: 'EasyJev l’écrit pour toi.',
      pending: 'à décider',
      nodeTable: 'Tableur',
      nodeTableSub: 'Sortie brute',
      nodeJev: 'Jev',
      nodeJevSub: 'Décision',
      statusOk: 'OK',
      outputLabel: 'OUTPUT (JSON)',
      itemsCount: (count: number) =>
        count > 1 ? `${count} éléments` : `${count} élément`,
      dropHere: 'Ctrl+V',
      promptLabel: 'Décris ce que Jev doit décider',
      charCount: (count: number) => `${count} car.`,
      dataLabel: 'Tes données',
      fieldDetected: 'Champs détectés :',
      generate: 'Générer les questions',
      generating: 'Génération…',
      readsField: 'Jev lit :',
      q1Type: 'Catégorie',
      q1Title: 'Genre du jeu',
      q1Instruction: 'Dans quelle catégorie se classe le jeu `game` ?',
      q1Options: ['RPG', 'Course', 'Simulation'],
      q2Type: 'Oui / Non',
      q2Title: 'Succès confirmé',
      q2Instruction: 'Le jeu `game` dépasse-t-il les 1000 avis ?',
      q2True: 'Oui',
      q2False: 'Non',
      addOption: '+ option',
      provider: 'Clé TypeSafe',
      copyNode: 'Copier le nœud n8n',
      nodeCopied: 'Nœud copié !',
      tokenHint: 'Ajoute ta clé',
      runWorkflow: 'Exécuter le workflow',
      resultTitle: 'Résultat',
      readTitle: 'Dans le nœud suivant',
      routeYes: 'Mettre en avant',
      routeNo: 'Archiver',
      outroLine: 'Sans écrire une ligne de JSON.',
    },
    tryButton: 'Essayer EasyJev',
    tryAriaLabel: 'Aller à l’éditeur EasyJev',
  },
  validation: validationMessagesFr,
};

export type Dictionary = typeof fr;
