// ==========================
// SENDIA – script.js moderno
// Adaptado al nuevo HTML 2025
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------------
  // ELEMENTOS DEL DOM
  // -----------------------------
  const textareaBase = document.querySelector("#textoBase");
  const promptEditable = document.querySelector("#promptEditable");
  const resultadoTexto = document.querySelector("#resultadoTexto");
  const imgPictograma = document.querySelector("#imgPictograma");

  const btnGenerarPrompt = document.querySelector(".btn.btn-primary");
  const btnGenerarContenido = document.querySelector(".btn.btn-secondary");
  const tabs = document.querySelectorAll(".results-tab");

  // Botones de acción
  const btnCopiarContenido = document.querySelector("#btnCopiarContenido");
  const btnCompartirTexto = document.querySelector("#btnCompartirTexto");
  const btnGuardarTexto = document.querySelector("#btnGuardarTexto");
  const btnDescargarMP3 = document.querySelector("#btnDescargarMP3");
  const btnImprimirTexto = document.querySelector("#btnImprimirTexto");

  const btnDescargarImagen = document.querySelector("#btnDescargarImagen");
  const btnCompartirImagen = document.querySelector("#btnCompartirImagen");
  const btnGuardarImagen = document.querySelector("#btnGuardarImagen");
  const btnImprimirImagen = document.querySelector("#btnImprimirImagen");


  // -----------------------------
  // CLAVE API (AÑADE LA TUYA)
  // -----------------------------
  const OPENAI_KEY = "AQUI_TU_API_KEY";


  // -----------------------------
  // FUNCIÓN: Construir Prompt
  // -----------------------------
  function construirPrompt() {
    const texto = textareaBase.value.trim();

    return `
Actúa como un docente experto en educación inclusiva SEND.

Adapta el siguiente contenido usando:
- Lenguaje claro
- Frases simples
- Pasos numerados
- Explicaciones visuales cuando sea posible

TEXTO BASE:
${texto || "No se proporcionó texto. Genera un contenido adaptado desde cero."}
`;
  }


  // -----------------------------
  // Generar prompt
  // -----------------------------
  btnGenerarPrompt.addEventListener("click", () => {
    const prompt = construirPrompt();
    promptEditable.value = prompt;

    activarTab("prompt");
  });


  // -----------------------------
  // Llamada a OpenAI – Texto (ChatGPT 5.1)
  // -----------------------------
  async function generarTexto(prompt) {
    const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await respuesta.json();
    return data.choices?.[0]?.message?.content || "(Sin respuesta)";
  }


  // -----------------------------
  // Botón: Generar Contenido Adaptado
  // -----------------------------
  btnGenerarContenido.addEventListener("click", async () => {
    const prompt = promptEditable.value.trim() || construirPrompt();

    resultadoTexto.textContent = "Generando contenido…";

    const texto = await generarTexto(prompt);

    resultadoTexto.textContent = texto;

    activarTab("contenido");
  });



  // -----------------------------
  // Generar Imagen – DALL·E
  // -----------------------------
  async function generarImagen(prompt) {
    const respuesta = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024"
      })
    });

    const data = await respuesta.json();
    return data.data?.[0]?.url;
  }


  // Botón: Generar Imagen desde prompt
  document.querySelector(".chip-group").addEventListener("click", async (e) => {
    if (e.target.textContent.includes("Imagen")) {

      const promptImagen = `
Crea un pictograma educativo SEND:
- Fondo blanco
- Colores planos
- Texto claro dentro de la imagen (sin errores)
- Estilo pictograma escolar
- Muy legible para alumnado SEND

TEXTO/ESCENA:
${textareaBase.value.trim() || "Escena escolar sencilla"}
      `;

      imgPictograma.style.display = "none";
      imgPictograma.src = "";

      activarTab("imagen");

      const url = await generarImagen(promptImagen);

      imgPictograma.src = url;
      imgPictograma.style.display = "block";
    }
  });


  // --------------------------------
  // FUNCIONES DE ACCIÓN (copiar, imprimir…)
  // --------------------------------

  // Copiar contenido adaptado
  document.querySelector("#btnCopiarTexto")?.addEventListener("click", () => {
    navigator.clipboard.writeText(resultadoTexto.textContent);
    alert("Contenido copiado");
  });

  // Descargar MP3 (TTS)
  document.querySelector("#btnDescargarMp3")?.addEventListener("click", async () => {
    const texto = resultadoTexto.textContent;

    const respuesta = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: texto
      })
    });

    const blob = await respuesta.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sendia.mp3";
    a.click();
  });

  // Imprimir texto
  document.querySelector("#btnImprimirTexto")?.addEventListener("click", () => {
    const ventana = window.open("", "_blank");
    ventana.document.write(`<pre>${resultadoTexto.textContent}</pre>`);
    ventana.print();
  });

  // Descargar imagen
  document.querySelector("#btnDescargarImagen")?.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = imgPictograma.src;
    a.download = "pictograma_sendia.png";
    a.click();
  });

  // Imprimir imagen
  document.querySelector("#btnImprimirImagen")?.addEventListener("click", () => {
    const ventana = window.open("", "_blank");
    ventana.document.write(`<img src="${imgPictograma.src}" style="max-width:100%;">`);
    ventana.print();
  });


  // -----------------------------
  // SISTEMA DE PESTAÑAS
  // -----------------------------
  function activarTab(nombre) {
    tabs.forEach(t => {
      const activo = t.dataset.tab === nombre;
      t.classList.toggle("is-active", activo);
    });

    document.querySelectorAll(".results-panel").forEach(p => {
      p.classList.toggle("is-active", p.dataset.panel === nombre);
    });
  }

});


