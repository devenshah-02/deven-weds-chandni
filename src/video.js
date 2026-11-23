import { gsap } from "gsap";

/* The invite link shown on the last frame. Change it after deploying the new design. */
const INVITE_URL = "deven-weds-chandni.vercel.app";

export const DURATION = 32.2;
const warp = (t) => 19.65 + (t - 16.05) * 0.9;
const W = 1080, H = 1920;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

$$("[data-url]").forEach((el) => (el.textContent = INVITE_URL));

/* split chars */
$$("[data-split]").forEach((el) => {
  el.innerHTML = [...el.textContent].map((c) => (c === " " ? " " : `<span class="ch">${c}</span>`)).join("");
});

/* mandala */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(NS, "g");
  g.setAttribute("transform", "translate(200 200)");
  g.setAttribute("fill", "none");
  g.setAttribute("stroke", "#c9a15b");
  g.setAttribute("stroke-width", "0.7");
  const add = (tag, a) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); g.appendChild(n); };
  [60, 92, 150, 186].forEach((r, i) => add("circle", { r, "stroke-dasharray": i % 2 ? "2 4" : "none", opacity: 0.7 }));
  for (let i = 0; i < 24; i++) add("path", { d: "M0,-92 C14,-120 14,-136 0,-150 C-14,-136 -14,-120 0,-92Z", transform: `rotate(${i * 15})` });
  for (let i = 0; i < 12; i++) add("path", { d: "M0,-60 C22,-70 26,-84 0,-92 C-26,-84 -22,-70 0,-60Z", transform: `rotate(${i * 30 + 15})`, opacity: 0.8 });
  for (let i = 0; i < 48; i++) add("circle", { cx: 0, cy: -168, r: 2.2, transform: `rotate(${i * 7.5})`, fill: "#c9a15b", stroke: "none", opacity: 0.5 });
  $("#mandala").appendChild(g);
})();

/* ------------------------------------------------------------------
   MASTER TIMELINE (paused, seeked frame by frame)
------------------------------------------------------------------- */
const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
const fadeScene = (sel, at, d = 0.4) => tl.to(sel, { opacity: 1, duration: d, ease: "none" }, at);
const leaveScene = (sel, at, d = 0.4) => tl.to(sel, { opacity: 0, y: -60, duration: d, ease: "power2.in" }, at);

/* background slow motions across the whole video */
tl.to("#mandala", { rotation: 60, duration: DURATION, ease: "none" }, 0);

/* S1 envelope 0 → 4.3 */
gsap.set(".s1__kicker, .s1__sub", { opacity: 0, y: 30 });
gsap.set("#envelope", { opacity: 0, y: 120, rotateX: 20 });
gsap.set("#seal", { scale: 0, rotation: -90 });
tl.to(".s1__kicker", { opacity: 1, y: 0, duration: 0.8 }, 0.15)
  .to("#envelope", { opacity: 1, y: 0, rotateX: 0, duration: 1.2, ease: "expo.out" }, 0.3)
  .to("#seal", { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.8)" }, 0.8)
  .to(".s1__sub", { opacity: 1, y: 0, duration: 0.7 }, 1.0)
  .to("#seal", { scale: 1.18, duration: 0.2, ease: "power2.out" }, 1.75)
  .to("#seal", { scale: 0, rotation: 150, opacity: 0, duration: 0.45, ease: "back.in(2)" }, 1.95)
  .to(".s1__kicker, .s1__sub", { opacity: 0, duration: 0.4 }, 1.95)
  .to("#flap", { rotateX: 180, duration: 0.7, ease: "power2.inOut" }, 2.2)
  .set("#flap", { zIndex: 1 }, 2.55)
  .to("#envelope", { y: 260, duration: 0.8, ease: "power2.inOut" }, 2.75)
  .to("#letter", { y: -330, duration: 0.8, ease: "power2.inOut" }, 2.75)
  .set("#letter", { zIndex: 10 }, 3.55)
  .to("#letter", { scale: 2.4, opacity: 0, duration: 0.65, ease: "power3.in" }, 3.6)
  .to(".envelope__back, .envelope__pocket, #flap", { opacity: 0, duration: 0.4 }, 3.55)
  .to("#bgCream", { opacity: 1, duration: 0.6, ease: "none" }, 3.75)
  .set("#s1", { opacity: 0 }, 4.3);

/* S2 names 4.0 → 9.2 */
gsap.set(".s2 .ganesh", { scale: 0.4, opacity: 0 });
gsap.set(".shloka span, .blessing, .tag", { opacity: 0, y: 30 });
gsap.set(".s2 .ch", { yPercent: 100, opacity: 0, rotation: 8 });
gsap.set(".weds i", { scaleX: 0 });
gsap.set(".weds em", { opacity: 0 });
fadeScene("#s2", 3.95, 0.1);
tl.to("#mandalaWrap", { opacity: 0.45, duration: 1.2, ease: "none" }, 4.0)
  .fromTo("#mandalaWrap", { scale: 0.7 }, { scale: 1, duration: 2, ease: "expo.out" }, 4.0)
  .to(".s2 .ganesh", { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.6)" }, 4.15)
  .to(".shloka span", { opacity: 1, y: 0, stagger: 0.15, duration: 0.6 }, 4.5)
  .to(".blessing", { opacity: 1, y: 0, duration: 0.6 }, 5.0)
  .to(".names .name:first-child .ch", { yPercent: 0, opacity: 1, rotation: 0, stagger: 0.05, duration: 0.8, ease: "expo.out" }, 5.4)
  .to(".weds i", { scaleX: 1, duration: 0.7, ease: "expo.out" }, 5.95)
  .to(".weds em", { opacity: 1, duration: 0.6 }, 6.0)
  .to(".names .name:last-child .ch", { yPercent: 0, opacity: 1, rotation: 0, stagger: 0.05, duration: 0.8, ease: "expo.out" }, 6.15)
  .to(".tag", { opacity: 1, y: 0, duration: 0.6 }, 6.9);
leaveScene("#s2", 8.85);
tl.to("#mandalaWrap", { opacity: 0.18, duration: 0.6, ease: "none" }, 8.9);

/* S3 save the date 9.2 → 12.8 */
gsap.set(".s3 .eyebrow, .s3 .title, .s3__note", { opacity: 0, y: 30 });
gsap.set("#scratchCard", { opacity: 0, scale: 0.9 });
gsap.set(".s3 .pill", { opacity: 0, y: 40 });
gsap.set(".card__under > *", { opacity: 0.0 });
fadeScene("#s3", 9.15, 0.1);
tl.to(".s3 .eyebrow, .s3 .title", { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, 9.2)
  .to("#scratchCard", { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.4)" }, 9.35)
  .to(".s3 .pill", { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.6)" }, 9.6)
  .fromTo("#tapring", { scale: 0.9, opacity: 1 }, { scale: 1.6, opacity: 0, duration: 0.8, repeat: 1, ease: "power2.out" }, 9.7)
  .to("#tapseal", { scale: 0.82, duration: 0.15, ease: "power2.in" }, 10.85)
  .to("#tapseal", { scale: 0, rotation: 160, opacity: 0, duration: 0.45, ease: "back.in(2)" }, 11.0)
  .to(".card__under > *", { opacity: 1, duration: 0.01 }, 11.0)
  .to("#foil", { opacity: 0, scale: 1.12, duration: 0.45, ease: "power2.in" }, 11.05)
  .fromTo(".card__under > *", { y: 20 }, { y: 0, stagger: 0.08, duration: 0.6, ease: "expo.out" }, 11.25)
  .to(".s3__note", { opacity: 1, y: 0, duration: 0.6 }, 11.45);
leaveScene("#s3", 12.45);

/* S4 families 12.8 → 16.4 */
gsap.set(".s4 .eyebrow, .s4 .title", { opacity: 0, y: 30 });
gsap.set("#famA", { opacity: 0, x: -260, rotation: -4 });
gsap.set("#famB", { opacity: 0, x: 260, rotation: 4 });
gsap.set("#ring", { scale: 0, rotation: -180 });
fadeScene("#s4", 12.8, 0.1);
tl.to(".s4 .eyebrow, .s4 .title", { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, 12.85)
  .to("#famA", { opacity: 1, x: 0, rotation: 0, duration: 1, ease: "expo.out" }, 13.05)
  .to("#famB", { opacity: 1, x: 0, rotation: 0, duration: 1, ease: "expo.out" }, 13.45)
  .to("#ring", { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(1.7)" }, 13.8)
  .to("#ring svg", { rotation: 90, duration: 2.6, ease: "none" }, 13.8);
leaveScene("#s4", 15.55);

/* S4b story 15.75 -> 19.65 */
gsap.set(".s4b .eyebrow, .s4b .title", { opacity: 0, y: 30 });
gsap.set(".vpol", { opacity: 0, y: 120, scale: 0.7 });
fadeScene("#s4b", 15.7, 0.1);
tl.to(".s4b .eyebrow, .s4b .title", { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, 15.75)
  .to(".vpol", { opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.7, ease: "back.out(1.5)" }, 15.95)
  .fromTo(".vpol__img img", { scale: 1.15 }, { scale: 1, duration: 3.4, ease: "none" }, 15.95);
leaveScene("#s4b", 19.3);

/* S5 events 16.2 → 24.6 */
const blurs = $$(".ev-blur");
const dots = $$(".dots i");
gsap.set(".s5__head", { opacity: 0, y: 30 });
gsap.set("#track", { x: 300, opacity: 0 });
gsap.set(".s5 .pill", { opacity: 0, y: 40 });
tl.to("#bgDark", { opacity: 1, duration: 0.5, ease: "none" }, warp(16.05))
  .to("#mandalaWrap", { opacity: 0, duration: 0.4 }, warp(16.05));
fadeScene("#s5", warp(16.2), 0.1);
tl.to(".s5__head", { opacity: 1, y: 0, duration: 0.6 }, warp(16.3))
  .to("#track", { x: 0, opacity: 1, duration: 0.9, ease: "expo.out" }, warp(16.4))
  .to(".s5 .pill", { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.6)" }, warp(16.8));
const SLIDE_AT = [16.4, 18.4, 20.4, 22.4].map(warp);
SLIDE_AT.forEach((t, i) => {
  if (i > 0) tl.to("#track", { x: -W * i, duration: 0.75, ease: "power3.inOut" }, t - 0.35);
  tl.to(blurs[i], { opacity: 1, duration: 0.6, ease: "none" }, t - 0.2);
  if (i > 0) tl.to(blurs[i - 1], { opacity: 0, duration: 0.6, ease: "none" }, t - 0.1);
  tl.fromTo(`.slide:nth-child(${i + 1}) .frame img`, { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "none" }, t - 0.3);
  tl.fromTo(`.slide:nth-child(${i + 1}) .slide__text > *`, { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "expo.out" }, t + 0.2);
  tl.to(dots[i], { width: 60, backgroundColor: "#e8cf94", duration: 0.4 }, t);
  if (i > 0) tl.to(dots[i - 1], { width: 18, backgroundColor: "rgba(251,244,238,.3)", duration: 0.4 }, t);
});
leaveScene("#s5", warp(24.25));

/* S6 venue 24.4 → 27.0 */
const roads = $$("#map path");
roads.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
gsap.set(".s6 .eyebrow, .s6 .title, .venue > *", { opacity: 0, y: 30 });
gsap.set("#pin", { y: -500, opacity: 0 });
gsap.set(".s6 .pill", { opacity: 0, y: 40 });
gsap.set(".ripple", { scale: 0.3, opacity: 0 });
tl.to("#bgDark", { opacity: 0, duration: 0.5, ease: "none" }, warp(24.25));
fadeScene("#s6", warp(24.4), 0.1);
tl.to(roads, { strokeDashoffset: 0, duration: 1.4, stagger: 0.08, ease: "power2.inOut" }, warp(24.4))
  .to(".s6 .eyebrow, .s6 .title", { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, warp(24.45))
  .to("#pin", { y: 0, opacity: 1, duration: 0.9, ease: "bounce.out" }, warp(24.6))
  .to(".ripple", { keyframes: [{ scale: 0.3, opacity: 1, duration: 0 }, { scale: 2.4, opacity: 0, duration: 1.1 }], stagger: 0.55, repeat: 1, ease: "power1.out" }, warp(25.3))
  .to(".venue > *", { opacity: 1, y: 0, stagger: 0.12, duration: 0.6 }, warp(25.0))
  .to(".s6 .pill", { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.6)" }, warp(25.4));
leaveScene("#s6", warp(26.75));

/* S7 finale 27.0 → 30 */
gsap.set(".s7 .eyebrow, .final-date, .open, .url, .hashtag", { opacity: 0, y: 30 });
gsap.set(".s7 .ch", { opacity: 0, y: 60, rotation: 10 });
gsap.set(".features span", { opacity: 0, scale: 0.85 });
tl.to("#bgCream", { opacity: 0, duration: 0.5, ease: "none" }, warp(26.75));
fadeScene("#s7", warp(26.95), 0.1);
tl.to(".s7 .eyebrow", { opacity: 1, y: 0, duration: 0.5 }, warp(27.0))
  .to(".s7 .ch", { opacity: 1, y: 0, rotation: 0, stagger: 0.03, duration: 0.7, ease: "expo.out" }, warp(27.05))
  .to(".final-date", { opacity: 1, y: 0, duration: 0.5 }, warp(27.45))
  .to(".features span", { opacity: 1, scale: 1, stagger: 0.07, duration: 0.45, ease: "back.out(1.8)" }, warp(27.6))
  .to(".open, .url", { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }, warp(28.1))
  .to(".hashtag", { opacity: 1, y: 0, duration: 0.5 }, warp(28.35))
  .to({}, { duration: 0.01 }, DURATION - 0.01);

/* ------------------------------------------------------------------
   CANVAS FX: deterministic petals, scratch foil, confetti
------------------------------------------------------------------- */
function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const fx = $("#fx").getContext("2d");
const PETAL_COLORS = ["#e7a8b4", "#d98197", "#f3c9b9", "#e8cf94", "#c9a15b", "#b84a6a"];
const petals = (() => { const r = rng(7); return Array.from({ length: 30 }, () => ({ x: r() * W, y: r() * H, v: 70 + r() * 110, s: 12 + r() * 16, ph: r() * 6.28, rv: (r() - 0.5) * 2, c: PETAL_COLORS[(r() * 6) | 0], a: 0.3 + r() * 0.35 })); })();

const CONFETTI_COLORS = ["#c9a15b", "#e8cf94", "#8b2448", "#f1d9d2", "#ffffff", "#b84a6a"];
function makeBurst(t0, x, y, n, seed, spread = 1) {
  const r = rng(seed);
  return { t0, parts: Array.from({ length: n }, () => { const ang = -Math.PI / 2 + (r() - 0.5) * 2.2 * spread; const sp = 900 + r() * 1300; return { x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, w: 10 + r() * 12, h: 16 + r() * 14, rot: r() * 6, vr: (r() - 0.5) * 14, c: CONFETTI_COLORS[(r() * 6) | 0] }; }) };
}
const bursts = [makeBurst(11.25, 540, 910, 140, 11), makeBurst(warp(27.1), 540, 700, 160, 27, 1.2)];

function drawPetal(p, x, y, rot, flip) {
  fx.save(); fx.translate(x, y); fx.rotate(rot); fx.scale(1, flip);
  fx.globalAlpha = p.a; fx.fillStyle = p.c; fx.beginPath();
  fx.moveTo(0, -p.s); fx.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.7, p.s * 0.6, 0, p.s); fx.bezierCurveTo(-p.s * 0.7, p.s * 0.6, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
  fx.fill(); fx.restore();
}
function drawFx(t) {
  fx.clearRect(0, 0, W, H);
  const petalAlpha = t < 3.8 ? 0 : Math.min(1, (t - 3.8) / 0.8);
  if (petalAlpha > 0) {
    fx.save(); fx.globalAlpha = petalAlpha;
    for (const p of petals) {
      const y = ((p.y + p.v * t) % (H + 80)) - 40;
      const x = p.x + Math.sin(p.ph + t * 0.9) * 40;
      const prev = fx.globalAlpha; fx.globalAlpha = prev;
      drawPetal(p, x, y, p.ph + t * p.rv, Math.abs(Math.cos(p.ph + t * 2)) * 0.7 + 0.3);
    }
    fx.restore();
  }
  for (const b of bursts) {
    const dt = t - b.t0;
    if (dt < 0 || dt > 3) continue;
    for (const q of b.parts) {
      const drag = (1 - Math.exp(-2.2 * dt)) / 2.2;
      const x = q.x + q.vx * drag;
      const y = q.y + q.vy * drag + 0.5 * 1400 * dt * dt * 0.6;
      fx.save(); fx.translate(x, y); fx.rotate(q.rot + q.vr * dt); fx.scale(1, Math.cos(q.rot * 3 + dt * 9));
      fx.globalAlpha = Math.max(0, 1 - dt / 3); fx.fillStyle = q.c; fx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); fx.restore();
    }
  }
}

/* scratch foil */
const foil = $("#foil").getContext("2d");
const coin = { style: {} };
const FW = 860, FH = 500;
const path = (() => { const pts = []; const rows = [90, 175, 260, 345, 420]; rows.forEach((y, i) => { const a = i % 2 ? [790, 70] : [70, 790]; pts.push([a[0], y], [a[1], y + 40]); }); return pts; })();
const segLens = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
const totalLen = segLens.reduce((a, b) => a + b, 0);
function pointAt(d) { for (let i = 0; i < segLens.length; i++) { if (d <= segLens[i]) { const k = d / segLens[i]; return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k, i]; } d -= segLens[i]; } return [...path[path.length - 1], segLens.length]; }
function drawFoil(p) {
  foil.globalCompositeOperation = "source-over";
  foil.clearRect(0, 0, FW, FH);
  const g = foil.createLinearGradient(0, 0, FW, FH);
  g.addColorStop(0, "#9c7a3c"); g.addColorStop(0.25, "#e8cf94"); g.addColorStop(0.5, "#b8904a"); g.addColorStop(0.75, "#f1dea9"); g.addColorStop(1, "#9c7a3c");
  foil.fillStyle = g; foil.fillRect(0, 0, FW, FH);
  foil.strokeStyle = "rgba(255,255,255,0.18)"; foil.lineWidth = 2;
  for (let x = -FH; x < FW; x += 14) { foil.beginPath(); foil.moveTo(x, 0); foil.lineTo(x + FH, FH); foil.stroke(); }
  foil.fillStyle = "rgba(42,11,22,0.8)"; foil.textAlign = "center";
  foil.font = 'italic 600 52px "Cormorant Garamond"'; foil.fillText("Tap to reveal", FW / 2, FH / 2 - 150);
  foil.font = '70px "Pinyon Script"'; foil.fillText("our special day", FW / 2, FH / 2 + 175);
  if (p <= 0) return;
  foil.globalCompositeOperation = "destination-out";
  foil.strokeStyle = foil.fillStyle = "#000"; foil.lineWidth = 120; foil.lineCap = foil.lineJoin = "round";
  const [ex, ey, seg] = pointAt(p * totalLen);
  foil.beginPath(); foil.moveTo(path[0][0], path[0][1]);
  for (let i = 1; i <= seg && i < path.length; i++) foil.lineTo(path[i][0], path[i][1]);
  foil.lineTo(ex, ey); foil.stroke();
  coin.style.transform = `translate(${ex}px, ${ey}px) rotate(${p * 720}deg)`;
}

/* ------------------------------------------------------------------
   SEEK API used by the recorder
------------------------------------------------------------------- */
function seek(t) {
  tl.time(Math.min(t, DURATION), false);
  drawFoil(0);
  drawFx(t);
}
window.__duration = DURATION;
window.__seek = seek;

const imgs = $$("img").map((im) => (im.complete ? Promise.resolve() : new Promise((r) => { im.onload = im.onerror = r; })));
Promise.all([document.fonts.ready, ...imgs]).then(() => {
  seek(0);
  window.__ready = true;
  // live preview when opened normally: ?play
  if (location.search.includes("play")) {
    const start = performance.now();
    const loop = () => { const t = ((performance.now() - start) / 1000) % DURATION; seek(t); requestAnimationFrame(loop); };
    loop();
  }
  // fit the stage into the window for previewing
  const fit = () => { const k = Math.min(innerWidth / W, innerHeight / H); if (k < 1) $("#stage").style.transform = `scale(${k})`; else $("#stage").style.transform = ""; };
  fit(); addEventListener("resize", fit);
});
