import type { APIRoute } from 'astro';
import OpenAI from 'openai';

// Initialize OpenAI with better error handling
const apiKey = import.meta.env.OPENAI_API_KEY;
// Fallback to a known valid model. "gpt-4o-mini" is widely available & inexpensive.
let modelName = import.meta.env.OPENAI_MODEL || 'gpt-4o-mini';

// Guard against common typos / deprecated names
const KNOWN_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'];
if (!KNOWN_MODELS.includes(modelName)) {
  console.warn(`⚠️ Unknown/unsupported model '${modelName}', falling back to 'gpt-4o-mini'.`);
  modelName = 'gpt-4o-mini';
}

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if API key is available
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key is not configured',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✅ API Key exists:', apiKey.substring(0, 20) + '...');
    console.log('🔎 Using model:', modelName);

    const body = await request.json();
    console.log('📨 Request body:', body);

  // Choose token parameter name based on model family (OpenAI new naming uses max_completion_tokens)
  const useNewTokenParam = /gpt-(4o|4\.1)/i.test(modelName);
    const requestPayload: any = {
      model: modelName,
      messages: body.messages,
    };

    if (useNewTokenParam) {
      requestPayload.max_completion_tokens = 500;
    } else {
      requestPayload.max_tokens = 500;
    }

    let completion;
    try {
      completion = await openai.chat.completions.create(requestPayload);
    } catch (apiErr: any) {
      console.error('❌ OpenAI SDK error raw:', apiErr);
      // Surface better message
      return new Response(
        JSON.stringify({
          error: 'Upstream model request failed',
          details: apiErr?.message || 'Unknown upstream error',
          model: modelName,
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('🤖 OpenAI Response:', completion.choices[0].message.content);

    return new Response(
      JSON.stringify({
        message: completion.choices[0].message.content,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Handler Error (non-OpenAI):', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
