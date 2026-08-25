export async function onRequestGet({ env }) {
  const result = await env.DB.prepare(
    "SELECT * FROM posts ORDER BY id DESC"
  ).all();

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" }
  });
}
