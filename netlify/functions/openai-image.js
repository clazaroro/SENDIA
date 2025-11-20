// netlify/functions/openai-image.js
// VERSIÓN REAL OPTIMIZADA

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Falta 'prompt' en la petición o no es un string.",
        }),
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "OPENAI_API_KEY no está configurada.",
        }),
      };
    }

    console.log("[SEND+IA imagen] prompt:", prompt.slice(0, 200));

    const respuesta = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1-mini", // más ligero
          prompt,
          size: "512x512",          // ⚠️ más rápido y suficiente para el boceto
          n: 1,
        }),
      }
    );

    const raw = await respuesta.text();
    console.log("[SEND+IA imagen] respuesta cruda:", raw);

    if (!respuesta.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Error desde OpenAI (imagen)",
          detalle: raw,
        }),
      };
    }

    const data = JSON.parse(raw);
    const url = data?.data?.[0]?.url;

    if (!url) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "No se recibió URL de imagen desde la IA.",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    };
  } catch (error) {
    console.error("Error en la función openai-image:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error interno en openai-image",
      }),
    };
  }
};



