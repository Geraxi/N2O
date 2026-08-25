'use client';
import { useState, useTransition } from 'react';
import * as XLSX from 'xlsx';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import { importClients, dryRunImport, type ImportResult, type DryRunResult } from './actions';

// Excel importer with column mapping + real dry-run validation.
// Phase 1 deliverable — geocoding on import via Google Maps happens
// server-side after the user confirms the mapping and dry-run.

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

const MAX_FILE_BYTES = 10 * 1024 * 1024; // matches next.config.js serverActions.bodySizeLimit

type Step = 'upload' | 'map' | 'verify' | 'done';

export default function ImportaPage() {
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({}); // target -> source column
  const [fileError, setFileError] = useState<string | null>(null);
  const [dryRun, setDryRun] = useState<DryRunResult | null>(null);
  const [importing, startImport] = useTransition();
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  function buildPayload() {
    return rows.map((r) => {
      const out: Record<string, unknown> = {};
      const used = new Set<string>();
      for (const t of TARGET_FIELDS) {
        const src = mapping[t.key];
        if (src) { out[t.key] = r[src]; used.add(src); }
      }
      // Unmapped columns → metadata JSONB
      const metadata: Record<string, unknown> = {};
      for (const h of headers) if (!used.has(h) && r[h] !== '' && r[h] != null) metadata[h] = r[h];
      if (Object.keys(metadata).length) out.metadata = metadata;
      return out;
    });
  }

  function onVerify() {
    startImport(async () => {
      const result = await dryRunImport(buildPayload());
      setDryRun(result);
      setStep('verify');
    });
  }

  function onConfirm() {
    startImport(async () => {
      const result = await importClients(buildPayload());
      setImportResult(result);
      setStep('done');
    });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setFileError(null);
    if (file.size > MAX_FILE_BYTES) {
      setFileError('Il file supera 10 MB. Dividi i dati in più file più piccoli.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
      if (json.length === 0) {
        setFileError('Il file non contiene righe. Controlla che il foglio corretto sia il primo e che abbia un\'intestazione.');
        e.target.value = '';
        return;
      }
      setRows(json);
      setHeaders(Object.keys(json[0]));
      // Suggest mapping by name match
      const auto: Record<string, string> = {};
      for (const t of TARGET_FIELDS) {
        const guess = Object.keys(json[0]).find((h) =>
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
        {(['upload', 'map', 'verify', 'done'] as Step[]).map((s, i) => (
          <li key={s} className={`px-3 py-1.5 rounded-md ${step === s ? 'bg-brand text-white' : 'bg-line text-muted'}`}>
            {i + 1}. {s === 'upload' ? 'Carica file' : s === 'map' ? 'Mappa colonne' : s === 'verify' ? 'Verifica' : 'Completato'}
          </li>
        ))}
      </ol>

      {step === 'upload' && (
        <div className="card">
          <label className="label" htmlFor="file" data-required="true">File Excel</label>
          <p className="text-sm text-muted mb-3">campo obbligatorio · massimo 10 MB</p>
          <input id="file" type="file" accept=".xlsx,.xls,.csv" onChange={onFile}
            className="input file:mr-4 file:rounded-md file:border-0 file:bg-brand file:text-white file:font-semibold file:px-4 file:py-2" />
          {fileError && (
            <p className="text-danger text-sm mt-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden /> {fileError}
            </p>
          )}
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
            <button className="btn-primary" onClick={onVerify}
              disabled={!mapping['ragione_sociale'] || importing}>
              <Eye className="w-5 h-5" aria-hidden /> {importing ? 'Sto verificando…' : 'Verifica dati'}
            </button>
          </div>
          {!mapping['ragione_sociale'] && (
            <p className="text-danger text-sm mt-3">Devi mappare almeno il campo Ragione sociale per continuare.</p>
          )}
        </div>
      )}

      {step === 'verify' && dryRun && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Verifica prima dell&apos;importazione</h2>
          <p className="text-muted mb-4">
            Nessun dato è stato salvato: questa è una verifica. <strong>{dryRun.validCount}</strong> righe valide su <strong>{dryRun.totalRows}</strong>.
          </p>

          {dryRun.errors.length > 0 && (
            <div className="border border-danger/30 bg-danger/5 rounded-md p-4 mb-4">
              <p className="font-semibold text-danger flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" aria-hidden /> {dryRun.errors.length} righe con errori — non verranno importate
              </p>
              <ul className="text-sm text-muted space-y-1 max-h-48 overflow-y-auto">
                {dryRun.errors.slice(0, 50).map((e, i) => (
                  <li key={i}>Riga {e.row}: {e.reason}</li>
                ))}
              </ul>
            </div>
          )}

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
            Anteprima delle prime 5 righe. Le colonne non mappate verranno salvate nel campo <code>metadata</code> di ciascun cliente.
            Gli indirizzi verranno geolocalizzati al momento dell&apos;importazione.
          </p>
          <div className="flex gap-3 mt-6">
            <button className="btn-secondary" onClick={() => setStep('map')}>← Indietro</button>
            <button className="btn-primary" onClick={onConfirm} disabled={importing || dryRun.validCount === 0}>
              <CheckCircle2 className="w-5 h-5" aria-hidden />
              {importing ? `Sto importando ${dryRun.validCount} clienti…` : `Conferma e importa ${dryRun.validCount} clienti`}
            </button>
          </div>
          {dryRun.validCount === 0 && (
            <p className="text-danger text-sm mt-3">Nessuna riga valida da importare. Correggi il file e ricarica.</p>
          )}
        </div>
      )}

      {step === 'done' && importResult && (
        <div className="card border-ok bg-ok/5">
          <h2 className="text-xl font-bold text-ok mb-2">✓ Importazione completata</h2>
          <ul className="space-y-1">
            <li><strong>{importResult.inserted}</strong> clienti inseriti</li>
            <li><strong>{importResult.skipped}</strong> righe scartate</li>
            {importResult.errors.length > 0 && (
              <li className="text-danger">
                <strong>{importResult.errors.length}</strong> errori
              </li>
            )}
            {importResult.geocodeMisses.length > 0 && (
              <li className="text-warn">
                <strong>{importResult.geocodeMisses.length}</strong> clienti importati senza geolocalizzazione riuscita — l&apos;indirizzo va verificato manualmente
              </li>
            )}
          </ul>
          {importResult.errors.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer font-semibold">Dettaglio errori</summary>
              <ul className="mt-2 text-sm text-muted space-y-1">
                {importResult.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>Riga {e.row}: {e.reason}</li>
                ))}
              </ul>
            </details>
          )}
          {importResult.geocodeMisses.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer font-semibold">Clienti senza geolocalizzazione</summary>
              <ul className="mt-2 text-sm text-muted space-y-1">
                {importResult.geocodeMisses.slice(0, 20).map((g, i) => (
                  <li key={i}>Riga {g.row}: {g.ragioneSociale}</li>
                ))}
              </ul>
            </details>
          )}
          <div className="mt-4 flex gap-3">
            <a href="/clienti" className="btn-primary">Vai all&apos;elenco clienti</a>
            <button className="btn-secondary" onClick={() => { setStep('upload'); setImportResult(null); setDryRun(null); setRows([]); setFileError(null); }}>
              Importa un altro file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
