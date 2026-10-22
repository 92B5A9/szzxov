// ================================
// SZZXOV 全站账号系统
// ================================
const API_BASE =
  "https://api.szzxov.com";
// ================================
// 获取当前用户
// ================================
async function getCurrentUser() {
  try {
    const response =
      await fetch(
        `${API_BASE}/api/auth/me`,
        {
          method: "GET",
          credentials: "include"
        }
      );
    if (!response.ok) {
      return null;
    }
    const data =
      await response.json();
    if (
      data.ok &&
      data.loggedIn &&
      data.user
    ) {
      return data.user;
    }
    return null;
  } catch (error) {
    console.error(
      "获取登录状态失败：",
      error
    );
    return null;
  }
}
// ================================
// 初始化右上角账号区域
// ================================
async function setupAuthUI() {
  const authArea =
    document.getElementById("authArea");
  if (!authArea) {
    return;
  }
  // 清空原来的内容
  authArea.innerHTML = "";
  const user =
    await getCurrentUser();
  // ================================
  // 未登录
  // ================================
  if (!user) {
    const login =
      document.createElement("a");
    login.href = "/login/";
    login.innerHTML =
      `登录 <span class="en">Login</span>`;
    authArea.appendChild(login);
    return;
  }
  // ================================
  // 已登录
  // ================================
  const userButton =
    document.createElement("button");
  userButton.className =
    "auth-user-button";
  userButton.innerHTML =
    `${escapeHTML(user.username)} ▼`;
  authArea.appendChild(userButton);
  // ================================
  // 用户菜单
  // ================================
  const menu =
    document.createElement("div");
  menu.className =
    "auth-menu";
  menu.style.display = "none";
  // 我的投稿
  const mySubmit =
    document.createElement("a");
  mySubmit.href = "/my/";
  mySubmit.innerHTML =
    `我的投稿 <span class="en">My Posts</span>`;
  menu.appendChild(mySubmit);
  // 管理员后台
  if (user.role === "admin") {
    const admin =
      document.createElement("a");
    admin.href = "/admin/";
    admin.innerHTML =
      `管理后台 <span class="en">Admin</span>`;
    menu.appendChild(admin);
  }
  // 退出登录
  const logout =
    document.createElement("button");
  logout.innerHTML =
    `退出登录 <span class="en">Logout</span>`;
  logout.addEventListener(
    "click",
    async () => {
      logout.disabled = true;
      logout.innerText =
        "退出中...";
      try {
        const response =
          await fetch(
            `${API_BASE}/api/auth/logout`,
            {
              method: "POST",
              credentials: "include"
            }
          );
        if (response.ok) {
          window.location.reload();
        } else {
          logout.innerText =
            "退出失败";
          logout.disabled = false;
        }
      } catch (error) {
        console.error(error);
        logout.innerText =
          "退出失败";
        logout.disabled = false;
      }
    }
  );
  menu.appendChild(logout);
  authArea.appendChild(menu);
  // ================================
  // 点击用户名
  // ================================
  userButton.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
      menu.style.display =
        menu.style.display === "none"
          ? "block"
          : "none";
    }
  );
  // 点击其他地方关闭菜单
  document.addEventListener(
    "click",
    () => {
      menu.style.display =
        "none";
    }
  );
}
// ================================
// HTML 转义
// 防止用户名被当成 HTML
// ================================
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
