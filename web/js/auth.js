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
  const button = document.createElement("button");
  button.type = "button";
  button.className = "account-button auth-user-button";
  button.innerHTML = `<span class="account-icon">♙</span><span class="account-text"><span class="account-name">${user?.username || "账号"}</span><small>${user ? "Account" : "Login"}</small></span><span class="account-arrow">⌄</span>`;

  const menu = document.createElement("div");
  menu.className = "auth-menu";
  menu.hidden = true;
  menu.innerHTML = user
    ? `<a href="/my/">我的投稿 <span class="en">My Posts</span></a>${user.role === "admin" ? '<a href="/admin/">管理后台 <span class="en">Admin</span></a>' : ""}`
    : '<a href="/login/">登录 <span class="en">Login</span></a><a href="/register/">注册 <span class="en">Register</span></a>';

  if (user) {
    const logout = document.createElement("button");
    logout.type = "button";
    logout.innerHTML = '退出登录 <span class="en">Logout</span>';
    logout.addEventListener("click", async () => {
      logout.disabled = true;
      logout.textContent = "退出中…";
      try {
        const { response } = await requestJSON("/api/auth/logout", { method: "POST" });
        if (!response.ok) throw new Error("logout failed");
        location.reload();
      } catch {
        logout.textContent = "退出失败";
        logout.disabled = false;
      }
    });
    menu.appendChild(logout);
  }

  area.append(button, menu);
  button.addEventListener("click", event => {
    event.stopPropagation();
    menu.hidden = !menu.hidden;
    button.setAttribute("aria-expanded", String(!menu.hidden));
  });
  menu.addEventListener("click", event => event.stopPropagation());
  document.addEventListener("click", () => {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
  });
}
