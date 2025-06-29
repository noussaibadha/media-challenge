'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    darkMode: false,
    autoApprove: false,
    maintenanceMode: false,
    maxFileSize: '10',
    sessionTimeout: '30',
    defaultRole: 'utilisateur'
  })

  const [activeTab, setActiveTab] = useState('general')

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = async () => {
    // Logique de sauvegarde
    console.log('Sauvegarde des paramètres:', settings)
    // Afficher une notification de succès
    alert('Paramètres sauvegardés avec succès !')
  }

  const tabs = [
    { id: 'general', name: 'Général', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4' },
    { id: 'security', name: 'Sécurité', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'notifications', name: 'Notifications', icon: 'M15 17h5l-5 5v-5zM10.5 17H15l-5 5v-5z' },
    { id: 'system', name: 'Système', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Configurez les paramètres de votre tableau de bord
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation des onglets */}
          <div className="lg:w-64">
            <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      <svg className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      {tab.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">

              {/* Onglet Général */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Paramètres Généraux</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Configurez les paramètres de base de l'application.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Mode sombre</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Activer le thème sombre de l'interface</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.darkMode}
                          onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Rôle par défaut pour les nouveaux utilisateurs
                        </label>
                        <select
                          value={settings.defaultRole}
                          onChange={(e) => handleSettingChange('defaultRole', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="utilisateur">Utilisateur</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Taille maximale des fichiers (MB)
                        </label>
                        <input
                          type="number"
                          value={settings.maxFileSize}
                          onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Sécurité */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sécurité</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Gérez les paramètres de sécurité de l'application.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Approbation automatique</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Approuver automatiquement les nouveaux spots</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoApprove}
                          onChange={(e) => handleSettingChange('autoApprove', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Délai d'expiration de session (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        min="5"
                        max="480"
                      />
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <div className="flex">
                        <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.598 0L3.216 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Attention</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            La modification de ces paramètres peut affecter la sécurité de l'application.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Configurez les paramètres de notification.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications dans l'app</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recevoir des notifications dans l'interface</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications}
                          onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Alertes par email</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recevoir des alertes importantes par email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailAlerts}
                          onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <div className="flex">
                        <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Information</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Les notifications vous aident à rester informé des activités importantes sur votre plateforme.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Système */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Système</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Paramètres système et maintenance.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Mode maintenance</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Activer le mode maintenance pour l'application</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Informations système</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Version:</span>
                            <span className="text-gray-900 dark:text-white">1.2.3</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Base de données:</span>
                            <span className="text-green-600 dark:text-green-400">Connectée</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Stockage:</span>
                            <span className="text-gray-900 dark:text-white">78% utilisé</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Actions rapides</h4>
                        <div className="space-y-2">
                          <button className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200">
                            Vider le cache
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200">
                            Exporter les données
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200">
                            Sauvegarder la base
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                      <div className="flex">
                        <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.598 0L3.216 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Zone dangereuse</h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Le mode maintenance rendra l'application inaccessible aux utilisateurs.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={saveSettings}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sauvegarder les paramètres
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSettings({
                      notifications: true,
                      emailAlerts: false,
                      darkMode: false,
                      autoApprove: false,
                      maintenanceMode: false,
                      maxFileSize: '10',
                      sessionTimeout: '30',
                      defaultRole: 'utilisateur'
                    })
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Réinitialiser
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}