// script.js – Versión robusta para SEND+IA con Netlify Functions

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Helpers de selección seguros ----------
  const $ = (id) => document.getElementById(id) || null;

  const materia = $("materia");
  const nivel = $("nivel");
  const tipoNecesidad = $("tipoNecesidad");
  const formato = $("formato");
  const objetivo = $("objetivo");           // si no existe no rompe
  const textoBase = $("textoBase");
  const descripcionImagen = $("descripcionImagen");

  const btnGenerarPrompt = $("btnGenerarPrompt");
  const btnGenerarTexto = $("btnGenerarTexto");
  const btnGenerarImagen = $("btnGenerarImagen");

  const promptGenerado = $("promptGenerado");
  const textoGenerado = $("textoGenerado");
  const imagenGenerada = $("imagenGenerada");
  const estado = $("estado");

  function setEstado(msg) {
    if (estado) estado.textContent = msg || "";
    console.log("[SEND+IA estado]:", msg);
  }

  function bloquearControles(bloqueado) {
    if (btnGenerarPrompt) btnGenerarPrompt.disabled = bloqueado;
    if (btnGenerarTexto) btnGenerarTexto.disabled = bloqueado;
    if (btnGenerarImagen) btnGenerarImagen.disabled = bloqueado;
  }

  function valor(el) {
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  // ---------- Construir prompt estructurado ----------
  function construirPrompt() {
    const partes = [];

    partes.push(
      "Actúa como un docente experto en educación inclusiva y necesidades SEND."
    );

    const vNivel = valor(nivel);
    const vTipo = valor(tipoNecesidad);
    const vFormato = valor(formato);
    const vMateria = valor(materia);
    const vObjetivo = valor(objetivo);
    const vTextoBase = valor(textoBase);

    if (vNivel) partes.push(`Nivel educativo: ${vNivel}.`);
    if (vTipo) partes.push(`Tipo de necesidad SEND: ${vTipo}.`);
    if (vFormato) partes.push(`Formato del recurso: ${vFormato}.`);
    if (vMateria) partes.push(`Materia o tema: ${vMateria}.`);
    if (vObjetivo) partes.push(`Objetivo didáctico: ${vObjetivo}.`);

    partes.push(
      "Adapta el contenido de forma clara, accesible, estructurada y adecuada al perfil SEND. Usa frases cortas, lenguaje sencillo, pasos numerados, ejemplos concretos y apoyos visuales si procede."
    );

    if (vTextoBase) {
      partes.push("Contenido original del docente:");
      partes.push(vTextoBase);
    } else {
      partes.push(
        "No se ha proporcionado contenido base. Genera un recurso educativo accesible desde cero siguiendo los criterios anteriores."
      );
    }

    const promptFinal = partes.join("\n\n");
    console.log("[SEND+IA prompt construido]:", promptFinal);
    return promptFinal;
  }

  // ---------- Llamadas a las Functions ----------
  async function llamarTextoIA(promptFinal) {
    console.log("[SEND+IA] llamando a /.netlify/functions/openai-text");
    const respuesta = await fetch("/.netlify/functions/openai-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptFinal }),
    });

    const bruto = await respuesta.text();
    console.log("[SEND+IA] respuesta openai-text cruda:", bruto);

    if (!respuesta.ok) {
      throw new Error(bruto || "Error HTTP en openai-text");
    }

    const datos = JSON.parse(bruto);
    return datos.resultado;
  }

  async function llamarImagenIA(promptImagen) {
    console.log("[SEND+IA] llamando a /.netlify/functions/openai-image");
    const respuesta = await fetch("/.netlify/functions/openai-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptImagen }),
    });

    const bruto = await respuesta.text();
    console.log("[SEND+IA] respuesta openai-image cruda:", bruto);

    if (!respuesta.ok) {
      throw new Error(bruto || "Error HTTP en openai-image");
    }

    const datos = JSON.parse(bruto);
    return datos.url;
  }

  // ---------- Eventos ----------
  if (btnGenerarPrompt) {
    btnGenerarPrompt.addEventListener("click", () => {
      try {
        const prompt = construirPrompt();
        if (promptGenerado) promptGenerado.value = prompt;
        setEstado("Prompt estructurado generado. Puedes revisarlo o editarlo.");
      } catch (e) {
        console.error("[SEND+IA error generar prompt]:", e);
        setEstado("Error generando el prompt (ver consola).");
      }
    });
  }

  if (btnGenerarTexto) {
    btnGenerarTexto.addEventListener("click", async () => {
      try {
        bloquearControles(true);
        setEstado("Generando contenido adaptado…");

        let promptFinal =
          promptGenerado && promptGenerado.value.trim()
            ? promptGenerado.value.trim()
            : construirPrompt();

        if (promptGenerado && !promptGenerado.value.trim()) {
          promptGenerado.value = promptFinal;
        }

        const resultado = await llamarTextoIA(promptFinal);
        if (textoGenerado) {
          textoGenerado.textContent =
            resultado || "(La IA no devolvió texto)";
        }

        setEstado("Contenido generado correctamente.");
      } catch (e) {
        console.error("[SEND+IA error generar texto]:", e);
        setEstado("Error generando el texto (detalles en consola).");
      } finally {
        bloquearControles(false);
      }
    });
  }

  if (btnGenerarImagen) {
    btnGenerarImagen.addEventListener("click", async () => {
      try {
        bloquearControles(true);
        setEstado("Generando imagen / pictograma…");

        const base =
          valor(descripcionImagen) ||
          valor(materia) ||
          "situación escolar sencilla";
        const necesidad = valor(tipoNecesidad) || "SEND";

        const promptImagen = `
Crea un pictograma educativo muy claro y simple.

Descripción de la escena: ${base}
Perfil del alumnado: ${necesidad}

Requisitos de diseño:
- Fondo blanco
- Colores planos, alto contraste
- Líneas limpias, sin detalles confusos
- Estilo de pictograma escolar
- Texto en español, grande, centrado, sin faltas de ortografía
`;

        console.log("[SEND+IA prompt imagen]:", promptImagen);

        const url = await llamarImagenIA(promptImagen);

        if (imagenGenerada) {
          imagenGenerada.innerHTML = "";
          const img = document.createElement("img");
          img.src = url;
          img.alt = "Pictograma / imagen generada por IA";
          img.style.maxWidth = "100%";
          img.style.borderRadius = "8px";
          imagenGenerada.appendChild(img);
        }

        setEstado("Imagen generada correctamente.");
      } catch (e) {
        console.error("[SEND+IA error generar imagen]:", e);
        setEstado("Error generando la imagen (detalles en consola).");
      } finally {
        bloquearControles(false);
      }
    });
  }

  console.log("[SEND+IA] script.js inicializado");
});
