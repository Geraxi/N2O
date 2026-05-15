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

export interface ImportResult {
  inserted: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

export async function importClients(rows: unknown[]): Promise<ImportResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autenticato');

  const result: ImportResult = { inserted: 0, skipped: 0, errors: [] };
  // Process in batches of 25 to bound geocoding cost and DB round-trips.
  for (let i = 0; i < rows.length; i += 25) {
    const batch = rows.slice(i, i + 25);
    const prepared = await Promise.all(batch.map(async (raw, j) => {
      const parsed = RowSchema.safeParse(raw);
      if (!parsed.success) {
        result.errors.push({ row: i + j + 1, reason: parsed.error.issues[0]?.message ?? 'invalido' });
        return null;
      }
      const r = parsed.data;
      let lat: number | null = null, lng: number | null = null;
      const addr = [r.indirizzo, r.cap, r.citta, r.provincia].filter(Boolean).join(', ');
      if (addr) {
        try {
          const geo = await geocode(addr);
          if (geo) { lat = geo.lat; lng = geo.lng; }
        } catch { /* geocoding failure is non-fatal — admin can fix from the cliente page */ }
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
        preferenza_contatto: r.preferenza_contatto || 'email',
        metadata: r.metadata || {},
        created_by: user.id,
        updated_by: user.id,
      };
    }));
    const toInsert = prepared.filter(Boolean) as any[];
    if (toInsert.length) {
      const { error, count } = await supabase.from('clients').insert(toInsert, { count: 'exact' });
      if (error) result.errors.push({ row: i, reason: error.message });
      else result.inserted += count ?? toInsert.length;
    }
    result.skipped += batch.length - toInsert.length;
  }
  revalidatePath('/clienti');
  return result;
}
