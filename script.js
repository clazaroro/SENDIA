// script.js – Lógica básica de interfaz para Proyecto SENDIA
// Esta versión se centra en que TODO funcione en el navegador
// sin depender todavía de una API externa. Los puntos de conexión
// con IA están marcados con comentarios TODO.

document.addEventListener("DOMContentLoaded", () => {
  // Helpers
  const $id = (id) => document.getElementById(id);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Campos del formulario
  const nivel = $id("nivel");
  const materia = $id("materia");
  const tipoNecesidad = $id("tipoNecesidad");
  const textoBase = $id("textoBase");

  // Botones principales
  const btnGenerarPrompt = $id("btnGenerarPrompt");
  const btnGenerarContenido = $id("btnGenerarContenido");
  const btnGenerarImagen = $id("btnGenerarImagen");

  // Resultados
  const promptEditable = $id("promptEditable");
  const resultadoTexto = $id("resultadoTexto");
  const imgPictograma = $id("imgPictograma");

  // Botones resultados texto
  const btnCopiarTexto = $id("btnCopiarTexto");
  const btnCompartirTexto = $id("btnCompartirTexto");
  const btnGuardarTexto = $id("btnGuardarTexto");
  const btnDescargarMp3 = $id("btnDescargarMp3");
  const btnImprimirTexto = $id("btnImprimirTexto");

  // Botones resultados imagen
  const btnDescargarImagen = $id("btnDescargarImagen");
  const btnCompartirImagen = $id("btnCompartirImagen");
  const btnGuardarImagen = $id("btnGuardarImagen");
  const btnImprimirImagen = $id("btnImprimirImagen");

  // Chips de formato
  const chipsFormato = $$("#grupoFormato .chip");

  // Tabs
  const tabs = $$(".results-tab");
  const panels = $$(".results-panel");

  const valor = (el) => (el && typeof el.value === "string" ? el.value.trim() : "");

  function activarTab(nombre) {
    tabs.forEach((tab) => {
      const activa = tab.dataset.tab === nombre;
      tab.classList.toggle("is-active", activa);
    });
    panels.forEach((panel) => {
      const activa = panel.dataset.panel === nombre;
      panel.classList.toggle("is-active", activa);
    });
  }

  // ---------- Construir prompt estructurado ----------
  function construirPrompt() {
    const partes = [];

    partes.push(
      "Actúa como docente experto en educación inclusiva y necesidades SEND."
    );

    const vNivel = valor(nivel);
    const vMateria = valor(materia);
    const vTipo = valor(tipoNecesidad);
    const vTexto = valor(textoBase);

    if (vNivel) partes.push(`Nivel educativo: ${vNivel}.`);
    if (vMateria) partes.push(`Materia o tema: ${vMateria}.`);
    if (vTipo) partes.push(`Tipo de necesidad SEND: ${vTipo}.`);

    partes.push(
      "Adapta el contenido usando lenguaje claro, frases cortas, estructura por pasos, ejemplos concretos y apoyos visuales cuando sea posible."
    );

    if (vTexto) {
      partes.push("Contenido original del docente:");
      partes.push(vTexto);
    } else {
      partes.push(
        "No se ha proporcionado contenido base. Genera un recurso educativo accesible desde cero para este perfil SEND."
      );
    }

    return partes.join("\n\n");
  }

  // ---------- DEMO de generación de texto (sin IA) ----------
  function generarTextoDemo(prompt) {
    const base = valor(textoBase);
    if (!base) {
      return (
        "Ejemplo de contenido adaptado (demo):\n\n" +
        "- Idea principal explicada de forma sencilla.\n" +
        "- Paso 1: resumir el concepto en una frase.\n" +
        "- Paso 2: añadir un ejemplo del día a día del alumnado.\n" +
        "- Paso 3: comprobar la comprensión con una pequeña pregunta."
      );
    }

    return (
      "Versión adaptada (demo) del contenido introducido:\n\n" +
      base
        .split(".")
        .map((frase) => frase.trim())
        .filter(Boolean)
        .map((frase, i) => `${i + 1}. ${frase}.`)
        .join("\n")
    );
  }

  // ---------- DEMO de generación de imagen (sin IA) ----------
  function generarImagenDemo() {
    // Imagen de demostración libre (placeholder)
    // Puedes sustituir esta URL por una generada por tu backend/IA.
    return "https://via.placeholder.com/600x400.png?text=Demo+SENDIA";
  }

  // ---------- Eventos de chips de formato ----------
  chipsFormato.forEach((chip) => {
    chip.addEventListener("click", () => {
      chipsFormato.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
    });
  });

  // ---------- Botón: Generar prompt ----------
  if (btnGenerarPrompt) {
    btnGenerarPrompt.addEventListener("click", () => {
      const prompt = construirPrompt();
      if (promptEditable) promptEditable.value = prompt;
      activarTab("prompt");
    });
  }

  // ---------- Botón: Generar contenido ----------
  if (btnGenerarContenido) {
    btnGenerarContenido.addEventListener("click", () => {
      const prompt =
        (promptEditable && promptEditable.value.trim()) || construirPrompt();

      // TODO: aquí puedes llamar a tu backend / OpenAI.
      // Por ahora usamos una versión de demostración local.
      const textoAdaptado = generarTextoDemo(prompt);

      if (resultadoTexto) {
        resultadoTexto.textContent = textoAdaptado;
      }
      activarTab("texto");
    });
  }

  // ---------- Botón: Generar pictograma / imagen ----------
  if (btnGenerarImagen) {
    btnGenerarImagen.addEventListener("click", () => {
      // TODO: sustituir por llamada a tu backend / OpenAI (DALL·E, etc.)
      const urlDemo = generarImagenDemo();
      if (imgPictograma) {
        imgPictograma.src = urlDemo;
        imgPictograma.style.display = "block";
      }
      activarTab("imagen");
    });
  }

  // ---------- Acciones sobre CONTENIDO ----------
  if (btnCopiarTexto && resultadoTexto) {
    btnCopiarTexto.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(resultadoTexto.textContent || "");
        alert("Contenido copiado al portapapeles.");
      } catch (e) {
        console.error(e);
        alert("No se pudo copiar el texto.");
      }
    });
  }

  if (btnCompartirTexto && resultadoTexto) {
    btnCompartirTexto.addEventListener("click", async () => {
      const texto = resultadoTexto.textContent || "";
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Recurso SENDIA",
            text: texto,
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("La opción de compartir no está disponible en este navegador.");
      }
    });
  }

  if (btnGuardarTexto && resultadoTexto) {
    btnGuardarTexto.addEventListener("click", () => {
      const texto = resultadoTexto.textContent || "";
      const recursos = JSON.parse(localStorage.getItem("sendia_recursos_texto") || "[]");
      recursos.push({
        fecha: new Date().toISOString(),
        contenido: texto,
      });
      localStorage.setItem("sendia_recursos_texto", JSON.stringify(recursos));
      alert("Recurso guardado localmente en este navegador.");
    });
  }

  if (btnImprimirTexto && resultadoTexto) {
    btnImprimirTexto.addEventListener("click", () => {
      const ventana = window.open("", "_blank");
      if (!ventana) return;
      ventana.document.write(
        "<html><head><title>Imprimir recurso SENDIA</title></head><body><pre>" +
          (resultadoTexto.textContent || "").replace(/</g, "&lt;") +
          "</pre></body></html>"
      );
      ventana.document.close();
      ventana.focus();
      ventana.print();
    });
  }

  if (btnDescargarMp3 && resultadoTexto) {
    btnDescargarMp3.addEventListener("click", () => {
      // TODO: integrar con tu servicio de TTS / OpenAI audio.
      alert(
        "Aquí podrás integrar la descarga en MP3 usando un servicio de texto a voz (TTS)."
      );
    });
  }

  // ---------- Acciones sobre IMAGEN ----------
  if (btnDescargarImagen && imgPictograma) {
    btnDescargarImagen.addEventListener("click", () => {
      if (!imgPictograma.src) {
        alert("No hay ninguna imagen para descargar.");
        return;
      }
      const enlace = document.createElement("a");
      enlace.href = imgPictograma.src;
      enlace.download = "pictograma-sendia.png";
      enlace.click();
    });
  }

  if (btnCompartirImagen && imgPictograma) {
    btnCompartirImagen.addEventListener("click", async () => {
      if (!imgPictograma.src) {
        alert("No hay ninguna imagen para compartir.");
        return;
      }
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Pictograma SENDIA",
            text: "Pictograma generado con SENDIA",
            url: imgPictograma.src,
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        alert(
          "La opción de compartir imagen no está disponible en este navegador. Puedes descargarla y compartirla manualmente."
        );
      }
    });
  }

  if (btnGuardarImagen && imgPictograma) {
    btnGuardarImagen.addEventListener("click", () => {
      if (!imgPictograma.src) {
        alert("No hay ninguna imagen para guardar.");
        return;
      }
      const recursos = JSON.parse(localStorage.getItem("sendia_recursos_imagen") || "[]");
      recursos.push({
        fecha: new Date().toISOString(),
        url: imgPictograma.src,
      });
      localStorage.setItem("sendia_recursos_imagen", JSON.stringify(recursos));
      alert("Imagen guardada localmente en este navegador.");
    });
  }

  if (btnImprimirImagen && imgPictograma) {
    btnImprimirImagen.addEventListener("click", () => {
      if (!imgPictograma.src) {
        alert("No hay ninguna imagen para imprimir.");
        return;
      }
      const ventana = window.open("", "_blank");
      if (!ventana) return;
      ventana.document.write(
        "<html><head><title>Imprimir pictograma SENDIA</title></head><body><img src='" +
          imgPictograma.src +
          "' style='max-width:100%;'></body></html>"
      );
      ventana.document.close();
      ventana.focus();
      ventana.print();
    });
  }

  console.log("[SENDIA] Interfaz inicializada correctamente.");
});
