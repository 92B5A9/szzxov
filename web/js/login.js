(function () {
  function init() {
    const form = document.getElementById("loginForm");
    const result = document.getElementById("result");
    const button = document.getElementById("loginButton");
    if (!form || !result || !button) return;

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;
      if (!username) return void (result.textContent = "请输入用户名。");
      if (!password) return void (result.textContent = "请输入密码。");

      button.disabled = true;
      button.textContent = "登录中...";
      result.textContent = "";
      try {
        const { response, data } = await requestJSON("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username, password })
        });
        if (response.ok && data?.ok) {
          result.textContent = "登录成功！";
          setTimeout(() => { location.href = "/"; }, 400);
          return;
        }
        result.textContent = data?.message || "用户名或密码错误。";
      } catch (error) {
        console.error("登录请求失败：", error);
        result.textContent = "无法连接服务器，请稍后再试。";
      }
      button.disabled = false;
      button.textContent = "登录";
    });
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
