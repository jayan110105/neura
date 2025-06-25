# Neura - Your AI-Powered Personal Assistant

Neura is an intelligent personal assistant designed to streamline your productivity. It integrates chat, notes, calendar, email, and tasks into a single, intuitive interface, powered by AI.

> [!WARNING]
> **Disclaimer:** This project is currently a work in progress. Some features may not be fully implemented or may not work as expected.

## Key Features

- **AI Chat:** An intelligent, conversational chatbot to assist you with a variety of tasks.
- **Notes:** A dedicated space to jot down your thoughts, ideas, and reminders.
- **Calendar:** Keep track of your schedule and appointments.
- **Email:** Manage your emails directly within the application.
- **Tasks:** Organize your to-do lists and manage your tasks efficiently.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **AI:** [Google Gemini](https://ai.google.dev/)
- **AI SDK:** [Vercel AI SDK](https://sdk.vercel.ai/docs)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

Follow these instructions to set up the project locally.

### 1. Prerequisites

Make sure you have Node.js and npm installed on your machine.

### 2. Clone the Repository

```bash
git clone https://github.com/jayan110105/neura.git
cd neura
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the root of your project and add the following variables.

```
# Authentication
AUTH_SECRET="your-super-secret-auth-secret" # Generate one: `openssl rand -hex 32`
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Database
DATABASE_URL="your-postgresql-database-url"

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"
```

### 5. Set Up the Database

Run the following command to push the database schema to your PostgreSQL database.

```bash
npm run db:push
```

### 6. Run the Development Server

```bash
npm run dev
```

Your application should now be running at [http://localhost:3000](http://localhost:3000).
