# SubHub - Modern Subscription Management Platform

A modern, comprehensive subscription management tool built with React, TypeScript, and Supabase to help you track, manage, and optimize your recurring subscriptions.

## 🚀 Features

- **Modern React Application**: Built with React 18, TypeScript, and Vite
- **Dashboard Overview**: Get a bird's eye view of all your subscriptions
- **Subscription Tracking**: Add, edit, and manage individual subscriptions  
- **Analytics & Reports**: Understand your spending patterns
- **Categories**: Organize subscriptions by type
- **Notifications**: Never miss a renewal or payment
- **Authentication**: Secure user authentication with Supabase
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Modern dark UI with TailwindCSS

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS with custom design system
- **Backend**: Supabase (Authentication, Database, Real-time)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🏗️ Project Structure

```
SubHub/
├── app/                    # Main React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json       # App dependencies
├── public/                # Legacy HTML pages (reference)
├── package.json           # Root project scripts
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd SubHub
   ```

2. **Install dependencies**:
   ```bash
   npm run install-deps
   ```

3. **Set up environment variables**:
   ```bash
   cd app
   cp .env.example .env
   ```
   
   Fill in your Supabase credentials in `app/.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## 📜 Available Scripts

From the root directory:

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run install-deps` - Install app dependencies

## 🎨 Design System

The application uses a modern dark theme with:
- **Colors**: Custom CSS variables for consistent theming
- **Typography**: Space Grotesk font family
- **Components**: Reusable UI components with TailwindCSS
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first responsive design

## 🔐 Authentication

SubHub uses Supabase Auth with support for:
- Email/password authentication
- OAuth providers (Google, GitHub)
- Protected routes
- User session management

## 🚀 Deployment

The app is designed to be deployed on Vercel with Supabase as the backend:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## 📋 Development Status

- [x] Modern React setup with TypeScript
- [x] Authentication system with Supabase  
- [x] Responsive UI with TailwindCSS
- [x] Navigation and routing
- [x] Development server running on port 3000
- [x] TailwindCSS animations working
- [ ] Subscription CRUD operations
- [ ] Real-time features
- [ ] Payment integration
- [ ] Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**🎉 The React application is now running successfully at http://localhost:3000**
