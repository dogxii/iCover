#!/usr/bin/env bash

# ─── iCover Release Script ────────────────────────────────────────────────────
# Usage: bash scripts/release.sh [patch|minor|major]
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"

step()  { echo -e "\n${BOLD}${BLUE}▶ $*${RESET}"; }
ok()    { echo -e "${GREEN}✓ $*${RESET}"; }
warn()  { echo -e "${YELLOW}⚠ $*${RESET}"; }
die()   { echo -e "${RED}✗ $*${RESET}" >&2; exit 1; }
info()  { echo -e "${CYAN}  $*${RESET}"; }

# ── Validate argument ─────────────────────────────────────────────────────────
BUMP="${1:-patch}"
if [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
  die "Invalid bump type: '$BUMP'. Use: patch | minor | major"
fi

# ── Preflight checks ──────────────────────────────────────────────────────────
step "Preflight checks"

command -v bun  >/dev/null 2>&1 || die "bun not found"
command -v git  >/dev/null 2>&1 || die "git not found"
command -v npm  >/dev/null 2>&1 || die "npm not found (needed for 'npm version')"

# Must be run from repo root (package.json must exist)
[[ -f "package.json" ]] || die "package.json not found. Run this script from the project root."

# Working tree must be clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  die "Working tree is not clean. Commit or stash changes first."
fi

# Must be on main/master branch
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
  warn "You are on branch '$CURRENT_BRANCH', not main/master."
  read -r -p "  Continue anyway? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || die "Aborted."
fi

ok "All preflight checks passed (branch: $CURRENT_BRANCH)"

# ── Step 1: Build ─────────────────────────────────────────────────────────────
step "1/5  Building project"
bun run build
ok "Build succeeded"

# ── Step 2: Bump version ──────────────────────────────────────────────────────
step "2/5  Bumping version ($BUMP)"

# npm version updates package.json and creates a git tag (we'll push it later)
# --no-git-tag-version: we control the tag ourselves after composing the message
OLD_VERSION="$(node -p "require('./package.json').version")"
npm version "$BUMP" --no-git-tag-version --no-commit-hooks
NEW_VERSION="$(node -p "require('./package.json').version")"

info "  $OLD_VERSION  →  $NEW_VERSION"
ok "package.json updated"

# ── Step 3: Git commit + tag ──────────────────────────────────────────────────
step "3/5  Creating git commit and tag"

TAG="v${NEW_VERSION}"

git add package.json
git commit -m "chore: release ${TAG}"
git tag -a "$TAG" -m "Release ${TAG}"

ok "Committed and tagged: $TAG"

# ── Step 4: Push ──────────────────────────────────────────────────────────────
step "4/5  Pushing to remote"

git push origin "$CURRENT_BRANCH"
git push origin "$TAG"

ok "Pushed branch '$CURRENT_BRANCH' and tag '$TAG'"

# ── Step 5: GitHub Release ────────────────────────────────────────────────────
step "5/5  Creating GitHub Release"

if command -v gh >/dev/null 2>&1; then
  gh release create "$TAG" \
    --title "iCover ${TAG}" \
    --draft \
    --generate-notes \
    --web
  ok "GitHub Release draft opened in browser"
else
  warn "'gh' CLI not found — skipping GitHub Release creation."
  info "Create manually: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/\.git$//')/releases/new?tag=${TAG}"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}🎉  Released iCover ${TAG}${RESET}"
echo ""
