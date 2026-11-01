/*
将以下两个路由加入现有 Worker 的 fetch() 路由区，在 /api/submit 之后即可：

if (path === "/api/archive/playlists" && request.method === "GET")
  return await listPublishedPlaylists(request, env);

if (path === "/api/admin/playlists/import" && request.method === "POST")
  return await importPublishedPlaylist(request, env);


将以下两个函数加入 Worker 文件（放在 Session 与权限区域之前或之后均可）。
它们使用现有的 requireRole()、getUserFromSession()、json()。

*/

async function listPublishedPlaylists(request, env) {
  const result = await env.DB.prepare(`
    SELECT issue, time_slot, songs_json
    FROM playlists
    ORDER BY issue DESC
  `).all();

  const playlists = (result.results || []).map(row => ({
    issue: row.issue,
    songs: JSON.parse(row.songs_json || "[]")
  }));

  return json({ ok: true, playlists }, 200, request);
}

async function importPublishedPlaylist(request, env) {
  const auth = await requireRole(request, env, ["root", "admin"]);
  if (auth.error) return auth.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "请求数据格式错误" }, 400, request);
  }

  const issue = String(body.issue || "").trim();
  const timeSlot = String(body.time_slot || "").trim();
  const overwrite = body.overwrite === true;
  const allowedSlots = ["课间", "午间", "宿舍", "其他"];

  if (!/^\\d{8}(课间|午间|宿舍|其他)$/.test(issue)) {
    return json({ ok: false, error: "期数格式应为 YYYYMMDD 加时段" }, 400, request);
  }
  if (!allowedSlots.includes(timeSlot) || !issue.endsWith(timeSlot)) {
    return json({ ok: false, error: "歌单时段与期数不匹配" }, 400, request);
  }
  if (!Array.isArray(body.tracks) || body.tracks.length < 1 || body.tracks.length > 300) {
    return json({ ok: false, error: "歌曲数量必须为 1～300 首" }, 400, request);
  }

  const tracks = [];
  for (const item of body.tracks) {
    const title = String(item?.title || "").trim();
    const artist = String(item?.artist || "").trim();
    if (!title || title.length > 300 || artist.length > 300) {
      return json({ ok: false, error: "歌曲名称不能为空且不能超过 300 字" }, 400, request);
    }
    tracks.push({ title, author: artist });
  }

  const existing = await env.DB.prepare(
    "SELECT id FROM playlists WHERE issue = ? LIMIT 1"
  ).bind(issue).first();

  if (existing && !overwrite) {
    return json({
      ok: false,
      code: "ISSUE_EXISTS",
      error: "该期歌单已存在"
    }, 409, request);
  }

  const songsJson = JSON.stringify(tracks);
  if (existing) {
    await env.DB.prepare(`
      UPDATE playlists
      SET time_slot = ?, songs_json = ?, created_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE issue = ?
    `).bind(timeSlot, songsJson, auth.user.id, issue).run();
  } else {
    await env.DB.prepare(`
      INSERT INTO playlists (issue, time_slot, songs_json, created_by)
      VALUES (?, ?, ?, ?)
    `).bind(issue, timeSlot, songsJson, auth.user.id).run();
  }

  return json({
    ok: true,
    published: true,
    issue,
    count: tracks.length,
    message: "歌单已直接发布至音乐档案馆"
  }, 200, request);
}
