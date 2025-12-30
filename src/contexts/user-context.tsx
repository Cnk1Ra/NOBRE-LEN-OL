'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
}

interface UserContextType {
  profile: UserProfile
  updateProfile: (profile: UserProfile) => void
  updateAvatar: (avatar: string | null) => void
  getInitials: () => string
  getFullName: () => string
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatar: undefined,
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isLoading, setIsLoading] = useState(true)

  // Sync profile with NextAuth session
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (session?.user) {
      // Parse name from session
      const nameParts = (session.user.name || '').split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      setProfile({
        firstName,
        lastName,
        email: session.user.email || '',
        phone: localStorage.getItem('dod-phone') || '',
        avatar: session.user.image || localStorage.getItem('dod-avatar') || undefined,
      })
    } else {
      // Not logged in - check localStorage for backwards compatibility
      const savedProfile = localStorage.getItem('dod-profile')
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          if (parsed.phone && parsed.phone.startsWith('+')) {
            parsed.phone = parsed.phone.replace(/^\+\d{1,3}\s*/, '')
          }
          setProfile(parsed)
        } catch {
          setProfile(defaultProfile)
        }
      }
      const savedAvatar = localStorage.getItem('dod-avatar')
      if (savedAvatar) {
        setProfile(prev => ({ ...prev, avatar: savedAvatar }))
      }
    }
    setIsLoading(false)
  }, [session, status])

  const updateProfile = useCallback((newProfile: UserProfile) => {
    setProfile(prev => ({ ...newProfile, avatar: prev.avatar }))
    // Save phone to localStorage (will be migrated to DB later)
    localStorage.setItem('dod-phone', newProfile.phone || '')
    // Save profile for offline/non-logged users
    const { avatar, ...profileWithoutAvatar } = newProfile
    localStorage.setItem('dod-profile', JSON.stringify(profileWithoutAvatar))
  }, [])

  const updateAvatar = useCallback((avatar: string | null) => {
    setProfile(prev => ({ ...prev, avatar: avatar || undefined }))
    if (avatar) {
      localStorage.setItem('dod-avatar', avatar)
    } else {
      localStorage.removeItem('dod-avatar')
    }
  }, [])

  const getInitials = useCallback(() => {
    const firstInitial = (profile.firstName || 'U').charAt(0).toUpperCase()
    const lastInitial = (profile.lastName || '').charAt(0).toUpperCase()
    return lastInitial ? `${firstInitial}${lastInitial}` : firstInitial
  }, [profile])

  const getFullName = useCallback(() => {
    if (!profile.firstName && !profile.lastName) {
      return 'Usuário'
    }
    return `${profile.firstName} ${profile.lastName}`.trim()
  }, [profile])

  return (
    <UserContext.Provider
      value={{
        profile,
        updateProfile,
        updateAvatar,
        getInitials,
        getFullName,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
