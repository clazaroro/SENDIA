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

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const data = await res.json();
    return new Response(JSON.stringify({ url: data.data?.[0]?.url || "" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
