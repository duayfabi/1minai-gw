// Comprehensive model mapping with all latest models
export const MODELS_CONFIG = {
  // OpenAI Models
  'gw-o3-mini': { name: 'o3-mini', provider: 'openai' },
  'gw-o1-preview': { name: 'o1-preview', provider: 'openai' },
  'gw-o1-mini': { name: 'o1-mini', provider: 'openai' },
  'gw-gpt-4o': { name: 'gpt-4o', provider: 'openai', vision: true },
  'gw-gpt-4o-2024-11-20': { name: 'gpt-4o-2024-11-20', provider: 'openai', vision: true },
  'gw-gpt-4o-2024-08-06': { name: 'gpt-4o-2024-08-06', provider: 'openai', vision: true },
  'gw-gpt-4o-2024-05-13': { name: 'gpt-4o-2024-05-13', provider: 'openai', vision: true },
  'gw-gpt-4o-mini': { name: 'gpt-4o-mini', provider: 'openai', vision: true },
  'gw-gpt-4o-mini-2024-07-18': { name: 'gpt-4o-mini-2024-07-18', provider: 'openai', vision: true },
  'gw-gpt-4-turbo': { name: 'gpt-4-turbo', provider: 'openai', vision: true },
  'gw-gpt-4-turbo-2024-04-09': { name: 'gpt-4-turbo-2024-04-09', provider: 'openai', vision: true },
  'gw-gpt-4-turbo-preview': { name: 'gpt-4-turbo-preview', provider: 'openai', vision: true },
  'gw-gpt-4-vision-preview': { name: 'gpt-4-vision-preview', provider: 'openai', vision: true },
  'gw-gpt-4': { name: 'gpt-4', provider: 'openai' },
  'gw-gpt-4-0613': { name: 'gpt-4-0613', provider: 'openai' },
  'gw-gpt-4-0314': { name: 'gpt-4-0314', provider: 'openai' },
  'gw-gpt-3.5-turbo': { name: 'gpt-3.5-turbo', provider: 'openai' },
  'gw-gpt-3.5-turbo-0125': { name: 'gpt-3.5-turbo-0125', provider: 'openai' },
  'gw-gpt-3.5-turbo-1106': { name: 'gpt-3.5-turbo-1106', provider: 'openai' },
  'gw-gpt-5': { name: 'gpt-5', provider: 'openai' },
  'gw-gpt-5-chat-latest': { name: 'gpt-5-chat-latest', provider: 'openai' },
  'gw-gpt-5.1-codex': { name: 'gpt-5.1-codex', provider: 'openai' },
  'gw-gpt-5.1-codex-mini': { name: 'gpt-5.1-codex-mini', provider: 'openai' },
  'gw-o3': { name: 'o3', provider: 'openai' },

  // Claude Models
  'gw-claude-instant-1.2': { name: 'claude-instant-1.2', provider: 'anthropic' },
  'gw-claude-2.1': { name: 'claude-2.1', provider: 'anthropic' },
  'gw-claude-3-5-sonnet-20241022': { name: 'claude-3-5-sonnet-20241022', provider: 'anthropic', vision: true },
  'gw-claude-3-5-sonnet-20240620': { name: 'claude-3-5-sonnet-20240620', provider: 'anthropic', vision: true },
  'gw-claude-3-5-haiku-20241022': { name: 'claude-3-5-haiku-20241022', provider: 'anthropic', vision: true },
  'gw-claude-3-opus-20240229': { name: 'claude-3-opus-20240229', provider: 'anthropic', vision: true },
  'gw-claude-3-sonnet-20240229': { name: 'claude-3-sonnet-20240229', provider: 'anthropic', vision: true },
  'gw-claude-3-haiku-20240307': { name: 'claude-3-haiku-20240307', provider: 'anthropic', vision: true },
  'gw-claude-sonnet-4-5-20250929': { name: 'claude-sonnet-4-5-20250929', provider: 'anthropic', vision: true },
  'gw-claude-sonnet-4-20250514': { name: 'claude-sonnet-4-20250514', provider: 'anthropic', vision: true },
  'gw-claude-opus-4-5-20251101': { name: 'claude-opus-4-5-20251101', provider: 'anthropic', vision: true },
  'gw-claude-opus-4-1-20250805': { name: 'claude-opus-4-1-20250805', provider: 'anthropic', vision: true },
  'gw-claude-haiku-4-5-20251001': { name: 'claude-haiku-4-5-20251001', provider: 'anthropic', vision: true },

  // Google Models
  'gw-gemini-1.0-pro': { name: 'gemini-1.0-pro', provider: 'google' },
  'gw-gemini-1.5-pro': { name: 'gemini-1.5-pro', provider: 'google', vision: true },
  'gw-gemini-1.5-pro-002': { name: 'gemini-1.5-pro-002', provider: 'google', vision: true },
  'gw-gemini-1.5-flash': { name: 'gemini-1.5-flash', provider: 'google', vision: true },
  'gw-gemini-1.5-flash-002': { name: 'gemini-1.5-flash-002', provider: 'google', vision: true },
  'gw-gemini-1.5-flash-8b': { name: 'gemini-1.5-flash-8b', provider: 'google', vision: true },
  'gw-gemini-3-pro-preview': { name: 'gemini-3-pro-preview', provider: 'google', vision: true },
  'gw-chat-bison@002': { name: 'chat-bison@002', provider: 'google' },

  // Meta Llama Models
  'gw-llama-3.2-90b-vision-instruct': { name: 'llama-3.2-90b-vision-instruct', provider: 'meta', vision: true },
  'gw-llama-3.2-11b-vision-instruct': { name: 'llama-3.2-11b-vision-instruct', provider: 'meta', vision: true },
  'gw-llama-3.1-405b-instruct': { name: 'llama-3.1-405b-instruct', provider: 'meta' },
  'gw-llama-3.1-70b-instruct': { name: 'llama-3.1-70b-instruct', provider: 'meta' },
  'gw-llama-3.1-8b-instruct': { name: 'llama-3.1-8b-instruct', provider: 'meta' },
  'gw-meta/llama-2-70b-chat': { name: 'meta/llama-2-70b-chat', provider: 'meta' },
  'gw-meta/meta-llama-3-70b-instruct': { name: 'meta/meta-llama-3-70b-instruct', provider: 'meta' },
  'gw-meta/meta-llama-3.1-405b-instruct': { name: 'meta/meta-llama-3.1-405b-instruct', provider: 'meta' },

  // Mistral Models
  'gw-mistral-large-latest': { name: 'mistral-large-latest', provider: 'mistral' },
  'gw-mistral-large-2407': { name: 'mistral-large-2407', provider: 'mistral' },
  'gw-mistral-large-2402': { name: 'mistral-large-2402', provider: 'mistral' },
  'gw-mistral-small-latest': { name: 'mistral-small-latest', provider: 'mistral' },
  'gw-mistral-small-2409': { name: 'mistral-small-2409', provider: 'mistral' },
  'gw-mistral-nemo': { name: 'mistral-nemo', provider: 'mistral' },
  'gw-pixtral-12b': { name: 'pixtral-12b', provider: 'mistral', vision: true },
  'gw-open-mixtral-8x22b': { name: 'open-mixtral-8x22b', provider: 'mistral' },
  'gw-open-mixtral-8x7b': { name: 'open-mixtral-8x7b', provider: 'mistral' },
  'gw-open-mistral-7b': { name: 'open-mistral-7b', provider: 'mistral' },
  'gw-codestral-2405': { name: 'codestral-2405', provider: 'mistral' },
  'gw-mistralai/mixtral-8x7b-instruct-v0.1': { name: 'mistralai/mixtral-8x7b-instruct-v0.1', provider: 'mistral' },

  // DeepSeek Models
  'gw-deepseek-chat': { name: 'deepseek-chat', provider: 'deepseek' },
  'gw-deepseek-reasoner': { name: 'deepseek-reasoner', provider: 'deepseek' },

  // Alibaba Cloud Models
  'gw-qwen3-coder-plus': { name: 'qwen3-coder-plus', provider: 'alibaba' },
  'gw-qwen3-coder-flash': { name: 'qwen3-coder-flash', provider: 'alibaba' },

  // Other Text Models
  'gw-command': { name: 'command', provider: 'cohere' },
  'gw-grok-2': { name: 'grok-2', provider: 'xai' },
  'gw-grok-code-fast-1': { name: 'grok-code-fast-1', provider: 'xai' },

  // Image Generation Models
  'gw-dall-e-3': { name: 'dall-e-3', provider: 'openai', type: 'image_generation' },
  'gw-dall-e-2': { name: 'dall-e-2', provider: 'openai', type: 'image_generation' },

  // Stability AI
  'gw-stable-image': { name: 'stable-image', provider: 'stability', type: 'image_generation' },
  'gw-stable-diffusion-xl-1024-v1-0': { name: 'stable-diffusion-xl-1024-v1-0', provider: 'stability', type: 'image_generation' },
  'gw-stable-diffusion-v1-6': { name: 'stable-diffusion-v1-6', provider: 'stability', type: 'image_generation' },
  'gw-esrgan-v1-x2plus': { name: 'esrgan-v1-x2plus', provider: 'stability', type: 'image_generation' },

  // Leonardo AI
  'gw-6b645e3a-d64f-4341-a6d8-7a3690fbf042': { name: '6b645e3a-d64f-4341-a6d8-7a3690fbf042', provider: 'leonardo', type: 'image_generation' }, // Leonardo Phoenix
  'gw-b24e16ff-06e3-43eb-8d33-4416c2d75876': { name: 'b24e16ff-06e3-43eb-8d33-4416c2d75876', provider: 'leonardo', type: 'image_generation' }, // Leonardo Lightning XL
  'gw-e71a1c2f-4f80-4800-934f-2c68979d8cc8': { name: 'e71a1c2f-4f80-4800-934f-2c68979d8cc8', provider: 'leonardo', type: 'image_generation' }, // Leonardo Anime XL
  'gw-1e60896f-3c26-4296-8ecc-53e2afecc132': { name: '1e60896f-3c26-4296-8ecc-53e2afecc132', provider: 'leonardo', type: 'image_generation' }, // Leonardo Diffusion XL
  'gw-aa77f04e-3eec-4034-9c07-d0f619684628': { name: 'aa77f04e-3eec-4034-9c07-d0f619684628', provider: 'leonardo', type: 'image_generation' }, // Leonardo Kino XL
  'gw-5c232a9e-9061-4777-980a-ddc8e65647c6': { name: '5c232a9e-9061-4777-980a-ddc8e65647c6', provider: 'leonardo', type: 'image_generation' }, // Leonardo Vision XL
  'gw-2067ae52-33fd-4a82-bb92-c2c55e7d2786': { name: '2067ae52-33fd-4a82-bb92-c2c55e7d2786', provider: 'leonardo', type: 'image_generation' }, // Leonardo Albedo Base XL

  // Midjourney
  'gw-midjourney': { name: 'midjourney', provider: 'midjourney', type: 'image_generation' },
  'gw-midjourney_6_1': { name: 'midjourney_6_1', provider: 'midjourney', type: 'image_generation' },

  // Clipdrop
  'gw-clipdrop': { name: 'clipdrop', provider: 'clipdrop', type: 'image_generation' },

  // Flux Models
  'gw-flux-schnell': { name: 'flux-schnell', provider: 'black-forest-labs', type: 'image_generation' },
  'gw-flux-dev': { name: 'flux-dev', provider: 'black-forest-labs', type: 'image_generation' },
  'gw-flux-pro': { name: 'flux-pro', provider: 'black-forest-labs', type: 'image_generation' },
  'gw-flux-1.1-pro': { name: 'flux-1.1-pro', provider: 'black-forest-labs', type: 'image_generation' }
};

// OpenAI-style model aliases for backwards compatibility
export const MODEL_ALIASES = {
  'gw-gpt-4': 'gw-gpt-4o',
  'gw-gpt-3.5-turbo': 'gw-gpt-3.5-turbo-0125',
  'gw-claude-instant': 'gw-claude-instant-1.2',
  'gw-claude-2': 'gw-claude-2.1',
  'gw-claude-3-opus': 'gw-claude-3-opus-20240229',
  'gw-claude-3-sonnet': 'gw-claude-3-sonnet-20240229',
  'gw-claude-3-haiku': 'gw-claude-3-haiku-20240307',
  'gw-gemini': 'gw-gemini-1.5-pro',
  'gw-gemini-pro': 'gw-gemini-1.0-pro',
  'gw-mistral-large': 'gw-mistral-large-latest',
  'gw-mistral-small': 'gw-mistral-small-latest',
  'gw-dall-e': 'gw-dall-e-3',
  'gw-stable-diffusion': 'gw-stable-diffusion-xl-1024-v1-0',
  'gw-leonardo-phoenix': 'gw-6b645e3a-d64f-4341-a6d8-7a3690fbf042',
  'gw-leonardo-vision': 'gw-5c232a9e-9061-4777-980a-ddc8e65647c6',
  'gw-gpt-5': 'gw-gpt-5',
  'gw-claude-4-5': 'gw-claude-sonnet-4-5-20250929',
  'gw-deepseek': 'gw-deepseek-chat'
};

export function getModelInfo(modelId) {
  // Check aliases first
  const resolvedModel = MODEL_ALIASES[modelId] || modelId;
  return MODELS_CONFIG[resolvedModel] || null;
}

export function isVisionModel(modelId) {
  const modelInfo = getModelInfo(modelId);
  return modelInfo?.vision === true;
}

export function isImageGenerationModel(modelId) {
  const modelInfo = getModelInfo(modelId);
  return modelInfo?.type === 'image_generation';
}

export function validateModel(modelId) {
  const modelInfo = getModelInfo(modelId);
  if (!modelInfo) {
    return { valid: false, error: `Model '${modelId}' is not supported` };
  }

  return { valid: true, model: modelInfo };
}

export function getAllModels() {
  return Object.keys(MODELS_CONFIG);
}

export function formatModelsForOpenAI() {
  const models = getAllModels();

  return models.map(modelId => {
    const modelInfo = getModelInfo(modelId);
    return {
      id: modelId,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: modelInfo.provider,
      permission: [],
      root: modelId,
      parent: null
    };
  });
}