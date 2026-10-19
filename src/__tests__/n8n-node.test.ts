import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { generateN8nNode, generateJevOutput, InvalidSpecError } from '@/modules/generators';
import { createDefaultSpec, type EasyJevSpec } from '@/modules/spec';

describe('Générateur de nœud n8n (generateN8nNode)', () => {
  const referencePath = path.resolve(__dirname, '../../spikes/n8n-node-reference.json');
  const referenceData = JSON.parse(fs.readFileSync(referencePath, 'utf-8'));

  const fixedId = 'test-fixed-uuid-1234';
  const makeFixedId = () => fixedId;

  function createValidSpec(): EasyJevSpec {
    return {
      ...createDefaultSpec(),
      questions: [
        {
          id: 'q1',
          key: 'urgent',
          label: 'Urgent',
          type: 'noul',
          instructions: 'Le message `message` est-il urgent ?',
        },
      ],
    };
  }

  it('génère une structure identique au fichier de référence spikes/n8n-node-reference.json', () => {
    const spec = createValidSpec();
    const result = generateN8nNode(spec, makeFixedId);

    // Clés de premier niveau
    expect(Object.keys(result.rawObject).sort()).toEqual(Object.keys(referenceData).sort());
    expect(result.rawObject.connections).toEqual({});
    expect(result.rawObject.pinData).toEqual({});

    // Un seul nœud
    expect(result.rawObject.nodes).toHaveLength(1);
    const node = result.rawObject.nodes[0]!;
    const refNode = referenceData.nodes[0]!;

    // Propriétés du nœud
    expect(node.id).toBe(fixedId);
    expect(node.name).toBe('Jev');
    expect(node.type).toBe('n8n-nodes-base.httpRequest');
    expect(node.typeVersion).toBe(4.2);
    expect(node.position).toEqual([0, 0]);
    expect(node.executeOnce).toBe(false);

    // Pas de propriété 'meta' (spécifique à l'instance n8n)
    expect('meta' in node).toBe(false);

    // Paramètres du nœud
    expect(Object.keys(node.parameters).sort()).toEqual(Object.keys(refNode.parameters).sort());
    expect(node.parameters.method).toBe('POST');
    expect(node.parameters.authentication).toBe('genericCredentialType');
    expect(node.parameters.genericAuthType).toBe('httpHeaderAuth');
    expect(node.parameters.sendHeaders).toBe(true);
    expect(node.parameters.headerParameters).toEqual({
      parameters: [{ name: 'Content-Type', value: 'application/json' }],
    });
    expect(node.parameters.sendBody).toBe(true);
    expect(node.parameters.specifyBody).toBe('json');
    expect(node.parameters.options).toEqual({});

    // Format du jsonBody : '=' suivi du JSON
    expect(node.parameters.jsonBody.startsWith('=')).toBe(true);
    const bodyContent = node.parameters.jsonBody.slice(1);
    const expectedJev = generateJevOutput(spec);
    expect(bodyContent).toBe(expectedJev.jsonString);

    // jsonString est bien un JSON valide contenant l'ensemble
    const parsedClipboard = JSON.parse(result.jsonString);
    expect(parsedClipboard.nodes[0].name).toBe('Jev');
    expect(parsedClipboard.nodes[0].parameters.jsonBody).toBe(node.parameters.jsonBody);
  });

  it('génère un identifiant par défaut lorsque makeId n’est pas fourni', () => {
    const spec = createValidSpec();
    const result = generateN8nNode(spec);
    expect(result.rawObject.nodes[0]!.id).toBeTruthy();
    expect(typeof result.rawObject.nodes[0]!.id).toBe('string');
  });

  it('reproduit l’URL et le modèle pour le fournisseur TypeSafe direct', () => {
    const spec = createValidSpec();
    spec.target.provider = 'typesafe';
    spec.target.model = 'jev-latest';

    const result = generateN8nNode(spec, makeFixedId);
    const node = result.rawObject.nodes[0]!;

    expect(node.parameters.url).toBe('https://api.typesafe.ai/v1/systemone');
    expect(node.parameters.jsonBody).toContain('"model": "jev-latest"');
  });

  it('reproduit l’URL et le modèle pour le fournisseur Vercel AI Gateway', () => {
    const spec = createValidSpec();
    spec.target.provider = 'vercel-gateway';
    spec.target.model = 'typesafe-ai/jev';

    const result = generateN8nNode(spec, makeFixedId);
    const node = result.rawObject.nodes[0]!;

    expect(node.parameters.url).toBe('https://ai-gateway.vercel.sh/typesafe/v1/systemone');
    expect(node.parameters.jsonBody).toContain('"model": "typesafe-ai/jev"');
  });

  it('gère plusieurs champs avec leurs expressions n8n dans state', () => {
    const spec: EasyJevSpec = {
      ...createValidSpec(),
      fields: [
        { id: 'f1', name: 'titre' },
        { id: 'f2', name: 'contenu' },
      ],
      outputMode: 'n8n-expression',
    };

    const result = generateN8nNode(spec, makeFixedId);
    const node = result.rawObject.nodes[0]!;

    expect(node.parameters.jsonBody).toContain('"titre": {{ JSON.stringify($json.titre) }}');
    expect(node.parameters.jsonBody).toContain('"contenu": {{ JSON.stringify($json.contenu) }}');
  });

  it('gère les textes difficiles (guillemets, retours à la ligne, accents graves, $, {{ }}) sans corrompre le nœud', () => {
    const spec: EasyJevSpec = {
      ...createDefaultSpec(),
      questions: [
        {
          id: 'q1',
          key: 'analyse',
          label: 'Analyse',
          type: 'noul',
          instructions:
            'Le message avec "guillemets", un retour à la ligne\net un champ `message` coûte-t-il 100 $ ? {{ non }}',
        },
      ],
    };

    const result = generateN8nNode(spec, makeFixedId);
    // Le presse-papiers est du JSON valide
    const parsed = JSON.parse(result.jsonString);
    expect(parsed.nodes[0].parameters.jsonBody.startsWith('=')).toBe(true);
    expect(parsed.nodes[0].parameters.jsonBody).toContain('100 $');
    expect(parsed.nodes[0].parameters.jsonBody).toContain('avec \\"guillemets\\"');
  });

  it('sécurité : ne contient aucune clé API, aucun identifiant d’accès ni chaîne Bearer dans la sortie', () => {
    const spec = createValidSpec();
    const result = generateN8nNode(spec, makeFixedId);

    const jsonStr = result.jsonString;
    expect(jsonStr).not.toContain('Bearer ');
    expect(jsonStr).not.toContain('credentials');
    expect(jsonStr).not.toContain('credential');
    expect(jsonStr).not.toContain('sk-');
    expect(jsonStr).not.toContain('api_key');
  });

  it('lève une InvalidSpecError si la spec est invalide (déléguée à generateJevOutput)', () => {
    const invalidSpec: EasyJevSpec = {
      ...createDefaultSpec(),
      fields: [], // Pas de champs = invalide
    };

    expect(() => generateN8nNode(invalidSpec)).toThrow(InvalidSpecError);
  });
});
