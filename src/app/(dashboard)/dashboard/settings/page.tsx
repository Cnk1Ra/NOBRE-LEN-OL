'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Plug,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Check,
  ExternalLink,
  Key,
  Webhook,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Volume2,
  Loader2,
  Copy,
  CheckCheck,
  ChevronsUpDown,
  Upload,
  X,
  Camera,
  Play,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useNotifications } from '@/contexts/notifications-context'
import { useCountry } from '@/contexts/country-context'
import { useUser } from '@/contexts/user-context'
import { useLanguage, languages } from '@/contexts/language-context'
import { toast } from '@/hooks/use-toast'

function SettingsContent() {
  const { theme, setTheme } = useTheme()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('profile')
  const { preferences, updatePreference } = useNotifications()
  const { defaultCurrency, setDefaultCurrency } = useCountry()
  const { profile: userProfile, updateProfile: updateUserProfile, updateAvatar, getInitials } = useUser()

  // File input ref for photo upload
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro!',
        description: 'Por favor, selecione uma imagem valida (JPG, PNG).',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erro!',
        description: 'A imagem deve ter no maximo 2MB.',
        variant: 'destructive',
      })
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      updateAvatar(base64)
      toast({
        title: 'Foto atualizada!',
        description: 'Sua foto de perfil foi alterada com sucesso.',
        className: 'bg-green-500 text-white border-green-600',
      })
    }
    reader.readAsDataURL(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove photo
  const handleRemovePhoto = () => {
    updateAvatar(null)
    toast({
      title: 'Foto removida!',
      description: 'Sua foto de perfil foi removida.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  // Default values
  const defaultCompany = {
    name: 'Dash On Delivery LTDA',
    cnpj: '12.345.678/0001-90',
    address: 'Rua Example, 123 - Centro',
    city: 'Sao Paulo',
    state: 'SP',
    currency: 'BRL',
  }

  // Profile state - initialized from user context
  const [profile, setProfile] = useState(userProfile)
  const [savedProfile, setSavedProfile] = useState(userProfile)
  const [savingProfile, setSavingProfile] = useState(false)
  const hasProfileChanges = JSON.stringify(profile) !== JSON.stringify(savedProfile)

  // Sync profile state when userProfile changes (from context)
  useEffect(() => {
    setProfile(userProfile)
    setSavedProfile(userProfile)
  }, [userProfile])

  // Company state
  const [company, setCompany] = useState(defaultCompany)
  const [savedCompany, setSavedCompany] = useState(defaultCompany)
  const [savingCompany, setSavingCompany] = useState(false)
  const hasCompanyChanges = JSON.stringify(company) !== JSON.stringify(savedCompany)

  // Appearance state - language comes from context
  const { language, setLanguage, t } = useLanguage()
  const [savingAppearance, setSavingAppearance] = useState(false)

  // Load saved data from localStorage on mount (except profile which comes from context)
  useEffect(() => {
    // Load company
    const savedCompanyData = localStorage.getItem('dod-company')
    if (savedCompanyData) {
      try {
        const parsed = JSON.parse(savedCompanyData)
        setCompany(parsed)
        setSavedCompany(parsed)
      } catch {
        // Invalid JSON, use default
      }
    }

    // Language is loaded from context (LanguageProvider)

    // Load integrations
    const savedIntegrations = localStorage.getItem('dod-integrations')
    if (savedIntegrations) {
      try {
        const parsed = JSON.parse(savedIntegrations)
        setIntegrations(parsed)
      } catch {
        // Invalid JSON, use default
      }
    }
  }, [])

  // Security state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)

  // Integrations state
  const [integrations, setIntegrations] = useState([
    { name: 'Shopify', desc: 'Sincronize pedidos e produtos', connected: true, icon: '🛒' },
    { name: 'Facebook Ads', desc: 'Importe dados de campanhas', connected: true, icon: '📘' },
    { name: 'Google Analytics', desc: 'Acompanhe metricas de trafego', connected: false, icon: '📊' },
    { name: 'Slack', desc: 'Receba notificacoes no Slack', connected: false, icon: '💬' },
    { name: 'Zapier', desc: 'Automatize workflows', connected: false, icon: '⚡' },
  ])
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  const [webhookCopied, setWebhookCopied] = useState(false)

  // Sessions state
  const [sessions, setSessions] = useState([
    { device: 'MacBook Pro - Chrome', location: 'Sao Paulo, BR', current: true, time: 'Agora' },
    { device: 'iPhone 14 - Safari', location: 'Sao Paulo, BR', current: false, time: '2h atras' },
  ])

  // Save handlers
  const handleSaveProfile = async () => {
    // Validate phone before saving
    const phoneValidationError = validatePhone(profile.phone, phoneCountryCode)
    if (phoneValidationError) {
      setPhoneError(phoneValidationError)
      toast({
        title: 'Erro de validacao!',
        description: phoneValidationError,
        variant: 'destructive',
      })
      return
    }

    setSavingProfile(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setSavedProfile({ ...profile })
    // Update global user context (this also saves to localStorage)
    updateUserProfile(profile)
    setSavingProfile(false)
    toast({
      title: 'Perfil atualizado!',
      description: 'Suas informacoes foram salvas com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleSaveCompany = async () => {
    setSavingCompany(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setSavedCompany({ ...company })
    // Save to localStorage
    localStorage.setItem('dod-company', JSON.stringify(company))
    setSavingCompany(false)
    toast({
      title: 'Dados da empresa atualizados!',
      description: 'As informacoes da empresa foram salvas com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleSaveAppearance = async () => {
    setSavingAppearance(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSavingAppearance(false)
    toast({
      title: 'Preferencias salvas!',
      description: 'Suas preferencias de aparencia foram atualizadas.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Erro!',
        description: 'As senhas nao coincidem.',
        variant: 'destructive',
      })
      return
    }
    if (passwords.new.length < 6) {
      toast({
        title: 'Erro!',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      })
      return
    }
    setSavingPassword(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setSavingPassword(false)
    setPasswords({ current: '', new: '', confirm: '' })
    toast({
      title: 'Senha atualizada!',
      description: 'Sua senha foi alterada com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleToggleIntegration = (index: number) => {
    const updated = [...integrations]
    updated[index].connected = !updated[index].connected
    setIntegrations(updated)
    // Save to localStorage
    localStorage.setItem('dod-integrations', JSON.stringify(updated))
    toast({
      title: updated[index].connected ? 'Integracao conectada!' : 'Integracao desconectada!',
      description: `${updated[index].name} foi ${updated[index].connected ? 'conectado' : 'desconectado'} com sucesso.`,
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('sk_live_xxxxxxxxxxxxxxxxxx')
    setApiKeyCopied(true)
    setTimeout(() => setApiKeyCopied(false), 2000)
    toast({
      title: 'API Key copiada!',
      description: 'A chave foi copiada para a area de transferencia.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText('https://api.dashondelivery.com/webhooks/...')
    setWebhookCopied(true)
    setTimeout(() => setWebhookCopied(false), 2000)
    toast({
      title: 'Webhook URL copiada!',
      description: 'A URL foi copiada para a area de transferencia.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleTestWebhook = async () => {
    toast({
      title: 'Testando webhook...',
      description: 'Enviando requisicao de teste.',
      className: 'bg-blue-500 text-white border-blue-600',
    })
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast({
      title: 'Webhook funcionando!',
      description: 'A requisicao de teste foi recebida com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleEndSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index)
    setSessions(updated)
    toast({
      title: 'Sessao encerrada!',
      description: 'O dispositivo foi desconectado com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleSetupTwoFactor = () => {
    toast({
      title: '2FA em configuracao',
      description: 'Funcionalidade de autenticacao de dois fatores sera implementada.',
      className: 'bg-blue-500 text-white border-blue-600',
    })
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast({
      title: 'Tema alterado!',
      description: `Tema ${newTheme === 'light' ? 'claro' : newTheme === 'dark' ? 'escuro' : 'do sistema'} ativado.`,
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  // Notification sound frequencies for different types
  const playNotificationSound = (type: 'order' | 'delivery' | 'stock' | 'success' | 'warning' | 'system') => {
    if (!preferences.sound) return

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different sounds for different notification types
    switch (type) {
      case 'order':
        // Cheerful double beep for new orders
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime) // A5
        oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1) // C#6
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
      case 'delivery':
        // Smooth ascending tone for deliveries
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
        oscillator.frequency.linearRampToValueAtTime(784, audioContext.currentTime + 0.2) // G5
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.4)
        break
      case 'stock':
        // Warning beeps for low stock
        oscillator.type = 'square'
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // A4
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.15)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
      case 'success':
        // Victory fanfare for success
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1) // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2) // G5
        oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.3) // C6
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
        break
      case 'warning':
        // Urgent warning sound
        oscillator.type = 'sawtooth'
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.15)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.45)
        break
      case 'system':
        // Subtle system notification
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(698, audioContext.currentTime) // F5
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
        break
    }
  }

  // Test notification handler
  const handleTestNotification = (type: 'order' | 'delivery' | 'stock' | 'success' | 'warning' | 'system') => {
    const notificationConfig = {
      order: {
        title: 'Novo Pedido #12345',
        description: 'Voce recebeu um novo pedido de R$ 159,90',
        className: 'bg-blue-500 text-white border-blue-600',
      },
      delivery: {
        title: 'Entrega Realizada',
        description: 'Pedido #12344 foi entregue com sucesso',
        className: 'bg-green-500 text-white border-green-600',
      },
      stock: {
        title: 'Estoque Baixo',
        description: 'Produto "Camiseta P" esta com apenas 3 unidades',
        className: 'bg-orange-500 text-white border-orange-600',
      },
      success: {
        title: 'Meta Atingida!',
        description: 'Voce atingiu a meta de vendas do mes!',
        className: 'bg-emerald-500 text-white border-emerald-600',
      },
      warning: {
        title: 'Atencao!',
        description: 'Pagamento pendente no pedido #12340',
        className: 'bg-yellow-500 text-white border-yellow-600',
      },
      system: {
        title: 'Atualizacao do Sistema',
        description: 'Nova versao disponivel com melhorias',
        className: 'bg-purple-500 text-white border-purple-600',
      },
    }

    const config = notificationConfig[type]

    // Play sound
    playNotificationSound(type)

    // Show toast
    toast({
      title: config.title,
      description: config.description,
      className: config.className,
    })
  }

  // handleLanguageChange moved to handleLanguageSelect with confirmation dialog

  // All available currencies
  const currencyOptions = [
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'USD', name: 'Dolar Americano', symbol: '$', flag: '🇺🇸' },
    { code: 'AOA', name: 'Kwanza Angolano', symbol: 'Kz', flag: '🇦🇴' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Iene Japones', symbol: '¥', flag: '🇯🇵' },
    { code: 'CNY', name: 'Yuan Chines', symbol: '¥', flag: '🇨🇳' },
    { code: 'CHF', name: 'Franco Suico', symbol: 'Fr', flag: '🇨🇭' },
    { code: 'CAD', name: 'Dolar Canadense', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Dolar Australiano', symbol: 'A$', flag: '🇦🇺' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴' },
    { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪' },
    { code: 'MZN', name: 'Metical Mocambicano', symbol: 'MT', flag: '🇲🇿' },
    { code: 'CVE', name: 'Escudo Cabo-verdiano', symbol: '$', flag: '🇨🇻' },
    { code: 'INR', name: 'Rupia Indiana', symbol: '₹', flag: '🇮🇳' },
    { code: 'KRW', name: 'Won Sul-coreano', symbol: '₩', flag: '🇰🇷' },
    { code: 'ZAR', name: 'Rand Sul-africano', symbol: 'R', flag: '🇿🇦' },
  ]

  // Country phone codes (DDI) with validation rules
  const phoneCountryCodes = [
    { code: 'BR', name: 'Brasil', ddi: '+55', flag: '🇧🇷', minLen: 10, maxLen: 11, example: '11 999999999' },
    { code: 'PT', name: 'Portugal', ddi: '+351', flag: '🇵🇹', minLen: 9, maxLen: 9, example: '912345678' },
    { code: 'AO', name: 'Angola', ddi: '+244', flag: '🇦🇴', minLen: 9, maxLen: 9, example: '923456789' },
    { code: 'MZ', name: 'Mocambique', ddi: '+258', flag: '🇲🇿', minLen: 9, maxLen: 9, example: '841234567' },
    { code: 'CV', name: 'Cabo Verde', ddi: '+238', flag: '🇨🇻', minLen: 7, maxLen: 7, example: '9912345' },
    { code: 'US', name: 'Estados Unidos', ddi: '+1', flag: '🇺🇸', minLen: 10, maxLen: 10, example: '2025551234' },
    { code: 'GB', name: 'Reino Unido', ddi: '+44', flag: '🇬🇧', minLen: 10, maxLen: 10, example: '7911123456' },
    { code: 'ES', name: 'Espanha', ddi: '+34', flag: '🇪🇸', minLen: 9, maxLen: 9, example: '612345678' },
    { code: 'FR', name: 'Franca', ddi: '+33', flag: '🇫🇷', minLen: 9, maxLen: 9, example: '612345678' },
    { code: 'DE', name: 'Alemanha', ddi: '+49', flag: '🇩🇪', minLen: 10, maxLen: 11, example: '15123456789' },
    { code: 'IT', name: 'Italia', ddi: '+39', flag: '🇮🇹', minLen: 9, maxLen: 10, example: '3123456789' },
    { code: 'JP', name: 'Japao', ddi: '+81', flag: '🇯🇵', minLen: 10, maxLen: 10, example: '9012345678' },
    { code: 'CN', name: 'China', ddi: '+86', flag: '🇨🇳', minLen: 11, maxLen: 11, example: '13812345678' },
    { code: 'IN', name: 'India', ddi: '+91', flag: '🇮🇳', minLen: 10, maxLen: 10, example: '9876543210' },
    { code: 'MX', name: 'Mexico', ddi: '+52', flag: '🇲🇽', minLen: 10, maxLen: 10, example: '5512345678' },
    { code: 'AR', name: 'Argentina', ddi: '+54', flag: '🇦🇷', minLen: 10, maxLen: 10, example: '1123456789' },
    { code: 'CL', name: 'Chile', ddi: '+56', flag: '🇨🇱', minLen: 9, maxLen: 9, example: '912345678' },
    { code: 'CO', name: 'Colombia', ddi: '+57', flag: '🇨🇴', minLen: 10, maxLen: 10, example: '3001234567' },
    { code: 'PE', name: 'Peru', ddi: '+51', flag: '🇵🇪', minLen: 9, maxLen: 9, example: '912345678' },
    { code: 'CA', name: 'Canada', ddi: '+1', flag: '🇨🇦', minLen: 10, maxLen: 10, example: '4165551234' },
    { code: 'AU', name: 'Australia', ddi: '+61', flag: '🇦🇺', minLen: 9, maxLen: 9, example: '412345678' },
    { code: 'ZA', name: 'Africa do Sul', ddi: '+27', flag: '🇿🇦', minLen: 9, maxLen: 9, example: '821234567' },
    { code: 'KR', name: 'Coreia do Sul', ddi: '+82', flag: '🇰🇷', minLen: 9, maxLen: 10, example: '1012345678' },
    { code: 'RU', name: 'Russia', ddi: '+7', flag: '🇷🇺', minLen: 10, maxLen: 10, example: '9123456789' },
    { code: 'AE', name: 'Emirados Arabes', ddi: '+971', flag: '🇦🇪', minLen: 9, maxLen: 9, example: '501234567' },
    { code: 'SA', name: 'Arabia Saudita', ddi: '+966', flag: '🇸🇦', minLen: 9, maxLen: 9, example: '512345678' },
    { code: 'IL', name: 'Israel', ddi: '+972', flag: '🇮🇱', minLen: 9, maxLen: 9, example: '501234567' },
    { code: 'CH', name: 'Suica', ddi: '+41', flag: '🇨🇭', minLen: 9, maxLen: 9, example: '791234567' },
    { code: 'NL', name: 'Holanda', ddi: '+31', flag: '🇳🇱', minLen: 9, maxLen: 9, example: '612345678' },
    { code: 'BE', name: 'Belgica', ddi: '+32', flag: '🇧🇪', minLen: 9, maxLen: 9, example: '471234567' },
  ]

  // Phone country code state
  const [phoneCountryCode, setPhoneCountryCode] = useState('+55')
  const [phoneCountryOpen, setPhoneCountryOpen] = useState(false)
  const [phoneSearch, setPhoneSearch] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)

  // Validate phone number based on selected country
  const validatePhone = (phone: string, countryDdi: string): string | null => {
    const country = phoneCountryCodes.find(c => c.ddi === countryDdi)
    if (!country) return null

    // Remove spaces, dashes, parentheses for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

    // Check if empty
    if (!cleanPhone) {
      return 'Numero de telefone e obrigatorio'
    }

    // Check if contains only numbers
    if (!/^\d+$/.test(cleanPhone)) {
      return 'Numero deve conter apenas digitos'
    }

    // Check length
    if (cleanPhone.length < country.minLen) {
      return `Numero muito curto para ${country.name}. Minimo: ${country.minLen} digitos. Exemplo: ${country.example}`
    }

    if (cleanPhone.length > country.maxLen) {
      return `Numero muito longo para ${country.name}. Maximo: ${country.maxLen} digitos. Exemplo: ${country.example}`
    }

    return null
  }

  // Filter phone country codes based on search
  const filteredPhoneCountries = phoneCountryCodes.filter(country =>
    country.name.toLowerCase().includes(phoneSearch.toLowerCase()) ||
    country.ddi.includes(phoneSearch) ||
    country.code.toLowerCase().includes(phoneSearch.toLowerCase())
  )

  // Load phone country code from localStorage
  useEffect(() => {
    const savedPhoneCode = localStorage.getItem('dod-phone-country-code')
    if (savedPhoneCode) {
      setPhoneCountryCode(savedPhoneCode)
    }
  }, [])

  const handlePhoneCountryChange = (ddi: string) => {
    setPhoneCountryCode(ddi)
    localStorage.setItem('dod-phone-country-code', ddi)
    setPhoneCountryOpen(false)
    setPhoneSearch('')
    // Re-validate phone with new country
    const error = validatePhone(profile.phone, ddi)
    setPhoneError(error)
  }

  // Currency change confirmation state
  const [pendingCurrency, setPendingCurrency] = useState<typeof currencyOptions[0] | null>(null)
  const [showCurrencyConfirm, setShowCurrencyConfirm] = useState(false)

  const handleCurrencySelect = (currencyCode: string) => {
    const currency = currencyOptions.find(c => c.code === currencyCode)
    if (currency && currency.code !== defaultCurrency.code) {
      setPendingCurrency(currency)
      setShowCurrencyConfirm(true)
    }
  }

  const confirmCurrencyChange = () => {
    if (pendingCurrency) {
      setDefaultCurrency(pendingCurrency)
      setCompany(prev => ({ ...prev, currency: pendingCurrency.code }))
      toast({
        title: 'Moeda padrao alterada!',
        description: `Todo o dashboard agora usa ${pendingCurrency.name} (${pendingCurrency.symbol}).`,
        className: 'bg-green-500 text-white border-green-600',
      })
    }
    setShowCurrencyConfirm(false)
    setPendingCurrency(null)
  }

  const cancelCurrencyChange = () => {
    setShowCurrencyConfirm(false)
    setPendingCurrency(null)
  }

  // Language change confirmation state
  const [pendingLanguage, setPendingLanguage] = useState<typeof languages[0] | null>(null)
  const [showLanguageConfirm, setShowLanguageConfirm] = useState(false)

  const handleLanguageSelect = (langCode: string) => {
    const lang = languages.find(l => l.code === langCode)
    if (lang && lang.code !== language) {
      setPendingLanguage(lang)
      setShowLanguageConfirm(true)
    }
  }

  const confirmLanguageChange = () => {
    if (pendingLanguage) {
      setLanguage(pendingLanguage.code)
      toast({
        title: t('appearance.languageChanged'),
        description: `${pendingLanguage.flag} ${pendingLanguage.name}`,
        className: 'bg-green-500 text-white border-green-600',
      })
    }
    setShowLanguageConfirm(false)
    setPendingLanguage(null)
  }

  const cancelLanguageChange = () => {
    setShowLanguageConfirm(false)
    setPendingLanguage(null)
  }

  // Handle URL parameter for tab selection
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['profile', 'company', 'notifications', 'appearance', 'integrations', 'security'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuracoes</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferencias e configuracoes da conta
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="notifications">Notificacoes</TabsTrigger>
          <TabsTrigger value="appearance">Aparencia</TabsTrigger>
          <TabsTrigger value="integrations">Integracoes</TabsTrigger>
          <TabsTrigger value="security">Seguranca</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informacoes do Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informacoes pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />

                {/* Avatar display */}
                <div className="relative">
                  {userProfile.avatar ? (
                    <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20">
                      <img
                        src={userProfile.avatar}
                        alt="Foto de perfil"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary transition-all">
                      {getInitials()}
                    </div>
                  )}
                  {/* Camera icon overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {userProfile.avatar ? 'Trocar foto' : 'Adicionar foto'}
                    </Button>
                    {userProfile.avatar && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemovePhoto}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WEBP. Max 2MB</p>
                  <p className="text-sm font-medium mt-2">{profile.firstName} {profile.lastName}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="flex gap-2">
                    <Popover open={phoneCountryOpen} onOpenChange={(open) => {
                      setPhoneCountryOpen(open)
                      if (!open) setPhoneSearch('')
                    }}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={phoneCountryOpen}
                          className="w-[160px] justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span>{phoneCountryCodes.find(c => c.ddi === phoneCountryCode)?.flag}</span>
                            <span className="font-medium">{phoneCountryCode}</span>
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <div className="p-2 border-b">
                          <Input
                            placeholder="Buscar pais..."
                            value={phoneSearch}
                            onChange={(e) => setPhoneSearch(e.target.value)}
                            className="h-9"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-[250px] overflow-y-auto p-1">
                          {filteredPhoneCountries.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              Nenhum pais encontrado.
                            </div>
                          ) : (
                            filteredPhoneCountries.map((country) => (
                              <div
                                key={country.code}
                                className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-accent ${
                                  phoneCountryCode === country.ddi ? 'bg-accent' : ''
                                }`}
                                onClick={() => handlePhoneCountryChange(country.ddi)}
                              >
                                <Check
                                  className={`h-4 w-4 ${phoneCountryCode === country.ddi ? "opacity-100" : "opacity-0"}`}
                                />
                                <span>{country.flag}</span>
                                <span className="font-medium w-14">{country.ddi}</span>
                                <span className="text-muted-foreground text-sm">{country.name}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      id="phone"
                      placeholder={phoneCountryCodes.find(c => c.ddi === phoneCountryCode)?.example || '11 999999999'}
                      value={profile.phone}
                      onChange={(e) => {
                        const newPhone = e.target.value
                        setProfile(prev => ({ ...prev, phone: newPhone }))
                        // Validate on change
                        const error = validatePhone(newPhone, phoneCountryCode)
                        setPhoneError(error)
                      }}
                      className={`flex-1 ${phoneError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                {hasProfileChanges && (
                  <p className="text-sm text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Alteracoes nao salvas
                  </p>
                )}
                {!hasProfileChanges && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Tudo salvo
                  </p>
                )}
                <Button onClick={handleSaveProfile} disabled={savingProfile || !hasProfileChanges || !!phoneError}>
                  {savingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alteracoes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Informacoes da sua empresa para notas fiscais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={company.name}
                    onChange={(e) => setCompany(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={company.cnpj}
                    onChange={(e) => setCompany(prev => ({ ...prev, cnpj: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereco</Label>
                  <Input
                    id="address"
                    value={company.address}
                    onChange={(e) => setCompany(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={company.city}
                    onChange={(e) => setCompany(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={company.state}
                    onValueChange={(value) => setCompany(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">Sao Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PR">Parana</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Moeda Padrao do Dashboard</h4>
                <p className="text-sm text-muted-foreground">Selecione a moeda que sera usada em todo o dashboard. Esta alteracao afetara todos os valores monetarios.</p>
                <div className="flex items-center gap-4">
                  <Select
                    value={defaultCurrency.code}
                    onValueChange={handleCurrencySelect}
                  >
                    <SelectTrigger className="w-[350px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span>{currencyOptions.find(c => c.code === defaultCurrency.code)?.flag}</span>
                          <span className="font-medium">{defaultCurrency.code}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-muted-foreground">{defaultCurrency.name}</span>
                          <span className="font-bold ml-auto">{defaultCurrency.symbol}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-lg">{currency.flag}</span>
                            <span className="font-medium w-12">{currency.code}</span>
                            <span className="text-muted-foreground flex-1">{currency.name}</span>
                            <span className="font-bold">{currency.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Moeda atual: <span className="font-medium text-foreground">{defaultCurrency.symbol} {defaultCurrency.code}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {hasCompanyChanges && (
                  <p className="text-sm text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Alteracoes nao salvas
                  </p>
                )}
                {!hasCompanyChanges && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Tudo salvo
                  </p>
                )}
                <Button onClick={handleSaveCompany} disabled={savingCompany || !hasCompanyChanges}>
                  {savingCompany ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alteracoes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            {/* Notification Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Canais de Notificacao
                </CardTitle>
                <CardDescription>
                  Escolha como deseja receber notificacoes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">Receber notificacoes por email</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.email}
                    onCheckedChange={(checked) => updatePreference('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Push</p>
                      <p className="text-sm text-muted-foreground">Notificacoes no navegador</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.push}
                    onCheckedChange={(checked) => updatePreference('push', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Som</p>
                      <p className="text-sm text-muted-foreground">Tocar som ao receber notificacao</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.sound}
                    onCheckedChange={(checked) => updatePreference('sound', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Tipos de Notificacao
                </CardTitle>
                <CardDescription>
                  Ative ou desative tipos especificos de notificacoes. Clique em "Testar" para ouvir o som.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Pedidos</p>
                      <p className="text-sm text-muted-foreground">Novos pedidos e atualizacoes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestNotification('order')}
                      className="gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Testar
                    </Button>
                    <Switch
                      checked={preferences.order}
                      onCheckedChange={(checked) => updatePreference('order', checked)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Entregas</p>
                      <p className="text-sm text-muted-foreground">Atualizacoes de entrega e rastreamento</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestNotification('delivery')}
                      className="gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Testar
                    </Button>
                    <Switch
                      checked={preferences.delivery}
                      onCheckedChange={(checked) => updatePreference('delivery', checked)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Estoque</p>
                      <p className="text-sm text-muted-foreground">Alertas de estoque baixo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestNotification('stock')}
                      className="gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Testar
                    </Button>
                    <Switch
                      checked={preferences.stock}
                      onCheckedChange={(checked) => updatePreference('stock', checked)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Sucesso</p>
                      <p className="text-sm text-muted-foreground">Metas atingidas e conquistas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestNotification('success')}
                      className="gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Testar
                    </Button>
                    <Switch
                      checked={preferences.success}
                      onCheckedChange={(checked) => updatePreference('success', checked)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Alertas</p>
                      <p className="text-sm text-muted-foreground">Avisos e problemas importantes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestNotification('warning')}
                      className="gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Testar
                    </Button>
                    <Switch
                      checked={preferences.warning}
                      onCheckedChange={(checked) => updatePreference('warning', checked)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Sistema</p>
                      <p className="text-sm text-muted-foreground">Atualizacoes e novidades do sistema</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestNotification('system')}
                      className="gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Testar
                    </Button>
                    <Switch
                      checked={preferences.system}
                      onCheckedChange={(checked) => updatePreference('system', checked)}
                    />
                  </div>
                </div>

                {/* Sound tip */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <Volume2 className="h-4 w-4" />
                  <span>Ative a opcao "Som" acima para ouvir os sons de notificacao.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparencia
              </CardTitle>
              <CardDescription>
                Personalize a aparencia do dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Tema</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <Card
                    className={`cursor-pointer transition-colors hover:border-primary/50 ${theme === 'light' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Sun className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Claro</p>
                        <p className="text-xs text-muted-foreground">Tema claro padrao</p>
                      </div>
                      {theme === 'light' && <Check className="h-4 w-4 text-primary ml-auto" />}
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-colors hover:border-primary/50 ${theme === 'dark' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Moon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Escuro</p>
                        <p className="text-xs text-muted-foreground">Tema escuro</p>
                      </div>
                      {theme === 'dark' && <Check className="h-4 w-4 text-primary ml-auto" />}
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-colors hover:border-primary/50 ${theme === 'system' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleThemeChange('system')}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Globe className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Sistema</p>
                        <p className="text-xs text-muted-foreground">Seguir preferencia</p>
                      </div>
                      {theme === 'system' && <Check className="h-4 w-4 text-primary ml-auto" />}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">{t('appearance.language')}</h4>
                <Select value={language} onValueChange={handleLanguageSelect}>
                  <SelectTrigger className="w-[320px]">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{languages.find(l => l.code === language)?.flag}</span>
                        <span>{languages.find(l => l.code === language)?.name}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {language === 'pt-BR' ? '30 idiomas disponiveis' :
                   language === 'en-US' ? '30 languages available' :
                   language === 'es' ? '30 idiomas disponibles' :
                   language === 'fr' ? '30 langues disponibles' :
                   language === 'de' ? '30 Sprachen verfugbar' :
                   '30 languages available'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Integracoes
              </CardTitle>
              <CardDescription>
                Conecte seus servicos e plataformas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {integrations.map((integration, index) => (
                <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{integration.name}</p>
                        {integration.connected && (
                          <Badge variant="success" className="text-xs">Conectado</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{integration.desc}</p>
                    </div>
                  </div>
                  <Button
                    variant={integration.connected ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleToggleIntegration(index)}
                  >
                    {integration.connected ? 'Desconectar' : 'Conectar'}
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              ))}

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  API & Webhooks
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex gap-2">
                      <Input type="password" value="sk_live_xxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                      <Button variant="outline" onClick={handleCopyApiKey}>
                        {apiKeyCopied ? (
                          <>
                            <CheckCheck className="mr-2 h-4 w-4 text-green-500" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input value="https://api.dashondelivery.com/webhooks/..." readOnly className="font-mono text-sm" />
                      <Button variant="outline" onClick={handleCopyWebhook}>
                        {webhookCopied ? (
                          <>
                            <CheckCheck className="mr-2 h-4 w-4 text-green-500" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleTestWebhook}>
                        Testar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguranca
              </CardTitle>
              <CardDescription>
                Proteja sua conta com opcoes de seguranca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Alterar Senha</h4>
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    />
                  </div>
                  <Button
                    className="w-fit"
                    onClick={handleUpdatePassword}
                    disabled={savingPassword || !passwords.current || !passwords.new || !passwords.confirm}
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      'Atualizar Senha'
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Autenticacao de Dois Fatores</h4>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de seguranca
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleSetupTwoFactor}>
                    <Key className="mr-2 h-4 w-4" />
                    Configurar 2FA
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Sessoes Ativas</h4>
                <div className="space-y-3">
                  {sessions.map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.device}</p>
                          {session.current && <Badge variant="success">Atual</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.location} • {session.time}
                        </p>
                      </div>
                      {!session.current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleEndSession(i)}
                        >
                          Encerrar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Currency Change Confirmation Dialog */}
      <AlertDialog open={showCurrencyConfirm} onOpenChange={setShowCurrencyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alterar Moeda Padrao?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Voce esta prestes a alterar a moeda padrao do dashboard de{' '}
                <span className="font-semibold text-foreground">{defaultCurrency.symbol} {defaultCurrency.code}</span> para{' '}
                <span className="font-semibold text-foreground">{pendingCurrency?.symbol} {pendingCurrency?.code}</span>.
              </p>
              <p className="text-amber-600 dark:text-amber-400">
                Esta acao ira converter e recalcular todos os valores monetarios exibidos no dashboard.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelCurrencyChange}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCurrencyChange} className="bg-primary">
              Confirmar Alteracao
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Language Change Confirmation Dialog */}
      <AlertDialog open={showLanguageConfirm} onOpenChange={setShowLanguageConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              {pendingLanguage?.code === 'pt-BR' ? 'Alterar Idioma?' :
               pendingLanguage?.code === 'en-US' || pendingLanguage?.code === 'en-GB' ? 'Change Language?' :
               pendingLanguage?.code === 'es' || pendingLanguage?.code === 'es-MX' ? 'Cambiar Idioma?' :
               pendingLanguage?.code === 'fr' ? 'Changer la Langue?' :
               pendingLanguage?.code === 'de' ? 'Sprache andern?' :
               pendingLanguage?.code === 'it' ? 'Cambiare Lingua?' :
               pendingLanguage?.code === 'pt-PT' ? 'Alterar Idioma?' :
               pendingLanguage?.code === 'ja' ? '言語を変更しますか？' :
               pendingLanguage?.code === 'zh-CN' || pendingLanguage?.code === 'zh-TW' ? '更改语言？' :
               pendingLanguage?.code === 'ko' ? '언어 변경?' :
               pendingLanguage?.code === 'ru' ? 'Изменить язык?' :
               pendingLanguage?.code === 'ar' ? 'تغيير اللغة؟' :
               'Change Language?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                {pendingLanguage?.code === 'pt-BR' || pendingLanguage?.code === 'pt-PT' ? 'Voce esta prestes a alterar o idioma do dashboard de' :
                 pendingLanguage?.code === 'en-US' || pendingLanguage?.code === 'en-GB' ? 'You are about to change the dashboard language from' :
                 pendingLanguage?.code === 'es' || pendingLanguage?.code === 'es-MX' ? 'Esta a punto de cambiar el idioma del dashboard de' :
                 pendingLanguage?.code === 'fr' ? 'Vous etes sur le point de changer la langue du dashboard de' :
                 pendingLanguage?.code === 'de' ? 'Sie sind dabei, die Dashboard-Sprache zu andern von' :
                 pendingLanguage?.code === 'it' ? 'Stai per cambiare la lingua del dashboard da' :
                 pendingLanguage?.code === 'ja' ? 'ダッシュボードの言語を変更します：' :
                 pendingLanguage?.code === 'zh-CN' || pendingLanguage?.code === 'zh-TW' ? '您即将把仪表板语言从' :
                 pendingLanguage?.code === 'ko' ? '대시보드 언어를 변경합니다:' :
                 pendingLanguage?.code === 'ru' ? 'Вы собираетесь изменить язык панели с' :
                 'You are about to change the dashboard language from'}{' '}
                <span className="font-semibold text-foreground">
                  {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}
                </span>{' '}
                {pendingLanguage?.code === 'pt-BR' || pendingLanguage?.code === 'pt-PT' ? 'para' :
                 pendingLanguage?.code === 'en-US' || pendingLanguage?.code === 'en-GB' ? 'to' :
                 pendingLanguage?.code === 'es' || pendingLanguage?.code === 'es-MX' ? 'a' :
                 pendingLanguage?.code === 'fr' ? 'a' :
                 pendingLanguage?.code === 'de' ? 'zu' :
                 pendingLanguage?.code === 'it' ? 'a' :
                 pendingLanguage?.code === 'ja' ? 'から' :
                 pendingLanguage?.code === 'zh-CN' || pendingLanguage?.code === 'zh-TW' ? '更改为' :
                 pendingLanguage?.code === 'ko' ? '에서' :
                 pendingLanguage?.code === 'ru' ? 'на' :
                 'to'}{' '}
                <span className="font-semibold text-foreground">
                  {pendingLanguage?.flag} {pendingLanguage?.name}
                </span>.
              </p>
              <p className="text-blue-600 dark:text-blue-400">
                {pendingLanguage?.code === 'pt-BR' || pendingLanguage?.code === 'pt-PT' ? 'Esta acao ira alterar todos os textos e labels do dashboard para o novo idioma selecionado.' :
                 pendingLanguage?.code === 'en-US' || pendingLanguage?.code === 'en-GB' ? 'This action will change all texts and labels in the dashboard to the selected language.' :
                 pendingLanguage?.code === 'es' || pendingLanguage?.code === 'es-MX' ? 'Esta accion cambiara todos los textos y etiquetas del dashboard al nuevo idioma seleccionado.' :
                 pendingLanguage?.code === 'fr' ? 'Cette action changera tous les textes et libelles du dashboard vers la nouvelle langue selectionnee.' :
                 pendingLanguage?.code === 'de' ? 'Diese Aktion andert alle Texte und Beschriftungen im Dashboard in die ausgewahlte Sprache.' :
                 pendingLanguage?.code === 'it' ? 'Questa azione cambiera tutti i testi e le etichette del dashboard nella lingua selezionata.' :
                 pendingLanguage?.code === 'ja' ? 'この操作により、ダッシュボードのすべてのテキストとラベルが選択した言語に変更されます。' :
                 pendingLanguage?.code === 'zh-CN' || pendingLanguage?.code === 'zh-TW' ? '此操作将把仪表板中的所有文本和标签更改为所选语言。' :
                 pendingLanguage?.code === 'ko' ? '이 작업은 대시보드의 모든 텍스트와 레이블을 선택한 언어로 변경합니다.' :
                 pendingLanguage?.code === 'ru' ? 'Это действие изменит все тексты и метки на панели на выбранный язык.' :
                 'This action will change all texts and labels in the dashboard to the selected language.'}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLanguageChange}>
              {pendingLanguage?.code === 'pt-BR' || pendingLanguage?.code === 'pt-PT' ? 'Cancelar' :
               pendingLanguage?.code === 'en-US' || pendingLanguage?.code === 'en-GB' ? 'Cancel' :
               pendingLanguage?.code === 'es' || pendingLanguage?.code === 'es-MX' ? 'Cancelar' :
               pendingLanguage?.code === 'fr' ? 'Annuler' :
               pendingLanguage?.code === 'de' ? 'Abbrechen' :
               pendingLanguage?.code === 'it' ? 'Annulla' :
               pendingLanguage?.code === 'ja' ? 'キャンセル' :
               pendingLanguage?.code === 'zh-CN' || pendingLanguage?.code === 'zh-TW' ? '取消' :
               pendingLanguage?.code === 'ko' ? '취소' :
               pendingLanguage?.code === 'ru' ? 'Отмена' :
               'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmLanguageChange} className="bg-primary">
              {pendingLanguage?.code === 'pt-BR' || pendingLanguage?.code === 'pt-PT' ? 'Confirmar Alteracao' :
               pendingLanguage?.code === 'en-US' || pendingLanguage?.code === 'en-GB' ? 'Confirm Change' :
               pendingLanguage?.code === 'es' || pendingLanguage?.code === 'es-MX' ? 'Confirmar Cambio' :
               pendingLanguage?.code === 'fr' ? 'Confirmer le Changement' :
               pendingLanguage?.code === 'de' ? 'Anderung Bestatigen' :
               pendingLanguage?.code === 'it' ? 'Conferma Modifica' :
               pendingLanguage?.code === 'ja' ? '変更を確認' :
               pendingLanguage?.code === 'zh-CN' || pendingLanguage?.code === 'zh-TW' ? '确认更改' :
               pendingLanguage?.code === 'ko' ? '변경 확인' :
               pendingLanguage?.code === 'ru' ? 'Подтвердить' :
               'Confirm Change'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
