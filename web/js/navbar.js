async function loadNavigation() {
  const container = document.getElementById("site-nav");
  if (!container) return;
  try {
    const response = await fetch("/nav.html");
    if (!response.ok) throw new Error("导航文件加载失败");
    container.innerHTML = await response.text();
    if (typeof setupAuthUI === "function") await setupAuthUI();
  } catch (error) {
    console.error("导航加载失败：", error);
  }
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", loadNavigation)
  : loadNavigation();
