// Generated types placeholder. Run:
//   supabase gen types typescript --project-id <id> --schema public > lib/supabase/types.ts
// after the migration is applied to the Frankfurt project.
export type Database = {
  public: {
    Tables: Record<string, { Row: any; Insert: any; Update: any }>;
    Views: Record<string, { Row: any }>;
    Functions: Record<string, any>;
    Enums: {
      user_role: 'admin' | 'front_office' | 'tecnico' | 'commerciale';
      contact_pref: 'email' | 'sms' | 'telefono';
      appointment_status: 'proposto' | 'confermato' | 'in_corso' | 'completato' | 'annullato' | 'no_show';
      message_direction: 'inbound' | 'outbound';
    };
  };
};

export type UserRole = Database['public']['Enums']['user_role'];
export type ContactPref = Database['public']['Enums']['contact_pref'];
export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
