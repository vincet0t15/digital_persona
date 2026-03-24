import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

// Always use light mode - dark mode disabled
const applyTheme = () => {
    // Always remove dark class to ensure light mode
    document.documentElement.classList.remove('dark');
};

export function initializeTheme() {
    // Force light mode always
    applyTheme();
}

export function useAppearance() {
    // Always return light, ignore dark/system
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = (mode: Appearance) => {
        // Always force light mode regardless of selection
        setAppearance('light');
        localStorage.setItem('appearance', 'light');
        applyTheme();
    };

    useEffect(() => {
        // Force light mode on mount
        setAppearance('light');
        applyTheme();
    }, []);

    return { appearance, updateAppearance };
}
