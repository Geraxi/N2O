import { type VercelConfig } from '@vercel/config/v1';

// Vercel deploys to fra1 (Frankfurt) to match Supabase eu-central-1 for GDPR.
export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'next build',
  regions: ['fra1'],
};
