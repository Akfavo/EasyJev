import type { Locale } from '../i18n';
import type {
  SpecField,
  ChoiceQuestionSpec,
  ScoreQuestionSpec,
  NoulQuestionSpec,
} from '../spec';
import type { TemplateId, TemplateContent } from './types';

/**
 * Fournit le contenu d'un modèle prédéfini pour une langue donnée.
 * Les identifiants internes (id) sont générés par la fonction makeId fournie par l'appelant.
 * Les clés techniques de questions et d'options sont STRICTEMENT IDENTIQUES en FR et EN.
 * Chaque question cite au moins un champ entre accents graves.
 */
export function getTemplateContent(
  id: TemplateId,
  locale: Locale,
  makeId: () => string
): TemplateContent {
  switch (id) {
    case 'triage':
      return getTriageTemplate(locale, makeId);
    case 'urgence':
      return getUrgenceTemplate(locale, makeId);
    case 'lead':
      return getLeadTemplate(locale, makeId);
    case 'avis':
      return getAvisTemplate(locale, makeId);
  }
}

function getTriageTemplate(locale: Locale, makeId: () => string): TemplateContent {
  const isFr = locale === 'fr';

  const fields: SpecField[] = [
    {
      id: makeId(),
      name: 'message',
      exampleValue: isFr
        ? 'Bonjour, je souhaiterais obtenir un devis pour votre offre Entreprise.'
        : 'Hello, I would like to get a quote for your Enterprise plan.',
    },
  ];

  const question1: ChoiceQuestionSpec = {
    id: makeId(),
    type: 'choice',
    key: 'request_type',
    label: isFr ? 'Type de demande' : 'Request type',
    instructions: isFr
      ? 'Classer la nature de la demande exprimée dans le `message`.'
      : 'Classify the nature of the request expressed in the `message`.',
    isKeyCustomized: true,
    options: isFr
      ? [
          { key: 'billing', description: 'Factures, paiements ou remboursements' },
          { key: 'support', description: 'Assistance technique, bug ou panne' },
          { key: 'sales', description: 'Devis, tarif, contrat ou nouvelle offre' },
          { key: 'other', description: 'Demande générale ou inclassable' },
        ]
      : [
          { key: 'billing', description: 'Invoices, payments or refunds' },
          { key: 'support', description: 'Technical assistance, bug or outage' },
          { key: 'sales', description: 'Quote, pricing, contract or new plan' },
          { key: 'other', description: 'General inquiry or other' },
        ],
  };

  const question2: ScoreQuestionSpec = {
    id: makeId(),
    type: 'score',
    key: 'urgency',
    label: isFr ? 'Degré d’urgence' : 'Urgency level',
    instructions: isFr
      ? 'Évaluer le degré d’urgence exprimé dans le `message`.'
      : 'Evaluate the urgency level expressed in the `message`.',
    isKeyCustomized: true,
    levels: isFr
      ? ['Pas urgent', 'Plutôt urgent', 'Très urgent']
      : ['Not urgent', 'Somewhat urgent', 'Very urgent'],
  };

  return {
    fields,
    questions: [question1, question2],
  };
}

function getUrgenceTemplate(locale: Locale, makeId: () => string): TemplateContent {
  const isFr = locale === 'fr';

  const fields: SpecField[] = [
    {
      id: makeId(),
      name: 'message',
      exampleValue: isFr
        ? 'Notre plateforme de paiement est complètement bloquée depuis 10 minutes !'
        : 'Our payment platform is completely down for 10 minutes now!',
    },
  ];

  const question1: NoulQuestionSpec = {
    id: makeId(),
    type: 'noul',
    key: 'is_urgent',
    label: isFr ? 'Présence d’une urgence' : 'Urgency detection',
    instructions: isFr
      ? 'Le `message` exprime-t-il une urgence ?'
      : 'Does the `message` express urgency?',
    isKeyCustomized: true,
    criteria: isFr
      ? {
          trueCondition: 'Le client signale un problème bloquant, critique ou un risque majeur',
          falseCondition: 'La demande peut attendre le traitement normal sans impact majeur',
        }
      : {
          trueCondition: 'Client reports a blocking, critical issue or major risk',
          falseCondition: 'Request can wait for regular processing without major impact',
        },
  };

  const question2: ScoreQuestionSpec = {
    id: makeId(),
    type: 'score',
    key: 'urgency_level',
    label: isFr ? 'Niveau d’urgence opérationnelle' : 'Operational urgency level',
    instructions: isFr
      ? 'Qualifier le niveau d’urgence opérationnelle du `message` sur cette échelle.'
      : 'Rate the operational urgency level of the `message` on this scale.',
    isKeyCustomized: true,
    levels: isFr
      ? ['Faible', 'Moyen', 'Élevé', 'Critique']
      : ['Low', 'Medium', 'High', 'Critical'],
  };

  return {
    fields,
    questions: [question1, question2],
  };
}

function getLeadTemplate(locale: Locale, makeId: () => string): TemplateContent {
  const isFr = locale === 'fr';

  const fields: SpecField[] = isFr
    ? [
        { id: makeId(), name: 'nom', exampleValue: 'Camille Dupont' },
        { id: makeId(), name: 'entreprise', exampleValue: 'Acme Corp (250 salariés)' },
        {
          id: makeId(),
          name: 'message',
          exampleValue:
            'Nous cherchons à équiper notre équipe de 40 personnes d’ici la fin du mois. Pouvons-nous planifier une démo ?',
        },
      ]
    : [
        { id: makeId(), name: 'name', exampleValue: 'Alex Taylor' },
        { id: makeId(), name: 'company', exampleValue: 'Acme Corp (250 employees)' },
        {
          id: makeId(),
          name: 'message',
          exampleValue:
            'We want to equip our team of 40 by the end of the month. Can we schedule a demo?',
        },
      ];

  const question1: NoulQuestionSpec = {
    id: makeId(),
    type: 'noul',
    key: 'is_sales_inquiry',
    label: isFr ? 'Demande commerciale' : 'Commercial inquiry',
    instructions: isFr
      ? 'Le `message` pour l’entreprise `entreprise` est-il une demande commerciale (devis, tarif ou démo) ?'
      : 'Is the `message` for company `company` a commercial inquiry (quote, pricing, or demo)?',
    isKeyCustomized: true,
    criteria: isFr
      ? {
          trueCondition: 'Demande explicite de tarif, devis, contractualisation ou démonstration',
          falseCondition: 'Prise de contact générale, candidature ou démarchage sans intention d’achat',
        }
      : {
          trueCondition: 'Explicit request for pricing, quote, contracting or product demo',
          falseCondition: 'General outreach, job application or unsolicited pitch with no buying intent',
        },
  };

  const question2: ScoreQuestionSpec = {
    id: makeId(),
    type: 'score',
    key: 'maturity',
    label: isFr ? 'Maturité du projet' : 'Project maturity',
    instructions: isFr
      ? 'Évaluer la maturité du projet décrit dans le `message` pour `entreprise`.'
      : 'Evaluate the maturity of the project described in `message` for `company`.',
    isKeyCustomized: true,
    levels: isFr
      ? [
          'Simple curiosité',
          'Projet en réflexion',
          'Projet défini avec échéance',
        ]
      : [
          'Casual interest',
          'Under consideration',
          'Defined project with timeline',
        ],
  };

  const question3: NoulQuestionSpec = {
    id: makeId(),
    type: 'noul',
    key: 'is_decision_maker',
    label: isFr ? 'Rôle de décideur' : 'Decision maker role',
    instructions: isFr
      ? 'Le `message` de `nom` laisse-t-il penser que la personne décide de l’achat ?'
      : 'Does the `message` from `name` suggest this person has purchasing authority?',
    isKeyCustomized: true,
    criteria: isFr
      ? {
          trueCondition: 'Le contact mentionne un rôle de direction, budget ou pouvoir de décision',
          falseCondition: 'Rôle opérationnel, étudiant ou rôle décisionnel non identifiable',
        }
      : {
          trueCondition: 'Contact mentions executive role, budget ownership or sign-off authority',
          falseCondition: 'Operational role, student or unclear decision-making capacity',
        },
  };

  return {
    fields,
    questions: [question1, question2, question3],
  };
}

function getAvisTemplate(locale: Locale, makeId: () => string): TemplateContent {
  const isFr = locale === 'fr';

  const fields: SpecField[] = [
    {
      id: makeId(),
      name: isFr ? 'avis' : 'review',
      exampleValue: isFr
        ? 'Livraison rapide et soignée, mais le produit est un peu cher pour ce qu’il propose.'
        : 'Fast and careful shipping, but the product is a bit expensive for what it offers.',
    },
  ];

  const fieldRef = isFr ? '`avis`' : '`review`';

  const question1: ChoiceQuestionSpec = {
    id: makeId(),
    type: 'choice',
    key: 'sentiment',
    label: isFr ? 'Sentiment de l’avis' : 'Review sentiment',
    instructions: isFr
      ? `Déterminer la tonalité globale de l’${fieldRef} client.`
      : `Determine the overall sentiment of the customer ${fieldRef}.`,
    isKeyCustomized: true,
    options: isFr
      ? [
          { key: 'positive', description: 'Retour enthousiaste, compliments ou satisfaction' },
          { key: 'neutral', description: 'Avis mitigé, partagé ou purement factuel' },
          { key: 'negative', description: 'Insatisfaction, déception, critique ou colère' },
        ]
      : [
          { key: 'positive', description: 'Enthusiastic feedback, praise or satisfaction' },
          { key: 'neutral', description: 'Mixed, balanced or purely factual review' },
          { key: 'negative', description: 'Dissatisfaction, disappointment, complaint or anger' },
        ],
  };

  const question2: ChoiceQuestionSpec = {
    id: makeId(),
    type: 'choice',
    key: 'topic',
    label: isFr ? 'Sujet principal' : 'Main topic',
    instructions: isFr
      ? `Identifier le sujet principal abordé dans l’${fieldRef}.`
      : `Identify the main topic addressed in the ${fieldRef}.`,
    isKeyCustomized: true,
    options: isFr
      ? [
          { key: 'product', description: 'Qualité, finition ou fonctionnalités du produit' },
          { key: 'delivery', description: 'Délais, transporteur, emballage ou réception' },
          { key: 'price', description: 'Tarif, rapport qualité-prix ou promotions' },
          { key: 'customer_service', description: 'Échange avec le support ou le service après-vente' },
          { key: 'other', description: 'Autre aspect non couvert par les catégories' },
        ]
      : [
          { key: 'product', description: 'Quality, design or product features' },
          { key: 'delivery', description: 'Shipping times, courier, packaging or delivery' },
          { key: 'price', description: 'Price, value for money or discounts' },
          { key: 'customer_service', description: 'Interaction with customer support or after-sales' },
          { key: 'other', description: 'Other aspect not covered by the categories' },
        ],
  };

  const question3: NoulQuestionSpec = {
    id: makeId(),
    type: 'noul',
    key: 'needs_reply',
    label: isFr ? 'Demande de réponse' : 'Requires response',
    instructions: isFr
      ? `L’${fieldRef} demande-t-il une réponse ou une action de notre part ?`
      : `Does the ${fieldRef} require a response or action from us?`,
    isKeyCustomized: true,
    criteria: isFr
      ? {
          trueCondition: 'Le client pose une question, réclame une assistance ou attend un dédommagement',
          falseCondition: 'Simple avis sans demande d’intervention ou d’assistance',
        }
      : {
          trueCondition: 'Customer asks a question, seeks support or expects compensation',
          falseCondition: 'Standalone review with no request for action or assistance',
        },
  };

  return {
    fields,
    questions: [question1, question2, question3],
  };
}
