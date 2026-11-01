// ========================================
// SZZXOV 音乐档案馆
// 根据歌单标题自动建立月份 + 时段双维度分类
// ========================================
(function () {
  "use strict";

  let allPlaylists = [];

  const $ = id => document.getElementById(id);

  function classifyIssue(issue) {
    const title = String(issue || "").trim();
    // 支持 20261026午间、2026-10-26 午间、2026/10/26-午间
    const match = title.match(/^(\d{4})[-年/]?(\d{2})[-月/]?(\d{2})日?\s*[-_— ]?\s*(.*)$/);
    if (!match) {
      return { dateKey: "", monthKey: "", monthLabel: "待分类", period: "待分类" };
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const validDate = month >= 1 && month <= 12 &&
      day >= 1 && day <= new Date(year, month, 0).getDate();
    if (!validDate) {
      return { dateKey: "", monthKey: "", monthLabel: "待分类", period: "待分类" };
    }

    const suffix = String(match[4] || "").trim();
    const knownPeriods = ["课间", "午间", "宿舍", "晚间"];
    const period = knownPeriods.find(item => suffix.includes(item)) || (suffix || "待分类");
    const monthKey = match[1] + match[2];

    return {
      dateKey: match[1] + match[2] + match[3],
      monthKey,
      monthLabel: monthKey + "月",
      period
    };
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function loadData() {
    const response = await fetch("/archive/archive.json", { cache: "no-store" });
    if (!response.ok) throw new Error("往期档案加载失败（HTTP " + response.status + "）");
    const data = await response.json();
    if (!data || !Array.isArray(data.issues)) {
      throw new Error("archive.json 格式错误");
    }

    return data.issues.map(group => {
      const issue = String(group.issue || "").trim();
      const classification = classifyIssue(issue);
      const songs = Array.isArray(group.songs) ? group.songs.map(song => ({
        title: String(song.title || ""),
        author: String(song.author || "")
      })) : [];
      return { issue, ...classification, songs };
    }).sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.issue.localeCompare(b.issue, "zh-CN"));
  }

  function populateFilters() {
    const monthSelect = $("month-filter");
    const periodSelect = $("period-filter");
    const selectedMonth = monthSelect.value;
    const selectedPeriod = periodSelect.value;

    const months = [...new Set(allPlaylists.map(p => p.monthKey).filter(Boolean))].sort().reverse();
    const periods = [...new Set(allPlaylists.map(p => p.period))].sort((a, b) => {
      const order = ["课间", "午间", "宿舍", "晚间", "待分类"];
      return (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) -
        (order.indexOf(b) < 0 ? 99 : order.indexOf(b));
    });

    monthSelect.replaceChildren(new Option("全部月份", ""));
    months.forEach(key => monthSelect.add(new Option(key + "月", key)));
    periodSelect.replaceChildren(new Option("全部时段", ""));
    periods.forEach(period => periodSelect.add(new Option(period, period)));

    if (months.includes(selectedMonth)) monthSelect.value = selectedMonth;
    if (periods.includes(selectedPeriod)) periodSelect.value = selectedPeriod;
  }

  function renderList() {
    const container = $("list");
    const keyword = $("search").value.trim().toLocaleLowerCase();
    const month = $("month-filter").value;
    const period = $("period-filter").value;

    const filtered = allPlaylists.filter(playlist => {
      if (month && playlist.monthKey !== month) return false;
      if (period && playlist.period !== period) return false;
      if (!keyword) return true;
      const text = [playlist.issue, ...playlist.songs.flatMap(song => [song.title, song.author])]
        .join(" ").toLocaleLowerCase();
      return text.includes(keyword);
    });

    $("archive-stats").textContent =
      "共收录 " + allPlaylists.length + " 个歌单 · 当前显示 " + filtered.length +
      " 个歌单 · " + allPlaylists.reduce((sum, item) => sum + item.songs.length, 0) + " 首歌曲";

    container.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "archive-empty";
      empty.textContent = "没有找到符合条件的歌单。";
      container.appendChild(empty);
      return;
    }

    filtered.forEach(playlist => {
      const card = document.createElement("article");
      card.className = "archive-playlist";

      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const heading = document.createElement("h3");
      heading.textContent = playlist.issue || "未命名歌单";
      const meta = document.createElement("div");
      meta.className = "archive-meta";
      meta.textContent = playlist.monthLabel + " · " + playlist.period + " · " +
        playlist.songs.length + " 首歌曲";
      summary.append(heading, meta);
      details.appendChild(summary);

      const list = document.createElement("ol");
      list.className = "archive-song-list";
      playlist.songs.forEach(song => {
        const li = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = song.title || "未命名歌曲";
        const artist = document.createElement("span");
        artist.className = "archive-song-artist";
        artist.textContent = song.author || "艺术家未知";
        li.append(title, artist);
        list.appendChild(li);
      });
      details.appendChild(list);
      card.appendChild(details);
      container.appendChild(card);
    });
  }

  async function initArchive() {
    const container = $("list");
    if (!container) return;

    try {
      allPlaylists = await loadData();
      populateFilters();
      renderList();
    } catch (error) {
      console.error("音乐档案馆加载失败：", error);
      container.textContent = "音乐档案加载失败，请稍后刷新重试。";
    }

    $("search").addEventListener("input", renderList);
    $("month-filter").addEventListener("change", renderList);
    $("period-filter").addEventListener("change", renderList);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArchive);
  } else {
    initArchive();
  }
})();
