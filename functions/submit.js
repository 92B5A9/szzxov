export async function onRequestPost({ request, env }) {
  const data = await request.json();
  const { title, author } = data;

  await env.DB.prepare(
    "INSERT INTO posts (title, author) VALUES (?, ?)"
  ).bind(title, author).run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
export async function onRequestGet({ env }) {
  const result = await env.DB.prepare(
    "SELECT * FROM posts ORDER BY id DESC"
  ).all();

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" }
  });
}
