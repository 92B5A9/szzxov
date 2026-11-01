// ========================================
// SZZXOV 音乐档案馆
// 静态档案优先；数据库歌单独立加载，任一来源失败不影响另一来源
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
    const knownPeriods = ["课间", "午间", "宿舍", "晚间", "其他"];
    const period = knownPeriods.find(item => suffix.includes(item)) || suffix || "待分类";
    const monthKey = match[1] + match[2];
    return { dateKey: match[1] + match[2] + match[3], monthKey, monthLabel: monthKey + "月", period };
  }

  function normalizeGroup(group) {
    const issue = String(group && group.issue || "").trim();
    let songs = group && Array.isArray(group.songs) ? group.songs : [];
    if (!songs.length && group && typeof group.songs_json === "string") {
      try { songs = JSON.parse(group.songs_json); } catch (error) {
        console.warn("歌单歌曲 JSON 解析失败：", issue, error);
      }
    }
    return {
      issue,
      ...classifyIssue(issue),
      songs: songs.map(song => ({
        title: String(song && song.title || ""),
        author: String(song && (song.author || song.artist) || "")
      }))
    };
  }

  async function loadData() {
    // 静态档案读取失败时使用空数组，不能阻断数据库歌单读取。
    let issues = [];
    try {
      const response = await fetch("/archive/archive.json", { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();
      if (contentType.includes("text/html") || /^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text)) {
        throw new Error("请求返回了 HTML 首页，而不是 JSON 文件");
      }
      const data = JSON.parse(text);
      if (!data || !Array.isArray(data.issues)) throw new Error("archive.json 缺少 issues 数组");
      issues = data.issues;
    } catch (error) {
      console.error("静态 archive.json 读取失败，将继续尝试数据库：", error);
    }

    // API 使用 config.js 中配置的独立 Worker 域名，不能请求 Pages 自身的 /api。
    try {
      const apiBase = (window.SZZXOV && window.SZZXOV.API) || "https://api.szzxov.com";
      const response = await fetch(apiBase.replace(/\/$/, "") + "/api/archive/playlists", {
        cache: "no-store",
        credentials: "include"
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const publishedData = await response.json();
      if (publishedData && Array.isArray(publishedData.playlists)) {
        const known = new Set(issues.map(item => String(item.issue || "")));
        for (const item of publishedData.playlists) {
          const issue = String(item.issue || "");
          if (issue && !known.has(issue)) {
            issues.push(item);
            known.add(issue);
          }
        }
      } else {
        console.warn("数据库歌单接口返回格式异常：", publishedData);
      }
    } catch (error) {
      console.error("数据库歌单读取失败，保留静态档案：", error);
    }

    return issues.map(normalizeGroup)
      .filter(group => group.issue)
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.issue.localeCompare(b.issue, "zh-CN"));
  }

  function populateFilters() {
    const monthSelect = $("month-filter"), periodSelect = $("period-filter");
    const selectedMonth = monthSelect.value, selectedPeriod = periodSelect.value;
    const months = [...new Set(allPlaylists.map(p => p.monthKey).filter(Boolean))].sort().reverse();
    const periods = [...new Set(allPlaylists.map(p => p.period))].sort((a, b) => {
      const order = ["课间", "午间", "宿舍", "晚间", "其他", "待分类"];
      return (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b));
    });
    monthSelect.replaceChildren(new Option("全部月份", ""));
    months.forEach(key => monthSelect.add(new Option(key + "月", key)));
    periodSelect.replaceChildren(new Option("全部时段", ""));
    periods.forEach(period => periodSelect.add(new Option(period, period)));
    if (months.includes(selectedMonth)) monthSelect.value = selectedMonth;
    if (periods.includes(selectedPeriod)) periodSelect.value = selectedPeriod;
  }

  function makePlaylistCard(p) {
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
    meta.textContent = p.period;
    const count = document.createElement("div");
    count.className = "archive-song-count";
    count.textContent = p.songs.length + " 首歌曲 · 查看歌单";
    card.append(top, meta, count);
    return card;
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
      empty.textContent = "暂时没有歌单数据。";
      container.appendChild(empty);
      return;
    }

    const monthGroups = new Map();
    filtered.forEach(p => {
      const monthKey = p.monthKey || "待分类";
      if (!monthGroups.has(monthKey)) monthGroups.set(monthKey, []);
      monthGroups.get(monthKey).push(p);
    });

    [...monthGroups.entries()].sort((a, b) => b[0].localeCompare(a[0])).forEach(([monthKey, monthItems]) => {
      const monthSection = document.createElement("details");
      monthSection.className = "archive-month-group";
      if (monthKey === [...monthGroups.keys()].sort().reverse()[0]) monthSection.open = true;
      const monthHeading = document.createElement("summary");
      monthHeading.className = "archive-month-heading";
      monthHeading.textContent = monthKey === "待分类" ? "待分类歌单" : monthKey.slice(0, 4) + "年" + Number(monthKey.slice(4, 6)) + "月";
      monthSection.appendChild(monthHeading);

      const dateGroups = new Map();
      monthItems.forEach(p => {
        const dateKey = p.dateKey || "待分类";
        if (!dateGroups.has(dateKey)) dateGroups.set(dateKey, []);
        dateGroups.get(dateKey).push(p);
      });

      [...dateGroups.entries()].sort((a, b) => b[0].localeCompare(a[0])).forEach(([dateKey, dateItems]) => {
        const dateSection = document.createElement("details");
        dateSection.className = "archive-date-group";
        if (dateKey === [...dateGroups.keys()].sort().reverse()[0]) dateSection.open = true;
        const dateHeading = document.createElement("summary");
        dateHeading.className = "archive-date-heading";
        if (dateKey === "待分类") {
          dateHeading.textContent = "日期待确认";
        } else {
          const year = Number(dateKey.slice(0, 4)), month = Number(dateKey.slice(4, 6)), day = Number(dateKey.slice(6, 8));
          const weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][new Date(year, month - 1, day).getDay()];
          dateHeading.textContent = month + "月" + day + "日 · " + weekday;
        }
        const cards = document.createElement("div");
        cards.className = "archive-grid";
        dateItems.sort((a, b) => {
          const order = ["课间", "午间", "宿舍", "晚间", "其他"];
          return (order.indexOf(a.period) < 0 ? 99 : order.indexOf(a.period)) -
            (order.indexOf(b.period) < 0 ? 99 : order.indexOf(b.period));
        }).forEach(p => cards.appendChild(makePlaylistCard(p)));
        dateSection.append(dateHeading, cards);
        monthSection.appendChild(dateSection);
      });
      container.appendChild(monthSection);
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
