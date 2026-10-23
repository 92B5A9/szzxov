// ========================================
// SZZXOV 全站主题管理
// 文件：/js/theme.js
// ========================================
(function () {
  // -------------------------------
  // 获取当前主题
  // -------------------------------
  function getSavedTheme() {
    const savedTheme =
      localStorage.getItem("theme");
    if (savedTheme === "dark") {
      return "dark";
    }
    if (savedTheme === "light") {
      return "light";
    }
    // 第一次访问：
    // 跟随系统深浅色
    if (
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches
    ) {
      return "dark";
    }
    return "light";
  }
  // -------------------------------
  // 应用主题
  // -------------------------------
  function applyTheme(theme) {
    const body = document.body;
    if (!body) {
      return;
    }
    body.classList.remove(
      "light-mode",
      "dark-mode"
    );
    body.classList.add(
      theme === "dark"
        ? "dark-mode"
        : "light-mode"
    );
    // 同时修改浏览器 UI 颜色
    updateBrowserThemeColor(theme);
  }
  // -------------------------------
  // 修改浏览器 UI 颜色
  // Safari / Chrome 等
  // -------------------------------
  function updateBrowserThemeColor(theme) {
    let meta =
      document.querySelector(
        'meta[name="theme-color"]'
      );
    if (!meta) {
      meta =
        document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    if (theme === "dark") {
      meta.setAttribute(
        "content",
        "#111111"
      );
    } else {
      meta.setAttribute(
        "content",
        "#dfe7ef"
      );
    }
  }
  // -------------------------------
  // 设置浅色模式
  // -------------------------------
  function setLightMode() {
    localStorage.setItem(
      "theme",
      "light"
    );
    applyTheme("light");
  }
  // -------------------------------
  // 设置深色模式
  // -------------------------------
  function setDarkMode() {
    localStorage.setItem(
      "theme",
      "dark"
    );
    applyTheme("dark");
  }
  // -------------------------------
  // 切换主题
  // -------------------------------
  function toggleTheme() {
    const isDark =
      document.body.classList.contains(
        "dark-mode"
      );
    if (isDark) {
      setLightMode();
    } else {
      setDarkMode();
    }
  }
  // -------------------------------
  // 页面初始化
  // -------------------------------
  function initTheme() {
    const theme =
      getSavedTheme();
    applyTheme(theme);
  }
  // -------------------------------
  // 暴露给其他 JS / HTML
  // -------------------------------
  window.setLightMode =
    setLightMode;
  window.setDarkMode =
    setDarkMode;
  window.toggleTheme =
    toggleTheme;
  window.initTheme =
    initTheme;
  // -------------------------------
  // 页面加载
  // -------------------------------
  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initTheme
    );
  } else {
    initTheme();
  }
})();
