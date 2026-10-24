(function () {
  function init() {
    const form = document.getElementById("registerForm");
    const result = document.getElementById("result");
    const button = document.getElementById("registerButton");
    if (!form || !result || !button) return;

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      if (!username) return void (result.textContent = "请输入用户名。");
      if (username.length < 2) return void (result.textContent = "用户名至少需要2个字符。");
      if (password.length < 6) return void (result.textContent = "密码至少需要6个字符。");
      if (password !== confirmPassword) return void (result.textContent = "两次输入的密码不一致。");

      button.disabled = true;
      button.textContent = "注册中...";
      result.textContent = "";
      try {
        const { response, data } = await requestJSON("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, password })
        });
        if (response.ok && data?.ok) {
          result.textContent = "注册成功！正在进入首页...";
          setTimeout(() => { location.href = "/"; }, 600);
          return;
        }
        result.textContent = data?.message || "注册失败，请稍后再试。";
      } catch (error) {
        console.error("注册请求失败：", error);
        result.textContent = "无法连接服务器，请稍后再试。";
      }
      button.disabled = false;
      button.textContent = "注册";
    });
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
