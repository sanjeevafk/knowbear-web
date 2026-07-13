/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#0e0d0b',
                    800: '#141210',
                    700: '#1c1b19',
                    600: '#282623',
                    500: '#383531',
                },
                accent: {
                    primary: '#d5972c',
                    teal: '#7a9a85',
                    orange: '#b35c37',
                    red: '#a3423f',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}
