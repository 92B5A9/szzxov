// ========================================
// SZZXOV 投稿页面脚本
// 文件：/js/submit.js
// ========================================
(function () {
  async function initSubmit() {
    const form =
      document.getElementById(
        "submitForm"
      );
    const resultText =
      document.getElementById(
        "result"
      );
    const submitButton =
      document.getElementById(
        "submitButton"
      );
    // 不是投稿页面
    if (!form) {
      return;
    }
    // -------------------------------
    // 提交表单
    // -------------------------------
    form.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();
        // 获取输入内容
        const title =
          form.elements.title.value.trim();
        const author =
          form.elements.author.value.trim();
        const issue =
          Number(
            form.elements.issue.value
          );
        // -------------------------------
        // 前端验证
        // -------------------------------
        if (!title) {
          resultText.innerText =
            "请输入歌曲名。";
          return;
        }
        if (!author) {
          resultText.innerText =
            "请输入歌手。";
          return;
        }
        if (
          !Number.isInteger(issue) ||
          issue < 1
        ) {
          resultText.innerText =
            "请输入正确的期数。";
          return;
        }
        // -------------------------------
        // 防止重复提交
        // -------------------------------
        submitButton.disabled = true;
        submitButton.innerText =
          "提交中...";
        resultText.innerText = "";
        try {
          // -----------------------------
          // 请求 API
          // -----------------------------
          const response =
            await fetch(
              "https://api.szzxov.com/api/submit",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json"
                },
                body: JSON.stringify({
                  title: title,
                  author: author,
                  issue: issue
                })
              }
            );
          // -----------------------------
          // 尝试读取 JSON
          // -----------------------------
          let result = null;
          try {
            result =
              await response.json();
          } catch {
            result = null;
          }
          // -----------------------------
          // 判断提交结果
          // -----------------------------
          if (
            response.ok &&
            result &&
            result.ok
          ) {
            resultText.innerText =
              "投稿已提交！感谢你的投稿。";
            form.reset();
          } else {
            resultText.innerText =
              (
                result &&
                result.message
              ) ||
              "提交失败，请稍后再试。";
          }
        } catch (error) {
          console.error(
            "投稿请求失败：",
            error
          );
          resultText.innerText =
            "无法连接服务器，请检查网络后重试。";
        }
        // -------------------------------
        // 恢复按钮
        // -------------------------------
        submitButton.disabled = false;
        submitButton.innerText =
          "提交";
      }
    );
  }
  // 页面加载完成
  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initSubmit
    );
  } else {
    initSubmit();
  }
})();
