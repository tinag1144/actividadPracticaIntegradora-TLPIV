# Actividad Práctica Integradora — Taller de Lenguaje de Programación IV

**Modalidad:** grupal, **3 integrantes por grupo** · **Entrega final:** 29-09-2026 / 12:50pm

---

## 1. Objetivo

Desarrollar una aplicación web full stack **básica**, escrita íntegramente en **TypeScript**, que integre los contenidos de la materia:

- Programación Orientada a Objetos (clases, interfaces, encapsulamiento, herencia/composición).
- Principios SOLID.
- Patrones de diseño **Singleton**, **Factory**, **Adapter** y **Observer**.
- Contenedores con **Docker** y **Docker Compose**.

El foco del trabajo **no** es la cantidad de funcionalidades ni el diseño visual, sino que la arquitectura esté bien resuelta y que ambos integrantes puedan explicar cada decisión.

---

## 2. Stack obligatorio

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend | Node.js + Express + TypeScript |
| Base de datos + ODM/ORM |  **PostgreSQL con Sequelize** o **MongoDB con Mongoose**, a elección del grupo |
| Infraestructura | Docker + Docker Compose |

**Configuración de TypeScript:** `"strict": true` en backend y frontend. No se permite el uso de `any` salvo casos justificados con un comentario.

### 2.1 Librerías permitidas

> ⚠️ **Solo se aceptan las librerías vistas en clase.** Cualquier dependencia que no figure en esta lista invalida el requisito que resuelve. Ante la duda, **consultar con la cátedra antes** de instalarla. Los `package.json` de backend y frontend se revisan en la corrección.

| Proyecto | Dependencias | Dependencias de desarrollo |
|---|---|---|
| Backend | `express`, `cors`, `dotenv`, `jsonwebtoken`, `bcrypt`, `sequelize` + `pg` **o** `mongoose` | `typescript`, `tsx` o `ts-node-dev`, `@types/*` |
| Frontend | `react`, `react-dom`, `react-router` | `typescript`, `vite`, `@vitejs/plugin-react`, `@types/*` |

Las peticiones HTTP desde el frontend se hacen con `fetch` nativo. Tampoco se permiten contenedores de inyección de dependencias ni librerías que implementen los patrones pedidos: los cuatro patrones se implementan a mano.

---

## 3. Descripción general

Cada grupo elige **un dominio** de la lista. En todos los casos la aplicación gira alrededor de un **recurso principal** que tiene un **estado**. Los usuarios pueden **suscribirse** a un recurso y, **cada vez que el estado del recurso cambia, todos sus suscriptores reciben una notificación**.

### 3.1 Dominios disponibles

| Dominio | Recurso principal | Estados posibles |
|---|---|---|
| A. Mesa de ayuda | Ticket | `ABIERTO`, `EN_PROGRESO`, `RESUELTO`, `CERRADO` |
| B. Eventos | Evento | `PROGRAMADO`, `REPROGRAMADO`, `CANCELADO`, `FINALIZADO` |
| C. Biblioteca | Libro | `DISPONIBLE`, `PRESTADO`, `EN_REPARACION` |
| D. Tienda | Producto | `DISPONIBLE`, `SIN_STOCK`, `DISCONTINUADO` |

El recurso debe tener, como mínimo, un identificador, un título o nombre, una descripción, un estado y las fechas de creación y actualización. El grupo puede agregar los atributos que considere necesarios.

> En este documento se usa la palabra **"recurso"** para referirse genéricamente a Ticket, Evento, Libro o Producto según el dominio elegido. Los ejemplos de código y carpetas usan el dominio A (Ticket).

---

## 4. Requisitos funcionales

**RF1 — Autenticación.** Registro de usuarios y login con email y contraseña. Las contraseñas se almacenan hasheadas con `bcrypt`. La sesión se maneja con **JWT**.

**RF2 — Roles y permisos.** Cada usuario tiene un rol, y cada rol tiene un conjunto de permisos. Los permisos se expresan como `recurso:accion`. Roles y permisos se cargan mediante un **seed** (no se pide ABM de roles ni de permisos). Todo usuario nuevo se registra con el rol `usuario`.

| Permiso | admin | operador | usuario |
|---|:---:|:---:|:---:|
| `recurso:read` | ✔ | ✔ | ✔ |
| `recurso:create` | ✔ | ✔ | |
| `recurso:update` | ✔ | ✔ | |
| `recurso:change-status` | ✔ | ✔ | |
| `recurso:delete` | ✔ | | |
| `subscription:create` | ✔ | ✔ | ✔ |
| `subscription:delete` | ✔ | ✔ | ✔ |
| `notification:read` | ✔ | ✔ | ✔ |
| `user:read` | ✔ | | |
| `user:assign-role` | ✔ | | |

Reemplazar `recurso` por el nombre del dominio elegido (por ejemplo, `ticket:create`).

**La validación de permisos se realiza en el backend.** Ocultar botones en el frontend es un complemento, no la protección: un endpoint sin permiso debe responder `403` aunque se lo invoque directamente desde Postman o `curl`.

**RF3 — Gestión del recurso.** Listar, ver detalle, crear, editar, cambiar estado y eliminar, según los permisos del rol.

**RF4 — Suscripciones.** Un usuario puede suscribirse y desuscribirse de un recurso. Las suscripciones se guardan en la base de datos.

**RF5 — Notificaciones.** Cuando un recurso cambia de estado, cada suscriptor recibe una notificación por **dos canales**:

1. **In-app:** la notificación se guarda en la base de datos con su estado leída / no leída.
2. **Consola:** la notificación se muestra como una línea de texto en la consola del backend (ver Adapter, sección 5.2).

El usuario puede ver su bandeja de notificaciones y marcarlas como leídas. El frontend muestra un contador de notificaciones no leídas; se acepta actualizarlo por *polling* cada algunos segundos.

**RF6 — Administración de usuarios.** El administrador puede listar usuarios y asignarles un rol.

---

## 5. Requisitos de diseño

### 5.1 Arquitectura en capas (backend)

El backend respeta este flujo (ver estructura de carpetas en la sección 8.2):

```
routes  →  controllers  →  services  →  repositories  →  base de datos
```

- **Controllers:** reciben la request, validan la entrada y devuelven la respuesta. No contienen lógica de negocio.
- **Services:** contienen la lógica de negocio. No conocen Express (no reciben `req` ni `res`).
- **Repositories:** único punto de acceso a la base de datos (a los modelos de Sequelize o Mongoose). Cada repositorio se define primero como **interfaz** y luego se implementa.

Las dependencias se inyectan **por constructor**, y todos los objetos se crean y conectan en un único lugar: `src/main.ts` (*composition root*).

### 5.2 Patrones de diseño obligatorios

Los cuatro patrones participan de **un mismo flujo**: el cambio de estado de un recurso.

```
TicketService.changeStatus()
   └─> EventPublisher.notify(evento)                     ← Observer (Subject)
         └─> NotificationService.update(evento)          ← Observer (Observer)
               ├─ consulta suscriptores al repositorio   ← usa DatabaseConnection (Singleton)
               └─ NotifierFactory.create('inapp')        ← Factory
                  NotifierFactory.create('console')
                        └─ ConsoleNotifierAdapter        ← Adapter
                              └─ console.log
```

**Singleton — `DatabaseConnection`**
Clase que encapsula la conexión a la base de datos (la instancia de `Sequelize` o la conexión de `mongoose`). Debe tener constructor privado y un método estático `getInstance()`. La aplicación completa debe usar una única instancia.

**Observer — `ISubject`, `IObserver`, `EventPublisher`, `NotificationService`**
- Definir las interfaces `ISubject` (con `attach`, `detach` y `notify`) e `IObserver` (con `update`).
- `EventPublisher` implementa `ISubject`. El servicio del recurso lo recibe por constructor y lo invoca cuando cambia el estado.
- `NotificationService` implementa `IObserver` y se registra en el `EventPublisher` desde `main.ts`.
- **No se permite** resolver el patrón usando directamente `EventEmitter` de Node: la implementación debe ser propia.

> Hay dos niveles distintos que no deben confundirse: los **observers** son objetos del backend que reaccionan al evento; las **suscripciones** son datos persistidos que indican qué usuario sigue qué recurso. El `NotificationService` (observer) consulta las suscripciones para saber a quién notificar.

**Factory — `NotifierFactory`**
- Definir la interfaz `INotifier` con el método `send(notification: Notification): Promise<void>`.
- Implementar dos canales: `InAppNotifier` (guarda la notificación en la base de datos) y `ConsoleNotifierAdapter` (ver Adapter).
- `NotifierFactory` recibe un tipo de canal (`'inapp' | 'console'`) y devuelve el `INotifier` correspondiente. `NotificationService` no debe instanciar canales con `new`.

**Adapter — `ConsoleNotifierAdapter`**
La aplicación espera que todo canal cumpla `INotifier`: recibe un objeto `Notification` y devuelve una promesa. `console.log`, en cambio, recibe **texto** y no devuelve nada. El adapter hace de intermediario entre ambas formas.

- `ConsoleNotifierAdapter` implementa `INotifier`.
- Dentro de `send()`, transforma el objeto `Notification` en un texto legible y lo muestra con `console.log`. Por ejemplo:
  ```
  [NOTIFICACIÓN] Para: usuario@tp.com | Ticket #12 | Estado: ABIERTO → EN_PROGRESO
  ```
- `NotificationService` nunca llama a `console.log` directamente: solo conoce `INotifier`.

### 5.3 Principios SOLID

No se exige aplicar los cinco principios en todos los archivos, pero cada uno debe estar presente al menos una vez y **documentado** en `PATTERNS.md` (sección 7.2). Algunos lugares donde aparecen naturalmente:

| Principio | Dónde buscarlo |
|---|---|
| **S** — Responsabilidad única | Separación entre controllers, services y repositories |
| **O** — Abierto/cerrado | Agregar un canal de notificación nuevo sin modificar `NotificationService` |
| **L** — Sustitución de Liskov | Cualquier `INotifier` puede reemplazar a otro |
| **I** — Segregación de interfaces | Interfaces de repositorio chicas y específicas |
| **D** — Inversión de dependencias | Los services dependen de interfaces de repositorio, no de implementaciones |

---

## 6. Requisitos de Docker

**Mínimo (obligatorio):**
- Archivo `docker-compose.yml` en la raíz del repositorio que levante la base de datos elegida.
- Volumen para persistir los datos.
- Variables de entorno en un archivo `.env`, con un `.env.example` versionado. El `.env` real **no** se sube al repositorio.

**Valorado (suma puntos):**
- Backend y frontend también dentro de Docker Compose, cada uno con su `Dockerfile` dentro de su propia carpeta.
- `healthcheck` en el servicio de base de datos y `depends_on` con `condition: service_healthy` en el backend.
- El seed de roles, permisos y usuarios de prueba se ejecuta automáticamente al levantar.

**Criterio de aceptación:** la cátedra va a clonar el repositorio, copiar `.env.example` a `.env` y ejecutar `docker compose up --build`. Si con eso (más los pasos que indique el README) la aplicación no funciona, el trabajo se considera **no entregado** hasta su corrección.

---

## 7. Documentación a entregar

### 7.1 `README.md` del proyecto

Debe permitir que alguien que nunca vio el proyecto lo ejecute sin ayuda. Usar como base la plantilla del **Anexo A**.

### 7.2 `PATTERNS.md`

Para cada patrón y cada principio SOLID indicar:

1. En qué archivo(s) está aplicado (ruta completa).
2. Qué problema resuelve en este proyecto, en dos o tres oraciones.
3. Un fragmento breve de código que lo muestre.

---

## 8. Estructura del repositorio

### 8.1 Backend y frontend son proyectos independientes

Backend y frontend conviven en **un mismo repositorio de GitHub**, pero **no es un monorepo**: son dos proyectos separados, cada uno con su propio `package.json`, `tsconfig.json`, `node_modules`, `Dockerfile` y `.dockerignore`. En la raíz **no** hay `package.json` ni configuración de *workspaces*; solo lo que orquesta y documenta el conjunto.

```
tp-integrador-tlp4/
├── docker-compose.yml       ★
├── .env.example             ★
├── .gitignore
├── README.md                ★
├── PATTERNS.md              ★
├── backend/                 ★ proyecto independiente (ver 8.2)
└── frontend/                ★ proyecto independiente (ver 8.3)
```

### 8.2 Backend: estructura MVC (con capas de servicio y repositorio)

El backend sigue el esquema MVC, sumando las capas de servicio y repositorio. La **V** (vista) de MVC es el frontend en React; el backend solo expone JSON. Son **obligatorios** los archivos marcados con ★ (con esos nombres o equivalentes).

Los archivos de cada capa se pueden organizar de **dos maneras**. Cualquiera es válida; lo que se evalúa es que el grupo elija una y la respete en todo el proyecto.

#### Forma 1 — Una carpeta por tipo de archivo

Una carpeta `controllers/` con todos los controladores, una `services/` con todos los servicios, y así con cada capa.

```
backend/
├── Dockerfile
├── .dockerignore
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts                            ★ composition root
    ├── app.ts
    ├── config/
    │   └── env.ts
    ├── database/
    │   ├── DatabaseConnection.ts          ★ Singleton
    │   └── seed.ts
    ├── models/
    │   ├── User.ts
    │   ├── Role.ts
    │   ├── Permission.ts
    │   ├── Ticket.ts
    │   ├── Subscription.ts
    │   └── Notification.ts
    ├── repositories/
    │   ├── interfaces/
    │   │   ├── IUserRepository.ts
    │   │   ├── IRoleRepository.ts
    │   │   ├── ITicketRepository.ts
    │   │   ├── ISubscriptionRepository.ts
    │   │   └── INotificationRepository.ts
    │   ├── UserRepository.ts
    │   ├── RoleRepository.ts
    │   ├── TicketRepository.ts
    │   ├── SubscriptionRepository.ts
    │   └── NotificationRepository.ts
    ├── services/
    │   ├── AuthService.ts
    │   ├── UserService.ts
    │   ├── TicketService.ts                 usa EventPublisher
    │   ├── SubscriptionService.ts
    │   └── NotificationService.ts         ★ Observer
    ├── controllers/
    │   ├── AuthController.ts
    │   ├── UserController.ts
    │   ├── TicketController.ts
    │   ├── SubscriptionController.ts
    │   └── NotificationController.ts
    ├── routes/
    │   ├── auth.routes.ts
    │   ├── user.routes.ts
    │   ├── ticket.routes.ts
    │   ├── subscription.routes.ts
    │   └── notification.routes.ts
    ├── middlewares/
    │   ├── authenticate.ts
    │   ├── authorize.ts
    │   └── errorHandler.ts
    ├── observer/
    │   ├── ISubject.ts                    ★
    │   ├── IObserver.ts                   ★
    │   └── EventPublisher.ts              ★ Subject
    └── notifications/
        ├── INotifier.ts                   ★
        ├── InAppNotifier.ts
        ├── ConsoleNotifierAdapter.ts      ★ Adapter
        └── NotifierFactory.ts             ★ Factory
```

#### Forma 2 — Una carpeta por módulo

Una carpeta con el nombre de cada módulo (`users/`, `tickets/`, etc.), y dentro de ella su controlador, servicio, repositorio, modelo y rutas. Las capas son exactamente las mismas que en la Forma 1; solo cambia dónde se ubican los archivos. Las carpetas `config/`, `database/`, `middlewares/` y `observer/` quedan igual.

```
backend/src/
├── main.ts                                ★ composition root
├── app.ts
├── config/
├── database/                              ★ DatabaseConnection.ts (Singleton)
├── middlewares/
├── observer/                              ★ ISubject, IObserver, EventPublisher
└── modules/
    ├── auth/
    │   ├── AuthController.ts
    │   ├── AuthService.ts
    │   └── auth.routes.ts
    ├── users/
    │   ├── User.ts                          modelo
    │   ├── IUserRepository.ts
    │   ├── UserRepository.ts
    │   ├── UserService.ts
    │   ├── UserController.ts
    │   └── user.routes.ts
    ├── roles/
    ├── tickets/
    ├── subscriptions/
    └── notifications/
        ├── Notification.ts                  modelo
        ├── INotificationRepository.ts
        ├── NotificationRepository.ts
        ├── NotificationService.ts         ★ Observer
        ├── NotificationController.ts
        ├── notification.routes.ts
        ├── INotifier.ts                   ★
        ├── InAppNotifier.ts
        ├── ConsoleNotifierAdapter.ts      ★ Adapter
        └── NotifierFactory.ts             ★ Factory
```

Las carpetas `roles/`, `tickets/` y `subscriptions/` siguen el mismo esquema que `users/`.

### 8.3 Frontend

```
frontend/
├── Dockerfile
├── .dockerignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx                    definición de rutas
    ├── api/
    │   ├── client.ts              función base de fetch que agrega el token JWT
    │   ├── auth.api.ts
    │   ├── tickets.api.ts
    │   └── notifications.api.ts
    ├── context/
    │   └── AuthContext.tsx        usuario logueado y sus permisos
    ├── components/
    │   ├── ProtectedRoute.tsx     redirige si no hay sesión
    │   ├── Can.tsx                muestra hijos solo si hay permiso
    │   ├── Navbar.tsx
    │   └── NotificationBell.tsx   contador de no leídas
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── RegisterPage.tsx
    │   ├── TicketListPage.tsx
    │   ├── TicketDetailPage.tsx   botón suscribirse / desuscribirse
    │   ├── TicketFormPage.tsx
    │   ├── NotificationsPage.tsx
    │   └── AdminUsersPage.tsx
    └── types/
        └── index.ts
```

---

## 9. Organización del trabajo y commits

El avance del trabajo se sigue a través del **historial de commits** del repositorio.

- **Ambos integrantes deben tener commits propios y significativos** a lo largo de todo el desarrollo. Un integrante sin commits significativos no aprueba el trabajo.
- Se espera un historial **incremental**: muchos commits chicos a lo largo de las semanas. Un único commit con todo el proyecto, o todo el trabajo concentrado en los últimos días, se considera una señal de alerta y se indaga en la defensa.
- Los mensajes de commit deben describir qué se hizo (por ejemplo, `feat(auth): login con JWT`, `feat(notifications): ConsoleNotifierAdapter`). No se aceptan mensajes como `cambios`, `fix` o `asdf`.

### Orden de trabajo sugerido

Estas etapas son una guía; el historial de commits debería reflejar un recorrido similar.

1. **Base del proyecto:** estructura de carpetas, `docker-compose.yml` con la base de datos, backend conectado mediante `DatabaseConnection` (Singleton).
2. **Usuarios, roles y permisos:** seed, registro, login con JWT, middlewares `authenticate` y `authorize`, administración de usuarios.
3. **Recurso y suscripciones:** gestión completa del recurso en capas, suscribirse y desuscribirse.
4. **Notificaciones:** Observer, Factory y Adapter según la sección 5.2.
5. **Frontend y documentación:** interfaz con control por permisos, bandeja de notificaciones, `README.md`, `PATTERNS.md` y aplicación completa en Docker Compose.

---

## 10. Entrega

- Repositorio **público** en GitHub, con el link cargado en Classroom.
- Se evalúa el último commit anterior a la fecha de entrega, o el tag `v1.0` si existe.

---

## 11. Defensa oral

- Duración aproximada: 15 minutos por grupo.
- El grupo muestra el flujo completo: login con distintos roles, cambio de estado de un recurso, llegada de la notificación al usuario suscripto y la línea correspondiente en la consola del backend.
- La cátedra hace preguntas a **cualquiera de los dos integrantes sobre cualquier parte del proyecto**. Ambos deben poder explicar los cuatro patrones y los principios SOLID aplicados.
- Puede pedirse una modificación en vivo (por ejemplo, agregar un canal de notificación nuevo o un permiso nuevo).
- **La nota es individual**: el trabajo es grupal, pero cada integrante es evaluado según su desempeño en la defensa y su participación en el historial de commits.

---

## 12. Criterios de evaluación

| Criterio | Peso |
|---|:---:|
| Docker Compose y README (la app levanta siguiendo las instrucciones) | 15 % |
| Autenticación, roles y permisos (RF1, RF2, RF6) | 15 % |
| Funcionalidad del recurso y suscripciones (RF3, RF4) | 10 % |
| Patrones de diseño (Singleton, Factory, Adapter, Observer) | 30 % |
| POO, SOLID, arquitectura en capas y tipado con TypeScript | 15 % |
| Frontend (RF5 en la interfaz, control de acceso por permisos) | 10 % |
| `PATTERNS.md` | 5 % |

Los requisitos "valorados" de Docker suman hasta **1 punto adicional**.

### Condiciones que impiden aprobar

- La aplicación no levanta siguiendo el README.
- Uso de librerías no vistas en clase (sección 2.1).
- Alguno de los cuatro patrones ausente o resuelto con una librería.
- Backend y frontend configurados como monorepo o mezclados en una misma carpeta.

### Qué NO se pide

Para mantener el alcance básico, **no** se exige: tests automatizados, notificaciones en tiempo real (WebSockets o SSE), envío de emails, refresh tokens, ABM de roles y permisos, paginación, ni diseño visual elaborado. Cualquiera de estos puntos puede agregarse (respetando la sección 2.1), pero no compensa la falta de un requisito obligatorio.

---

## Anexo A — Plantilla del README a entregar

Copiar la siguiente plantilla en el `README.md` del proyecto y completarla.

````markdown
# [Nombre del proyecto]

**Dominio:** [A / B / C / D — nombre]
**Base de datos:** [PostgreSQL + Sequelize / MongoDB + Mongoose]
**Organización del backend:** [Carpeta por tipo de archivo / Carpeta por módulo]

## Integrantes
- Apellido, Nombre — usuario de GitHub
- Apellido, Nombre — usuario de GitHub

## Descripción
[Dos o tres oraciones sobre qué hace la aplicación.]

## Requisitos previos
- Docker y Docker Compose
- Git
- (Opcional, para desarrollo local) Node.js [versión]

## Cómo ejecutar el proyecto

1. Clonar el repositorio:
   ```bash
   git clone [url]
   cd [carpeta]
   ```
2. Crear el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
3. Levantar los servicios:
   ```bash
   docker compose up --build
   ```
4. [Si el seed no es automático, indicar el comando exacto.]
5. Abrir la aplicación:
   - Frontend: http://localhost:[puerto]
   - API: http://localhost:[puerto]/api

## Ejecución sin Docker (opcional)
[Pasos para correr backend y frontend por separado, cada uno desde su carpeta.]

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_HOST` | Host de la base de datos | `db` |
| `DB_PORT` | Puerto de la base de datos | `5432` / `27017` |
| `DB_USER` | Usuario | `tlp4` |
| `DB_PASSWORD` | Contraseña | `tlp4` |
| `DB_NAME` | Nombre de la base | `tp_integrador` |
| `JWT_SECRET` | Clave para firmar los tokens | `cambiar-esto` |
| `API_PORT` | Puerto del backend | `3000` |
| `VITE_API_URL` | URL de la API para el frontend | `http://localhost:3000/api` |

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@tp.com | [contraseña] |
| operador | operador@tp.com | [contraseña] |
| usuario | usuario@tp.com | [contraseña] |

## Cómo probar el flujo de notificaciones
1. Ingresar como `usuario` y suscribirse a un [recurso].
2. En otra ventana (o en incógnito), ingresar como `operador` y cambiar el estado de ese [recurso].
3. Volver a la sesión de `usuario`: la notificación aparece en la bandeja.
4. Verificar la notificación en la consola del backend:
   ```bash
   docker compose logs backend
   ```

## Endpoints principales

| Método | Ruta | Permiso requerido |
|---|---|---|
| POST | /api/auth/register | — |
| POST | /api/auth/login | — |
| GET | /api/[recursos] | [recurso]:read |
| ... | ... | ... |

## Patrones y principios SOLID
Ver [PATTERNS.md](./PATTERNS.md).
````