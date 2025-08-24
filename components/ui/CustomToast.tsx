import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
}

const toastStyles = {
  success: {
    background: '#10B981',
    color: '#fff',
    icon: CheckCircle,
    iconColor: '#fff'
  },
  error: {
    background: '#EF4444',
    color: '#fff',
    icon: XCircle,
    iconColor: '#fff'
  },
  warning: {
    background: '#F59E0B',
    color: '#fff',
    icon: AlertCircle,
    iconColor: '#fff'
  },
  info: {
    background: '#3B82F6',
    color: '#fff',
    icon: Info,
    iconColor: '#fff'
  }
}

export function CustomToast({ message, type, onClose }: ToastProps) {
  const style = toastStyles[type]
  const Icon = style.icon

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg shadow-lg border-l-4 min-w-[300px] max-w-[400px]"
      style={{
        background: style.background,
        color: style.color,
        borderLeftColor: style.iconColor
      }}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" style={{ color: style.iconColor }} />
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Toast utility functions
export const showToast = {
  success: (message: string) => {
    // This would integrate with react-hot-toast
    console.log('Success toast:', message)
  },
  error: (message: string) => {
    console.log('Error toast:', message)
  },
  warning: (message: string) => {
    console.log('Warning toast:', message)
  },
  info: (message: string) => {
    console.log('Info toast:', message)
  }
}
