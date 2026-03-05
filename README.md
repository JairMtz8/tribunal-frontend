# TUJPA — Sistema de Gestión Judicial para Adolescentes

Frontend del sistema de gestión del **Tribunal para Adolescentes**, desarrollado como proyecto de estadía profesional. Permite administrar procesos judiciales, carpetas, audiencias, medidas cautelares y sancionadoras, ejecución de medidas y reportes estadísticos.

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| React 18 | Framework UI |
| Vite 5 | Build tool y servidor de desarrollo |
| Tailwind CSS 3 | Estilos |
| React Router v6 | Enrutamiento |
| Axios | Comunicación con la API |
| Zustand | Manejo de estado (autenticación) |
| React Hook Form + Yup | Formularios y validación |
| Recharts | Gráficas del módulo de reportes |
| Lucide React | Iconografía |
| React Hot Toast | Notificaciones |

---

## Módulos del sistema

- **Adolescentes** — Registro y gestión de expedientes
- **Procesos** — Seguimiento de procesos judiciales
- **Carpetas** — CJ, CJO, CEMCI y CEMS
- **Audiencias** — Programación y seguimiento de diligencias
- **Medidas Cautelares** — Aplicación y seguimiento
- **Medidas Sancionadoras** — Aplicación de sanciones
- **Ejecución** — Condenas, internamiento y libertad asistida
- **Reportes y Estadísticas** — Dashboard con 5 secciones: Panel General, Incidencia Delictiva, Perfil del Imputado, Seguimiento Judicial y Tendencia Temporal
- **Catálogos** — Administración de tablas de referencia

---

## Requisitos

- Node.js 18+
- Backend TUJPA corriendo en `http://localhost:3000`

---

## Instalación y uso

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Sistema Tribunal Adolescentes
VITE_APP_VERSION=1.0.0
```

---

## Roles disponibles

| Rol | Acceso |
|---|---|
| Administrador | Acceso completo a todos los módulos |
| Juzgado | Procesos, carpetas, audiencias, medidas, reportes |
| CEMCI | Procesos, carpetas CEMCI, adolescentes |
| CEMS | Procesos, carpetas CEMS, adolescentes |
| Juzgado Ejecución | Módulo de ejecución de medidas |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── common/        # Button, Input, Select, InfoField
│   └── layout/        # Layout, Navbar, Sidebar
├── pages/             # Páginas organizadas por módulo
├── routes/            # AppRoutes, ProtectedRoute
├── services/          # Capa de comunicación con la API
├── store/             # Estado global (Zustand)
└── utils/             # Utilidades generales
```
