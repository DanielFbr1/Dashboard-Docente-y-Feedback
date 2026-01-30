-- RLS FINAL: Equilibrio entre Seguridad y Funcionalidad

-- 1. PROYECTOS: Lectura Abierta (para Login Alumnos), Escritura Cerrada (Solo Profres)
DROP POLICY IF EXISTS "Ver solo mis proyectos" ON public.proyectos;
DROP POLICY IF EXISTS "Dueño gestiona todo" ON public.proyectos;
DROP POLICY IF EXISTS "Teachers see only own projects" ON public.proyectos;
DROP POLICY IF EXISTS "Public access" ON public.proyectos;

-- Política de Lectura: TODO AUTENTICADO puede leer proyectos (necesario para verificar codigos)
-- El Dashboard del profesor filtra explícitamente por 'created_by' en el cliente, así que no se mezclan visualmente.
CREATE POLICY "Lectura Proyectos Autenticados" ON public.proyectos
FOR SELECT
TO authenticated
USING (true);

-- Política de Escritura (Insert/Update/Delete): SOLO EL DUEÑO
CREATE POLICY "Escritura Proyectos Dueño" ON public.proyectos
FOR ALL
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- 2. GRUPOS: Lectura Abierta (para que alumnos encuentren su grupo), Escritura Cerrada
DROP POLICY IF EXISTS "Acceso grupos proyecto propio" ON public.grupos;
DROP POLICY IF EXISTS "Public access" ON public.grupos;

CREATE POLICY "Lectura Grupos Autenticados" ON public.grupos
FOR SELECT
TO authenticated
USING (true);

-- Escritura en Grupos: Solo el Profesor dueño del proyecto O (en un futuro) el alumno en campos específicos
-- Por ahora, solo el profesor gestiona grupos estructuralmente.
CREATE POLICY "Escritura Grupos Dueño Proyecto" ON public.grupos
FOR ALL
USING (
  exists (
    select 1 from public.proyectos
    where proyectos.id = grupos.proyecto_id
    and proyectos.created_by = auth.uid()
  )
)
WITH CHECK (
  exists (
    select 1 from public.proyectos
    where proyectos.id = grupos.proyecto_id
    and proyectos.created_by = auth.uid()
  )
);

-- Si la tabla profiles estaba bloqueando lectura de nombres:
DROP POLICY IF EXISTS "Ver perfil propio y publico" ON public.profiles;
CREATE POLICY "Lectura Perfiles Publica" ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Edicion Perfil Propio" ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Asegurar que Alumnos puedan leer sus evaluaciones si las hubiera
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura Evaluaciones" ON public.evaluaciones
FOR SELECT
USING (true); -- Simplificado por ahora
