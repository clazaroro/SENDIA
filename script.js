// script.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("sendiaForm");

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

  function setEstado(msg) {
    estado.textContent = msg || "";
  }

  function bloquearBotones(bloquear) {
    btnGenerarPrompt.disabled = bloquear;
    btnGenerarTexto.disabled = bloquear;
    btnGenerarImagen.disabled = bloquear;
  }

  function construirPrompt() {
    const partes = [];

    partes.push(
      "Actúa como un docente especializado en educación inclusiva y necesidades SEND."
    );

    if (nivel.value) {
      partes.push(`Nivel educativo del alumnado: ${nivel.value}.`);
    }
    if (tipoNecesidad.value) {
      partes.push(`Tipo principal de necesidad: ${tipoNecesidad.value}.`);
    }
    if (formato.value) {
      partes.push(`Formato deseado del recurso: ${formato.value}.`);
    }
    if (materia.value) {
      partes.push(`Materia o tema: ${materia.value}.`);
    }
    if (objetivo.value) {
      partes.push(`Objetivo didáctico: ${objetivo.value}.`);
    }

    partes.push(
      "Adapta el siguiente contenido para que sea accesible, claro y estructurado para este perfil de alumnado."
    );
    partes.push(
      "Utiliza frases cortas, vocabulario sencillo, buena estructura visual (listas, pasos) y, si procede, ejemplos concretos."
    );
    partes.push(
      "Mantén un tono positivo y motivador. Evita contenido sensible o inapropiado."
    );

    if (textoBase.value.trim()) {
      partes.push("Contenido original del docente:");
      partes.push(textoBase.value.trim());
    } else {
      partes.push(
        "No se ha proporcionado un texto original largo. Genera un recurso desde cero ajustado a la descripción anterior."
      );
    }

    return partes.join("\n\n");
  }

  async function llamarTextoIA(promptFinal) {
    const respuesta = await fetch("/.netlify/functions/openai-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptFinal }),
    });

    if (!respuesta.ok) {
      const errorText = await respuesta.text();
      throw new Error("Error en openai-text: " + errorText);
    }

    const datos = await respuesta.json();
    return datos.resultado;
  }

  async function llamarImagenIA(descripcionFinal) {
    const respuesta = await fetch("/.netlify/functions/openai-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: descripcionFinal }),
    });

    if (!respuesta.ok) {
      const errorText = await respuesta.text();
      throw new Error("Error en openai-image: " + errorText);
    }

    const datos = await respuesta.json();
    return datos.url;
  }

  btnGenerarPrompt.addEventListener("click", () => {
    const prompt = construirPrompt();
    promptGenerado.value = prompt;
    setEstado("Prompt estructurado generado. Puedes revisarlo o editarlo.");
  });

  btnGenerarTexto.addEventListener("click", async () => {
    try {
      bloquearBotones(true);
      setEstado("Generando contenido adaptado con GPT-5.1…");

      let prompt = promptGenerado.value.trim();
      if (!prompt) {
        prompt = construirPrompt();
        promptGenerado.value = prompt;
      }

      const resultado = await llamarTextoIA(prompt);
      textoGenerado.textContent = resultado || "(No se recibió texto de la IA)";
      setEstado("Contenido generado correctamente. Revísalo antes de usarlo en clase.");
    } catch (error) {
      console.error(error);
      setEstado("Ha ocurrido un error al generar el texto. Revisa la consola.");
    } finally {
      bloquearBotones(false);
    }
  });

  btnGenerarImagen.addEventListener("click", async () => {
    try {
      bloquearBotones(true);
      setEstado("Generando imagen / pictograma con DALL·E…");

      const base = descripcionImagen.value.trim() || materia.value || "acción escolar simple";
      const necesidad = tipoNecesidad.value || "necesidades educativas especiales";

      const promptImagen = `
Crea una ilustración tipo pictograma muy clara y simple, con fondo blanco y pocos elementos.

Escena: ${base}.
Enfoque: alumnado con ${necesidad} en contexto educativo.

Estilo:
- Estilo pictograma educativo, líneas limpias.
- Colores planos, contraste alto.
- Sin detalles confusos.

Texto dentro de la imagen:
- Usa una tipografía sans serif muy clara.
- El texto debe estar bien centrado, grande y perfectamente legible.
- Evita errores ortográficos.
- Idioma del texto: español.
`;

      const url = await llamarImagenIA(promptImagen);

      imagenGenerada.innerHTML = "";
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Pictograma / imagen generada por IA";
      imagenGenerada.appendChild(img);

      setEstado("Imagen generada correctamente.");
    } catch (error) {
      console.error(error);
      setEstado("Ha ocurrido un error al generar la imagen. Revisa la consola.");
    } finally {
      bloquearBotones(false);
    }
  });
});
