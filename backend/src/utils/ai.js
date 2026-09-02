// openrouter.js - Complete OpenRouter implementation using fetch

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Sends a chat completion request to OpenRouter.
 * @param {Array<{role: "system"|"user"|"assistant", content: string}>} messages
 * @param {{ json?: boolean, model?: string, temperature?: number }} options
 * @returns {Promise<string>} raw text content of the reply
 */
export const chatComplete = async (messages, options = {}) => {
  const {
    json = false,
    model = "dots-studio/dots-3-note-preview:free",
    temperature = 0.7
  } = options;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your backend .env file."
    );
  }

  const requestBody = {
    model,
    messages,
    temperature,
    ...(json ? { response_format: { type: "json_object" } } : {}),
  };

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:5000",
        "X-Title": process.env.YOUR_APP_NAME || "AI Interview Platform",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenRouter API");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter API request failed:", error);
    throw error;
  }
};

/**
 * Sends a streaming chat completion request to OpenRouter.
 * @param {Array<{role: "system"|"user"|"assistant", content: string}>} messages
 * @param {Function} onChunk - Callback function for each chunk
 * @param {{ model?: string, temperature?: number }} options
 * @returns {Promise<string>} complete response text
 */
export const chatCompleteStream = async (messages, onChunk, options = {}) => {
  const {
    model = "dots-studio/dots-3-note-preview:free",
    temperature = 0.7
  } = options;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your backend .env file."
    );
  }

  const requestBody = {
    model,
    messages,
    temperature,
    stream: true,
  };

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_APP_NAME || "AI Interview Platform",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(line => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              if (onChunk) onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
            continue;
          }
        }
      }
    }

    return fullResponse;
  } catch (error) {
    console.error("OpenRouter streaming request failed:", error);
    throw error;
  }
};



export default {
  chatComplete,
  chatCompleteStream,

};