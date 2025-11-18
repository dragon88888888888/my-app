import { createClient } from '@supabase/supabase-js';

// Estas variables deberán ser configuradas con tus credenciales reales de Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Cliente de Supabase básico sin persistencia de sesión
// (Clerk maneja la autenticación, Supabase solo maneja los datos)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Tipos para TypeScript - Estructura Normalizada

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchange_rate_usd: number;
  active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  active: boolean;
  created_at: string;
}

export interface DifficultyLevel {
  id: number;
  name: string;
  slug: string;
  description?: string;
  level_order: number;
  color?: string;
  active: boolean;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  category?: string;
  color?: string;
  active: boolean;
  created_at: string;
}

export interface Destination {
  id: number;
  name: string;
  slug: string;
  country_id: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  active: boolean;
  created_at: string;
}

// Variantes de viajes (fechas específicas, tipos)
export interface TripVariant {
  id: number;
  trip_id: number;
  variant_name: string;
  variant_type?: string;
  price_from: number;
  currency_id: number;
  specific_details?: any; // JSONB
  original_title?: string;
  original_slug?: string;
  image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Variante con relaciones
export interface TripVariantWithRelations extends TripVariant {
  currency: Currency;
}

// Tabla principal de viajes
export interface Trip {
  id: number;
  title: string;
  slug: string;
  description: string;
  duration_days: number;
  meals_included: number;
  price_from: number;
  currency_id: number;
  category_id: number;
  difficulty_level_id: number;
  min_group_size?: number;
  max_group_size?: number;
  image_url?: string;
  blurhash?: string;
  itinerary_download_url?: string;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Viaje con relaciones incluidas (para la UI)
export interface TripWithRelations extends Trip {
  currency: Currency;
  category: Category;
  difficulty_level: DifficultyLevel;
  destinations: Destination[];
  tags: Tag[];
  variants?: TripVariantWithRelations[]; // Nueva propiedad
  best_months?: number[];
  includes?: string[];
  excludes?: string[];
}

// Para compatibilidad con el componente existente
export interface LegacyTrip {
  id: number;
  title: string;
  slug: string;
  description: string;
  duration_days: number;
  meals_included: number;
  destinations: string[];
  price_from: number;
  currency: string;
  image_url?: string;
  blurhash?: string;
  tags: string[];
  category: string;
  difficulty_level: string;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  variants?: TripVariantWithRelations[]; // Variantes del viaje
}

// Tipos para tablas de usuarios (ya están definidos en userService.ts)
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

export interface Conversation {
  id: number;
  user_id: number;
  thread_id: string;
  title: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender: 'user' | 'bot';
  content: string;
  created_at: string;
}