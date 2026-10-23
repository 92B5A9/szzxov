// ========================================
// SZZXOV 登录
// 文件：/js/login.js
// ========================================
(function () {
  const API_BASE =
    "https://api.szzxov.com";
  // ========================================
  // 初始化
  // ========================================
  function initLogin() {
    const form =
      document.getElementById(
        "loginForm"
      );
    const result =
      document.getElementById(
        "result"
      );
    const button =
      document.getElementById(
        "loginButton"
      );
    // 不是登录页面
    if (
      !form ||
      !result ||
      !button
    ) {
      return;
    }
    // ======================================
    // 提交登录
    // ======================================
    form.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();
        const username =
          document
            .getElementById("username")
            .value
            .trim();
        const password =
          document
            .getElementById("password")
            .value;
        // -------------------------------
        // 基础检查
        // -------------------------------
        if (!username) {
          result.innerText =
            "请输入用户名。";
          return;
        }
        if (!password) {
          result.innerText =
            "请输入密码。";
          return;
        }
        // -------------------------------
        // 登录中
        // -------------------------------
        button.disabled = true;
        button.innerText =
          "登录中...";
        result.innerText = "";
        try {
          const response =
            await fetch(
              `${API_BASE}/api/auth/login`,
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
          // -------------------------------
          // 登录成功
          // -------------------------------
          if (
            response.ok &&
            data &&
            data.ok
          ) {
            result.innerText =
              "登录成功！";
            // 给 Cookie 一点时间写入
            // 然后回到首页
            setTimeout(
              function () {
                window.location.href =
                  "/";
              },
              400
            );
            return;
          }
          // -------------------------------
          // 登录失败
          // -------------------------------
          result.innerText =
            (
              data &&
              data.message
            ) ||
            "用户名或密码错误。";
        } catch (error) {
          console.error(
            "登录请求失败：",
            error
          );
          result.innerText =
            "无法连接服务器，请稍后再试。";
        }
        // 恢复按钮
        button.disabled = false;
        button.innerText =
          "登录";
      }
    );
  }
  // ========================================
  // 页面启动
  // ========================================
  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initLogin
    );
  } else {
    initLogin();
  }
})();
