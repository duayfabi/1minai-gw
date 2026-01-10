set shell := ["fish", "-lc"]

default:
  @just --list


# ---  ---
ci:
  npm ci

# --- Cockpit ---
notes:
  mkdir -p notes
  test -f notes/plan.md; or echo "# Plan" > notes/plan.md
  test -f notes/ci.md; or echo "# CI" > notes/ci.md
  test -f notes/review.md; or echo "# Review" > notes/review.md
  test -f notes/handoff.md; or echo "# Handoff" > notes/handoff.md

cockpit: notes
  zellij --layout .zellij/aider-agents.kdl


# --- Agents aider ---
# Planning: passe un objectif (texte libre)
# Usage: just agent-plan "Ajouter endpoint /healthz"
agent-plan OBJECTIF: notes
  begin
  cat .aider/prompts/planner.md
  echo ""
  echo "Objectif: {{OBJECTIF}}"
  end | aider --no-show-model-warnings --config .aider/plan.yml

# Dev: passe un slug et travaille sur agent/<slug>
# Usage: just agent-dev "healthz"
agent-dev SLUG: notes
  set branch "agent/{{SLUG}}"
  git checkout -b "$branch" 2>/dev/null; or git checkout "$branch"
  begin
  cat .aider/prompts/dev.md
  echo ""
  echo "Branche: $branch"
  echo "SLUG: {{SLUG}}"
  echo ""
  echo "Consignes: exécute le plan dans notes/plan.md sur cette branche."
  end | aider --no-show-model-warnings --config .aider/dev.yml

agent-test: notes
  cat .aider/prompts/test.md | aider --no-show-model-warnings --config .aider/test.yml

agent-review: notes
  cat .aider/prompts/reviewer.md | aider --no-show-model-warnings --config .aider/review.yml
