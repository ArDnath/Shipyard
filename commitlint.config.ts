import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the allowed values
    'type-enum': [
      2,
      'always',
      [
        'feat', // A new feature
        'fix', // A bug fix
        'docs', // Documentation only changes
        'style', // Formatting, missing semicolons, etc (no logic change)
        'refactor', // Code change that is neither a fix nor a feature
        'perf', // Performance improvement
        'test', // Adding or updating tests
        'build', // Changes to build system or dependencies
        'ci', // Changes to CI/CD configuration
        'chore', // Maintenance tasks, no production code change
        'revert', // Reverts a previous commit
      ],
    ],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Type must not be empty
    'type-empty': [2, 'never'],
    // Subject must not end with a period
    'subject-full-stop': [2, 'never', '.'],
    // Header max length
    'header-max-length': [2, 'always', 100],
    // Body max line length
    'body-max-line-length': [2, 'always', 120],
    // Scope is optional but must be lowercase if provided
    'scope-case': [2, 'always', 'lower-case'],
    // Type must be lowercase
    'type-case': [2, 'always', 'lower-case'],
  },
  prompt: {
    messages: {
      skip: '(press enter to skip)',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
    questions: {
      type: {
        description: "Select the type of change you're committing:",
        enum: {
          feat: { description: 'A new feature', title: 'Features', emoji: '✨' },
          fix: { description: 'A bug fix', title: 'Bug Fixes', emoji: '🐛' },
          docs: { description: 'Documentation only changes', title: 'Documentation', emoji: '📝' },
          style: { description: 'Formatting / whitespace changes', title: 'Styles', emoji: '💄' },
          refactor: {
            description: 'Refactor without fix or feature',
            title: 'Code Refactoring',
            emoji: '♻️',
          },
          perf: { description: 'A performance improvement', title: 'Performance', emoji: '⚡️' },
          test: { description: 'Adding or updating tests', title: 'Tests', emoji: '✅' },
          build: { description: 'Build system or dependency changes', title: 'Builds', emoji: '🏗️' },
          ci: { description: 'CI/CD configuration changes', title: 'CI', emoji: '👷' },
          chore: { description: 'Maintenance, no production change', title: 'Chores', emoji: '🔧' },
          revert: { description: 'Reverts a previous commit', title: 'Reverts', emoji: '⏪️' },
        },
      },
      scope: {
        description: 'What is the scope of this change? (e.g. api, builder, dashboard)',
      },
      subject: {
        description: 'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change (optional)',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description: 'A BREAKING CHANGE commit requires a body. Please enter a longer description',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #456")',
      },
    },
  },
};

export default config;
