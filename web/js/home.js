// ========================================
// SZZXOV 首页脚本
// 文件：/js/home.js
// ========================================

(function () {

  function initHome() {

    const container =
      document.querySelector(".home-right");

    const sections =
      document.querySelectorAll(".fade-pair");

    // 不是首页时直接结束
    if (!container || !sections.length) {
      return;
    }


    // -------------------------------
    // 检查哪些区域应该显示
    // -------------------------------

    function checkSections() {

      const trigger =
        window.innerHeight * 0.7;

      sections.forEach(function (section) {

        const rect =
          section.getBoundingClientRect();

        if (rect.top < trigger) {

          section.classList.add(
            "visible"
          );

        }

      });

    }


    // -------------------------------
    // 监听首页内部滚动
    // -------------------------------

    container.addEventListener(
      "scroll",
      checkSections,
      { passive: true }
    );


    // -------------------------------
    // 窗口尺寸改变
    // -------------------------------

    window.addEventListener(
      "resize",
      checkSections,
      { passive: true }
    );


    // -------------------------------
    // 初始检查
    // -------------------------------

    checkSections();

  }


  // 页面加载完成后初始化
  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initHome
    );

  } else {

    initHome();

  }

})();
