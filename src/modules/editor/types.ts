import type { EasyJevSpec, QuestionType, SpecField, QuestionSpec } from '../spec';

export interface EditorState {
  spec: EasyJevSpec;
  /** Noms des champs détectés dans les données collées (noms seulement, jamais les valeurs). */
  detectedFields?: string[];
}

export type EditorAction =
  | { type: 'field/add'; id: string }
  | { type: 'field/remove'; id: string }
  | { type: 'field/rename'; id: string; newName: string }
  | { type: 'field/setExample'; id: string; value: string }
  | {
      type: 'field/replaceAll';
      fields: Array<{ id: string; name: string; exampleValue?: string }>;
      /** Ancien nom de champ -> nouveau nom : réécrit les citations entre accents graves des questions. */
      remap?: Record<string, string>;
    }
  | { type: 'output/setMode'; mode: 'n8n-expression' | 'example-text' }
  | { type: 'question/add'; id: string; questionType: QuestionType }
  | { type: 'question/remove'; id: string }
  | { type: 'question/duplicate'; id: string; newId: string }
  | { type: 'question/setType'; id: string; questionType: QuestionType }
  | { type: 'question/setText'; id: string; text: string }
  | { type: 'question/setKey'; id: string; key: string }
  | { type: 'choice/addOption'; questionId: string }
  | { type: 'choice/removeOption'; questionId: string; index: number }
  | {
      type: 'choice/updateOption';
      questionId: string;
      index: number;
      key?: string;
      description?: string;
    }
  | { type: 'score/addLevel'; questionId: string }
  | { type: 'score/removeLevel'; questionId: string; index: number }
  | { type: 'score/updateLevel'; questionId: string; index: number; value: string }
  | {
      type: 'noul/setConditions';
      questionId: string;
      trueCondition?: string;
      falseCondition?: string;
    }
  | { type: 'target/setProvider'; provider: 'typesafe' | 'vercel-gateway' }
  | { type: 'spec/replaceContent'; fields: SpecField[]; questions: QuestionSpec[] }
  | { type: 'spec/replaceQuestions'; questions: QuestionSpec[] }
  | { type: 'detected/set'; names: string[] };
