# MEA - Sistema de Gestión de Inventario y Pedidos

MEA es un sistema completo para la gestión de inventario, clientes, marcas y pedidos. Permite controlar el stock de productos, registrar pedidos de clientes, y ver pedidos pendientes y entregados.  

El backend está desarrollado con **Django REST Framework** y el frontend con **React**.

---

## Funcionalidades

- **Gestión de Stock**
  - Agregar, editar y eliminar productos.
  - Control automático del stock cuando se realizan pedidos.

- **Gestión de Clientes**
  - Registrar y administrar clientes.
  - Consultar historial de pedidos por cliente.

- **Gestión de Marcas**
  - Registrar y vincular productos con marcas.

- **Gestión de Pedidos**
  - Crear pedidos de clientes con múltiples productos.
  - Restar automáticamente del stock los productos vendidos.
  - Ver estado de los pedidos: **pendientes** o **entregados**.
  
- **Frontend**
  - Interfaz interactiva con React.
  - Visualización de productos, clientes y pedidos.
  - Formularios dinámicos para agregar productos a pedidos.

- **Backend**
  - API REST con Django REST Framework.
  - Autenticación y autorización de usuarios (opcional).
  - Manejo de relaciones entre clientes, productos y pedidos.
  
---

## Tecnologías Utilizadas

- **Backend**
  - Python 3.x
  - Django 4.x
  - Django REST Framework
  - PostgreSQL (o SQLite en desarrollo)

- **Frontend**
  - React 18
  - Material-UI para componentes
  - Fetch/Axios para consumir la API REST

---

## Instalación

### Backend

```bash
# Clonar el repositorio
git clone git@github.com:Chrisruberto/MEA.git
cd MEA

# Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate  # Linux / macOS
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Migrar base de datos
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
