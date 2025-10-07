import { supabase, Trip, TripWithRelations, LegacyTrip, Currency, Category, DifficultyLevel, Tag } from './supabase';

export class TripsService {
  // Convertir TripWithRelations a formato legacy para compatibilidad con UI
  private static convertToLegacyFormat(trip: TripWithRelations): LegacyTrip {
    return {
      id: trip.id,
      title: trip.title,
      slug: trip.slug,
      description: trip.description,
      duration_days: trip.duration_days,
      meals_included: trip.meals_included,
      destinations: trip.destinations.map(d => d.name),
      price_from: trip.price_from,
      currency: trip.currency.code,
      image_url: trip.image_url,
      blurhash: trip.blurhash,
      tags: trip.tags.map(t => t.name),
      category: trip.category.name,
      difficulty_level: trip.difficulty_level.name,
      featured: trip.featured,
      active: trip.active,
      created_at: trip.created_at,
      updated_at: trip.updated_at
    };
  }

  // Obtener todos los viajes activos con relaciones
  static async getAllTrips(): Promise<LegacyTrip[]> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          currency:currencies(*),
          category:categories(*),
          difficulty_level:difficulty_levels(*),
          destinations:trip_destinations(
            order_index,
            destination:destinations(*)
          ),
          tags:trip_tags(
            tag:tags(*)
          )
        `)
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips:', error);
        return [];
      }

      // Procesar y convertir datos
      const processedTrips = (data || []).map((trip: any) => {
        const tripWithRelations: TripWithRelations = {
          ...trip,
          destinations: trip.destinations
            ?.sort((a: any, b: any) => a.order_index - b.order_index)
            .map((td: any) => td.destination) || [],
          tags: trip.tags?.map((tt: any) => tt.tag) || []
        };

        return this.convertToLegacyFormat(tripWithRelations);
      });

      return processedTrips;
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  }

  // Obtener viajes destacados
  static async getFeaturedTrips(): Promise<LegacyTrip[]> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          currency:currencies(*),
          category:categories(*),
          difficulty_level:difficulty_levels(*),
          destinations:trip_destinations(
            order_index,
            destination:destinations(*)
          ),
          tags:trip_tags(
            tag:tags(*)
          )
        `)
        .eq('active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured trips:', error);
        return [];
      }

      // Procesar y convertir datos
      const processedTrips = (data || []).map((trip: any) => {
        const tripWithRelations: TripWithRelations = {
          ...trip,
          destinations: trip.destinations
            ?.sort((a: any, b: any) => a.order_index - b.order_index)
            .map((td: any) => td.destination) || [],
          tags: trip.tags?.map((tt: any) => tt.tag) || []
        };

        return this.convertToLegacyFormat(tripWithRelations);
      });

      return processedTrips;
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  }

  // Obtener viaje por slug
  static async getTripBySlug(slug: string): Promise<LegacyTrip | null> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          currency:currencies(*),
          category:categories(*),
          difficulty_level:difficulty_levels(*),
          destinations:trip_destinations(
            order_index,
            destination:destinations(*)
          ),
          tags:trip_tags(
            tag:tags(*)
          )
        `)
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error) {
        console.error('Error fetching trip by slug:', error);
        return null;
      }

      // Procesar y convertir datos
      const tripWithRelations: TripWithRelations = {
        ...data,
        destinations: data.destinations
          ?.sort((a: any, b: any) => a.order_index - b.order_index)
          .map((td: any) => td.destination) || [],
        tags: data.tags?.map((tt: any) => tt.tag) || []
      };

      return this.convertToLegacyFormat(tripWithRelations);
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  }

  // Filtrar viajes por categoría
  static async getTripsByCategory(categorySlug: string): Promise<LegacyTrip[]> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          currency:currencies(*),
          category:categories(*),
          difficulty_level:difficulty_levels(*),
          destinations:trip_destinations(
            order_index,
            destination:destinations(*)
          ),
          tags:trip_tags(
            tag:tags(*)
          )
        `)
        .eq('active', true)
        .eq('category.slug', categorySlug)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips by category:', error);
        return [];
      }

      // Procesar y convertir datos
      const processedTrips = (data || []).map((trip: any) => {
        const tripWithRelations: TripWithRelations = {
          ...trip,
          destinations: trip.destinations
            ?.sort((a: any, b: any) => a.order_index - b.order_index)
            .map((td: any) => td.destination) || [],
          tags: trip.tags?.map((tt: any) => tt.tag) || []
        };

        return this.convertToLegacyFormat(tripWithRelations);
      });

      return processedTrips;
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  }

  // Filtrar viajes por rango de precio
  static async getTripsByPriceRange(minPrice: number, maxPrice: number, currencyCode: string = 'USD'): Promise<LegacyTrip[]> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          currency:currencies(*),
          category:categories(*),
          difficulty_level:difficulty_levels(*),
          destinations:trip_destinations(
            order_index,
            destination:destinations(*)
          ),
          tags:trip_tags(
            tag:tags(*)
          )
        `)
        .eq('active', true)
        .eq('currency.code', currencyCode)
        .gte('price_from', minPrice)
        .lte('price_from', maxPrice)
        .order('price_from', { ascending: true });

      if (error) {
        console.error('Error fetching trips by price range:', error);
        return [];
      }

      // Procesar y convertir datos
      const processedTrips = (data || []).map((trip: any) => {
        const tripWithRelations: TripWithRelations = {
          ...trip,
          destinations: trip.destinations
            ?.sort((a: any, b: any) => a.order_index - b.order_index)
            .map((td: any) => td.destination) || [],
          tags: trip.tags?.map((tt: any) => tt.tag) || []
        };

        return this.convertToLegacyFormat(tripWithRelations);
      });

      return processedTrips;
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  }

  // Buscar viajes por texto
  static async searchTrips(query: string): Promise<LegacyTrip[]> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          currency:currencies(*),
          category:categories(*),
          difficulty_level:difficulty_levels(*),
          destinations:trip_destinations(
            order_index,
            destination:destinations(*)
          ),
          tags:trip_tags(
            tag:tags(*)
          )
        `)
        .eq('active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching trips:', error);
        return [];
      }

      // Procesar y convertir datos
      const processedTrips = (data || []).map((trip: any) => {
        const tripWithRelations: TripWithRelations = {
          ...trip,
          destinations: trip.destinations
            ?.sort((a: any, b: any) => a.order_index - b.order_index)
            .map((td: any) => td.destination) || [],
          tags: trip.tags?.map((tt: any) => tt.tag) || []
        };

        return this.convertToLegacyFormat(tripWithRelations);
      });

      return processedTrips;
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  }

  // Métodos adicionales para catálogos
  static async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  }

  static async getAllDifficultyLevels(): Promise<DifficultyLevel[]> {
    try {
      const { data, error } = await supabase
        .from('difficulty_levels')
        .select('*')
        .eq('active', true)
        .order('level_order');

      if (error) {
        console.error('Error fetching difficulty levels:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  }

  static async getAllTags(): Promise<Tag[]> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Error fetching tags:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  }
}