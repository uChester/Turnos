# Barbería: reservas con PostgreSQL

## Preparación de la base

1. Crea un proyecto/base PostgreSQL administrada en el proveedor elegido.
2. Copia la URL de conexión que muestra su panel (normalmente empieza con `postgresql://`).
3. Copia `.env.example` como `.env` y pega esa URL en `DATABASE_URL`.
4. Ejecuta el esquema una sola vez:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

La tabla `reservas` tiene `UNIQUE (fecha, hora)`. PostgreSQL rechazará una segunda reserva para el mismo horario, incluso cuando dos usuarios confirmen al mismo tiempo.

Para publicar el proyecto, configura `DATABASE_URL`, `DATABASE_SSL=true` y `PORT` como variables de entorno secretas en el panel de hosting. No subas el archivo `.env` ni la contraseña al repositorio.

## Desarrollo

En una terminal, inicia la API:

```bash
npm run dev:api
```

En otra terminal, inicia la interfaz:

```bash
npm run dev
```

Vite envía las rutas `/api` al servidor en el puerto `3001`.

## Producción

```bash
npm run build
npm start
```

El servidor Express publica los archivos de `dist` y la API en el mismo origen.
# Turnos
