'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'

// Supported languages
export const languages = [
  { code: 'pt-BR', name: 'Portugues (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portugues (Portugal)', flag: '🇵🇹' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es', name: 'Espanol', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Espanol (Mexico)', flag: '🇲🇽' },
  { code: 'fr', name: 'Francais', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'zh-TW', name: '中文 (繁體)', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkce', flag: '🇹🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'vi', name: 'Tieng Viet', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'cs', name: 'Cestina', flag: '🇨🇿' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
]

// Translation keys type
export type TranslationKey = keyof typeof translations['pt-BR']

// Translations
export const translations: Record<string, Record<string, string>> = {
  'pt-BR': {
    // Settings page
    'settings.title': 'Configuracoes',
    'settings.subtitle': 'Gerencie suas preferencias e configuracoes da conta',
    'settings.profile': 'Perfil',
    'settings.company': 'Empresa',
    'settings.notifications': 'Notificacoes',
    'settings.appearance': 'Aparencia',
    'settings.integrations': 'Integracoes',
    'settings.security': 'Seguranca',

    // Profile tab
    'profile.title': 'Informacoes do Perfil',
    'profile.subtitle': 'Atualize suas informacoes pessoais',
    'profile.changePhoto': 'Trocar foto',
    'profile.addPhoto': 'Adicionar foto',
    'profile.removePhoto': 'Remover',
    'profile.photoHint': 'JPG, PNG, GIF, WEBP. Max 2MB',
    'profile.firstName': 'Nome',
    'profile.lastName': 'Sobrenome',
    'profile.email': 'Email',
    'profile.phone': 'Telefone',
    'profile.unsavedChanges': 'Alteracoes nao salvas',
    'profile.allSaved': 'Tudo salvo',
    'profile.saveChanges': 'Salvar alteracoes',
    'profile.saving': 'Salvando...',
    'profile.photoUpdated': 'Foto atualizada!',
    'profile.photoUpdatedDesc': 'Sua foto de perfil foi alterada com sucesso.',
    'profile.photoRemoved': 'Foto removida!',
    'profile.photoRemovedDesc': 'Sua foto de perfil foi removida.',
    'profile.profileUpdated': 'Perfil atualizado!',
    'profile.profileUpdatedDesc': 'Suas informacoes foram salvas com sucesso.',

    // Company tab
    'company.title': 'Dados da Empresa',
    'company.subtitle': 'Informacoes da sua empresa para notas fiscais',
    'company.name': 'Nome da Empresa',
    'company.cnpj': 'CNPJ',
    'company.address': 'Endereco',
    'company.city': 'Cidade',
    'company.state': 'Estado',
    'company.currency': 'Moeda Padrao do Dashboard',
    'company.currencyHint': 'Selecione a moeda que sera usada em todo o dashboard. Esta alteracao afetara todos os valores monetarios.',
    'company.currentCurrency': 'Moeda atual',
    'company.updated': 'Dados da empresa atualizados!',
    'company.updatedDesc': 'As informacoes da empresa foram salvas com sucesso.',

    // Notifications tab
    'notifications.channels': 'Canais de Notificacao',
    'notifications.channelsDesc': 'Escolha como deseja receber notificacoes',
    'notifications.email': 'Email',
    'notifications.emailDesc': 'Receber notificacoes por email',
    'notifications.push': 'Push',
    'notifications.pushDesc': 'Notificacoes no navegador',
    'notifications.sound': 'Som',
    'notifications.soundDesc': 'Tocar som ao receber notificacao',
    'notifications.types': 'Tipos de Notificacao',
    'notifications.typesDesc': 'Ative ou desative tipos especificos de notificacoes',
    'notifications.orders': 'Pedidos',
    'notifications.ordersDesc': 'Novos pedidos e atualizacoes',
    'notifications.deliveries': 'Entregas',
    'notifications.deliveriesDesc': 'Atualizacoes de entrega e rastreamento',
    'notifications.stock': 'Estoque',
    'notifications.stockDesc': 'Alertas de estoque baixo',
    'notifications.success': 'Sucesso',
    'notifications.successDesc': 'Metas atingidas e conquistas',
    'notifications.alerts': 'Alertas',
    'notifications.alertsDesc': 'Avisos e problemas importantes',
    'notifications.system': 'Sistema',
    'notifications.systemDesc': 'Atualizacoes e novidades do sistema',

    // Appearance tab
    'appearance.title': 'Aparencia',
    'appearance.subtitle': 'Personalize a aparencia do dashboard',
    'appearance.theme': 'Tema',
    'appearance.light': 'Claro',
    'appearance.lightDesc': 'Tema claro padrao',
    'appearance.dark': 'Escuro',
    'appearance.darkDesc': 'Tema escuro',
    'appearance.system': 'Sistema',
    'appearance.systemDesc': 'Seguir preferencia',
    'appearance.language': 'Idioma',
    'appearance.themeChanged': 'Tema alterado!',
    'appearance.languageChanged': 'Idioma alterado!',
    'appearance.languageChangedDesc': 'O idioma foi atualizado com sucesso.',

    // Integrations tab
    'integrations.title': 'Integracoes',
    'integrations.subtitle': 'Conecte seus servicos e plataformas',
    'integrations.connected': 'Conectado',
    'integrations.connect': 'Conectar',
    'integrations.disconnect': 'Desconectar',
    'integrations.apiWebhooks': 'API & Webhooks',
    'integrations.apiKey': 'API Key',
    'integrations.webhookUrl': 'Webhook URL',
    'integrations.copy': 'Copiar',
    'integrations.copied': 'Copiado!',
    'integrations.test': 'Testar',

    // Security tab
    'security.title': 'Seguranca',
    'security.subtitle': 'Proteja sua conta com opcoes de seguranca',
    'security.changePassword': 'Alterar Senha',
    'security.currentPassword': 'Senha Atual',
    'security.newPassword': 'Nova Senha',
    'security.confirmPassword': 'Confirmar Nova Senha',
    'security.updatePassword': 'Atualizar Senha',
    'security.updating': 'Atualizando...',
    'security.twoFactor': 'Autenticacao de Dois Fatores',
    'security.twoFactorDesc': 'Adicione uma camada extra de seguranca',
    'security.setup2FA': 'Configurar 2FA',
    'security.activeSessions': 'Sessoes Ativas',
    'security.current': 'Atual',
    'security.endSession': 'Encerrar',
    'security.passwordUpdated': 'Senha atualizada!',
    'security.passwordUpdatedDesc': 'Sua senha foi alterada com sucesso.',

    // Common
    'common.search': 'Buscar',
    'common.searchPlaceholder': 'Buscar pais...',
    'common.noResults': 'Nenhum resultado encontrado.',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.error': 'Erro!',
    'common.validationError': 'Erro de validacao!',

    // Header
    'header.search': 'Buscar pedidos, produtos...',
    'header.notifications': 'Notificacoes',
    'header.newNotifications': 'novas',
    'header.markAllRead': 'Marcar todas como lidas',
    'header.noNotifications': 'Nenhuma notificacao',
    'header.viewAll': 'Ver todas as notificacoes',
    'header.selectCountry': 'Selecionar Pais',
    'header.allCountries': 'Todos os Paises',
    'header.manageCountries': 'Gerenciar Paises',
    'header.myProfile': 'Meu Perfil',
    'header.workspace': 'Workspace',
    'header.subscription': 'Assinatura',
    'header.settings': 'Configuracoes',
    'header.logout': 'Sair da conta',

    // Date periods
    'period.today': 'Hoje',
    'period.yesterday': 'Ontem',
    'period.week': 'Esta Semana',
    'period.month': 'Este Mes',
    'period.lastMonth': 'Mes Passado',
    'period.max': 'MAXIMO',

    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.orders': 'Pedidos',
    'sidebar.products': 'Produtos',
    'sidebar.customers': 'Clientes',
    'sidebar.analytics': 'Analiticos',
    'sidebar.countries': 'Paises',
    'sidebar.goals': 'Metas',
    'sidebar.settings': 'Configuracoes',
  },

  'en-US': {
    // Settings page
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account preferences and settings',
    'settings.profile': 'Profile',
    'settings.company': 'Company',
    'settings.notifications': 'Notifications',
    'settings.appearance': 'Appearance',
    'settings.integrations': 'Integrations',
    'settings.security': 'Security',

    // Profile tab
    'profile.title': 'Profile Information',
    'profile.subtitle': 'Update your personal information',
    'profile.changePhoto': 'Change photo',
    'profile.addPhoto': 'Add photo',
    'profile.removePhoto': 'Remove',
    'profile.photoHint': 'JPG, PNG, GIF, WEBP. Max 2MB',
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.unsavedChanges': 'Unsaved changes',
    'profile.allSaved': 'All saved',
    'profile.saveChanges': 'Save changes',
    'profile.saving': 'Saving...',
    'profile.photoUpdated': 'Photo updated!',
    'profile.photoUpdatedDesc': 'Your profile photo has been changed successfully.',
    'profile.photoRemoved': 'Photo removed!',
    'profile.photoRemovedDesc': 'Your profile photo has been removed.',
    'profile.profileUpdated': 'Profile updated!',
    'profile.profileUpdatedDesc': 'Your information has been saved successfully.',

    // Company tab
    'company.title': 'Company Data',
    'company.subtitle': 'Company information for invoices',
    'company.name': 'Company Name',
    'company.cnpj': 'Tax ID',
    'company.address': 'Address',
    'company.city': 'City',
    'company.state': 'State',
    'company.currency': 'Dashboard Default Currency',
    'company.currencyHint': 'Select the currency to be used throughout the dashboard. This change will affect all monetary values.',
    'company.currentCurrency': 'Current currency',
    'company.updated': 'Company data updated!',
    'company.updatedDesc': 'Company information has been saved successfully.',

    // Notifications tab
    'notifications.channels': 'Notification Channels',
    'notifications.channelsDesc': 'Choose how you want to receive notifications',
    'notifications.email': 'Email',
    'notifications.emailDesc': 'Receive notifications by email',
    'notifications.push': 'Push',
    'notifications.pushDesc': 'Browser notifications',
    'notifications.sound': 'Sound',
    'notifications.soundDesc': 'Play sound when receiving notification',
    'notifications.types': 'Notification Types',
    'notifications.typesDesc': 'Enable or disable specific notification types',
    'notifications.orders': 'Orders',
    'notifications.ordersDesc': 'New orders and updates',
    'notifications.deliveries': 'Deliveries',
    'notifications.deliveriesDesc': 'Delivery updates and tracking',
    'notifications.stock': 'Stock',
    'notifications.stockDesc': 'Low stock alerts',
    'notifications.success': 'Success',
    'notifications.successDesc': 'Goals achieved and accomplishments',
    'notifications.alerts': 'Alerts',
    'notifications.alertsDesc': 'Important warnings and issues',
    'notifications.system': 'System',
    'notifications.systemDesc': 'System updates and news',

    // Appearance tab
    'appearance.title': 'Appearance',
    'appearance.subtitle': 'Customize the dashboard appearance',
    'appearance.theme': 'Theme',
    'appearance.light': 'Light',
    'appearance.lightDesc': 'Default light theme',
    'appearance.dark': 'Dark',
    'appearance.darkDesc': 'Dark theme',
    'appearance.system': 'System',
    'appearance.systemDesc': 'Follow system preference',
    'appearance.language': 'Language',
    'appearance.themeChanged': 'Theme changed!',
    'appearance.languageChanged': 'Language changed!',
    'appearance.languageChangedDesc': 'Language has been updated successfully.',

    // Integrations tab
    'integrations.title': 'Integrations',
    'integrations.subtitle': 'Connect your services and platforms',
    'integrations.connected': 'Connected',
    'integrations.connect': 'Connect',
    'integrations.disconnect': 'Disconnect',
    'integrations.apiWebhooks': 'API & Webhooks',
    'integrations.apiKey': 'API Key',
    'integrations.webhookUrl': 'Webhook URL',
    'integrations.copy': 'Copy',
    'integrations.copied': 'Copied!',
    'integrations.test': 'Test',

    // Security tab
    'security.title': 'Security',
    'security.subtitle': 'Protect your account with security options',
    'security.changePassword': 'Change Password',
    'security.currentPassword': 'Current Password',
    'security.newPassword': 'New Password',
    'security.confirmPassword': 'Confirm New Password',
    'security.updatePassword': 'Update Password',
    'security.updating': 'Updating...',
    'security.twoFactor': 'Two-Factor Authentication',
    'security.twoFactorDesc': 'Add an extra layer of security',
    'security.setup2FA': 'Setup 2FA',
    'security.activeSessions': 'Active Sessions',
    'security.current': 'Current',
    'security.endSession': 'End',
    'security.passwordUpdated': 'Password updated!',
    'security.passwordUpdatedDesc': 'Your password has been changed successfully.',

    // Common
    'common.search': 'Search',
    'common.searchPlaceholder': 'Search country...',
    'common.noResults': 'No results found.',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.error': 'Error!',
    'common.validationError': 'Validation error!',

    // Header
    'header.search': 'Search orders, products...',
    'header.notifications': 'Notifications',
    'header.newNotifications': 'new',
    'header.markAllRead': 'Mark all as read',
    'header.noNotifications': 'No notifications',
    'header.viewAll': 'View all notifications',
    'header.selectCountry': 'Select Country',
    'header.allCountries': 'All Countries',
    'header.manageCountries': 'Manage Countries',
    'header.myProfile': 'My Profile',
    'header.workspace': 'Workspace',
    'header.subscription': 'Subscription',
    'header.settings': 'Settings',
    'header.logout': 'Sign out',

    // Date periods
    'period.today': 'Today',
    'period.yesterday': 'Yesterday',
    'period.week': 'This Week',
    'period.month': 'This Month',
    'period.lastMonth': 'Last Month',
    'period.max': 'MAX',

    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.orders': 'Orders',
    'sidebar.products': 'Products',
    'sidebar.customers': 'Customers',
    'sidebar.analytics': 'Analytics',
    'sidebar.countries': 'Countries',
    'sidebar.goals': 'Goals',
    'sidebar.settings': 'Settings',
  },

  'es': {
    // Settings page
    'settings.title': 'Configuracion',
    'settings.subtitle': 'Administra tus preferencias y configuracion de cuenta',
    'settings.profile': 'Perfil',
    'settings.company': 'Empresa',
    'settings.notifications': 'Notificaciones',
    'settings.appearance': 'Apariencia',
    'settings.integrations': 'Integraciones',
    'settings.security': 'Seguridad',

    // Profile tab
    'profile.title': 'Informacion del Perfil',
    'profile.subtitle': 'Actualiza tu informacion personal',
    'profile.changePhoto': 'Cambiar foto',
    'profile.addPhoto': 'Agregar foto',
    'profile.removePhoto': 'Eliminar',
    'profile.photoHint': 'JPG, PNG, GIF, WEBP. Max 2MB',
    'profile.firstName': 'Nombre',
    'profile.lastName': 'Apellido',
    'profile.email': 'Correo',
    'profile.phone': 'Telefono',
    'profile.unsavedChanges': 'Cambios sin guardar',
    'profile.allSaved': 'Todo guardado',
    'profile.saveChanges': 'Guardar cambios',
    'profile.saving': 'Guardando...',
    'profile.photoUpdated': 'Foto actualizada!',
    'profile.photoUpdatedDesc': 'Tu foto de perfil ha sido cambiada exitosamente.',
    'profile.photoRemoved': 'Foto eliminada!',
    'profile.photoRemovedDesc': 'Tu foto de perfil ha sido eliminada.',
    'profile.profileUpdated': 'Perfil actualizado!',
    'profile.profileUpdatedDesc': 'Tu informacion ha sido guardada exitosamente.',

    // Company tab
    'company.title': 'Datos de la Empresa',
    'company.subtitle': 'Informacion de la empresa para facturas',
    'company.name': 'Nombre de la Empresa',
    'company.cnpj': 'NIF/CIF',
    'company.address': 'Direccion',
    'company.city': 'Ciudad',
    'company.state': 'Estado/Provincia',
    'company.currency': 'Moneda Predeterminada',
    'company.currencyHint': 'Selecciona la moneda que se usara en todo el dashboard. Este cambio afectara todos los valores monetarios.',
    'company.currentCurrency': 'Moneda actual',
    'company.updated': 'Datos de empresa actualizados!',
    'company.updatedDesc': 'La informacion de la empresa ha sido guardada exitosamente.',

    // Notifications tab
    'notifications.channels': 'Canales de Notificacion',
    'notifications.channelsDesc': 'Elige como quieres recibir notificaciones',
    'notifications.email': 'Correo',
    'notifications.emailDesc': 'Recibir notificaciones por correo',
    'notifications.push': 'Push',
    'notifications.pushDesc': 'Notificaciones del navegador',
    'notifications.sound': 'Sonido',
    'notifications.soundDesc': 'Reproducir sonido al recibir notificacion',
    'notifications.types': 'Tipos de Notificacion',
    'notifications.typesDesc': 'Activa o desactiva tipos especificos de notificaciones',
    'notifications.orders': 'Pedidos',
    'notifications.ordersDesc': 'Nuevos pedidos y actualizaciones',
    'notifications.deliveries': 'Entregas',
    'notifications.deliveriesDesc': 'Actualizaciones de entrega y seguimiento',
    'notifications.stock': 'Inventario',
    'notifications.stockDesc': 'Alertas de bajo inventario',
    'notifications.success': 'Exito',
    'notifications.successDesc': 'Metas alcanzadas y logros',
    'notifications.alerts': 'Alertas',
    'notifications.alertsDesc': 'Avisos y problemas importantes',
    'notifications.system': 'Sistema',
    'notifications.systemDesc': 'Actualizaciones y novedades del sistema',

    // Appearance tab
    'appearance.title': 'Apariencia',
    'appearance.subtitle': 'Personaliza la apariencia del dashboard',
    'appearance.theme': 'Tema',
    'appearance.light': 'Claro',
    'appearance.lightDesc': 'Tema claro predeterminado',
    'appearance.dark': 'Oscuro',
    'appearance.darkDesc': 'Tema oscuro',
    'appearance.system': 'Sistema',
    'appearance.systemDesc': 'Seguir preferencia del sistema',
    'appearance.language': 'Idioma',
    'appearance.themeChanged': 'Tema cambiado!',
    'appearance.languageChanged': 'Idioma cambiado!',
    'appearance.languageChangedDesc': 'El idioma ha sido actualizado exitosamente.',

    // Integrations tab
    'integrations.title': 'Integraciones',
    'integrations.subtitle': 'Conecta tus servicios y plataformas',
    'integrations.connected': 'Conectado',
    'integrations.connect': 'Conectar',
    'integrations.disconnect': 'Desconectar',
    'integrations.apiWebhooks': 'API y Webhooks',
    'integrations.apiKey': 'API Key',
    'integrations.webhookUrl': 'URL del Webhook',
    'integrations.copy': 'Copiar',
    'integrations.copied': 'Copiado!',
    'integrations.test': 'Probar',

    // Security tab
    'security.title': 'Seguridad',
    'security.subtitle': 'Protege tu cuenta con opciones de seguridad',
    'security.changePassword': 'Cambiar Contrasena',
    'security.currentPassword': 'Contrasena Actual',
    'security.newPassword': 'Nueva Contrasena',
    'security.confirmPassword': 'Confirmar Nueva Contrasena',
    'security.updatePassword': 'Actualizar Contrasena',
    'security.updating': 'Actualizando...',
    'security.twoFactor': 'Autenticacion de Dos Factores',
    'security.twoFactorDesc': 'Agrega una capa extra de seguridad',
    'security.setup2FA': 'Configurar 2FA',
    'security.activeSessions': 'Sesiones Activas',
    'security.current': 'Actual',
    'security.endSession': 'Cerrar',
    'security.passwordUpdated': 'Contrasena actualizada!',
    'security.passwordUpdatedDesc': 'Tu contrasena ha sido cambiada exitosamente.',

    // Common
    'common.search': 'Buscar',
    'common.searchPlaceholder': 'Buscar pais...',
    'common.noResults': 'No se encontraron resultados.',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.error': 'Error!',
    'common.validationError': 'Error de validacion!',

    // Header
    'header.search': 'Buscar pedidos, productos...',
    'header.notifications': 'Notificaciones',
    'header.newNotifications': 'nuevas',
    'header.markAllRead': 'Marcar todas como leidas',
    'header.noNotifications': 'Sin notificaciones',
    'header.viewAll': 'Ver todas las notificaciones',
    'header.selectCountry': 'Seleccionar Pais',
    'header.allCountries': 'Todos los Paises',
    'header.manageCountries': 'Administrar Paises',
    'header.myProfile': 'Mi Perfil',
    'header.workspace': 'Espacio de trabajo',
    'header.subscription': 'Suscripcion',
    'header.settings': 'Configuracion',
    'header.logout': 'Cerrar sesion',

    // Date periods
    'period.today': 'Hoy',
    'period.yesterday': 'Ayer',
    'period.week': 'Esta Semana',
    'period.month': 'Este Mes',
    'period.lastMonth': 'Mes Pasado',
    'period.max': 'MAXIMO',

    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.orders': 'Pedidos',
    'sidebar.products': 'Productos',
    'sidebar.customers': 'Clientes',
    'sidebar.analytics': 'Analitica',
    'sidebar.countries': 'Paises',
    'sidebar.goals': 'Metas',
    'sidebar.settings': 'Configuracion',
  },

  'fr': {
    // Settings page
    'settings.title': 'Parametres',
    'settings.subtitle': 'Gerez vos preferences et parametres de compte',
    'settings.profile': 'Profil',
    'settings.company': 'Entreprise',
    'settings.notifications': 'Notifications',
    'settings.appearance': 'Apparence',
    'settings.integrations': 'Integrations',
    'settings.security': 'Securite',

    // Profile tab
    'profile.title': 'Informations du Profil',
    'profile.subtitle': 'Mettez a jour vos informations personnelles',
    'profile.changePhoto': 'Changer la photo',
    'profile.addPhoto': 'Ajouter une photo',
    'profile.removePhoto': 'Supprimer',
    'profile.photoHint': 'JPG, PNG, GIF, WEBP. Max 2Mo',
    'profile.firstName': 'Prenom',
    'profile.lastName': 'Nom',
    'profile.email': 'Email',
    'profile.phone': 'Telephone',
    'profile.unsavedChanges': 'Modifications non enregistrees',
    'profile.allSaved': 'Tout enregistre',
    'profile.saveChanges': 'Enregistrer',
    'profile.saving': 'Enregistrement...',
    'profile.photoUpdated': 'Photo mise a jour!',
    'profile.photoUpdatedDesc': 'Votre photo de profil a ete modifiee avec succes.',
    'profile.photoRemoved': 'Photo supprimee!',
    'profile.photoRemovedDesc': 'Votre photo de profil a ete supprimee.',
    'profile.profileUpdated': 'Profil mis a jour!',
    'profile.profileUpdatedDesc': 'Vos informations ont ete enregistrees avec succes.',

    // Company tab
    'company.title': 'Donnees de lEntreprise',
    'company.subtitle': 'Informations de lentreprise pour les factures',
    'company.name': 'Nom de lEntreprise',
    'company.cnpj': 'SIRET',
    'company.address': 'Adresse',
    'company.city': 'Ville',
    'company.state': 'Region',
    'company.currency': 'Devise par Defaut',
    'company.currencyHint': 'Selectionnez la devise a utiliser dans tout le dashboard. Ce changement affectera toutes les valeurs monetaires.',
    'company.currentCurrency': 'Devise actuelle',
    'company.updated': 'Donnees de lentreprise mises a jour!',
    'company.updatedDesc': 'Les informations de lentreprise ont ete enregistrees avec succes.',

    // Notifications tab
    'notifications.channels': 'Canaux de Notification',
    'notifications.channelsDesc': 'Choisissez comment recevoir les notifications',
    'notifications.email': 'Email',
    'notifications.emailDesc': 'Recevoir des notifications par email',
    'notifications.push': 'Push',
    'notifications.pushDesc': 'Notifications du navigateur',
    'notifications.sound': 'Son',
    'notifications.soundDesc': 'Jouer un son lors de la reception',
    'notifications.types': 'Types de Notification',
    'notifications.typesDesc': 'Activez ou desactivez des types specifiques',
    'notifications.orders': 'Commandes',
    'notifications.ordersDesc': 'Nouvelles commandes et mises a jour',
    'notifications.deliveries': 'Livraisons',
    'notifications.deliveriesDesc': 'Mises a jour de livraison et suivi',
    'notifications.stock': 'Stock',
    'notifications.stockDesc': 'Alertes de stock bas',
    'notifications.success': 'Succes',
    'notifications.successDesc': 'Objectifs atteints et accomplissements',
    'notifications.alerts': 'Alertes',
    'notifications.alertsDesc': 'Avertissements et problemes importants',
    'notifications.system': 'Systeme',
    'notifications.systemDesc': 'Mises a jour et nouveautes du systeme',

    // Appearance tab
    'appearance.title': 'Apparence',
    'appearance.subtitle': 'Personnalisez lapparence du dashboard',
    'appearance.theme': 'Theme',
    'appearance.light': 'Clair',
    'appearance.lightDesc': 'Theme clair par defaut',
    'appearance.dark': 'Sombre',
    'appearance.darkDesc': 'Theme sombre',
    'appearance.system': 'Systeme',
    'appearance.systemDesc': 'Suivre la preference systeme',
    'appearance.language': 'Langue',
    'appearance.themeChanged': 'Theme change!',
    'appearance.languageChanged': 'Langue changee!',
    'appearance.languageChangedDesc': 'La langue a ete mise a jour avec succes.',

    // Integrations tab
    'integrations.title': 'Integrations',
    'integrations.subtitle': 'Connectez vos services et plateformes',
    'integrations.connected': 'Connecte',
    'integrations.connect': 'Connecter',
    'integrations.disconnect': 'Deconnecter',
    'integrations.apiWebhooks': 'API et Webhooks',
    'integrations.apiKey': 'Cle API',
    'integrations.webhookUrl': 'URL Webhook',
    'integrations.copy': 'Copier',
    'integrations.copied': 'Copie!',
    'integrations.test': 'Tester',

    // Security tab
    'security.title': 'Securite',
    'security.subtitle': 'Protegez votre compte avec des options de securite',
    'security.changePassword': 'Changer le Mot de Passe',
    'security.currentPassword': 'Mot de Passe Actuel',
    'security.newPassword': 'Nouveau Mot de Passe',
    'security.confirmPassword': 'Confirmer le Nouveau Mot de Passe',
    'security.updatePassword': 'Mettre a Jour',
    'security.updating': 'Mise a jour...',
    'security.twoFactor': 'Authentification a Deux Facteurs',
    'security.twoFactorDesc': 'Ajoutez une couche de securite supplementaire',
    'security.setup2FA': 'Configurer 2FA',
    'security.activeSessions': 'Sessions Actives',
    'security.current': 'Actuelle',
    'security.endSession': 'Terminer',
    'security.passwordUpdated': 'Mot de passe mis a jour!',
    'security.passwordUpdatedDesc': 'Votre mot de passe a ete change avec succes.',

    // Common
    'common.search': 'Rechercher',
    'common.searchPlaceholder': 'Rechercher un pays...',
    'common.noResults': 'Aucun resultat trouve.',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.error': 'Erreur!',
    'common.validationError': 'Erreur de validation!',

    // Header
    'header.search': 'Rechercher commandes, produits...',
    'header.notifications': 'Notifications',
    'header.newNotifications': 'nouvelles',
    'header.markAllRead': 'Tout marquer comme lu',
    'header.noNotifications': 'Aucune notification',
    'header.viewAll': 'Voir toutes les notifications',
    'header.selectCountry': 'Selectionner le Pays',
    'header.allCountries': 'Tous les Pays',
    'header.manageCountries': 'Gerer les Pays',
    'header.myProfile': 'Mon Profil',
    'header.workspace': 'Espace de travail',
    'header.subscription': 'Abonnement',
    'header.settings': 'Parametres',
    'header.logout': 'Deconnexion',

    // Date periods
    'period.today': 'Aujourdhui',
    'period.yesterday': 'Hier',
    'period.week': 'Cette Semaine',
    'period.month': 'Ce Mois',
    'period.lastMonth': 'Mois Dernier',
    'period.max': 'MAXIMUM',

    // Sidebar
    'sidebar.dashboard': 'Tableau de bord',
    'sidebar.orders': 'Commandes',
    'sidebar.products': 'Produits',
    'sidebar.customers': 'Clients',
    'sidebar.analytics': 'Analytique',
    'sidebar.countries': 'Pays',
    'sidebar.goals': 'Objectifs',
    'sidebar.settings': 'Parametres',
  },

  'de': {
    // Settings page
    'settings.title': 'Einstellungen',
    'settings.subtitle': 'Verwalten Sie Ihre Kontoeinstellungen',
    'settings.profile': 'Profil',
    'settings.company': 'Unternehmen',
    'settings.notifications': 'Benachrichtigungen',
    'settings.appearance': 'Darstellung',
    'settings.integrations': 'Integrationen',
    'settings.security': 'Sicherheit',

    // Profile tab
    'profile.title': 'Profilinformationen',
    'profile.subtitle': 'Aktualisieren Sie Ihre personlichen Informationen',
    'profile.changePhoto': 'Foto andern',
    'profile.addPhoto': 'Foto hinzufugen',
    'profile.removePhoto': 'Entfernen',
    'profile.photoHint': 'JPG, PNG, GIF, WEBP. Max 2MB',
    'profile.firstName': 'Vorname',
    'profile.lastName': 'Nachname',
    'profile.email': 'E-Mail',
    'profile.phone': 'Telefon',
    'profile.unsavedChanges': 'Nicht gespeicherte Anderungen',
    'profile.allSaved': 'Alles gespeichert',
    'profile.saveChanges': 'Anderungen speichern',
    'profile.saving': 'Speichern...',
    'profile.photoUpdated': 'Foto aktualisiert!',
    'profile.photoUpdatedDesc': 'Ihr Profilfoto wurde erfolgreich geandert.',
    'profile.photoRemoved': 'Foto entfernt!',
    'profile.photoRemovedDesc': 'Ihr Profilfoto wurde entfernt.',
    'profile.profileUpdated': 'Profil aktualisiert!',
    'profile.profileUpdatedDesc': 'Ihre Informationen wurden erfolgreich gespeichert.',

    // Company tab
    'company.title': 'Unternehmensdaten',
    'company.subtitle': 'Unternehmensinformationen fur Rechnungen',
    'company.name': 'Unternehmensname',
    'company.cnpj': 'Steuernummer',
    'company.address': 'Adresse',
    'company.city': 'Stadt',
    'company.state': 'Bundesland',
    'company.currency': 'Standard-Wahrung',
    'company.currencyHint': 'Wahlen Sie die Wahrung fur das gesamte Dashboard. Diese Anderung wirkt sich auf alle Geldwerte aus.',
    'company.currentCurrency': 'Aktuelle Wahrung',
    'company.updated': 'Unternehmensdaten aktualisiert!',
    'company.updatedDesc': 'Die Unternehmensinformationen wurden erfolgreich gespeichert.',

    // Notifications tab
    'notifications.channels': 'Benachrichtigungskanale',
    'notifications.channelsDesc': 'Wahlen Sie, wie Sie Benachrichtigungen erhalten mochten',
    'notifications.email': 'E-Mail',
    'notifications.emailDesc': 'Benachrichtigungen per E-Mail erhalten',
    'notifications.push': 'Push',
    'notifications.pushDesc': 'Browser-Benachrichtigungen',
    'notifications.sound': 'Ton',
    'notifications.soundDesc': 'Ton bei Benachrichtigung abspielen',
    'notifications.types': 'Benachrichtigungstypen',
    'notifications.typesDesc': 'Aktivieren oder deaktivieren Sie bestimmte Benachrichtigungstypen',
    'notifications.orders': 'Bestellungen',
    'notifications.ordersDesc': 'Neue Bestellungen und Updates',
    'notifications.deliveries': 'Lieferungen',
    'notifications.deliveriesDesc': 'Lieferupdates und Tracking',
    'notifications.stock': 'Lagerbestand',
    'notifications.stockDesc': 'Warnungen bei niedrigem Lagerbestand',
    'notifications.success': 'Erfolg',
    'notifications.successDesc': 'Erreichte Ziele und Erfolge',
    'notifications.alerts': 'Warnungen',
    'notifications.alertsDesc': 'Wichtige Hinweise und Probleme',
    'notifications.system': 'System',
    'notifications.systemDesc': 'Systemupdates und Neuigkeiten',

    // Appearance tab
    'appearance.title': 'Darstellung',
    'appearance.subtitle': 'Passen Sie das Erscheinungsbild des Dashboards an',
    'appearance.theme': 'Design',
    'appearance.light': 'Hell',
    'appearance.lightDesc': 'Standard helles Design',
    'appearance.dark': 'Dunkel',
    'appearance.darkDesc': 'Dunkles Design',
    'appearance.system': 'System',
    'appearance.systemDesc': 'Systemeinstellung folgen',
    'appearance.language': 'Sprache',
    'appearance.themeChanged': 'Design geandert!',
    'appearance.languageChanged': 'Sprache geandert!',
    'appearance.languageChangedDesc': 'Die Sprache wurde erfolgreich aktualisiert.',

    // Integrations tab
    'integrations.title': 'Integrationen',
    'integrations.subtitle': 'Verbinden Sie Ihre Dienste und Plattformen',
    'integrations.connected': 'Verbunden',
    'integrations.connect': 'Verbinden',
    'integrations.disconnect': 'Trennen',
    'integrations.apiWebhooks': 'API & Webhooks',
    'integrations.apiKey': 'API-Schlussel',
    'integrations.webhookUrl': 'Webhook-URL',
    'integrations.copy': 'Kopieren',
    'integrations.copied': 'Kopiert!',
    'integrations.test': 'Testen',

    // Security tab
    'security.title': 'Sicherheit',
    'security.subtitle': 'Schutzen Sie Ihr Konto mit Sicherheitsoptionen',
    'security.changePassword': 'Passwort andern',
    'security.currentPassword': 'Aktuelles Passwort',
    'security.newPassword': 'Neues Passwort',
    'security.confirmPassword': 'Neues Passwort bestatigen',
    'security.updatePassword': 'Passwort aktualisieren',
    'security.updating': 'Aktualisieren...',
    'security.twoFactor': 'Zwei-Faktor-Authentifizierung',
    'security.twoFactorDesc': 'Fugen Sie eine zusatzliche Sicherheitsebene hinzu',
    'security.setup2FA': '2FA einrichten',
    'security.activeSessions': 'Aktive Sitzungen',
    'security.current': 'Aktuell',
    'security.endSession': 'Beenden',
    'security.passwordUpdated': 'Passwort aktualisiert!',
    'security.passwordUpdatedDesc': 'Ihr Passwort wurde erfolgreich geandert.',

    // Common
    'common.search': 'Suchen',
    'common.searchPlaceholder': 'Land suchen...',
    'common.noResults': 'Keine Ergebnisse gefunden.',
    'common.cancel': 'Abbrechen',
    'common.confirm': 'Bestatigen',
    'common.error': 'Fehler!',
    'common.validationError': 'Validierungsfehler!',

    // Header
    'header.search': 'Bestellungen, Produkte suchen...',
    'header.notifications': 'Benachrichtigungen',
    'header.newNotifications': 'neue',
    'header.markAllRead': 'Alle als gelesen markieren',
    'header.noNotifications': 'Keine Benachrichtigungen',
    'header.viewAll': 'Alle Benachrichtigungen anzeigen',
    'header.selectCountry': 'Land auswahlen',
    'header.allCountries': 'Alle Lander',
    'header.manageCountries': 'Lander verwalten',
    'header.myProfile': 'Mein Profil',
    'header.workspace': 'Arbeitsbereich',
    'header.subscription': 'Abonnement',
    'header.settings': 'Einstellungen',
    'header.logout': 'Abmelden',

    // Date periods
    'period.today': 'Heute',
    'period.yesterday': 'Gestern',
    'period.week': 'Diese Woche',
    'period.month': 'Dieser Monat',
    'period.lastMonth': 'Letzter Monat',
    'period.max': 'MAXIMUM',

    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.orders': 'Bestellungen',
    'sidebar.products': 'Produkte',
    'sidebar.customers': 'Kunden',
    'sidebar.analytics': 'Analytik',
    'sidebar.countries': 'Lander',
    'sidebar.goals': 'Ziele',
    'sidebar.settings': 'Einstellungen',
  },
}

// Fallback function for missing translations
const getFallbackTranslation = (key: string, lang: string): string => {
  // Try pt-BR as fallback, then en-US, then return the key itself
  if (translations['pt-BR'][key]) return translations['pt-BR'][key]
  if (translations['en-US'][key]) return translations['en-US'][key]
  return key
}

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
  languageInfo: typeof languages[0] | undefined
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('pt-BR')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('dod-language')
    if (savedLanguage && languages.some(l => l.code === savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang)
    localStorage.setItem('dod-language', lang)
    // Update HTML lang attribute
    document.documentElement.lang = lang
  }, [])

  // Translation function
  const t = useCallback((key: string): string => {
    const langTranslations = translations[language]
    if (langTranslations && langTranslations[key]) {
      return langTranslations[key]
    }
    return getFallbackTranslation(key, language)
  }, [language])

  const languageInfo = languages.find(l => l.code === language)

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languageInfo,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
