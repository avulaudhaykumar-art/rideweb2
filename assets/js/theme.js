/* =========================================================
   SMART RIDESHARE - THEME TOGGLE (DARK / LIGHT MODE)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("themeToggle");
    const currentTheme = localStorage.getItem("theme") || "light";

    if (currentTheme === "dark") {
        document.body.classList.add("dark-theme");
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
            
            const theme = document.body.classList.contains("dark-theme") ? "dark" : "light";
            localStorage.setItem("theme", theme);
        });
    }
});
