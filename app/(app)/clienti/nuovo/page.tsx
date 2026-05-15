import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { geocode } from '@/lib/maps/google';

async function createCliente(formData: FormData) {
  'use server';
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autenticato');

  const get = (k: string) => (formData.get(k) as string)?.trim() || null;
  const indirizzo = get('indirizzo');
  const citta = get('citta');
  const cap = get('cap');
  const provincia = get('provincia');

  let lat: number | null = null, lng: number | null = null;
  const addr = [indirizzo, cap, citta, provincia].filter(Boolean).join(', ');
  if (addr) {
    try { const g = await geocode(addr); if (g) { lat = g.lat; lng = g.lng; } } catch {}
  }

  const { data, error } = await supabase.from('clients').insert({
    ragione_sociale: get('ragione_sociale')!,
    partita_iva: get('partita_iva'),
    codice_fiscale: get('codice_fiscale'),
    referente: get('referente'),
    email: get('email'),
    telefono: get('telefono'),
    pec: get('pec'),
    indirizzo, citta, provincia, cap, lat, lng,
    preferenza_contatto: (get('preferenza_contatto') || 'email') as 'email' | 'sms' | 'telefono',
    note: get('note'),
    created_by: user.id,
    updated_by: user.id,
  }).select('id').single();

  if (error) throw new Error(error.message);
  redirect(`/clienti/${data!.id}`);
}

export default function NuovoClientePage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Clienti', href: '/clienti' }, { label: 'Nuovo' }]} />
      <h1 className="text-3xl font-bold mb-6">Nuovo cliente</h1>

      <form action={createCliente} className="card max-w-3xl space-y-5">
        <div>
          <label className="label" htmlFor="ragione_sociale" data-required="true">Ragione sociale</label>
          <p className="text-sm text-muted mb-1.5">campo obbligatorio</p>
          <input id="ragione_sociale" name="ragione_sociale" required className="input" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="partita_iva">Partita IVA</label>
            <input id="partita_iva" name="partita_iva" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="codice_fiscale">Codice fiscale</label>
            <input id="codice_fiscale" name="codice_fiscale" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="referente">Referente</label>
            <input id="referente" name="referente" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="preferenza_contatto">Preferenza contatto</label>
            <select id="preferenza_contatto" name="preferenza_contatto" defaultValue="email" className="input">
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="telefono">Telefono</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" placeholder="info@…" />
          </div>
          <div>
            <label className="label" htmlFor="telefono">Telefono</label>
            <input id="telefono" name="telefono" className="input" placeholder="+39 02 1234567" defaultValue="+39 " />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="pec">PEC</label>
            <input id="pec" name="pec" type="email" className="input" />
          </div>
        </div>

        <fieldset className="border-t border-line pt-4">
          <legend className="text-lg font-bold">Sede</legend>
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="indirizzo">Indirizzo</label>
              <input id="indirizzo" name="indirizzo" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="citta">Città</label>
              <input id="citta" name="citta" className="input" />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div>
                <label className="label" htmlFor="cap">CAP</label>
                <input id="cap" name="cap" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="provincia">Prov.</label>
                <input id="provincia" name="provincia" maxLength={2} className="input w-24 uppercase" />
              </div>
            </div>
          </div>
        </fieldset>

        <div>
          <label className="label" htmlFor="note">Note</label>
          <textarea id="note" name="note" rows={3} className="input resize-y" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">Salva cliente</button>
          <a href="/clienti" className="btn-secondary">Annulla</a>
        </div>
      </form>
    </div>
  );
}
