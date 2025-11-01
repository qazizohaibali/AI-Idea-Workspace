export async function callOpenRouterChat(
    messages: { role: string; content: string }[],
    opts?: { model?: string; max_tokens?: number; temperature?: number }
  ) {
    const model = opts?.model ?? process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-20b:free";
    const apiKey = process.env.OPENROUTER_API_KEY;
    const endpoint = process.env.OPENROUTER_ENDPOINT ?? "https://openrouter.ai/api/v1/chat/completions";
  
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set in environment");
    }
  
    const body = {
      model,
      messages,
      max_tokens: opts?.max_tokens ?? 800,
      temperature: typeof opts?.temperature === "number" ? opts.temperature : 0.7,
    };
  
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`OpenRouter error ${res.status}: ${text}`);
    }
  
    try {
      const json = JSON.parse(text);
      const assistant =
        json?.choices?.[0]?.message?.content ??
        json?.choices?.[0]?.text ??
        (typeof json === "string" ? json : null);
  
      return { raw: json, assistant };
    } catch (err) {
      return { raw: text, assistant: text };
    }
  }
  