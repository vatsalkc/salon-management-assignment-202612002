# 💈 Elite Cuts — Salon Queue Management SaaS

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.1-2D3748?logo=prisma)](https://www.prisma.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io)](https://socket.io/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Serverless-00E599?logo=postgresql)](https://neon.tech/)

A commercial-grade, multi-role, real-time Salon Queue Management SaaS platform designed to eliminate waiting-room congestion, synchronize staff operations, and elevate customer experience.

Built with **React 18 + Vite**, **Express + TypeScript**, **Prisma ORM**, **PostgreSQL (Neon)**, and **Socket.IO**.

---

## 📸 Overview & Product Tour

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ELITE CUTS ARCHITECTURE                          │
├──────────────────────┬───────────────────────────────┬──────────────────────┤
│    CUSTOMER APP      │      STAFF & MANAGEMENT       │    PUBLIC DISPLAYS   │
│  • Join Live Queue   │  • Reception Desk Dashboard   │  • 4K TV Waiting     │
│  • Pick Services     │  • Barber Workstation Timer   │    Lounge Screen     │
│  • Stylist Picker    │  • Owner KPIs & Analytics     │  • Audio Calling     │
│  • Dynamic Wait Time │  • Service & Barber CRUD      │    Notification      │
│  • Digital Token     │  • Operating Hour Controls    │  • Real-Time Sync    │
└──────────────────────┴───────────────────────────────┴──────────────────────┘
```

---

## ✨ Key Features & User Roles

### 1. 👤 Customer Experience
* **Digital Queue Entry:** Customers select one or multiple haircut/styling services with dynamic duration and price calculation.
* **Barber Choice:** Choose a favorite stylist or pick **"Any Available Barber"** for the earliest available station.
* **Auto Token Generation:** Daily sequential tokens (`A001`, `A002`, `A003`...).
* **Live Ticket Screen:** Real-time queue position countdown, dynamic wait time estimation, and assigned barber station.
* **"It's Your Turn!" Banner & Audio:** High-contrast notification banner and polite audio chime when the customer is called.
* **Queue History:** View previous salon tickets, completed services, and costs.

### 2. 🛎️ Receptionist Dashboard
* **Live Queue Oversight:** Real-time visibility into all waiting, called, and in-service customers.
* **Walk-in Registration:** Issue instant tokens on behalf of in-person walk-ins.
* **FIFO Dispatcher:** 1-click **"Call Next"** button to automatically summon the earliest waiting client.
* **Queue Control:** Skip customers (moves customer to the end of the line), mark No-Shows, or cancel tickets.
* **Barber Assignment:** Re-assign any customer to a specific barber station.
* **Live Search & Filter:** Filter by status (`WAITING`, `CALLED`, `IN_SERVICE`) or search by name, phone, or token.

### 3. ✂️ Barber Workstation
* **Personal Station Chair:** View the client currently in your chair with an active elapsed timer.
* **Next-in-Line Preview:** See the upcoming customer assigned to your station.
* **One-Click Progression:** **Start Service** (marks station as Busy) and **Complete Service** (frees station and updates revenue).
* **Availability Toggle:** Seamlessly toggle between:
  * **Ready / Available** (accepts next waiting client)
  * **On Break** (pauses assignment; customer assignments skip station)
  * **Offline** (station closed)

### 4. 📊 Owner / Admin Portal
* **Executive Overview:** Real-time KPIs: Customers served today, daily revenue, average wait time, and station status.
* **Popular Services Analytics:** Volume breakdown, haircut popularity rankings, and category revenue.
* **Barber Productivity:** Completed haircut volume, average service speed per stylist, and status history.
* **Operating Settings:** Configure salon name, open/close operating hours, maximum queue capacity, and timezone.
* **Master Queue Toggle:** Instant killswitch to open or close online and walk-in queue registrations.

### 5. 📺 Public TV Lounge Display (`/tv`)
* **Large-Format 1080p / 4K Board:** Designed for wall-mounted TV displays in waiting lounges.
* **Now Serving per Station:** Shows active token numbers and customer names at each barber chair.
* **Now Proceeding Alert:** Pulsing banner highlighting newly called tokens.
* **Next in Line List:** Top upcoming queue positions with dynamic estimated wait times.
* **Live Clock & Network Indicator:** Real-time synchronization heartbeat via WebSockets.

---

## 🧠 Queue Engine Rules & Logic

1. **FIFO Fairness:** Queue is strictly ordered first-in, first-out by timestamp (`joinedAt`).
2. **Preferred vs. Any Barber:**
   * If a customer selects **"Any Barber"**, the queue engine assigns the earliest barber who becomes available.
   * If a preferred barber is chosen, the customer retains their FIFO order but will be called specifically when that barber is ready.
3. **One Active Ticket Per Phone:** Duplicate entries are prevented at the database level. A phone number cannot hold multiple concurrent active tokens (`WAITING`, `CALLED`, or `IN_SERVICE`).
4. **Dynamic Wait Time Estimation:** Computed in real-time based on the cumulative service duration of preceding tickets divided by active barber stations.
5. **Break Mode:** Setting a station to `ON_BREAK` pauses assignments to that barber without cancelling existing queue tickets.
6. **Skip Rule:** Skipping a customer updates their timestamp to the current time, re-inserting them at the tail end of the waiting queue.
7. **No-Show Rule:** Marking a customer as `NO_SHOW` removes them from the active queue and logs the occurrence for owner analytics.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui design tokens, Framer Motion, Lucide Icons, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, TypeScript (Strict Mode), Socket.IO, Zod validation, JWT, bcryptjs |
| **Database** | PostgreSQL hosted on **Neon**, Prisma ORM 6.1 (with connection pooling) |
| **Deployment** | **Vercel** (Frontend SPA) + **Render** (Backend Web Service) + **Neon** (Serverless Database) |

---

## 📂 Project Structure

```
salon-management-assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma models (User, Barber, Service, QueueEntry, SalonSettings)
│   │   └── seed.ts             # Seed script with sample barbers, services, and accounts
│   ├── src/
│   │   ├── config/             # Environment validation, database client, CORS
│   │   ├── controllers/        # Auth, Queue, Barber, Service, Settings, Stats
│   │   ├── middleware/         # JWT Auth, Role-based Access, Zod Validation, Global Error
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── services/           # Queue Engine, Barber Service, Auth Service, Settings
│   │   ├── utils/              # JWT signing, Custom AppError classes
│   │   └── server.ts           # Express HTTP + Socket.IO server bootstrap
│   ├── render.yaml             # Render one-click blueprint
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # ProtectedRoute, State loaders
│   │   │   ├── layout/         # Navbar, Sidebar, Dashboard Layout Shell
│   │   │   └── ui/             # Button, Input, Card, Badge, Dialog, Label
│   │   ├── context/            # AuthContext, ThemeContext (Dark/Light), SocketContext
│   │   ├── pages/
│   │   │   ├── auth/           # LoginPage (with 1-click Demo accounts), RegisterPage
│   │   │   ├── customer/       # JoinQueuePage, WaitingScreen, CustomerHistoryPage
│   │   │   ├── reception/      # ReceptionDashboardPage
│   │   │   ├── barber/         # BarberDashboardPage
│   │   │   ├── owner/          # OwnerDashboardPage, ManageServicesPage, ManageBarbersPage, OwnerAnalyticsPage, OwnerSettingsPage
│   │   │   └── tv/             # TVDisplayPage (4K Public Waiting Screen)
│   │   ├── services/           # Axios API wrappers (auth, queue, barbers, services, stats)
│   │   ├── types/              # TypeScript models and interfaces
│   │   ├── utils/              # Currency/duration formatters, status color constants
│   │   ├── App.tsx             # Role-guarded routing tree
│   │   └── main.tsx
│   ├── tailwind.config.ts
│   ├── vercel.json             # Vercel SPA rewrite rules
│   ├── vite.config.ts
│   └── package.json
│
├── .env.example                # Root environment template
└── README.md
```

---

## 🚀 Quickstart Local Development

### Prerequisites
* **Node.js** v18+ installed
* **PostgreSQL** database (Local or [Neon free tier](https://neon.tech))

### 1. Clone & Configure Environment

```bash
git clone https://github.com/your-username/salon-management-assignment.git
cd salon-management-assignment
```

Create `.env` inside `backend/`:
```env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
PORT=3001
NODE_ENV="development"
```

Create `.env` inside `frontend/`:
```env
VITE_API_URL="http://localhost:3001"
VITE_SOCKET_URL="http://localhost:3001"
```

### 2. Setup Database & Seed Data

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 3. Run Backend & Frontend

**Terminal 1 (Backend API + WebSockets):**
```bash
cd backend
npm run dev
# Running on http://localhost:3001
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🔑 Demo Accounts (Pre-seeded)

Use the 1-click demo buttons on the `/login` screen or use these credentials:

| Role | Email | Password | Landing Screen |
|---|---|---|---|
| **Owner / Admin** | `owner@salon.com` | `password123` | `/owner` |
| **Receptionist** | `reception@salon.com` | `password123` | `/reception` |
| **Barber (James)** | `james@salon.com` | `password123` | `/barber` |
| **Barber (David)** | `david@salon.com` | `password123` | `/barber` |
| **Barber (Michael)**| `michael@salon.com` | `password123` | `/barber` |
| **Customer** | `john@example.com` | `password123` | `/` |

Public TV Display available without login at: **`/tv`**

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate email & password, returns JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session & profile |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate session |

### Queue Engine (`/api/queue`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/queue/join` | Public / Customer | Join waiting queue with services & preferred barber |
| `GET` | `/api/queue` | Staff (Reception, Barber, Owner) | Get live active queue (`WAITING`, `CALLED`, `IN_SERVICE`) |
| `GET` | `/api/queue/my-position` | Public / Customer | Fetch active ticket for phone or user ID |
| `GET` | `/api/queue/history` | Customer | Fetch past visits and token history |
| `GET` | `/api/queue/entry/:id` | Public | Get single ticket details |
| `GET` | `/api/queue/tv` | Public | Aggregated data for TV Lounge display |
| `PATCH`| `/api/queue/call-next` | Reception / Owner | Call earliest FIFO waiting customer |
| `PATCH`| `/api/queue/:id/call` | Reception / Owner | Call specific customer |
| `PATCH`| `/api/queue/:id/start` | Barber / Reception / Owner | Move customer to `IN_SERVICE` at barber station |
| `PATCH`| `/api/queue/:id/complete` | Barber / Reception / Owner | Mark customer as `COMPLETED` and free station |
| `PATCH`| `/api/queue/:id/cancel` | Customer / Staff | Cancel ticket |
| `PATCH`| `/api/queue/:id/no-show` | Reception / Owner | Mark customer as `NO_SHOW` |
| `PATCH`| `/api/queue/:id/skip` | Reception / Owner | Move customer to end of FIFO waiting queue |
| `PATCH`| `/api/queue/:id/assign` | Reception / Owner | Assign customer to a specific barber station |

### Barbers (`/api/barbers`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/barbers` | Public | List active barbers for queue selection |
| `GET` | `/api/barbers/:id` | Authenticated | Get barber profile |
| `POST` | `/api/barbers` | Owner | Create new barber account & profile |
| `PUT` | `/api/barbers/:id` | Owner | Update barber details & specialization |
| `PATCH`| `/api/barbers/:id/status`| Barber / Reception / Owner | Update status (`AVAILABLE`, `BUSY`, `ON_BREAK`, `OFFLINE`) |
| `DELETE`| `/api/barbers/:id` | Owner | Deactivate barber |

### Services (`/api/services`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/services` | Public | List available haircuts, packages, and treatments |
| `POST` | `/api/services` | Owner | Create new salon service |
| `PUT` | `/api/services/:id` | Owner | Update pricing, duration, or category |
| `DELETE`| `/api/services/:id` | Owner | Deactivate service |

### Salon Settings & Stats (`/api/settings`, `/api/stats`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/settings` | Public | Get operating hours, capacity, and queue open/closed status |
| `PUT` | `/api/settings` | Owner | Update salon parameters |
| `PATCH`| `/api/settings/toggle-queue`| Owner / Reception | Toggle queue open/close state |
| `GET` | `/api/stats/daily` | Owner | Today's served count, revenue, avg wait, cancellations |
| `GET` | `/api/stats/barbers` | Owner | Per-barber haircut volume and duration statistics |
| `GET` | `/api/stats/services` | Owner | Popularity rankings and revenue per service |

---

## ⚡ Socket.IO Real-time Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `queue:updated` | Server → All Clients | `{ liveQueue, tvData }` | Broadcasted on join, start, complete, cancel, skip |
| `queue:called` | Server → All Clients | `QueueEntry` | Triggered when customer is called to chair |
| `barber:status` | Server → All Clients | `{ barberId, status, barber }` | Triggered when barber changes availability |
| `settings:updated`| Server → All Clients | `SalonSettings` | Broadcasted when queue opens/closes or hours change |

---

## 🌐 Production Deployment Guide

### Step 1: Database (Neon PostgreSQL)
1. Go to [Neon.tech](https://neon.tech) and create a free project.
2. Copy the pooled connection string:
   ```
   postgresql://user:pass@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Backend (Render)
1. Connect your GitHub repository to [Render](https://render.com).
2. Choose **Web Service** or use the included `backend/render.yaml` blueprint.
3. Configure settings:
   * **Root Directory:** `backend`
   * **Build Command:** `npm install && npx prisma generate && npx prisma db push && npm run build`
   * **Start Command:** `npm start`
4. Environment variables on Render:
   * `DATABASE_URL`: *(Your Neon Connection String)*
   * `JWT_SECRET`: *(A 64-character random string)*
   * `JWT_EXPIRES_IN`: `7d`
   * `FRONTEND_URL`: `https://your-salon.vercel.app`
   * `NODE_ENV`: `production`

### Step 3: Frontend (Vercel)
1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Configure settings:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
3. Environment variables on Vercel:
   * `VITE_API_URL`: `https://your-backend-api.onrender.com`
   * `VITE_SOCKET_URL`: `https://your-backend-api.onrender.com`
4. Deploy! `vercel.json` already includes the SPA history fallback rules.

---

## 🛡️ Security & Reliability Best Practices

* **Password Hashing:** Salted `bcryptjs` hashing with work factor 10.
* **Input Sanitization:** Strict Zod validation on every incoming request payload.
* **Role Guards:** Route-level middleware ensures Barbers, Receptionists, and Customers cannot elevate privileges to Owner endpoints.
* **Prisma Connection Pooling:** Compatible with Neon Serverless pgBouncer pooling.
* **Zero Hardcoded Localhost:** All URLs dynamically reference environment variables with graceful fallbacks.
* **Production CORS:** Pre-configured for Vercel preview URLs, production domains, and WebSocket handshake headers.

---

## 📄 License
MIT License. Built for production deployment and salon queue automation.
