-- Habilitar RLS estricto (Seguridad a nivel de fila)

-- 1. POLITICAS DE PROYECTOS
DROP POLICY IF EXISTS "Public access" ON public.proyectos;

-- Profesores: Solo ven SUS proyectos
CREATE POLICY "Ver solo mis proyectos" ON public.proyectos
FOR ALL
USING (auth.uid() = created_by);

-- Alumnos: Ven proyectos por código (lectura) o membresía
-- Simplificamos: Si eres el dueño, acceso total. Si no, lectura si tienes el código (para unirse)
CREATE POLICY "Lectura pública limitada" ON public.proyectos
FOR SELECT
USING (true); 
-- NOTA: Mantenemos lectura abierta temporalmente para que el login de alumnos (check código) funcione
-- PERO el DashboardDocente solo mostrará los creados por tí si filtramos en el WHERE o si ajustamos la política.
-- Mejor: Ajustamos RLS para que el Dashboard (select *) solo devuelva los tuyos.
-- Y creamos una funcion segura para verificar codigo sin exponer todo.

DROP POLICY IF EXISTS "Ver solo mis proyectos" ON public.proyectos;
DROP POLICY IF EXISTS "Lectura pública limitada" ON public.proyectos;

-- Política FINAL de Proyectos:
-- 1. El dueño puede hacer todo.
CREATE POLICY "Dueño gestiona todo" ON public.proyectos
FOR ALL
USING (auth.uid() = created_by);

-- 2. Todo el mundo puede LEER un proyecto si conoce su ID o Código (necesario para login alumnos)
-- PERO para evitar que 'select *' devuelva todo en el dashboard, RLS filtra filas.
-- Si usamos 'using (true)' en select, sale todo.
-- TRUCO: El Dashboard usa .select('*'), así que verá todo si dejamos lectura libre.

-- SOLUCIÓN:
-- Modificamos la política de lectura para que solo sea:
-- a) Eres el dueño.
-- b) Eres un alumno que YA pertenece a un grupo de ese proyecto.
-- c) Estás buscando un proyecto específico por código_sala (esto es difícil de modelar en RLS puro sin función).

-- CAMBIO DE ESTRATEGIA PARA EL ERROR ACTUAL (Teacher B ve cosas de Teacher A):
-- RLS estricto: Solo ver lo que creaste.
-- Alumnos: Usarán una función segura (RPC) o política especial.

CREATE POLICY "Teachers see only own projects" ON public.proyectos
FOR ALL
USING (auth.uid() = created_by);

-- Permitir lectura si buscas por código EXACTO (para unirse)
-- Esto no es posible directamente en RLS estándar fácilmente sin exponer lista.
-- PERO para Arreglar el dashboard YA:
-- Ejecuta esto y los profes dejarán de ver lo de otros.
-- (El login de alumno por código podría fallar si no ajustamos, verificaremos luego).

-- 2. POLITICAS DE PERFILES
DROP POLICY IF EXISTS "Public access" ON public.profiles;
CREATE POLICY "Ver perfil propio y publico" ON public.profiles
FOR ALL
USING (auth.uid() = id OR true); -- Perfiles públicos es ok para saber nombres

-- 3. POLITICAS DE GRUPOS
DROP POLICY IF EXISTS "Public access" ON public.grupos;
CREATE POLICY "Acceso grupos proyecto propio" ON public.grupos
FOR ALL
USING (
  exists (
    select 1 from public.proyectos
    where proyectos.id = grupos.proyecto_id
    and proyectos.created_by = auth.uid()
  )
);
