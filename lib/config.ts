export const config = {
  // Email System Configuration
  email: {
    enabled: process.env.ENABLE_EMAIL_SYSTEM === 'true', // Defaults to false if not set
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@globallearningcenter.com',
      adminEmail: process.env.ADMIN_EMAIL || 'admin@globallearningcenter.com',
    },
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // App Configuration
  app: {
    name: 'Global Learning Center',
    description: 'Interactive learning platform for students worldwide — any course, any subject',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Feature Flags
  features: {
    assessment: true,
    emailNotifications: process.env.ENABLE_EMAIL_SYSTEM === 'true', // Defaults to false
    studyGroups: true,
    progressTracking: true,
    achievements: true,
  }
}

// Helper function to check if email system is enabled
export const isEmailEnabled = () => config.email.enabled

// Helper function to get email configuration
export const getEmailConfig = () => config.email

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof config.features) => {
  return config.features[feature]
}
