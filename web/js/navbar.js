// 全站导航加载与当前页面状态
function markActiveNavigation(container) {
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const links = container.querySelectorAll(".topbar-nav a");

  links.forEach(link => {
    const target = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, "") || "/";
    const active = target === "/"
      ? currentPath === "/"
      : currentPath === target || currentPath.startsWith(target + "/");

    if (active) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
}

async function loadNavigation() {
  const container = document.getElementById("site-nav");
  if (!container) return;

  try {
    const response = await fetch("/nav.html", { cache: "no-store" });
    if (!response.ok) throw new Error("导航文件加载失败");

    container.innerHTML = await response.text();
    markActiveNavigation(container);

    if (typeof setupAuthUI === "function") {
      await setupAuthUI();
    }
  } catch (error) {
    console.error("导航加载失败：", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadNavigation, { once: true });
} else {
  loadNavigation();
}
