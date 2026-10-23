// ========================================
// SZZXOV 往期投稿
// 文件：/js/archive.js
// ========================================
(function () {
  let allItems = [];
  // ========================================
  // 加载 archive.json
  // ========================================
  async function loadData() {
    const response =
      await fetch("/archive/archive.json");
    if (!response.ok) {
      throw new Error("往期投稿数据加载失败");
    }
    const data =
      await response.json();
    const flat = [];
    if (
      !data ||
      !Array.isArray(data.issues)
    ) {
      throw new Error("archive.json 格式错误");
    }
    data.issues.forEach(function (group) {
      if (!Array.isArray(group.songs)) {
        return;
      }
      group.songs.forEach(function (song) {
        flat.push({
          title:
            song.title || "",
          author:
            song.author || "",
          issue:
            group.issue || ""
        });
      });
    });
    return {
      raw: data.issues,
      flat: flat
    };
  }
  // ========================================
  // HTML 转义
  // ========================================
  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  // ========================================
  // 渲染列表
  // ========================================
  function renderList(items) {
    const list =
      document.getElementById("list");
    if (!list) {
      return;
    }
    list.innerHTML = "";
    if (items.length === 0) {
      list.innerHTML = `
        <div class="glass-card">
          没有找到匹配的结果。
        </div>
      `;
      return;
    }
    items.forEach(function (item) {
      const div =
        document.createElement("div");
      div.className =
        "glass-card";
      div.style.marginTop =
        "12px";
      div.innerHTML = `
        <strong>
          ${escapeHTML(item.title)}
        </strong>
        <br>
        <span>
          ${escapeHTML(item.author)}
        </span>
        <br>
        <span style="opacity:0.7;">
          ${escapeHTML(item.issue)}歌单
        </span>
      `;
      list.appendChild(div);
    });
  }
  // ========================================
  // 搜索 + 筛选
  // ========================================
  function updateList() {
    const search =
      document.getElementById("search");
    const filter =
      document.getElementById("filter");
    const keyword =
      search
        ? search.value
            .trim()
            .toLowerCase()
        : "";
    const issue =
      filter
        ? filter.value
        : "";
    const filtered =
      allItems.filter(function (item) {
        const title =
          String(item.title)
            .toLowerCase();
        const author =
          String(item.author)
            .toLowerCase();
        const matchesSearch =
          !keyword ||
          title.includes(keyword) ||
          author.includes(keyword);
        const matchesIssue =
          !issue ||
          String(item.issue) === issue;
        return (
          matchesSearch &&
          matchesIssue
        );
      });
    renderList(filtered);
  }
  // ========================================
  // 加载期数选项
  // ========================================
  function loadIssueOptions(raw) {
    const filter =
      document.getElementById("filter");
    if (!filter) {
      return;
    }
    raw.forEach(function (group) {
      const option =
        document.createElement("option");
      option.value =
        group.issue;
      option.textContent =
        `${group.issue}歌单`;
      filter.appendChild(option);
    });
  }
  // ========================================
  // 页面初始化
  // ========================================
  async function initArchive() {
    const list =
      document.getElementById("list");
    if (!list) {
      return;
    }
    try {
      const data =
        await loadData();
      allItems =
        data.flat;
      loadIssueOptions(
        data.raw
      );
      renderList(
        allItems
      );
    } catch (error) {
      console.error(
        "往期投稿加载失败：",
        error
      );
      list.innerHTML = `
        <div class="glass-card">
          往期投稿加载失败，请稍后再试。
        </div>
      `;
    }
    const search =
      document.getElementById("search");
    if (search) {
      search.addEventListener(
        "input",
        updateList
      );
    }
    const filter =
      document.getElementById("filter");
    if (filter) {
      filter.addEventListener(
        "change",
        updateList
      );
    }
  }
  // ========================================
  // 启动
  // ========================================
  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initArchive
    );
  } else {
    initArchive();
  }
})();
