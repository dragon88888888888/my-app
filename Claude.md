# TuriAI - Historial de Desarrollo

## Resumen del Proyecto
Aplicación de turismo con React Native (Expo) que integra:
- Autenticación con Clerk
- Base de datos Supabase
- Cuestionarios personalizados (inicial y de recomendaciones)
- Sistema de viajes y recomendaciones

---

## Stack Tecnológico
- **Frontend**: React Native con Expo
- **Autenticación**: Clerk
- **Base de datos**: Supabase (PostgreSQL)
- **Navegación**: Expo Router
- **UI**: React Native Components + Animaciones (react-native-reanimated)

---

## Estructura de la Base de Datos

### Tablas de Viajes
- `trips` - 37 viajes cargados
- `categories` - 6 categorías
- `difficulty_levels` - Niveles de dificultad
- `tags` - Etiquetas para clasificar viajes
- `destinations` - Destinos de viajes
- `countries` - Países
- `continents` - Continentes
- `currencies` - Monedas
- Tablas de relación: `trip_destinations`, `trip_tags`, `trip_includes`, `trip_best_months`

### Tablas de Usuarios
- `users` - Usuarios sincronizados de Clerk
  - `id`, `clerk_id`, `email`, `name`, `created_at`, `updated_at`

- `astral_questionnaire_responses` - Cuestionario inicial (6 preguntas)
  - `name`, `travel_experiences`, `travel_motivation`
  - `birth_date`, `birth_time`, `birth_location`
  - `completed`, `completed_at`

- `user_travel_preferences` - Cuestionario de recomendaciones (9 preguntas)
  - `life_moment`, `aspects_to_explore`, `travel_intention`
  - `desired_transformation`, `soul_activities`, `experience_processing`
  - `ideal_environment`, `comfort_level`, `success_indicator`
  - `completed`, `completed_at`

- `astral_profiles` - Perfiles astrológicos (futuro)
  - `sun_sign`, `moon_sign`, `rising_sign`
  - `personality_traits`, `travel_affinities`, `recommended_destinations`

### Estado RLS (Row Level Security)
**Actualmente DESHABILITADO** en tablas de usuarios para desarrollo.

**Para producción se debe:**
1. Configurar JWT template "supabase" en Clerk Dashboard
2. Re-habilitar RLS
3. Crear políticas que usen JWT claims de Clerk
4. Actualizar `useSupabaseAuth` hook

---

## Migraciones Aplicadas
1. `20251006103116` - create_users_table
2. `20251006103133` - create_astral_profiles_table
3. `20251006103149` - create_astral_questionnaire_responses_table
4. `20251006111327` - create_user_travel_preferences_table
5. `20251006111741` - enable_rls_on_user_tables (posteriormente deshabilitado)
6. `20251006120000` - fix_rls_policies_for_development (RLS deshabilitado)

---

## Implementaciones Completadas

### ✅ 1. Sincronización de Usuarios (Clerk → Supabase)
**Archivo**: `lib/userService.ts`

**Funcionalidad**:
- `syncClerkUser()` - Crea/actualiza usuario en Supabase al autenticarse
- `getUserByClerkId()` - Obtiene usuario por clerk_id
- Se ejecuta automáticamente en `AuthGuard.tsx`

### ✅ 2. Cuestionario Inicial
**Archivo**: `app/cuestionario.tsx`

**6 preguntas**:
1. Nombre/apodo
2. Tipo de experiencias que busca
3. Qué desea descubrir/transformar
4. Fecha de nacimiento (opcional)
5. Hora de nacimiento (opcional)
6. Ciudad y país de nacimiento (opcional)

**Flujo**:
- Se muestra después del signup (primera vez)
- Se guarda en tabla `astral_questionnaire_responses`
- Incluye indicador de carga

### ✅ 3. Cuestionario de Recomendaciones
**Archivo**: `components/RecommendationsQuestionnaire.tsx`

**9 preguntas**:
1. Momento de vida actual
2. Aspectos a explorar/fortalecer
3. Intención principal del viaje
4. Qué desea transformar
5. Actividades que nutren el alma
6. Cómo procesa experiencias profundas
7. Tipo de entorno preferido
8. Nivel de comodidad
9. Indicador de transformación exitosa

**Flujo**:
- Se muestra la primera vez que accede a pantalla de recomendaciones
- Verifica en BD si ya fue completado antes de mostrar
- Se guarda en tabla `user_travel_preferences`
- Incluye indicador de carga

### ✅ 4. Sistema de Viajes
**Archivo**: `lib/tripsService.ts`

**Funciones implementadas**:
- `getAllTrips()` - Obtiene todos los viajes activos
- `getFeaturedTrips()` - Viajes destacados
- `getTripBySlug()` - Viaje individual
- `getTripsByCategory()` - Filtrar por categoría
- `getTripsByPriceRange()` - Filtrar por precio
- `searchTrips()` - Búsqueda por texto

**Conversión de datos**:
- `TripWithRelations` → `LegacyTrip` para compatibilidad con UI

### ✅ 5. Flujo de Autenticación

**Pantalla Inicial** (`app/index.tsx`):
- Cierra sesión automáticamente al cargar
- Botones: "Iniciar Sesión" y "Crear Cuenta"

**Login** (`app/login.tsx`):
- Maneja error "session already exists"
- Redirige a `/(tabs)` después de login exitoso

**Signup** (`app/signup.tsx`):
- Crea cuenta con Clerk
- Redirige al cuestionario inicial

**AuthGuard** (`components/AuthGuard.tsx`):
- Sincroniza usuario con Supabase automáticamente
- Protege rutas que requieren autenticación
- NO redirige automáticamente si hay sesión (siempre pide login)

**Logout**:
- Botón en pantalla de perfil
- Redirige a pantalla inicial

### ✅ 6. Pantallas Principales

**Tabs**:
1. **Mis Viajes** (`app/(tabs)/index.tsx`)
   - Datos hardcodeados (Tokyo, Barcelona)
   - Pendiente: integrar viajes reales del usuario

2. **Recomendaciones** (`app/(tabs)/recommendations.tsx`)
   - Verifica si completó cuestionario
   - Muestra cuestionario o lista de viajes
   - Carga 37 viajes desde Supabase

3. **Chat** (`app/(tabs)/chat.tsx`)
   - Pendiente implementación

4. **Perfil** (`app/(tabs)/profile.tsx`)
   - Radar chart con 5 dimensiones
   - Botón de logout

---

## Archivos Clave Creados/Modificados

### Nuevos Archivos
- `lib/userService.ts` - Servicios de usuario y cuestionarios
- `lib/tripsService.ts` - Servicios de viajes
- `lib/useSupabaseAuth.ts` - Hook de autenticación (simplificado)
- `components/RecommendationsQuestionnaire.tsx` - Cuestionario de 9 preguntas
- `components/AuthGuard.tsx` - Guard de autenticación

### Archivos Modificados
- `lib/supabase.ts` - Cliente de Supabase sin persistencia de sesión
- `app/_layout.tsx` - Integración del hook de auth
- `app/index.tsx` - Logout automático al cargar
- `app/login.tsx` - Manejo de errores de sesión
- `app/cuestionario.tsx` - Guardado en BD
- `app/(tabs)/recommendations.tsx` - Verificación de cuestionario completado

---

## Configuración de Entorno

### Variables de Entorno (`.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://cjgcbltewsqmittjugja.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Proyecto Supabase
- **ID**: `cjgcbltewsqmittjugja`
- **Región**: `us-east-2`
- **Estado**: ACTIVE_HEALTHY

---

## Problemas Resueltos

### 1. Error: "No JWT template exists with name: supabase"
**Solución**: Simplificar `useSupabaseAuth` para no usar JWT template (requiere configuración en Clerk)

### 2. Error: RLS bloqueando inserción de usuarios
**Solución**: Deshabilitar RLS temporalmente para desarrollo

### 3. Error: "session already exists" en login
**Solución**: Manejar error con try-catch en `setActive()`

### 4. Error: Maximum update depth exceeded
**Solución**: Cambiar dependencias de `useEffect` a array vacío `[]` en pantalla inicial

### 5. Error: expo-secure-store en web
**Solución**: Configurar Supabase sin persistencia de sesión (Clerk maneja auth)

---

## Flujo de Usuario Completo

### Primera Vez (Nuevo Usuario)
1. Abrir app → Pantalla inicial
2. "Crear Cuenta" → Signup con Clerk
3. Cuestionario inicial (6 preguntas) → Guardar en BD
4. Redirige a `/(tabs)` → App principal
5. Ir a "Recomendaciones" → Cuestionario de preferencias (9 preguntas)
6. Guardar preferencias → Mostrar viajes

### Usuario Existente
1. Abrir app → Pantalla inicial (cierra sesión automáticamente)
2. "Iniciar Sesión" → Login con Clerk
3. Redirige a `/(tabs)` → App principal
4. Ir a "Recomendaciones" → Verifica si ya completó cuestionario
   - Si ya completó → Muestra viajes directamente
   - Si no completó → Muestra cuestionario

### Cerrar Sesión
1. Ir a "Perfil" → Presionar botón de logout
2. Cierra sesión de Clerk
3. Redirige a pantalla inicial

---

## Pendientes / Futuras Implementaciones

### Inmediatos
- [ ] Pantalla "Mis Viajes": Cargar viajes reales del usuario desde BD
- [ ] Implementar Chat (tab pendiente)
- [ ] Integrar biometría con `expo-local-authentication`

### Producción
- [ ] Configurar JWT template "supabase" en Clerk Dashboard
- [ ] Re-habilitar RLS con políticas JWT
- [ ] Actualizar `useSupabaseAuth` para usar tokens JWT
- [ ] Configurar keys de producción en Clerk

### Perfiles Astrales
- [ ] Generar perfil astral basado en datos de nacimiento
- [ ] Guardar en tabla `astral_profiles`
- [ ] Integrar con recomendaciones de viajes

### Mejoras UX
- [ ] Animaciones mejoradas
- [ ] Filtros avanzados de viajes
- [ ] Sistema de favoritos
- [ ] Historial de viajes completados

---

## Notas Importantes

### Clerk Development Keys
**ADVERTENCIA**: Actualmente usando development keys. Tienen límites de uso estrictos.
Para producción, cambiar a production keys.

### Biometría
Expo soporta autenticación biométrica con `expo-local-authentication`:
- Face ID (iOS)
- Touch ID (iOS)
- Huella digital (Android)
- Reconocimiento facial (Android)

**No instalado aún** - Se puede agregar cuando sea necesario.

---

## Comandos Útiles

```bash
# Iniciar app
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web

# Instalar dependencias
npm install

# Limpiar cache
npx expo start -c
```

---

## Estructura de Carpetas

```
my-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Mis Viajes
│   │   ├── recommendations.tsx # Recomendaciones
│   │   ├── chat.tsx           # Chat
│   │   ├── profile.tsx        # Perfil
│   │   └── _layout.tsx        # Layout de tabs
│   ├── index.tsx              # Pantalla inicial
│   ├── login.tsx              # Login
│   ├── signup.tsx             # Signup
│   ├── cuestionario.tsx       # Cuestionario inicial
│   ├── trip-detail.tsx        # Detalle de viaje
│   └── _layout.tsx            # Layout principal
├── components/
│   ├── AuthGuard.tsx          # Guard de autenticación
│   ├── RecommendationsQuestionnaire.tsx
│   └── ui/
│       ├── IconSymbol.tsx
│       └── AnimatedTabBar.tsx
├── lib/
│   ├── supabase.ts            # Cliente Supabase
│   ├── userService.ts         # Servicios de usuario
│   ├── tripsService.ts        # Servicios de viajes
│   └── useSupabaseAuth.ts     # Hook de auth
├── .env                       # Variables de entorno
└── Claude.md                  # Este archivo
```

---

**Última actualización**: 2025-10-06
**Versión de la app**: 1.0.0
**Estado**: En desarrollo activo
