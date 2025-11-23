export async function onRequest(context) {
  const request = context.request;
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'prompt'" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const apiKey = context.env.OPENAI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": f"Bearer ${apiKey}", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await res.json();
    return new Response(JSON.stringify({ resultado: data.choices?.[0]?.message?.content || "" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
