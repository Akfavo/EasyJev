import type { QuestionType, TypeSafeDirectModel, VercelGatewayModel } from '../spec';

export interface JevNoulCriteria {
  true?: string;
  false?: string;
}

export type JevChoiceCriteria = Record<string, string | null>;
export type JevScoreCriteria = string[];

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

export interface GeneratedJevOutput {
  rawObject: JevRequestBody;
  jsonString: string;
  endpointUrl: string;
  authHeaderPrefix: string;
}

export interface N8nReadingExpressions {
  byQuestionKey: Record<string, {
    primaryPath: string;
    secondaryPaths?: Record<string, string>;
  }>;
}
