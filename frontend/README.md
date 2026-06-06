# FullPrep Frontend

Modern, responsive frontend for the FullPrep coding platform built with Next.js 16, TypeScript, and TailwindCSS.

## 🚀 Tech Stack

- **Framework:** Next.js 16.2.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS 4
- **State Management:** Zustand
- **Code Editor:** Monaco Editor
- **UI Components:** Custom component library
- **Theme:** next-themes (Dark/Light mode)
- **Charts:** Recharts
- **Animation:** Framer Motion

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── (public)/          # Public pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── editor/           # Code editor components
│   ├── layout/           # Layout components
│   ├── learning/         # Learning components
│   ├── problems/         # Problem components
│   └── ui/               # UI primitives
├── lib/                  # Utilities and helpers
├── services/             # API service layer
├── store/                # Zustand state stores
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── constants/            # App constants
├── mocks/                # Mock data
└── public/               # Static assets
```

## 🛠️ Installation

```bash
npm install
```

## 🏃 Development

```bash
npm run dev
```

Frontend will run on [http://localhost:3000](http://localhost:3000)

## 🏗️ Build

```bash
npm run build
npm start
```

## 📖 Key Features

### UI Components (85% Complete)
- ✅ Authentication pages (Login, Signup, Forgot Password, Reset Password)
- ✅ Dashboard with analytics and stats
- ✅ Problem listing with advanced filtering
- ✅ Monaco code editor with multi-language support
- ✅ Responsive navigation (Navbar + Sidebar)
- ✅ Dark/Light theme switching
- ✅ Loading states and error boundaries

### State Management
- **editorStore** - Code editor settings and state
- **authStore** - Authentication state
- **notificationStore** - Toast notifications
- **sidebarStore** - Sidebar collapse state
- **themeStore** - Theme preferences

### API Integration
Located in `services/` directory:
- `auth.service.ts` - Authentication APIs (fully integrated)
- `problems.service.ts` - Problem data APIs (fully integrated)
- `submissions.service.ts` - Submission APIs
- `contests.service.ts` - Contest APIs
- `profile.service.ts` - User profile APIs

The frontend is fully connected to the backend API services for user session management, authentication, statistics, and problems.

## 🔗 Backend Integration

The frontend uses `fetcher` and `api` utility helpers configured with a JSON/JWT Bearer auth header. By default, the frontend points to the base URL specified in `NEXT_PUBLIC_API_BASE_URL`.

## 📚 Documentation

- [Frontend Architecture](./docs/FRONTEND_ARCHITECTURE.md)
- [State Management](./docs/STATE_MANAGEMENT.md)
- [Theme System](./docs/THEME_SYSTEM.md)
- [Routing System](./docs/ROUTING_SYSTEM.md)
- [API Integration Guide](./docs/API_INTEGRATION_GUIDE.md)

## 🎨 Design System

Custom design tokens configured in TailwindCSS:
- Colors: Brand orange (#FF6A00), card backgrounds, borders
- Typography: Custom font stack with Inter
- Spacing: Consistent spacing scale
- Shadows: Multiple shadow levels
- Border radius: Consistent corner rounding

## 🧪 Testing

```bash
npm run test  # Not yet implemented
```

## 📦 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_ENV=development
```

## 🚢 Deployment

See [DevOps Repository](../fullprep-devops/README.md) for deployment instructions.

## 👥 Contributors

- **Member 1** - Frontend Lead

## 📄 License

MIT
