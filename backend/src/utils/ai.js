import OpenAI from "openai";

let client;

// Lazily instantiate so a missing OPENAI_API_KEY only fails when an
// interview/report call actually happens, not at server boot.
const getClient = () => {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it to your backend .env file."
      );
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

/**
 * Sends a chat completion request.
 * @param {Array<{role: "system"|"user"|"assistant", content: string}>} messages
 * @param {{ json?: boolean, model?: string }} options
 * @returns {Promise<string>} raw text content of the reply
 */
export const chatComplete = async (messages, options = {}) => {
  const { json = false, model = "gpt-4o-mini" } = options;

  const response = await getClient().chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    ...(json ? { response_format: { type: "json_object" } } : {}),
  });

  return response.choices[0].message.content;
};
