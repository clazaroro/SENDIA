// netlify/functions/openai-image.js
// VERSIÓN DE PRUEBA (sin OpenAI)

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    // Solo devolvemos una imagen falsa de prueba
    const url = "https://via.placeholder.com/512x512.png?text=SEND+IA+Test";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    };
  } catch (error) {
    console.error("Error en la función openai-image (test):", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno en openai-image (test)" }),
    };
  }
};




