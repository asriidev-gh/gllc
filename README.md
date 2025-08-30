# Language Training Center for Kids

A comprehensive language learning platform designed specifically for children, offering interactive courses in multiple languages with engaging content and progress tracking.

## 🌟 Features

### 🌍 **Comprehensive Internationalization (i18n)**
- **Multi-Language Support**: Full translation support for English, Spanish, Tagalog, Korean, and Japanese
- **Dynamic Language Switching**: Real-time language changes with persistent user preferences
- **Localized Content**: All UI elements, achievements, settings, and course content properly translated
- **Cultural Adaptation**: Content adapted for different cultural contexts and learning preferences

### 🎯 **Smart Video Player**
- **Professional Controls**: Desktop-wide layout with left-center-right control distribution
- **Smart Visibility**: Controls visible on click (mobile) and mouseover (desktop)
- **Click-to-Play**: Click anywhere on video to toggle play/pause
- **Auto-hide**: Controls automatically hide after 3 seconds of inactivity
- **Pause State Lock**: Controls remain visible when video is paused
- **Keyboard Shortcuts**: Spacebar to toggle play/pause

### 📚 **Course Management**
- **Interactive Lessons**: Engaging video content with progress tracking
- **Collapsible Sidebar**: Course content sidebar that can be collapsed/expanded
- **Progress Tracking**: Real-time progress monitoring and completion certificates
- **Assessment System**: Comprehensive language proficiency evaluations

### 📊 **Assessment History**
- **General Language Assessments**: Track English, Tagalog, Korean, Japanese proficiency
- **Detailed Results**: View scores, levels, completion dates, and time spent
- **Progress Monitoring**: Visual indicators for passed/failed assessments
- **Historical Data**: Complete assessment history with sorting and filtering

### 🏆 **Achievement System**
- **Progress-Based**: Unlock achievements as you complete courses and lessons
- **Visual Rewards**: Beautiful achievement badges and progress indicators
- **Learning Streaks**: Track consecutive days of learning activity

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all device sizes
- **Touch-Friendly**: Intuitive mobile navigation and controls
- **Cross-Platform**: Consistent experience across devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
git clone [repository-url]
cd LanguageTrainingCenterForKids
npm install
npm run dev
```

### Environment Setup
Create a `.env.local` file with:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **State Management**: React Hooks, Context API
- **Data Storage**: LocalStorage, IndexedDB
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
├── app/                    # Next.js 14 app directory
│   ├── courses/           # Course pages and components
│   ├── dashboard/         # User dashboard
│   ├── assessment/        # Language assessment system
│   └── profile/           # User profile management
├── components/            # Reusable React components
├── lib/                   # Utility functions and helpers
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Style
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement responsive design patterns
- Follow React hooks guidelines

## 📊 Assessment System

### General Language Assessments
The platform provides comprehensive language proficiency evaluations:

- **English**: Beginner to Advanced levels
- **Tagalog**: Filipino language proficiency
- **Korean**: Korean language skills
- **Japanese**: Japanese language assessment

### Assessment Features
- **Adaptive Questions**: Questions adjust based on user performance
- **Time Tracking**: Monitor assessment completion time
- **Score Calculation**: Percentage-based scoring with pass/fail thresholds
- **Progress History**: Complete assessment history with detailed analytics

## 🎨 UI/UX Features

### Video Player Controls
- **Desktop Layout**: Wide control distribution with proper alignment
- **Mobile Optimization**: Touch-friendly controls and gestures
- **Smart Visibility**: Context-aware control display
- **Professional Experience**: Industry-standard video player behavior

### Course Content Sidebar
- **Collapsible Design**: Expandable/collapsible sidebar for better space utilization
- **Responsive Behavior**: Adapts to different screen sizes
- **Header Integration**: Proper z-index management to prevent overlaps

## 📈 Performance & Optimization

- **Fast Refresh**: Next.js Fast Refresh for rapid development
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component for optimized images
- **Bundle Analysis**: Built-in bundle analyzer for performance monitoring

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Other Platforms
- **Netlify**: Compatible with Next.js static export
- **AWS Amplify**: Full-stack deployment solution
- **Docker**: Containerized deployment option

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues and discussions

## 🔄 Version History

### v3.0.4 (Current)
- 🌍 **NEW**: Comprehensive Internationalization (i18n) System
  - Full translation support for English, Spanish, Tagalog, Korean, and Japanese
  - Dynamic language switching with persistent user preferences
  - Localized content for all UI elements, achievements, settings, and course content
  - Cultural adaptation for different learning contexts
- ✨ **NEW**: Achievement System with Multi-Language Support
  - Progress-based achievements with localized titles and descriptions
  - Learning streak tracking and milestone achievements
  - Language diversity and assessment completion badges
- ✨ **NEW**: Settings Page with Localized Quick Actions
  - Password management with translated interface
  - Notification preferences and appearance settings
  - Language and region configuration
- 🐛 **FIXED**: All hardcoded strings replaced with translation keys
- 🎨 **IMPROVED**: Consistent user experience across all supported languages

### v3.0.3
- ✨ **NEW**: Assessment History Modal for General Language Assessments
- ✨ **NEW**: Smart Video Player Controls with Auto-hide
- ✨ **NEW**: Click-anywhere-to-play Video Functionality
- ✨ **NEW**: Collapsible Course Content Sidebar
- 🐛 **FIXED**: Video Player Controls Alignment on Desktop
- 🐛 **FIXED**: Course Content Sidebar Header Overlap
- 🐛 **FIXED**: Assessment History Empty State
- 🎨 **IMPROVED**: Video Player UX with Professional Controls
- 🎨 **IMPROVED**: Responsive Design for Mobile and Desktop

### v3.0.2
- Enhanced video player functionality
- Improved course navigation
- Bug fixes and performance improvements

### v3.0.1
- Initial release with core features
- Basic course management
- User authentication system

---

**Built with ❤️ for children's language learning**
