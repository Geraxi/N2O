import { Breadcrumbs } from './breadcrumbs';
import { Construction } from 'lucide-react';

export function PageStub({ title, phase, what }: { title: string; phase: string; what: string }) {
  return (
    <div>
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <div className="card mt-6 flex items-start gap-4">
        <Construction className="w-7 h-7 text-warn shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">Sezione in costruzione · {phase}</p>
          <p className="text-muted mt-1">{what}</p>
        </div>
      </div>
    </div>
  );
}
