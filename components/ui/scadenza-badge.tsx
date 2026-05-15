import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/format';

// Status uses color + icon + text. Never color alone (colorblindness, varying screens).
export function ScadenzaBadge({ data }: { data: string | Date }) {
  const date = typeof data === 'string' ? new Date(data) : data;
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.floor((date.getTime() - today.getTime()) / 86_400_000);

  if (diff < 0)       return <span className="badge-danger"><XCircle className="w-4 h-4" aria-hidden /> Scaduto il {formatDate(date)}</span>;
  if (diff <= 7)      return <span className="badge-danger"><AlertTriangle className="w-4 h-4" aria-hidden /> Urgente · {formatDate(date)} ({diff}gg)</span>;
  if (diff <= 30)     return <span className="badge-warn"><Clock className="w-4 h-4" aria-hidden /> In avvicinamento · {formatDate(date)} ({diff}gg)</span>;
  return <span className="badge-ok"><CheckCircle2 className="w-4 h-4" aria-hidden /> {formatDate(date)} ({diff}gg)</span>;
}
