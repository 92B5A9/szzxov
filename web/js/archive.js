// ========================================
// SZZXOV 音乐档案馆
// 首页展示歌单卡片；点击进入独立歌单详情
// ========================================
(function () {
  "use strict";
  let allPlaylists = [];
  const $ = id => document.getElementById(id);

  function classifyIssue(issue) {
    const title = String(issue || "").trim();
    const match = title.match(/^(\d{4})[-年/]?(\d{2})[-月/]?(\d{2})日?\s*[-_— ]?\s*(.*)$/);
    if (!match) return { dateKey: "", monthKey: "", monthLabel: "待分类", period: "待分类" };

    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > new Date(year, month, 0).getDate()) {
      return { dateKey: "", monthKey: "", monthLabel: "待分类", period: "待分类" };
    }

    const suffix = String(match[4] || "").trim();
    const knownPeriods = ["课间", "午间", "宿舍", "晚间"];
    const period = knownPeriods.find(item => suffix.includes(item)) || suffix || "待分类";
    const monthKey = match[1] + match[2];
    return { dateKey: match[1] + match[2] + match[3], monthKey, monthLabel: monthKey + "月", period };
  }

  async function loadData() {
    const response = await fetch("/archive/archive.json", { cache: "no-store" });
    if (!response.ok) throw new Error("往期档案加载失败（HTTP " + response.status + "）");
    const data = await response.json();
    if (!data || !Array.isArray(data.issues)) throw new Error("archive.json 格式错误");
    return data.issues.map(group => {
      const issue = String(group.issue || "").trim();
      const songs = Array.isArray(group.songs) ? group.songs.map(song => ({
        title: String(song.title || ""), author: String(song.author || "")
      })) : [];
      return { issue, ...classifyIssue(issue), songs };
    }).sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.issue.localeCompare(b.issue, "zh-CN"));
  }

  function populateFilters() {
    const monthSelect = $("month-filter"), periodSelect = $("period-filter");
    const selectedMonth = monthSelect.value, selectedPeriod = periodSelect.value;
    const months = [...new Set(allPlaylists.map(p => p.monthKey).filter(Boolean))].sort().reverse();
    const periods = [...new Set(allPlaylists.map(p => p.period))].sort((a, b) => {
      const order = ["课间", "午间", "宿舍", "晚间", "待分类"];
      return (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b));
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
    const month = $("month-filter").value, period = $("period-filter").value;
    const filtered = allPlaylists.filter(p => {
      if (month && p.monthKey !== month) return false;
      if (period && p.period !== period) return false;
      if (!keyword) return true;
      return [p.issue, ...p.songs.flatMap(s => [s.title, s.author])].join(" ").toLocaleLowerCase().includes(keyword);
    });

    $("archive-stats").textContent = "共收录 " + allPlaylists.length + " 份歌单 · 当前显示 " +
      filtered.length + " 份歌单 · " + allPlaylists.reduce((sum, p) => sum + p.songs.length, 0) + " 首歌曲";
    container.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "archive-empty";
      empty.textContent = "没有找到符合条件的歌单。";
      container.appendChild(empty);
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement("a");
      card.className = "archive-playlist archive-playlist-link";
      card.href = "/archive/playlist/?issue=" + encodeURIComponent(p.issue);
      card.setAttribute("aria-label", "查看 " + p.issue + " 歌单详情");

      const top = document.createElement("div");
      top.className = "archive-card-top";
      const heading = document.createElement("h3");
      heading.textContent = p.issue || "未命名歌单";
      const arrow = document.createElement("span");
      arrow.className = "archive-card-arrow";
      arrow.textContent = "↗";
      top.append(heading, arrow);

      const meta = document.createElement("div");
      meta.className = "archive-meta";
      meta.textContent = p.monthLabel + " · " + p.period;
      const count = document.createElement("div");
      count.className = "archive-song-count";
      count.textContent = p.songs.length + " 首歌曲 · 查看歌单";

      card.append(top, meta, count);
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initArchive);
  else initArchive();
})();
