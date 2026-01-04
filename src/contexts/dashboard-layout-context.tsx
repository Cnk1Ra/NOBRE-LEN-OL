'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export interface DashboardSection {
  id: string
  name: string
  description: string
  visible: boolean
  order: number
}

interface DashboardLayoutContextType {
  sections: DashboardSection[]
  toggleSection: (id: string) => void
  moveSection: (id: string, direction: 'up' | 'down') => void
  resetToDefault: () => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  isSectionVisible: (id: string) => boolean
  getOrderedVisibleSections: () => DashboardSection[]
}

const DashboardLayoutContext = createContext<DashboardLayoutContextType | undefined>(undefined)

const defaultSections: DashboardSection[] = [
  { id: 'main-stats', name: 'Estatisticas Principais', description: 'Faturamento, Lucro, Pedidos e Ticket Medio', visible: true, order: 1 },
  { id: 'cod-metrics', name: 'Metricas COD', description: 'Taxa de Entrega, Devolucao, ROAS e Visitantes', visible: true, order: 2 },
  { id: 'quick-actions', name: 'Acoes Rapidas', description: 'Pedidos pendentes, estoque baixo e em transito', visible: true, order: 3 },
  { id: 'charts', name: 'Graficos', description: 'Grafico de receita e estatisticas de entrega', visible: true, order: 4 },
  { id: 'traffic-orders', name: 'Trafego e Pedidos', description: 'Fontes de trafego e pedidos recentes', visible: true, order: 5 },
]

export function DashboardLayoutProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<DashboardSection[]>(defaultSections)
  const [isEditing, setIsEditing] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dod-dashboard-layout')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Merge with defaults to handle new sections
        const merged = defaultSections.map(defaultSection => {
          const savedSection = parsed.find((s: DashboardSection) => s.id === defaultSection.id)
          return savedSection ? { ...defaultSection, ...savedSection } : defaultSection
        })
        setSections(merged)
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, [])

  // Save to localStorage whenever sections change
  const saveSections = useCallback((newSections: DashboardSection[]) => {
    setSections(newSections)
    localStorage.setItem('dod-dashboard-layout', JSON.stringify(newSections))
  }, [])

  const toggleSection = useCallback((id: string) => {
    saveSections(sections.map(s =>
      s.id === id ? { ...s, visible: !s.visible } : s
    ))
  }, [sections, saveSections])

  const moveSection = useCallback((id: string, direction: 'up' | 'down') => {
    const currentSection = sections.find(s => s.id === id)
    if (!currentSection) return

    const sortedSections = [...sections].sort((a, b) => a.order - b.order)
    const currentIndex = sortedSections.findIndex(s => s.id === id)

    if (direction === 'up' && currentIndex > 0) {
      const prevSection = sortedSections[currentIndex - 1]
      const newSections = sections.map(s => {
        if (s.id === id) return { ...s, order: prevSection.order }
        if (s.id === prevSection.id) return { ...s, order: currentSection.order }
        return s
      })
      saveSections(newSections)
    } else if (direction === 'down' && currentIndex < sortedSections.length - 1) {
      const nextSection = sortedSections[currentIndex + 1]
      const newSections = sections.map(s => {
        if (s.id === id) return { ...s, order: nextSection.order }
        if (s.id === nextSection.id) return { ...s, order: currentSection.order }
        return s
      })
      saveSections(newSections)
    }
  }, [sections, saveSections])

  const resetToDefault = useCallback(() => {
    saveSections(defaultSections)
  }, [saveSections])

  const isSectionVisible = useCallback((id: string) => {
    const section = sections.find(s => s.id === id)
    return section?.visible ?? true
  }, [sections])

  const getOrderedVisibleSections = useCallback(() => {
    return sections
      .filter(s => s.visible)
      .sort((a, b) => a.order - b.order)
  }, [sections])

  return (
    <DashboardLayoutContext.Provider
      value={{
        sections,
        toggleSection,
        moveSection,
        resetToDefault,
        isEditing,
        setIsEditing,
        isSectionVisible,
        getOrderedVisibleSections,
      }}
    >
      {children}
    </DashboardLayoutContext.Provider>
  )
}

export function useDashboardLayout() {
  const context = useContext(DashboardLayoutContext)
  if (context === undefined) {
    throw new Error('useDashboardLayout must be used within a DashboardLayoutProvider')
  }
  return context
}
