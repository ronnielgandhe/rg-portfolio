import OpenAI from 'openai';
export { renderers } from '../../renderers.mjs';

const openai = new OpenAI({
  apiKey: "YOUR_OPENAI_API_KEY_HERE"
});
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: body.messages,
      temperature: 0.7,
      max_tokens: 500
    });
    return new Response(
      JSON.stringify({
        message: completion.choices[0].message.content
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to generate response"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
