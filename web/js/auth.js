// 全站账号状态与入口
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
  const link = document.createElement("a");
  link.className = "account-link";
  link.href = "/account/";
  link.setAttribute("aria-label", user ? "个人中心" : "登录或注册");

  const icon = document.createElement("span");
  icon.className = "account-icon";
  icon.textContent = "♙";

  const text = document.createElement("span");
  text.className = "account-text";

  const name = document.createElement("span");
  name.className = "account-name";
  name.textContent = user?.username || "登录 / 注册";

  const subtitle = document.createElement("small");
  subtitle.textContent = user ? "Account" : "Sign in";

  text.append(name, subtitle);
  link.append(icon, text);
  area.append(link);
}
