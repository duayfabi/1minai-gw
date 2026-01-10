// Test script for the /v1/responses endpoint
// Run with: node test/test-responses.js

const API_KEY = process.env.API_KEY || 'your-api-key-here';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8787';

async function testResponsesEndpoint() {
  console.log('Testing /v1/responses endpoint (non-streaming)...');
  try {
    const response = await fetch(`${BASE_URL}/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gw-gpt-4o',
        instructions: 'You are a helpful assistant.',
        input: [
          { role: 'user', content: 'Say "Hello, Responses API!" and nothing else.' }
        ],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('✗ Responses API failed:', response.status, error);
      return false;
    }

    const data = await response.json();
    console.log('✓ Responses response:', JSON.stringify(data, null, 2));

    // Basic structural validation
    const isValid = data.object === 'response' &&
      Array.isArray(data.output) &&
      data.output.length > 0 &&
      data.id.startsWith('resp-');

    if (isValid) {
      console.log('✓ Response structure is valid');
    } else {
      console.error('✗ Response structure is invalid');
    }

    return isValid;
  } catch (error) {
    console.error('✗ Responses API test failed:', error);
    return false;
  }
}

async function testResponsesStreaming() {
  console.log('\nTesting /v1/responses endpoint (streaming)...');
  try {
    const response = await fetch(`${BASE_URL}/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gw-claude-3-5-sonnet-20241022',
        instructions: 'You are a helpful assistant.',
        input: [
          'Count from 1 to 3.'
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('✗ Streaming failed:', response.status, error);
      return false;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            console.log('\n✓ Stream completed');
          } else {
            try {
              const parsed = JSON.parse(data);
              chunks.push(parsed);
              if (parsed.output?.[0]?.delta) {
                process.stdout.write(parsed.output[0].delta);
              }
            } catch (e) {
              console.error('Failed to parse chunk:', data);
            }
          }
        }
      }
    }

    console.log('✓ Received', chunks.length, 'chunks');
    const isValid = chunks.length > 0 && chunks[0].object === 'response.chunk';
    if (isValid) {
      console.log('✓ Streaming structure is valid');
    } else {
      console.error('✗ Streaming structure is invalid');
    }
    return isValid;
  } catch (error) {
    console.error('✗ Streaming test failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting /v1/responses API tests...');
  const results = {
    nonStreaming: await testResponsesEndpoint(),
    streaming: await testResponsesStreaming()
  };

  console.log('\n--- Test Results ---');
  console.log('Non-Streaming:', results.nonStreaming ? '✓ PASS' : '✗ FAIL');
  console.log('Streaming:', results.streaming ? '✓ PASS' : '✗ FAIL');

  const allPassed = Object.values(results).every(r => r);
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(console.error);
