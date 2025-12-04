// SEND Assistant - Version 2.6 (Strict AI Voices - No Robotic Fallback)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
	Menu, Plus, Settings, Image as ImageIcon, Mic, Sparkles, User, Bot, Volume2,
	Loader2, StopCircle, Wand2, Upload, FileText, Copy, Download, FileAudio,
	Check, Video, Music, Share2, Type, Film, Play, Pause, BookOpen, Grid,
	Eraser, X, Printer, File, MicOff, GraduationCap, Globe, Moon, Sun, 
	ChevronUp, ChevronDown, Library, Search, Save, Filter, CloudUpload, Eye, AlertCircle,
	CircleHelp, ExternalLink, Trash2, AlertTriangle, Maximize2, Lock, LogIn
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'send-assistant-demo';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const apiKey = ""; 

// --- BASE DE DATOS DE USUARIOS (HARDCODED PARA ACCESO SIMPLE) ---
const VALID_USERS = {
	'profesor': { password: '1234', role: 'usuario' },
	'clazaroro': { password: 'Poppy.2025', role: 'administrador' }
};

// --- INICIALIZACIÓN FIREBASE ---
let app, auth, db;
try {
	if (Object.keys(firebaseConfig).length > 0) {
	    app = initializeApp(firebaseConfig);
	    auth = getAuth(app);
	    db = getFirestore(app);
	} else {
		console.warn("Firebase config not found. Running in UI-only mode.");
	}
} catch (e) {
	console.error("Firebase init error:", e);
}

// --- COLORES PERSONALIZADOS SEND+IA ---
const CUSTOM_COLORS = {
	cyan: "#09CDD0",
	green: "#80C207",
	blue: "#096EBE",
	red: "#D5201F",
	yellow: "#E1B007",
	pink: "#E204CF",
	purple: "#8A2BE2"	
};

// --- VIDEO TUTORIALS BY LANGUAGE ---
const TUTORIAL_VIDEOS = {
	es: "RtX3JQwfeyY",
	ca: "2CEmfPOWK0A",
	en: "r_Gs9cPujVk"
};

// --- DICCIONARIO DE IDIOMAS ---
const TRANSLATIONS = {
	es: {
		newProject: "Nuevo Proyecto",
		text: "Texto",
		image: "Imagen",
		audio: "Audio",
		simplify: "Lectura Fácil",
		board: "Tablero",
		video: "Vídeo",
		footer: "SEND Suite v1.8 • Educación",
		settings: "Configuración",
		appearance: "Apariencia",
		language: "Idioma",
		genText: "Generador Texto",
		topicPlace: "Tema (Ej: El Sistema Solar) *",
		objPlace: "Objetivo (Opcional)",
		typePlace: "Tipo de texto a generar",
		readLevel: "Nivel de Lectura",
		stageInf: "Infantil",
		stagePri: "Primaria",
		stageSec: "Secundaria",
		langRes: "Idioma del recurso",
		needEduc: "Necesidad educativa (Opcional)",
		baseText: "Texto base (Opcional)",
		dictate: "Dictar",
		listening: "Escuchando",
		upload: "Subir",
		generateBtn: "Generar Texto",
		visualCreator: "Creador Visual",
		imgStyle: "Estilo de imagen",
		imgRatio: "Formato de imagen",
		describeImg: "Describe la imagen...",
		createImg: "Crear Imagen",
		easyRead: "Lectura Fácil",
		simplifyInfo: "Convierte textos complejos en formatos accesibles.",
		langGen: "Idioma a generar",
		simpLevel: "Nivel de simplificación",
		textToSimp: "Texto a simplificar",
		pasteText: "Pega aquí el texto complejo...",
		simplifyBtn: "Simplificar",
		boardTitle: "Tablero SAAC",
		contextPlace: "Contexto (ej: Parque, Desayuno)",
		langBoard: "Idioma del tablero",
		genBoardBtn: "Generar Tablero",
		ttsTitle: "TTS & Traductor",
		voiceSel: "Voz del narrador",
		langTrans: "Idioma de traducción (Opcional)",
		textToConv: "Texto a convertir",
		genAudioBtn: "Generar Audio",
		videoMaker: "Video Maker",
		plan: "Planificar",
		create: "Crear",
		langVideo: "Idioma del vídeo",
		topicVideo: "Tema del vídeo...",
		genScript: "Generar Guion",
		createVideo: "Crear Video-Historia",
		welcome: "Bienvenido a SEND Suite",
		welcomeSub: "Selecciona una herramienta para comenzar.",
		downloadMp3: "Descargar MP3",
		print: "Imprimir",
		copy: "Copiar",
		share: "Compartir",
		repository: "Repositorio",
		searchRes: "Buscar recursos...",
		filterType: "Formato",
		filterNeed: "Necesidad",
		filterLang: "Idioma",
		filterStage: "Etapa",
		saveToRepo: "Guardar",
		removeFromRepo: "Borrar",
		confirmDelete: "¿Seguro?",
		cancel: "Cancelar",
		saving: "Guardando...",
		saved: "¡Guardado!",
		noResults: "No se encontraron recursos.",
		all: "Todos",
		by: "Por",
		date: "Fecha",
		imgTooLarge: "Imagen comprimida para guardar.",
		close: "Cerrar",
		preview: "Previsualización",
		imgUnavailable: "Imagen no disponible",
		helpTitle: "Tutorial de Uso",	
		helpDesc: "Aprende a crear recursos adaptados en segundos.",
		audioFallback: "Audio de alta calidad no disponible.",
		downloadUnavailable: "Descarga no disponible.",
		convertingMp3: "Convirtiendo a MP3...",
		downloadAudio: "Descargar Audio",
		regeneratingAudio: "Regenerando audio...",
		
		stages: ["Infantil", "Primaria", "Secundaria"],
		textTypes: ["Explicación", "Analogía", "Resumen", "Paso a paso", "Glosario de palabras difíciles", "Quiz"],
		readingLevels: ["Lector emergente", "Lector inicial", "Lector en transición", "Lector fluido", "Lector experto"],
		imageStyles: [
			{ value: "Pictograma (ARASAAC Estilo)", label: "Pictograma (ARASAAC)" },
			{ value: "Fotorealista", label: "Fotorealista" },
			{ value: "Cartoon/Infantil", label: "Cartoon/Infantil" },
			{ value: "Dibujo Lineal (Para colorear)", label: "Dibujo Lineal (Colorear)" },
			{ value: "Tarjeta de Emociones", label: "Tarjeta de Emociones" },
			{ value: "Secuencia / Paso a paso", label: "Secuencia / Paso a paso" }
		],
		imageRatios: [
			{ val: "1:1", label: "Cuadrado (1:1)" },
			{ val: "16:9", label: "Horizontal (16:9)" },
			{ val: "9:16", label: "Vertical (9:16)" }
		],
		audioVoices: [
			{ id: "Kore", label: "Femenina (España)" },	
			{ id: "Fenrir", label: "Masculina (España)" },	
			{ id: "Aoede", label: "Neutra (Británica)" }
		],
		simplifyLevels: ["Nivel 1 (Muy Simple)", "Nivel 2 (Intermedio)", "Nivel 3 (Resumen)"],
		sendNeeds: {
			"Cognitivas y de aprendizaje": ["Dislexia / Dificultades de lectura", "Trastorno por Déficit de Atención (TDAH)"],
			"Comunicación e interacción": ["Trastorno del Espectro Autista (TEA) / Comunicación visual", "Dificultades del lenguaje oral o escrito"],
			"Sensoriales y motrices": ["Discapacidad visual (ceguera o baja visión)", "Discapacidad auditiva (sordera o hipoacusia)", "Discapacidad física / Limitaciones motrices"],
			"Sociales, emocionales y salud mental": ["Apoyo emocional / Salud mental"]
		},
		// New Login specific translations
		loginTitle: "Acceso a SEND Suite",
		loginSubtitle: "Introduce tus credenciales para continuar.",
		user: "Usuario",
		password: "Contraseña",
		profile: "Perfil",
		loginBtn: "Iniciar Sesión",
		loginError: "Credenciales incorrectas o perfil no válido.",
		boardInfo: "Crea tableros de comunicación instantáneos."
	},
	en: {
		newProject: "New Project",
		text: "Text",
		image: "Image",
		audio: "Audio",
		simplify: "Easy Read",
		board: "Board",
		video: "Video",
		footer: "SEND Suite v2.0 • Education",
		settings: "Settings",
		appearance: "Appearance",
		language: "Language",
		genText: "Text Generator",
		topicPlace: "Topic (e.g. Solar System) *",
		objPlace: "Objective (Optional)",
		typePlace: "Type of text to generate",
		readLevel: "Reading Level",
		stageInf: "Preschool",
		stagePri: "Primary",
		stageSec: "Secondary",
		langRes: "Resource Language",
		needEduc: "Educational Need (Optional)",
		baseText: "Base Text (Optional)",
		dictate: "Dictate",
		listening: "Listening",
		upload: "Upload",
		generateBtn: "Generate Text",
		visualCreator: "Visual Creator",
		imgStyle: "Image Style",
		imgRatio: "Aspect Ratio",
		describeImg: "Describe the image...",
		createImg: "Create Image",
		easyRead: "Easy Read",
		simplifyInfo: "Convert complex text into accessible formats.",
		langGen: "Output Language",
		simpLevel: "Simplification Level",
		textToSimp: "Text to simplify",
		pasteText: "Paste complex text here...",
		simplifyBtn: "Simplify",
		boardTitle: "AAC Board",
		boardInfo: "Create instant communication boards.",
		contextPlace: "Context (e.g. Park, Breakfast)",
		langBoard: "Board Language",
		genBoardBtn: "Generate Board",
		ttsTitle: "TTS & Translator",
		voiceSel: "Narrator Voice",
		langTrans: "Translation Language",
		textToConv: "Text to convert",
		genAudioBtn: "Generate Audio",
		videoMaker: "Video Maker",
		plan: "Plan",
		create: "Create",
		langVideo: "Video Language",
		topicVideo: "Video Topic...",
		genScript: "Generate Script",
		createVideo: "Create Video-Story",
		welcome: "Welcome to SEND Suite",
		welcomeSub: "Select a tool on the left to start.",
		downloadMp3: "Download MP3",
		print: "Print",
		copy: "Copy",
		share: "Share",
		repository: "Repository",
		searchRes: "Search resources...",
		filterType: "Format",
		filterNeed: "Need",
		filterLang: "Language",
		filterStage: "Stage",
		saveToRepo: "Save",
		removeFromRepo: "Delete",
		confirmDelete: "Sure?",
		cancel: "Cancel",
		saving: "Saving...",
		saved: "Saved!",
		noResults: "No resources found.",
		all: "All",
		by: "By",
		date: "Date",
		imgTooLarge: "Image compressed for saving.",
		close: "Close",
		preview: "Preview",
		imgUnavailable: "Image not available",
		helpTitle: "Tutorial",
		helpDesc: "Learn how to create adapted resources in seconds.",
		audioFallback: "High quality audio unavailable.",
		downloadUnavailable: "Download unavailable.",
		convertingMp3: "Converting to MP3...",
		downloadAudio: "Download Audio",
		regeneratingAudio: "Regenerating audio...",

		stages: ["Preschool", "Primary", "Secondary"],
		textTypes: ["Explanation", "Analogy", "Summary", "Step-by-step", "Glossary", "Quiz"],
		readingLevels: ["Emergent", "Early", "Transitional", "Fluent", "Expert"],
		imageStyles: [
			{ value: "Pictograma (ARASAAC Estilo)", label: "Pictogram (ARASAAC)" },
			{ value: "Fotorealista", label: "Photorealistic" },
			{ value: "Cartoon/Infantil", label: "Cartoon/Kids" },
			{ value: "Dibujo Lineal (Para colorear)", label: "Line Art (Coloring)" },
			{ value: "Tarjeta de Emociones", label: "Emotion Card" },
			{ value: "Secuencia / Paso a paso", label: "Sequence / Step-by-step" }
		],
		imageRatios: [
			{ val: "1:1", label: "Square (1:1)" },
			{ val: "16:9", label: "Landscape (16:9)" },
			{ val: "9:16", label: "Portrait (9:16)" }
		],
		audioVoices: [
			{ id: "Kore", label: "Female Voice (AI)" },	
			{ id: "Fenrir", label: "Male Voice (AI)" },	
			{ id: "Aoede", label: "Neutral Voice (AI)" }
		],
		simplifyLevels: ["Level 1 (Very Simple)", "Level 2 (Intermediate)", "Level 3 (Summary)"],
		sendNeeds: {
			"Cognitive and Learning": ["Dyslexia / Reading Difficulties", "Attention Deficit Disorder (ADHD)"],
			"Communication and Interaction": ["Autism Spectrum Disorder (ASD) / Visual Communication", "Oral or Written Language Difficulties"],
			"Sensory and Motor": ["Visual Impairment (Blindness or Low Vision)", "Hearing Impairment (Deafness or Hearing Loss)", "Physical Disability / Motor Limitations"],
			"Social, Emotional, and Mental Health": ["Emotional Support / Mental Health"]
		},
		loginTitle: "Access to SEND Suite",
		loginSubtitle: "Enter your credentials to continue.",
		user: "Username",
		password: "Password",
		profile: "Profile",
		loginBtn: "Login",
		loginError: "Incorrect credentials or invalid profile."
	},
	ca: {
		newProject: "Nou Projecte",
		text: "Text",
		image: "Imatge",
		audio: "Àudio",
		simplify: "Lectura Fàcil",
		board: "Tauler",
		video: "Vídeo",
		footer: "SEND Suite v1.8 • Educació",
		settings: "Configuració",
		appearance: "Aparença",
		language: "Idioma",
		genText: "Generador de Text",
		topicPlace: "Tema (Ex: El Sistema Solar) *",
		objPlace: "Objectiu (Opcional)",
		typePlace: "Tipus de text a generar",
		readLevel: "Nivell de Lectura",
		stageInf: "Infantil",
		stagePri: "Primària",
		stageSec: "Secundària",
		langRes: "Idioma del recurs",
		needEduc: "Necessitat educativa (Opcional)",
		baseText: "Text base (Opcional)",
		dictate: "Dictar",
		listening: "Escoltant",
		upload: "Pujar",
		generateBtn: "Generar Text",
		visualCreator: "Creador Visual",
		imgStyle: "Estil d'imantge",
		imgRatio: "Format d'imantge",
		describeImg: "Descriu la imatge...",
		createImg: "Crear Imatge",
		easyRead: "Lectura Fàcil",
		simplifyInfo: "Converteix textos complexos en formats accessibles.",
		langGen: "Idioma a generar",
		simpLevel: "Nivell de simplificació",
		textToSimp: "Text a simplificar",
		pasteText: "Enganxa aquí el text complex...",
		simplifyBtn: "Simplificar",
		boardTitle: "Tauler SAAC",
		contextPlace: "Context (ex: Parc, Esmorzar)",
		langBoard: "Idioma del tauler",
		genBoardBtn: "Generar Tauler",
		ttsTitle: "TTS i Traductor",
		voiceSel: "Veu del narrador",
		langTrans: "Idioma de traducció",
		textToConv: "Text a convertir",
		genAudioBtn: "Generar Àudio",
		videoMaker: "Video Maker",
		plan: "Planificar",
		create: "Crear",
		langVideo: "Idioma del vídeo",
		topicVideo: "Tema del vídeo...",
		genScript: "Generar Guió",
		createVideo: "Crear Vídeo-Història",
		welcome: "Benvingut a SEND Suite",
		welcomeSub: "Selecciona una eina per començar.",
		downloadMp3: "Descarregar MP3",
		print: "Imprimir",
		copy: "Copiar",
		share: "Compartir",
		repository: "Repositori",
		searchRes: "Cercar recursos...",
		filterType: "Format",
		filterNeed: "Necessitat",
		filterLang: "Idioma",
		filterStage: "Etapa",
		saveToRepo: "Guardar",
		removeFromRepo: "Esborrar",
		confirmDelete: "Segur?",
		cancel: "Cancel·lar",
		saving: "Guardant...",
		saved: "Guardat!",
		noResults: "No s'han trobat recursos.",
		all: "Tots",
		by: "Per",
		date: "Data",
		imgTooLarge: "Imatge comprimida per guardar.",
		close: "Tancar",
		preview: "Previsualització",
		imgUnavailable: "Imatge no disponible",
		helpTitle: "Tutorial d'Ús",	
		helpDesc: "Aprèn a crear recursos adaptats en segons.",
		audioFallback: "Àudio d'alta qualitat no disponible.",
		downloadUnavailable: "Descàrrega no disponible.",
		convertingMp3: "Convertint a MP3...",
		downloadAudio: "Descarregar Àudio",
		regeneratingAudio: "Regenerant àudio...",

		stages: ["Infantil", "Primària", "Secundària"],
		textTypes: ["Explicació", "Analogía", "Resum", "Pas a pas", "Glossari de paraules difícils", "Quiz"],
		readingLevels: ["Lector emergent", "Lector inicial", "Lector en transició", "Lector fluid", "Lector expert"],
		imageStyles: [
			{ value: "Pictograma (ARASAAC Estilo)", label: "Pictograma (ARASAAC)" },
			{ value: "Fotorealista", label: "Fotorealista" },
			{ value: "Cartoon/Infantil", label: "Cartoon/Infantil" },
			{ value: "Dibujo Lineal (Para colorear)", label: "Dibuix Lineal (A acolorir)" },
			{ value: "Tarjeta de Emociones", label: "Targeta d'Emocions" },
			{ value: "Secuencia / Paso a paso", label: "Seqüència / Pas a pas" }
		],
		imageRatios: [
			{ val: "1:1", label: "Quadrat (1:1)" },
			{ val: "16:9", label: "Horitzontal (16:9)" },
			{ val: "9:16", label: "Vertical (9:16)" }
		],
		audioVoices: [{ id: "Kore", label: "Femenina (IA)" }, { id: "Fenrir", label: "Masculina (IA)" }, { id: "Aoede", label: "Neutra (IA)" }],
		simplifyLevels: ["Nivel 1 (Molt Simple)", "Nivell 2 (Intermedi)", "Nivel 3 (Resum)"],
		sendNeeds: {
			"Cognitives and Learning": ["Dyslexia / Reading Difficulties", "Attention Deficit Disorder (ADHD)"],
			"Communication and Interaction": ["Autism Spectrum Disorder (ASD) / Visual Communication", "Oral or Written Language Difficulties"],
			"Sensory and Motor": ["Visual Impairment (Blindness or Low Vision)", "Hearing Impairment (Deafness or Hearing Loss)", "Physical Disability / Motor Limitations"],
			"Social, Emotional, and Mental Health": ["Emotional Support / Mental Health"]
		},
		loginTitle: "Accés a SEND Suite",
		loginSubtitle: "Introdueix les teves credencials per continuar.",
		user: "Usuari",
		password: "Contrasenya",
		profile: "Perfil",
		loginBtn: "Iniciar Sessió",
		loginError: "Credencials incorrectes o perfil no vàlid."
	}
};

// --- TEMAS (COLORES) ---
const THEMES = {
	dark: {
		bgMain: "bg-[#131314]",
		bgSidebar: "bg-[#1E1F20]",
		bgCard: "bg-[#1E1F20]",	
		bgUser: "bg-[#28292A]",
		bgInput: "bg-[#28292A]",
		textPrimary: "text-gray-100",
		textSecondary: "text-gray-400",
		textMuted: "text-gray-500",
		border: "border-gray-700/30",
		borderInput: "border-gray-700",
		hoverBg: "hover:bg-[#28292A]",
		scrollThumb: "scrollbar-thumb-[#374151]",
		cardRepo: "bg-[#1E1F20] hover:bg-[#28292A]"
	},
	light: {
		bgMain: "bg-[#F3F4F6]",	
		bgSidebar: "bg-white",
		bgCard: "bg-white",
		bgUser: "bg-[#E5E7EB]",
		bgInput: "bg-white",
		textPrimary: "text-gray-900",
		textSecondary: "text-gray-600",
		textMuted: "text-gray-400",
		border: "border-gray-200",
		borderInput: "border-gray-300",
		hoverBg: "hover:bg-gray-100",
		scrollThumb: "scrollbar-thumb-gray-300",
		cardRepo: "bg-white hover:bg-gray-50"
	}
};

// --- UTILS & GLOBAL FUNCTIONS ---
const getHeaderColor = (type) => {
	switch(type) {
		case 'text': return '#60a5fa';	
		case 'simplify': return '#2dd4bf';
		case 'audio_result': return '#4ade80';
		case 'video_slide': case 'video': return '#f87171';
		case 'image': return '#c084fc';
		case 'board': return '#facc15';
		default: return '#60a5fa';
	}
};

const cleanResponseText = (text) => {
	if (!text) return "";
	return text.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();
};

const cleanTextForTTS = (html) => {
	if (!html) return "";
	let text = "";
	try {
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;
		text = (tempDiv.textContent || tempDiv.innerText || "").replace(/\s+/g, ' ').trim();
	} catch (e) {
		text = html.replace(/<[^>]*>?/gm, "").trim();
	}
	return text.replace(/[*#]/g, '').substring(0, 4500);	
};

const cleanJson = (text) => {
	if (!text) return "[]";
	const cleaned = text.replace(/```json\s*/i, '').replace(/```\s*$/i, '').trim();
	return cleaned;
}

const compressBase64Image = (base64Str, maxWidth = 800, quality = 0.7) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = base64Str;
		img.onload = () => {
			const canvas = document.createElement('canvas');
			let width = img.width;
			let height = img.height;
			if (width > maxWidth) {
				height = (height * maxWidth) / width;
				width = maxWidth;
			}
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, width, height);
			const newBase64 = canvas.toDataURL('image/jpeg', quality);
			resolve(newBase64);
		};
		img.onerror = (err) => reject(err);
	});
};

const base64ToUint8Array = (base64) => {
	if (!base64) return new Uint8Array(0);
	const cleanBase64 = base64.replace(/[\r\n\s]/g, '');
	try {
		const binaryString = window.atob(cleanBase64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
		return bytes;
	} catch (error) {	
		console.error("Base64 decode error", error);
		return new Uint8Array(0);	
	}
};

// MP3 Conversion using LameJS
const pcmToMp3 = (uint8Array, sampleRate = 24000) => {
	if (!window.lamejs) {
		console.error("Lamejs not loaded");
		return null;
	}
	const mp3encoder = new window.lamejs.Mp3Encoder(1, sampleRate, 128);
	const samples = new Int16Array(uint8Array.buffer);
	const mp3Data = [];
	const sampleBlockSize = 1152;	
	for (let i = 0; i < samples.length; i += sampleBlockSize) {
		const sampleChunk = samples.subarray(i, i + sampleBlockSize);
		const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
		if (mp3buf.length > 0) mp3Data.push(mp3buf);
	}
	const mp3bufFlush = mp3encoder.flush();
	if (mp3bufFlush.length > 0) mp3Data.push(mp3bufFlush);
	return new Blob(mp3Data, { type: 'audio/mp3' });
};

const writeString = (view, offset, string) => {
	for (let i = 0; i < string.length; i++) { view.setUint8(offset + i, string.charCodeAt(i)); }
};

const pcmToWav = (pcmData, sampleRate) => {
	const header = new ArrayBuffer(44);
	const view = new DataView(header);
	const dataLen = pcmData.length;
	writeString(view, 0, 'RIFF');
	view.setUint32(4, 36 + dataLen, true);
	writeString(view, 8, 'WAVE');
	writeString(view, 12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);	
	view.setUint16(22, 1, true);	
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);	
	writeString(view, 36, 'data');
	view.setUint32(40, dataLen, true);
	const wavBytes = new Uint8Array(header.byteLength + dataLen);
	wavBytes.set(new Uint8Array(header), 0);
	wavBytes.set(pcmData, 44);
	return wavBytes;
};

// --- CONSTANTES ---
const STYLE_PROMPT_MAP = {
	"Pictograma (ARASAAC Estilo)": "simple pictogram, flat design, white background, high contrast, similar to ARASAAC symbols, minimal detail, clear lines",
	"Fotorealista": "photorealistic, high quality, 8k, detailed texture, cinematic lighting",
	"Cartoon/Infantil": "children's book illustration, cute, vibrant colors, friendly style, clear outlines",
	"Dibujo Lineal (Para colorear)": "black and white line art, coloring book style, thick outlines, no fill, white background, clear distinct shapes",
	"Tarjeta de Emociones": "expressive face, clear emotion, educational flashcard style, isolated on white background, high clarity",
	"Secuencia / Paso a paso": "sequential instructional illustration, step-by-step storyboard, clear actions, logical progression, simple visual cues"
};

// --- COMPONENTES AUXILIARES ---

const VideoPlayer = ({ imageUrl, audioUrl, text, autoPlay = false, themeStyle, isRegenerating = false }) => {
	const [isPlaying, setIsPlaying] = useState(autoPlay);
	const audioRef = useRef(null);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let isMounted = true;
		const playAudio = async () => {
			if (autoPlay && audioRef.current && audioUrl) {
				try {
					await audioRef.current.play();
					if (isMounted) setIsPlaying(true);
				} catch (e) {
					console.log("Autoplay prevented", e);
					if (isMounted) setIsPlaying(false);
				}
			}
		};
		playAudio();
		return () => {	
			isMounted = false;
			if (audioRef.current) {
				audioRef.current.pause();
			}
		};
	}, [autoPlay, audioUrl]);

	const togglePlay = async () => {
		const audio = audioRef.current;
		if (!audio) return;	
		
		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
		} else {
			try {
				await audio.play();
				setIsPlaying(true);
			} catch (error) {
				console.error("Playback error:", error);
				setIsPlaying(false);
			}
		}
	};

	const handleDownloadAudio = () => {
		if (audioUrl) {
			const a = document.createElement('a');
			a.href = audioUrl;
			a.download = 'video-audio.wav';
			a.click();
		}
	};

	return (
		<div className={`w-full max-w-md bg-black rounded-xl overflow-hidden shadow-2xl border ${themeStyle.border} relative group mx-auto`}>
		   {audioUrl && (
				<audio ref={audioRef} src={audioUrl} onTimeUpdate={() => audioRef.current && setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)} onEnded={() => {setIsPlaying(false); setProgress(100);}} />
		   )}
			<div className="relative aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
				{imageUrl ? (
					<img src={imageUrl} alt="Frame" className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity duration-300" />
				) : (
					<div className="text-gray-600 flex flex-col items-center"><Video size={48} /><span className="text-xs mt-2">Cargando...</span></div>
				)}
				
				<div className="absolute inset-0 flex items-center justify-center">
					{isRegenerating ? (
						<div className="bg-black/50 p-3 rounded-full backdrop-blur-sm">
							<Loader2 size={32} className="text-white animate-spin" />
						</div>
					) : (
						<button onClick={togglePlay} disabled={!audioUrl} className={`w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all transform hover:scale-105 ${!audioUrl ? 'opacity-50 cursor-not-allowed' : (isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100')}`}>
							{isPlaying ? <Pause size={28} className="text-white fill-current" /> : <Play size={28} className="text-white fill-current ml-1" />}
						</button>
					)}
				</div>
			</div>
			<div className={`p-3 ${themeStyle.bgCard}`}>
				<div className="h-1 w-full bg-gray-700 rounded-full mb-2 overflow-hidden"><div className="h-full bg-red-500 transition-all duration-100" style={{ width: `${progress}%` }}></div></div>
				<p className={`text-xs font-medium text-center line-clamp-2 ${themeStyle.textPrimary}`}>"{text}"</p>
				
				{audioUrl && (
					<div className="mt-3 flex justify-center">
						<button onClick={handleDownloadAudio} className={`text-[10px] flex items-center gap-1 ${themeStyle.textSecondary} hover:text-blue-500 transition-colors`}>
							<Download size={12} /> {TRANSLATIONS.es.downloadAudio}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

const CommunicationBoard = ({ data, themeStyle }) => {
	if (!data || !Array.isArray(data)) return null;
	return (
		<div className={`grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-lg mx-auto p-2 rounded-lg ${themeStyle.bgMain}`}>
			{data.map((item, idx) => (
				<div key={idx} className={`aspect-square border-2 ${themeStyle.border} rounded-lg flex flex-col items-center justify-center p-2 hover:bg-blue-50/10 transition-colors cursor-pointer shadow-sm ${themeStyle.bgCard}`}>
					<span className="text-4xl mb-1 filter drop-shadow-sm">{item.emoji}</span>
					<span className={`text-xs font-bold text-center uppercase leading-tight ${themeStyle.textPrimary}`}>{item.text}</span>
				</div>
			))}
		</div>
	);
};

const MessageBubble = ({	
	id, role, content, type = 'text', mediaUrl, extraData, savedDocId,	
	onPlayAudio, isPlayingAudio, onDownloadMp3, isDownloadingMp3,	
	themeStyle, t, onSaveResource, onDeleteResource, metaData, hideSave, onImageClick,	
	isRegenerating, onExpand	
}) => {
	const isUser = role === 'user';
	const [copied, setCopied] = useState(false);
	const [saving, setSaving] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	
	// Determine display content
	const displayText = content;
	const isFallback = metaData?.isFallback || false;

	const fallbackCopy = (text) => {
		const textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try { const s = document.execCommand('copy'); if(s) { setCopied(true); setTimeout(() => setCopied(false), 2000); } }	
		catch (err) { console.error('Fallback copy failed', err); }
		document.body.removeChild(textArea);
	};

	const handleCopy = () => {
		let textToCopy = (type === 'board' && extraData) ? extraData.map(i => `${i.emoji} ${i.text}`).join('\n') : cleanTextForTTS(displayText);
		if (!textToCopy) return;
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(textToCopy).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
				.catch(() => fallbackCopy(textToCopy));
		} else fallbackCopy(textToCopy);
	};

	const handleShare = async () => {
		const textToShare = cleanTextForTTS(displayText);
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'SEND Resource',
					text: textToShare,
					url: window.location.href
				});
			} catch (err) {
				console.log('Share failed', err);
			}
		} else {
			handleCopy();
			alert(t('copy'));
		}
	};

	const handleDownloadImage = () => {
		if (mediaUrl) {
			const link = document.createElement('a'); link.href = mediaUrl; link.download = `img_${Date.now()}.png`;
			document.body.appendChild(link); link.click(); document.body.removeChild(link);
		}
	};

	const handleDownloadBoard = () => {
		if (!extraData || !Array.isArray(extraData)) return;
		const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
		const cols = 3; const rows = Math.ceil(extraData.length / cols); const cellSize = 300; const gap = 20; const padding = 40;
		canvas.width = (cellSize * cols) + (gap * (cols - 1)) + (padding * 2);
		canvas.height = (cellSize * rows) + (gap * (rows - 1)) + (padding * 2);
		ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
		extraData.forEach((item, index) => {
			const col = index % cols; const row = Math.floor(index / cols);
			const x = padding + (col * (cellSize + gap)); const y = padding + (row * (cellSize + gap));
			ctx.fillStyle = '#f9fafb'; ctx.fillRect(x, y, cellSize, cellSize);
			ctx.lineWidth = 4; ctx.strokeStyle = '#e5e7eb'; ctx.strokeRect(x, y, cellSize, cellSize);
			ctx.font = '100px Arial'; ctx.fillStyle = '#000000'; ctx.fillText(item.emoji, x + cellSize/2, y + cellSize/2 - 20);
			ctx.font = 'bold 24px sans-serif'; ctx.fillStyle = '#1f2937'; ctx.fillText(item.text.toUpperCase(), x + cellSize/2, y + cellSize/2 + 60);
		});
		const link = document.createElement('a'); link.download = `board_${Date.now()}.png`; link.href = canvas.toDataURL(); link.click();
	};

	const handleDownloadTxt = () => {
		const blob = new Blob([cleanTextForTTS(displayText)], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a'); link.href = url; link.download = `send_text_${Date.now()}.txt`;
		document.body.appendChild(link); link.click(); document.body.removeChild(link);
	};

	const handlePrint = () => {
		const w = window.open('', '_blank');
		let pContent = displayText;
		if (type === 'board' && extraData) {
			pContent = `<div style="text-align:center;margin-bottom:20px;"><h2>${displayText}</h2></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;max-width:800px;margin:0 auto;">${extraData.map(i=>`<div style="aspect-ratio:1;border:2px solid #ccc;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f9fafb;padding:10px;"><div style="font-size:50px;margin-bottom:10px;">${i.emoji}</div><div style="font-size:16px;font-weight:bold;text-transform:uppercase;">${i.text}</div></div>`).join('')}</div>`;
		}
		w.document.write(`<html><head><title>Print</title><style>body{font-family:sans-serif;padding:40px;color:#000;}h1,h2,h3{border-bottom:2px solid #eee;padding-bottom:10px;}ul{padding-left:20px;}@media print{body{-webkit-print-color-adjust:exact;}}</style></head><body>${pContent}<div style="margin-top:50px;border-top:1px solid #ccc;padding-top:10px;font-size:10px;color:#666;text-align:center;">Generado por SEND Assistant</div></body></html>`);
		w.document.close(); setTimeout(() => w.print(), 500);
	};

	const handleSave = async () => {
		if(!onSaveResource || savedDocId) return;	
		setSaving(true);
		
		let safeMediaUrl = mediaUrl;
		if (mediaUrl && mediaUrl.length > 900000) {	
			try {
				safeMediaUrl = await compressBase64Image(mediaUrl);
				if (safeMediaUrl.length > 950000) {
					safeMediaUrl = null;
					alert(t('imgTooLarge'));
				}
			} catch(e) {
				safeMediaUrl = null;
				console.error("Compression failed", e);
			}
		}
		
		let safeExtraData = extraData;
		if (extraData && extraData.audioUrl && extraData.audioUrl.startsWith('blob:')) {
			safeExtraData = { ...extraData, audioUrl: null };	
		}
		
		if (safeExtraData && safeExtraData.imageUrl && safeExtraData.imageUrl.length > 900000) {
			   try {
				 const compressed = await compressBase64Image(safeExtraData.imageUrl);
					if (compressed.length < 950000) {
						safeExtraData.imageUrl = compressed;
					} else {
						safeExtraData.imageUrl = null;	
					}
			 } catch(e) {
				 console.error("ExtraData Image compression failed", e);
			 }
		}

		const cleanData = {
			content: content || "",
			type: type || "unknown",
			...(safeMediaUrl && { mediaUrl: safeMediaUrl }),
			...(safeExtraData && { extraData: safeExtraData }),
			...(metaData && { metadata: metaData })
		};

		await onSaveResource(id, cleanData);
		setSaving(false);
	};

	const handleDelete = async () => {
		if (savedDocId && onDeleteResource) {
			await onDeleteResource(id, savedDocId);
			setShowDeleteConfirm(false);
		}
	};
	
	const hc = getHeaderColor(type);

	return (
		<div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
			<div className={`flex max-w-[95%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
				<div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isUser ? 'bg-blue-600' : 'bg-gradient-to-tr from-indigo-500 to-purple-500'}`}>
					{isUser ? <User size={16} className="text-white" /> : <Sparkles size={16} className="text-white" />}
				</div>
				<div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full min-w-0`}>
					<div className="flex items-center gap-2 mb-1">
						<span className={`text-xs font-semibold ${themeStyle.textSecondary}`}>{isUser ? 'Tú' : 'SEND Assistant'}</span>
					</div>
					<div className={`rounded-2xl p-4 ${isUser ? themeStyle.bgUser + ' rounded-tr-none' : themeStyle.bgCard + ' border ' + themeStyle.border + ' rounded-tl-none w-full'}`}>
						{(type === 'text' || type === 'simplify') && (
							<div className={`text-sm md:text-base leading-relaxed ${themeStyle.textPrimary} message-content overflow-x-auto`} style={{ '--header-color': hc }}>
							   {isUser ? <span className="whitespace-pre-wrap">{displayText}</span> : <div dangerouslySetInnerHTML={{ __html: cleanResponseText(displayText) }} />}
							</div>
						)}
						{type === 'image' && (
							mediaUrl ? (
							<div className="overflow-hidden rounded-lg bg-black/5 cursor-zoom-in" onClick={() => onImageClick && onImageClick(mediaUrl)}>
								<img src={mediaUrl} alt="Generada" className="w-full h-auto max-w-sm" />
								<div className={`p-2 text-xs ${themeStyle.textMuted} italic border-t ${themeStyle.border}`}>{content}</div>
							</div>
							) : (
								<div className={`p-4 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center gap-2 ${themeStyle.textPrimary}`}>
									<AlertCircle size={16} className="text-red-500"/>
									<span className="text-xs italic">{t('imgUnavailable')}</span>
								</div>
							)
						)}
						{type === 'audio_result' && (
							<div className="flex items-center gap-3">
								 <div className="p-2 bg-green-500/20 text-green-400 rounded-full"><Music size={20}/></div>
								 <div className="flex-1 min-w-0">
									 <h4 className="font-semibold text-sm" style={{ color: hc }}>Audio</h4>
									 {/* Displaying original content (displayText) or truncated if not original */}
									 <p className={`text-xs italic truncate ${themeStyle.textSecondary}`}>{cleanTextForTTS(displayText)}</p>
									 <span className="text-[10px] text-gray-500 italic">
										 {isFallback ? t('audioFallback') : ''}
									 </span>
								 </div>
							</div>
						)}
						{type === 'video_slide' && extraData && (
							<div className="w-full pt-2 relative group">
								<div className="flex items-center gap-2 mb-2">
									<Film size={14} className="text-red-400"/>
									<span className="text-xs text-red-400 font-bold uppercase tracking-wider">Video-Historia</span>
									{isRegenerating && <span className="text-[10px] text-blue-400 animate-pulse ml-auto">{t('regeneratingAudio')}</span>}
									
									{/* FULLSCREEN BUTTON */}
										<button	
											onClick={() => onExpand && onExpand()}	
											className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
											title="Expandir"
										>
											<Maximize2 size={14} className="text-gray-400 hover:text-white"/>
										</button>
								</div>
								<div onClick={() => onExpand && onExpand()} className="cursor-pointer">
									<VideoPlayer	
										imageUrl={extraData.imageUrl}	
										audioUrl={extraData.audioUrl}	
										text={content}	
										themeStyle={themeStyle}	
										isRegenerating={isRegenerating}
									/>
								</div>
							</div>
						)}
						{type === 'board' && extraData && (
							<div className="w-full">
								<div className="flex items-center gap-2 mb-3">
									<Grid size={14} className="text-yellow-400"/>
									<span className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Tablero: {content}</span>
								</div>
								<CommunicationBoard data={extraData} themeStyle={themeStyle} />
							</div>
						)}
					</div>

					{!isUser && (
						<div className="flex items-center gap-1 mt-2 ml-1">
							{!hideSave && (
								<>
									{/* SAVE / DELETE LOGIC - Uses savedDocId from props (global state) */}
									{!savedDocId ? (
										<button onClick={handleSave} disabled={saving} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors ${themeStyle.textMuted}`} title={t('saveToRepo')}>
											{saving ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
										</button>
									) : (
										showDeleteConfirm ? (
											<div className="flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-full animate-in fade-in zoom-in">
												<span className="text-[10px] font-bold text-red-500 mr-1">{t('confirmDelete')}</span>
												<button onClick={handleDelete} className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-200/50"><Check size={14}/></button>
												<button onClick={() => setShowDeleteConfirm(false)} className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200/50"><X size={14}/></button>
											</div>
										) : (
											<button onClick={() => setShowDeleteConfirm(true)} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors text-red-400 hover:text-red-500`} title={t('removeFromRepo')}>
												<Trash2 size={16} />
											</button>
										)
									)}
									<div className={`w-[1px] h-3 bg-gray-500/30 mx-1`}></div>
								</>
							)}

							{(type === 'text' || type === 'simplify' || type === 'audio_result') && (
								<>
								<button onClick={() => onPlayAudio(content, metaData?.lang)} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors ${isPlayingAudio ? 'text-blue-400 animate-pulse' : themeStyle.textMuted}`} title="Reproducir">
									{isPlayingAudio ? <StopCircle size={16} /> : <Volume2 size={16} />}
								</button>
								{content !== 'browser_fallback' && (
									<button onClick={() => onDownloadMp3(content)} disabled={isDownloadingMp3} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors ${isDownloadingMp3 ? 'text-blue-400 animate-pulse' : themeStyle.textMuted}`} title={t('downloadMp3')}>
										{isDownloadingMp3 ? <Loader2 size={16} className="animate-spin"/> : <FileAudio size={16} />}
									</button>
								)}
								</>
							)}
							
							{(type === 'simplify' || type === 'text') && (
								<>
									<button onClick={handleDownloadTxt} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors ${themeStyle.textMuted}`} title="TXT">
										<FileText size={16} />
									</button>
									<button onClick={handlePrint} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors ${themeStyle.textMuted}`} title={t('print')}>
										<Printer size={16} />
									</button>
								</>
							)}

							{type === 'board' && (
								<>
									<button onClick={handleDownloadBoard} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors ${themeStyle.textMuted}`} title="PNG">
										<Download size={16} />
									</button>
									<button onClick={handlePrint} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors ${themeStyle.textMuted}`} title={t('print')}>
										<Printer size={16} />
									</button>
								</>
							)}

							{type === 'image' && (
								<button onClick={handleDownloadImage} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors ${themeStyle.textMuted}`} title="Download">
									<Download size={16} />
								</button>
							)}
							
							<div className={`w-[1px] h-3 bg-gray-500/30 mx-1`}></div>
							<button onClick={handleCopy} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors ${themeStyle.textMuted}`} title={t('copy')}>
								{copied ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
							</button>
							<button onClick={handleShare} className={`p-1.5 rounded-full ${themeStyle.hoverBg} transition-colors ${themeStyle.textMuted}`} title={t('share')}>
								<Share2 size={16} />
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// --- COMPONENTE REPOSITORIO ---
const RepositoryView = ({ themeStyle, t, onPreviewItem, onPlayAudio, currentAudioText, onImageClick }) => {
	const [resources, setResources] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filters, setFilters] = useState({ type: 'all', need: 'all', lang: 'all', stage: 'all' });

	useEffect(() => {
		if (!db) {
			setResources([]);
			setLoading(false);
			return;
		}
		const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'resources'));	
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
			setResources(data);
			setLoading(false);
		}, (error) => {
			console.error("Repo Error:", error);
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	// Filter Logic
	const filteredResources = useMemo(() => {
		return resources.filter(res => {
			const matchesSearch = res.metadata?.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||	
								  res.content?.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesType = filters.type === 'all' || res.type === filters.type;
			const matchesNeed = filters.need === 'all' || res.metadata?.need === filters.need;
			const matchesLang = filters.lang === 'all' || res.metadata?.lang === filters.lang;	
			const matchesStage = filters.stage === 'all' || res.metadata?.stage === filters.stage;
			
			return matchesSearch && matchesType && matchesNeed && matchesLang && matchesStage;
		});
	}, [resources, searchTerm, filters]);

	const getTypeIcon = (type) => {
		switch(type) {
			case 'text': return <FileText size={16} className="text-blue-400"/>;
			case 'image': return <ImageIcon size={16} className="text-purple-400"/>;
			case 'audio_result': return <Music size={16} className="text-green-400"/>;
			case 'board': return <Grid size={16} className="text-yellow-400"/>;
			case 'video_slide': return <Video size={16} className="text-red-400"/>;
			default: return <File size={16}/>;
		}
	};

	return (
		<div className={`h-full flex flex-col ${themeStyle.bgMain} p-6`}>
			{/* ... Filter and Search Header ... */}
			<div className="mb-6 space-y-4">
				<h2 className={`text-2xl font-bold ${themeStyle.textPrimary} flex items-center gap-2`}>
					<Library className="text-blue-500"/> {t('repository')}
				</h2>
				
				<div className="relative">
					<Search className={`absolute left-3 top-2.5 ${themeStyle.textMuted}`} size={18} />
					<input	
						className={`w-full pl-10 pr-4 py-2 rounded-xl border ${themeStyle.border} ${themeStyle.bgCard} ${themeStyle.textPrimary} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
						placeholder={t('searchRes')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<div className="flex flex-wrap gap-2">
					<div className="relative">
						<select className={`pl-2 pr-8 py-1.5 text-xs rounded-lg border ${themeStyle.border} ${themeStyle.bgCard} ${themeStyle.textPrimary} appearance-none cursor-pointer`}
							value={filters.type} onChange={e=>setFilters({...filters, type: e.target.value})}>
							<option value="all">{t('filterType')}: {t('all')}</option>
							<option value="text">{t('text')}</option>
							<option value="image">{t('image')}</option>
							<option value="audio_result">{t('audio')}</option>
							<option value="board">{t('board')}</option>
						</select>
						<ChevronDown size={12} className={`absolute right-2 top-2 ${themeStyle.textMuted} pointer-events-none`}/>
					</div>
					{/* ... other filters ... */}
					<div className="relative">
						<select className={`pl-2 pr-8 py-1.5 text-xs rounded-lg border ${themeStyle.border} ${themeStyle.bgCard} ${themeStyle.textPrimary} appearance-none cursor-pointer`}
							value={filters.stage} onChange={e=>setFilters({...filters, stage: e.target.value})}>
							<option value="all">{t('filterStage')}: {t('all')}</option>
							{t('stages').map(s => <option key={s} value={s}>{s}</option>)}
						</select>
						<ChevronDown size={12} className={`absolute right-2 top-2 ${themeStyle.textMuted} pointer-events-none`}/>
					</div>
					<div className="relative">
						<select className={`pl-2 pr-8 py-1.5 text-xs rounded-lg border ${themeStyle.border} ${themeStyle.bgCard} ${themeStyle.textPrimary} appearance-none cursor-pointer`}
							value={filters.need} onChange={e=>setFilters({...filters, need: e.target.value})}>
							<option value="all">{t('filterNeed')}: {t('all')}</option>
							{Object.values(t('sendNeeds')).flat().map(n => <option key={n} value={n}>{n}</option>)}
						</select>
						<ChevronDown size={12} className={`absolute right-2 top-2 ${themeStyle.textMuted} pointer-events-none`}/>
					</div>
					<div className="relative">
						<select className={`pl-2 pr-8 py-1.5 text-xs rounded-lg border ${themeStyle.border} ${themeStyle.bgCard} ${themeStyle.textPrimary} appearance-none cursor-pointer`}
							value={filters.lang} onChange={e=>setFilters({...filters, lang: e.target.value})}>
							<option value="all">{t('filterLang')}: {t('all')}</option>
							<option value="Español">Español</option>
							<option value="Inglés">Inglés</option>
							<option value="Catalán">Catalán</option>
						</select>
						<ChevronDown size={12} className={`absolute right-2 top-2 ${themeStyle.textMuted} pointer-events-none`}/>
					</div>
				</div>
			</div>

			{/* MODIFIED: Repository Grid 5-col XL & Double Height (h-96) + Video Thumbnails */}
			<div className={`flex-1 overflow-y-auto scrollbar-thin ${themeStyle.scrollThumb}`}>
				{loading ? (
					<div className="flex justify-center pt-20"><Loader2 className="animate-spin text-blue-500" size={32}/></div>
				) : filteredResources.length === 0 ? (
					<div className={`text-center pt-20 ${themeStyle.textMuted}`}>
						<Library size={48} className="mx-auto mb-3 opacity-20"/>
						{t('noResults')}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{filteredResources.map((res) => (
							<div	
								key={res.id}	
								onClick={() => {
									onPreviewItem(res);
								}}
								className={`p-4 rounded-xl border ${themeStyle.border} ${themeStyle.cardRepo} transition-all cursor-pointer flex flex-col h-96 group relative overflow-hidden hover:ring-2 hover:ring-blue-500/50`}
							>
								<div className="flex justify-between items-start mb-2">
									<div className="flex items-center gap-2">
										<div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/10`}>
											{getTypeIcon(res.type)}
										</div>
										<span className={`text-xs font-bold uppercase tracking-wider ${themeStyle.textSecondary}`}>{res.type === 'audio_result' ? 'Audio' : res.type}</span>
									</div>
									{res.metadata?.lang && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">{res.metadata.lang.substring(0,3).toUpperCase()}</span>}
								</div>
								
								<h3 className={`font-semibold ${themeStyle.textPrimary} mb-1 line-clamp-1`}>
									{cleanTextForTTS(res.metadata?.topic) || "Sin título"}
								</h3>
								
								{/* CONTENIDO DINÁMICO DE LA TARJETA - IMPLEMENTACIÓN THUMBNAIL BOARD */}
								{(res.type === 'image' && res.mediaUrl) || (res.type === 'video_slide' && res.extraData?.imageUrl) ? (
									<div	
										className={`flex-1 overflow-hidden rounded-lg mb-2 relative bg-black/5 ${res.type === 'image' ? 'cursor-zoom-in' : 'cursor-pointer'}`}	
										onClick={(e) => {	
											// Only stop propagation and zoom for pure images. Videos should trigger the parent onClick (preview)
											if (res.type === 'image') {
												e.stopPropagation();	
												onImageClick && onImageClick(res.mediaUrl);	
											}
											// If video_slide, do nothing (bubbles to parent onClick -> opens preview)
										}}
									>
										<img	
											src={res.type === 'image' ? res.mediaUrl : res.extraData.imageUrl}	
											alt={res.metadata?.topic}	
											className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"	
										/>
										{/* Video Overlay Icon */}
										{res.type === 'video_slide' && (
											<div className="absolute inset-0 flex items-center justify-center bg-black/30">
												<div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
													<Play size={24} className="text-white fill-current" />
												</div>
											</div>
										)}
									</div>
								) : res.type === 'board' && res.extraData && Array.isArray(res.extraData) ? (
									<div className="flex-1 flex flex-col justify-center items-center p-4">
										<div className="flex flex-wrap justify-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 w-full max-w-xs h-32 overflow-hidden items-center">
											{res.extraData.slice(0, 6).map((item, index) => (
												<span key={index} className="text-3xl leading-none transition-transform hover:scale-110" title={item.text}>
													{item.emoji}
												</span>
											))}
										</div>
										<p className={`text-xs ${themeStyle.textMuted} mt-4 line-clamp-3 text-center`}>
											{cleanTextForTTS(res.content)}
										</p>
									</div>
								) : (
									<div className={`text-xs ${themeStyle.textMuted} mb-3 flex-1 overflow-hidden relative`}>
										{/* ADJUSTED line-clamp to show more lines in text/simplify cards */}
										<p className={`line-clamp-8 ${themeStyle.textSecondary}`}>
											{cleanTextForTTS(res.content)}
										</p>
										<div className={`absolute bottom-0 w-full h-8 bg-gradient-to-t from-[${themeStyle.bgCard}] to-transparent`}></div>
									</div>
								)}

								{/* REPRODUCTOR MINIATURA PARA AUDIO */}
								{res.type === 'audio_result' && (
									<button	
										onClick={(e) => {
											e.stopPropagation();
											onPlayAudio(res.content, res.metadata?.lang); // Pass content and language
										}}
										className={`absolute right-3 top-16 p-3 rounded-full shadow-lg transition-all z-20 ${currentAudioText === res.content ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white hover:bg-green-600 hover:scale-110'}`}
										title="Escuchar ahora"
									>
										{currentAudioText === res.content ? <StopCircle size={18}/> : <Play size={18} fill="currentColor"/>}
									</button>
								)}

								<div className={`flex justify-between items-end text-[10px] ${themeStyle.textMuted} mt-auto pt-2 border-t ${themeStyle.border}`}>
									<div className="flex flex-col">
										<span>{res.metadata?.need || "General"}</span>
										<span className="opacity-70">{new Date(res.createdAt?.seconds * 1000).toLocaleDateString()}</span>
									</div>
									<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<span className="text-blue-500 font-medium flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg">
											<Eye size={12}/> {t('preview')}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

// --- LOGIN SCREEN COMPONENT ---
const LoginScreen = ({ onLoginSuccess, t, currentTheme }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState('usuario'); // Default to 'usuario'
	const [error, setError] = useState(null);

	const handleLogin = (e) => {
		e.preventDefault();
		setError(null);

		const userRecord = VALID_USERS[username];
		
		if (userRecord && userRecord.password === password && userRecord.role === role) {
			onLoginSuccess(username, role);
		} else {
			setError(t('loginError'));
		}
	};

	return (
		<div className={`min-h-screen flex flex-col items-center justify-center p-4 ${currentTheme.bgMain} transition-colors duration-300`}>
			{/* Logo - Centrado en el tercio superior */}
			<div className="w-48 max-w-full mb-12">	
				<img src="https://sendia.indigobluestudio.com/media/logo_sm.png" alt="SEND+IA Logo" className="w-full h-auto mx-auto" />
			</div>

			<div className={`w-full max-w-sm p-8 space-y-6 ${currentTheme.bgSidebar} rounded-2xl shadow-xl border ${currentTheme.border}`}>
				<div className="text-center">
					<h2 className={`text-xl font-bold ${currentTheme.textPrimary}`}>{t('loginTitle')}</h2>
					<p className={`text-sm ${currentTheme.textSecondary}`}>{t('loginSubtitle')}</p>
				</div>

				{error && (
					<div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-sm flex items-center gap-2">
						<AlertCircle size={16} className="text-red-400 shrink-0" />
						<span className="text-red-400">{error}</span>
					</div>
				)}

				<form onSubmit={handleLogin} className="space-y-4">
					{/* User */}
					<div className="space-y-1">
						<label className={`text-xs font-semibold ${currentTheme.textMuted}`}>{t('user')}</label>
						<input	
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder={t('user')}
							className={`input-std w-full ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary} focus:ring-blue-500 focus:border-blue-500`}
							required
						/>
					</div>

					{/* Password */}
					<div className="space-y-1">
						<label className={`text-xs font-semibold ${currentTheme.textMuted}`}>{t('password')}</label>
						<input	
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder={t('password')}
							className={`input-std w-full ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary} focus:ring-blue-500 focus:border-blue-500`}
							required
						/>
					</div>
					
					{/* Profile */}
					<div className="space-y-1">
						<label className={`text-xs font-semibold ${currentTheme.textMuted}`}>{t('profile')}</label>
						<select	
							value={role}
							onChange={(e) => setRole(e.target.value)}
							className={`input-std w-full ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary} focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer`}
						>
							<option value="usuario">Usuario</option>
							<option value="administrador">Administrador</option>
						</select>
					</div>

					{/* Login Button */}
					<button type="submit" className="btn-primary w-full bg-blue-600 hover:bg-blue-700">
						<LogIn size={18} /> {t('loginBtn')}
					</button>
				</form>
			</div>
		</div>
	);
};


// --- APP PRINCIPAL ---

export default function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [currentUserRole, setCurrentUserRole] = useState(null);
	const [currentUserName, setCurrentUserName] = useState(null);
	
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [messages, setMessages] = useState([]);
	const [isTyping, setIsTyping] = useState(false);
	const [activeMode, setActiveMode] = useState('text');
	const [videoSubTab, setVideoSubTab] = useState('plan');
	const [isListening, setIsListening] = useState(false);
	const [previewItem, setPreviewItem] = useState(null);	
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [appTheme, setAppTheme] = useState('dark');
	const [appLang, setAppLang] = useState('es');
	const [user, setUser] = useState(null);
	const [showHelp, setShowHelp] = useState(true);	
	const [fullScreenImage, setFullScreenImage] = useState(null);
	
	// HOOKS MUST BE DECLARED FIRST AND UNCONDITIONALLY
	const [browserVoices, setBrowserVoices] = useState([]);


	const t = (k) => {
		const langObj = TRANSLATIONS[appLang] || TRANSLATIONS.es;
		return langObj[k] || k;
	};

	const currentTheme = THEMES[appTheme];

	const fileInputRef = useRef(null);
	const [audioPlayer, setAudioPlayer] = useState(null);
	const [currentAudioText, setCurrentAudioText] = useState(null);
	const [downloadingMp3Text, setDownloadingMp3Text] = useState(null);
	
	const [isRegeneratingAudio, setIsRegeneratingAudio] = useState(false);

	const [fText, setFText] = useState({ topic: '', obj: '', stage: 'Infantil', need: '', lang: '', type: '', base: '', readingLevel: '' });
	const [fImg, setFImg] = useState({ type: 'Pictograma (ARASAAC Estilo)', ratio: '1:1', prompt: '', lang: '' });	
	const [fAud, setFAud] = useState({ voice: 'Kore', lang: '', text: '' }); // Default to Kore (IA Female Spain)
	const [fVid, setFVid] = useState({ type: 'Historia Social', topic: '', lang: '', need: '' });
	const [fSimp, setFSimp] = useState({ level: '', text: '', lang: '' });
	const [fBoard, setFBoard] = useState({ context: '', size: '9 (3x3)', lang: '' });

	const bottomRef = useRef(null);

	// --- LOGIN SUCCESS HANDLER ---
	const handleLoginSuccess = (name, role) => {
		setCurrentUserName(name);
		setCurrentUserRole(role);
		setIsAuthenticated(true);
	};
	
	// --- ORDERED USE EFFECTS ---

	// 1. AUTH & FIREBASE INIT (RUNS ONCE)
	useEffect(() => {
		const initAuth = async () => {
			if (!auth) return;
			try {
				if (initialAuthToken) {
					await signInWithCustomToken(auth, initialAuthToken);
				} else {
					await signInAnonymously(auth);
				}
			} catch (e) {
				console.warn("Canvas token failed or expired. Signing in anonymously.", e);
				await signInAnonymously(auth);
			}

			if (auth) {
				const unsubscribe = onAuthStateChanged(auth, (u) => {
					setUser(u);
					// If the user has a fixed profile (profesor/admin), they are authenticated
					if (u && currentUserRole) {
						setIsAuthenticated(true);
					}
				});
				return () => unsubscribe();
			}
		};
		initAuth();
	}, [currentUserRole]);
	
	// 2. LOAD LAMEJS FOR MP3 CONVERSION
	useEffect(() => {
		const script = document.createElement('script');
		script.src = "https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.0/lame.min.js";
		script.async = true;
		document.body.appendChild(script);
		return () => {
			if(document.body.contains(script)) document.body.removeChild(script);
		}
	}, []);
	
	// 3. GET DYNAMIC BROWSER VOICES (REMOVED, NO LONGER NEEDED FOR DISPLAY, keeping logic for safety)
	useEffect(() => {
		// Logic for dynamic voices removed as we force AI voices now, but the hook must remain declared here.
		// Keeping it structured to avoid future HOOK order errors.
		if ('speechSynthesis' in window) {
			const updateVoices = () => {
				const voices = window.speechSynthesis.getVoices();
				const voiceMap = {
					'es-ES': 'Español',
					'ca-ES': 'Catalán',
					'en-GB': 'Inglés Británico'
				};
				
				const filteredVoices = voices
					.filter(v => ['es-ES', 'ca-ES', 'en-GB'].includes(v.lang))
					.map(v => ({
						id: v.name,
						label: `${v.name} (${voiceMap[v.lang] || v.lang})`,
						lang: v.lang
					}))
					.sort((a, b) => b.label.localeCompare(a.label));

				// We don't use this state in the dropdown anymore, but keeping logic minimal
				setBrowserVoices([
					...filteredVoices
				]);
			};
			
			window.speechSynthesis.onvoiceschanged = updateVoices;
			updateVoices();
			
			return () => { window.speechSynthesis.onvoiceschanged = null; };
		} else {
			setBrowserVoices([]);
		}
	}, [appLang]);


	// 4. AUTO-SHOW VIDEO TUTORIAL ON LANGUAGE CHANGE
	useEffect(() => {
		if (isAuthenticated) {
			setShowHelp(true);
		}
	}, [appLang, isAuthenticated]);
	
	// 5. REGENERATE AUDIO FOR VIDEO PREVIEW IF MISSING
	useEffect(() => {
		if (previewItem && previewItem.type === 'video_slide' && previewItem.content && (!previewItem.extraData?.audioUrl || !previewItem.extraData.audioUrl.startsWith('blob:'))) {
			const regenerate = async () => {
				setIsRegeneratingAudio(true);
				try {
					const audioBlob = await genAudioBlob(previewItem.content);
					const newAudioUrl = URL.createObjectURL(audioBlob);
					setPreviewItem(prev => ({
						...prev,
						extraData: { ...prev.extraData, audioUrl: newAudioUrl }
					}));
				} catch (e) {
					console.error("Failed to regenerate audio preview", e);
				} finally {
					setIsRegeneratingAudio(false);
				}
			};
			regenerate();
		}
	}, [previewItem]);


	// 6. SCROLL TO BOTTOM
	useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
	
	// 7. PAUSE AUDIO ON UNMOUNT/RELOAD
	useEffect(() => { return () => { if (audioPlayer) audioPlayer.pause(); }; }, [audioPlayer]);
	
	// 8. DYNAMIC STYLES
	useEffect(() => {
		const style = document.createElement('style');
		style.innerHTML = `
			.message-content h1, .message-content h2, .message-content h3 { color: var(--header-color, #60a5fa); font-weight: 600; margin: 0.8em 0 0.4em 0; }
			.message-content p { margin-bottom: 1.2em; line-height: 1.6; }
			.message-content ul { list-style-type: disc; }
			.message-content ol { list-style-type: decimal; }
			.message-content ul, .message-content ol { padding-left: 1.2em; margin-bottom: 0.8em; }
			.message-content li { margin-bottom: 0.3em; }
			.message-content li::marker { color: ${appTheme === 'dark' ? '#fff' : '#000'}; }
			.message-content strong { color: ${appTheme === 'dark' ? '#e2e8f0' : '#111827'}; font-weight: 700; }
			
			/* TABLE STYLES FIXED */
			.message-content table {	
				width: 100%;	
				border-collapse: collapse;	
				margin: 1em 0;	
				font-size: 0.9em;	
				background-color: #000000; /* Black Background */
				color: #ffffff; /* White Text */
			}
			.message-content th, .message-content td {	
				padding: 0.8em;	
				border: 1px solid #d1d5db; /* Light Gray Border */
			}
			.message-content th {	
				background-color: #111827;	
				color: #096EBE; /* Blue Title */
				font-weight: bold;
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}
			
			.cursor-zoom-in { cursor: zoom-in; }
			
			.input-std { width: 100%; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; transition: border-color 0.2s; border-width: 1px; }
			.input-std:focus { outline: none; border-color: #60a5fa; }
			.btn-primary { width: 100%; color: white; padding: 0.6rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background-color 0.2s; margin-top: 0.5rem; }
			::-webkit-scrollbar { width: 6px; }
			::-webkit-scrollbar-track { background: transparent; }
			::-webkit-scrollbar-thumb { background: ${appTheme==='dark'?'#374151':'#d1d5db'}; border-radius: 3px; }
			::-webkit-scrollbar-thumb:hover { background: ${appTheme==='dark'?'#4b5563':'#9ca3af'}; }
			.animate-spin-slow { animation: spin 3s linear infinite; }
			@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
		`;
		const old = document.getElementById('dynamic-theme-styles');
		if (old) old.remove();
		style.id = 'dynamic-theme-styles';
		document.head.appendChild(style);
	}, [appTheme]);

	const genAudioBlob = async (text) => {	
		const cleanText = cleanTextForTTS(text);
		if (!cleanText) throw new Error("Text is empty after cleaning");
		
		try {
			const payload = {	
				model: "gemini-2.5-flash-preview-tts",	
				contents: [{ parts: [{ text: cleanText }] }],	
				generationConfig: {	
					responseModalities: ["AUDIO"],	
					speechConfig: {	
						voiceConfig: {	
							// Only use API voices if a non-fallback option is selected
							prebuiltVoiceConfig: {	
								voiceName: fAud.voice
							}	
						}	
					}	
				}
			};

			const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {	
				method: 'POST',	
				headers: { 'Content-Type': 'application/json' },	
				body: JSON.stringify(payload)	
			});	
			
			if(!res.ok) {
				const errText = await res.text();
				console.error("TTS API Error Details:", res.status, errText);
				throw new Error(`TTS API Error: ${res.status}`);
			}
			
			const data = await res.json();
			const b64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;	
			if(!b64) throw new Error("No audio data received from API");	
			return new Blob([pcmToWav(base64ToUint8Array(b64), 24000)], { type: 'audio/wav' });	
		} catch(e) {
			console.error("TTS Gen Error", e);
			throw e; // Rethrow to be caught by playTTS
		}
	};

	const addMessage = (msg) => setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random(), savedDocId: null }]);

	const handleSaveResource = async (messageId, resourceData) => {
		if (!user) { alert("Error: User not authenticated or offline mode."); return null; }
		
		try {
			const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'resources'), {
				...resourceData,
				userId: user.uid,
				createdAt: serverTimestamp()
			});
			
			// Update the specific message in state to reflect it is saved
			setMessages(prev => prev.map(m =>	
				m.id === messageId ? { ...m, savedDocId: docRef.id } : m
			));
			return docRef.id;
		} catch (error) {	
			console.error("Save error:", error);	
			alert("Error saving.");	
			return null;
		}
	};

	const handleDeleteResource = async (messageId, docId) => {
		if (!user) return;
		try {
			// Delete from Firebase
			await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'resources', docId));
			
			// Update the specific message in state (revert to unsaved state) or remove if needed.	
			// Here we just unset savedDocId so user can save again if they really want, or just see it's gone.
			setMessages(prev => prev.map(m =>	
				m.id === messageId ? { ...m, savedDocId: null } : m
			));
			
			// Also check if we are in preview mode and close it
			if (previewItem && previewItem.id === docId) {
				setPreviewItem(null);
			}
		} catch (e) {
			console.error("Delete error:", e);
			alert("Error deleting.");
		}
	};

	// ... (TriggerFile, HandleFile, StartDictation same as before) ...
	const triggerFileUpload = () => { if(fileInputRef.current) fileInputRef.current.click(); };
	
	// REVERTED: handleFileChange to only support .txt (and doc/docx if browser handles it, but removing PDF special logic)
	const handleFileChange = (e) => {	
		const file = e.target.files[0];	
		if(!file) return;	
		
		const reader = new FileReader();	
		reader.onload = (ev) => {	
			const text = ev.target.result;	
			if(activeMode === 'text') setFText(prev => ({...prev, base: text}));	
			else if(activeMode === 'audio') setFAud(prev => ({...prev, text: text}));	
			else if(activeMode === 'simplify') setFSimp(prev => ({...prev, text: text}));	
		};	
		if(file.name.endsWith('.txt')) reader.readAsText(file);	
		else {	
			// Fallback for non-txt files (just to show we received it, but content might be garbled without proper extraction)
			// Since PDF extraction is removed, we just show a placeholder or try to read as text (which will fail for binary)
			// Better to just handle .txt for simplicity as requested "solo .txt"
			const dummyText = `[File: ${file.name}]\n\n(Content extraction available for .txt files)`;	
			if(activeMode === 'text') setFText(prev => ({...prev, base: dummyText}));	
			else if(activeMode === 'audio') setFAud(prev => ({...prev, text: dummyText}));	
			else if(activeMode === 'simplify') setFSimp(prev => ({...prev, text: dummyText}));	
		}	
		e.target.value = '';	
	};

	const startDictation = () => { if (!('webkitSpeechRecognition' in window)) { alert("Not supported."); return; } const recognition = new window.webkitSpeechRecognition(); recognition.lang = appLang === 'es' ? 'es-ES' : appLang === 'ca' ? 'ca-ES' : 'en-US'; recognition.continuous = false; recognition.interimResults = false; setIsListening(true); recognition.onresult = (event) => { const tr = event.results[0][0].transcript; if(activeMode === 'text') setFText(p => ({...p, base: (p.base + ' ' + tr).trim()})); else if(activeMode === 'audio') setFAud(p => ({...p, text: (p.text + ' ' + tr).trim()})); else if(activeMode === 'simplify') setFSimp(p => ({...p, text: (p.text + ' ' + tr).trim()})); setIsListening(false); }; recognition.onerror = () => setIsListening(false); recognition.onend = () => setIsListening(false); recognition.start(); };
	
	const processRequest = async (prompt, type, label, sysInstr="Expert SEND.", meta) => {	
		addMessage({ role: 'user', content: label });	
		setIsTyping(true);	
		if(window.innerWidth < 768) setIsSidebarOpen(false);	
		try {	
			const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: sysInstr }] } }) });	
			if(!res.ok) throw new Error("API Error");
			const d = await res.json();	
			addMessage({ role: 'ai', content: cleanResponseText(d.candidates?.[0]?.content?.parts?.[0]?.text || "Error"), type, metadata: meta });	
		} catch(e) {	
			addMessage({ role: 'ai', content: "Error connection." });	
		}	
		setIsTyping(false);	
	};

	const handleText = async () => {	
		if (!fText.topic.trim()) { alert(t('topicPlace')); return; }	
		// MODIFIED: Include readingLevel in prompt
		const readingLevelText = fText.readingLevel ? fText.readingLevel : "Nivel estándar, ajusta a Etapa Educativa.";
		const p = `
[ROL]: Experto pedagogo en Educación Especial (PT/AL) especializado en Diseño Universal para el Aprendizaje (DUA).

[TAREA]: Generar un recurso didáctico textual optimizado.

[PARÁMETROS]:
- TEMA: "${fText.topic}"
- TIPO DE TEXTO: ${fText.type || "Explicación didáctica"}
- IDIOMA DE SALIDA: ${fText.lang || appLang}
- ETAPA EDUCATIVA: ${fText.stage}
- OBJETIVO: ${fText.obj || "Comprensión del tema"}
- PERFIL DEL ALUMNO (NECESIDAD): ${fText.need || "General / Inclusivo"}
- NIVEL DE LECTURA (ADAPTACIÓN PRINCIPAL): ${readingLevelText}
[TEXTO BASE A ADAPTAR]: "${fText.base}" (Si está vacío, genera contenido nuevo)

[FORMATO DE SALIDA - IMPORTANTE]:
- Genera EXCLUSIVAMENTE código HTML para el contenido (body).
- ESTRUCTURA:
	<h3>Título del Recurso</h3>
	<p>Introducción clara...</p>
	<table>
		<tr><th>Concepto</th><th>Definición</th></tr>
		<tr><td>Ejemplo 1</td><td>Descripción simple</td></tr>
	</table>
	<ul>
		<li>Punto clave 1</li>
		<li>Punto clave 2</li>
	</ul>
	<p><strong>Conclusión/Resumen final.</strong></p>
- NO uses bloques de código markdown.
`;
		const meta = { topic: fText.topic, type: fText.type, lang: fText.lang || appLang, stage: fText.stage, need: fText.need, readingLevel: fText.readingLevel };
		await processRequest(p, 'text', `${t('generateBtn')}: ${fText.topic}`, "Expert SEND.", meta);	
	};

	const handleImage = async () => {	
		if (!fImg.prompt.trim()) { alert("Por favor, describe la imagen."); return; }
		const langInstruction = fImg.lang ? ` If text appears, use ${fImg.lang} language.` : ` If text appears, use ${appLang} language.`;
		// Mapped prompt logic
		const mappedPrompt = STYLE_PROMPT_MAP[fImg.type] || fImg.type;
		const p = `Educational illustration based on: ${fImg.prompt}. Style guideline: ${mappedPrompt}. Clear, distraction-free, suitable for special education.${langInstruction}`;	
		
		addMessage({ role: 'user', content: `Img: ${fImg.prompt}` });	
		setIsTyping(true);	
		try {	
			const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instances: [{ prompt: p }], parameters: { sampleCount: 1, aspectRatio: fImg.ratio || "1:1" } }) });	
			if(!r.ok) throw new Error("Image API Error");
			const d = await r.json();	
			const b64 = d.predictions?.[0]?.bytesBase64Encoded;	
			if(b64) {
				const meta = { topic: fImg.prompt, type: fImg.type, lang: fImg.lang || appLang };
				addMessage({ role: 'ai', content: fImg.prompt, type: 'image', mediaUrl: `data:image/png;base64,${b64}`, metadata: meta });	
			} else {
				throw new Error("No image data received.");
			}
		} catch(e) { 
			console.error("Image generation error:", e);
			addMessage({ role: 'ai', content: "Error generating image." }); 
		}	
		setIsTyping(false);	
	};
	
	const handleAudio = async () => {
		if (!fAud.text.trim()) return alert("Por favor, introduce texto.");
		addMessage({ role: 'user', content: `Audio/Traducir: "${fAud.text.substring(0,20)}..."` });
		setIsTyping(true);
		let finalContent = fAud.text;
		let langForTTS = fAud.lang ? (fAud.lang === 'Español' ? 'es' : fAud.lang === 'Catalán' ? 'ca' : 'en') : appLang;
		
		if (fAud.lang) {
			try {
				const prompt = `Translate the following text into ${fAud.lang}. Return ONLY the translated text, no intro/outro.\n\nText: "${fAud.text}"`;
				const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
				if(res.ok) {
					const data = await res.json();
					const translated = cleanResponseText(data.candidates?.[0]?.content?.parts?.[0]?.text);
					if (translated) finalContent = translated;
				}
			} catch (e) { console.error("Translation error", e); }
		}
		
		const meta = { topic: fAud.text.substring(0, 30) + '...', lang: langForTTS, type: 'Audio' };
		addMessage({ role: 'ai', content: finalContent, type: 'audio_result', metadata: meta });
		setIsTyping(false);
	};

	const handleVideoPlan = async () => {	
		if (!fVid.topic.trim()) { alert("Por favor, define un tema para el guion."); return; }
		const need = fVid.need ? `Necesidad: ${fVid.need}.` : "";	
		// INICIO MODIFICACIÓN: prompt más explícito para la tabla HTML.
		const p = `
[ROL]: Experto en diseño curricular y accesibilidad.
[TAREA]: Generar un Guion Técnico Detallado como una única tabla HTML para un recurso didáctico de vídeo.
[COLUMNAS OBLIGATORIAS]: "Escena/Slide", "Contenido Visual (Imagen, Pictograma o Descripción)", "Narración (Script)".
[PARÁMETROS]: Tipo: ${fVid.type}. Tema: ${fVid.topic}. ${need} Idioma de salida: ${fVid.lang||appLang}.
[FORMATO]: Genera EXCLUSIVAMENTE una tabla HTML completa y bien estructurada (usando <thead>/<th> y <tbody>/<tr>/<td>). La tabla debe ser inmediatamente utilizable, sin ningún texto introductorio ni bloques markdown.
`;
		// FIN MODIFICACIÓN
		const meta = { topic: fVid.topic, lang: fVid.lang || appLang, type: fVid.type };
		await processRequest(p, 'text', `${t('genScript')}: ${fVid.topic}`, "Expert SEND.", meta);	
	};

	// FIXED: Real Video Generation Logic
	const handleVideoCreate = async () => {
		if (!fVid.topic.trim()) { alert("Por favor, define un tema para el video."); return; }
		
		addMessage({ role: 'user', content: `${t('createVideo')}: ${fVid.topic}` });
		setIsTyping(true);

		try {
			// 1. Script
			const selectedLang = fVid.lang || appLang;
			// Force language in script prompt
			const scriptPrompt = `Escribe un guion de narración muy breve (máximo 2 frases) y educativo sobre: "${fVid.topic}". Idioma de salida OBLIGATORIO: ${selectedLang}. Sin títulos, solo la narración.`;
			
			const textRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ contents: [{ parts: [{ text: scriptPrompt }] }] })	
			});
			
			if (!textRes.ok) throw new Error("Error generating script");
			const textData = await textRes.json();
			const scriptText = cleanResponseText(textData.candidates?.[0]?.content?.parts?.[0]?.text || "Error en guion");

			// 2. Image
			const langInstruction = ` If text appears inside the image, it MUST be in ${selectedLang} language.`;
			const imgPrompt = `Educational illustration, children's book style, ${fVid.topic}. bright colors, clear composition. ${langInstruction}`;
			
			const imgRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({	
					instances: [{ prompt: imgPrompt }],	
					parameters: { sampleCount: 1, aspectRatio: "16:9" }	
				})	
			});

			if (!imgRes.ok) throw new Error("Error generating image");
			const imgData = await imgRes.json();
			const b64Img = imgData.predictions?.[0]?.bytesBase64Encoded;
			const imageUrl = b64Img ? `data:image/png;base64,${b64Img}` : null;

			// 3. Audio
			let audioUrl = null;
			try {
				// Use fAud.voice (default Kore) for video narration
				const voiceName = fAud.voice; 
				
				const payload = {	
					model: "gemini-2.5-flash-preview-tts",	
					contents: [{ parts: [{ text: scriptText }] }],	
					generationConfig: {	
						responseModalities: ["AUDIO"],	
						speechConfig: {	
							voiceConfig: {	
								prebuiltVoiceConfig: {	
									voiceName: voiceName
								}	
							}	
						}
					}
				};

				const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {	
					method: 'POST',	
					headers: { 'Content-Type': 'application/json' },	
					body: JSON.stringify(payload)	
				});	
				
				if(!res.ok) throw new Error("Video TTS API Error");

				const data = await res.json();
				const b64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;	
				if(!b64) throw new Error("No audio data received from API for video");	
				const audioBlob = new Blob([pcmToWav(base64ToUint8Array(b64), 24000)], { type: 'audio/wav' });

				audioUrl = URL.createObjectURL(audioBlob);
			} catch (audioErr) {
				console.error("Audio gen failed for video", audioErr);
			}

			const meta = { topic: fVid.topic, lang: selectedLang, type: 'Video' };
			
			addMessage({	
				role: 'ai',	
				content: scriptText,	
				type: 'video_slide',	
				extraData: { imageUrl, audioUrl },
				metadata: meta	
			});

		} catch (e) {
			console.error(e);
			addMessage({ role: 'ai', content: "Hubo un error creando el video. Inténtalo de nuevo." });
		} finally {
			setIsTyping(false);
		}
	};

	const handleSimplify = async () => {	
		if (!fSimp.text.trim()) return alert("Por favor, introduce texto a simplificar.");
		const p = `Experto Lectura Fácil. Nivel: "${fSimp.level}". Idioma: "${fSimp.lang||appLang}". Texto: "${fSimp.text}". Rescríbelo para máxima accesibilidad. Usa estructura de títulos (<h3>) y párrafos. HTML limpio. No incluyas bloques de código markdown.`;	
		const meta = { topic: 'Simplificación', level: fSimp.level, lang: fSimp.lang || appLang };
		await processRequest(p, 'simplify', `${t('simplifyBtn')}`, "Expert Easy Read.", meta);	
	};

	const handleBoard = async () => {	
		if (!fBoard.context.trim()) return alert("Por favor, introduce un contexto.");
		addMessage({ role: 'user', content: `${t('genBoardBtn')}: ${fBoard.context}` });	
		setIsTyping(true);	
		try {	
			const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `JSON Array 6-9 objs {emoji, text} para tablero SAAC: "${fBoard.context}". Idioma: ${fBoard.lang||appLang}. Solo JSON.` }] }], generationConfig: { responseMimeType: "application/json" } }) });	
			if(!res.ok) throw new Error("API Error");
			const data = await res.json();
			const rawText = data.candidates[0].content.parts[0].text;
			const json = JSON.parse(cleanJson(rawText));	
			const meta = { topic: fBoard.context, lang: fBoard.lang || appLang, type: 'Tablero' };
			addMessage({ role: 'ai', content: fBoard.context, type: 'board', extraData: json, metadata: meta });	
		} catch(e) { 
			console.error("Board generation error:", e);
			addMessage({ role: 'ai', content: "Error generating communication board." }); 
		}	
		setIsTyping(false);	
	};

	// MODIFIED: playTTS (API or no audio, NO fallback to robotic browser voices)
	const playTTS = async (text, contentLang) => {	
		const originalText = text;
		const displayLang = contentLang || appLang;	

		if (currentAudioText === originalText && audioPlayer) {	
			audioPlayer.pause();	
			setAudioPlayer(null);	
			setCurrentAudioText(null);	
			return;	
		}	
		
		if (audioPlayer) audioPlayer.pause();	

		// 1. Try API first
		setCurrentAudioText(originalText);	

		try {	
			const pcm = await genAudioBlob(originalText);	
			const wavBlob = pcm;	
			const url = URL.createObjectURL(wavBlob);	
			const a = new Audio(url);	
			a.onended = () => { setAudioPlayer(null); setCurrentAudioText(null); };	
			await a.play();	
			setAudioPlayer(a);	
					
			// API successful, ensure no fallback flag is set
			setMessages(prev => prev.map(m => m.content === originalText ? {...m, isFallback: false, metadata: {...m.metadata, lang: displayLang}} : m));

		} catch (e) {	
			console.warn("API TTS failed or skipped.", e);
			
			// API failed: clear the playing state and set fallback flag to show warning in UI
			setCurrentAudioText(null);
			setAudioPlayer(null);
			
			// Set the fallback flag, but DO NOT change the content text
			setMessages(prev => prev.map(m => m.content === originalText ? {...m, isFallback: true, metadata: {...m.metadata, lang: displayLang}} : m));
			
			alert("Error: No se pudo conectar al servicio de voz de alta calidad (TTS). El audio puede no estar disponible temporalmente.");
		}	
	};

	const dlMp3 = async (text) => {	
		try {	
			setDownloadingMp3Text(text);	
			
			// Try API first
			try {
				// Only attempt API download if not using fallback voice
				if (fAud.voice === 'fallback') {
					throw new Error("Cannot download browser TTS");
				}
				
				const pcm = await genAudioBlob(text);
				// If LameJS available, convert to MP3, else WAV
				let blob;
				let ext = 'wav';
				
				if (window.lamejs) {
					try {
						const arrayBuffer = await pcm.arrayBuffer();
						const uint8Array = new Uint8Array(arrayBuffer);
						const rawPcm = uint8Array.slice(44); // Skip WAV header (44 bytes)
						
						blob = pcmToMp3(rawPcm, 24000);
						ext = 'mp3';
					} catch(err) {
						console.error("LameJS error", err);
						blob = pcm; // Fallback to WAV blob
					}
				} else {
					blob = pcm;
				}

				if (!blob) throw new Error("Blob creation failed");

				const url = URL.createObjectURL(blob);	
				const a = document.createElement('a');	
				a.href = url;	
				a.download = `audio.${ext}`;	
				a.click();	

			} catch (apiErr) {
				console.warn("API download failed", apiErr);
				alert(t('downloadUnavailable')); // Cannot download browser TTS
			}

		} catch(e) {	
			alert("Error download");	
		} finally {	
			setDownloadingMp3Text(null);	
		}	
	};
	
	// --- CONDITIONAL RENDER: LOGIN SCREEN ---
	if (!isAuthenticated) {
		return <LoginScreen onLoginSuccess={handleLoginSuccess} t={t} currentTheme={currentTheme} />;
	}


	return (
		<div className={`flex h-screen ${currentTheme.bgMain} ${currentTheme.textPrimary} font-sans overflow-hidden transition-colors duration-300`}>
			<input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".txt" />

			{/* SIDEBAR */}
			<aside className={`${isSidebarOpen ? 'w-[320px]' : 'w-0'} ${currentTheme.bgSidebar} flex-shrink-0 transition-all duration-300 flex flex-col border-r ${currentTheme.border}`}>
				{/* ... (Sidebar content with clean logo) ... */}
				<div className="flex flex-col h-full overflow-hidden">
					<div className="p-4 space-y-3">
						{/* REPLACED Button with Clean Logo from Server */}
						<div className="flex items-center justify-center p-0 mb-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => {setMessages([]); setActiveMode('text');}}>
							<img src="https://sendia.indigobluestudio.com/media/logo_sm.png" alt="SEND+IA Logo" className="w-full h-auto" />
						</div>
						
						<div className="grid grid-cols-3 gap-2">
							{[
								{ id: 'text', icon: Type, label: t('text'), customColor: CUSTOM_COLORS.blue },
								{ id: 'image', icon: ImageIcon, label: t('image'), customColor: CUSTOM_COLORS.pink },
								{ id: 'audio', icon: Music, label: t('audio'), customColor: CUSTOM_COLORS.green },
								{ id: 'simplify', icon: BookOpen, label: t('simplify'), customColor: CUSTOM_COLORS.cyan },
								{ id: 'board', icon: Grid, label: t('board'), customColor: CUSTOM_COLORS.yellow },
								{ id: 'video', icon: Video, label: t('video'), customColor: CUSTOM_COLORS.red },
							].map(m => (
								<button key={m.id} onClick={() => setActiveMode(m.id)}	
									style={activeMode === m.id ? { backgroundColor: m.customColor, color: 'white', boxShadow: `0 4px 14px 0 ${m.customColor}66` } : {}}
									className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all ${activeMode === m.id ? '' : `${currentTheme.textSecondary} ${currentTheme.hoverBg}`}`}>
									<m.icon size={18} />
									<span className="text-[10px] font-medium leading-none">{m.label}</span>
								</button>
							))}
						</div>
						<button onClick={() => setActiveMode('repo')}	
							className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${activeMode === 'repo' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : `${currentTheme.bgMain} ${currentTheme.border} ${currentTheme.textSecondary} hover:${currentTheme.textPrimary}`}`}>
							<Library size={20} />
							<span className="font-medium text-sm">{t('repository')}</span>
						</button>
					</div>

					{/* FORM AREA */}
					<div className={`flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin ${currentTheme.scrollThumb}`}>
						{activeMode !== 'repo' && (
						<div className={`${currentTheme.bgMain} rounded-xl p-4 border ${currentTheme.border} space-y-4`}>
							{/* ... (Forms identical to previous version, ensuring context is passed) ... */}
							{activeMode === 'text' && (
								<div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
									<h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: CUSTOM_COLORS.blue }}><Wand2 size={14}/> {t('genText')}</h3>
									
									<div className={`flex ${appTheme==='dark'?'bg-black':'bg-gray-200'} p-1 rounded-lg`}>
										{t('stages').map(stage => (
											<button key={stage} onClick={() => setFText({...fText, stage})}
												style={fText.stage === stage ? { backgroundColor: CUSTOM_COLORS.blue, color: 'white' } : {}}
												className={`flex-1 py-1.5 text-sm rounded transition-all ${fText.stage === stage ? 'shadow' : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary}`}`}>
												{stage}
											</button>
										))}
									</div>

									<input className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fText.topic} onChange={e=>setFText({...fText, topic: e.target.value})} placeholder={t('topicPlace')}	
										style={{ borderColor: 'transparent', border: `1px solid ${appTheme === 'dark' ? '#374151' : '#d1d5db'}` }}	
										onFocus={(e) => e.target.style.borderColor = CUSTOM_COLORS.blue}
										onBlur={(e) => e.target.style.borderColor = appTheme === 'dark' ? '#374151' : '#d1d5db'}
									/>
									<input className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fText.obj} onChange={e=>setFText({...fText, obj: e.target.value})} placeholder={t('objPlace')}	
										style={{ borderColor: 'transparent', border: `1px solid ${appTheme === 'dark' ? '#374151' : '#d1d5db'}` }}	
										onFocus={(e) => e.target.style.borderColor = CUSTOM_COLORS.blue}
										onBlur={(e) => e.target.style.borderColor = appTheme === 'dark' ? '#374151' : '#d1d5db'}
									/>
									<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fText.type} onChange={e=>setFText({...fText, type: e.target.value})}
										style={{ borderColor: 'transparent', border: `1px solid ${appTheme === 'dark' ? '#374151' : '#d1d5db'}` }}	
										onFocus={(e) => e.target.style.borderColor = CUSTOM_COLORS.blue}
										onBlur={(e) => e.target.style.borderColor = appTheme === 'dark' ? '#374151' : '#d1d5db'}
									>
										<option value="" disabled>{t('typePlace')}</option>
										{t('textTypes').map(x=><option key={x} value={x}>{x}</option>)}
									</select>
									{/* ADDED Reading Level Select */}
									<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fText.readingLevel} onChange={e=>setFText({...fText, readingLevel: e.target.value})}
										style={{ borderColor: 'transparent', border: `1px solid ${appTheme === 'dark' ? '#374151' : '#d1d5db'}` }}	
										onFocus={(e) => e.target.style.borderColor = CUSTOM_COLORS.blue}
										onBlur={(e) => e.target.style.borderColor = appTheme === 'dark' ? '#374151' : '#d1d5db'}
									>
										<option value="" disabled>{t('readLevel')}</option>
										{t('readingLevels').map(l=><option key={l} value={l}>{l}</option>)}
									</select>

									<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fText.lang} onChange={e=>setFText({...fText, lang: e.target.value})}>
										<option value="" disabled>{t('langRes')}</option>
										{['Español','Catalán','Inglés'].map(l=><option key={l} value={l}>{l}</option>)}
									</select>
									<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fText.need} onChange={e=>setFText({...fText, need: e.target.value})}>
										<option value="">{t('needEduc')}</option>
										{Object.entries(t('sendNeeds')).map(([k,v])=><optgroup key={k} label={k}>{v.map(n=><option key={n} value={n}>{n}</option>)}</optgroup>)}
									</select>
									
									{/* UPDATED: Base Text Area - Original colors with better sizing */}
									<label className={`text-xs ${currentTheme.textMuted} mb-1 block`}>{t('baseText')}</label>
									<textarea	
										className={`input-std h-48 ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`}	
										value={fText.base}	
										onChange={e=>setFText({...fText, base: e.target.value})}	
										placeholder="..."	
									/>

									<div className="flex gap-2 mt-2">
										<button onClick={startDictation} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 border transition-all ${isListening ? 'bg-red-900/20 border-red-500/50 text-red-400' : `${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textSecondary} hover:${currentTheme.textPrimary}`}`}
										style={isListening ? {} : { borderColor: appTheme === 'dark' ? '#374151' : '#d1d5db' }}
										>
											{isListening ? <MicOff size={16}/> : <Mic size={16}/>}
											<span className="text-xs font-medium">{isListening ? t('listening') : t('dictate')}</span>
										</button>
										<button onClick={triggerFileUpload} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${currentTheme.bgInput} border ${currentTheme.borderInput} ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} transition-all`}
										style={{ borderColor: appTheme === 'dark' ? '#374151' : '#d1d5db' }}
										>
											<Upload size={16}/> <span className="text-xs font-medium">{t('upload')}</span>
										</button>
									</div>
									<button onClick={handleText} className="btn-primary hover:opacity-90" style={{ backgroundColor: CUSTOM_COLORS.blue }}>{t('generateBtn')}</button>
								</div>
							)}
							
							{activeMode === 'image' && (
									<div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
										<h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2" style={{ color: CUSTOM_COLORS.pink }}><ImageIcon size={14}/> {t('visualCreator')}</h3>
										<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fImg.type} onChange={e=>setFImg({...fImg, type: e.target.value})}>
											<option value="" disabled>{t('imgStyle')}</option>
											{t('imageStyles').map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
										</select>
										<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fImg.ratio} onChange={e=>setFImg({...fImg, ratio: e.target.value})}>
											<option value="" disabled>{t('imgRatio')}</option>
											{t('imageRatios').map(r=><option key={r.val} value={r.val}>{r.label}</option>)}
										</select>
										
										{/* ADDED: Language Selector for Image */}
										<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fImg.lang} onChange={e=>setFImg({...fImg, lang: e.target.value})}>
											<option value="" disabled>{t('langRes')}</option>
											{['Español','Catalán','Inglés'].map(l=><option key={l} value={l}>{l}</option>)}
										</select>

										<textarea className={`input-std h-24 ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fImg.prompt} onChange={e=>setFImg({...fImg, prompt: e.target.value})} placeholder={t('describeImg')} />
										<button onClick={handleImage} className="btn-primary hover:opacity-90" style={{ backgroundColor: CUSTOM_COLORS.pink }}>{t('createImg')}</button>
									</div>
							)}
							{activeMode === 'simplify' && (
								<div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
									<h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2" style={{ color: CUSTOM_COLORS.cyan }}><BookOpen size={14}/> {t('easyRead')}</h3>
									<div className="p-2 bg-teal-900/20 border border-teal-800 rounded text-[10px] text-teal-200" style={{ backgroundColor: `${CUSTOM_COLORS.cyan}20`, borderColor: `${CUSTOM_COLORS.cyan}50`, color: `${CUSTOM_COLORS.cyan}` }}>{t('simplifyInfo')}</div>
									<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fSimp.lang} onChange={e=>setFSimp({...fSimp, lang: e.target.value})}>
										<option value="" disabled>{t('langGen')}</option>
										{['Español','Catalán','Inglés'].map(l=><option key={l} value={l}>{l}</option>)}
									</select>
									<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fSimp.level} onChange={e=>setFSimp({...fSimp, level: e.target.value})}>
										<option value="" disabled>{t('simpLevel')}</option>
										{t('simplifyLevels').map(l=><option key={l} value={l}>{l}</option>)}
									</select>
									<label className={`text-xs ${currentTheme.textMuted} mb-1 block`}>{t('textToSimp')}</label>
									<textarea className={`input-std h-32 ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fSimp.text} onChange={e=>setFSimp({...fSimp, text: e.target.value})} placeholder={t('pasteText')} />
									{/* Added Upload Button Here */}
									<div className="flex gap-2 mt-2">
										<button onClick={startDictation} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 border transition-all ${isListening ? 'bg-red-900/20 border-red-500/50 text-red-400' : `${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textSecondary} hover:${currentTheme.textPrimary}`}`}>
											{isListening ? <MicOff size={16}/> : <Mic size={16}/>}
											<span className="text-xs font-medium">{isListening ? t('listening') : t('dictate')}</span>
										</button>
										<button onClick={triggerFileUpload} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${currentTheme.bgInput} border ${currentTheme.borderInput} ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} transition-all`}>
											<Upload size={16}/> <span className="text-xs font-medium">{t('upload')}</span>
										</button>
									</div>
									<button onClick={handleSimplify} className="btn-primary hover:opacity-90" style={{ backgroundColor: CUSTOM_COLORS.cyan }}>{t('simplifyBtn')}</button>
								</div>
							)}
							{activeMode === 'board' && (
								<div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
									<h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2" style={{ color: CUSTOM_COLORS.yellow }}><Grid size={14}/> {t('boardTitle')}</h3>
									<div className="p-2 bg-yellow-900/20 border border-yellow-800 rounded text-[10px] text-yellow-200" style={{ backgroundColor: `${CUSTOM_COLORS.yellow}20`, borderColor: `${CUSTOM_COLORS.yellow}50`, color: `${CUSTOM_COLORS.yellow}` }}>{t('boardInfo')}</div>
									<input className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fBoard.context} onChange={e=>setFBoard({...fBoard, context: e.target.value})} placeholder={t('contextPlace')} />
									<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fBoard.lang} onChange={e=>setFBoard({...fBoard, lang: e.target.value})}>
										<option value="" disabled>{t('langBoard')}</option>
										{['Español','Catalán','Inglés'].map(l=><option key={l} value={l}>{l}</option>)}
									</select>
									<button onClick={handleBoard} className="btn-primary hover:opacity-90" style={{ backgroundColor: CUSTOM_COLORS.yellow }}>{t('genBoardBtn')}</button>
								</div>
							)}
							{activeMode === 'audio' && (
									<div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
										<h3 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2" style={{ color: CUSTOM_COLORS.green }}><Music size={14}/> {t('ttsTitle')}</h3>
										
										{/* UPDATED: Voice Selector uses only AI voices */}
										<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fAud.voice} onChange={e=>setFAud({...fAud, voice: e.target.value})}>
											{t('audioVoices').map(v => (
												<option key={v.id} value={v.id}>{v.label}</option>
											))}
										</select>
										
										<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fAud.lang} onChange={e=>setFAud({...fAud, lang: e.target.value})}>
											<option value="">{t('langTrans')}</option>
											{['Español','Catalán','Inglés'].map(l=><option key={l} value={l}>{l}</option>)}
										</select>
										<textarea className={`input-std h-32 ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fAud.text} onChange={e=>setFAud({...fAud, text: e.target.value})} placeholder="..." />
										<div className="flex gap-2 mt-2">
											<button onClick={startDictation} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 border transition-all ${isListening ? 'bg-red-900/20 border-red-500/50 text-red-400' : `${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textSecondary} hover:${currentTheme.textPrimary}`}`}>
												{isListening ? <MicOff size={16}/> : <Mic size={16}/>}
												<span className="text-xs font-medium">{isListening ? t('listening') : t('dictate')}</span>
											</button>
											<button onClick={triggerFileUpload} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${currentTheme.bgInput} border ${currentTheme.borderInput} ${currentTheme.textSecondary} hover:${currentTheme.textPrimary} transition-all`}>
												<Upload size={16}/> <span className="text-xs font-medium">{t('upload')}</span>
											</button>
										</div>
										<button onClick={handleAudio} className="btn-primary hover:opacity-90" style={{ backgroundColor: CUSTOM_COLORS.green }}>{t('genAudioBtn')}</button>
									</div>
							)}
							{activeMode === 'video' && (
								<div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
									<h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2" style={{ color: CUSTOM_COLORS.red }}><Video size={14}/> {t('videoMaker')}</h3>
									<div className={`flex ${appTheme==='dark'?'bg-black':'bg-gray-200'} p-1 rounded-lg`}>
										<button onClick={() => setVideoSubTab('plan')} className={`flex-1 py-1 text-xs rounded transition-all ${videoSubTab === 'plan' ? `${currentTheme.bgUser} ${currentTheme.textPrimary}` : currentTheme.textMuted}`}>{t('plan')}</button>
										<button onClick={() => setVideoSubTab('create')} className={`flex-1 py-1 text-xs rounded transition-all ${videoSubTab === 'create' ? 'bg-red-900/50 text-red-200' : currentTheme.textMuted}`}>{t('create')}</button>
									</div>
									<select className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fVid.lang} onChange={e=>setFVid({...fVid, lang: e.target.value})}>
										<option value="" disabled>{t('langVideo')}</option>
										{['Español','Catalán','Inglés'].map(l=><option key={l} value={l}>{l}</option>)}
									</select>
									<input className={`input-std ${currentTheme.bgInput} ${currentTheme.borderInput} ${currentTheme.textPrimary}`} value={fVid.topic} onChange={e=>setFVid({...fVid, topic: e.target.value})} placeholder={t('topicVideo')} />
									{videoSubTab === 'plan' ? (
										<button onClick={handleVideoPlan} className="btn-primary hover:opacity-90" style={{ backgroundColor: CUSTOM_COLORS.red }}>{t('genScript')}</button>
									) : (
										<button onClick={handleVideoCreate} className="btn-primary bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500">{t('createVideo')}</button>
									)}
								</div>
							)}
						</div>
						)}
					</div>
					
					{/* FOOTER & SETTINGS MENU */}
					<div className={`p-3 border-t ${currentTheme.border} ${currentTheme.bgSidebar}`}>
						<div className="relative">
							<button	
								onClick={() => setIsSettingsOpen(!isSettingsOpen)}
								className={`w-full flex items-center justify-between p-2 rounded-lg ${currentTheme.hoverBg} ${currentTheme.textSecondary} mb-2 transition-colors`}
							>
								<div className="flex items-center gap-2">
									<Settings size={16} />
									<span className="text-xs font-medium">{t('settings')}</span>
								</div>
								{isSettingsOpen ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
							</button>

							{isSettingsOpen && (
								<div className={`mb-3 p-2 rounded-lg ${currentTheme.bgMain} border ${currentTheme.border} animate-in slide-in-from-bottom-2 fade-in duration-200`}>
									<div className="flex items-center justify-between p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" onClick={() => setAppTheme(prev => prev === 'dark' ? 'light' : 'dark')}>
										<div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
											{appTheme === 'dark' ? <Moon size={14}/> : <Sun size={14}/>}
											<span>{t('appearance')}</span>
										</div>
										<div className="grid grid-cols-3 gap-2">
											{['es', 'ca', 'en'].map((lang) => (
												<button	
													key={lang}
													onClick={() => setAppLang(lang)}
													className={`
														text-[10px] font-bold py-1 px-2 rounded transition-colors uppercase
														${appLang === lang	
															? 'bg-blue-500 text-white shadow-sm'	
															: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
													`}
												>
													{lang === 'es' ? 'ESP' : lang === 'ca' ? 'CAT' : 'ENG'}
												</button>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
						<div className={`text-center text-[10px] ${currentTheme.textMuted}`}>{t('footer')}</div>
					</div>
				</div>
			</aside>

			{/* MAIN AREA */}
			<main className="flex-1 flex flex-col h-full relative transition-colors duration-300">
				<header className={`flex items-center justify-between px-4 py-3 ${currentTheme.bgMain} z-10 border-b ${currentTheme.border}`}>
					<div className="flex items-center gap-3">
						<button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 ${currentTheme.hoverBg} rounded-full ${currentTheme.textSecondary}`}><Menu size={20}/></button>
						<div className="flex flex-col">
							<span className={`${currentTheme.textPrimary} font-semibold tracking-tight`}>SEND Assistant</span>
							<span className={`text-[10px] ${currentTheme.textMuted}`}>Suite Educativa Inclusiva</span>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<button onClick={() => setShowHelp(true)} className={`p-2 rounded-full ${currentTheme.hoverBg} ${currentTheme.textSecondary} transition-colors`} title={t('helpTitle')}>
							<CircleHelp size={20} />
						</button>
						<div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-purple-900/20">AI</div>
					</div>
				</header>

				<div className={`flex-1 overflow-y-auto px-4 ${currentTheme.bgMain} scroll-smooth`}>
					{activeMode === 'repo' ? (
						<RepositoryView	
							themeStyle={currentTheme}	
							t={t}	
							onPreviewItem={setPreviewItem}
							onPlayAudio={playTTS}
							currentAudioText={currentAudioText}	
							onImageClick={setFullScreenImage}
						/>
					) : (
					<div className="max-w-3xl mx-auto h-full flex flex-col">
						{messages.length === 0 ? (
							<div className="flex-1 flex flex-col justify-center items-center pb-10 opacity-60">
								<div className="grid grid-cols-2 gap-4 mb-8">
									<div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500"><BookOpen size={24}/></div>
									<div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500"><Grid size={24}/></div>
								</div>
								<h2 className={`text-xl font-medium ${currentTheme.textPrimary} mb-2`}>{t('welcome')}</h2>
								<p className={`text-sm ${currentTheme.textMuted} max-w-xs text-center`}>{t('welcomeSub')}</p>
							</div>
						) : (
							<div className="py-6 space-y-2">
								{messages.map((m) => (
									<MessageBubble	
										key={m.id}
										id={m.id}	
										{...m}	
										onPlayAudio={playTTS}	
										isPlayingAudio={currentAudioText === m.content}	
										onDownloadMp3={dlMp3}	
										isDownloadingMp3={downloadingMp3Text === m.content}	
										themeStyle={currentTheme}	
										t={t}
										savedDocId={m.savedDocId}
										onSaveResource={handleSaveResource}
										onDeleteResource={handleDeleteResource}
										metaData={m.metadata}	
										onImageClick={setFullScreenImage}
										isRegenerating={isRegeneratingAudio && previewItem?.id === m.id}
										onExpand={() => setPreviewItem(m)}
									/>
								))}
								{isTyping && (
									<div className="flex w-full justify-start animate-pulse pl-1">
										<div className={`flex items-center gap-3 ${currentTheme.bgCard} px-4 py-3 rounded-2xl rounded-tl-none border ${currentTheme.border}`}>
											<Sparkles size={16} className="text-blue-400 animate-spin-slow"/>
											<span className={`text-xs ${currentTheme.textSecondary} font-medium`}>Generando...</span>
										</div>
									</div>
								)}
								<div ref={bottomRef} />
							</div>
						)}
					</div>
					)}
				</div>

				{/* PREVIEW MODAL */}
				{previewItem && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
						<div className={`w-full max-w-3xl ${currentTheme.bgMain} rounded-2xl shadow-2xl border ${currentTheme.border} overflow-hidden flex flex-col max-h-[90vh]`}>
							<div className={`flex items-center justify-between p-4 border-b ${currentTheme.border}`}>
								<h3 className={`font-bold ${currentTheme.textPrimary} flex items-center gap-2`}>
									<Eye size={18} className="text-blue-500"/> {t('preview')}
								</h3>
								<button onClick={() => setPreviewItem(null)} className={`p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors ${currentTheme.textSecondary}`}>
									<X size={20}/>
								</button>
							</div>
							<div className={`flex-1 overflow-y-auto p-6 ${currentTheme.bgMain}`}>
								<MessageBubble	
									id={previewItem.id}	
									role="ai"	
									content={previewItem.content}	
									type={previewItem.type}	
									mediaUrl={previewItem.mediaUrl}
									extraData={previewItem.extraData}
									onPlayAudio={playTTS}	
									isPlayingAudio={currentAudioText === previewItem.content}	
									onDownloadMp3={dlMp3}	
									isDownloadingMp3={downloadingMp3Text === previewItem.content}	
									themeStyle={currentTheme}	
									t={t}
									savedDocId={previewItem.id}	
									onDeleteResource={handleDeleteResource}	
									onSaveResource={null}	
									onImageClick={setFullScreenImage}
									isRegenerating={isRegeneratingAudio}
								/>
							</div>
						</div>
					</div>
				)}

				{/* FULL SCREEN IMAGE MODAL */}
				{fullScreenImage && (
					<div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setFullScreenImage(null)}>
						<button className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2">
							<X size={32} />
						</button>
						<img	
							src={fullScreenImage}	
							alt="Full Screen"	
							className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-default"	
							onClick={(e) => e.stopPropagation()}	
						/>
					</div>
				)}

				{/* HELP MODAL */}
				{showHelp && (
					<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
						<div className={`w-full max-w-4xl bg-black rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col max-h-[90vh]`}>
							<div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#1E1F20]">
								<h3 className="font-bold text-white flex items-center gap-2">
									<CircleHelp size={18} className="text-blue-500"/> {t('helpTitle')}
								</h3>
								<button onClick={() => setShowHelp(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
									<X size={20}/>
								</button>
							</div>
							<div className="flex-1 bg-black p-0 flex flex-col items-center justify-center relative group">
								{/* Video actualizado a H-FcjpwFmZQ */}
								<div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black">
									<iframe	
										width="100%"	
										height="100%"	
										src={`https://www.youtube.com/embed/${TUTORIAL_VIDEOS[appLang] || TUTORIAL_VIDEOS.es}?autoplay=1&mute=1`}
										title="YouTube video player"	
										frameBorder="0"	
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"	
										allowFullScreen
										className="w-full h-full aspect-video"
									></iframe>
								</div>
							</div>
							{/* Fallback Link in Footer */}
							<div className="p-4 bg-[#1E1F20] flex flex-col items-center gap-3 border-t border-gray-800">
								<p className="text-center text-sm text-gray-400">{t('helpDesc')}</p>
								<a	
									href={`https://youtu.be/${TUTORIAL_VIDEOS[appLang] || TUTORIAL_VIDEOS.es}`}
									target="_blank"	
									rel="noopener noreferrer"
									className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
								>
									¿Problemas con el video? Ver en YouTube <ExternalLink size={12}/>
								</a>
							</div>
						</div>
					</div>
				)}

			</main>

			<style>{`
				.input-std { width: 100%; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; transition: border-color 0.2s; border-width: 1px; }
				.input-std:focus { outline: none; border-color: #60a5fa; }
				.btn-primary { width: 100%; color: white; padding: 0.6rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background-color 0.2s; margin-top: 0.5rem; }
				::-webkit-scrollbar { width: 6px; }
				::-webkit-scrollbar-track { background: transparent; }
				::-webkit-scrollbar-thumb { background: ${appTheme==='dark'?'#374151':'#d1d5db'}; border-radius: 3px; }
				::-webkit-scrollbar-thumb:hover { background: ${appTheme==='dark'?'#4b5563':'#9ca3af'}; }
				.animate-spin-slow { animation: spin 3s linear infinite; }
				@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
				.cursor-zoom-in { cursor: zoom-in; }
				
				/* TABLE STYLES FIXED */
				.message-content table {	
					width: 100%;	
					border-collapse: collapse;	
					margin: 1em 0;	
					font-size: 0.9em;	
					background-color: ${appTheme === 'dark' ? '#000000' : '#f8f8f8'};
					color: ${appTheme === 'dark' ? '#ffffff' : '#111827'};
					border: 1px solid ${appTheme === 'dark' ? '#4b5563' : '#d1d5db'};
				}
				.message-content th, .message-content td {	
					padding: 0.8em;	
					border: 1px solid ${appTheme === 'dark' ? '#4b5563' : '#d1d5db'};
				}
				.message-content th {	
					background-color: ${appTheme === 'dark' ? '#111827' : '#e0e0e0'};
					color: #096EBE; /* Blue Title */
					font-weight: bold;
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}
			`}</style>
		</div>
	);
}

