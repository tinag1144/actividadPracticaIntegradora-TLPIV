# Tech Store

Trabajo práctico integrador de Taller de Lenguaje de Programación IV. Tech Store es una aplicación web para gestionar el catálogo de una tienda de tecnología. Cada producto tiene nombre, descripción, categoría, precio, stock y uno de tres estados: disponible, sin stock o discontinuado.

Los usuarios pueden suscribirse a un producto. Cuando cambia su estado, cada suscriptor recibe una notificación en su bandeja y se registra una línea en la consola del backend. La bandeja muestra un contador de notificaciones sin leer. Los permisos del rol determinan quién puede crear, editar, cambiar de estado o eliminar productos y quién puede administrar usuarios.

## Integrantes y responsabilidades

| Integrante | GitHub | Aportes |
| --- | --- | --- |
| Selena Britez | `sbrittz` | Modelos y repositorios de productos y suscripciones, lógica de persistencia de suscripciones y publicación de eventos mediante Observer. |
| Diego García | `dot-Hawk` | Registro e inicio de sesión con JWT, roles y permisos, administración de usuarios, conexión a MongoDB, seed y Docker Compose. También desarrolló la base del frontend para autenticación, navegación y administración. |
| Agostina Gonzalez | `tinag1144` | Completó la API de productos y suscripciones e integró el flujo de notificaciones. Desarrolló las pantallas del catálogo, detalle, formularios, suscripciones y bandeja con contador, sobre la base del frontend existente. |

## Desarrollo

El repositorio contiene dos proyectos TypeScript independientes, con su propio `package.json` y TypeScript en modo estricto:

- [`backend/`](backend/) usa Node.js, Express y MongoDB con Mongoose. Las rutas delegan en controladores, que llaman a servicios y repositorios. [`main.ts`](backend/src/main.ts) conecta las dependencias y registra el observador de notificaciones.
- [`frontend/`](frontend/) usa React, React Router y Vite. Consume la API con `fetch`, agrega el JWT a las peticiones y muestra acciones según los permisos del usuario. La API valida esos permisos en cada ruta protegida.

La conexión a MongoDB usa Singleton. Al cambiar el estado de un producto, el servicio publica un evento mediante Observer. El servicio de notificaciones consulta las suscripciones y usa Factory para obtener los canales de bandeja y consola. El canal de consola usa Adapter para convertir cada notificación en una línea de texto.

## Cómo ejecutar el proyecto

Necesitás Git y Docker con Docker Compose. Para el modo desarrollo también necesitás Node.js 24 y npm. En Windows, si PowerShell bloquea el script de npm, usá `npm.cmd` en lugar de `npm`.

### 1. Clonar el repositorio

```bash
git clone https://github.com/tinag1144/actividadPracticaIntegradora-TLPIV.git
cd actividadPracticaIntegradora-TLPIV
```

### 2. Preparar el entorno

Desde la raíz, creá `.env` a partir de `.env.example`. Si ya tenés un archivo `.env`, conservá tu configuración.

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

En Bash, el comando equivalente es `[ -f .env ] || cp .env.example .env`. Los valores de ejemplo están pensados para desarrollo local. Los archivos `.env` quedan fuera de Git.

### 3. Elegir cómo arrancar

#### Desarrollo con npm

Desde la raíz, prepará `backend/.env` y levantá solo MongoDB. El backend lee su `.env` desde la carpeta donde corrés los scripts. En Bash usá `[ -f backend/.env ] || cp .env backend/.env`.

```powershell
if (-not (Test-Path backend/.env)) { Copy-Item .env backend/.env }
docker compose up -d --wait db
```

En una terminal, desde la raíz, instalá las dependencias del backend, cargá el seed e iniciá la API:

```bash
cd backend
npm ci
npm run seed
npm run dev
```

En una segunda terminal, también desde la raíz, instalá las dependencias del frontend e iniciá Vite:

```bash
cd frontend
npm ci
npm run dev
```

El seed carga los roles, permisos y usuarios de prueba. Ejecutalo al preparar la base por primera vez o cuando cambie la definición de permisos. Para volver a arrancar una base ya inicializada, corré `npm run dev` en ambas terminales.

#### Aplicación completa en Docker

Desde la raíz, con el `.env` preparado:

```bash
docker compose up --build
```

Compose levanta MongoDB, la API y el frontend. El backend ejecuta el seed automáticamente al arrancar. Elegí un solo modo de ejecución a la vez porque ambos usan los puertos 3000 y 5173.

En cualquiera de los dos modos, abrí la [aplicación en el puerto 5173](http://localhost:5173). Podés comprobar que la [API responde en el puerto 3000](http://localhost:3000/api/health).

### Variables principales

| Variable | Uso | Valor de ejemplo |
| --- | --- | --- |
| `DB_PORT` | Puerto de MongoDB publicado por Docker | `27018` |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Configuración de la base de desarrollo | Ver `.env.example` |
| `MONGO_URI` | Conexión del backend en modo npm. Compose arma su propia URI para el contenedor | Ver `.env.example` |
| `PORT` | Puerto de la API | `3000` |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Firma y vigencia de los JWT | Clave local, `1h` |
| `CORS_ORIGIN` | Origen del frontend permitido por la API | `http://localhost:5173` |
| `FRONTEND_PORT` | Puerto publicado por Docker para el frontend | `5173` |
| `VITE_API_URL` | URL de la API. En modo npm, Vite usa el valor local por defecto o el que definas en `frontend/.env` | `http://localhost:3000/api` |

## Usuarios de prueba

| Rol | Email | Contraseña |
| --- | --- | --- |
| Administrador | `admin@tp.com` | `Admin123!` |
| Operador | `operador@tp.com` | `Operador123!` |
| Usuario | `usuario@tp.com` | `Usuario123!` |

### Probar las notificaciones

1. Ingresá como **operador** y creá un producto con estado **Disponible**.
2. En una ventana de incógnito, ingresá como **usuario**, abrí el producto y seleccioná **Suscribirme**.
3. Volvé a la sesión del operador y cambiá el estado a **Sin stock**.
4. En la sesión del usuario, abrí **Notificaciones** y marcá la notificación como leída. El contador debería actualizarse al marcarla. Para las notificaciones nuevas, el contador se consulta cada 15 segundos.
5. Revisá la salida en la terminal del backend. Si usás Compose para toda la aplicación, consultala con `docker compose logs backend`.

## Endpoints principales

| Método | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/api/auth/register`, `/api/auth/login` | Público |
| `GET` | `/api/auth/me` | Usuario autenticado |
| `GET` | `/api/products`, `/api/products/:id` | `product:read` |
| `POST` | `/api/products` | `product:create` |
| `PATCH` | `/api/products/:id` | `product:update` |
| `PATCH` | `/api/products/:id/status` | `product:change-status` |
| `DELETE` | `/api/products/:id` | `product:delete` |
| `GET` | `/api/products/:id/subscription` | `product:read` |
| `POST`, `DELETE` | `/api/products/:id/subscription` | `subscription:create`, `subscription:delete`, respectivamente |
| `GET` | `/api/notifications`, `/api/notifications/unread-count` | `notification:read` |
| `PATCH` | `/api/notifications/:id/read` | `notification:read` |
| `GET` | `/api/users` | `user:read` |
| `PATCH` | `/api/users/:id/role` | `user:assign-role` |

## Verificar cambios

Desde la raíz, después de instalar las dependencias:

```bash
npm --prefix backend run typecheck
npm --prefix frontend run build
```

