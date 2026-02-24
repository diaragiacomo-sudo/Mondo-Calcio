import { GoogleGenAI } from "@google/genai";

export interface FootballNews {
  title: string;
  category: string;
  summary: string;
  url: string;
  image: string;
  time: string;
}

export async function fetchRealFootballNews(category?: string): Promise<FootballNews[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = category && category !== 'Tutte' 
    ? `Trova le ultime 8 notizie reali sul calcio riguardanti specificamente la sezione "${category}" di oggi. Restituisci un array JSON di oggetti con: title, category, summary, url, image (URL di un'immagine reale pertinente), time.`
    : "Trova le ultime 15 notizie reali sul calcio mondiale di oggi (Serie A, Champions, etc). Restituisci un array JSON di oggetti con: title, category, summary, url, image (URL di un'immagine reale pertinente), time.";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchLiveScores(): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Risultati calcio reali di oggi. Restituisci un array JSON di oggetti con: home, away, score, league, status.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchStandings(league: string): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Fornisci la classifica attuale reale per la competizione "${league}". Restituisci un array JSON di oggetti con: position, team, played, points.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error(e);
    return [];
  }
}
