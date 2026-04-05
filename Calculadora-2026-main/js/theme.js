const THEME_KEY = 'calc_theme';

/* Aplica el tema al <body> y actualiza el texto del botón */
const applyTheme = (theme) => {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    }
};

/* Alterna entre temas y persiste la preferencia en localStorage */
const toggleTheme = () => {
    const isDark = document.body.classList.contains('dark-mode');
    const next   = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
};

/* Carga el tema guardado al iniciar la página */
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(saved);
    document.getElementById('theme-toggle')
        ?.addEventListener('click', toggleTheme);
});
