# Proyecto Integrador Anual - Actividad 4 (2026)
EEST N1 "Eduardo Ader" - 7mo 2da

## Descripcion
Aplicacion web de organizacion personal con autenticacion de usuarios.

Incluye:
- Calendario interactivo con seleccion de dia.
- Alta de actividades en modal.
- Listado diario de tareas con filtros por estado.
- Marcado de tareas como hechas y eliminacion.
- Vista de 5 tareas mas cercanas.
- Calculadora con historial por usuario.
- Tema claro/oscuro persistente en toda la app.

## Stack tecnologico
- Backend: PHP (estilo funcional, sin POO)
- Base de datos: MySQL/MariaDB
- Frontend: HTML, CSS, JavaScript (vanilla)
- Servidor local recomendado: XAMPP (Apache + MySQL)

## Arquitectura
El proyecto usa una separacion por capas simple:
- Presentacion: `index.html`, `frontend/dashboard.php`, `css/`, `js/`
- Logica de negocio: `backend/account/`, `backend/calendario/`, `backend/calculadora/`
- Datos: MySQL con script SQL de creacion en `backend/script.sql`

## Estructura del proyecto
```text
Actividad-4/
|-- index.html
|-- frontend/
|   |-- dashboard.php
|-- backend/
|   |-- conexion.php
|   |-- db_insert.php
|   |-- script.sql
|   |-- account/
|   |   |-- login.php
|   |   |-- logout.php
|   |   |-- register.php
|   |   |-- session.php
|   |-- calendario/
|   |   |-- add_activity.php
|   |   |-- list_activities.php
|   |   |-- update_activity.php
|   |   |-- delete_activity.php
|   |-- calculadora/
|       |-- save_operation.php
|       |-- list_operations.php
|-- css/
|   |-- main.css
|   |-- dashboard.css
|   |-- calendario.css
|   |-- calculadora.css
|-- js/
|   |-- main.js
|   |-- calendario.js
|   |-- calculadora.js
|   |-- theme.js
|-- README.md
```

## Copiar y clonar link de github

git clone https://github.com/thiagosalaberryj-bit/Actividad-4.git

## Instalacion y ejecucion (XAMPP)
1. Copiar la carpeta del proyecto dentro de `htdocs`:
```bash
C:\xampp\htdocs\Actividad-4
```

2. Iniciar Apache y MySQL desde el panel de XAMPP.

3. Crear la base y tablas importando `backend/script.sql`.
	Opciones:
- Desde phpMyAdmin: Importar archivo SQL.
- Desde consola MySQL:
```bash
mysql -u root -p < backend/script.sql
```

4. Abrir en navegador:
```text
http://localhost/Actividad-4/
```

## Endpoints principales
### Cuenta
- `POST backend/account/register.php`
- `POST backend/account/login.php`
- `POST backend/account/logout.php`
- `GET backend/account/session.php`

### Calendario / actividades
- `GET backend/calendario/list_activities.php`
- `POST backend/calendario/add_activity.php`
- `POST backend/calendario/update_activity.php`
- `POST backend/calendario/delete_activity.php`

### Calculadora
- `GET backend/calculadora/list_operations.php`
- `POST backend/calculadora/save_operation.php`

## Notas tecnicas
- La conexion a BD esta centralizada en `backend/conexion.php`.
- La creacion de esquema NO se hace desde PHP; se hace con `backend/script.sql`.
- Las inserciones reutilizan helper funcional en `backend/db_insert.php`.
- Las respuestas del backend son JSON.

## Licencia
Proyecto academico para uso educativo.