# Espacio U

Sistema web para consultar la disponibilidad de espacios universitarios y gestionar solicitudes de reserva. El proyecto responde a la falta de una interfaz centralizada para estudiantes, docentes y organizaciones estudiantiles.

## Integrantes

- Sebastián Torrealba - Interfaz y estilos
- Mary Gonzalez  - Logica JavaScript
- Gonzalo Yuseff - Pruebas y documentacion


## Funcionalidades

- Catalogo dinamico de salas, laboratorios y espacios colaborativos.
- Busqueda y filtros por edificio, tipo y capacidad.
- Consulta de disponibilidad por fecha y bloque horario.
- Formulario de reserva con validacion nativa y personalizada.
- Historial persistente en `localStorage`.
- Cancelacion de reservas con confirmacion.
- Mensajes visuales de exito y error.
- Diseno responsive para computador, tablet y telefono.

## Tecnologias

- HTML5 semantico
- Bootstrap 5.3
- CSS3 personalizado
- JavaScript ES6 y manipulacion del DOM
- Git con flujo `main`, `develop` y ramas `feature/*`

## Ejecucion

No requiere instalacion ni backend. Abrir `index.html` en un navegador moderno. Se necesita conexion a internet para cargar Bootstrap y Bootstrap Icons desde CDN; los datos y las fotografias se sirven localmente.

Para levantar un servidor local opcional:

```bash
python -m http.server 8080
```

Luego visitar `http://localhost:8080`.

## Datos demostrativos

Los espacios se definen como un arreglo de objetos en `js/app.js`. Las reservas se guardan solo en el navegador del usuario mediante `localStorage`; no se envian datos a servidores externos.

## Flujo Git sugerido

```bash
git checkout develop
git checkout -b feature/nombre-funcionalidad
# realizar cambios y commits descriptivos
git push -u origin feature/nombre-funcionalidad
```

Crear un Pull Request desde `feature/nombre-funcionalidad` hacia `develop`, revisar los cambios e integrarlos. Para una entrega, crear otro Pull Request desde `develop` hacia `main`.

## Estructura

```text
.
|-- assets/
|   `-- espacios-campus.png
|-- css/
|   `-- styles.css
|-- js/
|   `-- app.js
|-- index.html
`-- README.md
```

## Creditos visuales

El atlas fotografico de los espacios fue generado especialmente para este prototipo mediante la herramienta de generacion de imagenes de OpenAI. No contiene marcas, texto ni recursos remotos.
