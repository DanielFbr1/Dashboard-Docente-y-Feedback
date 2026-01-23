# 🚀 Guía de Despliegue y Configuración (Supabase + Vercel)

Sigue estos pasos para llevar tu aplicación a producción de forma segura.

## 1. Configuración de Supabase (Backend)

1.  Crea una cuenta en [supabase.com](https://supabase.com).
2.  Crea un **Nuevo Proyecto**.
3.  Establece una contraseña segura para la base de datos.
4.  Espera a que se inicie el proyecto.

### A. Base de Datos
1.  Ve al **SQL Editor** en el menú izquierdo.
2.  Crea una "New query".
3.  Copia y pega TODO el contenido del archivo `supabase/schema.sql` (que te he generado en la carpeta del proyecto).
4.  Dale a **Run**.
    *   *Esto creará las tablas `proyectos`, `grupos`, `mensajes_chat`, `profiles` y configurará la seguridad.*

### B. Edge Functions (Para la IA segura)
Necesitas instalar la CLI de Supabase en tu ordenador para desplegar la función.

1.  **Instalar CLI**:
    ```bash
    npm install -g supabase
    ```
2.  **Login**:
    ```bash
    supabase login
    ```
3.  **Desplegar**:
    Desde la carpeta raíz del proyecto, ejecuta:
    ```bash
    supabase functions deploy ask-gemini --project-ref tu-project-id
    ```
    *(El `project-ref` lo encuentras en la URL de tu dashboard de Supabase: `app.supabase.com/project/ESTE-ES-EL-ID`)*

4.  **Configurar Secretos (API Key de Google)**:
    Para que la función pueda llamar a Google Gemini, debes guardar la llave en Supabase (no en el código):
    ```bash
    supabase secrets set GEMINI_API_KEY=tu-api-key-de-google-aqui --project-ref tu-project-id
    ```

## 2. Configuración del Frontend

### A. Variables de Entorno
Crea un archivo `.env` en la raíz de tu proyecto (copia `.env.example` si existe) y añade las claves de Supabase.

Las encuentras en Supabase > **Project Settings** > **API**.

```env
VITE_SUPABASE_URL=https://tu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-larga-y-publica
```

*Nota: La `ANON_KEY` es segura de poner en el frontend si tienes las Row Level Security (RLS) activadas (que ya lo hicimos en el SQL).*

## 3. Despliegue en Vercel (Frontend)

1.  Sube tu código a GitHub/GitLab.
2.  Ve a [vercel.com](https://vercel.com) e inicia sesión.
3.  "Add New..." > "Project" > Importa tu repositorio.
4.  En la configuración del proyecto en Vercel, busca la sección **Environment Variables**.
5.  Añade las mismas variables que en tu `.env`:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
6.  Dale a **Deploy**.

## ¡Listo! 🎉
Tu aplicación ahora tiene:
*   ✅ Usuarios reales (Email/Password).
*   ✅ Datos persistentes en la nube.
*   ✅ Chat con IA seguro (tu API Key no es visible para los alumnos).
