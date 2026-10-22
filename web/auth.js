// ================================
// SZZXOV 全站账号状态
// ================================
const API_BASE = "https://api.szzxov.com";
async function getCurrentUser() {
  try {
    const response = await fetch(
      `${API_BASE}/api/auth/me`,
      {
        method: "GET",
        credentials: "include"
      }
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.ok && data.loggedIn) {
      return data.user;
    }
    return null;
  } catch (error) {
    console.error("获取登录状态失败：", error);
    return null;
  }
}
// ================================
// 创建右上角账号区域
// ================================
async function setupAuthUI() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) {
    return;
  }
  // 防止重复创建
  if (document.getElementById("authArea")) {
    return;
  }
  const authArea = document.createElement("div");
  authArea.id = "authArea";
  authArea.style.marginLeft = "auto";
  authArea.style.position = "relative";
  topbar.appendChild(authArea);
  const user = await getCurrentUser();
  // ================================
  // 未登录
  // ================================
  if (!user) {
    const login = document.createElement("a");
    login.href = "/login/";
    login.innerText = "登录";
    authArea.appendChild(login);
    return;
  }
  // ================================
  // 已登录
  // ================================
  const usernameButton =
    document.createElement("button");
  usernameButton.innerText =
    user.username + " ▼";
  usernameButton.style.background = "none";
  usernameButton.style.border = "none";
  usernameButton.style.cursor = "pointer";
  usernameButton.style.font = "inherit";
  usernameButton.style.padding = "0";
  authArea.appendChild(usernameButton);
  // ================================
  // 用户菜单
  // ================================
  const menu = document.createElement("div");
  menu.style.display = "none";
  menu.style.position = "absolute";
  menu.style.right = "0";
  menu.style.top = "35px";
  menu.style.minWidth = "140px";
  menu.style.padding = "8px";
  menu.style.borderRadius = "12px";
  menu.style.background = "rgba(255,255,255,0.95)";
  menu.style.boxShadow =
    "0 8px 30px rgba(0,0,0,0.15)";
  menu.style.zIndex = "9999";
  // 我的投稿
  const mySubmit =
    document.createElement("a");
  mySubmit.href = "/my/";
  mySubmit.innerText = "我的投稿";
  mySubmit.style.display = "block";
  mySubmit.style.padding = "8px";
  mySubmit.style.textDecoration = "none";
  menu.appendChild(mySubmit);
  // 管理员后台
  if (user.role === "admin") {
    const admin =
      document.createElement("a");
    admin.href = "/admin/";
    admin.innerText = "管理后台";
    admin.style.display = "block";
    admin.style.padding = "8px";
    admin.style.textDecoration = "none";
    menu.appendChild(admin);
  }
  // 退出登录
  const logout =
    document.createElement("button");
  logout.innerText = "退出登录";
  logout.style.display = "block";
  logout.style.width = "100%";
  logout.style.padding = "8px";
  logout.style.border = "none";
  logout.style.background = "none";
  logout.style.textAlign = "left";
  logout.style.cursor = "pointer";
  logout.onclick = async () => {
    logout.innerText = "退出中...";
    try {
      await fetch(
        `${API_BASE}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include"
        }
      );
      window.location.reload();
    } catch (error) {
      console.error(error);
      logout.innerText = "退出失败";
    }
  };
  menu.appendChild(logout);
  authArea.appendChild(menu);
  // ================================
  // 点击用户名显示菜单
  // ================================
  usernameButton.onclick = () => {
    if (menu.style.display === "none") {
      menu.style.display = "block";
    } else {
      menu.style.display = "none";
    }
  };
  // 点击其他地方关闭菜单
  document.addEventListener("click", (event) => {
    if (!authArea.contains(event.target)) {
      menu.style.display = "none";
    }
  });
}
// ================================
// 页面加载
// ================================
document.addEventListener(
  "DOMContentLoaded",
  setupAuthUI
);
