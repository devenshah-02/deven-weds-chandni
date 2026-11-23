import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import confetti from "canvas-confetti";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------
   CONFIG
   Set RSVP_ENDPOINT to a Formspree / Google Apps Script / API URL to
   receive replies. Left empty, replies are kept in this browser only.
------------------------------------------------------------------- */
const RSVP_ENDPOINT = "";
const WEDDING_START = new Date("2027-02-14T11:30:00+05:30");

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ------------------------------------------------------------------
   SMOOTH SCROLL
------------------------------------------------------------------- */
const lenis = new Lenis({ duration: 1.15, smoothWheel: !reduced });
lenis.stop();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -10 });
  })
);

/* ------------------------------------------------------------------
   SPLIT TEXT (chars)
------------------------------------------------------------------- */
$$("[data-split]").forEach((el) => {
  const text = el.textContent;
  el.setAttribute("aria-label", text);
  let i = 0;
  el.innerHTML = text
    .split(" ")
    .map((word) => [...word].map((c) => `<span class="ch" style="--i:${i++}" aria-hidden="true">${c}</span>`).join(""))
    .map((word) => `<span class="word">${word}</span>`)
    .join(" ");
});

/* ------------------------------------------------------------------
   MANDALA (generated SVG)
------------------------------------------------------------------- */
(function buildMandala() {
  const svg = $("#mandala");
  const NS = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(NS, "g");
  g.setAttribute("transform", "translate(200 200)");
  g.setAttribute("fill", "none");
  g.setAttribute("stroke", "#c9a15b");
  g.setAttribute("stroke-width", "0.6");
  const add = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    g.appendChild(n);
    return n;
  };
  [60, 92, 150, 186].forEach((r, i) => add("circle", { r, "stroke-dasharray": i % 2 ? "2 4" : "none", opacity: 0.7 }));
  for (let i = 0; i < 24; i++) {
    const a = (i * 360) / 24;
    add("path", { d: "M0,-92 C14,-120 14,-136 0,-150 C-14,-136 -14,-120 0,-92Z", transform: `rotate(${a})` });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i * 360) / 12 + 15;
    add("path", { d: "M0,-60 C22,-70 26,-84 0,-92 C-26,-84 -22,-70 0,-60Z", transform: `rotate(${a})`, opacity: 0.8 });
  }
  for (let i = 0; i < 48; i++) {
    add("circle", { cx: 0, cy: -168, r: 2.2, transform: `rotate(${(i * 360) / 48})`, fill: "#c9a15b", stroke: "none", opacity: 0.5 });
  }
  svg.appendChild(g);
})();

/* ------------------------------------------------------------------
   FALLING PETALS (canvas)
------------------------------------------------------------------- */
const petals = (() => {
  const c = $("#petals");
  const ctx = c.getContext("2d");
  let w, h, dpr, items = [], running = false, density = 0;
  const colors = ["#e7a8b4", "#d98197", "#f3c9b9", "#e8cf94", "#c9a15b", "#b84a6a"];
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.width = innerWidth * dpr;
    h = c.height = innerHeight * dpr;
  };
  const make = (initial) => ({
    x: Math.random() * w,
    y: initial ? Math.random() * h : -20 * dpr,
    s: (6 + Math.random() * 9) * dpr,
    vy: (0.35 + Math.random() * 0.7) * dpr,
    vx: (Math.random() - 0.5) * 0.4 * dpr,
    r: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.03,
    sway: Math.random() * Math.PI * 2,
    flip: Math.random() * Math.PI * 2,
    color: colors[(Math.random() * colors.length) | 0],
    a: 0.28 + Math.random() * 0.32,
  });
  const draw = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.7 + 0.3);
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.7, p.s * 0.6, 0, p.s);
    ctx.bezierCurveTo(-p.s * 0.7, p.s * 0.6, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
    ctx.fill();
    ctx.restore();
  };
  const tick = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    while (items.length < density) items.push(make(false));
    items.forEach((p) => {
      p.sway += 0.012;
      p.flip += 0.03;
      p.x += p.vx + Math.sin(p.sway) * 0.5 * dpr;
      p.y += p.vy;
      p.r += p.vr;
      draw(p);
    });
    items = items.filter((p) => p.y < h + 30 * dpr);
    requestAnimationFrame(tick);
  };
  resize();
  addEventListener("resize", resize);
  return {
    start(n = 16) {
      if (reduced) return;
      density = innerWidth < 700 ? Math.round(n * 0.55) : n;
      items = Array.from({ length: density }, () => make(true));
      running = true;
      tick();
    },
    burst(n = 40) {
      if (reduced) return;
      for (let i = 0; i < n; i++) {
        const p = make(false);
        p.y = -Math.random() * h * 0.4;
        p.vy *= 2.2;
        items.push(p);
      }
    },
  };
})();

/* ------------------------------------------------------------------
   EVENT FX (particles emerging from each invitation on scroll:
   haldi marigolds, sangeet glitter, wedding rose petals, pool drops)
------------------------------------------------------------------- */
const PALETTES = {
  haldi: { mode: "fall", colors: ["#f7d873", "#e0a21b", "#ffe8a3", "#f2b705"] },
  sangeet: { mode: "float", colors: ["#ffe9ad", "#ffffff", "#f7d873", "#e8cf94"] },
  wedding: { mode: "fall", colors: ["#8b1e3f", "#e7b6a8", "#c9627e", "#6b1a35"] },
  pool: { mode: "fall", colors: ["#bfe9e6", "#7fd3cf", "#dff5f3", "#1f8a8a"] },
};

function makeEventFX(canvas, kind) {
  const ctx = canvas.getContext("2d");
  const cfg = PALETTES[kind];
  let w = 0, h = 0, dpr = 1, items = [], density = 0, running = false, raf = null, burstT = 0;

  const resize = () => {
    const r = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.max(1, Math.round(r.width * dpr));
    h = canvas.height = Math.max(1, Math.round(r.height * dpr));
  };

  // originY: the band near the photo where particles are "born" —
  // this is what makes them read as emerging from the invitation.
  const originBand = () => Math.min(h * 0.4, 170 * dpr);

  const make = (emerging) => {
    const color = cfg.colors[(Math.random() * cfg.colors.length) | 0];
    const depth = 0.55 + Math.random() * 0.75; // parallax: <1 far/small/slow, >1 near/big/fast
    const x = Math.random() * w;
    const band = originBand();
    if (kind === "haldi")
      return { x, y: emerging ? -Math.random() * band : -16 * dpr, s: (5 + Math.random() * 6) * dpr * depth, vy: (0.5 + Math.random() * 0.6) * dpr * depth, vx: (Math.random() - 0.5) * 0.3 * dpr, r: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.04, sway: Math.random() * Math.PI * 2, a: 0.75 + depth * 0.2, color };
    if (kind === "wedding")
      return { x, y: emerging ? -Math.random() * band : -16 * dpr, s: (6 + Math.random() * 8) * dpr * depth, vy: (0.4 + Math.random() * 0.6) * dpr * depth, vx: (Math.random() - 0.5) * 0.35 * dpr, r: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.05, sway: Math.random() * Math.PI * 2, a: 0.7 + depth * 0.2, color };
    if (kind === "pool")
      return { x, y: emerging ? -Math.random() * band : -16 * dpr, s: (2.2 + Math.random() * 3) * dpr * depth, vy: (1.8 + Math.random() * 1.6) * dpr * depth, vx: (Math.random() - 0.5) * 0.15 * dpr, px: 0, py: 0, color };
    // sangeet glitter — born in the photo band, drifts upward and twinkles
    return { x, y: emerging ? h - Math.random() * band : Math.random() * h, s: (1.4 + Math.random() * 2.3) * dpr * depth, vy: -(0.12 + Math.random() * 0.22) * dpr * depth, vx: (Math.random() - 0.5) * 0.25 * dpr, tw: Math.random() * Math.PI * 2, vtw: 0.05 + Math.random() * 0.09, spin: Math.random() * Math.PI, color };
  };

  const drawFlower = (p) => {
    ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x, p.y); ctx.rotate(p.r);
    for (let i = 0; i < 8; i++) {
      ctx.save(); ctx.rotate((Math.PI * 2 / 8) * i);
      ctx.beginPath(); ctx.ellipse(0, -p.s * 0.68, p.s * 0.3, p.s * 0.42, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.fill(); ctx.restore();
    }
    for (let i = 0; i < 5; i++) {
      ctx.save(); ctx.rotate((Math.PI * 2 / 5) * i + 0.3);
      ctx.beginPath(); ctx.ellipse(0, -p.s * 0.4, p.s * 0.36, p.s * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.fill(); ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, 0, p.s * 0.28, 0, Math.PI * 2); ctx.fillStyle = "#8a5a06"; ctx.fill();
    ctx.restore();
  };
  const drawPetalShape = (p) => {
    ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x, p.y); ctx.rotate(p.r);
    ctx.beginPath();
    ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.7, p.s * 0.6, 0, p.s);
    ctx.bezierCurveTo(-p.s * 0.7, p.s * 0.6, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
    ctx.fillStyle = p.color; ctx.fill();
    ctx.globalAlpha = p.a * 0.5;
    ctx.beginPath(); ctx.ellipse(-p.s * 0.1, -p.s * 0.15, p.s * 0.32, p.s * 0.5, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.restore();
  };
  const drawDroplet = (p) => {
    ctx.save();
    if (p.px || p.py) {
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = p.color; ctx.lineWidth = p.s * 0.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    ctx.translate(p.x, p.y); ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.moveTo(0, -p.s * 1.6);
    ctx.quadraticCurveTo(p.s, 0, 0, p.s);
    ctx.quadraticCurveTo(-p.s, 0, 0, -p.s * 1.6);
    ctx.fillStyle = p.color; ctx.fill();
    ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.ellipse(-p.s * 0.28, -p.s * 0.2, p.s * 0.22, p.s * 0.32, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.restore();
  };
  const drawGlitter = (p) => {
    const a = 0.3 + Math.abs(Math.sin(p.tw)) * 0.7;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin + p.tw * 0.3); ctx.globalAlpha = a;
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = p.color; ctx.shadowBlur = p.s * 4;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.s * 2.4); ctx.lineTo(p.s * 0.45, -p.s * 0.45);
    ctx.lineTo(p.s * 2.4, 0); ctx.lineTo(p.s * 0.45, p.s * 0.45);
    ctx.lineTo(0, p.s * 2.4); ctx.lineTo(-p.s * 0.45, p.s * 0.45);
    ctx.lineTo(-p.s * 2.4, 0); ctx.lineTo(-p.s * 0.45, -p.s * 0.45);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  const tick = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    burstT++;
    items.forEach((p) => {
      if (kind === "haldi" || kind === "wedding") {
        p.sway += 0.015; p.x += p.vx + Math.sin(p.sway) * 0.4 * dpr; p.y += p.vy; p.r += p.vr;
        kind === "haldi" ? drawFlower(p) : drawPetalShape(p);
      } else if (kind === "pool") {
        p.px = p.x; p.py = p.y; p.x += p.vx; p.y += p.vy; drawDroplet(p);
      } else {
        p.tw += p.vtw; p.x += p.vx; p.y += p.vy; drawGlitter(p);
      }
    });
    if (cfg.mode === "fall") {
      items = items.filter((p) => p.y < h + 24 * dpr);
      // while the card is freshly in view, keep spawning from the origin band
      // for a short beat so the burst visibly pours out of the invitation
      while (items.length < density) items.push(make(burstT < 70));
    } else {
      items.forEach((p) => { if (p.y < -10 * dpr) { p.y = h + 10 * dpr; p.x = Math.random() * w; } });
    }
    raf = requestAnimationFrame(tick);
  };

  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  return {
    start(n) {
      if (reduced || running) return;
      density = n;
      resize();
      burstT = 0;
      items = Array.from({ length: density }, () => make(true));
      running = true;
      tick();
    },
    stop() {
      if (!running) return;
      running = false;
      if (raf) cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
      items = [];
    },
  };
}

(function eventFX() {
  const density = { haldi: 26, sangeet: 36, wedding: 30, pool: 28 };
  $$(".ev__fx").forEach((canvas) => {
    const kind = canvas.dataset.fx;
    const fx = makeEventFX(canvas, kind);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? fx.start(density[kind] || 24) : fx.stop())),
      { threshold: 0.3 }
    );
    io.observe(canvas.closest(".ev"));
  });
})();

/* ------------------------------------------------------------------
   MUSIC
------------------------------------------------------------------- */
const song = $("#song");
const musicBtn = $("#music");
song.volume = 0.55;
const setPlaying = (on) => musicBtn.classList.toggle("is-playing", on);
song.addEventListener("play", () => setPlaying(true));
song.addEventListener("pause", () => setPlaying(false));
musicBtn.addEventListener("click", () => (song.paused ? song.play().catch(() => {}) : song.pause()));

// safety net: browsers only allow audio-with-sound to autoplay inside a
// real user gesture. Catch the very first tap/click/key anywhere on the
// page (not just the seal) so playback reliably starts even if a tap
// lands slightly off-target, and so the later auto-open fallback (which
// fires on a timer, not a gesture) has already been unlocked by then.
const unlockAudio = () => {
  if (song.paused) song.play().catch(() => {});
};
addEventListener("pointerdown", unlockAudio, { once: true });
addEventListener("keydown", unlockAudio, { once: true });

/* ------------------------------------------------------------------
   INTRO
------------------------------------------------------------------- */
const intro = $("#intro");
const envelope = $("#envelope");
gsap.timeline({ delay: 0.2 })
  .to(".intro__kicker", { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
  .to(envelope, { opacity: 1, y: 0, rotateX: 0, duration: 1.4, ease: "expo.out" }, "-=0.6")
  .fromTo("#seal", { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 1, ease: "back.out(1.8)" }, "-=0.9")
  .to("#introHint", { opacity: 1, duration: 0.8 }, "-=0.4");

// gentle float while waiting
const floatTween = gsap.to(envelope, { y: -8, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 });

// elderly-proofing: if the seal sits untapped, nudge harder, then open it for them
const seal = $("#seal");
const introHint = $("#introHint");
const urgeTimer = setTimeout(() => {
  seal.classList.add("is-urgent");
  introHint.classList.add("is-urgent");
}, 6000);
const autoOpenTimer = setTimeout(() => openInvite(), 14000);

let opened = false;
function openInvite() {
  if (opened) return;
  opened = true;
  clearTimeout(urgeTimer);
  clearTimeout(autoOpenTimer);
  floatTween.kill();

  // start the music the moment the seal is tapped, not after any later step
  song.play().catch(() => {});

  const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
  tl.to("#introHint, .intro__kicker", { opacity: 0, y: -10, duration: 0.4 })
    .to("#seal", { scale: 1.25, duration: 0.25, ease: "power2.out" }, 0)
    .to("#seal", { scale: 0, rotate: 140, opacity: 0, duration: 0.55, ease: "back.in(2)" }, 0.25)
    .to(".envelope__flap", { rotateX: 180, duration: 0.9 }, 0.55)
    .set(".envelope__flap", { zIndex: 1 }, 1.0)
    .to(envelope, { y: "18vh", duration: 1.1 }, 1.25)
    .to("#letter", { y: "-62%", duration: 1.1 }, 1.25)
    .set("#letter", { zIndex: 10 }, 2.35)
    .to("#letter", { y: "-34%", scale: 1.18, duration: 0.8, ease: "power2.out" }, 2.35)
    .to(".envelope__back, .envelope__pocket, .envelope__flap", { opacity: 0, y: 80, duration: 0.7 }, 2.35)
    .to("#letter", { scale: 5, opacity: 0, duration: 1, ease: "power3.in" }, 3.4)
    .to(intro, { opacity: 0, duration: 0.8, ease: "power2.inOut" }, 3.75)
    .add(() => {
      intro.remove();
      document.body.classList.remove("is-locked");
      lenis.start();
      ScrollTrigger.refresh();
      startPage();
    }, 4.5);
}
$("#seal").addEventListener("click", openInvite);
envelope.addEventListener("click", openInvite);

/* ------------------------------------------------------------------
   PAGE START (after intro)
------------------------------------------------------------------- */
function startPage() {
  musicBtn.classList.add("is-visible");
  petals.start();
  petals.burst(40);
  initScrollNudge();

  gsap.timeline()
    .from(".ganesh", { scale: 0.4, opacity: 0, duration: 1.2, ease: "back.out(1.6)" })
    .from(".shloka span", { y: 20, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power3.out" }, "-=0.7")
    .from(".hero__blessing", { y: 20, opacity: 0, duration: 0.8 }, "-=0.5")
    .from(".hero__names .name:first-child .ch", { yPercent: 110, opacity: 0, rotate: 8, stagger: 0.06, duration: 1, ease: "expo.out" }, "-=0.4")
    .from(".hero__weds .line", { scaleX: 0, duration: 0.9, ease: "expo.out" }, "-=0.7")
    .from(".hero__weds em", { opacity: 0, letterSpacing: "1em", duration: 1 }, "<")
    .from(".hero__names .name:last-child .ch", { yPercent: 110, opacity: 0, rotate: 8, stagger: 0.06, duration: 1, ease: "expo.out" }, "-=0.8")
    .set(".hero__names .ch", { clearProps: "all" })
    .from(".hero__tag, .hero__date", { y: 20, opacity: 0, stagger: 0.15, duration: 0.8 }, "-=0.6")
    .from(".hero__mandala", { scale: 0.6, opacity: 0, duration: 2, ease: "expo.out" }, 0)
    .from(".scroll-cue", { opacity: 0, duration: 0.8 }, "-=0.2");
}

/* ------------------------------------------------------------------
   SCROLL NUDGE
   Elderly-proofing: if nobody scrolls within ~16s of landing on the
   hero, show an unmissable "scroll down" hint; if that's still
   ignored, gently auto-scroll a bit so they see it's safe to continue.
   The moment any real scrolling happens, this watcher retires for good.
------------------------------------------------------------------- */
function initScrollNudge() {
  const nudge = $("#scrollNudge");
  const SHOW_AFTER = 16000;
  const AUTO_SCROLL_AFTER = 26000;
  const started = Date.now();
  let engaged = false, nudged = false, autoScrolled = false;

  const stopWatching = () => {
    engaged = true;
    nudge.classList.remove("is-visible");
    clearInterval(poll);
  };
  lenis.on("scroll", () => {
    if (!engaged && window.scrollY > 60) stopWatching();
  });

  const poll = setInterval(() => {
    if (engaged) return;
    const idle = Date.now() - started;
    if (!nudged && idle > SHOW_AFTER) {
      nudged = true;
      nudge.classList.add("is-visible");
    }
    if (nudged && !autoScrolled && idle > AUTO_SCROLL_AFTER) {
      autoScrolled = true;
      lenis.scrollTo(innerHeight * 0.85, { duration: 1.8 });
    }
  }, 1000);
}

/* ------------------------------------------------------------------
   SCROLL ANIMATIONS
------------------------------------------------------------------- */
// generic reveals (skip hero, which animates on open)
gsap.set($$(".reveal-up").filter((el) => !el.closest(".hero")), { y: 40, opacity: 0 });
ScrollTrigger.batch($$(".reveal-up").filter((el) => !el.closest(".hero")), {
  start: "top 88%",
  onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: "expo.out", overwrite: true }),
});

// hero parallax out
gsap.to(".hero__inner", {
  yPercent: 18, opacity: 0.2, ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
});
gsap.to(".hero__mandala", {
  scale: 1.3, ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
});

// progress bar
gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

// timer cells pop
gsap.from(".timer__cell", {
  y: 50, opacity: 0, rotateX: -60, stagger: 0.1, duration: 1.1, ease: "back.out(1.6)",
  scrollTrigger: { trigger: ".timer", start: "top 88%" },
});

// families
gsap.from(".fam-card[data-side='left']", {
  xPercent: -30, opacity: 0, rotate: -6, duration: 1.4, ease: "expo.out",
  scrollTrigger: { trigger: ".families__grid", start: "top 80%" },
});
gsap.from(".fam-card[data-side='right']", {
  xPercent: 30, opacity: 0, rotate: 6, duration: 1.4, ease: "expo.out",
  scrollTrigger: { trigger: ".families__grid", start: "top 80%" },
});
gsap.from(".families__mono", {
  scale: 0, rotate: -180, duration: 1.4, ease: "back.out(1.7)",
  scrollTrigger: { trigger: ".families__grid", start: "top 75%" },
});

// story: text reveals + photo slider
gsap.fromTo(".story__bigword", { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: { trigger: ".story", start: "top bottom", end: "bottom top", scrub: true } });
$$(".split-lines").forEach((el) => {
  gsap.from(el, { y: 60, opacity: 0, skewY: 4, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
});
gsap.from(".slider__frame", { y: 80, rotate: 6, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".story__photo", start: "top 80%" } });
gsap.from(".slider__stamp", { scale: 0, rotate: -120, duration: 1, ease: "back.out(1.8)", delay: 0.4, scrollTrigger: { trigger: ".story__photo", start: "top 80%" } });
(function slider() {
  const slides = $$("#sliderStage .slide");
  const dots = $$("#sliderDots button");
  const cap = $("#sliderCap"), count = $("#sliderCount");
  const N = slides.length;
  let i = 0, busy = false, timer;
  slides[0].classList.add("is-on");
  const go = (n, dir = 1) => {
    n = (n + N) % N;
    if (n === i || busy) return;
    busy = true;
    const from = slides[i], to = slides[n];
    to.classList.add("is-on");
    gsap.set(to, { zIndex: 2, opacity: 1 });
    gsap.set(from, { zIndex: 1 });
    gsap.fromTo(to, { clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0%)", duration: 0.9, ease: "expo.inOut" });
    gsap.fromTo(to.querySelector("img"), { scale: 1.18, xPercent: dir * 8 }, { scale: 1, xPercent: 0, duration: 1.3, ease: "expo.out" });
    gsap.to(from.querySelector("img"), { xPercent: -dir * 12, duration: 0.9, ease: "expo.inOut", onComplete: () => {
      from.classList.remove("is-on"); gsap.set(from.querySelector("img"), { xPercent: 0 }); gsap.set([from, to], { clearProps: "zIndex,clipPath" }); busy = false;
    } });
    gsap.to(cap, { opacity: 0, y: -8, duration: 0.25, onComplete: () => { cap.textContent = to.querySelector("img").alt; gsap.fromTo(cap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }); } });
    count.textContent = `${String(n + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
    dots.forEach((d, k) => d.classList.toggle("is-on", k === n));
    i = n;
  };
  const restart = () => { clearInterval(timer); timer = setInterval(() => go(i + 1, 1), 4500); };
  $("#sliderNext").addEventListener("click", () => { go(i + 1, 1); restart(); });
  $("#sliderPrev").addEventListener("click", () => { go(i - 1, -1); restart(); });
  dots.forEach((d, k) => d.addEventListener("click", () => { go(k, k > i ? 1 : -1); restart(); }));
  $("#slider").addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { go(i + 1, 1); restart(); } if (e.key === "ArrowLeft") { go(i - 1, -1); restart(); } });
  let x0 = null;
  const stage = $("#sliderStage");
  stage.addEventListener("pointerdown", (e) => (x0 = e.clientX));
  stage.addEventListener("pointerup", (e) => { if (x0 === null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 40) { go(dx < 0 ? i + 1 : i - 1, dx < 0 ? 1 : -1); restart(); } x0 = null; });
  ScrollTrigger.create({ trigger: "#slider", start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? restart() : clearInterval(timer)) });
})();

// events: horizontal scroll on desktop, stagger on mobile
const mm = gsap.matchMedia();
mm.add("(min-width: 861px)", () => {
  const track = $("#eventsTrack");
  const distance = () => Math.max(0, track.scrollWidth - innerWidth);
  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: "#eventsPin",
      start: "center center",
      end: () => "+=" + distance(),
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });
  $$(".ev").forEach((ev) => {
    gsap.from(ev.querySelector(".ev__img img"), {
      scale: 1.35, ease: "none",
      scrollTrigger: { trigger: ev, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
    });
  });
  gsap.from(".ev", {
    y: 80, opacity: 0, stagger: 0.12, duration: 1.2, ease: "expo.out",
    scrollTrigger: { trigger: "#eventsPin", start: "top 85%" },
  });
});
mm.add("(max-width: 860px)", () => {
  $$(".ev").forEach((ev) =>
    gsap.from(ev, { y: 70, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ev, start: "top 90%" } })
  );
});

// venue pin drop
gsap.from(".venue__icon", {
  y: -80, opacity: 0, duration: 1.2, ease: "bounce.out",
  scrollTrigger: { trigger: ".venue__card", start: "top 75%" },
});

// rsvp card rise
gsap.from(".rsvp__card", {
  y: 100, opacity: 0, rotateX: 10, duration: 1.4, ease: "expo.out",
  scrollTrigger: { trigger: ".rsvp", start: "top 75%" },
});

// footer names
gsap.from(".footer__names .ch", {
  y: 60, opacity: 0, rotate: 10, stagger: 0.04, duration: 1.1, ease: "expo.out",
  scrollTrigger: { trigger: ".footer", start: "top 75%" },
});
gsap.from(".footer__tag", { scale: 0.8, opacity: 0, duration: 1, ease: "back.out(1.6)", scrollTrigger: { trigger: ".footer__tag", start: "top 92%" } });

/* ------------------------------------------------------------------
   TAP TO REVEAL
------------------------------------------------------------------- */
(function tapReveal() {
  const foil = $("#foil");
  const scratch = $("#scratch");
  const timer = $("#timer");
  gsap.set(".scratch__under > *", { opacity: 0, y: 20 });

  function revealDate() {
    if (foil.classList.contains("is-open")) return;
    clearTimeout(foilUrgeTimer);
    clearTimeout(foilAutoTimer);
    foil.classList.remove("is-urgent");
    gsap.fromTo(foil, { scale: 1 }, { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.inOut" });
    foil.classList.add("is-open", "is-gone");
    const r = foil.getBoundingClientRect();
    const ox = (r.left + r.width / 2) / innerWidth;
    const oy = (r.top + r.height / 2) / innerHeight;
    const colors = ["#c9a15b", "#e8cf94", "#8b2448", "#f1d9d2", "#ffffff"];

    // firework-style layered burst: a bright central pop, a slower
    // star shower, then two side cannons for a celebratory finale
    confetti({ particleCount: 140, spread: 100, startVelocity: 48, ticks: 240, scalar: 1.1, origin: { x: ox, y: oy }, colors, disableForReducedMotion: true });
    confetti({ particleCount: 70, spread: 160, startVelocity: 28, ticks: 260, shapes: ["star"], scalar: 0.9, origin: { x: ox, y: oy }, colors, disableForReducedMotion: true });
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 65, startVelocity: 55, origin: { x: 0.08, y: 0.7 }, colors, disableForReducedMotion: true });
      confetti({ particleCount: 60, angle: 120, spread: 65, startVelocity: 55, origin: { x: 0.92, y: 0.7 }, colors, disableForReducedMotion: true });
    }, 220);

    gsap.to(".scratch__under > *", { opacity: 1, y: 0, stagger: 0.12, duration: 0.9, ease: "expo.out", delay: 0.35 });
    gsap.fromTo(".scratch__big", { scale: 0.6 }, { scale: 1, duration: 1.2, ease: "elastic.out(1, .5)", delay: 0.35 });
    timer.classList.add("is-visible");
    gsap.fromTo(".timer__cell", { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.9, ease: "back.out(1.6)", delay: 0.55 });
  }

  foil.addEventListener("click", revealDate);

  // elderly-proofing: once this card scrolls into view, nudge harder after a
  // few seconds, then auto-reveal the date for them if still untapped at 10s
  let foilUrgeTimer, foilAutoTimer;
  const foilObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || foil.classList.contains("is-open")) return;
      foilObserver.disconnect();
      foilUrgeTimer = setTimeout(() => foil.classList.add("is-urgent"), 4000);
      foilAutoTimer = setTimeout(() => revealDate(), 10000);
    });
  }, { threshold: 0.5 });
  foilObserver.observe(scratch);
})();

/* ------------------------------------------------------------------
   COUNTDOWN
------------------------------------------------------------------- */
(function countdown() {
  const els = Object.fromEntries($$(".timer__num").map((el) => [el.dataset.unit, el]));
  const set = (el, v) => {
    const s = String(v).padStart(2, "0");
    if (el.textContent === s) return;
    el.textContent = s;
    el.classList.remove("tick");
    void el.offsetWidth;
    el.classList.add("tick");
  };
  const update = () => {
    let diff = Math.max(0, WEDDING_START - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    set(els.d, d); set(els.h, h); set(els.m, m); set(els.s, s);
  };
  update();
  setInterval(update, 1000);
})();

/* ------------------------------------------------------------------
   TILT + POINTER LIGHT (family cards)
------------------------------------------------------------------- */
if (finePointer && !reduced) {
  $$(".tilt").forEach((card) => {
    const inner = card.querySelector(".fam-card__arch");
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      inner.style.setProperty("--mx", `${px * 100}%`);
      inner.style.setProperty("--my", `${py * 100}%`);
      gsap.to(inner, { rotateY: (px - 0.5) * 12, rotateX: (0.5 - py) * 10, duration: 0.6, ease: "power3.out" });
    });
    card.addEventListener("pointerleave", () => gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 1, ease: "elastic.out(1, 0.5)" }));
  });
}

/* ------------------------------------------------------------------
   CURSOR + MAGNETIC
------------------------------------------------------------------- */
if (finePointer && !reduced) {
  const cur = $("#cursor");
  const xTo = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" });
  const yTo = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
  addEventListener("pointermove", (e) => { cur.style.opacity = 1; xTo(e.clientX); yTo(e.clientY); });
  document.addEventListener("pointerleave", () => (cur.style.opacity = 0));
  const hoverables = "a, button, .ev__img, input, textarea";
  document.addEventListener("pointerover", (e) => e.target.closest(hoverables) && cur.classList.add("is-hover"));
  document.addEventListener("pointerout", (e) => e.target.closest(hoverables) && cur.classList.remove("is-hover"));

  $$(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3.out" });
    });
    el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" }));
  });
}

/* ------------------------------------------------------------------
   LIGHTBOX
------------------------------------------------------------------- */
const lb = $("#lightbox");
const lbImg = lb.querySelector("img");
$$(".ev__img").forEach((b) =>
  b.addEventListener("click", () => {
    lbImg.src = b.dataset.full;
    lbImg.alt = b.querySelector("img").alt;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    lenis.stop();
  })
);
const closeLb = () => { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true"); lenis.start(); };
lb.addEventListener("click", (e) => (e.target === lb || e.target.closest(".lightbox__close")) && closeLb());
addEventListener("keydown", (e) => e.key === "Escape" && lb.classList.contains("is-open") && closeLb());

/* ------------------------------------------------------------------
   ADD TO CALENDAR (.ics)
------------------------------------------------------------------- */
const EVENTS = {
  haldi: { title: "Haldi Ceremony · Deven & Chandni", start: "20270214T060000Z", end: "20270214T093000Z" },
  sangeet: { title: "Sangeet Night · Deven & Chandni", start: "20270214T133000Z", end: "20270214T183000Z" },
  pool: { title: "Poolside Celebration · Deven & Chandni", start: "20270215T040000Z", end: "20270215T073000Z" },
  wedding: { title: "Shubh Vivah · Deven & Chandni", start: "20270215T103000Z", end: "20270215T173000Z" },
};
$$("[data-cal]").forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const ev = EVENTS[a.dataset.cal];
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DevenWedsChandni//EN", "BEGIN:VEVENT",
      `UID:${a.dataset.cal}-deven-chandni-2027`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, "")}`,
      `DTSTART:${ev.start}`, `DTEND:${ev.end}`, `SUMMARY:${ev.title}`,
      "LOCATION:Hotel Gautam\\, Lonavala", "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `${a.dataset.cal}.ics` });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Calendar invite ready ✨");
  })
);

/* ------------------------------------------------------------------
   RSVP
------------------------------------------------------------------- */
(function rsvp() {
  const form = $("#rsvpForm");
  const toggle = $("#attendToggle");
  const yesBlock = $("#rsvpYes");
  const miss = $("#rsvpMiss");
  const err = $("#rsvpErr");
  const done = $("#rsvpDone");
  const guestOut = $("#guestOut");
  let guests = 1;

  $$("button", toggle).forEach((b) =>
    b.addEventListener("click", () => {
      const yes = b.dataset.val === "yes";
      $$("button", toggle).forEach((x) => x.classList.toggle("is-on", x === b));
      toggle.classList.toggle("is-no", !yes);
      form.attending.value = b.dataset.val;
      if (yes) {
        miss.style.display = "none";
        gsap.fromTo(yesBlock, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.6, ease: "expo.out", onStart: () => (yesBlock.style.display = "grid") });
      } else {
        gsap.to(yesBlock, { height: 0, opacity: 0, duration: 0.5, ease: "expo.inOut", onComplete: () => (yesBlock.style.display = "none") });
        miss.style.display = "block";
        gsap.fromTo(miss, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
      }
    })
  );

  $$("[data-step]").forEach((b) =>
    b.addEventListener("click", () => {
      guests = Math.min(10, Math.max(1, guests + Number(b.dataset.step)));
      guestOut.textContent = guests;
      form.guests.value = guests;
      gsap.fromTo(guestOut, { scale: 1.4, color: "#c9a15b" }, { scale: 1, color: "#6b1a35", duration: 0.5, ease: "back.out(2)" });
    })
  );

  $$("#moodChips button").forEach((b) =>
    b.addEventListener("click", () => {
      $$("#moodChips button").forEach((x) => x.classList.toggle("is-on", x === b));
      form.mood.value = b.dataset.val;
      const r = b.getBoundingClientRect();
      confetti({
        particleCount: 18, spread: 50, startVelocity: 18, scalar: 0.7, ticks: 80,
        origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight },
        colors: ["#c9a15b", "#e8cf94", "#8b2448"], disableForReducedMotion: true,
      });
    })
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = "";
    const name = form.name.value.trim();
    const attending = form.attending.value === "yes";
    if (!name) {
      form.name.classList.remove("is-invalid"); void form.name.offsetWidth;
      form.name.classList.add("is-invalid");
      err.textContent = "Please tell us your name.";
      form.name.focus();
      return;
    }
    form.name.classList.remove("is-invalid");
    if (attending && !form.mood.value) {
      err.textContent = "Pick your wedding mood!";
      gsap.fromTo("#moodChips", { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      return;
    }

    const payload = {
      name,
      attending,
      guests: attending ? guests : 0,
      mood: attending ? form.mood.value : "",
      note: form.note.value.trim(),
      advice: form.advice.value.trim(),
      at: new Date().toISOString(),
    };

    const btn = form.querySelector("[type=submit]");
    btn.disabled = true;
    try {
      if (RSVP_ENDPOINT) {
        const res = await fetch(RSVP_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("bad status");
      }
      try {
        const all = JSON.parse(localStorage.getItem("cwd-rsvps") || "[]");
        all.push(payload);
        localStorage.setItem("cwd-rsvps", JSON.stringify(all));
      } catch {}
    } catch {
      err.textContent = "Something went wrong. Please try again.";
      btn.disabled = false;
      return;
    }
    btn.disabled = false;

    $("#doneTitle").textContent = attending ? `Yay, ${name.split(" ")[0]}!` : `Thank you, ${name.split(" ")[0]}`;
    $("#doneMsg").textContent = attending
      ? "We can't wait to celebrate with you. 🎉"
      : "We'll miss you, and we'll be thinking of you on our day. 💛";

    gsap.to(form, {
      opacity: 0, y: -20, duration: 0.4, onComplete: () => {
        form.hidden = true;
        done.hidden = false;
        gsap.fromTo(done, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" });
        ScrollTrigger.refresh();
      },
    });

    if (attending) {
      const fire = (ratio, opts) => confetti({ particleCount: Math.floor(220 * ratio), origin: { y: 0.65 }, colors: ["#c9a15b", "#e8cf94", "#8b2448", "#f1d9d2", "#fff"], disableForReducedMotion: true, ...opts });
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
      petals.burst(50);
    }
  });

  $("#rsvpAgain").addEventListener("click", () => {
    done.hidden = true;
    form.hidden = false;
    gsap.to(form, { opacity: 1, y: 0, duration: 0.5 });
    ScrollTrigger.refresh();
  });
})();

/* ------------------------------------------------------------------
   HASHTAG + TOAST
------------------------------------------------------------------- */
const toastEl = $("#toast");
let toastT;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-show");
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove("is-show"), 2200);
}
$("#hashtag").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText("#DevenWedsChandni"); toast("Hashtag copied 💕"); }
  catch { toast("#DevenWedsChandni"); }
});

addEventListener("load", () => ScrollTrigger.refresh());
