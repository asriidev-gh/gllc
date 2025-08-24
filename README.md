# Global Language Training Center

A comprehensive language learning platform built with Next.js, designed to help students worldwide master languages through interactive courses, AI-powered assessments, and personalized learning paths.

## 🌟 Features

### Core Learning Features
- **Interactive Video Lessons** - Learn through curated video content with progress tracking
- **AI-Powered Assessments** - Dynamic exams that adapt to your learning level
- **Multi-Language Support** - Tagalog, English, Korean, Japanese, Chinese, Spanish
- **Progress Tracking** - Monitor your learning journey with detailed analytics
- **Certificate System** - Earn certificates upon course completion

### User Experience
- **Personalized Dashboard** - Track your enrolled courses and learning progress
- **Course Management** - Enroll, unenroll, and continue learning seamlessly
- **Notes Taking** - Save personal notes for each lesson
- **Bookmarking** - Mark important lessons for quick access
- **Discussion Forums** - Engage with other learners and instructors

### Technical Features
- **Responsive Design** - Works perfectly on all devices
- **Dark/Light Theme** - Customizable appearance settings
- **Real-time Progress** - Instant updates on your learning status
- **Offline Resources** - Download course materials for offline study
- **Audit Logging** - Track user actions and system events

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/asriidev-gh/gllc.git
   cd gllc
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
gllc/
├── app/                    # Next.js 13+ app directory
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin panel routes
│   ├── assessment/        # Language assessment
│   ├── courses/           # Course management
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profile
│   ├── settings/          # User settings
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── sections/         # Page sections
├── stores/               # Zustand state management
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🎯 Key Technologies

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Authentication**: Custom auth system with localStorage
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📱 Pages & Routes

### Public Pages
- `/` - Home page with course overview
- `/courses` - Browse all available courses
- `/about` - About the platform
- `/contact` - Contact information
- `/assessment` - Language assessment test

### User Pages (Requires Authentication)
- `/dashboard` - User dashboard with enrolled courses
- `/profile` - User profile management
- `/settings` - User preferences and account settings
- `/achievements` - User achievements and badges
- `/courses/[courseId]` - Individual course learning page

### Admin Pages
- `/admin/audit` - System audit logs

## 🔐 Authentication

The platform uses a custom authentication system with:
- User registration and login
- Demo user creation for testing
- Session persistence with localStorage
- Protected route handling

## 🎨 Customization

### Theme Settings
- Light/Dark mode toggle
- Font size adjustments
- Color scheme preferences
- Notification preferences

### Language & Region
- Timezone selection
- Date format preferences
- Language interface options

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Create a `.env.local` file for local development:
```env
NEXT_PUBLIC_APP_NAME="Global Language Training Center"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js and React
- Styled with Tailwind CSS
- Icons from Lucide React
- Animations powered by Framer Motion

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

**Built with ❤️ for language learners worldwide**
