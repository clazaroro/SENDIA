// script.js – Versión completa y definitiva para SEND+IA
// Funciona con Netlify Functions openai-text y openai-image

document.addEventListener("DOMContentLoaded", () => {
  // --- Referencias a elementos del DOM ---
  const materia = document.getElementById("materia");
  const nivel = document.getElementById("nivel");
  const tipoNecesidad = document.getElementById("tipoNecesidad");
  const formato = document.getElementById("formato");
  const objetivo = document.getElementById("objetivo");
  const textoBase = document.getElementById("textoBase");
  const descripcionImagen = document.getElementById("descripcionImagen");

  const btnGenerarPrompt = document.getElementById("btnGenerarPrompt");
  const btnGenerarTexto = document.getElementById("btnGenerarTexto");
  const btnGenerarImagen = document.getElementById("btnGenerarImagen");

  const promptGenerado = document.getElementById("promptGenerado");
  const textoGenerado = document.getElementById("textoGenerado");
  const imagenGenerada = document.getElementById("imagenGenerada");
  const estado = document.getElementById("estado");

  // --- Helpers ---
  function setEstado(msg) {
    estado.textContent = msg;
  }

  function bloquearControles(b) {
    btnGenerarPrompt.disabled = b;
    btnGenerarTexto.disabled = b;
    btnGenerarImagen.disabled = b;
  }

  // --- Construcción del prompt estructurado ---
  function construirPrompt() {
    const partes = [];

    partes.push(
      "Actúa como un docente experto en educación inclusiva y necesidades SEND."
    );

    if (nivel.value) partes.push(`Nivel educativo: ${nivel.value}.`);
    if (tipoNecesidad.value) partes.push(`Tipo de necesidad SEND: ${tipoNecesidad.value}.`);
    if (formato.value) partes.push(`Formato del recurso: ${formato.value}.`);
    if (materia.value) partes.push(`Materia o tema: ${materia.value}.`);
    if (objetivo.value) partes.push(`Objetivo didáctico: ${objetivo.value}.`);

    partes.push(
      "Adapta el contenido de forma clara, accesible, estructurada y adecuada al perfil SEND. Usa frases cortas, ejemplos concretos, lenguaje sencillo, pasos numerados y apoyos visuales si procede."
    );

    if (textoBase.value.trim()) {
      partes.push("Contenido original del docente:");
      partes.push(textoBase.value.trim());
    } else {
      partes.push(
        "No se ha proporcionado contenido base. Genera un recurso educativo accesible desde cero siguiendo los criterios anteriores."
      );
    }

    return partes.join("\n\n");
  }

  // --- Llamadas a las Netlify Functions ---
  async function llamarTextoIA(promptFinal) {
    const r = await fetch("/.netlify/functions/openai-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptFinal })
    });

    if (!r.ok) {
      throw new Error(await r.text());
    }

    const data = await r.json();
    return data.resultado;
  }

  async function llamarImagenIA(promptImagen) {
    const r = await fetch("/.netlify/functions/openai-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptImagen })
    });

