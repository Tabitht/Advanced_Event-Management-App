# 🎟️ MeetHives Event Marketplace

A niche event marketplace focused on game-night events where organizers can create branded profiles, sell tickets (single or group), and attendees can engage with events through galleries, chats, and more.

This project is a monorepo containing both the backend (API + database) and frontend (React + Tailwind UI).

# 📚 Table of Contents

- Overview

- Features

- Tech Stack

- Project Structure

- Getting Started

- Environment Variables

- API Documentation

- Contributing

- License

# 🎯 Overview

The platform allows:

- Organizers to create branded profiles, host events, sell tickets, and manage attendees.

- Attendees to buy tickets, upload event photos, and engage in event chat rooms.

This project is designed with scalability in mind — features like per-event AI chatbots and advanced analytics can be added in future iterations.

# ✨ Features

✅ Branded Organizer Profiles – Logos, descriptions, and contact info
✅ Flexible Ticketing System – Master/sub-ticket model with QR scanning
✅ Email Ticket Delivery – Confirmation email + deep link to claim ticket
✅ Organizer Dashboard – View ticket sales, scan logs, analytics
✅ Photo Gallery – Attendee uploads with organizer moderation
✅ Basic Event Chatroom – Real-time chat for ticket holders (Socket.IO)
✅ Secure Authentication – JWT-based login/signup
✅ Environment-Specific Config – Separate .env for backend & frontend

# 🛠 Tech Stack

# Backend

- Node.js + Express – REST API

- Prisma ORM – Database management

- PostgreSQL – Primary database

- TypeScript – Strict typing for reliability

- Jest + Supertest – Testing (unit + integration)

# Frontend

- React (with Vite) – Fast, modern frontend

- Tailwind CSS – Utility-first styling

- React Query / SWR – API data fetching & caching

- React Router – Client-side routing

# 📂 Project Structure

event-marketplace/
│
├── MeetHive_Backend/ # Express + Prisma API
│ ├── src/
│ ├── tests/
| ├── .prettierrc
| ├── .gitignore
| ├── .env
| ├── docker-compose.yaml
| ├── Dockerfile
| ├── package-lock.json
│ ├── package.json
| ├── eslint.config.mts
| ├── prisma.config.mts
| ├── tsconfig.json
│ └── README.md # Backend-specific setup
│
├── MeetHive_Frontend/ # React + Tailwind UI
│ ├── src/
│ ├── public/
| ├── package-lock.json
│ ├── package.json
│ └── README.md # Frontend-specific setup
│
├── README.md # Root README (this file)
└── .gitignore

# 🚀 Getting Started

1️⃣ Clone the Repository

<pre> ```bash git clone https://github.com/tabitht/Advanced_Event-Management-App.git``` </pre>
<pre> ```bash cd Advanced_Event-Management-App``` </pre>

2️⃣ Install Dependencies

Backend:

<pre> ```bash cd MeetHive_Backend npm install``` </pre>

Frontend:

<pre> ```bash cd ../MeetHive_Frontend npm install``` </pre>

3️⃣ Set Up Environment Variables

Create .env files in both MeetHive_Backend/ and MeetHive_Frontend/ directories.

Backend .env should include DB URL, JWT secret, email config, etc.

Frontend .env should include API base URL and any public keys.

# 📜 API Documentation

Backend API follows REST standards.

Full OpenAPI/Swagger documentation will be available at:

http://localhost:5000/api/v1/docs

# 🧪 Testing

Backend tests (unit + integration):

<pre> ```bash cd MeetHive_Backend npm run test``` </pre>

# 🌍 Deployment

Backend → Can be deployed on Render, Railway, or Heroku.

Frontend → Can be deployed on Vercel or Netlify.

Both services can use the same PostgreSQL instance for data.

# 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss changes.

📄 License
