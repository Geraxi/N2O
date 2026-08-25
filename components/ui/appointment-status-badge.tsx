import { Clock, CheckCircle2, PlayCircle, XCircle, CalendarX } from 'lucide-react';
import type { AppointmentStatus } from '@/lib/supabase/types';

// Status uses color + icon + text (colorblindness) — never the raw enum value.
const STATUS_META: Record<AppointmentStatus, { label: string; className: string; icon: typeof Clock }> = {
  proposto: { label: 'Proposto', className: 'badge-muted', icon: Clock },
  confermato: { label: 'Confermato', className: 'badge-info', icon: CheckCircle2 },
  in_corso: { label: 'In corso', className: 'badge-warn', icon: PlayCircle },
  completato: { label: 'Completato', className: 'badge-ok', icon: CheckCircle2 },
  annullato: { label: 'Annullato', className: 'badge-muted', icon: XCircle },
  no_show: { label: 'Non presentato', className: 'badge-danger', icon: CalendarX },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={meta.className}>
      <meta.icon className="w-4 h-4" aria-hidden /> {meta.label}
    </span>
  );
}
