'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Upload, Eye, CheckCircle2 } from 'lucide-react';

// Excel importer with column mapping + dry-run preview.
// Phase 1 deliverable — geocoding on import via Google Maps happens server-side
// after the user confirms the mapping.

const TARGET_FIELDS = [
  { key: 'ragione_sociale',  label: 'Ragione sociale',     required: true  },
  { key: 'partita_iva',      label: 'Partita IVA',          required: false },
  { key: 'codice_fiscale',   label: 'Codice fiscale',       required: false },
  { key: 'referente',        label: 'Referente',            required: false },
  { key: 'email',            label: 'Email',                required: false },
  { key: 'telefono',         label: 'Telefono',             required: false },
  { key: 'indirizzo',        label: 'Indirizzo',            required: false },
  { key: 'citta',            label: 'Città',                required: false },
  { key: 'provincia',        label: 'Provincia',            required: false },
  { key: 'cap',              label: 'CAP',                  required: false },
  { key: 'preferenza_contatto', label: 'Preferenza contatto (email/sms/telefono)', required: false },
] as const;

type Step = 'upload' | 'map' | 'preview' | 'done';

export default function ImportaPage() {
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({}); // target -> source column

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
      setRows(json);
      setHeaders(Object.keys(json[0] || {}));
      // Suggest mapping by name match
      const auto: Record<string, string> = {};
      for (const t of TARGET_FIELDS) {
        const guess = Object.keys(json[0] || {}).find((h) =>
          h.toLowerCase().replace(/[\s_]/g, '').includes(t.key.replace(/_/g, '').slice(0, 6)),
        );
        if (guess) auto[t.key] = guess;
      }
      setMapping(auto);
      setStep('map');
    };
    reader.readAsArrayBuffer(file);
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Clienti', href: '/clienti' }, { label: 'Importa da Excel' }]} />
      <h1 className="text-3xl font-bold mb-2">Importa clienti da Excel</h1>
      <p className="text-muted mb-6">
        Carica un file <code>.xlsx</code> o <code>.csv</code>. La colonna <strong>Ragione sociale</strong> è obbligatoria;
        gli indirizzi vengono geolocalizzati automaticamente al termine.
      </p>

      {/* Step indicator */}
      <ol className="flex gap-2 text-sm mb-6">
        {(['upload', 'map', 'preview', 'done'] as Step[]).map((s, i) => (
          <li key={s} className={`px-3 py-1.5 rounded-md ${step === s ? 'bg-brand text-white' : 'bg-line text-muted'}`}>
            {i + 1}. {s === 'upload' ? 'Carica file' : s === 'map' ? 'Mappa colonne' : s === 'preview' ? 'Anteprima' : 'Completato'}
          </li>
        ))}
      </ol>

      {step === 'upload' && (
        <div className="card">
          <label className="label" htmlFor="file" data-required="true">File Excel</label>
          <p className="text-sm text-muted mb-3">campo obbligatorio</p>
          <input id="file" type="file" accept=".xlsx,.xls,.csv" onChange={onFile}
            className="input file:mr-4 file:rounded-md file:border-0 file:bg-brand file:text-white file:font-semibold file:px-4 file:py-2" />
        </div>
      )}

      {step === 'map' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Associa le colonne</h2>
          <p className="text-muted mb-4">Trovate <strong>{rows.length}</strong> righe nel file. Associa ogni campo del database alla colonna corrispondente.</p>
          <div className="space-y-3">
            {TARGET_FIELDS.map((t) => (
              <div key={t.key} className="grid sm:grid-cols-2 gap-3 items-center">
                <label className="label !mb-0" htmlFor={`map-${t.key}`} data-required={t.required}>
                  {t.label}
                </label>
                <select
                  id={`map-${t.key}`}
                  className="input"
                  value={mapping[t.key] || ''}
                  onChange={(e) => setMapping({ ...mapping, [t.key]: e.target.value })}
                >
                  <option value="">— non mappato —</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button className="btn-secondary" onClick={() => setStep('upload')}>← Indietro</button>
            <button className="btn-primary" onClick={() => setStep('preview')}
              disabled={!mapping['ragione_sociale']}>
              <Eye className="w-5 h-5" aria-hidden /> Anteprima
            </button>
          </div>
          {!mapping['ragione_sociale'] && (
            <p className="text-danger text-sm mt-3">Devi mappare almeno il campo Ragione sociale per continuare.</p>
          )}
        </div>
      )}

      {step === 'preview' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Anteprima (prime 5 righe)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-line">
              <thead className="bg-bg">
                <tr>{TARGET_FIELDS.map((t) => <th key={t.key} className="px-3 py-2 text-left">{t.label}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    {TARGET_FIELDS.map((t) => (
                      <td key={t.key} className="px-3 py-2">{mapping[t.key] ? r[mapping[t.key]] : <span className="text-muted">—</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted mt-4">
            Le colonne non mappate verranno salvate nel campo <code>metadata</code> di ciascun cliente.
            Gli indirizzi verranno geolocalizzati al momento dell&apos;importazione.
          </p>
          <div className="flex gap-3 mt-6">
            <button className="btn-secondary" onClick={() => setStep('map')}>← Indietro</button>
            {/* TODO(phase1): POST to /api/clienti/import → server-side geocode + insert */}
            <button className="btn-primary" onClick={() => setStep('done')}>
              <CheckCircle2 className="w-5 h-5" aria-hidden /> Conferma e importa {rows.length} clienti
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="card border-ok bg-ok/5">
          <h2 className="text-xl font-bold text-ok mb-2">✓ Importazione completata</h2>
          <p>Importati {rows.length} clienti. La geolocalizzazione è in corso in background.</p>
        </div>
      )}
    </div>
  );
}
