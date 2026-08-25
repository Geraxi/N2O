// Hand-written to match supabase/migrations/20260515_initial_schema.sql.
// Not the full supabase-cli-generated shape (no Functions/CompositeTypes
// detail), but Row/Insert/Update per table/view matches the schema for every
// column the app actually queries. Regenerate with the Supabase CLI once the
// project is live if this drifts:
//   supabase gen types typescript --project-id <id> --schema public > lib/supabase/types.ts

export type UserRole = 'admin' | 'front_office' | 'tecnico' | 'commerciale';
export type ContactPref = 'email' | 'sms' | 'telefono';
export type AppointmentStatus = 'proposto' | 'confermato' | 'in_corso' | 'completato' | 'annullato' | 'no_show';
export type MessageDirection = 'inbound' | 'outbound';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          nome: string;
          cognome: string;
          telefono: string | null;
          home_address: string | null;
          home_lat: number | null;
          home_lng: number | null;
          pin_color: string | null;
          attivo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          nome: string;
          cognome: string;
          telefono?: string | null;
          home_address?: string | null;
          home_lat?: number | null;
          home_lng?: number | null;
          pin_color?: string | null;
          attivo?: boolean;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          ragione_sociale: string;
          partita_iva: string | null;
          codice_fiscale: string | null;
          referente: string | null;
          email: string | null;
          telefono: string | null;
          pec: string | null;
          indirizzo: string | null;
          citta: string | null;
          provincia: string | null;
          cap: string | null;
          lat: number | null;
          lng: number | null;
          preferenza_contatto: ContactPref;
          note: string | null;
          metadata: Json;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          ragione_sociale: string;
          partita_iva?: string | null;
          codice_fiscale?: string | null;
          referente?: string | null;
          email?: string | null;
          telefono?: string | null;
          pec?: string | null;
          indirizzo?: string | null;
          citta?: string | null;
          provincia?: string | null;
          cap?: string | null;
          lat?: number | null;
          lng?: number | null;
          preferenza_contatto?: ContactPref;
          note?: string | null;
          metadata?: Json;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
        Relationships: [];
      };
      product_types: {
        Row: {
          id: string;
          nome: string;
          descrizione: string | null;
          validita_mesi: number;
          report_schema: Json;
          attivo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          descrizione?: string | null;
          validita_mesi?: number;
          report_schema?: Json;
          attivo?: boolean;
        };
        Update: Partial<Database['public']['Tables']['product_types']['Insert']>;
        Relationships: [];
      };
      product_instances: {
        Row: {
          id: string;
          client_id: string;
          product_type_id: string;
          identificativo: string | null;
          ubicazione: string | null;
          data_installazione: string | null;
          data_ultima_verifica: string | null;
          data_scadenza: string;
          note: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          product_type_id: string;
          identificativo?: string | null;
          ubicazione?: string | null;
          data_installazione?: string | null;
          data_ultima_verifica?: string | null;
          data_scadenza: string;
          note?: string | null;
          metadata?: Json;
        };
        Update: Partial<Database['public']['Tables']['product_instances']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'product_instances_product_type_id_fkey';
            columns: ['product_type_id'];
            isOneToOne: false;
            referencedRelation: 'product_types';
            referencedColumns: ['id'];
          },
        ];
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          product_instance_ids: string[];
          tecnico_id: string | null;
          status: AppointmentStatus;
          data_inizio: string;
          data_fine: string | null;
          indirizzo: string | null;
          lat: number | null;
          lng: number | null;
          note: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          product_instance_ids?: string[];
          tecnico_id?: string | null;
          status?: AppointmentStatus;
          data_inizio: string;
          data_fine?: string | null;
          indirizzo?: string | null;
          lat?: number | null;
          lng?: number | null;
          note?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          appointment_id: string;
          tecnico_id: string;
          checkin_lat: number | null;
          checkin_lng: number | null;
          checkin_distance_m: number | null;
          checkin_flagged: boolean | null;
          checkin_at: string | null;
          instance_results: Json;
          esito_generale: string | null;
          firma_cliente_url: string | null;
          firma_tecnico_url: string | null;
          foto_urls: string[] | null;
          pdf_url: string | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          tecnico_id: string;
          checkin_lat?: number | null;
          checkin_lng?: number | null;
          checkin_distance_m?: number | null;
          checkin_flagged?: boolean | null;
          checkin_at?: string | null;
          instance_results?: Json;
          esito_generale?: string | null;
          firma_cliente_url?: string | null;
          firma_tecnico_url?: string | null;
          foto_urls?: string[] | null;
          pdf_url?: string | null;
          submitted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          client_id: string;
          appointment_id: string | null;
          report_id: string | null;
          product_type_id: string | null;
          flagged_by: string;
          descrizione: string;
          valore_stimato: number | null;
          status: string;
          preventivo_url: string | null;
          note_admin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          appointment_id?: string | null;
          report_id?: string | null;
          product_type_id?: string | null;
          flagged_by: string;
          descrizione: string;
          valore_stimato?: number | null;
          status?: string;
          preventivo_url?: string | null;
          note_admin?: string | null;
        };
        Update: Partial<Database['public']['Tables']['opportunities']['Insert']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          client_id: string | null;
          appointment_id: string | null;
          direction: MessageDirection;
          channel: string;
          email_message_id: string | null;
          email_thread_id: string | null;
          email_from: string | null;
          email_to: string[] | null;
          subject: string | null;
          body_text: string | null;
          body_html: string | null;
          sms_to: string | null;
          sms_body: string | null;
          ai_classified_at: string | null;
          ai_category: string | null;
          ai_confidence: number | null;
          ai_summary: string | null;
          draft_body: string | null;
          approved_by: string | null;
          approved_at: string | null;
          sent_at: string | null;
          delivery_status: string | null;
          delivery_error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          appointment_id?: string | null;
          direction: MessageDirection;
          channel: string;
          email_message_id?: string | null;
          email_thread_id?: string | null;
          email_from?: string | null;
          email_to?: string[] | null;
          subject?: string | null;
          body_text?: string | null;
          body_html?: string | null;
          sms_to?: string | null;
          sms_body?: string | null;
          ai_classified_at?: string | null;
          ai_category?: string | null;
          ai_confidence?: number | null;
          ai_summary?: string | null;
          draft_body?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          sent_at?: string | null;
          delivery_status?: string | null;
          delivery_error?: string | null;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          kind: string;
          payload: Json;
          status: string;
          attempts: number;
          scheduled_for: string;
          started_at: string | null;
          completed_at: string | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          kind: string;
          payload?: Json;
          status?: string;
          attempts?: number;
          scheduled_for?: string;
          started_at?: string | null;
          completed_at?: string | null;
          error?: string | null;
        };
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          table_name: string;
          row_id: string | null;
          before: Json;
          after: Json;
          ip: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_id?: string | null;
          action: string;
          table_name: string;
          row_id?: string | null;
          before?: Json;
          after?: Json;
          ip?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          ai_autosend_enabled: boolean;
          ai_daily_cap: number;
          reminder_t3d_enabled: boolean;
          reminder_t24h_enabled: boolean;
          scadenza_warning_days: number;
          scadenza_urgent_days: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: number;
          ai_autosend_enabled?: boolean;
          ai_daily_cap?: number;
          reminder_t3d_enabled?: boolean;
          reminder_t24h_enabled?: boolean;
          scadenza_warning_days?: number;
          scadenza_urgent_days?: number;
          updated_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      v_scadenze_imminenti: {
        Row: {
          product_instance_id: string;
          client_id: string;
          ragione_sociale: string;
          citta: string | null;
          provincia: string | null;
          preferenza_contatto: ContactPref;
          product_type_id: string;
          product_type: string;
          identificativo: string | null;
          ubicazione: string | null;
          data_scadenza: string;
          giorni_residui: number;
          urgenza: 'scaduto' | 'urgente' | 'in_avvicinamento' | 'ok';
        };
        Relationships: [];
      };
      v_appuntamenti_oggi: {
        Row: {
          id: string;
          client_id: string;
          product_instance_ids: string[];
          tecnico_id: string | null;
          status: AppointmentStatus;
          data_inizio: string;
          data_fine: string | null;
          indirizzo: string | null;
          lat: number | null;
          lng: number | null;
          note: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          ragione_sociale: string;
          client_indirizzo: string | null;
          client_citta: string | null;
          client_telefono: string | null;
          tecnico_nome: string | null;
          tecnico_cognome: string | null;
          tecnico_color: string | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      contact_pref: ContactPref;
      appointment_status: AppointmentStatus;
      message_direction: MessageDirection;
    };
    CompositeTypes: Record<string, never>;
  };
}
