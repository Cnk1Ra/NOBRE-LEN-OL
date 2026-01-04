'use client'

import { SessionProvider } from 'next-auth/react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/toaster'
import { DateFilterProvider } from '@/contexts/date-filter-context'
import { NotificationsProvider } from '@/contexts/notifications-context'
import { CountryProvider } from '@/contexts/country-context'
import { UserProvider } from '@/contexts/user-context'
import { LanguageProvider } from '@/contexts/language-context'
import { MetaProvider } from '@/contexts/meta-context'
import { TrackingProvider } from '@/contexts/tracking-context'
import { TutorialProvider } from '@/contexts/tutorial-context'
import { TutorialModal } from '@/components/tutorial/tutorial-modal'
import { DashboardLayoutProvider } from '@/contexts/dashboard-layout-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <UserProvider>
          <DateFilterProvider>
            <NotificationsProvider>
              <CountryProvider>
                <MetaProvider>
                <TrackingProvider>
                <TutorialProvider>
                <DashboardLayoutProvider>
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <Header />
                      <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
                        {children}
                      </main>
                    </div>
                  </div>
                  <TutorialModal />
                  <Toaster />
                </DashboardLayoutProvider>
                </TutorialProvider>
                </TrackingProvider>
                </MetaProvider>
              </CountryProvider>
            </NotificationsProvider>
          </DateFilterProvider>
        </UserProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
