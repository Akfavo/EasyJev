import {
  createDefaultSpec,
  renameField,
  deriveQuestionKey,
  type EasyJevSpec,
  type SpecField,
  type QuestionSpec,
  type ChoiceQuestionSpec,
  type ScoreQuestionSpec,
  type NoulQuestionSpec,
} from '../spec';
import { nextFieldName } from './field-name';
import { remapFieldCitations } from './citations';
import type { EditorAction, EditorState } from './types';

/**
 * Crée l'état initial de l'éditeur à partir d'une spec optionnelle ou de la spec par défaut.
 */
export function createInitialState(initialSpec?: EasyJevSpec): EditorState {
  return {
    spec: initialSpec ?? createDefaultSpec(),
  };
}

function createDefaultQuestion(
  id: string,
  type: QuestionSpec['type'],
  existingKeys: Set<string>
): QuestionSpec {
  const baseKey = deriveQuestionKey('', existingKeys);

  if (type === 'choice') {
    const choice: ChoiceQuestionSpec = {
      id,
      type: 'choice',
      key: baseKey,
      label: '',
      instructions: '',
      isKeyCustomized: false,
      options: [
        { key: '', description: '' },
        { key: '', description: '' },
      ],
    };
    return choice;
  }

  if (type === 'score') {
    const score: ScoreQuestionSpec = {
      id,
      type: 'score',
      key: baseKey,
      label: '',
      instructions: '',
      isKeyCustomized: false,
      levels: ['', '', ''],
    };
    return score;
  }

  const noul: NoulQuestionSpec = {
    id,
    type: 'noul',
    key: baseKey,
    label: '',
    instructions: '',
    isKeyCustomized: false,
    criteria: {
      trueCondition: '',
      falseCondition: '',
    },
  };
  return noul;
}

/**
 * Réducteur pur de l'état de l'éditeur EasyJev. Ne modifie jamais son argument.
 */
export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'field/add': {
      const newField: SpecField = {
        id: action.id,
        name: nextFieldName(state.spec.fields),
      };

      return {
        ...state,
        spec: {
          ...state.spec,
          fields: [...state.spec.fields, newField],
        },
      };
    }

    case 'field/remove': {
      if (state.spec.fields.length <= 1) {
        return state;
      }

      const fieldExists = state.spec.fields.some(field => field.id === action.id);
      if (!fieldExists) {
        return state;
      }

      return {
        ...state,
        spec: {
          ...state.spec,
          fields: state.spec.fields.filter(field => field.id !== action.id),
        },
      };
    }

    case 'field/rename': {
      const targetField = state.spec.fields.find(field => field.id === action.id);
      if (!targetField) {
        return state;
      }

      const updatedSpec = renameField(state.spec, targetField.name, action.newName);
      if (updatedSpec === state.spec) {
        return state;
      }

      return {
        ...state,
        spec: updatedSpec,
      };
    }

    case 'field/setExample': {
      const targetIndex = state.spec.fields.findIndex(field => field.id === action.id);
      if (targetIndex === -1) {
        return state;
      }

      const targetField = state.spec.fields[targetIndex];
      if (!targetField || targetField.exampleValue === action.value) {
        return state;
      }

      return {
        ...state,
        spec: {
          ...state.spec,
          fields: state.spec.fields.map((field, idx) =>
            idx === targetIndex ? { ...field, exampleValue: action.value } : field
          ),
        },
      };
    }

    case 'field/replaceAll': {
      if (action.fields.length === 0) {
        return state;
      }

      const existingByName = new Map(state.spec.fields.map(f => [f.name, f]));
      const newFields: SpecField[] = action.fields.map((f) => {
        const existing = existingByName.get(f.name);
        if (existing) {
          return {
            id: existing.id,
            name: f.name,
            ...(existing.exampleValue !== undefined
              ? { exampleValue: existing.exampleValue }
              : f.exampleValue !== undefined
              ? { exampleValue: f.exampleValue }
              : {}),
          };
        }

        return {
          id: f.id,
          name: f.name,
          ...(f.exampleValue !== undefined ? { exampleValue: f.exampleValue } : {}),
        };
      });

      // Remplacement des citations : seuls les noms d'origine retirés et les cibles présentes comptent
      const newNames = new Set(newFields.map(f => f.name));
      const effectiveRemap: Record<string, string> = {};
      for (const [from, to] of Object.entries(action.remap ?? {})) {
        if (from !== to && !newNames.has(from) && newNames.has(to)) {
          effectiveRemap[from] = to;
        }
      }
      const hasRemap = Object.keys(effectiveRemap).length > 0;

      return {
        ...state,
        spec: {
          ...state.spec,
          fields: newFields,
          ...(hasRemap
            ? {
                questions: state.spec.questions.map(q => ({
                  ...q,
                  instructions: remapFieldCitations(q.instructions, effectiveRemap),
                })),
              }
            : {}),
        },
      };
    }

    case 'output/setMode': {
      if (state.spec.outputMode === action.mode) {
        return state;
      }

      return {
        ...state,
        spec: {
          ...state.spec,
          outputMode: action.mode,
        },
      };
    }

    case 'question/add': {
      const existingKeys = new Set(state.spec.questions.map(q => q.key));
      const newQuestion = createDefaultQuestion(action.id, action.questionType, existingKeys);

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: [...state.spec.questions, newQuestion],
        },
      };
    }

    case 'question/remove': {
      const exists = state.spec.questions.some(q => q.id === action.id);
      if (!exists) {
        return state;
      }

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.filter(q => q.id !== action.id),
        },
      };
    }

    case 'question/duplicate': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.id);
      if (questionIndex === -1) {
        return state;
      }

      const sourceQuestion = state.spec.questions[questionIndex]!;
      const existingKeys = new Set(state.spec.questions.map(q => q.key));
      const newKey = deriveQuestionKey(sourceQuestion.key, existingKeys);

      let duplicated: QuestionSpec;
      if (sourceQuestion.type === 'choice') {
        duplicated = {
          ...sourceQuestion,
          id: action.newId,
          key: newKey,
          options: sourceQuestion.options.map(opt => ({ ...opt })),
        };
      } else if (sourceQuestion.type === 'score') {
        duplicated = {
          ...sourceQuestion,
          id: action.newId,
          key: newKey,
          levels: [...sourceQuestion.levels],
        };
      } else {
        duplicated = {
          ...sourceQuestion,
          id: action.newId,
          key: newKey,
          criteria: sourceQuestion.criteria ? { ...sourceQuestion.criteria } : undefined,
        };
      }

      const newQuestions = [...state.spec.questions];
      newQuestions.splice(questionIndex + 1, 0, duplicated);

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: newQuestions,
        },
      };
    }

    case 'question/setType': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.id);
      if (questionIndex === -1) {
        return state;
      }

      const targetQuestion = state.spec.questions[questionIndex]!;
      if (targetQuestion.type === action.questionType) {
        return state;
      }

      let updatedQuestion: QuestionSpec;
      if (action.questionType === 'choice') {
        updatedQuestion = {
          id: targetQuestion.id,
          key: targetQuestion.key,
          label: targetQuestion.label,
          instructions: targetQuestion.instructions,
          isKeyCustomized: targetQuestion.isKeyCustomized,
          type: 'choice',
          options: [
            { key: '', description: '' },
            { key: '', description: '' },
          ],
        };
      } else if (action.questionType === 'score') {
        updatedQuestion = {
          id: targetQuestion.id,
          key: targetQuestion.key,
          label: targetQuestion.label,
          instructions: targetQuestion.instructions,
          isKeyCustomized: targetQuestion.isKeyCustomized,
          type: 'score',
          levels: ['', '', ''],
        };
      } else {
        updatedQuestion = {
          id: targetQuestion.id,
          key: targetQuestion.key,
          label: targetQuestion.label,
          instructions: targetQuestion.instructions,
          isKeyCustomized: targetQuestion.isKeyCustomized,
          type: 'noul',
          criteria: {
            trueCondition: '',
            falseCondition: '',
          },
        };
      }

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.map((q, idx) =>
            idx === questionIndex ? updatedQuestion : q
          ),
        },
      };
    }

    case 'question/setText': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.id);
      if (questionIndex === -1) {
        return state;
      }

      const targetQuestion = state.spec.questions[questionIndex]!;
      let updatedKey = targetQuestion.key;

      if (!targetQuestion.isKeyCustomized) {
        const otherKeys = new Set(
          state.spec.questions.filter(q => q.id !== action.id).map(q => q.key)
        );
        updatedKey = deriveQuestionKey(action.text, otherKeys);
      }

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.map((q, idx) =>
            idx === questionIndex
              ? ({
                  ...q,
                  instructions: action.text,
                  key: updatedKey,
                } as QuestionSpec)
              : q
          ),
        },
      };
    }

    case 'question/setKey': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.id);
      if (questionIndex === -1) {
        return state;
      }

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.map((q, idx) =>
            idx === questionIndex
              ? ({
                  ...q,
                  key: action.key,
                  isKeyCustomized: true,
                } as QuestionSpec)
              : q
          ),
        },
      };
    }

    case 'choice/addOption': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.questionId);
      if (questionIndex === -1) {
        return state;
      }

      const question = state.spec.questions[questionIndex]!;
      if (question.type !== 'choice') {
        return state;
      }

      const updatedChoice: ChoiceQuestionSpec = {
        ...question,
        options: [...question.options, { key: '', description: '' }],
      };

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.map((q, idx) =>
            idx === questionIndex ? updatedChoice : q
          ),
        },
      };
    }

    case 'choice/removeOption': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.questionId);
      if (questionIndex === -1) {
        return state;
      }

      const question = state.spec.questions[questionIndex]!;
      if (question.type !== 'choice') {
        return state;
      }

      // Plancher de 2 options minimum
      if (question.options.length <= 2) {
        return state;
      }

      if (action.index < 0 || action.index >= question.options.length) {
        return state;
      }

      const updatedChoice: ChoiceQuestionSpec = {
        ...question,
        options: question.options.filter((_, idx) => idx !== action.index),
      };

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.map((q, idx) =>
            idx === questionIndex ? updatedChoice : q
          ),
        },
      };
    }

    case 'choice/updateOption': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.questionId);
      if (questionIndex === -1) {
        return state;
      }

      const question = state.spec.questions[questionIndex]!;
      if (question.type !== 'choice') {
        return state;
      }

      if (action.index < 0 || action.index >= question.options.length) {
        return state;
      }

      const existingOption = question.options[action.index]!;
      const updatedOption = {
        key: action.key !== undefined ? action.key : existingOption.key,
        description:
          action.description !== undefined ? action.description : existingOption.description,
      };

      const updatedChoice: ChoiceQuestionSpec = {
        ...question,
        options: question.options.map((opt, idx) =>
          idx === action.index ? updatedOption : opt
        ),
      };

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.map((q, idx) =>
            idx === questionIndex ? updatedChoice : q
          ),
        },
      };
    }

    case 'score/addLevel': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.questionId);
      if (questionIndex === -1) {
        return state;
      }

      const question = state.spec.questions[questionIndex]!;
      if (question.type !== 'score') {
        return state;
      }

      // Plafond de 10 niveaux
      if (question.levels.length >= 10) {
        return state;
      }

      const updatedScore: ScoreQuestionSpec = {
        ...question,
        levels: [...question.levels, ''],
      };

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.map((q, idx) =>
            idx === questionIndex ? updatedScore : q
          ),
        },
      };
    }

    case 'score/removeLevel': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.questionId);
      if (questionIndex === -1) {
        return state;
      }

      const question = state.spec.questions[questionIndex]!;
      if (question.type !== 'score') {
        return state;
      }

      // Plancher de 2 niveaux minimum
      if (question.levels.length <= 2) {
        return state;
      }

      if (action.index < 0 || action.index >= question.levels.length) {
        return state;
      }

      const updatedScore: ScoreQuestionSpec = {
        ...question,
        levels: question.levels.filter((_, idx) => idx !== action.index),
      };

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.map((q, idx) =>
            idx === questionIndex ? updatedScore : q
          ),
        },
      };
    }

    case 'score/updateLevel': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.questionId);
      if (questionIndex === -1) {
        return state;
      }

      const question = state.spec.questions[questionIndex]!;
      if (question.type !== 'score') {
        return state;
      }

      if (action.index < 0 || action.index >= question.levels.length) {
        return state;
      }

      const updatedScore: ScoreQuestionSpec = {
        ...question,
        levels: question.levels.map((lvl, idx) => (idx === action.index ? action.value : lvl)),
      };

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.map((q, idx) =>
            idx === questionIndex ? updatedScore : q
          ),
        },
      };
    }

    case 'noul/setConditions': {
      const questionIndex = state.spec.questions.findIndex(q => q.id === action.questionId);
      if (questionIndex === -1) {
        return state;
      }

      const question = state.spec.questions[questionIndex]!;
      if (question.type !== 'noul') {
        return state;
      }

      const currentCriteria = question.criteria ?? {};
      const updatedNoul: NoulQuestionSpec = {
        ...question,
        criteria: {
          trueCondition:
            action.trueCondition !== undefined
              ? action.trueCondition
              : currentCriteria.trueCondition,
          falseCondition:
            action.falseCondition !== undefined
              ? action.falseCondition
              : currentCriteria.falseCondition,
        },
      };

      return {
        ...state,
        spec: {
          ...state.spec,
          questions: state.spec.questions.map((q, idx) =>
            idx === questionIndex ? updatedNoul : q
          ),
        },
      };
    }

    case 'target/setProvider': {
      if (state.spec.target.provider === action.provider) {
        return state;
      }

      const newTarget =
        action.provider === 'typesafe'
          ? ({ provider: 'typesafe', model: 'jev-latest' } as const)
          : ({ provider: 'vercel-gateway', model: 'typesafe-ai/jev' } as const);

      return {
        ...state,
        spec: {
          ...state.spec,
          target: newTarget,
        },
      };
    }

    case 'spec/replaceContent': {
      return {
        ...state,
        spec: {
          ...state.spec,
          fields: action.fields,
          questions: action.questions,
        },
      };
    }

    case 'detected/set': {
      return {
        ...state,
        detectedFields: action.names,
      };
    }

    case 'spec/replaceQuestions': {
      return {
        ...state,
        spec: {
          ...state.spec,
          questions: action.questions,
        },
      };
    }
  }
}
