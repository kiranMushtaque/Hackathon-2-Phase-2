# 🚀 Task Management System (Phase 2)

A full-stack **Task Management Application** built with **Next.js** and **FastAPI**, featuring secure JWT authentication and a modern UI.

---

## ✨ Features

### 🔐 Authentication
- User registration & login
- JWT-based authentication
- Secure password hashing (bcrypt)

### ✅ Task Management
- Create, update, delete tasks
- Mark tasks as complete/incomplete
- Priority levels (Low, Medium, High)
- Task tags & due dates
- Search & filter tasks

### 🎨 UI / UX
- Modern responsive UI
- Dark / Light mode
- Smooth animations
- Mobile-friendly design

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Lucide Icons

### Backend
- FastAPI
- SQLModel
- PostgreSQL
- JWT Authentication

---

## 📁 Project Structure

.
├── backend/ # FastAPI backend
├── frontend/ # Next.js frontend
├── vercel.json
└── README.md

---

## ⚙️ Environment Variables

### Frontend (`.env.local`)
NEXT_PUBLIC_API_URL=https://your-backend-url/api

### Backend (`.env`)
DATABASE_URL=postgresql://user:password@host/db
SECRET_KEY=your-secret-key

---

## 🚀 Deployment (Vercel)

1. Push code to GitHub  
2. Open **Vercel → New Project**
3. Select repository  
4. Set **Root Directory** → `frontend`
5. Add environment variable:
NEXT_PUBLIC_API_URL=https://your-backend-url/api

6. Click **Deploy**

---

## 🔐 Authentication Flow

- User registers or logs in
- JWT token issued by backend
- Token stored on client
- All protected routes require token

---

## 📌 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

---

## 🧠 Notes
- Backend uses FastAPI + SQLModel
- Frontend built with Next.js App Router
- Production ready & scalable setup

---

## 📄 License
MIT License
