# 🏆 Mathwiz Arena

<p align="center">
  <img src="./app/icon.svg" alt="Mathwiz Logo" width="120" height="120">
</p>

<p align="center">
  <strong>An online platform for hosting and participating in mathematics competitions</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#user-roles">User Roles</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## 📖 Overview

Mathwiz Arena is a comprehensive web platform designed for organizing, managing, and participating in mathematics competitions. The platform supports multiple user roles including **Mathletes** (participants), **Organizers** (competition creators), and **Administrators** (platform managers).

## ✨ Features

### For Mathletes (Participants)
- **Dashboard** - View available competitions, registered events, and recent activity
- **Competition Registration** - Register for individual or team-based competitions
- **Live & Scheduled Competitions** - Participate in real-time or scheduled math challenges
- **Team Management** - Create teams, invite members, and compete together
- **Competition Environment** - Solve problems with LaTeX support and auto-save functionality
- **Notifications** - Receive updates on team invitations and competition events
- **Profile & History** - View competition history, achievements, and personal stats

### For Organizers
- **Competition Creation** - Create competitions with flexible settings
- **Problem Bank** - Create and manage reusable problem sets
- **Problem Types** - Multiple choice, identification, and essay questions
- **LaTeX Support** - Full mathematical notation support for problems
- **Participant Management** - View registrations, track submissions
- **Registration Notifications** - Get notified when mathletes register or withdraw
- **Competition Controls** - Publish, edit, stop/resume, and delete competitions

### For Administrators
- **Platform Overview** - Dashboard with system-wide statistics
- **User Management** - Manage all platform users
- **Competition Oversight** - View and manage all competitions
- **Problem Bank Access** - Access all organizer problem banks (read-only for organizer content)
- **Live Competition Controls** - Stop/resume live competitions as needed
- **System Settings** - Configure platform-wide settings

### General Features
- **Dark Mode** - Full dark mode support across the platform
- **Responsive Design** - Mobile-first design for all screen sizes
- **Real-time Updates** - Live competition timers and status updates
- **Secure Authentication** - Supabase-powered authentication with email verification
- **Role-based Access Control** - Row Level Security (RLS) policies

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) + Custom Components |
| **Math Rendering** | [KaTeX](https://katex.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun
- Supabase account and project

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/CSci-153-Web-Systems-and-Technologies/batch-2025-mathwiz-arena-web.git
   cd mathwiz-arena
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   Run the SQL migrations located in `/supabase_migrations/` in your Supabase SQL editor in order:
   - `00_create_profiles_table.sql` - User profiles
   - `01_create_teams_tables.sql` - Teams and memberships
   - `02_create_problem_banks.sql` - Problem storage
   - `03_create_competitions.sql` - Competition management
   - `04_create_registrations.sql` - Competition registrations
   - And additional migrations...

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
mathwiz-arena/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/                # Login page
│   │   ├── signup/               # Registration page
│   │   └── auth/confirm/         # Email confirmation
│   ├── admin/                    # Admin panel
│   │   ├── competition/          # Competition management
│   │   ├── problem-bank/         # Problem bank management
│   │   ├── profile/              # Admin profile
│   │   └── settings/             # System settings
│   ├── mathlete/                 # Mathlete dashboard
│   │   ├── (dashboard)/          # Dashboard pages
│   │   │   ├── notifications/    # Notifications
│   │   │   ├── profile/          # User profile
│   │   │   └── teams/            # Team management
│   │   ├── competition/          # Competition environment
│   │   └── components/           # Mathlete-specific components
│   ├── organizer/                # Organizer panel
│   │   ├── competition/          # Competition CRUD
│   │   ├── notifications/        # Organizer notifications
│   │   └── problem-bank/         # Problem management
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # Shared components
│   ├── ui/                       # UI primitives (Button, Input, etc.)
│   ├── ThemeProvider.tsx         # Dark mode provider
│   └── LoginLogoutButton.tsx     # Auth button component
├── lib/                          # Utility functions
│   ├── utils.ts                  # General utilities
│   └── auth-actions.ts           # Auth-related actions
├── utils/                        # Supabase utilities
│   └── supabase/
│       ├── client.ts             # Client-side Supabase
│       ├── server.ts             # Server-side Supabase
│       └── middleware.ts         # Auth middleware
├── supabase_migrations/          # Database migrations
├── public/                       # Static assets
├── middleware.ts                 # Next.js middleware
├── tailwind.config.ts            # Tailwind configuration
└── package.json                  # Dependencies
```

## 👥 User Roles

### Mathlete (Default Role)
- Register and login to the platform
- Browse and register for competitions
- Create and manage teams
- Participate in competitions
- View personal history and achievements

### Organizer
- Create and manage problem banks
- Create and publish competitions
- View participant registrations
- Receive registration notifications

### Admin
- All Organizer capabilities
- View all competitions across the platform
- Stop/resume live competitions
- Access organizer problem banks (read-only)
- Manage platform settings

## 🗄️ Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with role information |
| `teams` | Team data and settings |
| `team_members` | Team membership records |
| `team_invitations` | Pending team invitations |
| `problem_banks` | Problem bank containers |
| `problems` | Individual problems with LaTeX content |
| `competitions` | Competition configuration |
| `competition_problems` | Problems linked to competitions |
| `competition_registrations` | Participant registrations |
| `competition_attempts` | Attempt tracking for live competitions |
| `competition_answers` | Submitted answers |
| `notifications` | User notifications |

## 🎨 Design System

The platform uses a consistent design system with:

- **Mathlete Theme**: Blue tones (`#25346A`, `#2A64d1`)
- **Organizer Theme**: Orange accent (`#f49700`)
- **Admin Theme**: Indigo tones
- **Dark Mode**: Full dark mode support with slate color palette

## 📱 Responsive Design

The platform is fully responsive with breakpoints:
- Mobile: `< 640px`
- Tablet: `640px - 1024px`
- Desktop: `> 1024px`

## 🔒 Security

- **Authentication**: Supabase Auth with email verification
- **Authorization**: Row Level Security (RLS) policies
- **Role-based Access**: Server-side role verification
- **Protected Routes**: Middleware-based route protection

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is developed for educational purposes.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS Framework
- [KaTeX](https://katex.org/) - Fast Math Typesetting

---

<p align="center">
  Built with ❤️ for mathematics education
</p>
