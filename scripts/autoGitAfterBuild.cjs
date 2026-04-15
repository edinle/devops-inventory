/* eslint-disable no-console */
const { execSync } = require('node:child_process');

function sh(cmd) {
  return execSync(cmd, { stdio: 'pipe' }).toString('utf8').trim();
}

function trySh(cmd) {
  try {
    return { ok: true, out: sh(cmd) };
  } catch (e) {
    return { ok: false, out: String(e?.stdout ?? e?.message ?? e) };
  }
}

// Safety guard: never run on hosted CI (Vercel / GitHub Actions) unless explicitly forced.
// (Some local dev environments set `CI=1`, so we intentionally *do not* treat `CI` as hosted.)
const isHostedCI = Boolean(process.env.VERCEL) || Boolean(process.env.GITHUB_ACTIONS);
const enabled = process.env.AUTO_GIT_PUSH === '1';
const forceInCI = process.env.AUTO_GIT_PUSH_FORCE_CI === '1';

if (!enabled) {
  process.exit(0);
}
if (isHostedCI && !forceInCI) {
  console.log('[autoGitAfterBuild] Skipping on hosted CI (set AUTO_GIT_PUSH_FORCE_CI=1 to override).');
  process.exit(0);
}

// Must be a git repo.
const isRepo = trySh('git rev-parse --is-inside-work-tree').ok;
if (!isRepo) {
  console.log('[autoGitAfterBuild] Not a git repo; skipping.');
  process.exit(0);
}

// Only act if there are changes.
const status = sh('git status --porcelain');
if (!status) {
  process.exit(0);
}

// Require a configured remote.
const remote = trySh('git remote get-url origin');
if (!remote.ok) {
  console.log('[autoGitAfterBuild] No origin remote; skipping.');
  process.exit(0);
}

// Stage everything except ignored files.
execSync('git add -A', { stdio: 'inherit' });

// Commit message can be customized; keep it deterministic for repeated builds.
const msg = process.env.AUTO_GIT_PUSH_MESSAGE || 'chore: auto-commit after successful build';
const commit = trySh(`git commit -m "${msg.replace(/"/g, '\\"')}"`);
if (!commit.ok) {
  // Nothing to commit or commit failed—either way, don't block build.
  console.log('[autoGitAfterBuild] Commit skipped/failed:', commit.out);
  process.exit(0);
}

// Push current branch.
const branch = sh('git rev-parse --abbrev-ref HEAD');
execSync(`git push origin ${branch}`, { stdio: 'inherit' });

