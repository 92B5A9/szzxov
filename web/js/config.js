window.SZZXOV = Object.freeze({ API: "https://api.szzxov.com" });

window.requestJSON = async function (path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const response = await fetch(`${SZZXOV.API}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { response, data };
};
