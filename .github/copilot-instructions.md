<!-- Copilot instructions for AI coding agents -->
# 1min AI Cloudflare Gateway — Copilot Instructions

Purpose: quickly orient an AI coding agent to the repository so it can make safe, targeted changes.

- **Big picture**: This is a Cloudflare Workers gateway that proxies OpenAI-formatted requests to the 1min AI platform. Core behavior lives in `src/index.js` (router/endpoints). Model metadata and aliases are in `src/models.js`. Image and vision handling live in `src/images.js`. Error formatting and OpenAI-compatible responses are in `src/errors.js`. Token accounting is in `src/tokens.js`.

- **Why structure matters**: The project is a "pure proxy" — it does NOT store user API keys. The gateway validates and transforms requests and forwards them using the client's Authorization header. Preserve that behavior when editing auth, routing, or forwarding logic.

- **Key files to inspect for any change**:
  - `src/index.js` — main request router and endpoint mapping
  - `src/models.js` — model capabilities, aliases, and validation logic
  - `src/images.js` — image upload, base64 handling, and asset upload flows
  - `src/errors.js` — canonical OpenAI-style error payloads
  - `src/tokens.js` — token estimation and streaming accumulation
  - `test/mock-server.js` and `test/*` — integration tests and local mock server behavior

- **Developer workflows / commands** (use exact npm scripts):
  - Start local gateway with Wrangler: `npm run dev` (runs `wrangler dev --env development`).
  - Start the mock 1min API server: `node test/mock-server.js` (run this in a separate terminal for integration testing).
  - Run API integration tests: `npm run test:api` (runs `node test/test-api.js`).
  - Run OpenAI SDK compatibility tests: `npm run test:sdk`.
  - Deploy to Cloudflare: `npm run deploy` or `npm run deploy:prod` (uses `wrangler deploy --env=...`).

- **Project-specific conventions**:
  - Environment-driven Wrangler usage: package scripts use `--env development` and `--env=production`. Do not hardcode environment names — rely on `wrangler.toml` and npm scripts.
  - Pure proxy pattern: never add server-side storage for user API keys — changes that require key storage need explicit justification.
  - Streaming support: the codebase supports streaming chat responses; preserve SSE or streaming logic when modifying response transformers.
  - Image inputs: `src/images.js` accepts base64 or external URLs; maintain base64 handling and automatic asset upload semantics.

- **Integration points & dependencies**:
  - External API: 1min AI controlled by `ONE_MIN_API_URL` env var (gateway forwards requests using the client's Authorization header).
  - Cloudflare Workers / Wrangler: runtime and deploy tooling are `wrangler` based (see `package.json` devDependencies).
  - Tests use `vitest` (unit) and node scripts in `test/` for integration.
  - Optional `openai` dependency is used in SDK compatibility tests.

- **When changing endpoints or payload formats**:
  - Update `src/index.js` and `src/errors.js` together so response shape and error format stay OpenAI-compatible.
  - Run `node test/mock-server.js` + `npm run dev` and `npm run test:api` locally to validate end-to-end transformations.

- **Small examples** (copyable):
  - Start local test environment:

```
node test/mock-server.js   # mock 1min API
npm run dev                # start gateway under wrangler dev
```

  - Quick curl to exercise gateway (same as README example):

```
curl https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_1MIN_AI_API_KEY" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hi"}]}'
```

- **What NOT to do (explicit rules)**:
  - Do not add server-side storage for user API keys.
  - Do not change the OpenAI-compatible error shape in `src/errors.js` without updating tests.
  - Avoid modifying model aliasing semantics in `src/models.js` without preserving backwards compatibility entries.

If anything above is unclear or you want deeper conventions (naming rules, preferred logging format, test coverage targets), tell me which area to expand and I will iterate.
