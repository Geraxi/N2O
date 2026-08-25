'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// settings_admin_write RLS policy restricts this to admin — a non-admin
// submit just updates zero rows (no error thrown), so check rowcount rather
// than trusting a lack of error.
export async function toggleAutosend(formData: FormData) {
  const nextValue = formData.get('nextValue') === 'true';
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autenticato');

  const { data, error } = await supabase
    .from('settings')
    .update({ ai_autosend_enabled: nextValue, updated_by: user.id })
    .eq('id', 1)
    .select('id');

  if (error) throw new Error('Impossibile aggiornare l’impostazione.');
  if (!data || data.length === 0) throw new Error('Solo un amministratore può modificare questa impostazione.');

  revalidatePath('/impostazioni');
}
