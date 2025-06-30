# SubHub - Subscription Management System

A modern, production-ready subscription management application built with React, TypeScript, and Supabase. Track, manage, and optimize your recurring expenses with multi-currency support and Italian localization.

🌐 **Live Demo**: [SubHub on Vercel](https://subhub-app.vercel.app)

## ✨ Features

### 🎯 Core Functionality
- ✅ **Complete Subscription Management**: Add, edit, delete, and track all your subscriptions
- ✅ **Real-time Dashboard**: Interactive insights with spending trends and renewal forecasts
- ✅ **Smart Categories**: Organize subscriptions with color-coded categories
- ✅ **Advanced Analytics**: Detailed reports with charts and savings opportunities
- ✅ **Renewal Tracking**: Never miss a payment with upcoming renewal notifications

### 🌍 Localization & Currency
- ✅ **Multi-Currency Support**: EUR (€29,99) and USD ($29.99) with real-time switching
- ✅ **Italian Language Support**: Complete UI translation with "Italiano" language option
- ✅ **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- ✅ **Real-time Updates**: Currency and language changes apply immediately without page refresh

### 🔐 Authentication & Data
- ✅ **Secure Authentication**: Powered by Supabase Auth with email/password
- ✅ **Real Database**: PostgreSQL backend with Row Level Security (RLS)
- ✅ **User Profiles**: Personalized settings with currency and language preferences
- ✅ **Data Persistence**: All changes saved automatically to the cloud

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Modern web browser

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ParnassusX/SubHub.git
   cd SubHub
   ```

2. **Navigate to the app directory**:
   ```bash
   cd app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

### Test Account
Use these credentials to explore the application:
- **Email**: `test@subhub.com`
- **Password**: `test123456`

## 📁 Project Structure

```
SubHub/
├── app/                   # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Subscriptions)
│   │   ├── hooks/         # Custom hooks (useCurrency, useTranslation)
│   │   ├── pages/         # Page components (Dashboard, Settings, etc.)
│   │   ├── utils/         # Utility functions (localization, analytics)
│   │   ├── lib/           # External library configurations (Supabase)
│   │   └── styles/        # CSS and design system
│   ├── public/            # Static assets
│   ├── package.json       # App dependencies
│   └── vite.config.ts     # Vite configuration
├── docs/                  # Documentation and planning files
├── README.md              # This file
└── vercel.json           # Vercel deployment configuration
```

## 🎯 Current Status

**✅ PRODUCTION READY** - SubHub is a fully functional subscription management application

**Core Application** ✅
- [x] React 18 with TypeScript
- [x] Supabase backend with PostgreSQL
- [x] User authentication and profiles
- [x] Real-time subscription management
- [x] Advanced analytics and reporting

**Localization System** ✅
- [x] Multi-currency support (EUR/USD)
- [x] Italian language translation
- [x] Real-time currency/language switching
- [x] Responsive design (mobile/tablet/desktop)

**Production Deployment** ✅
- [x] Deployed on Vercel
- [x] Automatic GitHub integration
- [x] TypeScript strict mode
- [x] Optimized build pipeline

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React
- **Routing**: React Router v6

### Backend & Database
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: Supabase for user preferences and data

### Localization & Currency
- **Currency System**: Custom `useCurrency` hook with real-time switching
- **Localization**: Custom `useTranslation` hook for Italian/English
- **Formatting**: Italian locale (€29,99) and US locale ($29.99)
- **Storage**: User preferences saved to Supabase profiles

### Deployment & DevOps
- **Hosting**: Vercel with automatic deployments
- **CI/CD**: GitHub integration with automatic builds
- **Domain**: Custom subdomain on Vercel
- **Performance**: Optimized bundle splitting and lazy loading

## 💻 Development Guide

### Currency System Usage

The application includes a comprehensive currency formatting system. Here's how to use it:

```typescript
import { useCurrency } from '../hooks/useCurrency';

const MyComponent = () => {
  const { formatPrice, currency } = useCurrency();

  return (
    <div>
      <p>Current currency: {currency}</p>
      <p>Price: {formatPrice(29.99)}</p>
      {/* Displays: €29,99 (EUR) or $29.99 (USD) */}
    </div>
  );
};
```

### Translation System Usage

For Italian language support:

```typescript
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t, language } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard')}</h1>
      {/* Displays: "Dashboard" (EN) or "Cruscotto" (IT) */}
    </div>
  );
};
```

### Adding New Translations

1. Update `src/utils/localization.ts`:
```typescript
export const translations = {
  en: {
    'new_key': 'English text'
  },
  it: {
    'new_key': 'Testo italiano'
  }
};
```

2. Use in components:
```typescript
const text = t('new_key');
```

## 📝 Development Commands

```bash
# Navigate to app directory
cd app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run TypeScript checks
npm run type-check

# Lint code
npm run lint
```

## 🧪 Testing

### Manual Testing
1. **Currency Switching**:
   - Go to Settings → Profile → Change Currency
   - Verify all prices update immediately

2. **Language Switching**:
   - Go to Settings → Appearance → Change Language
   - Verify UI translates to Italian/English

3. **Responsive Design**:
   - Test on mobile (320px-768px)
   - Test on tablet (768px-1024px)
   - Test on desktop (1024px+)

### Test Account
- **Email**: `test@subhub.com`
- **Password**: `test123456`

## 🚀 Deployment

The application is automatically deployed to Vercel on every push to the main branch.

### Manual Deployment
```bash
# Build the application
cd app && npm run build

# Deploy to Vercel (if configured)
vercel --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Live Application**: [SubHub on Vercel](https://subhub-app.vercel.app)
- **Issues**: [GitHub Issues](https://github.com/ParnassusX/SubHub/issues)
- **Documentation**: Check this README and inline code comments

## 🏗️ Architecture Notes

- **Single Source of Truth**: All data flows through Supabase
- **Simplified Approach**: Avoided over-engineering for maintainability
- **Real-time Updates**: Currency/language changes apply immediately
- **Mobile-first**: Responsive design prioritizes mobile experience
- **Production-ready**: Built with TypeScript strict mode and comprehensive error handling