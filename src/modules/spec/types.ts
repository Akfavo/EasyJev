export type TypeSafeDirectModel = 'jev-latest' | 'jev-1.13.0';
export type VercelGatewayModel = 'typesafe-ai/jev';

export type JevTargetConfig =
  | { provider: 'typesafe'; model: TypeSafeDirectModel }
  | { provider: 'vercel-gateway'; model: VercelGatewayModel };

export type QuestionType = 'noul' | 'choice' | 'score';

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
  isKeyCustomized?: boolean; // Clé modifiée à la main par l'utilisateur (non recalculée si vrai)
}

export interface NoulQuestionSpec extends BaseQuestionSpec {
  type: 'noul';
  criteria?: {
    trueCondition?: string;
    falseCondition?: string;
  };
}

export interface ChoiceOption {
  key: string; // Identifiant technique de l'option (clé dans le dictionnaire criteria de Jev)
  description?: string; // Condition optionnelle pour Jev (valeur dans criteria ou null si omis)
}

export interface ChoiceQuestionSpec extends BaseQuestionSpec {
  type: 'choice';
  options: ChoiceOption[]; // De 2 à 255 choix
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
