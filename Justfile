set shell := [ "bash", "-euo", "pipefail", "-c" ]
set script-interpreter := [ "bash", "-euo", "pipefail" ]

default:
  @just --list

# --- Build & CI ---                                                                                                                            
[script]
clean:
  echo "🧹 Nettoyage du projet..."
  rm -rf dist .wrangler/build
  find . -name "*.log" -delete
  echo "✅ Clean terminé"
                                                                                                                                                  
[script]
clean-all: clean
  echo "🧹 Nettoyage complet (node_modules)…"
  rm -rf node_modules
  echo "✅ Clean-all terminé"
                               
[script]
build:
  if ! command -v wrangler &> /dev/null; then
    echo "❌ Erreur : wrangler n'est pas installé" >&2
    echo "→ Installe-le avec : npm install -g wrangler" >&2
    exit 1
  fi
  if ! wrangler build 2>/dev/null; then
    echo "⚠️  La commande 'wrangler build' n'est pas disponible dans cette version de wrangler" >&2
    echo "→ Passage en mode no-op (le déploiement fera le build si nécessaire)" >&2
  fi

[script]
test:
  if ! command -v npm &> /dev/null; then
    echo "❌ Erreur : npm n'est pas installé" >&2
    exit 1
  fi
  npm run test

[script]
test-api:
  if ! command -v npm &> /dev/null; then
    echo "❌ Erreur : npm n'est pas installé" >&2
    exit 1
  fi
  npm run test:api

[script]
test-sdk:
  if ! command -v npm &> /dev/null; then
    echo "❌ Erreur : npm n'est pas installé" >&2
    exit 1
  fi
  npm run test:sdk

[script]
test-all:
  if ! command -v npm &> /dev/null; then
    echo "❌ Erreur : npm n'est pas installé" >&2
    exit 1
  fi
  npm run test:all

[script]
deploy:
  if ! command -v npm &> /dev/null; then
    echo "❌ Erreur : npm n'est pas installé" >&2
    exit 1
  fi
  npm run deploy

[script]
deploy-prod:
  if ! command -v npm &> /dev/null; then
    echo "❌ Erreur : npm n'est pas installé" >&2
    exit 1
  fi
  npm run deploy:prod

ci:
  just build
  just test-all

# --- AI Cockpit ---
notes:
  mkdir -p notes/plans/
  mkdir -p notes/briefs/
  mkdir -p notes/reviews/
  mkdir -p notes/tests/

cockpit: notes
  zellij --layout .zellij/aider-agents.kdl

# --- Consultant (Interactif) ---
# Usage: 
#   just agent-chat              -> Ouvre une discussion générale
#   just agent-chat MonFichier.s -> Ouvre une discussion sur un fichier spécifique
agent-chat *FILES:
  aider \
    --config .aider/chat.yml \
    --no-auto-commits \
    --no-show-model-warnings \
    --no-stream \
    {{FILES}}

# --- Planner --- initial ---
[script]
agent-plan SLUG OBJECTIF: notes
  date="$(date +%Y-%m-%d)"
  brief="notes/briefs/${date}-{{SLUG}}.md"
  plan="notes/plans/${date}-{{SLUG}}-v1.md"

  mkdir -p notes/briefs notes/plans

  if [ -f "$brief" ]; then
    echo "❌ Le brief existe déjà: $brief" >&2
    exit 1
  fi

  printf "# Brief %s — %s\n\n## [v1] Objectif (immuable)\n  %s\n\n## [v2] Amendements\n- \n" \
    "$date" "{{SLUG}}" "{{OBJECTIF}}" > "$brief"

  echo "✅ Brief créé: $brief"

  tmp="$(mktemp)"
  trap 'rm -f "$tmp"' EXIT
  cat .aider/prompts/plan.md > "$tmp"
  echo "" >> "$tmp"
  printf "Version demandée: v1\nPlan à créer: %s\nBrief: %s\n\n" "$plan" "$brief" >> "$tmp"
  cat "$brief" >> "$tmp"

  aider --config .aider/plan.yml --no-show-model-warnings --no-stream --no-restore-chat-history --yes --message-file "$tmp"


# --- Planner --- amend ---
# Usage:
#   just agent-plan-amend justfile-ci v2          # date du jour
#   just agent-plan-amend justfile-ci v2 2026-01-10
[script]
agent-amend SLUG VERSION DATE="": notes
  if [ -n "{{DATE}}" ]; then
    date="{{DATE}}"
  else
    date="$(date +%Y-%m-%d)"
  fi

  brief="notes/briefs/${date}-{{SLUG}}.md"
  plan="notes/plans/${date}-{{SLUG}}-{{VERSION}}.md"

  if [ ! -f "$brief" ]; then
    echo "❌ Brief introuvable: $brief" >&2
    echo "→ Vérifie la date, ou crée-le: just agent-plan {{SLUG}} \"<objectif>\"" >&2
    exit 1
  fi

  if [ -f "$plan" ]; then
    echo "❌ Le plan existe déjà: $plan" >&2
    exit 1
  fi

  tmp="$(mktemp)"
  trap 'rm -f "$tmp"' EXIT
  cat .aider/prompts/plan_amend.md > "$tmp"
  echo "" >> "$tmp"
  printf "Version demandée: %s\nPlan à créer: %s\nBrief: %s\n\n" "{{VERSION}}" "$plan" "$brief" >> "$tmp"
  cat "$brief" >> "$tmp"

  aider --config .aider/plan.yml --no-show-model-warnings --no-stream --no-restore-chat-history --yes --message-file "$tmp"


# --- Developer ---
[script]
agent-dev SLUG VERSION DATE="": notes
  # Branche de travail
  branch="agent/{{SLUG}}-{{VERSION}}"
  git checkout -b -- "$branch" 2>/dev/null || git checkout -- "$branch"

  if [ -n "{{DATE}}" ]; then
    date="{{DATE}}"
  else
    date="$(date +%Y-%m-%d)"
  fi

  # Résoudre le fichier plan
  plan="notes/plans/${date}-{{SLUG}}-{{VERSION}}.md"

  if [ -z "${plan:-}" ] || [ ! -f "$plan" ]; then
    echo "❌ Plan introuvable: {{SLUG}} {{VERSION}}" >&2
    echo "→ Exemples :" >&2
    echo "   just agent-dev {{SLUG}} {{VERSION}}" >&2
    echo "   just agent-dev {{SLUG}} {{VERSION}} 2026-01-10" >&2
    exit 1
  fi

  echo "✅ Branche : $branch"
  echo "✅ Plan    : $plan"

  # Construire le prompt pour Aider
  tmp="$(mktemp)"
  trap 'rm -f "$tmp"' EXIT
  cat .aider/prompts/dev.md > "$tmp"
  echo "" >> "$tmp"
  printf "Branche actuelle: %s\nSLUG: %s\nVersion: %s\nPlan: %s\n\n" \
    "$branch" "{{SLUG}}" "{{VERSION}}" "$plan" >> "$tmp"

  aider --config .aider/dev.yml --no-show-model-warnings --no-stream --no-restore-chat-history --yes . --message-file "$tmp"


# --- Fixer ---
[script]
agent-fix SLUG DATE="":
  if [ -n "{{DATE}}" ]; then
    date="{{DATE}}"
  else
    date="$(date +%Y-%m-%d)"
  fi

  review_file=$(ls notes/reviews/${date}-{{SLUG}}.md | head -n 1)

  if [ ! -f "$review_file" ]; then
    echo "❌ Aucune review trouvée."
    exit 1
  fi

  echo "🛠️ Application de la review : $review_file"

  aider \
    --config .aider/dev.yml \
    --no-show-model-warnings \
    --no-stream \
    --no-restore-chat-history \
    --read "$review_file" \
    . \
    --message-file .aider/prompts/fix.md

  echo "✅ Corrections appliquées basées sur $review_file"


# --- Reviewer ---
[script]
agent-review SLUG: notes
  date="$(date +%Y-%m-%d)"
  out="notes/reviews/${date}-{{SLUG}}.md"
  mkdir -p notes/reviews

  if [ -f "$out" ]; then
    echo "❌ Review existe déjà: $out" >&2
    exit 1
  fi

  tmp_diff="$(mktemp)"
  tmp_msg="$(mktemp)"
  trap 'rm -f "$tmp_diff" "$tmp_msg"' EXIT

  git diff HEAD > "$tmp_diff"
  if [ ! -s "$tmp_diff" ]; then
    echo "ℹ️ Aucun diff à reviewer."
    exit 0
  fi

  # Pré-crée le fichier pour éviter tout prompt
  printf "# Review — %s — {{SLUG}}\n\n" "$date" > "$out"

  cat .aider/prompts/review.md > "$tmp_msg"
  echo "" >> "$tmp_msg"
  echo "SLUG: {{SLUG}}" >> "$tmp_msg"
  echo "DATE: $date" >> "$tmp_msg"
  echo "FICHIER_AUTORISE_UNIQUE: $out" >> "$tmp_msg"
  echo "" >> "$tmp_msg"
  echo "--- DIFF ---" >> "$tmp_msg"
  cat "$tmp_diff" >> "$tmp_msg"

  aider \
    --config .aider/review.yml \
    --no-show-model-warnings \
    --no-stream \
    --no-restore-chat-history \
    --yes \
    "$out" \
    --message-file "$tmp_msg"

  echo "✅ Review créée: $out"


# --- Tester ---
[script]
agent-test: notes 
  echo "🧪 Lancement des tests pour analyse par l'IA..."
  
  # On capture la sortie des tests dans un fichier temporaire
  tmp_log="$(mktemp)"
  trap 'rm -f "$tmp_log"' EXIT
  
  # On lance les tests et on capture tout (stdout et stderr)
  # On utilise || true pour ne pas arrêter le script si les tests échouent
  just ci > "$tmp_log" 2>&1 || true
  
  echo "--- RÉSULTATS DES TESTS ---"
  cat "$tmp_log"
  echo "---------------------------"

  # On donne le log d'erreur à Aider
  # S'il y a des erreurs, il doit les corriger. 
  # S'il n'y a pas d'erreurs, il doit simplement confirmer que tout est OK.
  aider \
    --config .aider/dev.yml \
    --no-show-model-warnings \
    --no-stream \
    --yes \
    . \
    --message "Voici les résultats des tests (just ci). Si des tests échouent ou s'il y a des erreurs/warnings, corrige-les. Sinon, réponds juste 'OK'.