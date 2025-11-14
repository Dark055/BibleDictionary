/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        // Минималистичная палитра - оттенки белого и серого
        'off-white': '#FAFAF9',
        'warm-white': '#F5F5F4',
        'cream': '#F5F1E8',
        'light-gray': '#E7E5E4',

        // Текст
        'text-primary': '#1C1917',
        'text-secondary': '#78716C',
        'text-muted': '#A8A29E',

        // Один приглушённый акцент для CTA
        'accent-warm': '#A16B5E',
        'accent-warm-hover': '#8E5D52',
      },
      fontFamily: {
        'serif': ['Lora', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Улучшенная типографическая шкала для читабельности
        'verse': ['1.25rem', { lineHeight: '1.8' }],
        'reading': ['1.125rem', { lineHeight: '1.75' }],
      },
      spacing: {
        // Увеличенные отступы для "воздуха"
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // Более тонкие тени для минимализма
        'minimal': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'minimal-md': '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)',
        'minimal-lg': '0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
