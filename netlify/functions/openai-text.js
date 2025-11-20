// netlify/functions/openai-text.js

// Función serverless en formato CommonJS (el que Netlify entiende por defecto)
exports.handler = async (event, context) => {
  // Solo aceptamos POST
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
        body: JSON.stringify({ error: "Falta 'prompt' en la petición." }),
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "OPENAI_API_KEY no está configurada." }),
      };
    }

    // Llamada a la nueva API de OpenAI (endpoint /v1/responses)
    const respuesta = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.1-mini",
        input: prompt,               // 👉 aquí va un string, no un array de mensajes
        max_output_tokens: 800,
      }),
    });

    if (!respuesta.ok) {
      const errorText = await respuesta.text();
      console.error("Error OpenAI:", errorText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Error desde OpenAI", detalle: errorText }),
      };
    }

    const data = await respuesta.json();

    // Intentamos leer el texto según el formato de la Responses API
    let texto = "";
    try {
      const out = data.output?.[0]?.content?.[0]?.text;
      texto = typeof out === "string" ? out : out?.value || "";
    } catch (e) {
      console.error("No se pudo leer el texto de la respuesta", e, data);
      texto = "(No se pudo extraer el texto de la respuesta de la IA)";
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resultado: texto }),
    };
  } catch (error) {
    console.error("Error en la función openai-text:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno en openai-text" }),
    };
  }
};

