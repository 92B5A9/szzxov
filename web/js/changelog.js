(function () {
  "use strict";

  async function loadChangelog() {
    const versionEl = document.getElementById("site-version");
    const updatedEl = document.getElementById("site-updated");
    const listEl = document.getElementById("changelog-list");
    if (!versionEl || !updatedEl || !listEl) return;

    try {
      const response = await fetch("/data/changelog.json", { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();

      versionEl.textContent = data.version || "—";
      updatedEl.textContent = data.updatedAt || "—";
      listEl.replaceChildren();

      (Array.isArray(data.releases) ? data.releases : []).forEach(release => {
        const section = document.createElement("section");
        section.className = "changelog-release";

        const version = document.createElement("div");
        version.className = "changelog-version";
        version.textContent = release.version || "未标注版本";

        const date = document.createElement("div");
        date.className = "changelog-date";
        date.textContent = release.date || "";

        const changes = document.createElement("ul");
        changes.className = "changelog-items";
        (Array.isArray(release.changes) ? release.changes : []).forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          changes.appendChild(li);
        });

        section.append(version, date, changes);
        listEl.appendChild(section);
      });
    } catch (error) {
      console.error("更新说明加载失败：", error);
      versionEl.textContent = "读取失败";
      updatedEl.textContent = "";
      listEl.textContent = "更新说明暂时无法加载，请稍后刷新。";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadChangelog);
  } else {
    loadChangelog();
  }
})();
