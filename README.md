# 🍻 BeerFest App – Instrucciones de instalación

Aplicación web para registrar las ventas de cada cervecería en el festival.

- **Frontend:** Angular 20
- **Backend:** Node.js + Express + SQLite

---

## 🔧 Requisitos previos

- Node.js **v18 o superior**
- npm (incluido con Node)
- Git

---

## 🚀 Instalación en local

### 1. Backend

Instalar dependencias:

```bash
cd beerfest-backend
npm install
```

Levantar el servidor:

```bash
npm run dev
```

El backend quedará disponible en:  
👉 [http://localhost:4000/](http://localhost:4000/)

> 📌 La primera vez se crean automáticamente las tablas en **beerfest.sqlite3** y se cargan los usuarios iniciales:
>
> - **admin / admin**
> - Cada cervecería de la lista con clave **123**

---

### 2. Frontend

En otra terminal, instalar dependencias:

```bash
cd ../beerfest-frontend
npm install
```

Levantar el frontend:

```bash
ng serve
```

Abrir en el navegador:  
👉 [http://localhost:4200/](http://localhost:4200/)

---

## 👤 Usuarios de prueba

### Administrador

- **Usuario:** `admin`
- **Clave:** `admin`

### Cervecerías (ejemplos)

- **Sin Rodeo / 123**
- **Slurry Brew / 123**
- **Cupercito's Company / 123**
- … _(todas las demás de la lista)_

---

## 🎨 Desarrollo de estilos y tests

Los archivos **SCSS** del frontend se encuentran en:

- `beerfest-frontend/src/app/pages/`
- `beerfest-frontend/src/app/shared/`

---

## 📝 Notas

- Para resetear la base de datos:

  1. Borrar el archivo `beerfest-backend/beerfest.sqlite3`
  2. Volver a correr `npm run dev`

- Cada cervecería puede loguearse con su usuario y registrar sus ventas.

- En el **dashboard** aparece:

  ```
  NOMBRE — Tus Cuentas
  ```

  para identificar a qué cervecería corresponde.

- La vista **Overview** muestra todas las ventas de todas las cervecerías.
