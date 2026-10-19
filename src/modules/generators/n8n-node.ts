import type { EasyJevSpec } from '../spec';
import { generateJevOutput } from './jev-output';

export interface N8nHeaderParameter {
  name: string;
  value: string;
}

export interface N8nNodeParameters {
  method: 'POST';
  url: string;
  authentication: 'genericCredentialType';
  genericAuthType: 'httpHeaderAuth';
  sendHeaders: true;
  headerParameters: {
    parameters: N8nHeaderParameter[];
  };
  sendBody: true;
  specifyBody: 'json';
  jsonBody: string;
  options: Record<string, never>;
}

export interface N8nNodeData {
  parameters: N8nNodeParameters;
  id: string;
  name: string;
  type: 'n8n-nodes-base.httpRequest';
  typeVersion: 4.2;
  position: [number, number];
  executeOnce: boolean;
}

export interface N8nClipboardPayload {
  nodes: N8nNodeData[];
  connections: Record<string, never>;
  pinData: Record<string, never>;
}

export interface GeneratedN8nNode {
  rawObject: N8nClipboardPayload;
  jsonString: string;
}

function defaultMakeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Génère le nœud n8n préconfiguré prêt à être collé dans un workflow n8n.
 * Reproduit fidèlement la structure du nœud de référence (spikes/n8n-node-reference.json).
 * N'inclut aucun bloc d'accès ni aucune clé d'authentification.
 * Lève InvalidSpecError si la spécification est invalide (délégué à generateJevOutput).
 */
export function generateN8nNode(
  spec: EasyJevSpec,
  makeId: () => string = defaultMakeId
): GeneratedN8nNode {
  const effectiveSpec: EasyJevSpec =
    spec.outputMode === 'n8n-expression'
      ? spec
      : { ...spec, outputMode: 'n8n-expression' };

  const jevOutput = generateJevOutput(effectiveSpec);

  const rawObject: N8nClipboardPayload = {
    nodes: [
      {
        parameters: {
          method: 'POST',
          url: jevOutput.endpointUrl,
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: 'Content-Type',
                value: 'application/json',
              },
            ],
          },
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `=${jevOutput.jsonString}`,
          options: {},
        },
        id: makeId(),
        name: 'Jev',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [0, 0],
        executeOnce: false,
      },
    ],
    connections: {},
    pinData: {},
  };

  const jsonString = JSON.stringify(rawObject, null, 2);

  return {
    rawObject,
    jsonString,
  };
}
