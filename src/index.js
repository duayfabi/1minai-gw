import { formatModelsForOpenAI, validateModel, isVisionModel, isImageGenerationModel } from './models.js';
import { handleAuthenticationError, handleMissingApiKey, handleInvalidModel, handleInvalidRequest, handleUpstreamError, handleInternalError } from './errors.js';
import { processImageContent, validateImageSupport, hasImageContent } from './images.js';
import { calculatePromptTokens, calculateCompletionTokens, createUsageObject } from './tokens.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      switch (url.pathname) {
        case '/v1/chat/completions':
          return handleChatCompletions(request, env);
        case '/v1/responses':
          return handleResponses(request, env);
        case '/v1/models':
          return handleModels(env);
        case '/v1/images/generations':
          return handleImageGeneration(request, env);
        case '/health':
        case '/':
          return new Response('OK', { status: 200 });
        default:
          return new Response(JSON.stringify({ error: { message: 'Not Found', type: 'not_found_error' } }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
      }
    } catch (error) {
      return handleInternalError(error);
    }
  }
};

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}

async function handleChatCompletions(request, env) {
  // Authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return handleMissingApiKey();
  }

  const apiKey = authHeader.substring(7);

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return handleInvalidRequest('Invalid JSON in request body');
  }

  return processChatCompletion(body, apiKey, env);
}

async function handleResponses(request, env) {
  // Authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return handleMissingApiKey();
  }

  const apiKey = authHeader.substring(7);

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return handleInvalidRequest('Invalid JSON in request body');
  }

  // Transform Responses to Chat format
  const chatBody = transformResponsesToChat(body);

  // Process as chat completion but intercept the response to transform back
  const chatResponse = await processChatCompletion(chatBody, apiKey, env);

  if (!chatResponse.ok) {
    return chatResponse;
  }

  // If it's a streaming response, we need a different kind of transformation
  if (chatBody.stream) {
    return handleResponsesStreaming(chatResponse);
  }

  // For non-streaming, transform the final JSON
  const chatData = await chatResponse.json();
  const responsesData = transformChatToResponses(chatData);

  return new Response(JSON.stringify(responsesData), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function processChatCompletion(body, apiKey, env) {
  // Validate required fields
  if (!body.messages || !Array.isArray(body.messages)) {
    return handleInvalidRequest('Missing required parameter: messages', 'messages');
  }

  if (body.messages.length === 0) {
    return handleInvalidRequest('Messages array cannot be empty', 'messages');
  }

  // Validate model
  const modelValidation = validateModel(body.model);
  if (!modelValidation.valid) {
    return handleInvalidModel(body.model);
  }

  // Validate image support
  const imageValidation = validateImageSupport(body.model, body.messages, isVisionModel);
  if (!imageValidation.valid) {
    return handleInvalidRequest(imageValidation.error, 'model');
  }

  // Process images if present
  try {
    for (const message of body.messages) {
      if (Array.isArray(message.content)) {
        const envWithClientKey = { ...env, clientApiKey: apiKey };
        message.content = await processImageContent(message.content, envWithClientKey);
      }
    }
  } catch (error) {
    return handleInvalidRequest(`Image processing failed: ${error.message}`);
  }

  // Calculate prompt tokens
  const promptTokens = calculatePromptTokens(body.messages);

  const transformedRequest = transformOpenAITo1Min(body, modelValidation.model);

  let oneMinResponse;
  try {
    oneMinResponse = await fetch(`${env.ONE_MIN_API_URL}/api/features`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': apiKey
      },
      body: JSON.stringify(transformedRequest)
    });
  } catch (error) {
    return handleUpstreamError(error);
  }

  if (!oneMinResponse.ok) {
    const errorText = await oneMinResponse.text();
    console.error('1min AI API error:', oneMinResponse.status, errorText);
    return handleUpstreamError(new Error(`API returned ${oneMinResponse.status}`));
  }

  if (body.stream) {
    return handleChatStreaming(oneMinResponse, promptTokens);
  }

  const responseData = await oneMinResponse.json();
  // console.log('DEBUG: 1min.ai response:', JSON.stringify(responseData, null, 2));
  const transformedResponse = transform1MinToOpenAI(responseData, promptTokens);

  return new Response(JSON.stringify(transformedResponse), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handleModels(env) {
  try {
    const models = formatModelsForOpenAI();

    return new Response(JSON.stringify({
      object: 'list',
      data: models
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return handleInternalError(error);
  }
}

function transformOpenAITo1Min(openAIRequest, modelInfo) {
  // Convert OpenAI messages to 1min AI conversation format
  const conversation = openAIRequest.messages.map(msg => {
    if (msg.role === 'system') {
      return `System: ${msg.content}`;
    } else if (msg.role === 'user') {
      return `Human: ${msg.content}`;
    } else if (msg.role === 'assistant') {
      return `Assistant: ${msg.content}`;
    }
    return msg.content;
  }).join('\n\n');

  return {
    type: 'CHAT_WITH_AI',
    model: modelInfo.name, // Use the 1min AI identifier from config
    promptObject: {
      prompt: conversation,
      isMixed: false,
      webSearch: false
    },
    stream: openAIRequest.stream || false,
    temperature: openAIRequest.temperature,
    maxTokens: openAIRequest.max_tokens
  };
}

function transform1MinToOpenAI(oneMinResponse, promptTokens = 0) {
  // Extract the response text from 1min AI format
  // Based on official documentation: response is in aiRecord.aiRecordDetail.resultObject[0]
  const responseText = oneMinResponse.aiRecord?.aiRecordDetail?.resultObject?.[0] || '';
  const completionTokens = calculateCompletionTokens(responseText);

  return {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: oneMinResponse.aiRecord?.model,
    system_fingerprint: null,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: responseText
      },
      logprobs: null,
      finish_reason: 'stop'
    }],
    usage: createUsageObject(promptTokens, completionTokens)
  };
}

async function handleChatStreaming(response, promptTokens = 0) {
  const reader = response.body.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let totalCompletionTokens = 0;
  let completeResponse = '';

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            const finalChunk = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: 'gpt-3.5-turbo',
              choices: [{
                index: 0,
                delta: {},
                logprobs: null,
                finish_reason: 'stop'
              }],
              usage: createUsageObject(promptTokens, totalCompletionTokens)
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            break;
          }

          const chunk = decoder.decode(value);
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]' || data === '') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.response || parsed.text || '';
                if (content) {
                  completeResponse += content;
                  totalCompletionTokens = calculateCompletionTokens(completeResponse);
                }
                const transformed = transformStreamChunk(parsed);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(transformed)}\n\n`));
              } catch (e) {
                console.error('Failed to parse stream chunk:', e.message);
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handleResponsesStreaming(chatResponse) {
  const reader = chatResponse.body.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // No explicit [DONE] for Responses API in some specs, but let's follow the chat pattern
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            break;
          }

          const chunk = decoder.decode(value);
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]' || data === '') continue;

              try {
                const chatChunk = JSON.parse(data);
                const responsesChunk = transformChatChunkToResponsesChunk(chatChunk);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(responsesChunk)}\n\n`));
              } catch (e) {
                console.error('Failed to parse chat chunk for responses:', e.message);
              }
            }
          }
        }
      } catch (error) {
        console.error('Responses streaming error:', error);
        controller.error(error);
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function transformResponsesToChat(responsesBody) {
  const messages = [];

  // Convert instructions to system message
  if (responsesBody.instructions) {
    messages.push({ role: 'system', content: responsesBody.instructions });
  }

  // Convert input to messages
  if (responsesBody.input && Array.isArray(responsesBody.input)) {
    for (const item of responsesBody.input) {
      if (item.role && item.content) {
        messages.push({ role: item.role, content: item.content });
      } else if (typeof item === 'string') {
        messages.push({ role: 'user', content: item });
      }
    }
  }

  return {
    model: responsesBody.model,
    messages: messages,
    stream: responsesBody.stream || false,
    temperature: responsesBody.temperature,
    max_tokens: responsesBody.max_tokens || responsesBody.max_completion_tokens,
    response_format: responsesBody.response_format
  };
}

function transformChatToResponses(chatResponse) {
  const output = chatResponse.choices.map(choice => ({
    id: `msg-${Date.now()}`,
    object: 'response.message',
    role: choice.message.role,
    content: choice.message.content,
    finish_reason: choice.finish_reason
  }));

  return {
    id: chatResponse.id.replace('chatcmpl-', 'resp-'),
    object: 'response',
    created: chatResponse.created,
    model: chatResponse.model,
    status: 'completed',
    output: output,
    usage: chatResponse.usage
  };
}

function transformChatChunkToResponsesChunk(chatChunk) {
  const output = chatChunk.choices.map(choice => {
    const item = {
      index: choice.index,
      object: 'response.chunk.delta'
    };
    if (choice.delta && choice.delta.content !== undefined) {
      item.delta = choice.delta.content;
    }
    if (choice.finish_reason) {
      item.finish_reason = choice.finish_reason;
    }
    return item;
  });

  return {
    id: chatChunk.id.replace('chatcmpl-', 'resp-'),
    object: 'response.chunk',
    created: chatChunk.created,
    model: chatChunk.model,
    output: output,
    usage: chatChunk.usage
  };
}

async function handleImageGeneration(request, env) {
  // Authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return handleMissingApiKey();
  }

  const apiKey = authHeader.substring(7);

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return handleInvalidRequest('Invalid JSON in request body');
  }

  // Validate required fields
  if (!body.prompt) {
    return handleInvalidRequest('Missing required parameter: prompt', 'prompt');
  }

  // Validate model for image generation
  const modelValidation = validateModel(body.model);
  if (!modelValidation.valid || !isImageGenerationModel(body.model)) {
    return handleInvalidModel(body.model);
  }

  const modelInfo = modelValidation.model;

  // Transform request for 1min AI
  const transformedRequest = {
    type: 'IMAGE_GENERATOR',
    model: modelInfo.name, // Use the 1min AI identifier from config
    promptObject: {
      prompt: body.prompt,
      n: body.n || 1,
      size: body.size || '1024x1024'
    }
  };

  try {
    const oneMinResponse = await fetch(`${env.ONE_MIN_API_URL}/api/features`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': apiKey  // Always use the client's API key
      },
      body: JSON.stringify(transformedRequest)
    });

    if (!oneMinResponse.ok) {
      return handleUpstreamError(new Error(`API returned ${oneMinResponse.status}`));
    }

    const responseData = await oneMinResponse.json();

    // Transform response to OpenAI format
    const transformedResponse = {
      created: Math.floor(Date.now() / 1000),
      data: [{
        url: responseData.temporaryUrl || responseData.aiRecord?.temporaryUrl,
        revised_prompt: body.prompt
      }]
    };

    return new Response(JSON.stringify(transformedResponse), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return handleUpstreamError(error);
  }
}

function transformStreamChunk(chunk) {
  return {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: chunk.model || 'gpt-3.5-turbo',
    system_fingerprint: null,
    choices: [{
      index: 0,
      delta: {
        content: chunk.response || chunk.text || ''
      },
      logprobs: null,
      finish_reason: null
    }]
  };
}