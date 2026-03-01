# Stock Management System

A comprehensive inventory management system built with React 19, Next.js 16, and MySQL database.

## Features

### 🔐 Authentication System
- User login with role-based access control
- Three user roles: Administrator, Manager, User
- JWT token-based authentication
- Protected routes with AuthGuard

### 📦 Stock Management
- **Category Management**: Hierarchical categories with parent-child relationships
- **Product Management**: Complete CRUD with advanced filtering
- **Stock Out Operations**: Track sales, returns, damages, transfers
- **Search & Filtering**: Advanced search across all product fields

### 📊 Dashboard
- Real-time statistics
- Stock movement tracking
- Low stock alerts
- Recent activity feed

### 🎨 Premium UI
- Modern black theme design
- Responsive layouts
- Interactive components
- Professional user experience

## Database Schema

### Users & Roles
- **Users**: username, email, password, role assignment
- **Roles**: Administrator, Manager, User with permissions

### Categories
- Hierarchical structure with parent_id
- Active/inactive status
- Subcategory support

### Products
- Name, price, quantity
- Color, storage, RAM specifications
- Category relationship

### Stock Out Records
- Transaction tracking
- Multiple reasons (Sale, Return, Damage, Transfer, Loss)
- Operator assignment
- Value calculations

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category
- `GET /api/categories/[id]` - Get single category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Products
- `GET /api/products` - List products with filtering
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Stock Out
- `GET /api/stock-out` - List stock out records with filtering
- `POST /api/stock-out` - Create new stock out record
- `GET /api/stock-out/[id]` - Get single record
- `PUT /api/stock-out/[id]` - Update record
- `DELETE /api/stock-out/[id]` - Delete record

## Setup Instructions

### 1. Environment Configuration
Create a `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_USERNAME=admin_user
DB_PASSWORD=your_password
DATABASE=inventory_managment_system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Run database seeding (requires tsx)
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

## Default Login Credentials

- **Administrator**: username: `admin`, password: `admin123`
- **Manager**: username: `manager`, password: `user123`
- **User**: username: `user`, password: `user123`

## Technology Stack

- **Frontend**: React 19, Next.js 16, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT tokens, bcrypt password hashing
- **UI**: Tailwind CSS, Lucide React icons
- **Styling**: Premium black theme design

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── categories/          # Category management
│   ├── dashboard/           # Dashboard
│   ├── stock-out/           # Stock out operations
│   └── stocks/             # Product management
├── components/
│   ├── Auth/               # Authentication components
│   └── Layout/             # Layout components
├── db/
│   ├── config/              # Database configuration
│   ├── models/              # Database models
│   └── seed.ts             # Database seeding
└── public/                 # Static assets
```

## Development Notes

- All API routes are protected and require authentication
- Database models use Sequelize with TypeScript decorators
- UI components follow React 19 best practices
- Responsive design works on all screen sizes
- Real-time data updates with proper error handling