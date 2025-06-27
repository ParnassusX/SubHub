# SubHub - Subscription Management Platform

A modern, full-stack subscription management platform built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Live Demo

**Production URL**: [Deploy to Vercel - Ready for GitHub Integration]

## ✨ Features

- **🔐 User Authentication**: Secure login/registration with Supabase Auth
- **📊 Dashboard Analytics**: Real-time insights into subscription spending
- **💳 Subscription Management**: Full CRUD operations for subscriptions
- **📈 Spending Analytics**: Track monthly and yearly spending patterns
- **🔔 Smart Notifications**: Alerts for upcoming renewals and payments
- **📱 Responsive Design**: Seamless experience on desktop, tablet, and mobile
- **👨‍💼 Admin Dashboard**: Advanced analytics and user management (admin-only)
- **🎨 Modern UI**: Clean, intuitive interface with dark theme
- **🔒 Role-Based Access**: Admin and regular user permissions
- **💾 Real-Time Data**: Live data persistence with Supabase

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Recharts** - Beautiful, responsive charts
- **Lucide React** - Modern icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Row Level Security (RLS)** - Database-level security
- **Real-time subscriptions** - Live data updates

### Testing & Quality
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/SubHub.git
cd SubHub
```

2. **Install dependencies**:
```bash
cd app
npm install
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open in browser**: [http://localhost:5173](http://localhost:5173)

### Test Credentials

- **Admin User**: `test@subhub.com` / `test123456`
- **Features**: Full access to admin dashboard and user features

## 📁 Project Structure

```
SubHub/
├── app/                    # Main React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Subscriptions)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Supabase client and utilities
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── tests/              # Playwright E2E tests
│   ├── public/             # Static assets
│   └── dist/               # Production build output
├── vercel.json             # Vercel deployment configuration
└── README.md               # This file
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run Playwright tests
npm run test:ui      # Run tests with UI
npm run test:headed  # Run tests in headed mode

# Code Quality
npm run lint         # Run ESLint
```

## 🌐 Deployment

### Automatic Deployment with Vercel

This project is configured for seamless deployment with Vercel:

1. **Connect to GitHub**: Link your GitHub repository to Vercel
2. **Auto-Deploy**: Vercel automatically detects the configuration and deploys
3. **Environment**: No additional environment variables needed (Supabase config is embedded)

### Manual Deployment

```bash
# Build the project
cd app
npm run build

# Deploy the dist/ folder to your hosting platform
```

## 🔒 Authentication & Security

- **Supabase Auth**: Secure authentication with email/password
- **Row Level Security**: Database-level access control
- **Role-Based Access**: Admin and user role separation
- **Session Management**: Automatic token refresh and persistence

## 📊 Database Schema

The application uses Supabase with the following main tables:
- `profiles` - User profiles with role information
- `subscriptions` - User subscription data
- `notifications` - User notifications

## 🧪 Testing

Comprehensive E2E testing with Playwright:

```bash
npm run test         # Run all tests
npm run test:ui      # Interactive test runner
npm run test:headed  # Run with browser UI
```

Test coverage includes:
- Authentication flows
- Subscription CRUD operations
- Dashboard functionality
- Admin access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](app/LICENSE.md) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/SubHub/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Subscription recommendations
- [ ] Advanced analytics
- [ ] Team collaboration features
- [ ] API integrations with popular services

---

**Built with ❤️ using React, TypeScript, and Supabase**
