// components/InstallPrompt.tsx
'use client'
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
    prompt(): Promise<void>
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Vérifier si l'app est déjà installée
        const checkInstallation = () => {
            if (window.matchMedia('(display-mode: standalone)').matches) {
                setIsInstalled(true)
            }
        }

        checkInstallation()

        // Écouter l'événement beforeinstallprompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)

            // Attendre un peu avant de montrer le prompt
            setTimeout(() => {
                setShowPrompt(true)
            }, 5000) // 5 secondes après le chargement
        }

        // Écouter l'installation
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setShowPrompt(false)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()

        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('Utilisateur a accepté l\'installation')
        } else {
            console.log('Utilisateur a refusé l\'installation')
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        // Ne pas montrer pendant 24h
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
    }

    // Vérifier si l'utilisateur a déjà refusé récemment
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed')
        if (dismissed) {
            const dismissedTime = parseInt(dismissed)
            const twentyFourHours = 24 * 60 * 60 * 1000

            if (Date.now() - dismissedTime < twentyFourHours) {
                setShowPrompt(false)
            }
        }
    }, [])

    if (isInstalled || !showPrompt || !deferredPrompt) {
        return null
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <img
                        src="/favicon_spotIn.svg"
                        alt="SpotIn"
                        className="w-10 h-10 rounded-lg"
                    />
                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm mb-1">
                            Installer SpotIn
                        </h3>
                        <p className="text-white/90 text-xs mb-3">
                            Ajoutez SpotIn à votre écran d'accueil pour un accès rapide aux meilleurs spots musicaux !
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="bg-white text-purple-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                            >
                                Installer
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="text-white/80 px-3 py-1.5 text-xs hover:text-white transition-colors"
                            >
                                Plus tard
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

// Hook pour détecter si l'app est en mode PWA
export function usePWA() {
    const [isInstalled, setIsInstalled] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Vérifier si l'app est installée
        const checkPWAStatus = () => {
            // Mode standalone (app installée)
            const standalone = window.matchMedia('(display-mode: standalone)').matches
            setIsStandalone(standalone)

            // Ou si lancée depuis l'écran d'accueil (iOS)
            const webappCapable = (window.navigator as any).standalone === true

            setIsInstalled(standalone || webappCapable)
        }

        checkPWAStatus()

        // Écouter les changements de mode d'affichage
        const mediaQuery = window.matchMedia('(display-mode: standalone)')
        mediaQuery.addEventListener('change', checkPWAStatus)

        return () => {
            mediaQuery.removeEventListener('change', checkPWAStatus)
        }
    }, [])

    return { isInstalled, isStandalone }
}