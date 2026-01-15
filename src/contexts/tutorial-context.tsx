'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export interface TutorialStep {
  id: string
  title: string
  description: string
  icon?: string
}

interface TutorialContextType {
  showTutorial: boolean
  currentStep: number
  steps: TutorialStep[]
  startTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  skipTutorial: () => void
  completeTutorial: () => void
  hasCompletedTutorial: boolean
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Dash On Delivery!',
    description: 'Este tutorial rápido vai te mostrar as principais funcionalidades da plataforma. Leva menos de 1 minuto!',
    icon: '👋',
  },
  {
    id: 'dashboard',
    title: 'Dashboard Principal',
    description: 'Aqui você acompanha todas as métricas importantes: faturamento, pedidos, taxa de entrega e ROAS em tempo real.',
    icon: '📊',
  },
  {
    id: 'orders',
    title: 'Gestão de Pedidos',
    description: 'Gerencie todos os pedidos da sua loja. Acompanhe status, edite informações e exporte dados quando precisar.',
    icon: '📦',
  },
  {
    id: 'tracking',
    title: 'Rastreamento',
    description: 'Acompanhe o status de entrega de cada pedido. Veja quais estão em trânsito, entregues ou devolvidos.',
    icon: '🚚',
  },
  {
    id: 'integrations',
    title: 'Integrações',
    description: 'Conecte sua loja (Shopify, N1 Warehouse) e plataformas de anúncio (Meta, Google, TikTok) para automatizar tudo.',
    icon: '🔗',
  },
  {
    id: 'financial',
    title: 'Financeiro',
    description: 'Controle receitas, despesas e lucros. Visualize relatórios detalhados e gerencie a divisão com sócios.',
    icon: '💰',
  },
  {
    id: 'countries',
    title: 'Multi-país',
    description: 'Selecione o país de operação no menu superior. O dashboard se adapta com moeda e métricas locais.',
    icon: '🌍',
  },
  {
    id: 'done',
    title: 'Tudo pronto!',
    description: 'Agora você conhece as principais funcionalidades. Explore o menu lateral para acessar todas as áreas. Boas vendas!',
    icon: '🎉',
  },
]

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true)

  // Check if user has completed tutorial on mount
  useEffect(() => {
    const completed = localStorage.getItem('dod-tutorial-completed')
    if (!completed) {
      setHasCompletedTutorial(false)
      // Auto-start tutorial for new users after a short delay
      setTimeout(() => {
        setShowTutorial(true)
      }, 1000)
    }
  }, [])

  const startTutorial = useCallback(() => {
    setCurrentStep(0)
    setShowTutorial(true)
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTutorial()
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const skipTutorial = useCallback(() => {
    setShowTutorial(false)
    localStorage.setItem('dod-tutorial-completed', 'true')
    setHasCompletedTutorial(true)
  }, [])

  const completeTutorial = useCallback(() => {
    setShowTutorial(false)
    localStorage.setItem('dod-tutorial-completed', 'true')
    setHasCompletedTutorial(true)
  }, [])

  return (
    <TutorialContext.Provider
      value={{
        showTutorial,
        currentStep,
        steps: tutorialSteps,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        completeTutorial,
        hasCompletedTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
}
