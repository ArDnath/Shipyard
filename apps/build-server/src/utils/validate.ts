import { z } from 'zod';

// ─── GitHub URL sanitizer ──────────────────────────────────────────────────
// Strips credentials, port, query, fragment, .git suffix — reconstructs clean URL

export function sanitizeGitHubUrl(raw: string): string {
  const parsed = new URL(raw);
  const parts = parsed.pathname.split('/').filter(Boolean).slice(0, 2);
  return `https://github.com/${parts[0]}/${parts[1]}`;
}

// ─── GitHub repo URL schema ────────────────────────────────────────────────
// 1. trim whitespace
// 2. validate it is a real GitHub repo URL
// 3. transform → sanitized canonical form  (https://github.com/owner/repo)

export const githubRepoUrlSchema = z
  .string()
  .trim()
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);

        // must be HTTPS only — no git://, http://, ssh://
        if (parsed.protocol !== 'https:') return false;

        // must be github.com — no subdomains, no other hosts
        if (parsed.hostname !== 'github.com') return false;

        // reject any embedded credentials  (https://user:pass@github.com)
        if (parsed.username || parsed.password) return false;

        // reject non-standard ports
        if (parsed.port) return false;

        // must have at least /owner/repo in path
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length < 2) return false;

        // owner and repo names: GitHub only allows alphanumeric, hyphen, underscore, dot
        const validSegment = /^[a-zA-Z0-9_.-]+$/;
        if (!validSegment.test(parts[0]!)) return false;
        if (!validSegment.test(parts[1]!.replace(/\.git$/, ''))) return false;

        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'Must be a valid public GitHub repository URL — https://github.com/owner/repo',
    },
  )
  // after validation passes, normalize to a canonical clean URL
  .transform(sanitizeGitHubUrl);

// ─── Deploy request schema ─────────────────────────────────────────────────

export const deploySchema = z.object({
  // repoUrl goes through full GitHub validation + sanitization
  repoUrl: githubRepoUrlSchema,

  // branch: alphanumeric, slashes, hyphens, underscores, dots — no shell chars
  branch: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9/_.-]+$/, 'Branch name contains invalid characters')
    .max(255)
    .default('main'),

  // installCommand: reasonable length, no shell injection chars
  installCommand: z
    .string()
    .trim()
    .min(1, 'installCommand cannot be empty')
    .max(200, 'installCommand too long')
    .refine(
      (cmd) => !/[;&|`$<>\\]/.test(cmd),
      'installCommand contains potentially unsafe shell characters',
    )
    .default('npm install'),

  // buildCommand: same rules as installCommand
  buildCommand: z
    .string()
    .trim()
    .min(1, 'buildCommand cannot be empty')
    .max(200, 'buildCommand too long')
    .refine(
      (cmd) => !/[;&|`$<>\\]/.test(cmd),
      'buildCommand contains potentially unsafe shell characters',
    )
    .default('npm run build'),

  // outputDir: must be a relative path, no traversal
  outputDir: z
    .string()
    .trim()
    .min(1, 'outputDir cannot be empty')
    .max(100, 'outputDir too long')
    .refine((dir) => !dir.includes('..'), 'outputDir must not contain path traversal (..)')
    .refine((dir) => !dir.startsWith('/'), 'outputDir must be a relative path, not absolute')
    .default('dist'),

  // env: keys must be UPPER_SNAKE_CASE, values are strings (not numbers)
  env: z
    .record(
      z
        .string()
        .regex(/^[A-Z_][A-Z0-9_]*$/, 'Env key must be UPPER_SNAKE_CASE (e.g. DATABASE_URL)'),
      z.string().max(1000, 'Env value too long'),
    )
    .optional()
    .default({}),
});

export type DeployInput = z.infer<typeof deploySchema>;
