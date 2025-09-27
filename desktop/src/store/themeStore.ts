import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    initializeTheme: () => void;
}

const getSystemTheme = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (theme: Theme): boolean => {
    if (typeof window === 'undefined') return false;
    
    const root = document.documentElement;
    let isDark = false;

    if (theme === 'system') {
        isDark = getSystemTheme();
    } else {
        isDark = theme === 'dark';
    }

    console.log('Applying theme:', theme, 'isDark:', isDark);

    // Apply the dark class
    if (isDark) {
        root.classList.add('dark');
        console.log('Added dark class to document');
    } else {
        root.classList.remove('dark');
        console.log('Removed dark class from document');
    }
    
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    console.log('Document classes:', root.classList.toString());
    
    return isDark;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: 'system',
    isDark: false,

    initializeTheme: () => {
        if (typeof window === 'undefined') return;
        
        console.log('Initializing theme...');
        
        // Get stored theme or default to system
        const stored = localStorage.getItem('epitychia-theme') as Theme;
        const theme = stored || 'system';
        
        console.log('Stored theme:', stored, 'Using theme:', theme);
        
        // Apply theme
        const isDark = applyTheme(theme);
        console.log('Applied theme, isDark:', isDark, 'Document has dark class:', document.documentElement.classList.contains('dark'));
        
        set({ theme, isDark });

        // Listen for system theme changes if using system theme
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                const { theme: currentTheme } = get();
                if (currentTheme === 'system') {
                    const isDark = applyTheme('system');
                    set({ isDark });
                }
            };
            mediaQuery.addEventListener('change', handleChange);
        }
    },

    setTheme: (theme: Theme) => {
        const isDark = applyTheme(theme);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('epitychia-theme', theme);
        }
        
        set({ theme, isDark });

        // Set up system theme listener if needed
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                const { theme: currentTheme } = get();
                if (currentTheme === 'system') {
                    const isDark = applyTheme('system');
                    set({ isDark });
                }
            };
            mediaQuery.addEventListener('change', handleChange);
        }
    },

    toggleTheme: () => {
        const { theme } = get();
        let newTheme: Theme;
        
        if (theme === 'light') {
            newTheme = 'dark';
        } else if (theme === 'dark') {
            newTheme = 'system';
        } else {
            newTheme = 'light';
        }
        
        const isDark = applyTheme(newTheme);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('epitychia-theme', newTheme);
        }
        
        set({ theme: newTheme, isDark });
    },
}));