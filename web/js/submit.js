(function () {
  function init() {
    const form = document.getElementById("submitForm");
    const result = document.getElementById("result");
    const button = document.getElementById("submitButton");
    if (!form || !result || !button) return;

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const title = form.elements.title.value.trim();
      const author = form.elements.author.value.trim();
      const issue = Number(form.elements.issue.value);
      if (!title || !author) return void (result.textContent = "请完整填写投稿信息。");
      if (!Number.isInteger(issue) || issue < 1) return void (result.textContent = "请输入正确的期数。");

      button.disabled = true;
      button.textContent = "提交中...";
      result.textContent = "";
      try {
        const { response, data } = await requestJSON("/api/submit", {
          method: "POST",
          body: JSON.stringify({ title, author, issue })
        });
        if (response.ok && data?.ok) {
          result.textContent = "投稿已提交！感谢你的投稿。";
          form.reset();
        } else {
          result.textContent = data?.message || "提交失败，请稍后再试。";
        }
      } catch (error) {
        console.error("投稿请求失败：", error);
        result.textContent = "无法连接服务器，请检查网络后重试。";
      }
      button.disabled = false;
      button.textContent = "提交";
    });
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
