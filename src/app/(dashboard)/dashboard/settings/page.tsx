'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/contexts/user-context'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Building2, 
  Bell, 
  Palette, 
  Shield, 
  Upload,
  Check,
  Loader2,
  Camera,
  Link2
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Country codes for phone
const countryCodes = [
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+351', country: 'PT', flag: '🇵🇹' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+48', country: 'PL', flag: '🇵🇱' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
]

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'profile'
  
  const { profile, updateProfile, updateAvatar, getInitials, getFullName } = useUser()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountryCode, setPhoneCountryCode] = useState('+55')
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Company data (still localStorage for now)
  const [companyName, setCompanyName] = useState('')
  const [companyCnpj, setCompanyCnpj] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyState, setCompanyState] = useState('')
  const [companyCurrency, setCompanyCurrency] = useState('BRL')
  
  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [orderAlerts, setOrderAlerts] = useState(true)
  const [deliveryAlerts, setDeliveryAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(false)
  
  // Load data from context/localStorage
  useEffect(() => {
    // Profile from context (now comes from NextAuth session)
    setFirstName(profile.firstName || '')
    setLastName(profile.lastName || '')
    setEmail(profile.email || '')
    setPhone(profile.phone || '')
    
    // Phone country code from localStorage
    const savedCountryCode = localStorage.getItem('dod-phone-country-code')
    if (savedCountryCode) {
      setPhoneCountryCode(savedCountryCode)
    }
    
    // Company data from localStorage (will be migrated later)
    const savedCompany = localStorage.getItem('dod-company')
    if (savedCompany) {
      try {
        const company = JSON.parse(savedCompany)
        setCompanyName(company.name || '')
        setCompanyCnpj(company.cnpj || '')
        setCompanyAddress(company.address || '')
        setCompanyCity(company.city || '')
        setCompanyState(company.state || '')
        setCompanyCurrency(company.currency || 'BRL')
      } catch (e) {
        console.error('Error parsing company data:', e)
      }
    }
  }, [profile])
  
  // Track changes
  useEffect(() => {
    const hasProfileChanges = 
      firstName !== profile.firstName ||
      lastName !== profile.lastName ||
      phone !== profile.phone
    setHasChanges(hasProfileChanges)
  }, [firstName, lastName, phone, profile])
  
  // Save profile to API
  const handleSaveProfile = async () => {
    if (!firstName.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      })
      return
    }
    
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar perfil')
      }
      
      // Update context with new data
      updateProfile({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: data.user.phone,
      })
      
      // Save phone country code
      localStorage.setItem('dod-phone-country-code', phoneCountryCode)
      
      setHasChanges(false)
      
      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso",
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar perfil",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // Handle avatar upload
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      })
      return
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB",
        variant: "destructive",
      })
      return
    }
    
    setIsUploadingAvatar(true)
    
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        
        // Upload to API
        const response = await fetch('/api/user/avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ avatar: base64 }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Erro ao fazer upload do avatar')
        }
        
        // Update context
        updateAvatar(data.avatar)
        
        toast({
          title: "Sucesso!",
          description: "Foto atualizada com sucesso",
        })
        
        setIsUploadingAvatar(false)
      }
      
      reader.onerror = () => {
        throw new Error('Erro ao ler arquivo')
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer upload",
        variant: "destructive",
      })
      setIsUploadingAvatar(false)
    }
  }
  
  // Save company data (still localStorage)
  const handleSaveCompany = () => {
    const companyData = {
      name: companyName,
      cnpj: companyCnpj,
      address: companyAddress,
      city: companyCity,
      state: companyState,
      currency: companyCurrency,
    }
    localStorage.setItem('dod-company', JSON.stringify(companyData))
    
    toast({
      title: "Sucesso!",
      description: "Dados da empresa salvos com sucesso",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} alt={getFullName()} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Adicionar foto
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, GIF, WEBP. Max 2MB
                  </p>
                  <p className="font-medium">{getFullName()}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Seu sobrenome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="flex gap-2">
                    <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((cc) => (
                          <SelectItem key={cc.code} value={cc.code}>
                            {cc.flag} {cc.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {hasChanges ? (
                    <span className="text-yellow-600">Alterações não salvas</span>
                  ) : (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Tudo salvo</span>
                    </>
                  )}
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving || !hasChanges}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alterações'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Informações da sua empresa para documentos e relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyCnpj">CNPJ</Label>
                  <Input
                    id="companyCnpj"
                    value={companyCnpj}
                    onChange={(e) => setCompanyCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">Endereço</Label>
                  <Input
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Rua, número, complemento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyCity">Cidade</Label>
                  <Input
                    id="companyCity"
                    value={companyCity}
                    onChange={(e) => setCompanyCity(e.target.value)}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyState">Estado</Label>
                  <Input
                    id="companyState"
                    value={companyState}
                    onChange={(e) => setCompanyState(e.target.value)}
                    placeholder="Estado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyCurrency">Moeda Padrão</Label>
                  <Select value={companyCurrency} onValueChange={setCompanyCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">R$ - Real Brasileiro</SelectItem>
                      <SelectItem value="EUR">€ - Euro</SelectItem>
                      <SelectItem value="USD">$ - Dólar Americano</SelectItem>
                      <SelectItem value="PLN">zł - Zloty Polonês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveCompany}>
                  Salvar dados da empresa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes por email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações em tempo real no navegador
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Novos Pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado quando um novo pedido for recebido
                  </p>
                </div>
                <Switch
                  checked={orderAlerts}
                  onCheckedChange={setOrderAlerts}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Entrega</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações sobre status de entregas
                  </p>
                </div>
                <Switch
                  checked={deliveryAlerts}
                  onCheckedChange={setDeliveryAlerts}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um resumo semanal do desempenho
                  </p>
                </div>
                <Switch
                  checked={weeklyReports}
                  onCheckedChange={setWeeklyReports}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência do dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Use o botão de tema no header para alternar entre claro e escuro.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Integrações
              </CardTitle>
              <CardDescription>
                Conecte suas plataformas de e-commerce e marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em breve você poderá conectar Shopify, WooCommerce, Facebook Ads e mais.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Alterar Senha</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para sua segurança, recomendamos usar uma senha forte e única.
                  </p>
                  <Button variant="outline">
                    Alterar senha
                  </Button>
                </div>
                <Separator />
                <div>
                  <Label>Sessões Ativas</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gerencie os dispositivos conectados à sua conta.
                  </p>
                  <Badge variant="secondary">1 sessão ativa</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
