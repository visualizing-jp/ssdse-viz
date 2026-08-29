let el;

function ensure() {
  if (el) return el;
  el = document.createElement("div");
  el.className = "tooltip";
  el.setAttribute("role", "status");
  document.body.appendChild(el);
  return el;
}

export function showTip(html, event) {
  const node = ensure();
  node.innerHTML = html;
  node.classList.add("is-on");
  moveTip(event);
}

export function moveTip(event) {
  if (!el) return;
  const x = event.clientX;
  const y = event.clientY;
  const w = el.offsetWidth;
  const left = Math.min(window.innerWidth - w - 12, x + 10);
  el.style.left = `${Math.max(8, left)}px`;
  el.style.top = `${y + 12}px`;
}

export function hideTip() {
  if (!el) return;
  el.classList.remove("is-on");
}
