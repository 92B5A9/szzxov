// 全站主题管理
(() => {
  const getTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");
    document.body.classList.toggle("light-mode", theme !== "dark");
    document.documentElement.style.colorScheme = theme;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = theme === "dark" ? "#111111" : "#f5f5f5";
  }

  function setTheme(theme) {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }

  window.setLightMode = () => setTheme("light");
  window.setDarkMode = () => setTheme("dark");
  window.toggleTheme = () => setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");

  applyTheme(getTheme());
})();
