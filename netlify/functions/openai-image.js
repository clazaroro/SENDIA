// netlify/functions/openai-image.js

exports.handler = async (event, context) => {
  // Solo permitimos POST
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
          error: "OPENAI_API_KEY no está configurada en Netlify.",
        }),
      };
    }

    // Llamada a la API de imágenes de OpenAI
    const respuesta = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1", // 👈 modelo correcto para imágenes
          prompt,
          size: "1024x1024",
          n: 1,
        }),
      }
    );

    if (!respuesta.ok) {
      const errorText = await respuesta.text();
      console.error("Error OpenAI (imagen):", errorText);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Error desde OpenAI (imagen)",
          detalle: errorText,
        }),
      };
    }

    const data = await respuesta.json();

    // La URL viene normalmente en data.data[0].url
    const url = data?.data?.[0]?.url;
    if (!url) {
      console.error("Respuesta de OpenAI sin URL de imagen:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "No se recibió URL de imagen desde la IA.",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
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

