import { supabase } from './supabase';
import { useUser } from '@clerk/clerk-expo';

// Tipos para las tablas de usuarios
export interface User {
  id: number;
  clerk_id: string;
  email?: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface AstralQuestionnaireResponse {
  id: number;
  user_id: number;
  name?: string;
  travel_experiences?: string;
  travel_motivation?: string;
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserTravelPreferences {
  id: number;
  user_id: number;
  life_moment?: string;
  aspects_to_explore?: string;
  travel_intention?: string;
  desired_transformation?: string;
  soul_activities?: string;
  experience_processing?: string;
  ideal_environment?: string;
  comfort_level?: string;
  success_indicator?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AstralProfile {
  id: number;
  user_id: number;
  sun_sign?: string;
  moon_sign?: string;
  rising_sign?: string;
  full_profile?: string;
  profile_summary?: string;
  personality_traits?: any;
  travel_affinities?: any;
  recommended_destinations?: any;
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  generated_at?: string;
  updated_at?: string;
}

export class UserService {
  /**
   * Sincroniza un usuario de Clerk con Supabase
   * Crea el usuario si no existe, o lo actualiza si ya existe
   * Maneja vinculación automática de cuentas cuando el email ya existe
   */
  static async syncClerkUser(clerkId: string, email?: string, name?: string): Promise<User | null> {
    try {
      // Primero verificar si ya existe un usuario con este clerk_id
      const { data: existingByClerkId } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .maybeSingle();

      if (existingByClerkId) {
        // Usuario ya existe con este clerk_id, solo actualizar
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            email: email,
            name: name,
            updated_at: new Date().toISOString()
          })
          .eq('clerk_id', clerkId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user:', updateError);
          return existingByClerkId;
        }

        return updatedUser;
      }

      // Si hay email, verificar si ya existe un usuario con ese email
      if (email) {
        const { data: existingByEmail } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (existingByEmail) {
          console.log(`Vinculando cuenta: Email ${email} ya existe. Actualizando clerk_id de ${existingByEmail.clerk_id} a ${clerkId}`);

          // Actualizar el clerk_id del usuario existente
          const { data: linkedUser, error: linkError } = await supabase
            .from('users')
            .update({
              clerk_id: clerkId,
              name: name || existingByEmail.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingByEmail.id)
            .select()
            .single();

          if (linkError) {
            console.error('Error vinculando cuenta:', linkError);
            return existingByEmail;
          }

          return linkedUser;
        }
      }

      // No existe usuario con este clerk_id ni con este email, crear nuevo
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkId,
          email: email,
          name: name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        return null;
      }

      return newUser;
    } catch (error) {
      console.error('Unexpected error syncing user:', error);
      return null;
    }
  }

  /**
   * Obtiene el usuario de Supabase por clerk_id
   */
  static async getUserByClerkId(clerkId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  }

  /**
   * Guarda o actualiza las respuestas del cuestionario inicial (astral)
   */
  static async saveAstralQuestionnaire(
    userId: number,
    answers: { [key: number]: string | Date }
  ): Promise<AstralQuestionnaireResponse | null> {
    try {
      // Mapear las respuestas a los campos de la tabla
      const questionnaireData = {
        user_id: userId,
        name: answers[1] as string || null,
        travel_experiences: answers[2] as string || null,
        travel_motivation: answers[3] as string || null,
        birth_date: answers[4] ? new Date(answers[4] as string).toISOString().split('T')[0] : null,
        birth_time: answers[5] ? new Date(answers[5] as string).toISOString().split('T')[1].substring(0, 8) : null,
        birth_location: answers[6] as string || null,
        completed: true,
        completed_at: new Date().toISOString()
      };

      // Verificar si ya existe una respuesta para este usuario
      const { data: existing } = await supabase
        .from('astral_questionnaire_responses')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Actualizar
        const { data, error } = await supabase
          .from('astral_questionnaire_responses')
          .update({
            ...questionnaireData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating astral questionnaire:', error);
          return null;
        }
        return data;
      } else {
        // Insertar
        const { data, error } = await supabase
          .from('astral_questionnaire_responses')
          .insert(questionnaireData)
          .select()
          .single();

        if (error) {
          console.error('Error saving astral questionnaire:', error);
          return null;
        }
        return data;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  }

  /**
   * Guarda o actualiza las preferencias de viaje (cuestionario de recomendaciones)
   */
  static async saveTravelPreferences(
    userId: number,
    answers: { [key: number]: string }
  ): Promise<UserTravelPreferences | null> {
    try {
      const preferencesData = {
        user_id: userId,
        life_moment: answers[1] || null,
        aspects_to_explore: answers[2] || null,
        travel_intention: answers[3] || null,
        desired_transformation: answers[4] || null,
        soul_activities: answers[5] || null,
        experience_processing: answers[6] || null,
        ideal_environment: answers[7] || null,
        comfort_level: answers[8] || null,
        success_indicator: answers[9] || null,
        completed: true,
        completed_at: new Date().toISOString()
      };

      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('user_travel_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Actualizar
        const { data, error } = await supabase
          .from('user_travel_preferences')
          .update({
            ...preferencesData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating travel preferences:', error);
          return null;
        }
        return data;
      } else {
        // Insertar
        const { data, error } = await supabase
          .from('user_travel_preferences')
          .insert(preferencesData)
          .select()
          .single();

        if (error) {
          console.error('Error saving travel preferences:', error);
          return null;
        }
        return data;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  }

  /**
   * Obtiene las respuestas del cuestionario astral de un usuario
   */
  static async getAstralQuestionnaire(userId: number): Promise<AstralQuestionnaireResponse | null> {
    try {
      const { data, error } = await supabase
        .from('astral_questionnaire_responses')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching astral questionnaire:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  }

  /**
   * Obtiene las preferencias de viaje de un usuario
   */
  static async getTravelPreferences(userId: number): Promise<UserTravelPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_travel_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching travel preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  }

  /**
   * Obtiene el perfil astrológico completo de un usuario
   */
  static async getAstralProfile(userId: number): Promise<AstralProfile | null> {
    try {
      const { data, error } = await supabase
        .from('astral_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching astral profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario ha completado el onboarding
   */
  static async hasCompletedOnboarding(userId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('astral_questionnaire_responses')
        .select('completed')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
        return false;
      }

      return data?.completed || false;
    } catch (error) {
      console.error('Unexpected error:', error);
      return false;
    }
  }

  /**
   * Obtiene el usuario y verifica su onboarding en una sola consulta (OPTIMIZADO)
   * Retorna { user, hasCompletedOnboarding }
   */
  static async getUserWithOnboardingStatus(clerkId: string): Promise<{ user: User | null; hasCompletedOnboarding: boolean }> {
    try {
      // Consulta optimizada con JOIN para obtener usuario y estado de onboarding en una sola query
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          astral_questionnaire_responses!inner(completed)
        `)
        .eq('clerk_id', clerkId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user with onboarding status:', error);

        // Fallback: intentar obtener solo el usuario
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', clerkId)
          .maybeSingle();

        return {
          user: userData,
          hasCompletedOnboarding: false
        };
      }

      if (!data) {
        return {
          user: null,
          hasCompletedOnboarding: false
        };
      }

      // Extraer datos del usuario sin las relaciones
      const { astral_questionnaire_responses, ...userData } = data as any;

      return {
        user: userData as User,
        hasCompletedOnboarding: astral_questionnaire_responses?.completed || false
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        user: null,
        hasCompletedOnboarding: false
      };
    }
  }

  /**
   * Elimina todos los datos del usuario de Supabase
   * Esto incluye: perfil astral, preferencias de viaje, respuestas del cuestionario y el usuario
   */
  static async deleteUserData(clerkId: string): Promise<boolean> {
    try {
      // Primero obtener el usuario de Supabase
      const user = await this.getUserByClerkId(clerkId);

      if (!user) {
        console.log('Usuario no encontrado en Supabase');
        return true; // No hay datos que eliminar
      }

      // Eliminar perfil astral
      await supabase
        .from('astral_profiles')
        .delete()
        .eq('user_id', user.id);

      // Eliminar preferencias de viaje
      await supabase
        .from('user_travel_preferences')
        .delete()
        .eq('user_id', user.id);

      // Eliminar respuestas del cuestionario
      await supabase
        .from('astral_questionnaire_responses')
        .delete()
        .eq('user_id', user.id);

      // Finalmente eliminar el usuario
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', clerkId);

      if (error) {
        console.error('Error eliminando usuario de Supabase:', error);
        return false;
      }

      console.log('✅ Todos los datos del usuario eliminados de Supabase');
      return true;
    } catch (error) {
      console.error('Error inesperado eliminando datos del usuario:', error);
      return false;
    }
  }
}
