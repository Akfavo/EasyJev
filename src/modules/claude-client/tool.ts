/**
 * Définition du schéma d'outil pour l'API Anthropic Messages.
 * Force la réponse du modèle sous forme structurée via tool_use.
 */

export const SUBMIT_QUESTIONS_TOOL = {
  name: 'submit_questions',
  description:
    'Submit structured questions for Jev based on the user description and available fields.',
  input_schema: {
    type: 'object',
    properties: {
      fields_used: {
        type: 'array',
        description:
          'Exact names of the available fields that are relevant to the described decision, in the order they were given. Only list fields cited by at least one question.',
        items: {
          type: 'string',
        },
      },
      questions: {
        type: 'array',
        description: 'List of 1 to 12 questions to ask Jev.',
        items: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description:
                'Unique ASCII snake_case identifier for this question (e.g. is_urgent, category).',
            },
            type: {
              type: 'string',
              enum: ['noul', 'choice', 'score'],
              description:
                'Question type: noul (yes/no), choice (single select), score (ordered scale).',
            },
            instructions: {
              type: 'string',
              description:
                'Instructions for Jev, citing available field names between backticks (e.g. `message`).',
            },
            true_condition: {
              type: 'string',
              description:
                'Optional condition for the true/yes answer (only for noul type).',
            },
            false_condition: {
              type: 'string',
              description:
                'Optional condition for the false/no answer (only for noul type).',
            },
            options: {
              type: 'array',
              description:
                'List of 2 to 8 options (required for choice type).',
              items: {
                type: 'object',
                properties: {
                  key: {
                    type: 'string',
                    description:
                      'Option key in ASCII snake_case (e.g. billing, technical_support).',
                  },
                  description: {
                    type: 'string',
                    description:
                      'Short description of when this option applies.',
                  },
                },
                required: ['key', 'description'],
                additionalProperties: false,
              },
            },
            levels: {
              type: 'array',
              description:
                'Ordered list of 3 to 5 levels from lowest to highest (required for score type).',
              items: {
                type: 'string',
              },
            },
          },
          required: ['key', 'type', 'instructions'],
          additionalProperties: false,
        },
      },
    },
    required: ['questions'],
    additionalProperties: false,
  },
} as const;

export const TOOL_CHOICE_FORCED = {
  type: 'tool',
  name: 'submit_questions',
} as const;

export const TOOL_CHOICE_AUTO = {
  type: 'auto',
} as const;
