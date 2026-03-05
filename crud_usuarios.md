● Aquí tienes el documento:
                                                                                                                                                                                                      
  ---
  API - Gestión de Usuarios (Solo Administrador)                                                                                                                                                      
                                                                                                                                                                                                        Base URL: http://localhost:{PORT}/api/auth                                                                                                                                                          
                                                                                                                                                                                                      
  Todas las rutas de administración requieren el header:
  Authorization: Bearer <token>
  El token se obtiene al hacer login. El usuario debe tener el rol Administrador.

  ---
  Autenticación

  Login

  POST /api/auth/login
  Body:
  {
    "usuario": "admin",
    "contrasena": "tu_contrasena"
  }
  Respuesta:
  {
    "success": true,
    "data": {
      "usuario": { "id_usuario": 1, "nombre": "Admin", "rol_nombre": "Administrador", ... },
      "token": "eyJhbGciOiJIUzI1NiIs..."
    },
    "message": "Login exitoso"
  }

  ---
  CRUD de Usuarios

  Crear usuario

  POST /api/auth/register
  Body:
  {
    "nombre": "Juan Pérez",
    "usuario": "juan_perez",
    "correo": "juan@example.com",
    "contrasena": "minimo6",
    "rol_id": 2
  }
  correo es opcional. contrasena mínimo 6 caracteres. usuario solo letras, números y guiones bajos.

  ---
  Listar usuarios

  GET /api/auth/users
  Query params opcionales:

  ┌────────┬─────────┬─────────────────────────────┐
  │ Param  │  Tipo   │         Descripción         │
  ├────────┼─────────┼─────────────────────────────┤
  │ rol_id │ number  │ Filtrar por rol             │
  ├────────┼─────────┼─────────────────────────────┤
  │ activo │ boolean │ true o false                │
  ├────────┼─────────┼─────────────────────────────┤
  │ search │ string  │ Buscar por nombre o usuario │
  └────────┴─────────┴─────────────────────────────┘

  Ejemplo: GET /api/auth/users?activo=true&search=juan

  ---
  Obtener usuario por ID

  GET /api/auth/users/:id
  Ejemplo: GET /api/auth/users/5

  ---
  Actualizar usuario

  PUT /api/auth/users/:id
  Body (todos los campos son opcionales):
  {
    "nombre": "Juan Actualizado",
    "correo": "nuevo@email.com",
    "activo": true
  }

  ---
  Activar usuario

  POST /api/auth/users/:id/activate
  No requiere body.

  ---
  Desactivar usuario

  POST /api/auth/users/:id/deactivate
  No requiere body. No puedes desactivarte a ti mismo.

  ---
  Eliminar usuario

  DELETE /api/auth/users/:id
  No puedes eliminarte a ti mismo.

  ---
  Perfil propio (cualquier usuario autenticado)

  Ver mi perfil

  GET /api/auth/me

  Actualizar mi perfil

  PUT /api/auth/me
  Body (opcionales): nombre, correo

  Cambiar mi contraseña

  POST /api/auth/change-password
  Body:
  {
    "contrasena_actual": "actual123",
    "contrasena_nueva": "nueva123"
  }

  ---
  Respuesta de error típica

  {
    "success": false,
    "message": "Acceso denegado. Se requiere uno de estos roles: Administrador",
    "statusCode": 403
  }