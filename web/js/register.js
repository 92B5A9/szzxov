// ========================================
// SZZXOV 注册
// 文件：/js/register.js
// ========================================
(function () {
  const API_BASE =
    "https://api.szzxov.com";
  function initRegister() {
    const form =
      document.getElementById(
        "registerForm"
      );
    const result =
      document.getElementById(
        "result"
      );
    const button =
      document.getElementById(
        "registerButton"
      );
    const usernameInput =
      document.getElementById(
        "username"
      );
    const passwordInput =
      document.getElementById(
        "password"
      );
    const confirmInput =
      document.getElementById(
        "confirmPassword"
      );
    // 不是注册页面
    if (
      !form ||
      !result ||
      !button
    ) {
      return;
    }
    form.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();
        const username =
          usernameInput.value.trim();
        const password =
          passwordInput.value;
        const confirmPassword =
          confirmInput.value;
        // ==================================
        // 基础检查
        // ==================================
        if (!username) {
          result.innerText =
            "请输入用户名。";
          return;
        }
        if (username.length < 2) {
          result.innerText =
            "用户名至少需要2个字符。";
          return;
        }
        if (password.length < 6) {
          result.innerText =
            "密码至少需要6个字符。";
          return;
        }
        if (
          password !==
          confirmPassword
        ) {
          result.innerText =
            "两次输入的密码不一致。";
          return;
        }
        // ==================================
        // 注册中
        // ==================================
        button.disabled = true;
        button.innerText =
          "注册中...";
        result.innerText = "";
        try {
          const response =
            await fetch(
              `${API_BASE}/api/auth/register`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type":
                    "application/json"
                },
                body: JSON.stringify({
                  username,
                  password
                })
              }
            );
          let data;
          try {
            data =
              await response.json();
          } catch {
            data = null;
          }
          // ==================================
          // 注册成功
          // ==================================
          if (
            response.ok &&
            data &&
            data.ok
          ) {
            result.innerText =
              "注册成功！正在进入首页...";
            setTimeout(
              function () {
                window.location.href =
                  "/";
              },
              600
            );
            return;
          }
          // ==================================
          // 注册失败
          // ==================================
          result.innerText =
            (
              data &&
              data.message
            ) ||
            "注册失败，请稍后再试。";
        } catch (error) {
          console.error(
            "注册请求失败：",
            error
          );
          result.innerText =
            "无法连接服务器，请稍后再试。";
        }
        button.disabled = false;
        button.innerText =
          "注册";
      }
    );
  }
  // ========================================
  // 启动
  // ========================================
  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initRegister
    );
  } else {
    initRegister();
  }
})();
