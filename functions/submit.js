export async function onRequestPost({ request, env }) {
  const data = await request.json();
  const { title, author, issue } = data;

  await env.DB.prepare(
    "INSERT INTO posts (title, author, issue) VALUES (?, ?, ?)"
  ).bind(title, author, issue).run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
