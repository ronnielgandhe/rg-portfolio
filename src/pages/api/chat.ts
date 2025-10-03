import type { APIRoute } from 'astro';
import OpenAI from 'openai';

// Initialize OpenAI with better error handling
const apiKey = import.meta.env.OPENAI_API_KEY;
const modelName = import.meta.env.OPENAI_MODEL || 'gpt-5-mini';

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

    // Choose token parameter name based on model family
    const useNewTokenParam = /gpt-(4o|5)/i.test(modelName);
    const requestPayload: any = {
      model: modelName,
      messages: body.messages,
    };

    if (useNewTokenParam) {
      requestPayload.max_completion_tokens = 500;
    } else {
      requestPayload.max_tokens = 500;
    }

    const completion = await openai.chat.completions.create(requestPayload);

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
    console.error('❌ API Error:', error);
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
