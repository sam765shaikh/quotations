# Quotation Management SaaS

A full-stack quotation management application with user authentication, dashboard, and full CRUD for quotations with multiple products and automatic price calculation.

## Tech Stack

| Layer    | Technology   |
|----------|-------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend  | Node.js, Express.js, REST API |
| Database | MySQL |
| Auth     | JWT (JSON Web Tokens) |

## Folder Structure

```
quotaions/
├── backend/
│   ├── config/
│   │   └── db.js              # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js            # Register, login, /me
│   │   └── quotations.js     # CRUD for quotations + items
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── database/
│   └── schema.sql             # Database and tables
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js      # API helper with auth header
│   │   ├── components/
│   │   │   └── Layout.jsx     # Sidebar + outlet
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── QuotationList.jsx
│   │   │   ├── QuotationCreate.jsx
│   │   │   ├── QuotationView.jsx
│   │   │   └── QuotationEdit.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Backend API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | `/api/auth/register` | Register new user | No |
| POST   | `/api/auth/login`    | Login, returns JWT | No |
| GET    | `/api/auth/me`       | Current user info | Yes |
| GET    | `/api/quotations`    | List user's quotations | Yes |
| GET    | `/api/quotations/:id`| Get one quotation with items | Yes |
| POST   | `/api/quotations`    | Create quotation (body: client_*, items[], tax_rate) | Yes |
| PUT    | `/api/quotations/:id`| Update quotation | Yes |
| DELETE | `/api/quotations/:id`| Delete quotation | Yes |
| GET    | `/api/health`        | Health check | No |

## Database Schema

- **users** – id, email, password (hashed), name, created_at, updated_at  
- **quotations** – id, user_id, quotation_number, client_name, client_email, client_phone, valid_until, notes, subtotal, tax_rate, tax_amount, total, status (draft/sent/accepted/rejected), created_at, updated_at  
- **quotation_items** – id, quotation_id, product_name, description, quantity, unit_price, total_price, sort_order, created_at, updated_at  

See `database/schema.sql` for full DDL.

## Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8 (or 5.7) running locally or remotely

### 1. Database

1. Open MySQL (e.g. MySQL Workbench or command line).
2. Run the schema script to create database and tables:

```bash
mysql -u root -p < database/schema.sql
```

Or paste the contents of `database/schema.sql` into your MySQL client and execute.

### 2. Backend

1. Go to the backend folder and install dependencies:

```bash
cd backend
npm install
```

2. Create environment file:

```bash
copy .env.example .env
```

On macOS/Linux: `cp .env.example .env`

3. Edit `.env` and set:

- `DB_HOST` – MySQL host (e.g. `localhost`)
- `DB_USER` – MySQL user (e.g. `root`)
- `DB_PASSWORD` – MySQL password
- `DB_NAME` – `quotation_saas` (same as in schema)
- `JWT_SECRET` – long random string for signing JWTs (required in production)
- `PORT` – optional, default `5000`

4. Start the API server:

```bash
npm run dev
```

Server runs at `http://localhost:5000`. For production use `npm start`.

### 3. Frontend

1. In a new terminal, go to the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

2. Start the dev server:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` to the backend (see `vite.config.js`).

### 4. Use the App

1. Open **http://localhost:5173** in your browser.
2. **Register** a new account or **Login**.
3. From the **Dashboard** you can see stats and recent quotations.
4. **New Quotation** – add client details, add multiple products (name, description, qty, unit price). Subtotal, tax %, and total are calculated automatically. Click **Save Quotation**.
5. **Quotations** – view list, open a quotation, **Edit** or **Delete** as needed.

## Features Checklist

- User registration and login (JWT)
- Dashboard with totals and recent quotations
- Create quotation with client info and multiple products
- Auto price calculation (line total, subtotal, tax, total)
- Save quotation
- View quotation list and single quotation
- Edit and delete quotation

## Production Notes

- Set a strong `JWT_SECRET` and keep it secret.
- Use HTTPS and secure cookies if you add cookie-based auth later.
- Run frontend build and serve static files from Express or a web server:

```bash
cd frontend && npm run build
```

- Point your frontend (e.g. `CLIENT_URL` in backend) to your production frontend URL for CORS.
