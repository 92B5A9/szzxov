// ================================
// SZZXOV 全站导航加载器
// ================================
async function loadNavigation() {
  const container =
    document.getElementById("site-nav");
  if (!container) {
    return;
  }
  try {
    const response =
      await fetch("/nav.html");
    if (!response.ok) {
      throw new Error(
        "导航文件加载失败"
      );
    }
    const html =
      await response.text();
    container.innerHTML = html;
    // 导航加载完成后
    // 再初始化登录状态
    if (typeof setupAuthUI === "function") {
      setupAuthUI();
    }
  } catch (error) {
    console.error(
      "导航加载失败：",
      error
    );
  }
}
document.addEventListener(
  "DOMContentLoaded",
  loadNavigation
);
