'use client'

import React, { useRef, useEffect, useState } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  Clock 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { VideoLesson } from '@/types/course'
import toast from 'react-hot-toast'

interface VideoPlayerProps {
  currentLesson: VideoLesson | null
  isPlaying: boolean
  onPlayPause: () => void
  onTimeUpdate: (time: number) => void
  onVolumeChange: (volume: number) => void
  onProgressChange: (progress: number) => void
  currentTime: number
  duration: number
  videoProgress: number
  videoVolume: number
  isFullscreen: boolean
  onFullscreenToggle: () => void
}

const COMPLETION_THRESHOLD = 90

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentLesson,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
  onVolumeChange,
  onProgressChange,
  currentTime,
  duration,
  videoProgress,
  videoVolume,
  isFullscreen,
  onFullscreenToggle
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  // Handle video progress change
  const handleVideoProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value)
    onProgressChange(newProgress)
    
    if (videoRef.current) {
      const newTime = (newProgress / 100) * duration
      videoRef.current.currentTime = newTime
      onTimeUpdate(newTime)
    }
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    onVolumeChange(newVolume)
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle video events
  const handleLoadStart = () => {
    console.log('Video load started')
    onTimeUpdate(0)
    onProgressChange(0)
  }

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    console.log('Video metadata loaded:', { duration: video.duration, videoUrl: currentLesson?.videoUrl })
    if (video.duration && isFinite(video.duration)) {
      onTimeUpdate(video.duration)
    }
  }

  const handleCanPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    console.log('Video can play:', { duration: video.duration, currentTime: video.currentTime })
    if (video.duration && isFinite(video.duration)) {
      onTimeUpdate(video.duration)
    }
    
    // Set initial volume
    if (videoRef.current) {
      videoRef.current.volume = videoVolume
    }
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    const currentTime = video.currentTime
    const videoDuration = video.duration
    
    onTimeUpdate(currentTime)
    
    // Update duration if it's valid and different
    if (videoDuration && isFinite(videoDuration) && videoDuration !== duration) {
      onTimeUpdate(videoDuration)
    }
    
    // Calculate and update video progress
    if (videoDuration && isFinite(videoDuration) && videoDuration > 0) {
      const progressPercentage = (currentTime / videoDuration) * 100
      onProgressChange(progressPercentage)
    }
  }

  const handleEnded = () => {
    console.log('Video ended')
    console.log('Video progress at end:', videoProgress)
    console.log('Completion threshold:', COMPLETION_THRESHOLD)
    onPlayPause() // This will set isPlaying to false
    
    // Show completion message
    if (videoProgress >= COMPLETION_THRESHOLD) {
      console.log('Lesson completed with sufficient progress')
      toast.success('Lesson completed! Great job!')
    } else {
      console.log('Lesson not completed due to insufficient progress')
      toast(`Please watch at least ${COMPLETION_THRESHOLD}% of the lesson to mark it as completed`, { icon: 'ℹ️' })
    }
  }

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video error:', e)
    toast.error('Error loading video. Please try again.')
  }

  // Auto-play when lesson changes
  useEffect(() => {
    if (videoRef.current && currentLesson) {
      videoRef.current.load()
      if (isPlaying) {
        videoRef.current.play().catch(console.error)
      }
    }
  }, [currentLesson?.id, isPlaying])

  // Handle play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error)
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  if (!currentLesson) {
    return (
      <div className="bg-black aspect-video flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg">No lesson selected</p>
          <p className="text-sm text-gray-400">Please select a lesson to start learning</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black relative">
      <div className="aspect-video relative">
        {/* Video Loading Indicator */}
        {duration <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Loading video...</p>
            </div>
          </div>
        )}
        
        {/* Video Player */}
        <video
          key={currentLesson.id}
          ref={videoRef}
          className="w-full h-full"
          poster={currentLesson.thumbnail}
          controls={false}
          preload="metadata"
          onLoadStart={handleLoadStart}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleError}
        >
          <source src={currentLesson.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-4">
          <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between">
            {/* Top row on mobile - Progress info */}
            <div className="flex items-center justify-between md:hidden">
              <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                Progress: {Math.round(videoProgress)}%
                {videoProgress >= COMPLETION_THRESHOLD && !currentLesson.isWatched && (
                  <span className="ml-2 text-green-400">✓ 90%</span>
                )}
              </div>
              <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            {/* Progress Bar - Full width on desktop */}
            <div className="flex-1 md:flex-none md:w-full">
              <input
                type="range"
                min="0"
                max="100"
                value={videoProgress}
                onChange={handleVideoProgress}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${videoProgress}%, #4b5563 ${videoProgress}%, #4b5563 100%)`
                }}
              />
            </div>
            
            {/* Control Buttons - Properly spaced on desktop */}
            <div className="flex items-center justify-between md:justify-end md:space-x-4 md:flex-shrink-0">
              {/* Left side controls */}
              <div className="flex items-center space-x-2">
                {/* Play/Pause Button */}
                <Button
                  onClick={onPlayPause}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                {/* Volume Control */}
                <div className="relative">
                  <Button
                    onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                  {showVolumeSlider && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 rounded-lg p-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={videoVolume}
                        onChange={handleVolumeChange}
                        className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${videoVolume * 100}%, #4b5563 ${videoVolume * 100}%, #4b5563 100%)`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Center - Time Display on desktop */}
              <div className="hidden md:flex items-center space-x-2 text-white text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              {/* Right side controls */}
              <div className="flex items-center space-x-2">
                {/* Fullscreen Button */}
                <Button
                  onClick={onFullscreenToggle}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Indicator for Mobile */}
        <div className="absolute top-2 left-2 md:hidden">
          <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
            {Math.round(videoProgress)}%
          </div>
        </div>
      </div>
    </div>
  )
}
