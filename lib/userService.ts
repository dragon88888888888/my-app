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

export class UserService {
  /**
   * Sincroniza un usuario de Clerk con Supabase
   * Crea el usuario si no existe, o lo actualiza si ya existe
   */
  static async syncClerkUser(clerkId: string, email?: string, name?: string): Promise<User | null> {
    try {
      // Verificar si el usuario ya existe
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 es el código de "no se encontró"
        console.error('Error checking existing user:', fetchError);
        return null;
      }

      // Si el usuario existe, actualizarlo
      if (existingUser) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            email: email || existingUser.email,
            name: name || existingUser.name,
            updated_at: new Date().toISOString()
          })
          .eq('clerk_id', clerkId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user:', updateError);
          return null;
        }

        return updatedUser;
      }

      // Si no existe, crear nuevo usuario
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkId,
          email: email,
          name: name
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
}
