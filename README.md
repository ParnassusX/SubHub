# SubHub - Subscription Management System

A comprehensive subscription management tool designed to help users track, manage, and optimize their recurring expenses across all services.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Installation & Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd SubHub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

### Alternative: Quick Python Server
If you don't have Node.js installed, you can use Python's built-in server:

```bash
# Python 3
cd public
python -m http.server 3000

# Python 2
cd public
python -m SimpleHTTPServer 3000
```

## 📁 Project Structure

```
SubHub/
├── public/                 # Static HTML files
│   ├── index.html         # Navigation homepage
│   ├── dashboard.html     # Main dashboard
│   ├── add-subscriptions.html
│   ├── subscription-details.html
│   ├── reports.html
│   ├── categories.html
│   ├── settings.html
│   ├── notifications-center.html
│   ├── import-exports.html
│   ├── subscriptions-offers.html
│   ├── subscriptions-plans.html
│   ├── help-page.html
│   ├── contact-us.html
│   └── landing-page.html
├── assets/                # Static assets (CSS, JS, images)
│   ├── css/
│   ├── js/
│   └── images/
├── package.json           # Node.js dependencies
├── PRD.md                # Product Requirements Document
└── README.md             # This file
```

## 🎯 Current Status

**Phase 1: Static Prototype** ✅
- [x] UI/UX design complete
- [x] All pages created with responsive design
- [x] TailwindCSS styling
- [x] Navigation system
- [x] Linux-compatible file structure

**Phase 2: Interactive Frontend** 🚧
- [ ] Convert to React.js/Vue.js
- [ ] Add JavaScript functionality
- [ ] Form validation and interactions
- [ ] Local storage for data persistence
- [ ] Single-page application routing

**Phase 3: Backend Integration** 📋
- [ ] Node.js/Express API
- [ ] Database integration (SQLite/PostgreSQL)
- [ ] User authentication
- [ ] Real subscription management
- [ ] Notification system

**Phase 4: Advanced Features** 📋
- [ ] PWA capabilities
- [ ] Docker deployment
- [ ] Multi-currency support
- [ ] Analytics and reporting
- [ ] Import/export functionality

## 🛠️ Technology Stack

### Current (Phase 1)
- **Frontend**: Static HTML, TailwindCSS, Vanilla JavaScript
- **Fonts**: Google Fonts (Space Grotesk, Noto Sans)
- **Icons**: Inline SVG
- **Development**: Node.js serve package

### Planned (Future Phases)
- **Frontend Framework**: React.js
- **Backend**: Node.js with Express
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Build Tool**: Vite or Create React App
- **Deployment**: Docker containers

## 🌟 Features

### Core Features (MVP)
- ✅ Subscription tracking interface
- ✅ Dashboard with calendar view
- ✅ Category organization
- ✅ Responsive design
- ⏳ Add/edit/delete subscriptions
- ⏳ Payment reminders
- ⏳ Cost calculations

### Premium Features (Planned)
- ⏳ Advanced analytics
- ⏳ Multi-currency support
- ⏳ Family sharing
- ⏳ Bank integration
- ⏳ Optimization suggestions

## 🐧 Linux Development Notes

This project has been optimized for Linux development:
- ✅ File names use kebab-case (no spaces)
- ✅ Proper directory structure
- ✅ Case-sensitive file handling
- ✅ POSIX-compliant scripts

## 📝 Development Commands

```bash
# Start development server
npm start

# Start with live reload (if supported)
npm run dev

# Install new dependencies
npm install <package-name>

# View project structure
tree public/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check the Help page: `http://localhost:3000/help-page.html`
- Contact form: `http://localhost:3000/contact-us.html`
- Issues: Create a GitHub issue