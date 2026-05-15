import { anthropic, MODEL } from './anthropic';

export type EmailCategory =
  | 'offerta' | 'sollecito' | 'reclamo' | 'prenotazione'
  | 'fornitore' | 'spam' | 'altro';

export interface ClassificationResult {
  category: EmailCategory;
  confidence: number; // 0..1
  summary: string;    // 1-2 lines, Italian
}

const SYSTEM = `Sei un assistente che classifica email in arrivo per N2O Srl, un'azienda di sicurezza sul lavoro a Gorgonzola (MI).
Rispondi SOLO con JSON valido nel formato:
{"category": "...", "confidence": 0.0-1.0, "summary": "..."}

Categorie ammesse:
- offerta: richiesta di preventivo o offerta commerciale
- sollecito: cliente che chiede aggiornamento su pratica in corso
- reclamo: lamentela o segnalazione disservizio
- prenotazione: richiesta o conferma di appuntamento/intervento
- fornitore: comunicazione da fornitore (DDT, fatture, listini)
- spam: marketing non richiesto, phishing
- altro: tutto il resto

Il summary deve essere in italiano, 1-2 righe.`;

export async function classifyEmail(subject: string, body: string): Promise<ClassificationResult> {
  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 300,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Oggetto: ${subject}\n\nCorpo:\n${body.slice(0, 4000)}` }],
  });
  const text = res.content.map((c) => (c.type === 'text' ? c.text : '')).join('');
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return JSON.parse(json) as ClassificationResult;
}
