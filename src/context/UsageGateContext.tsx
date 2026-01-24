import { createContext, useContext, useState, ReactNode } from 'react';

export type ActionType = 'search' | 'export_data' | 'premium_mode';

export interface UsageGateContextType {
    checkAction: (action: ActionType, mode?: string) => { allowed: boolean; downgraded?: boolean };
    recordAction: (action: ActionType, mode?: string) => void;
    showPremiumModal: boolean;
    setShowPremiumModal: (show: boolean) => void;
    upgradeToPro: () => void;
    isPro: boolean;
    deepDiveUsageCount: number;
    deepDiveLimit: number;
}

const UsageGateContext = createContext<UsageGateContextType | undefined>(undefined);

export function UsageGateProvider({ children }: { children: ReactNode }) {
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // Daily Reset Logic
    const [deepDiveUsageCount, setDeepDiveUsageCount] = useState(() => {
        const storedDate = localStorage.getItem('deep_dive_date');
        const today = new Date().toDateString();

        if (storedDate !== today) {
            // New day, reset count
            localStorage.setItem('deep_dive_date', today);
            localStorage.setItem('deep_dive_usage', '0');
            return 0;
        }

        const stored = localStorage.getItem('deep_dive_usage');
        return stored ? parseInt(stored, 10) : 0;
    });

    const [hasSeenLimitPopup, setHasSeenLimitPopup] = useState(false);

    const DEEP_DIVE_LIMIT = 5;

    // For MVP, simplistic check
    const isPro = localStorage.getItem('knowbear_pro_status') === 'true';

    const checkAction = (
        action: ActionType,
        mode: string = 'fast'
    ): { allowed: boolean; downgraded?: boolean } => {
        // PRO users bypass all limits
        if (isPro) {
            return { allowed: true };
        }

        // HARD GATED Features
        if (action === 'premium_mode' || action === 'export_data') {
            setShowPremiumModal(true);
            return { allowed: false };
        }

        // SEARCH logic
        if (action === 'search') {
            // UNLIMITED FAST MODE FOR EVERYONE (Guest & Free)
            if (mode === 'fast') {
                return { allowed: true };
            }

            // Soft Gate: Deep Dive
            // Both Guest and Free users share this limit logic
            if (mode === 'deep_dive') {
                if (deepDiveUsageCount >= DEEP_DIVE_LIMIT) {
                    if (!hasSeenLimitPopup) {
                        setShowPremiumModal(true);
                        setHasSeenLimitPopup(true);
                    }
                    return { allowed: true, downgraded: true };
                }
            }
        }

        return { allowed: true };
    };

    const recordAction = (action: ActionType, mode: string = 'fast') => {
        if (action === 'search') {
            // We no longer track generic "guest usage" for limits since Fast mode is unlimited.
            // Only track Deep Dive usage.
            if (mode === 'deep_dive' && !isPro) {
                const newCount = deepDiveUsageCount + 1;
                setDeepDiveUsageCount(newCount);
                localStorage.setItem('deep_dive_usage', newCount.toString());
                // Update date just in case
                localStorage.setItem('deep_dive_date', new Date().toDateString());
            }
        }
    };

    const upgradeToPro = () => {
        localStorage.setItem('knowbear_pro_status', 'true');
        window.location.reload();
    };

    return (
        <UsageGateContext.Provider value={{
            checkAction,
            recordAction,
            showPremiumModal,
            setShowPremiumModal,
            upgradeToPro,
            isPro,
            deepDiveUsageCount,
            deepDiveLimit: DEEP_DIVE_LIMIT
        }}>
            {children}
        </UsageGateContext.Provider>
    );
}

export const useUsageGateContext = () => {
    const context = useContext(UsageGateContext);
    if (!context) {
        throw new Error('useUsageGateContext must be used within a UsageGateProvider');
    }
    return context;
};
