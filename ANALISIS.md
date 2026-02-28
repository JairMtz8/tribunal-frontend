# Análisis del Proyecto: Tribunal Frontend

> Sistema de Gestión Judicial para el Tribunal Unitario para Adolescentes (TUJPA)
> Fecha de análisis: 26 de febrero de 2026

---

## 1. Descripción General

Aplicación web SPA (Single Page Application) desarrollada para gestionar procesos judiciales de adolescentes en el Tribunal Unitario para Adolescentes (TUJPA). Permite el registro, seguimiento y control de expedientes, carpetas judiciales, medidas cautelares y sancionadoras, con control de acceso basado en roles.

---

## 2. Stack Tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework UI | React | 18.2.0 |
| Bundler | Vite | 5.0.8 |
| Estilos | TailwindCSS | 3.3.6 |
| Enrutamiento | React Router DOM | 6.21.0 |
| Estado global | Zustand | 4.4.7 |
| Formularios | React Hook Form + Yup | 7.49.2 / 1.3.3 |
| HTTP Client | Axios | 1.6.2 |
| Notificaciones | React Hot Toast | 2.4.1 |
| Iconos | Lucide React | 0.563.0 |
| Fechas | date-fns | 2.30.0 |
| Utilidades CSS | clsx | 2.0.0 |

---

## 3. Estructura del Proyecto

```
tribunal-frontend/
├── public/
├── src/
│   ├── assets/
│   │   ├── react.svg
│   │   └── tujpa-logo.png
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── InfoField.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Select.jsx
│   │   └── layout/
│   │       ├── Layout.jsx
│   │       ├── Navbar.jsx
│   │       └── Sidebar.jsx
│   ├── pages/
│   │   ├── adolescentes/
│   │   ├── auth/
│   │   ├── catalogos/
│   │   ├── cemci/
│   │   ├── cems/
│   │   ├── cj/
│   │   ├── cjo/
│   │   ├── dashboard/
│   │   ├── medidas-cautelares/
│   │   ├── medidas-sancionadoras/
│   │   └── procesos/
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── actorService.js
│   │   ├── adolescenteService.js
│   │   ├── authService.js
│   │   ├── calificativaService.js
│   │   ├── catalogoService.js
│   │   ├── cemciService.js
│   │   ├── cemsService.js
│   │   ├── cjConductaService.js
│   │   ├── cjoService.js
│   │   ├── cjService.js
│   │   ├── conductaService.js
│   │   ├── medidaCautelarService.js
│   │   ├── medidaSancionadoraService.js
│   │   ├── procesoService.js
│   │   ├── statusService.js
│   │   └── tipoMedidaCautelarService.js
│   ├── store/
│   │   └── useAuthStore.js
│   └── utils/
│       ├── constants.js
│       ├── formatters.js
│       └── textTransform.js
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

---

## 4. Módulos del Sistema

### 4.1 Autenticación (`/auth`)
- Login con JWT
- Rutas protegidas mediante `ProtectedRoute`
- Redirección automática a `/dashboard` si ya está autenticado
- Sesión persistida en `localStorage` vía Zustand + middleware `persist`

### 4.2 Dashboard (`/dashboard`)
- Pantalla de bienvenida con logo TUJPA
- Reloj en tiempo real
- Tarjetas de estado del sistema
- Módulos accesibles filtrados según el rol del usuario autenticado

### 4.3 Adolescentes (`/adolescentes`)
- Listado, creación, edición y detalle de expedientes de adolescentes
- Campos: datos personales, sexo, estado civil, fecha de nacimiento

### 4.4 Procesos (`/procesos`)
- Gestión de procesos judiciales asociados a adolescentes
- Campos: tipo de fuero (Común / Federal), estado procesal, conductas

### 4.5 Carpetas Judiciales (`/carpetas`)
Cuatro tipos de carpetas con CRUD completo:

| Tipo | Ruta | Descripción |
|---|---|---|
| **CJ** | `/carpetas/cj` | Carpeta Judicial – con asignación de actores |
| **CJO** | `/carpetas/cjo` | Carpeta Judicial de Orientación |
| **CEMCI** | `/carpetas/cemci` | Centro de Ejecución de Medidas Cautelares de Internamiento |
| **CEMS** | `/carpetas/cems` | Centro de Ejecución de Medidas Sancionadoras |

CJ incluye una vista especial de asignación de actores (`/carpetas/cj/:id/asignar-actores`).

### 4.6 Medidas Cautelares (`/medidas-cautelares`)
- Listado de procesos con medidas cautelares
- Aplicar medida a un proceso (`/:procesoId/aplicar`)
- Ver medidas activas de un proceso (`/:procesoId/ver`)

### 4.7 Medidas Sancionadoras (`/medidas-sancionadoras`)
- CRUD completo de medidas sancionadoras
- Vista de detalle de medidas por proceso (`/proceso/:proceso_id`)

### 4.8 Catálogos (`/catalogos`) — Solo Administrador
- Conductas (Delitos)
- Calificativas del Delito
- Estados Procesales
- Tipos de Medidas Cautelares
- Tipos de Medidas Sancionadoras
- Tipos de Reparación
- Roles

Los catálogos genéricos usan componentes reutilizables (`ListaCatalogo`, `FormularioCatalogo`).

---

## 5. Control de Acceso (RBAC)

El sistema implementa control de acceso basado en roles (Role-Based Access Control). Roles definidos:

| Rol | Dashboard | Adolescentes | Procesos | Carpetas | Medidas | Catálogos |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Administrador | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Juzgado | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| CEMCI | ✅ | ✅ | ✅ | CJ/CJO/CEMCI | Cautelares | ❌ |
| CEMS | ✅ | ✅ | ✅ | CJ/CJO/CEMS | Sancionadoras | ❌ |

El sidebar filtra dinámicamente los ítems de menú según el rol del usuario autenticado.

---

## 6. Arquitectura y Patrones

### Capa de Servicios
Todos los llamados HTTP están centralizados en `/services`. La instancia de Axios (`api.js`) incorpora:
- **Request interceptor**: inyecta el token JWT en cada petición
- **Response interceptor**: manejo global de errores HTTP (401, 403, 404, 409, 500)
- Redirección automática a `/login` ante token inválido/expirado (401)

### Estado Global
Zustand con `persist` middleware gestiona la sesión del usuario. Expone:
- `login(user, token)` — guarda sesión
- `logout()` — limpia sesión
- `hasRole(role)` / `hasAnyRole(roles)` — helpers de autorización

### Formularios
React Hook Form + Yup para validación declarativa. Los componentes `Input` y `Select` de `/components/common` encapsulan la integración con el hook.

### Notificaciones
React Hot Toast configurado globalmente en `AppRoutes.jsx` (posición top-right, temas de éxito/error).

---

## 7. Utilidades

### `formatters.js`
| Función | Descripción |
|---|---|
| `formatDate(date)` | `DD/MM/YYYY` |
| `formatDateTime(date)` | `DD/MM/YYYY HH:mm` |
| `formatRelativeDate(date)` | "hace 2 días" |
| `calculateAge(birthDate)` | Edad en años |
| `formatCurrency(amount)` | Formato MXN |
| `formatPhone(phone)` | `(777) 123-4567` |
| `formatInitials(nombre)` | Iniciales del nombre |
| `getEstadoColor(estado)` | Color por estado procesal |

### `constants.js`
Exporta constantes del dominio: `ROLES`, `STATUS_PROCESO`, `TIPO_FUERO`, `TIPO_CARPETA`, `SEXO`, `ESTADO_CIVIL`, `TIPO_MEDIDA`, `PAGINATION`.

---

## 8. Rutas Totales

El sistema registra **40+ rutas** organizadas jerárquicamente bajo una ruta raíz protegida:

```
/login                                  → Público
/dashboard                              → Protegido
/adolescentes                           → CRUD (4 rutas)
/procesos                               → CRUD (4 rutas)
/carpetas/cj                            → CRUD + asignar actores (4 rutas)
/carpetas/cjo                           → CRUD (4 rutas)
/carpetas/cemci                         → CRUD (3 rutas)
/carpetas/cems                          → CRUD (3 rutas)
/medidas-sancionadoras                  → CRUD + vista por proceso (5 rutas)
/medidas-cautelares                     → Listado + aplicar + ver (3 rutas)
/catalogos/:tipo                        → CRUD genérico (3 rutas)
/catalogos/conductas                    → CRUD específico (3 rutas)
/catalogos/calificativas                → CRUD específico (3 rutas)
*                                       → 404 inline
```

---

## 9. Estado Actual del Desarrollo

Según el historial de commits:

| Módulo | Estado |
|---|---|
| Autenticación | ✅ Completo |
| Dashboard | ✅ Completo |
| Adolescentes | ✅ Completo |
| Procesos | ✅ Completo |
| Carpetas CJ | ✅ Completo |
| Carpetas CJO | ✅ Completo (~90%) |
| Carpetas CEMCI | ✅ Completo |
| Carpetas CEMS | ✅ Completo |
| Medidas Sancionadoras | ✅ Completo |
| Medidas Cautelares | 🔄 En progreso |
| Audiencias | ⏳ Pendiente (ruta en sidebar, sin página) |
| Reportes | ⏳ Pendiente (ruta en sidebar, sin página) |
| Configuración | ⏳ Pendiente (ruta en sidebar, sin página) |
| Catálogos | ✅ Completo |

---

## 10. Puntos de Atención

1. **Módulos sin implementar**: Audiencias, Reportes y Configuración aparecen en el sidebar pero no tienen páginas asociadas — generarán error 404 si se navega a ellos.
2. **Token duplicado**: el token se guarda tanto en `localStorage` directamente como en el store de Zustand. Existe redundancia que podría simplificarse.
3. **Sidebar no responsivo en mobile**: el estado `sidebarOpen` se gestiona en `Layout.jsx` pero la lógica de traducción CSS del sidebar no aplica la clase `translate-x-0`/`-translate-x-full` condicionalmente; el sidebar es siempre visible en desktop.
4. **Dashboard sin datos reales**: Las tarjetas de estadísticas muestran valores estáticos ("Activo", "Conectado") — no consume datos de la API.
5. **Sin manejo de roles en el backend**: La restricción de acceso por rol solo se aplica en el frontend (sidebar y módulos visibles). Si se accede a una URL directamente, no hay validación de rol en `ProtectedRoute`.

---

## 11. Configuración

- **API Base URL**: configurable por variable de entorno `VITE_API_URL` (default: `http://localhost:3000/api`)
- **Timeout HTTP**: 10,000 ms
- **Versión del sistema**: v1.0.0

---

*Generado automáticamente — tribunal-frontend*
