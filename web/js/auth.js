// 全站账号状态与菜单
async function getCurrentUser() {
  try {
    const { response, data } = await requestJSON("/api/auth/me", { method: "GET" });
    return response.ok && data?.ok && data.loggedIn ? data.user : null;
  } catch (error) {
    console.error("获取登录状态失败：", error);
    return null;
  }
}

async function setupAuthUI() {
  const area = document.getElementById("authArea");
  if (!area) return;
  area.replaceChildren();

  const user = await getCurrentUser();
  if (!user) {
    area.innerHTML = '<a class="account-button" href="/login/"><span class="account-icon">♙</span><span class="account-text"><span class="account-name">登录</span><small>Login</small></span></a>';
    return;
  }

  const button = document.createElement("button");
  button.className = "account-button auth-user-button";
  button.type = "button";
  button.textContent = `${user.username} ▼`;

  const menu = document.createElement("div");
  menu.className = "auth-menu";
  menu.hidden = true;
  menu.innerHTML = '<a href="/my/">我的投稿 <span class="en">My Posts</span></a>';
  if (user.role === "admin") menu.innerHTML += '<a href="/admin/">管理后台 <span class="en">Admin</span></a>';

  const logout = document.createElement("button");
  logout.type = "button";
  logout.innerHTML = '退出登录 <span class="en">Logout</span>';
  logout.addEventListener("click", async () => {
    logout.disabled = true;
    logout.textContent = "退出中...";
    try {
      const { response } = await requestJSON("/api/auth/logout", { method: "POST" });
      if (response.ok) location.reload();
      else throw new Error("logout failed");
    } catch {
      logout.textContent = "退出失败";
      logout.disabled = false;
    }
  });
  menu.appendChild(logout);
  area.append(button, menu);

  button.addEventListener("click", event => {
    event.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  document.addEventListener("click", () => { menu.hidden = true; }, { once: false });
}
