import Anthropic from '@anthropic-ai/sdk';

// Singleton Anthropic client. DPA must be signed in the API console before
// processing real client data (Phase 4 gate).
let _client: Anthropic | null = null;
export function anthropic(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return _client;
}

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
