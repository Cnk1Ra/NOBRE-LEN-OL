'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface UserContextType {
  profile: UserProfile
  updateProfile: (profile: UserProfile) => void
  getInitials: () => string
  getFullName: () => string
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const defaultProfile: UserProfile = {
  firstName: 'Admin',
  lastName: 'DOD',
  email: 'admin@dashondelivery.com',
  phone: '11 99999-9999',
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('dod-profile')
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        // Clean phone number - remove country code prefix if present
        if (parsed.phone && parsed.phone.startsWith('+')) {
          // Remove +XX prefix (e.g., +55, +351, +1)
          parsed.phone = parsed.phone.replace(/^\+\d{1,3}\s*/, '')
        }
        setProfile(parsed)
      } catch {
        // Invalid JSON, use default
      }
    }
  }, [])

  const updateProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile)
    // Save to localStorage
    localStorage.setItem('dod-profile', JSON.stringify(newProfile))
  }, [])

  const getInitials = useCallback(() => {
    const firstInitial = profile.firstName.charAt(0).toUpperCase()
    const lastInitial = profile.lastName.charAt(0).toUpperCase()
    return `${firstInitial}${lastInitial}`
  }, [profile])

  const getFullName = useCallback(() => {
    return `${profile.firstName} ${profile.lastName}`
  }, [profile])

  return (
    <UserContext.Provider
      value={{
        profile,
        updateProfile,
        getInitials,
        getFullName,
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
