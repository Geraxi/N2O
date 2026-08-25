'use server';
import { createClient } from '@/lib/supabase/server';
import { geocode } from '@/lib/maps/google';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const RowSchema = z.object({
  ragione_sociale: z.string().min(1),
  partita_iva: z.string().optional().nullable(),
  codice_fiscale: z.string().optional().nullable(),
  referente: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  telefono: z.string().optional().nullable(),
  indirizzo: z.string().optional().nullable(),
  citta: z.string().optional().nullable(),
  provincia: z.string().optional().nullable(),
  cap: z.string().optional().nullable(),
  preferenza_contatto: z.enum(['email', 'sms', 'telefono']).optional().nullable(),
  metadata: z.record(z.any()).optional(),
});

export interface RowError {
  row: number;
  reason: string;
}

export interface DryRunResult {
  totalRows: number;
  validCount: number;
  errors: RowError[];
}

// Real dry-run: validates every row against the same schema the real import
// uses. No insert, no geocoding (geocoding costs a real API call per
// address; running it twice per row — once in preview, once for real —
// isn't worth it against the €300/mese budget). This is what "Anteprima"
// used to skip entirely.
export async function dryRunImport(rows: unknown[]): Promise<DryRunResult> {
  if (rows.length === 0) {
    return { totalRows: 0, validCount: 0, errors: [{ row: 0, reason: 'Il file non contiene righe da importare.' }] };
  }

  const errors: RowError[] = [];
  let validCount = 0;
  rows.forEach((raw, i) => {
    const parsed = RowSchema.safeParse(raw);
    if (!parsed.success) errors.push({ row: i + 1, reason: parsed.error.issues[0]?.message ?? 'Riga non valida' });
    else validCount += 1;
  });

  return { totalRows: rows.length, validCount, errors };
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  errors: RowError[];
  geocodeMisses: { row: number; ragioneSociale: string }[];
}

export async function importClients(rows: unknown[]): Promise<ImportResult> {
  if (rows.length === 0) {
    return { inserted: 0, skipped: 0, errors: [{ row: 0, reason: 'Il file non contiene righe da importare.' }], geocodeMisses: [] };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autenticato');

  const result: ImportResult = { inserted: 0, skipped: 0, errors: [], geocodeMisses: [] };
  const BATCH_SIZE = 25;
  // Process in batches of 25 to bound geocoding cost and DB round-trips.
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const prepared = await Promise.all(batch.map(async (raw, j) => {
      const rowNumber = i + j + 1;
      const parsed = RowSchema.safeParse(raw);
      if (!parsed.success) {
        result.errors.push({ row: rowNumber, reason: parsed.error.issues[0]?.message ?? 'invalido' });
        return null;
      }
      const r = parsed.data;
      let lat: number | null = null, lng: number | null = null;
      const addr = [r.indirizzo, r.cap, r.citta, r.provincia].filter(Boolean).join(', ');
      if (addr) {
        try {
          const geo = await geocode(addr);
          if (geo) { lat = geo.lat; lng = geo.lng; }
          else result.geocodeMisses.push({ row: rowNumber, ragioneSociale: r.ragione_sociale });
        } catch {
          // Geocoding API failure is non-fatal for the import (the client is
          // still created), but must be surfaced — not silently swallowed.
          result.geocodeMisses.push({ row: rowNumber, ragioneSociale: r.ragione_sociale });
        }
      }
      return {
        ragione_sociale: r.ragione_sociale,
        partita_iva: r.partita_iva || null,
        codice_fiscale: r.codice_fiscale || null,
        referente: r.referente || null,
        email: r.email || null,
        telefono: r.telefono || null,
        indirizzo: r.indirizzo || null,
        citta: r.citta || null,
        provincia: r.provincia || null,
        cap: r.cap || null,
        lat, lng,
        preferenza_contatto: r.preferenza_contatto || 'email' as const,
        metadata: r.metadata || {},
        created_by: user.id,
        updated_by: user.id,
      };
    }));
    const toInsert = prepared.filter((row): row is NonNullable<typeof row> => row !== null);
    if (toInsert.length) {
      const { error, count } = await supabase.from('clients').insert(toInsert, { count: 'exact' });
      if (error) {
        // A batch insert failure doesn't tell us which row in the batch
        // caused it — report the batch's row range honestly instead of
        // pretending we know the exact failing row.
        const rangeLabel = toInsert.length === 1 ? `Riga ${i + 1}` : `Righe ${i + 1}-${i + batch.length}`;
        result.errors.push({ row: i + 1, reason: `${rangeLabel}: ${error.message}` });
      } else {
        result.inserted += count ?? toInsert.length;
      }
    }
    result.skipped += batch.length - toInsert.length;
  }
  revalidatePath('/clienti');
  return result;
}
