// Generated types placeholder. Run:
//   supabase gen types typescript --project-id <id> --schema public > lib/supabase/types.ts
// after the migration is applied to the Frankfurt project.
//
// Until then we use a permissive shape so Supabase's generic Tables/Views indexing
// doesn't collapse to `never`. Replace this whole file with the generated output
// at the start of Phase 1 wiring.

type AnyRow = Record<string, any>;
type AnyTable = { Row: AnyRow; Insert: AnyRow; Update: AnyRow; Relationships: [] };
type AnyView = { Row: AnyRow; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: AnyTable;
      clients: AnyTable;
      product_types: AnyTable;
      product_instances: AnyTable;
      appointments: AnyTable;
      reports: AnyTable;
      opportunities: AnyTable;
      messages: AnyTable;
      tasks: AnyTable;
      audit_log: AnyTable;
      settings: AnyTable;
    };
    Views: {
      v_scadenze_imminenti: AnyView;
      v_appuntamenti_oggi: AnyView;
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: 'admin' | 'front_office' | 'tecnico' | 'commerciale';
      contact_pref: 'email' | 'sms' | 'telefono';
      appointment_status: 'proposto' | 'confermato' | 'in_corso' | 'completato' | 'annullato' | 'no_show';
      message_direction: 'inbound' | 'outbound';
    };
    CompositeTypes: Record<string, never>;
  };
}

export type UserRole = Database['public']['Enums']['user_role'];
export type ContactPref = Database['public']['Enums']['contact_pref'];
export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
