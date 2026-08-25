export async function onRequestGet({ env }) {
  try {
    // 1. 尝试检查 posts 表结构
    const info = await env.DB.prepare("PRAGMA table_info(posts);").all();

    const hasIssue = info.results.some(col => col.name === "issue");

    if (hasIssue) {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "issue 字段已存在，无需修复。",
          columns: info.results
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. 如果没有 issue 字段，执行修复
    await env.DB.prepare(
      "ALTER TABLE posts ADD COLUMN issue INTEGER DEFAULT 1;"
    ).run();

    // 3. 再次检查结构
    const infoAfter = await env.DB.prepare("PRAGMA table_info(posts);").all();

    return new Response(
      JSON.stringify({
        ok: true,
        message: "已自动添加 issue 字段。",
        columns: infoAfter.results
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e.message
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
