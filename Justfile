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