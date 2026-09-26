/* ─────────────────────────────────────────────────────────────
   ojasv issar · trail guide portfolio
   the hero is four painted layers (assets/); every other landscape
   is generated here with seeded random and plain svg.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var f = function (n) { return Math.round(n * 10) / 10; };

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function svg(vb, body, par) {
    return '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" viewBox="' + vb + '" preserveAspectRatio="' + (par || "xMidYMax slice") + '">' + body + "</svg>";
  }
  function poly(pts) { return "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join("L") + "Z"; }

  /* ── drawing kit ───────────────────────────────────────── */

  // midpoint-displacement line from x0 to x1
  function jagged(r, x0, y0, x1, y1, amp, rough, levels) {
    var pts = [[x0, y0], [x1, y1]];
    for (var l = 0; l < levels; l++) {
      var next = [pts[0]];
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        next.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + (r() - 0.5) * amp], b);
      }
      pts = next; amp *= rough;
    }
    return pts;
  }

  // layered pine: tiers with drooping teeth, right side in shade
  function pine(r, x, by, h, c1, c2) {
    var tiers = Math.max(4, Math.round(h / 15)), w = h * 0.26, d1 = "", d2 = "";
    for (var k = 0; k < tiers; k++) {
      var t = (k + 1) / tiers, ty = by - h * 0.1 - (1 - t) * h * 0.86, tw = w * (0.2 + 0.8 * t) * (0.9 + r() * 0.2);
      var top = ty - (h / tiers) * 1.8, dy = h / tiers * 0.18;
      d1 += "M" + f(x) + " " + f(top) + "L" + f(x - tw) + " " + f(ty) + "L" + f(x - tw * 0.62) + " " + f(ty - dy) + "L" + f(x - tw * 0.38) + " " + f(ty + dy * 0.6) + "L" + f(x - tw * 0.12) + " " + f(ty - dy * 0.5) + "L" + f(x) + " " + f(ty + dy * 0.4) + "L" + f(x + tw * 0.12) + " " + f(ty - dy * 0.5) + "L" + f(x + tw * 0.38) + " " + f(ty + dy * 0.6) + "L" + f(x + tw * 0.62) + " " + f(ty - dy) + "L" + f(x + tw) + " " + f(ty) + "Z";
      d2 += "M" + f(x) + " " + f(top) + "L" + f(x + tw) + " " + f(ty) + "L" + f(x + tw * 0.62) + " " + f(ty - dy) + "L" + f(x + tw * 0.38) + " " + f(ty + dy * 0.6) + "L" + f(x + tw * 0.12) + " " + f(ty - dy * 0.5) + "L" + f(x) + " " + f(ty + dy * 0.4) + "Z";
    }
    return '<rect x="' + f(x - h * 0.018) + '" y="' + f(by - h * 0.14) + '" width="' + f(h * 0.036) + '" height="' + f(h * 0.14) + '" fill="#3b2a1a"/><path d="' + d1 + '" fill="' + c1 + '"/><path d="' + d2 + '" fill="' + c2 + '"/>';
  }

  // a soft cumulus: many overlapping puffs, lit from above, torn at the edges by noise and lightly blurred
  var cloudSeq = 0;
  function softCloud(r, w, h, wispy) {
    var id = "pc" + (cloudSeq++), base = h * 0.74, puffs = "", shade = "", core = "";
    if (wispy) {   // thin stratus streaks
      for (var k = 0; k < 7; k++) {
        var ex = w * (0.15 + r() * 0.7), ey = h * (0.45 + r() * 0.2), rx = w * (0.18 + r() * 0.2), ry = h * (0.05 + r() * 0.05);
        puffs += '<ellipse cx="' + f(ex) + '" cy="' + f(ey) + '" rx="' + f(rx) + '" ry="' + f(ry) + '"/>';
      }
      return '<svg viewBox="0 0 ' + w + " " + h + '" aria-hidden="true"><defs><filter id="' + id + 'f" x="-20%" y="-60%" width="140%" height="220%">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".02 .08" numOctaves="3" seed="' + Math.floor(r() * 90) + '"/><feDisplacementMap in="SourceGraphic" scale="' + f(h * 0.2) + '" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="3"/></filter></defs>' +
        '<g filter="url(#' + id + 'f)" fill="#fbf8ee" opacity=".75">' + puffs + "</g></svg>";
    }
    var n = 11 + Math.floor(r() * 6);
    for (var i = 0; i < n; i++) {
      var t = r(), bell = Math.sin(t * Math.PI), rad = h * (0.12 + bell * 0.3) * (0.7 + r() * 0.5);
      var cx = w * (0.1 + t * 0.8), cy = Math.max(rad + h * 0.06, base - rad * (0.35 + r() * 0.5) - bell * h * 0.12);
      shade += '<circle cx="' + f(cx) + '" cy="' + f(cy + rad * 0.12) + '" r="' + f(rad) + '"/>';
      puffs += '<circle cx="' + f(cx - rad * 0.06) + '" cy="' + f(cy - rad * 0.08) + '" r="' + f(rad * 0.94) + '"/>';
      if (bell > 0.35) core += '<circle cx="' + f(cx - rad * 0.2) + '" cy="' + f(cy - rad * 0.3) + '" r="' + f(rad * 0.55) + '"/>';
    }
    return '<svg viewBox="0 0 ' + w + " " + h + '" aria-hidden="true"><defs>' +
      '<clipPath id="' + id + 'b"><rect x="0" y="0" width="' + w + '" height="' + f(base + h * 0.04) + '"/></clipPath>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf5"/><stop offset=".7" stop-color="#eeeadb"/><stop offset="1" stop-color="#d9d9cc"/></linearGradient>' +
      '<filter id="' + id + 'f" x="-10%" y="-20%" width="120%" height="140%">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="4" seed="' + Math.floor(r() * 90) + '" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="' + f(h * 0.1) + '" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
        '<feGaussianBlur in="d" stdDeviation="1.6"/></filter></defs>' +
      '<g filter="url(#' + id + 'f)" clip-path="url(#' + id + 'b)">' +
        '<g fill="#c9cdc2" opacity=".9">' + shade + "</g>" +
        '<g fill="url(#' + id + 'g)">' + puffs + "</g>" +
        '<g fill="#fffef8" opacity=".75">' + core + "</g>" +
      "</g></svg>";
  }

  function grass(r, x, y, h, col, w) {
    var b = (r() - 0.5) * h * 0.6;
    return '<path d="M' + f(x) + " " + f(y) + "Q" + f(x + b * 0.4) + " " + f(y - h * 0.6) + " " + f(x + b) + " " + f(y - h) + '" stroke="' + col + '" stroke-width="' + f(w) + '" fill="none" stroke-linecap="round"/>';
  }
  function fern(r, x, y, len, ang, col) {
    var out = "", tx = x + Math.cos(ang) * len, ty = y + Math.sin(ang) * len;
    out += '<path d="M' + f(x) + " " + f(y) + "L" + f(tx) + " " + f(ty) + '" stroke="' + col + '" stroke-width="1.6"/>';
    for (var i = 1; i < 11; i++) {
      var t = i / 11, px = x + (tx - x) * t, py = y + (ty - y) * t, rx = len * 0.13 * (1 - t * 0.75);
      var deg = ang * 180 / Math.PI;
      out += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(rx) + '" ry="' + f(rx * 0.32) + '" transform="rotate(' + f(deg - 55) + " " + f(px) + " " + f(py) + ') translate(' + f(rx * 0.8) + ' 0)" fill="' + col + '"/>';
      out += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(rx) + '" ry="' + f(rx * 0.32) + '" transform="rotate(' + f(deg + 55) + " " + f(px) + " " + f(py) + ') translate(' + f(rx * 0.8) + ' 0)" fill="' + col + '"/>';
    }
    return out;
  }
  function fireweed(r, x, y, h) {
    var out = '<path d="M' + f(x) + " " + f(y) + "q" + f((r() - 0.5) * 8) + " " + f(-h / 2) + " " + f((r() - 0.5) * 6) + " " + f(-h) + '" stroke="#6b7f3f" stroke-width="2" fill="none"/>';
    for (var i = 0; i < 9; i++) {
      var t = 0.5 + i / 18, side = i % 2 ? 1 : -1;
      out += '<ellipse cx="' + f(x + side * (4 - i * 0.3)) + '" cy="' + f(y - h * t) + '" rx="' + f(4.2 - i * 0.28) + '" ry="' + f(2.8 - i * 0.15) + '" fill="' + (i % 3 ? "#c5446f" : "#dd6a93") + '"/>';
    }
    return out;
  }
  function bush(r, x, y, s, cols) {
    var out = "";
    for (var i = 0; i < 6; i++) out += '<circle cx="' + f(x + (r() - 0.5) * s * 1.6) + '" cy="' + f(y - r() * s * 0.8) + '" r="' + f(s * (0.35 + r() * 0.35)) + '" fill="' + pick(r, cols) + '"/>';
    return out;
  }
  function cloud(r, x, y, s, fill, shade) {
    var out = '<ellipse cx="' + f(x) + '" cy="' + f(y + s * 0.18) + '" rx="' + f(s * 1.3) + '" ry="' + f(s * 0.28) + '" fill="' + shade + '"/>';
    var n = 5 + Math.floor(r() * 3);
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1), cx = x - s * 1.1 + t * s * 2.2, rr = s * (0.28 + Math.sin(t * Math.PI) * 0.45) * (0.85 + r() * 0.3);
      out += '<circle cx="' + f(cx) + '" cy="' + f(y - rr * 0.35) + '" r="' + f(rr) + '" fill="' + fill + '"/>';
    }
    return out + '<rect x="' + f(x - s * 1.35) + '" y="' + f(y + s * 0.02) + '" width="' + f(s * 2.7) + '" height="' + f(s * 0.3) + '" fill="' + shade + '" opacity=".0"/>';
  }

  /* ── hero ──────────────────────────────────────────────── */
  var heroArt = $("[data-hero]");
  var heroLayers = [];
  if (heroArt) buildHero(heroArt);

  function buildHero(host) {
    var W = 1440, H = 900, r = rng(1991);
    var layers = [];

    // night sky: stars, some of them twinkling
    var stars = "";
    for (var i = 0; i < 150; i++) {
      var tw = r() < 0.3;
      stars += '<circle' + (tw ? ' class="tw" style="--d:' + f(2 + r() * 3) + "s;--dl:" + f(-r() * 4) + 's"' : "") + ' cx="' + f(r() * W) + '" cy="' + f(Math.pow(r(), 1.4) * 560) + '" r="' + f(0.5 + r() * 1.3) + '" fill="#fff" opacity="' + f(0.45 + r() * 0.55) + '"/>';
    }
    layers.push({ d: 0.02, par: "xMidYMin slice", body: '<g class="stars">' + stars + "</g>" });

    // the sun, and the moon waiting below the range to swap places with it
    layers.push({ d: 0.04, par: "xMidYMin slice", body: '<circle class="orb-anchor" cx="1090" cy="170" r="34" fill="none"/><g class="sun"><defs><radialGradient id="sg"><stop offset="0" stop-color="#fbeeb6"/><stop offset=".45" stop-color="#f7e7a3" stop-opacity=".55"/><stop offset="1" stop-color="#f7e7a3" stop-opacity="0"/></radialGradient></defs><circle cx="1090" cy="170" r="110" fill="url(#sg)"/><circle cx="1090" cy="170" r="30" fill="#f8e9ae"/></g>' +
      '<defs><radialGradient id="mg"><stop offset="0" stop-color="#f4f0dc" stop-opacity=".5"/><stop offset="1" stop-color="#f4f0dc" stop-opacity="0"/></radialGradient></defs>' +
      '<g class="moon"><circle cx="1090" cy="170" r="120" fill="url(#mg)"/><circle cx="1090" cy="170" r="34" fill="#efead6"/><circle cx="1079" cy="160" r="7" fill="#dcd6bf"/><circle cx="1100" cy="180" r="5" fill="#dcd6bf"/><circle cx="1096" cy="158" r="3" fill="#dcd6bf"/><circle cx="1076" cy="183" r="3.5" fill="#dcd6bf"/></g>' });

    // soft clouds drifting at the edges of the sky (zenwood-style), behind the name
    var cr = rng(7), soft = "";
    [[-6, 5, 21, 0.95], [-4, 50, 17, 0.85], [80, 15, 27, 0.97], [86, 43, 22, 0.9], [60, 9, 12, 0.85], [30, 11, 9, 0.8], [14, 17, 11, 0.8], [36, 20, 16, 0.8, true], [64, 26, 14, 0.75, true], [92, 4, 11, 0.85], [22, 2, 10, 0.8], [50, 13, 12, 0.7, true], [8, 30, 12, 0.85], [74, 6, 10, 0.8], [44, 2, 13, 0.85], [96, 26, 12, 0.85], [-4, 34, 13, 0.8], [58, 30, 13, 0.7, true], [26, 32, 11, 0.7, true]].forEach(function (c) {
      soft += '<div class="soft-cloud" style="left:' + c[0] + "%;top:" + c[1] + "%;width:" + c[2] + "%;--o:" + c[3] + ";--cd:" + f(60 + cr() * 50) + "s;--cdl:" + f(-cr() * 50) + 's">' + softCloud(cr, 600, 260, c[4]) + "</div>";
    });
    layers.push({ d: 0.07, html: soft });

    // the painted range (assets/hero-mountains.*): transparent sky, so our gradient and sun show through
    layers.push({ d: 0.2, html: '<img class="range" src="assets/hero-mountains.webp" srcset="assets/hero-mountains-1280.webp 1280w, assets/hero-mountains.webp 2048w" sizes="104vw" alt="" decoding="async" fetchpriority="high" />', mountains: true });

    layers.push({ d: 0.35, body: '<defs><filter id="mb" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="18"/></filter></defs><g class="mist" filter="url(#mb)"><ellipse cx="380" cy="760" rx="420" ry="36" fill="#f3f1e4" opacity=".45"/><ellipse cx="1120" cy="740" rx="360" ry="30" fill="#f3f1e4" opacity=".4"/></g>' });

    // forested foothills (assets/hero-hills.*): in front of the big range, behind the tall pines
    layers.push({ d: 0.4, html: '<img class="range hills" src="assets/hero-hills.webp" srcset="assets/hero-hills-1280.webp 1280w, assets/hero-hills.webp 2048w" sizes="104vw" alt="" decoding="async" fetchpriority="high" />' });

    // the painted forest (assets/hero-forest.*) sits in front and moves faster, like the near layer of a diorama
    layers.push({ d: 0.55, html: '<img class="range forest" src="assets/hero-forest.webp" srcset="assets/hero-forest-1280.webp 1280w, assets/hero-forest.webp 2048w" sizes="104vw" alt="" decoding="async" fetchpriority="high" />' });

    // the painted meadow (assets/hero-meadow.*) is the closest layer and moves the most
    layers.push({ d: 0.8, html: '<img class="range meadow" src="assets/hero-meadow.webp" srcset="assets/hero-meadow-1280.webp 1280w, assets/hero-meadow.webp 2048w" sizes="104vw" alt="" decoding="async" />' });

    var flock = [[1, 20, 29, 34, -7], [2, 15, 30.5, 34, -8.2], [3, 24, 32, 29, -19], [1, 13, 28, 43, -3], [2, 18, 31, 38, -26], [3, 14, 30, 36, -14], [1, 16, 29, 31, -22], [2, 12, 30, 40, -31], [3, 17, 31, 33, -2], [1, 11, 28, 45, -12]].map(function (b) {
      return '<img class="bird" src="assets/bird-' + b[0] + '.webp" alt="" style="--w:' + b[1] + "px;--y:" + b[2] + "%;--t:" + b[3] + "s;--dl:" + b[4] + 's" />';
    }).join("");
    var flies = "";
    for (var k = 0; k < 28; k++) {
      flies += '<i class="ff" style="left:' + f(3 + r() * 94) + "%;top:" + f(64 + r() * 32) + "%;--s:" + f(2.5 + r() * 2.5) + "px;--t:" + f(5 + r() * 7) + "s;--b:" + f(2 + r() * 3) + "s;--dl:" + f(-r() * 8) + "s;--dx:" + f((r() - 0.5) * 90) + "px;--dy:" + f((r() - 0.5) * 60) + 'px"></i>';
    }

    host.innerHTML = layers.map(function (l) {
      return '<div class="layer' + '" data-depth="' + l.d + '">' + (l.html || (l.body ? svg("0 0 " + W + " " + H, l.body, l.par) : "")) + "</div>";
    }).join("") + '<div class="flock">' + flock + '</div><div class="fireflies">' + flies + '</div><i class="shoot"></i>';
    heroLayers = $$(".layer", host);
  }


  /* ── intro: a cloud cover with five tiles, then the clouds part to reveal the hero ── */
  (function () {
    var root = document.documentElement, el = $("[data-intro]");
    if (!el || !root.classList.contains("intro-on")) return;
    var cl = $("[data-intro-clouds]", el), r = rng(2024), s = "";
    for (var k = 0; k < 22; k++) {
      var x = r() * 100, y = r() * 100, ang = Math.atan2(y - 50, x - 50);
      s += '<i style="--x:' + f(x) + "%;--y:" + f(y) + "%;--s:" + f(380 + r() * 520) + "px;--dx:" + f(Math.cos(ang) * (60 + r() * 50)) + "vw;--dy:" + f(Math.sin(ang) * (50 + r() * 40)) + "vh;--d:" + f(r() * .25) + 's"></i>';
    }
    cl.innerHTML = s;
    var done = false;
    function part() {
      if (done) return; done = true;
      try { sessionStorage.setItem("og-intro", "1"); } catch (e) {}
      el.classList.add("leaving");
      root.classList.remove("intro-on");
      document.dispatchEvent(new Event("intro:done"));
      setTimeout(function () { el.remove(); }, 1700);
    }
    el.addEventListener("click", part);
    window.addEventListener("keydown", part, { once: true });
    var t0 = Date.now();
    var ready = function () { setTimeout(part, Math.max(0, 2500 - (Date.now() - t0))); };
    if (document.readyState === "complete") ready(); else window.addEventListener("load", ready, { once: true });
    setTimeout(part, 5000);   // never hold anyone longer than this
  })();

  /* ── tagline: types itself out inside the braces, like a line of code ── */
  (function () {
    var tag = $(".hello-tag");
    if (!tag || reduceMotion) return;
    var parts = $$("span, em", tag), texts = parts.map(function (el) { return el.textContent; });
    parts.forEach(function (el) { el.textContent = ""; el.classList.add("typed-empty"); });
    var caret = document.createElement("i");
    caret.className = "type-caret"; caret.setAttribute("aria-hidden", "true");
    parts[0].parentNode.insertBefore(caret, parts[0]);
    var i = 0, n = 0;
    function step() {
      if (i >= parts.length) { caret.classList.add("rest"); return; }
      var el = parts[i], full = texts[i];
      if (n === 0) { el.classList.remove("typed-empty"); el.after(caret); }
      el.textContent = full.slice(0, ++n);
      if (n < full.length) setTimeout(step, 55 + Math.random() * 70);
      else { i++; n = 0; setTimeout(step, el.tagName === "EM" ? 90 : 260); }
    }
    // start once the tagline has risen in (and, on a first visit, once the clouds have parted)
    var go = function () { setTimeout(step, 2200); };
    if (document.documentElement.classList.contains("intro-on")) document.addEventListener("intro:done", go, { once: true }); else go();
  })();

  /* ── cal.com booking: loaded only when someone scrolls near it, themed with the page ── */
  (function () {
    var host = $("#cal-inline");
    if (!host) return;
    var loaded = false, NS = "30min";
    var theme = function () { return "dark"; };   // the calendar stays dark against the postcard, whatever the hour
    function load() {
      if (loaded) return; loaded = true;
      (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document;
        C.Cal = C.Cal || function () { var cal = C.Cal, ar = arguments;
          if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; }
          if (ar[0] === L) { var api = function () { p(api, arguments); }, namespace = ar[1]; api.q = api.q || [];
            if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; }
          p(cal, ar); };
      })(window, "https://app.cal.com/embed/embed.js", "init");
      // keep the placeholder over the card until cal.com's frame has actually drawn
      var skel = $(".cal-skel", host);
      if (skel) {
        var gone = function () { skel.classList.add("done"); setTimeout(function () { skel.remove(); }, 400); };
        new MutationObserver(function (m, mo) {
          var fr = host.querySelector("iframe");
          if (!fr) return;
          mo.disconnect(); fr.addEventListener("load", function () { setTimeout(gone, 350); }, { once: true });
          setTimeout(gone, 8000);
        }).observe(host, { childList: true, subtree: true });
      }
      Cal("init", NS, { origin: "https://cal.com" });
      Cal.ns[NS]("inline", { elementOrSelector: "#cal-inline", calLink: host.getAttribute("data-cal-link"), config: { layout: "month_view", theme: theme() } });
      Cal.ns[NS]("ui", { theme: theme(), hideEventTypeDetails: false, layout: "month_view",
        cssVarsPerTheme: { dark: { "cal-brand": "#d9a932" } } });
    }
    // warm it up early: in the background once the page has settled, straight away if someone heads for the contact section,
    // and as a last resort when it nears the viewport
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
    var soon = function () { idle(load, { timeout: 3000 }); };
    // load it in a quiet moment: some seconds after the page settles AND once the reader has stopped scrolling,
    // so its heavy frame never lands mid-scroll. hovering or clicking a contact link loads it at once.
    var lastScroll = Date.now(), armed = false;
    window.addEventListener("scroll", function () { lastScroll = Date.now(); }, { passive: true });
    var quiet = function () { if (loaded) return; if (Date.now() - lastScroll > 1500) load(); else setTimeout(quiet, 700); };
    var arm = function () { if (!armed) { armed = true; setTimeout(quiet, 5000); } };
    if (document.readyState === "complete") arm(); else window.addEventListener("load", arm, { once: true });
    $$('a[href="#book"]').forEach(function (a) { a.addEventListener("pointerenter", load, { once: true }); a.addEventListener("click", load); });
    if (location.hash === "#book") load();
    if ("IntersectionObserver" in window) {
      var cio2 = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { load(); cio2.disconnect(); } }, { rootMargin: "600px" });
      cio2.observe(host);
    } else load();
  })();

  /* postcard: copy the email address */
  $$(".pc-copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var done = function () { b.textContent = "copied ✓"; b.classList.add("ok"); setTimeout(function () { b.textContent = "copy"; b.classList.remove("ok"); }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(b.getAttribute("data-copy")).then(done, done); else done();
    });
  });

  /* ── ranger station bar: menu, active trail, morning / night ─ */
  var topbar = $("[data-topbar]"), menu = $("#menu"), menuBtn = $("[data-menu-toggle]"), dn = $("[data-daynight]");
  var barLinks = $$(".topbar a[data-sec]"), lastY = 0;
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "close menu" : "open menu");
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  $$(".menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) { if (topbar && !topbar.contains(e.target)) setMenu(false); });

  /* morning or night follows the visitor's clock; the toggle overrides it for this visit only */
  var clockTheme = function () { var h = new Date().getHours(); return h >= 7 && h < 19 ? "day" : "night"; };
  var manual = false;
  try { manual = !!sessionStorage.getItem("og-theme"); } catch (e) {}
  function paintTheme() {
    var night = document.documentElement.getAttribute("data-theme") === "night";
    if (dn) {
      var t = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      dn.setAttribute("aria-pressed", String(night));
      dn.setAttribute("aria-label", night ? "switch to morning" : "switch to night");
      dn.title = (manual ? "set by you" : "it's " + t + " where you are") + " · click for " + (night ? "morning" : "night");
    }
  }
  function setTheme(t) {
    if (document.documentElement.getAttribute("data-theme") === t) return;
    document.documentElement.setAttribute("data-theme", t);
    paintTheme();
  }
  paintTheme();
  if (dn) dn.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "night" ? "day" : "night";
    manual = next !== clockTheme();                     // flipping back to what the clock says hands control back to the clock
    try { if (manual) sessionStorage.setItem("og-theme", next); else sessionStorage.removeItem("og-theme"); } catch (e) {}
    setTheme(next);
  });
  // if someone is still here at 7am or 7pm, the sky turns with them
  setInterval(function () { if (!manual) setTheme(clockTheme()); }, 60000);

  function updateBar() {
    if (!topbar) return;
    var y = window.scrollY, open = menu && menu.classList.contains("open");
    if (!open && y > lastY + 6 && y > window.innerHeight * 0.6) topbar.classList.add("hide");
    else if (y < lastY - 6 || y < 120) topbar.classList.remove("hide");
    lastY = y;
    var cur = null, line = window.innerHeight * 0.35;
    barLinks.forEach(function (a) {
      var el = document.getElementById(a.getAttribute("data-sec"));
      if (el && el.getBoundingClientRect().top <= line) cur = a;
    });
    barLinks.forEach(function (a) { a.classList.toggle("here", a === cur); });
    if (!hoverLink) moveInd(menu && $(".menu a.here", menu));
  }

  /* the dashed trail marker slides to whichever link you point at, then back to the current section */
  var ind = $(".trail-ind"), hoverLink = null;
  function moveInd(a) {
    if (!ind) return;
    if (!a) { ind.classList.remove("show"); return; }
    ind.style.width = (a.offsetWidth - 30) + "px";
    ind.style.transform = "translateX(" + (a.offsetLeft + 15) + "px)";
    ind.classList.add("show");
  }
  $$(".menu > a").forEach(function (a) {
    a.addEventListener("mouseenter", function () { hoverLink = a; moveInd(a); });
    a.addEventListener("focus", function () { hoverLink = a; moveInd(a); });
    a.addEventListener("blur", function () { hoverLink = null; moveInd($(".menu a.here")); });
  });
  if (menu) menu.addEventListener("mouseleave", function () { hoverLink = null; moveInd($(".menu a.here", menu)); });

  /* ── the ridge as a dataset: a fitted curve, extrema and a gradient-descent walk ─────
     RIDGE is the mountain painting's skyline: the first solid row in each 8px column
     of the 2048×1152 image. Everything below is computed from it, so it lines up with
     the painting at any screen size.                                                   */
  var RIDGE = [668,670,671,671,666,660,657,657,654,657,656,649,640,631,628,628,623,616,609,609,603,595,590,595,596,588,576,568,556,556,544,536,529,508,499,490,487,478,469,476,477,485,501,508,521,534,543,554,564,564,570,575,575,578,577,582,589,594,603,612,613,613,608,604,595,589,581,568,561,559,569,581,587,599,604,609,610,607,591,588,578,569,568,569,557,546,539,539,537,522,517,511,494,485,467,455,447,460,467,467,479,486,499,511,517,515,499,489,474,470,463,456,439,426,424,428,428,418,403,401,388,373,365,353,363,368,365,371,377,381,388,401,407,420,423,423,435,454,457,466,468,478,479,469,455,443,435,426,413,407,410,412,419,423,428,427,424,420,422,435,445,451,459,467,480,486,495,508,517,527,530,536,543,549,551,564,568,564,552,550,561,567,574,584,583,579,573,568,563,558,546,534,521,514,522,527,532,532,537,549,552,558,563,574,579,584,588,590,589,583,576,567,557,552,556,558,558,557,555,551,547,541,529,516,513,501,495,486,472,463,463,454,453,465,471,480,479,483,492,505,511,520,531,539,545,551,556,554,556,563,569,575,580,581,589,597];
  var IMG_W = 2048, IMG_H = 1152, STEP = 8;
  var mtImg = $('.layer img.range[src*="hero-mountains"]'), mtLayer = mtImg && mtImg.parentNode, dsSvg = null;
  function smoothArr(a, w) {
    return a.map(function (_, i) { var s = 0, n = 0; for (var j = i - w; j <= i + w; j++) if (j >= 0 && j < a.length) { s += a[j]; n++; } return s / n; });
  }
  function buildRidgeDS() {
    if (!mtLayer || !mtImg.offsetHeight) return;
    var Lw = mtLayer.offsetWidth, Lh = mtLayer.offsetHeight, Ih = mtImg.offsetHeight;
    var k = Math.max(Lw / IMG_W, Ih / IMG_H), offX = (Lw - IMG_W * k) / 2, imgTop = Lh - IMG_H * k;
    var lb = mtLayer.getBoundingClientRect(), hero = $(".hero").getBoundingClientRect();
    var vw = hero.width, dx = lb.left - hero.left, dy = lb.top - hero.top;
    var X = function (i) { return offX + (i * STEP + 4) * k; }, Y = function (y) { return imgTop + y * k; };
    var i0 = Math.max(2, Math.ceil(((-dx + 40) - offX) / k / STEP)), i1 = Math.min(RIDGE.length - 3, Math.floor(((vw - dx - 40) - offX) / k / STEP));
    var sm = smoothArr(RIDGE, 2);
    var hr = $("[data-hello]").getBoundingClientRect();
    var nameBox = [hr.left - lb.left - 30, hr.top - lb.top - 24, hr.right - lb.left + 30, hr.bottom - lb.top + 20];
    // keep leaders and labels off the sun / moon disc too
    var orb = $(".hero-art .orb-anchor"), orbBox = null;
    if (orb) { var ob = orb.getBoundingClientRect(), pad = ob.width * 0.9; orbBox = [ob.left - lb.left - pad, ob.top - lb.top - pad, ob.right - lb.left + pad, ob.bottom - lb.top + pad]; }

    // extrema of the lightly smoothed skyline
    var peaks = [], R = 10, i, j;
    for (i = i0 + 2; i <= i1 - 2; i++) {
      var ok = true;
      for (j = Math.max(i0, i - R); j <= Math.min(i1, i + R); j++) if (sm[j] < sm[i] || (sm[j] === sm[i] && j < i)) { ok = false; break; }
      if (ok) peaks.push(i);
    }
    if (!peaks.length) return;
    var g = peaks.reduce(function (m, q) { return sm[q] < sm[m] ? q : m; }, peaks[0]);
    var valleys = [];
    for (var p = 0; p < peaks.length - 1; p++) {
      var v = peaks[p];
      for (j = peaks[p]; j <= peaks[p + 1]; j++) if (sm[j] > sm[v]) v = j;
      valleys.push({ i: v, depth: sm[v] - Math.max(sm[peaks[p]], sm[peaks[p + 1]]), nextToG: peaks[p] === g || peaks[p + 1] === g });
    }

    // candidates, highest priority first; every one is written as a tiny code snippet + comment
    var cands = [{ i: g, fn: "argmax", arg: "(f)", cm: "global optimum", key: true }];
    var peakCode = [["hill_climb", "()", "local optimum"], ["find_peak", "(arr)", "O(log n)"], ["greedy", ".step()", "local optimum"], ["beam_search", "(k=3)", "best so far"], ["anneal", "(T=0.5)", "escapes?"]];
    // every other peak, left to right, so the rightmost ones are always considered before the extras
    peaks.filter(function (q) { return q !== g; }).sort(function (a, b) { return a - b; }).forEach(function (q, n) {
      var pc = peakCode[n % peakCode.length]; cands.push({ i: q, fn: pc[0], arg: pc[1], cm: pc[2] });
    });
    var col = valleys.filter(function (v) { return v.nextToG && v.depth > 20; }).sort(function (a, b) { return b.depth - a.depth; })[0];
    var low = valleys.filter(function (v) { return v !== col && v.depth > 30; }).sort(function (a, b) { return b.depth - a.depth; })[0];
    if (low) cands.push({ i: low.i, fn: "gd.fit", arg: "(lr=.1)", cm: "converged ✓", gd: true, key: true });

    // each chip sits just above its own point; if it would collide, it steps up a little, else it is skipped
    var CW = 6.3, used = [], picked = [], maxN = vw < 700 ? 3 : vw < 1100 ? 5 : 8;
    var hit = function (b, o) { return b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]; };
    cands.forEach(function (c) {
      if (picked.length >= maxN) return;
      var x = X(c.i), y = Y(sm[c.i]) - 4;
      var w = Math.max((c.fn + c.arg).length, c.cm.length + 2) * CW + 18, h = 34;
      var ed0 = vw > 900 ? vw * 0.07 : 12, cx = Math.max(-dx + ed0 + w / 2, Math.min(vw - dx - ed0 - w / 2, x));   // chip slides in at the screen edges
      // positions to try: above at three heights, then beside the point on the right, then on the left
      var spots = [0, 1, 2].map(function (lift) { var bt = y - 16 - lift * 30; return { box: [cx - w / 2, bt - h, cx + w / 2, bt], stem: [x - 2, bt, x + 2, y] }; });
      spots.push({ box: [x + 16, y - h / 2 - 6, x + 16 + w, y + h / 2 - 6], side: 1 });
      spots.push({ box: [x - 16 - w, y - h / 2 - 6, x - 16, y + h / 2 - 6], side: -1 });
      for (var si = 0; si < spots.length; si++) {
        var box = spots[si].box, stem = spots[si].stem || [Math.min(x, box[0]), y - 1, Math.max(x, box[2]), y + 1];
        var edge = vw > 900 ? vw * 0.07 : 10;   // the tall foreground pines stand at the edges
        if (box[1] < 96 - dy || box[0] < -dx + edge || box[2] > vw - dx - edge) continue;
        if (hit(box, nameBox) || hit(stem, nameBox)) continue;
        if (orbBox && hit(box, orbBox)) continue;
        if (used.some(function (u) { return hit([box[0] - 10, box[1] - 8, box[2] + 10, box[3] + 8], u); })) continue;
        used.push(box); picked.push({ x: x, y: y, cx: cx, box: box, c: c, side: spots[si].side || 0 });
        return;
      }
    });
    var out = picked.sort(function (a, b) { return a.x - b.x; }).map(function (q, n) {
      var b = q.box, c = q.c, tx = b[0] + 9;
      return '<g style="--d:' + f(2.1 + n * 0.14) + 's">' +
        (q.side ? '<line class="lead" x1="' + f(q.side > 0 ? b[0] : b[2]) + '" y1="' + f(q.y) + '" x2="' + f(q.x + q.side * 5) + '" y2="' + f(q.y) + '"/>'
                : '<line class="lead" x1="' + f(q.x) + '" y1="' + f(b[3]) + '" x2="' + f(q.x) + '" y2="' + f(q.y - 5) + '"/>') +
        '<rect class="chip" x="' + f(b[0]) + '" y="' + f(b[1]) + '" width="' + f(b[2] - b[0]) + '" height="' + f(b[3] - b[1]) + '" rx="4"/>' +
        '<text class="code" x="' + f(tx) + '" y="' + f(b[1] + 14) + '"><tspan class="fn' + (c.key ? " key" : "") + '">' + c.fn + '</tspan><tspan class="arg">' + c.arg + "</tspan></text>" +
        '<text class="code cm" x="' + f(tx) + '" y="' + f(b[1] + 27) + '"># ' + c.cm + "</text>" +
        '<circle class="pt' + (c.key ? " key" : "") + '" cx="' + f(q.x) + '" cy="' + f(q.y) + '" r="4"/><circle class="pt-core" cx="' + f(q.x) + '" cy="' + f(q.y) + '" r="1.3"/></g>';
    });
    // gradient descent: shrinking steps from the neighbouring peak down into the minimum it converges to
    var gdPick = picked.filter(function (q) { return q.c.gd; })[0];
    if (gdPick) {
      var vi = gdPick.c.i, from = null;
      peaks.forEach(function (q) { if (q !== g && Math.abs(q - vi) < 40 && (from === null || Math.abs(q - vi) < Math.abs(from - vi))) from = q; });
      if (from === null) from = peaks.reduce(function (m, q) { return Math.abs(q - vi) < Math.abs(m - vi) ? q : m; }, peaks[0]);
      var fr = [0, .36, .6, .76, .86, .92, .96, .985], trail = "";
      fr.forEach(function (t, n) {
        var ii = Math.round(from + (vi - from) * t), px = X(ii), py = Y(sm[ii]) - 5;
        if (px > nameBox[0] && px < nameBox[2] && py > nameBox[1]) return;
        if (used.some(function (u) { return px > u[0] - 6 && px < u[2] + 6 && py > u[1] - 6 && py < u[3] + 6; })) return;
        trail += '<circle class="gd-dot" cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(2.4 - n * 0.14) + '" style="--dd:' + f(2.9 + n * 0.14) + 's"/>';
      });
      out.push('<g class="gd" style="--d:2.8s">' + trail + "</g>");
    }
    // the fitted skyline, barely there
    var fit = smoothArr(RIDGE, 11), fd = "";
    for (i = i0; i <= i1; i++) fd += (i === i0 ? "M" : "L") + f(X(i)) + " " + f(Y(fit[i]) - 10);
    // the fitted line is masked out wherever a chip sits, so the two never cross
    var holes = used.map(function (u) { return '<rect x="' + f(u[0] - 6) + '" y="' + f(u[1] - 6) + '" width="' + f(u[2] - u[0] + 12) + '" height="' + f(u[3] - u[1] + 12) + '" fill="#000"/>'; }).join("");
    out.unshift('<defs><mask id="fit-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="' + Lw + '" height="' + Lh + '"><rect width="' + Lw + '" height="' + Lh + '" fill="#fff"/>' + holes + '</mask></defs>' +
      '<g style="--d:1.9s"><path class="fit" mask="url(#fit-mask)" d="' + fd + '"/></g>');
    if (!dsSvg) { dsSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); dsSvg.setAttribute("class", "ridge-ds"); dsSvg.setAttribute("aria-hidden", "true"); mtLayer.appendChild(dsSvg); }
    dsSvg.setAttribute("viewBox", "0 0 " + Lw + " " + Lh);
    dsSvg.innerHTML = out.join("");
    clearAround(used.map(function (u) { return [u[0] + lb.left, u[1] + lb.top, u[2] + lb.left, u[3] + lb.top]; }));
  }
  /* keep the drifting clouds and the flock out of the chips' way */
  function clearAround(chips) {
    var hit = function (a, b) { return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]; };
    var drift = window.innerWidth * 0.03 + 8;           // clouds sway ±3vw
    $$(".soft-cloud").forEach(function (c) {
      c.classList.remove("yield");
      var r = c.getBoundingClientRect(), core = [r.left - drift, r.top + r.height * 0.1, r.right + drift, r.top + r.height * 0.8];
      if (chips.some(function (ch) { return hit(core, ch); })) c.classList.add("yield");
    });
    var flock = $(".flock");
    if (!flock || !chips.length) return;
    // measure the nav where it rests, not mid-entrance: offsets ignore transforms
    var hero = $(".hero").getBoundingClientRect(), pill = $(".pill"), tb = $(".topbar");
    var bar = pill ? tb.offsetTop + pill.offsetTop + pill.offsetHeight : 70;
    var top = Math.min.apply(null, chips.map(function (ch) { return ch[1]; }));
    // each bird's sprite is 1.53× as tall as it is wide (wing sweep); fit every bird wholly between nav and chips
    var lo = bar + 6 - hero.top, hi = top - 6 - hero.top, birds = $$(".bird", flock);
    var tallest = Math.max.apply(null, birds.map(function (b) { return parseFloat(b.style.getPropertyValue("--w")) * 1.53; }));
    var roomy = hi - lo > tallest + 26;                              // room for the ±12px bob?
    flock.classList.toggle("flat", !roomy);
    birds.forEach(function (b, i) {
      var h = parseFloat(b.style.getPropertyValue("--w")) * 1.53 + (roomy ? 24 : 0), span = hi - lo - h;
      if (span >= 0) { b.style.display = ""; b.style.top = f(lo + (roomy ? 12 : 0) + span * ((i * 0.37) % 1)) + "px"; }
      else { b.style.display = "none"; }                              // too big for the gap on this screen
    });
  }

  var dsTimer;
  var dsGo = function () { buildRidgeDS(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(dsGo, 60); });
  window.addEventListener("load", dsGo);
  window.addEventListener("resize", function () { clearTimeout(dsTimer); dsTimer = setTimeout(dsGo, 150); });

  var mouse = { x: 0, y: 0 };
  if (canHover && !reduceMotion) {
    window.addEventListener("pointermove", function (e) {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
      requestTick();
    }, { passive: true });
  }

  /* ── torn paper edges: soft rolling rips with rough fibres, never a regular zigzag ── */
  function noise1(r, knots) {
    var v = []; for (var i = 0; i <= knots + 1; i++) v.push(r() * 2 - 1);
    return function (t) {   // t in 0..1, smooth cosine interpolation between random knots
      var x = t * knots, i = Math.floor(x), fr = x - i, w = (1 - Math.cos(fr * Math.PI)) / 2;
      return v[i] * (1 - w) + v[i + 1] * w;
    };
  }
  $$("[data-tear]").forEach(function (el, idx) {
    var r = rng(311 + idx * 97), W = 1440, H = 70, top = el.getAttribute("data-tear") === "top";
    var big = noise1(r, 4 + Math.floor(r() * 3)), mid = noise1(r, 20);
    // same gentle overall line as before; all the extra wildness lives at small scale
    var pts = [], walk = 0, x = 0;
    while (x <= W) {
      walk = walk * 0.45 + (r() - 0.5) * 7;                        // fast, choppy random walk
      var y = 38 + 11 * big(x / W) + 4 * mid(x / W) + walk + (r() - 0.5) * 3;
      if (r() < 0.035) {                                            // a loose fibre sticking out or a tiny nick
        var w = 1.5 + r() * 3, hgt = (r() < 0.6 ? -1 : 1) * (2 + r() * 4.5);
        pts.push([Math.min(x, W), y]); pts.push([Math.min(x + w / 2, W), y + hgt]); x += w;
      }
      pts.push([Math.min(x, W), Math.max(6, Math.min(H - 8, y))]);
      x += 0.8 + r() * 1.6;
    }
    if (pts[pts.length - 1][0] < W) pts.push([W, pts[pts.length - 1][1]]);
    var flip = function (y) { return top ? H - y : y; };
    var path = function (off, jit) {
      return pts.map(function (p) { return f(p[0]) + " " + f(flip(p[1] + off(p[0]) + (jit ? (r() - 0.5) * jit : 0))); }).join("L");
    };
    var close = top ? "L" + W + " 0L0 0Z" : "L" + W + " " + H + "L0 " + H + "Z";
    var fringeW = noise1(r, 30);
    var paper = "M" + path(function () { return 0; }) + close;
    // the torn core of the paper shows as a pale, uneven band just beyond the coloured face
    var fibre = "M" + path(function (px) { return -(2.5 + 3 * Math.abs(fringeW(px / W))); }, 4.5) + close;
    var shade = "M" + path(function () { return -1; }) + close;
    // data-cut: rip the section above along this edge instead of painting its colour, so its own texture runs to the tear
    var cut = el.getAttribute("data-cut") && document.getElementById(el.getAttribute("data-cut"));
    if (cut) {
      // no paper is painted over a cut edge, so the fibre must be a thin band along the rip, not a fill
      var off = function (px) { return -(2.5 + 3 * Math.abs(fringeW(px / W))); };
      var fwd = pts.map(function (p) { return [p[0], flip(p[1] + off(p[0]) + (r() - .5) * 4.5)]; });
      var back = pts.slice().reverse().map(function (p) { return [p[0], flip(p[1])]; });
      fibre = "M" + fwd.concat(back).map(function (p) { return f(p[0]) + " " + f(p[1]); }).join("L") + "Z";
      shade = fibre;
    }
    if (cut) {
      var m = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none"><path d="' + paper + '"/></svg>') +
        '") left bottom / 100% var(--tear-h) no-repeat, linear-gradient(#000 0 0) left top / 100% calc(100% - var(--tear-h) + 1px) no-repeat';
      cut.style.webkitMask = m; cut.style.mask = m;
    }
    el.innerHTML = svg("0 0 " + W + " " + H,
      '<defs><filter id="tsh' + idx + '" x="-2%" y="-40%" width="104%" height="180%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>' +
      '<path d="' + shade + '" fill="#000" opacity=".22" filter="url(#tsh' + idx + ')" transform="translate(0 ' + (top ? 2.5 : -2.5) + ')"/>' +
      '<path d="' + fibre + '" style="fill:var(--fiber)"/>' +
      (cut ? "" : '<path d="' + paper + '" fill="currentColor"/>'), "none");
  });

  /* ── reveal on scroll ──────────────────────────────────── */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else $$(".reveal").forEach(function (el) { el.classList.add("in"); });

  /* ── park galleries ────────────────────────────────────── */
  var BIOMES = {
    forest: { sky: ["#cddfd5", "#f2e9d0"], sun: false, cloud: ["#fbf5e4", "#e7dcc2"], sea: "#8db2bc",
      ridges: [{ y: 240, amp: 90, col: "#a3b6ab", snow: "#eef2ee" }, { y: 290, amp: 60, col: "#7f9885" }],
      rows: [{ y: 330, h: [40, 70], c: ["#5d7a5f", "#4f6b52"], n: 26 }, { y: 400, h: [80, 140], c: ["#3f5e43", "#34503a"], n: 12 }], ground: "#52703f" },
    prairie: { sky: ["#f4dca0", "#f6eed6"], sun: "#fbe7a1", cloud: ["#fdf6e4", "#efdcb4"],
      soft: [{ y: 300, amp: 26, col: "#c7b389" }, { y: 330, amp: 20, col: "#b99f62" }], fields: ["#d9b85c", "#e7c979", "#c9a34a", "#dcc070"], ground: "#c9a34a" },
    desert: { sky: ["#efcd92", "#f7ead0"], sun: "#fbe4a0", cloud: ["#fdf3e0", "#efd3aa"],
      mesas: [{ y: 270, col: "#d19a70" }, { y: 320, col: "#b95a31" }], ground: "#c46a3a" },
    coast: { sky: ["#d3e2e6", "#f3ead2"], sun: false, cloud: ["#fbf6ea", "#dfdcce"],
      ridges: [{ y: 250, amp: 70, col: "#a8b7b9" }], sea: "#6d97a7", dune: "#e2ce9b", ground: "#d9c28a" },
    alpine: { sky: ["#d2e2ec", "#f3f0e8"], sun: false, cloud: ["#fbfbf8", "#dde3e6"],
      ridges: [{ y: 220, amp: 130, col: "#b8c6d2", snow: "#f7f9fa" }, { y: 290, amp: 90, col: "#8ea1b2", snow: "#f2f5f7" }],
      rows: [{ y: 380, h: [60, 100], c: ["#2f4a3d", "#263e33"], n: 14, snowy: true }], ground: "#eef2f4" }
  };

  function scene(key, seed) {
    var B = BIOMES[key], r = rng(seed), W = 800, H = 500;
    var s = '<defs><linearGradient id="sky' + seed + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + B.sky[0] + '"/><stop offset="1" stop-color="' + B.sky[1] + '"/></linearGradient></defs><rect width="800" height="500" fill="url(#sky' + seed + ')"/>';
    if (B.sun) s += '<circle cx="' + f(520 + r() * 200) + '" cy="80" r="34" fill="' + B.sun + '"/>';
    for (var c = 0; c < 3; c++) s += cloud(r, 80 + c * 260 + r() * 80, 70 + r() * 70, 40 + r() * 30, B.cloud[0], B.cloud[1]);
    (B.ridges || []).forEach(function (R) {
      var line = jagged(r, 0, R.y + r() * 30, W, R.y + r() * 30, R.amp, 0.55, 6);
      if (R.snow) {
        s += '<path d="' + poly([[0, H]].concat(line).concat([[W, H]])) + '" fill="' + R.snow + '"/>';
        var low = line.map(function (p) { return [p[0], p[1] + 24 + r() * 26]; });
        s += '<path d="' + poly([[0, H]].concat(low).concat([[W, H]])) + '" fill="' + R.col + '"/>';
      } else s += '<path d="' + poly([[0, H]].concat(line).concat([[W, H]])) + '" fill="' + R.col + '"/>';
    });
    (B.soft || []).forEach(function (R) {
      var pts = [[0, H]], ph = r() * 6;
      for (var x = 0; x <= W; x += 20) pts.push([x, R.y + Math.sin(x / 120 + ph) * R.amp + Math.sin(x / 47 + ph * 2) * R.amp * 0.3]);
      pts.push([W, H]); s += '<path d="' + poly(pts) + '" fill="' + R.col + '"/>';
    });
    (B.mesas || []).forEach(function (R, i) {
      var pts = [[0, H]], x = 0, y = R.y;
      while (x < W) {
        var plateau = 60 + r() * 140, cliff = 8 + r() * 14, ny = R.y + (r() - 0.4) * 70;
        pts.push([x, y], [x + plateau, y + (r() - 0.5) * 4]);
        x += plateau; pts.push([x + cliff, ny]); x += cliff; y = ny;
      }
      pts.push([W, y], [W, H]);
      s += '<path d="' + poly(pts) + '" fill="' + R.col + '"/>';
      if (i === 1) for (var st = 0; st < 30; st++) { var sy = R.y + 10 + r() * 60; s += '<path d="M' + f(r() * W) + " " + f(sy) + "h" + f(20 + r() * 60) + '" stroke="#9c4623" stroke-width="2" opacity=".5"/>'; }
    });
    if (B.sea) s += '<rect y="' + (key === "forest" ? 318 : 300) + '" width="800" height="120" fill="' + B.sea + '"/>' + (function () { var l = ""; for (var w = 0; w < 14; w++) l += '<path d="M' + f(r() * W) + " " + f(310 + r() * 90) + "h" + f(20 + r() * 50) + '" stroke="#fff" stroke-width="2" opacity=".45"/>'; return l; })();
    if (B.dune) s += '<path d="' + poly([[0, H], [0, 370]].concat(jagged(r, 0, 370, W, 380, 30, 0.5, 5)).concat([[W, H]])) + '" fill="' + B.dune + '"/>';
    if (B.fields) {
      for (var fl = 0; fl < 4; fl++) {
        var y0 = 340 + fl * 40;
        s += '<path d="' + poly([[0, H], [0, y0]].concat(jagged(r, 0, y0, W, y0 + 10, 16, 0.5, 4)).concat([[W, H]])) + '" fill="' + B.fields[fl] + '"/>';
      }
      s += '<g transform="translate(' + f(560 + r() * 120) + ' 318)"><rect x="-22" y="-26" width="44" height="30" fill="#a8412c"/><path d="M-26-26L0-46L26-26Z" fill="#7d2f20"/><rect x="-6" y="-12" width="12" height="16" fill="#f3e6c8"/></g>';
      for (var tr = 0; tr < 5; tr++) s += bush(r, 80 + r() * 640, 332, 12, ["#6f7d3e", "#86924a"]);
    }
    if (B.mesas) {
      s += '<rect y="400" width="800" height="100" fill="' + B.ground + '"/>';
      for (var jn = 0; jn < 7; jn++) s += bush(r, r() * W, 408 + r() * 30, 14 + r() * 10, ["#5e6b3a", "#6f7c45", "#4f5b30"]);
    }
    (B.rows || []).forEach(function (R) {
      for (var n = 0; n < R.n; n++) {
        var px = r() * W, h = R.h[0] + r() * (R.h[1] - R.h[0]);
        s += pine(r, px, R.y + r() * 20, h, R.c[0], R.c[1]);
        if (R.snowy) s += '<path d="M' + f(px) + " " + f(R.y - h * 0.9) + "l" + f(h * 0.08) + " " + f(h * 0.15) + "h" + f(-h * 0.16) + 'Z" fill="#fff" opacity=".9"/>';
      }
    });
    if (B.ground && !B.mesas && !B.fields) s += '<path d="' + poly([[0, H]].concat(jagged(r, 0, 430, W, 440, 20, 0.5, 5)).concat([[W, H]])) + '" fill="' + B.ground + '"/>';
    return svg("0 0 800 500", s, "xMidYMid slice");
  }

  function foreground(key, seed) {
    var r = rng(seed * 7 + 3), W = 800, H = 230, s = "";
    function rocks(n, cols, y, sz) {
      for (var i = 0; i < n; i++) {
        var x = r() * W, w = sz * (0.6 + r()), h = w * (0.5 + r() * 0.3), c = pick(r, cols);
        s += '<path d="M' + f(x - w) + " " + f(y) + "Q" + f(x - w * 0.9) + " " + f(y - h) + " " + f(x) + " " + f(y - h) + "Q" + f(x + w * 0.9) + " " + f(y - h * 0.9) + " " + f(x + w) + " " + f(y) + 'Z" fill="' + c + '"/><path d="M' + f(x - w * 0.5) + " " + f(y - h * 0.8) + "Q" + f(x) + " " + f(y - h * 1.02) + " " + f(x + w * 0.6) + " " + f(y - h * 0.75) + '" stroke="#fff" stroke-width="2" opacity=".25" fill="none"/>';
      }
    }
    if (key === "forest") {
      s += '<path d="M0 230L0 190Q200 170 400 188T800 184L800 230Z" fill="#3f5a36"/>';
      rocks(4, ["#8d8a7c", "#9c9888", "#7c7a6e"], 226, 34);
      for (var i = 0; i < 22; i++) s += fern(r, r() * W, 230, 40 + r() * 40, -Math.PI / 2 + (r() - 0.5) * 1.4, pick(r, ["#4f7a3b", "#5d8a44"]));
      for (var g = 0; g < 160; g++) s += grass(r, r() * W, 230, 20 + r() * 50, pick(r, ["#5d7d3f", "#7a9a4d", "#8fa860"]), 1.5 + r() * 1.5);
      for (var fw = 0; fw < 6; fw++) s += fireweed(r, r() * W, 230, 60 + r() * 40);
    } else if (key === "prairie") {
      s += '<path d="M0 230L0 196Q200 184 400 194T800 190L800 230Z" fill="#b8913c"/>';
      for (var w = 0; w < 70; w++) {
        var x = r() * W, h = 60 + r() * 80;
        s += grass(r, x, 230, h, "#b28a37", 1.8);
        s += '<ellipse cx="' + f(x + (r() - 0.5) * 6) + '" cy="' + f(230 - h) + '" rx="3.2" ry="11" fill="' + pick(r, ["#e0b24b", "#d49f36", "#ecc466"]) + '" transform="rotate(' + f((r() - 0.5) * 30) + " " + f(x) + " " + f(230 - h) + ')"/>';
      }
      for (var gg = 0; gg < 120; gg++) s += grass(r, r() * W, 230, 20 + r() * 40, pick(r, ["#9aa04e", "#b8a14f", "#8c8f44"]), 1.5);
    } else if (key === "desert") {
      s += '<path d="M0 230L0 200Q200 188 400 198T800 192L800 230Z" fill="#b8582d"/>';
      rocks(6, ["#c0643a", "#a8512b", "#d0784a"], 228, 36);
      for (var a = 0; a < 5; a++) {
        var ax = r() * W, out = "";
        for (var l = 0; l < 14; l++) { var ang = -Math.PI / 2 + (l / 13 - 0.5) * 2.4, len = 40 + r() * 40; out += '<path d="M' + f(ax) + " 228Q" + f(ax + Math.cos(ang) * len * 0.5) + " " + f(228 + Math.sin(ang) * len * 0.6) + " " + f(ax + Math.cos(ang) * len) + " " + f(228 + Math.sin(ang) * len) + '" stroke="' + pick(r, ["#6d7a4c", "#7f8c58", "#5e6b40"]) + '" stroke-width="5" stroke-linecap="round" fill="none"/>'; }
        s += out;
      }
      for (var sb = 0; sb < 12; sb++) s += bush(r, r() * W, 228, 16 + r() * 12, ["#9aa27a", "#aab08a", "#8a9468"]);
    } else if (key === "coast") {
      s += '<path d="M0 230L0 192Q200 176 400 190T800 186L800 230Z" fill="#d6be86"/>';
      rocks(4, ["#8f8b80", "#a19c8f"], 228, 30);
      for (var dg = 0; dg < 150; dg++) s += grass(r, r() * W, 230, 30 + r() * 70, pick(r, ["#b9a36a", "#a58f55", "#c9b57c", "#8f8c55"]), 1.6);
    } else if (key === "alpine") {
      s += '<path d="M0 230L0 188Q200 170 400 186T800 182L800 230Z" fill="#f4f6f7"/>';
      rocks(5, ["#7d8690", "#8f98a1", "#6c747d"], 226, 36);
      for (var sr = 0; sr < 6; sr++) { var rx = r() * W; s += '<path d="M' + f(rx - 30) + " 206q30-26 60 0z" + '" fill="#fff"/>'; }
      for (var fi = 0; fi < 5; fi++) s += pine(r, r() * W, 232, 70 + r() * 60, "#2f4a3d", "#263e33");
      for (var ag = 0; ag < 60; ag++) s += grass(r, r() * W, 230, 14 + r() * 24, pick(r, ["#8a8f6a", "#a5a47c"]), 1.4);
    }
    return svg("0 0 800 230", s, "xMidYMax slice");
  }

  /* tiny chart helpers for the ui mocks */
  function series(r, n, start, drift, noise) {
    var v = start, out = [];
    for (var i = 0; i < n; i++) { v += drift + (r() - 0.5) * noise; out.push(v); }
    return out;
  }
  function lineChart(sets, opt) {
    opt = opt || {};
    var W = 300, H = opt.h || 110, all = [].concat.apply([], sets.map(function (s) { return s.v; }));
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), g = "";
    for (var gy = 0; gy < 4; gy++) g += '<path d="M0 ' + f(10 + gy * (H - 20) / 3) + 'H300" stroke="#eeece6" stroke-width="1"/>';
    sets.forEach(function (s) {
      var d = s.v.map(function (v, i) { return (i ? "L" : "M") + f(i / (s.v.length - 1) * (W - 4) + 2) + " " + f(H - 8 - (v - lo) / (hi - lo || 1) * (H - 20)); }).join("");
      if (s.area) g += '<path d="' + d + "L" + (W - 2) + " " + H + "L2 " + H + 'Z" fill="' + s.c + '" opacity=".12"/>';
      g += '<path d="' + d + '" fill="none" stroke="' + s.c + '" stroke-width="' + (s.w || 2) + '"' + (s.dash ? ' stroke-dasharray="5 4"' : "") + ' stroke-linejoin="round"/>';
    });
    return '<svg viewBox="0 0 ' + W + " " + H + '">' + g + (opt.extra || "") + "</svg>";
  }
  function bars(vals, cols, opt) {
    opt = opt || {};
    var W = 300, H = opt.h || 110, n = vals.length, bw = W / n * 0.62, g = "", mx = Math.max.apply(null, vals.map(function (v) { return Array.isArray(v) ? v.reduce(function (a, b) { return a + b; }, 0) : v; }));
    vals.forEach(function (v, i) {
      var x = i * W / n + (W / n - bw) / 2, stack = Array.isArray(v) ? v : [v], y = H - 4;
      stack.forEach(function (sv, k) { var h = sv / mx * (H - 16); y -= h; g += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(bw) + '" height="' + f(h) + '" rx="2" fill="' + (Array.isArray(cols[0]) ? cols[i][k] : cols[k % cols.length]) + '"/>'; });
    });
    return '<svg viewBox="0 0 ' + W + " " + H + '">' + g + '<path d="M0 ' + (H - 3) + 'H300" stroke="#e2dfd6"/></svg>';
  }
  function grid(r, cols, rows, palette) {
    var g = "", cw = 300 / cols, ch = 150 / rows;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var v = (Math.sin(x / 2.2 + y / 3) + 1) / 2 * 0.7 + r() * 0.3;
      g += '<rect x="' + f(x * cw + 1) + '" y="' + f(y * ch + 1) + '" width="' + f(cw - 2) + '" height="' + f(ch - 2) + '" rx="1.5" fill="' + palette[Math.min(palette.length - 1, Math.floor(v * palette.length))] + '"/>';
    }
    return '<svg viewBox="0 0 300 150">' + g + "</svg>";
  }
  function worldMap(r) {
    var land = '<path d="M30 40c20-18 70-22 90-6 14 12 4 30-16 36-12 4-10 18-24 22-20 6-44-10-50-26-4-10-6-18 0-26zM110 92c14-4 26 8 24 24-2 18-14 30-24 26-10-6-8-22-6-32 1-8 0-16 6-18zM150 34c24-14 70-16 100 0 20 10 30 26 18 36-14 12-40 4-56 14-14 8-20 22-38 16-18-6-16-26-28-36-6-8-4-24 4-30zM210 104c14-8 36-6 44 6 6 10-4 22-20 22-14 0-30-6-30-16 0-6 2-10 6-12z" fill="#e6e1d3"/>';
    var dots = "", cols = ["#e8664d", "#4f8fd6", "#f0b53d", "#6aa85a", "#9a6fd0"];
    for (var i = 0; i < 26; i++) dots += '<circle cx="' + f(30 + r() * 240) + '" cy="' + f(30 + r() * 100) + '" r="' + f(2 + r() * 7) + '" fill="' + pick(r, cols) + '" opacity=".75"/>';
    return '<svg viewBox="0 0 300 160"><rect width="300" height="160" fill="#f6f8fa"/>' + land + dots + "</svg>";
  }

  var PARKS = {
    reddit: { biome: "forest", slides: [
      { cap: "<b>Weekly digest:</b> Claude Sonnet turns a week of r/UBC into one readable summary",
        ui: function () { return '<div class="bar"><i></i><i></i><i></i><span>Inbox</span><em>Mon 8:00</em></div><div class="pad"><p><span class="chip g">UBC Reporter</span> <span class="muted">weekly digest</span></p><p class="h" style="margin-top:.6em">r/UBC this week</p><p class="muted">summarised by claude sonnet · categorised by llama 3</p>' +
          '<p style="margin-top:.8em"><span class="chip b">Housing</span></p><div class="line" style="width:92%"></div><div class="line" style="width:78%"></div>' +
          '<p style="margin-top:.6em"><span class="chip o">Courses</span></p><div class="line" style="width:88%"></div><div class="line" style="width:64%"></div>' +
          '<p style="margin-top:.6em"><span class="chip p">Events</span></p><div class="line" style="width:80%"></div></div>'; } },
      { cap: "<b>Post triage:</b> Llama 3 sorts every post into a category, with a confidence score",
        ui: function () { var rows = [["b", "Housing", 92], ["o", "Courses", 86], ["p", "Events", 78], ["g", "Campus life", 71], ["b", "Housing", 64], ["o", "Courses", 58]];
          return '<div class="bar"><i></i><i></i><i></i><span>Triage</span><em>llama 3 · bedrock</em></div><div class="pad">' + rows.map(function (x) { return '<div class="row"><div style="flex:1"><div class="line" style="width:' + (60 + x[2] % 30) + '%;margin:0"></div></div><span class="chip ' + x[0] + '">' + x[1] + '</span><span class="meter"><b style="width:' + x[2] + '%"></b></span></div>'; }).join("") + '<p class="muted" style="margin-top:.6em">bar = model confidence</p></div>'; } },
      { cap: "<b>Serverless pipeline:</b> four independent Lambdas on AWS SAM, scheduled by EventBridge",
        ui: function () { return '<div class="bar"><i></i><i></i><i></i><span>template.yaml</span><em>aws sam</em></div><div class="flow"><div class="node">EventBridge<small>weekly schedule</small></div><span class="arrow">→</span><div class="node">λ fetch<small>reddit posts</small></div><span class="arrow">→</span><div class="node hot">λ classify<small>llama 3</small></div><span class="arrow">→</span><div class="node hot">λ summarise<small>claude sonnet</small></div><span class="arrow">→</span><div class="node">λ send<small>postmark</small></div></div><div class="pad" style="padding-top:0"><div class="card"><span class="chip">S3</span> <span class="muted">every run persisted for replay and audit</span></div></div>'; } }
    ] },
    crop: { biome: "prairie", slides: [
      { cap: "<b>Satellite + weather fusion:</b> MMST-ViT reads imagery and weather side by side",
        ui: function (r) { return '<div class="bar"><i></i><i></i><i></i><span>mmst-vit</span><em>pytorch</em></div><div class="pad cols"><div class="card"><p class="muted">satellite tiles</p>' + grid(r, 12, 6, ["#e9f1d8", "#c9dfa4", "#9fc672", "#6fa24a", "#487a33"]) + '</div><div class="card"><p class="muted">weather</p>' + lineChart([{ v: series(r, 30, 10, 0.1, 3), c: "#e8664d" }, { v: series(r, 30, 5, 0, 4), c: "#4f8fd6" }], { h: 100 }) + '</div></div><div class="pad" style="padding-top:0"><div class="card"><p class="muted">yield forecast</p>' + lineChart([{ v: series(r, 40, 10, 0.08, 1.6), c: "#6aa85a", area: true }], { h: 70 }) + "</div></div>"; } },
      { cap: "<b>Contrastive pre-training:</b> SimCLR teaches the PVT backbone what fields look like",
        ui: function (r) { var loss = []; for (var i = 0; i < 40; i++) loss.push(6 * Math.exp(-i / 11) + 1 + (r() - 0.5) * 0.35);
          return '<div class="bar"><i></i><i></i><i></i><span>main_pretrain_mmst_vit.py</span><em>nt-xent loss</em></div><div class="pad"><p class="muted">contrastive loss by epoch</p>' + lineChart([{ v: loss, c: "#6aa85a", area: true }], { h: 120 }) + '<p style="margin-top:.6em"><span class="chip g">SimCLR</span> <span class="chip">PVT backbone</span> <span class="chip">Sentinel-2 tiles</span></p></div>'; } },
      { cap: "<b>Spatial + temporal:</b> county grids, then the whole growing season",
        ui: function () { return '<div class="bar"><i></i><i></i><i></i><span>models_mmst_vit.py</span><em>architecture</em></div><div class="flow"><div class="node">Sentinel-2<small>satellite tiles</small></div><span class="arrow">→</span><div class="node">PVT<small>pre-trained</small></div><span class="arrow">→</span><div class="node hot">spatial<small>attention</small></div><span class="arrow">→</span><div class="node hot">temporal<small>attention</small></div><span class="arrow">→</span><div class="node">yield<small>per county</small></div></div><div class="pad" style="padding-top:0"><div class="card"><span class="chip b">HRRR weather</span> <span class="chip">long-term climate</span> <span class="chip o">USDA stats</span></div></div>'; } }
    ] },
    asteroid: { biome: "desert", slides: [
      { cap: "<b>Class imbalance:</b> about 0.2% of 958,524 records are hazardous",
        ui: function () { return '<div class="bar"><i></i><i></i><i></i><span>eda.ipynb</span><em>nasa / jpl</em></div><div class="pad cols"><div><p class="muted">records</p><p class="kpi">958,524</p><p style="margin-top:.6em"><span class="chip o">PHO</span> <span class="chip">not hazardous</span></p><p class="muted" style="margin-top:.8em">SMOTENC tested, and it turned out not to help</p></div><div><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="none" stroke="#e6e3da" stroke-width="18"/><circle cx="60" cy="60" r="44" fill="none" stroke="#e8664d" stroke-width="18" stroke-dasharray="6 300" transform="rotate(-90 60 60)"/></svg></div></div>'; } },
      { cap: "<b>Feature importance:</b> orbit intersection distance and absolute magnitude lead",
        ui: function () { var items = [["moid", 96], ["absolute magnitude H", 84], ["", 46], ["", 38], ["", 27], ["", 18]];
          return '<div class="bar"><i></i><i></i><i></i><span>feature importance</span><em>xgboost</em></div><div class="pad">' + items.map(function (x, i) { return '<div class="row"><span style="flex:0 0 38%">' + (x[0] ? "<b>" + x[0] + "</b>" : '<span class="line" style="display:block;width:70%;margin:0"></span>') + '</span><span style="flex:1;height:.8em;border-radius:4px;background:#f1efe9;overflow:hidden"><b style="display:block;height:100%;width:' + x[1] + '%;background:' + (i < 2 ? "#e8664d" : "#c9c3b5") + '"></b></span></div>'; }).join("") + "</div>"; } },
      { cap: "<b>Test results:</b> 89% recall and 99.7% precision on 187,720 held-out rows",
        ui: function () { return '<div class="bar"><i></i><i></i><i></i><span>evaluate.py</span><em>confusion matrix</em></div><div class="pad"><div class="cm"><span></span><span class="muted">predicted PHO</span><span class="muted">predicted safe</span><span class="muted">actual PHO</span><div style="background:#dff1e1;color:#2f7a3a">379</div><div style="background:#fde3dc;color:#a8481f">47</div><span class="muted">actual safe</span><div style="background:#fdf0d8;color:#8a6410">1</div><div style="background:#e9eef6;color:#43506a">187,293</div></div><p style="margin-top:.8em"><span class="chip">RFECV</span> <span class="chip">robust scaler</span> <span class="chip o">XGBoost</span> <span class="chip g">ROC-AUC ~0.99</span></p></div>'; } }
    ] },
    disaster: { biome: "coast", slides: [
      { cap: "<b>World view:</b> disaster frequency on a map, filtered by type, date and country",
        ui: function (r) { return '<div class="bar"><i></i><i></i><i></i><span>DisasterDash</span><em>shiny for python</em></div><div class="side"><p class="muted">disaster type</p><p style="line-height:2.1"><span class="chip o">flood</span> <span class="chip b">storm</span><br /><span class="chip" style="background:#fdf1d6;color:#8a6410">drought</span> <span class="chip g">wildfire</span><br /><span class="chip p">earthquake</span></p><p class="muted" style="margin-top:.6em">region</p><div class="line"></div><div class="line" style="width:70%"></div></div><div class="main">' + worldMap(r) + "</div>"; } },
      { cap: "<b>The aid gap:</b> economic losses against the aid that actually arrived",
        ui: function (r) { return '<div class="bar"><i></i><i></i><i></i><span>DisasterDash</span><em>trends</em></div><div class="pad">' + lineChart([{ v: series(r, 40, 4, 0.12, 2), c: "#4f8fd6", area: true }, { v: series(r, 40, 2, 0.08, 1.5), c: "#e8664d", area: true }], { h: 130 }) + '<div style="margin-top:.8em;height:.5em;border-radius:4px;background:#eceae4;position:relative"><b style="position:absolute;left:30%;right:15%;top:0;bottom:0;background:#4f8fd6;border-radius:4px"></b></div><p class="muted" style="margin-top:.4em">year range</p></div>'; } },
      { cap: "<b>AI Explorer:</b> ask the data questions in plain English",
        ui: function () { return '<div class="bar"><i></i><i></i><i></i><span>DisasterDash</span><em>ai explorer · claude</em></div><div class="pad"><div class="card" style="margin-left:18%;background:#eef2f7"><p>Which countries had the biggest gap between losses and aid in 2010?</p></div><div class="card" style="margin-top:.7em;margin-right:12%"><p class="muted">querying EM-DAT…</p><div class="line" style="width:92%"></div><div class="line" style="width:74%"></div><div class="line" style="width:58%"></div></div><p style="margin-top:.7em"><span class="chip p">natural language</span> <span class="chip">anthropic api</span></p></div>'; } }
    ] },
    temp: { biome: "alpine", slides: [
      { cap: "<b>222 years:</b> Berkeley Earth land temperature records, 1800s to today",
        ui: function (r) { return '<div class="bar"><i></i><i></i><i></i><span>report.qmd</span><em>quarto</em></div><div class="pad"><p class="h">Land average temperature</p><p class="muted">berkeley earth · annual mean</p>' + lineChart([{ v: series(r, 110, 0, 0.018, 0.9), c: "#e8664d", w: 1.4 }], { h: 140 }) + "</div>"; } },
      { cap: "<b>Model benchmark:</b> OLS vs random forest vs kernel SVR on RMSE, MAE and R²",
        ui: function () { var m = [["OLS", 60, 58, 52], ["Random forest", 44, 46, 70], ["Kernel SVR", 40, 40, 74]];
          return '<div class="bar"><i></i><i></i><i></i><span>benchmark</span><em>scikit-learn</em></div><div class="pad"><div class="row muted"><span style="flex:0 0 30%">model</span><span style="flex:1">RMSE</span><span style="flex:1">MAE</span><span style="flex:1">R²</span></div>' + m.map(function (x) { return '<div class="row"><b style="flex:0 0 30%">' + x[0] + '</b>' + [1, 2, 3].map(function (k) { return '<span style="flex:1"><span class="meter" style="display:block;width:80%"><b style="width:' + x[k] + '%;background:#4f8fd6"></b></span></span>'; }).join("") + "</div>"; }).join("") + '<p style="margin-top:.8em"><span class="chip">docker</span> <span class="chip">pytest</span> <span class="chip">quarto</span></p></div>'; } },
      { cap: "<b>2030 projection:</b> 10.56°C, roughly 2°C above the 1951 to 1980 baseline",
        ui: function (r) { var hist = series(r, 50, 0, 0.05, 0.7), last = hist[hist.length - 1], fc = []; for (var i = 0; i < 50; i++) fc.push(i < 38 ? NaN : last + (i - 38) * 0.12);
          var vals = hist.concat([]); var W = 300, H = 140, lo = Math.min.apply(null, hist) - 0.5, hi = last + 1.8;
          var toY = function (v) { return H - 10 - (v - lo) / (hi - lo) * (H - 24); };
          var d = hist.map(function (v, i) { return (i ? "L" : "M") + f(i / 60 * W) + " " + f(toY(v)); }).join("");
          var fx0 = 49 / 60 * W, d2 = "M" + f(fx0) + " " + f(toY(last)) + "L" + f(W - 6) + " " + f(toY(hi - 0.3));
          var base = toY(lo + (last - lo) * 0.3);
          return '<div class="bar"><i></i><i></i><i></i><span>forecast</span><em>kernel svr</em></div><div class="pad"><svg viewBox="0 0 300 140"><path d="M0 ' + f(base) + 'H300" stroke="#9aa3ad" stroke-dasharray="4 4"/><text x="4" y="' + f(base - 4) + '" font-size="8" fill="#8a8f98">1951–80 baseline</text><path d="' + d + '" fill="none" stroke="#e8664d" stroke-width="1.6"/><path d="' + d2 + '" fill="none" stroke="#e8664d" stroke-width="2" stroke-dasharray="5 4"/><circle cx="' + f(W - 6) + '" cy="' + f(toY(hi - 0.3)) + '" r="4" fill="#e8664d"/><text x="' + f(W - 60) + '" y="' + f(toY(hi - 0.3) - 8) + '" font-size="11" font-weight="700" fill="#1f2328">10.56°C</text><text x="' + f(W - 32) + '" y="136" font-size="8" fill="#8a8f98">2030</text></svg><p style="margin-top:.4em"><span class="chip o">+~2°C</span> <span class="muted">vs 1951–80</span></p></div>'; } }
    ] }
  };

  // each project's screens, taped into its journal page
  $$("[data-park]").forEach(function (park, pi) {
    var P = PARKS[park.getAttribute("data-park")], host = $("[data-shots]", park);
    if (!P || !host) return;
    host.innerHTML = P.slides.map(function (sl, i) {
      var seed = 101 + pi * 17 + i * 5, r = rng(seed * 3), label = (sl.cap.match(/<b>(.*?):?<\/b>/) || ["", ""])[1].toLowerCase();
      return '<figure class="jn-shot" style="--i:' + i + '" title="' + sl.cap.replace(/<[^>]+>/g, "") + '">' + (i ? '<i class="jn-tape jn-t4"></i>' : '<i class="jn-tape jn-t1"></i><i class="jn-tape jn-t2"></i>') +
        '<div class="frame"><div class="scene">' + scene(P.biome, seed) + '</div><div class="ui">' + sl.ui(r) + '</div><div class="fore">' + foreground(P.biome, seed) + '</div></div><figcaption>' + label + "</figcaption></figure>";
    }).join("");
    $$(".jn-shot", host).forEach(function (shot) {
      shot.tabIndex = 0;
      shot.setAttribute("role", "button");
      shot.setAttribute("aria-label", "Enlarge " + shot.getAttribute("title"));
      shot.setAttribute("aria-haspopup", "dialog");
    });
  });

  // taped photos (and the enlarged one) lean toward the cursor
  if (canHover && !reduceMotion) {
    var trackShot = null;
    var untrack = function () {
      if (!trackShot) return;
      trackShot.classList.remove("tracking");
      trackShot.style.removeProperty("--mx"); trackShot.style.removeProperty("--my");
      trackShot = null;
    };
    document.addEventListener("pointermove", function (e) {
      var shot = e.target.closest ? e.target.closest(".jn-shot:not(.jn-shot-placeholder)") : null;
      // in the enlarged view the whole dialog steers the photo, not just the photo itself
      if (!shot && e.target.closest && e.target.closest(".jn-photo-viewer")) shot = $(".jn-photo-viewer .jn-shot");
      if (shot !== trackShot) { untrack(); trackShot = shot; }
      if (!shot) return;
      var box = shot.closest(".jn-photo-viewer") || shot, r = box.getBoundingClientRect();
      shot.classList.add("tracking");
      shot.style.setProperty("--mx", Math.max(-.5, Math.min(.5, (e.clientX - r.left) / r.width - .5)).toFixed(3));
      shot.style.setProperty("--my", Math.max(-.5, Math.min(.5, (e.clientY - r.top) / r.height - .5)).toFixed(3));
    }, { passive: true });
    document.addEventListener("pointerleave", untrack);
  }

  /* The diary has one controlled turn at a time. Repeated input updates the
     destination; it never reverses a leaf halfway through its animation. */
  (function () {
    var book = $("[data-journal]");
    if (!book) return;
    var pages = $$(".jn-page", book), tabs = $$("[data-jn-go]"),
        prevB = $("[data-jn-prev]"), nextB = $("[data-jn-next]"),
        count = $("[data-jn-count]"), pageLabel = $("[data-jn-page-label]"),
        ribbon = $(".jn-ribbon", book), pencil = $(".jn-pencil", book),
        viewer = $("[data-jn-photo-viewer]"), photoBody = $("[data-jn-photo-body]"), photoClose = $("[data-jn-photo-close]"),
        mq = matchMedia("(max-width: 1080px)"), motion = matchMedia("(prefers-reduced-motion: reduce)"),
        leaves = [], state = 0, target = 0, single = false, turning = false,
        cancelTurn = null, resizePending = false, openShot = null, shotAnchor = null,
        photoAnimation = null, photoClosing = false;

    function shown() { return single ? [state] : [state * 2, state * 2 + 1]; }
    function rest(i) { return i < state ? i + 1 : leaves.length - i; }

    function controls() {
      prevB.disabled = target === 0;
      nextB.disabled = target === leaves.length - 1;
      prevB.setAttribute("aria-label", single ? "Previous page" : "Previous project");
      nextB.setAttribute("aria-label", single ? "Next page" : "Next project");
      tabs.forEach(function (t, i) {
        t.setAttribute("aria-current", i === (single ? Math.floor(target / 2) : target) ? "true" : "false");
        t.setAttribute("aria-controls", "project-diary");
      });
    }

    function paint() {
      var visible = shown();
      leaves.forEach(function (leaf, i) {
        leaf.classList.toggle("flipped", !single && i < state);
        leaf.classList.toggle("is-current", single && i === state);
        leaf.classList.remove("is-turning", "is-entering", "is-leaving");
        leaf.style.zIndex = rest(i);
      });
      pages.forEach(function (page, i) {
        var hidden = visible.indexOf(i) < 0;
        if (hidden && page.contains(document.activeElement)) book.focus({ preventScroll: true });
        page.inert = hidden;
        page.setAttribute("aria-hidden", String(hidden));
      });
      count.textContent = (single ? Math.floor(state / 2) : state) + 1;
      pageLabel.textContent = single ? (state % 2 ? "screens · page 2 / 2" : "notes · page 1 / 2") : "";
      controls();
    }

    // Measure natural page height without collapsing the book or moving the viewport.
    function size() {
      if (turning || (viewer && viewer.open)) { resizePending = true; return; }
      book.classList.add("is-measuring");
      // never shorter than a diary page: portrait, a little taller than wide
      var height = Math.round((single ? book.offsetWidth : book.offsetWidth / 2) * (single ? 1.25 : 1.1));
      pages.forEach(function (page) { height = Math.max(height, page.offsetHeight); });
      book.style.height = Math.ceil(height) + "px";
      book.classList.remove("is-measuring");
      resizePending = false;
    }

    function bind() {
      var keep = single ? target : target * 2;
      if (cancelTurn) cancelTurn();
      turning = false;
      book.classList.remove("is-turning");
      book.removeAttribute("aria-busy");
      book.classList.add("instant");
      pages.forEach(function (page) {
        page.classList.remove("jn-front", "jn-back", "jn-static");
        book.appendChild(page);
      });
      leaves.forEach(function (leaf) { leaf.remove(); });
      leaves = [];
      single = mq.matches;
      book.classList.toggle("single", single);
      if (!single) pages[0].classList.add("jn-static");
      for (var i = single ? 0 : 1; i < pages.length; i += single ? 1 : 2) {
        var leaf = document.createElement("div");
        leaf.className = "jn-leaf";
        pages[i].classList.add("jn-front");
        leaf.appendChild(pages[i]);
        if (!single && pages[i + 1]) {
          pages[i + 1].classList.add("jn-back");
          leaf.appendChild(pages[i + 1]);
        }
        book.appendChild(leaf);
        leaves.push(leaf);
      }
      state = target = clamp(single ? keep : Math.floor(keep / 2), 0, leaves.length - 1);
      paint();
      size();
      void book.offsetWidth;
      book.classList.remove("instant");
    }

    function advance() {
      if (turning || target === state) return;
      if (motion.matches) {
        book.classList.add("instant");
        state = target;
        paint();
        void book.offsetWidth;
        book.classList.remove("instant");
        return;
      }
      var from = state, direction = target > state ? 1 : -1,
          next = single ? target : state + direction,
          duration = single ? 240 : (Math.abs(target - state) > 1 ? 280 : 430),
          stringDelay = single || book.classList.contains("is-turning") ? 0 : 160,
          leaf = leaves[single ? next : (direction > 0 ? from : next)],
          eventName = single ? "animationend" : "transitionend", timer;
      turning = true;
      book.classList.add("is-turning");
      book.setAttribute("aria-busy", "true");
      book.style.setProperty("--jn-duration", duration + "ms");
      book.style.setProperty("--jn-string-delay", stringDelay + "ms");
      book.style.setProperty("--jn-direction", direction);
      // the bookmark swings and the pencil rocks in its loop, both away from the turning page
      [ribbon, pencil].forEach(function (el, k) {
        if (!el) return;
        var cls = k ? "nudge" : "sway";
        el.style.setProperty("--dir", direction);
        el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
      });
      // The binding clears the paper before the page begins to turn.
      leaf.style.zIndex = leaves.length * 2 + 1;
      leaf.classList.add("is-turning");
      void leaf.offsetWidth;
      if (single) {
        leaves[from].classList.add("is-leaving");
        leaves[from].classList.remove("is-current");
        leaves[from].style.zIndex = leaves.length * 2;
        leaf.classList.add("is-current", "is-entering");
      } else {
        leaf.classList.toggle("flipped", direction > 0);
      }
      state = next;
      function cleanup() {
        clearTimeout(timer);
        leaf.removeEventListener(eventName, finish);
        cancelTurn = null;
      }
      function finish(event) {
        if (event && (event.target !== leaf || (single ? event.animationName !== "jn-page-in" : event.propertyName !== "transform"))) return;
        cleanup();
        turning = false;
        paint();
        if (target !== state) {
          advance();
        } else {
          book.classList.remove("is-turning");
          book.removeAttribute("aria-busy");
          if (resizePending) size();
        }
      }
      cancelTurn = cleanup;
      leaf.addEventListener(eventName, finish);
      // Background tabs can suppress completion events.
      timer = setTimeout(finish, duration + stringDelay + 120);
    }

    function go(to) {
      target = clamp(to, 0, leaves.length - 1);
      controls();
      advance();
    }
    function photoTransform(rect, full) {
      var x = rect.left + rect.width / 2 - full.left - full.width / 2,
          y = rect.top + rect.height / 2 - full.top - full.height / 2;
      return "translate3d(" + x + "px," + y + "px,0) scale(" + rect.width / full.width + "," + rect.height / full.height + ")";
    }
    function stopPhotoAnimation() {
      if (photoAnimation) {
        photoAnimation.onfinish = null;
        photoAnimation.cancel();
        photoAnimation = null;
      }
      viewer.classList.remove("is-animating");
    }
    function animatePhoto(frames, duration, done) {
      if (motion.matches || !viewer.animate) { done(); return; }
      viewer.classList.add("is-animating");
      photoAnimation = viewer.animate(frames, {
        duration: duration, easing: "cubic-bezier(.22, .7, .25, 1)", fill: "both"
      });
      photoAnimation.onfinish = function () { stopPhotoAnimation(); done(); };
    }
    function openPhoto(shot) {
      if (!viewer || !photoBody || !photoClose || viewer.open || turning) return;
      var source = shot.getBoundingClientRect();
      // Keep the layout and SVG IDs stable while the original photo is enlarged.
      shotAnchor = document.createElement("div");
      shotAnchor.className = "jn-shot jn-shot-placeholder";
      shotAnchor.style.height = shot.offsetHeight + "px";
      shotAnchor.setAttribute("aria-hidden", "true");
      shot.parentNode.insertBefore(shotAnchor, shot);
      openShot = shot;
      photoClosing = false;
      photoBody.appendChild(shot);
      viewer.setAttribute("aria-label", shot.getAttribute("title") || "Enlarged project photo");
      viewer.showModal();
      shot.setAttribute("aria-label", "Close enlarged photo");
      photoClose.focus({ preventScroll: true });
      var full = viewer.getBoundingClientRect();
      viewer.classList.add("is-visible");
      animatePhoto([
        { transform: photoTransform(source, full) },
        { transform: "translate3d(0,0,0) scale(1,1)" }
      ], 320, function () {});
    }
    function closePhoto() {
      if (!viewer.open || photoClosing) return;
      photoClosing = true;
      // A second click during opening reverses from the current visual position.
      var current = viewer.getBoundingClientRect();
      stopPhotoAnimation();
      var full = viewer.getBoundingClientRect(), destination = shotAnchor.getBoundingClientRect();
      viewer.classList.remove("is-visible");
      animatePhoto([
        { transform: photoTransform(current, full) },
        { transform: photoTransform(destination, full) }
      ], 240, finishPhotoClose);
    }
    function restorePhoto() {
      if (viewer.open || !openShot || !shotAnchor) return;
      stopPhotoAnimation();
      viewer.classList.remove("is-visible");
      photoClosing = false;
      openShot.classList.add("jn-shot-restoring");
      shotAnchor.parentNode.insertBefore(openShot, shotAnchor);
      shotAnchor.remove();
      openShot.setAttribute("aria-label", "Enlarge " + openShot.getAttribute("title"));
      openShot.focus({ preventScroll: true });
      void openShot.offsetWidth;
      openShot.classList.remove("jn-shot-restoring");
      openShot = shotAnchor = null;
      size();
    }
    function finishPhotoClose() {
      viewer.close();
      // Native close events are queued; restore the thumbnail before the next paint.
      restorePhoto();
    }
    if (viewer) {
      viewer.addEventListener("click", function (event) {
        if (event.target === viewer || event.target.closest(".jn-shot, .jn-photo-close")) closePhoto();
      });
      viewer.addEventListener("cancel", function (event) {
        event.preventDefault();
        closePhoto();
      });
      viewer.addEventListener("keydown", function (event) {
        if (event.target.closest(".jn-shot") && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          closePhoto();
        }
      });
      viewer.addEventListener("close", restorePhoto);
    }
    var touch = null, suppressClickUntil = 0;
    book.addEventListener("click", function (event) {
      if (Date.now() < suppressClickUntil || event.target.closest("a, button")) return;
      var shot = event.target.closest(".jn-shot");
      if (shot) { openPhoto(shot); return; }
      if (String(window.getSelection())) return;
      var bounds = book.getBoundingClientRect(), x = event.clientX - bounds.left;
      go(target + (x < bounds.width / 2 ? -1 : 1));
    });
    [ribbon, pencil].forEach(function (el) {
      if (el) el.addEventListener("animationend", function (e) { if (e.target === el || e.target.classList.contains("jn-ribbon-tail")) el.classList.remove("sway", "nudge"); });
    });
    book.addEventListener("keydown", function (event) {
      if (event.target.closest("input, textarea, select, [contenteditable]")) return;
      if (event.target.classList.contains("jn-shot") && (event.key === "Enter" || event.key === " ")) {
        openPhoto(event.target);
        event.preventDefault();
        return;
      }
      if (event.key === "ArrowRight") go(target + 1);
      else if (event.key === "ArrowLeft") go(target - 1);
      else if (event.key === "Home") go(0);
      else if (event.key === "End") go(leaves.length - 1);
      else return;
      event.preventDefault();
    });
    book.addEventListener("touchstart", function (event) {
      touch = event.touches.length === 1 && !event.target.closest("a, button") ?
        { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }, { passive: true });
    book.addEventListener("touchend", function (event) {
      if (!touch) return;
      var dx = event.changedTouches[0].clientX - touch.x,
          dy = event.changedTouches[0].clientY - touch.y;
      touch = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        suppressClickUntil = Date.now() + 450;
        go(target + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
    book.addEventListener("touchcancel", function () { touch = null; }, { passive: true });
    prevB.addEventListener("click", function () { go(target - 1); });
    nextB.addEventListener("click", function () { go(target + 1); });
    tabs.forEach(function (tab, i) { tab.addEventListener("click", function () { go(single ? i * 2 : i); }); });
    if (mq.addEventListener) mq.addEventListener("change", bind); else mq.addListener(bind);
    function motionChanged() {
      if (!motion.matches) return;
      bind();
      if (photoAnimation) {
        stopPhotoAnimation();
        if (photoClosing) finishPhotoClose();
      }
    }
    if (motion.addEventListener) motion.addEventListener("change", motionChanged); else motion.addListener(motionChanged);
    var resizeTimer;
    window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(size, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
    bind();
  })();

  // parks / ui focus
  var work = $("#work"), toggle = $(".view-toggle");
  $$("[data-view]", toggle).forEach(function (b) {
    b.addEventListener("click", function () {
      var ui = b.getAttribute("data-view") === "ui";
      work.classList.toggle("ui-focus", ui);
      $$("[data-view]", toggle).forEach(function (o) { var on = o === b; o.classList.toggle("on", on); o.setAttribute("aria-pressed", String(on)); });
    });
  });

  /* ── experience topo map ───────────────────────────────── */
  var topo = $("#experience"), topoHost = $("[data-topo]"), trailHost = $("[data-trail]");
  var trailPath, trailLen = 0, stops = [], stopDots = [];
  // a compact trail through the middle of the map; the stops sit on it at fixed x positions
  var TRAIL_D = "M-40 620 C80 620 180 585 300 585 S420 495 510 495 S630 580 720 580 S840 495 930 495 S1050 440 1140 435 S1320 420 1480 400";
  var STOP_X = [300, 510, 720, 930, 1140];
  function lengthAtX(path, total, x) {
    var lo = 0, hi = total;
    for (var k = 0; k < 30; k++) { var mid = (lo + hi) / 2; if (path.getPointAtLength(mid).x < x) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  if (topoHost) buildTopo();

  function buildTopo() {
    var r = rng(4242), W = 1440, H = 900, s = "";
    // peaks and place names, all in the local dialect (the contours themselves are drawn on a canvas)
    var peaks = [["Granite Peak", "1,840 M", 250, 180], ["Eagle Crest", "1,760 M", 470, 110], ["North Summit", "2,010 M", 1020, 120], ["Cedar Knoll", "1,120 M", 1250, 640], ["Hemlock Crag", "1,390 M", 160, 470], ["Lookout Point", "980 M", 880, 760]];
    peaks.forEach(function (p) {
      s += '<path d="M' + p[2] + " " + (p[3] - 7) + 'l7 12h-14z" fill="currentColor"/><text x="' + (p[2] + 12) + '" y="' + (p[3] + 2) + '" class="tp">' + p[0] + '</text><text x="' + (p[2] + 12) + '" y="' + (p[3] + 12) + '" class="tp s">' + p[1] + "</text>";
    });
    var areas = [["HEMLOCK HILLS", 120, 104, -6], ["OVERFIT RIDGE", 600, 96, 0], ["VALIDATION VALLEY", 1150, 236, 4], ["LOST LAKE", 200, 830, 0], ["PINE FLATS", 60, 330, 0], ["COPPER PASS", 1210, 790, -3], ["BOULDER OUTCROP", 700, 812, 0], ["WEST MESA", 1180, 100, 2], ["BIRCH BASIN", 420, 700, -2]];
    areas.forEach(function (a) { s += '<text x="' + a[1] + '" y="' + a[2] + '" class="ta" transform="rotate(' + a[3] + " " + a[1] + " " + a[2] + ')">' + a[0] + "</text>"; });
    var style = "<style>.tp{font:700 10px 'Josefin Sans',sans-serif;letter-spacing:.14em;fill:currentColor;text-transform:uppercase}.tp.s{font-size:8px}.ta{font:700 13px 'Josefin Sans',sans-serif;letter-spacing:.34em;fill:currentColor;opacity:.85}</style>";
    topoHost.innerHTML = '<canvas class="contours" aria-hidden="true"></canvas>' + svg("0 0 1440 900", style + s, "xMidYMid slice");
    drawContours();

    // the trail: dashed path revealed through a growing mask
    trailHost.insertAdjacentHTML("afterbegin", svg("0 0 1440 900",
      '<defs><mask id="trail-mask" maskUnits="userSpaceOnUse" x="-100" y="0" width="1640" height="900"><path id="trail-reveal" d="' + TRAIL_D + '" fill="none" stroke="#fff" stroke-width="14"/></mask></defs>' +
      '<path d="' + TRAIL_D + '" fill="none" style="stroke:var(--topo-trail)" stroke-width="2.6" stroke-dasharray="8 8" stroke-linecap="round" mask="url(#trail-mask)"/><g data-dots></g>', "xMidYMid slice"));
    var tsvg = $("svg", trailHost);
    trailPath = $("#trail-reveal", tsvg);
    trailLen = trailPath.getTotalLength();
    trailPath.style.strokeDasharray = trailLen;
    trailPath.style.strokeDashoffset = trailLen;
    stops = $$(".stops > li", trailHost);
    var dotsG = $("[data-dots]", tsvg);
    stops.forEach(function (li, i) {
      var len = lengthAtX(trailPath, trailLen, STOP_X[i] || 720), p = trailPath.getPointAtLength(len);
      li._p = p; li._at = len / trailLen;
      if (i % 2 === 0 && !li.classList.contains("next")) li.classList.add("below");   // low points: card below, high points: card above
      // a survey benchmark for each stop: the dot, a crosshair, and the place with its coordinates,
      // set on the side of the trail away from the card
      var up = li.classList.contains("below"), ly = up ? p.y - 30 : p.y + 34, next = li.classList.contains("next");
      var flip = p.x > 1180, tx = flip ? p.x - 26 : p.x + 26, anchor = flip ? ' text-anchor="end"' : "";
      dotsG.insertAdjacentHTML("beforeend",
        '<g class="bench" opacity="0">' +
          '<circle cx="' + f(p.x) + '" cy="' + f(p.y) + '" r="15" fill="none" style="stroke:var(--topo-ink)" stroke-width="1" stroke-dasharray="2 3"/>' +
          '<path d="M' + f(p.x - 21) + " " + f(p.y) + "h8M" + f(p.x + 13) + " " + f(p.y) + "h8M" + f(p.x) + " " + f(p.y - 21) + "v8M" + f(p.x) + " " + f(p.y + 13) + 'v8" style="stroke:var(--topo-ink)" stroke-width="1.2"/>' +
          '<circle cx="' + f(p.x) + '" cy="' + f(p.y) + '" r="7" style="fill:' + (next ? "#d9a932" : "var(--topo-dot)") + ';stroke:var(--topo-ink)" stroke-width="2"/>' +
          '<text x="' + f(tx) + '" y="' + f(ly) + '"' + anchor + ' class="loc">' + (li.getAttribute("data-place") || "").toUpperCase() + "</text>" +
          '<text x="' + f(tx) + '" y="' + f(ly + 13) + '"' + anchor + ' class="coord">' + (li.getAttribute("data-coord") || "") + "</text>" +
        "</g>");
    });
    stopDots = $$(".bench", dotsG);
    placeStops();
  }

  /* ── contour lines: marching squares over a warped fractal-noise terrain ─── */
  var HASH = null;  // built on first use: buildTopo runs before this line is reached
  function vnoise(x, y) {
    if (!HASH) { var hr = rng(9017); HASH = []; for (var n = 0; n < 512; n++) HASH.push(hr()); }
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var h = function (i, j) { return HASH[((i * 73856093) ^ (j * 19349663)) & 511]; };
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, oct) { var sum = 0, amp = 0.5, fr = 1; for (var i = 0; i < oct; i++) { sum += amp * vnoise(x * fr, y * fr); fr *= 2.03; amp *= 0.5; } return sum; }
  function terrain(x, y) {
    var wx = fbm(x + 3.1, y + 7.7, 3), wy = fbm(x + 11.3, y + 2.9, 3);    // domain warp gives the twisty ridges
    return fbm(x + 1.6 * wx, y + 1.6 * wy, 5);
  }

  var contourTimer;
  function drawContours() {
    var cv = topoHost && $(".contours", topoHost);
    if (cv) paintContours(cv, topo, "--topo-ink", 0, 0);
  }
  // marching squares over the warped terrain, sized to `host`; ox/oy shift the terrain so each map is its own place
  function paintContours(cv, host, inkVar, ox, oy) {
    var box = host.getBoundingClientRect(), W = Math.ceil(box.width), H = Math.ceil(box.height);
    var dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.5 : 2), ctx = cv.getContext("2d");
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var css = getComputedStyle(host), ink = css.getPropertyValue(inkVar).trim() || "#1a1d1a";

    var C = 6, cols = Math.ceil(W / C) + 1, rows = Math.ceil(H / C) + 1, S = 1 / 230;  // S: terrain features per px
    var field = new Float32Array(cols * rows), lo = 9, hi = -9;
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      var v = terrain(i * C * S + ox, j * C * S + oy); field[j * cols + i] = v;
      if (v < lo) lo = v; if (v > hi) hi = v;
    }
    // survey grid
    ctx.save(); ctx.strokeStyle = ink; ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
    var g = 128;
    for (var gx = g; gx < W; gx += g) { ctx.beginPath(); ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, H); ctx.stroke(); }
    for (var gy = g; gy < H; gy += g) { ctx.beginPath(); ctx.moveTo(0, gy + 0.5); ctx.lineTo(W, gy + 0.5); ctx.stroke(); }
    ctx.restore();

    ctx.strokeStyle = ink; ctx.lineCap = "round"; ctx.lineJoin = "round";
    var LEVELS = 34;
    for (var L = 1; L < LEVELS; L++) {
      var iso = lo + (hi - lo) * L / LEVELS;
      ctx.beginPath();
      for (var y = 0; y < rows - 1; y++) for (var x = 0; x < cols - 1; x++) {
        var k = y * cols + x;
        var a = field[k], bb = field[k + 1], c = field[k + cols + 1], d = field[k + cols];
        var code = (a > iso ? 8 : 0) | (bb > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
        if (code === 0 || code === 15) continue;
        var px = x * C, py = y * C;
        var T = [px + C * (iso - a) / (bb - a), py], R = [px + C, py + C * (iso - bb) / (c - bb)];
        var B = [px + C * (iso - d) / (c - d), py + C], Lf = [px, py + C * (iso - a) / (d - a)];
        var seg = function (p, q) { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
        switch (code) {
          case 1: case 14: seg(Lf, B); break;
          case 2: case 13: seg(B, R); break;
          case 3: case 12: seg(Lf, R); break;
          case 4: case 11: seg(T, R); break;
          case 5: seg(Lf, T); seg(B, R); break;
          case 6: case 9: seg(T, B); break;
          case 7: case 8: seg(Lf, T); break;
          case 10: seg(T, R); seg(Lf, B); break;
        }
      }
      // one weight and one brightness for every line
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  window.addEventListener("resize", function () { clearTimeout(contourTimer); contourTimer = setTimeout(drawContours, 200); });
  new MutationObserver(function () { drawContours(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function placeStops() {
    if (!trailHost || !stops.length) return;
    var tsvg = $("svg", trailHost), box = topo.getBoundingClientRect(), m = tsvg.getScreenCTM();
    if (!m) return;
    stops.forEach(function (li) {
      var pt = tsvg.createSVGPoint(); pt.x = li._p.x; pt.y = li._p.y;
      var sp = pt.matrixTransform(m);
      li.style.left = clamp(sp.x - box.left, 110, box.width - 110) + "px";
      li.style.top = (sp.y - box.top) + "px";
    });
  }

  /* the journey plays once, on its own clock, the moment the map comes into view */
  function setTrail(p) {
    trailPath.style.strokeDashoffset = f(trailLen * (1 - p));
    var reached = -1;
    stops.forEach(function (li, i) {
      var ok = p >= li._at;
      li.classList.toggle("seen", ok);
      stopDots[i].setAttribute("opacity", ok ? "1" : "0");
      if (ok) reached = i;
    });
    stops.forEach(function (li, i) { li.classList.toggle("here", i === reached); });
  }
  var journeyPlayed = false;
  function playJourney() {
    if (journeyPlayed || !trailLen) return;
    journeyPlayed = true;
    topo.classList.add("cleared");
    if (reduceMotion) { setTrail(1); return; }
    var t0 = performance.now() + 650, dur = 2600;   // let the cloud part before the trail sets off
    (function step(now) {
      var t = Math.max(0, Math.min(1, (now - t0) / dur)), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setTrail(e);
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (topo && trailLen) {
    setTrail(0);
    if ("IntersectionObserver" in window) {
      var jio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { playJourney(); jio.disconnect(); } }, { threshold: 0.3 });
      jio.observe(topo);
    } else { topo.classList.add("cleared"); setTrail(1); }
  }

  /* ── field notes: click a stop to read its detailed notes ─── */
  var notes = $("[data-notes]"), noteIdx = 0;
  function fillNotes(i, swap) {
    var li = stops[i], map = $("[data-fn-map]", notes);
    noteIdx = i;
    $("[data-fn-stop]", notes).textContent = "Stop " + ("0" + (i + 1)).slice(-2) + " / " + ("0" + stops.length).slice(-2);
    $("[data-fn-place]", notes).textContent = li.getAttribute("data-place") || "";
    $("[data-fn-coord]", notes).textContent = li.getAttribute("data-coord") || "";
    $("[data-fn-title]", notes).textContent = $("b", li).textContent;
    $("[data-fn-role]", notes).textContent = $("small", li).textContent;
    $("[data-fn-text]", notes).innerHTML = $(".detail", li).innerHTML;
    $("[data-fn-prev]", notes).disabled = i === 0;
    $("[data-fn-next]", notes).disabled = i === stops.length - 1;
    // the header is a crop of the real contour map around this stop
    var cv = topoHost && $(".contours", topoHost);
    if (cv && cv.width) {
      try {
        var box = topo.getBoundingClientRect(), r = li.getBoundingClientRect();
        var dpr = cv.width / box.width, cw = 640 * dpr, ch = 132 * dpr;
        var cx = Math.max(0, Math.min(cv.width - cw, (r.left + r.width / 2 - box.left) * dpr - cw / 2));
        var cy = Math.max(0, Math.min(cv.height - ch, (li._p ? li.getBoundingClientRect().top - box.top : box.height / 2) * dpr - ch / 2));
        var tmp = document.createElement("canvas"); tmp.width = cw; tmp.height = ch;
        var t = tmp.getContext("2d"); t.fillStyle = getComputedStyle(topo).getPropertyValue("--topo-bg"); t.fillRect(0, 0, cw, ch);
        t.drawImage(cv, cx, cy, cw, ch, 0, 0, cw, ch);
        map.style.backgroundImage = "url(" + tmp.toDataURL() + ")";
      } catch (e) {}
    }
    notes.scrollTop = 0;
    if (swap) { notes.classList.remove("swap"); void notes.offsetWidth; notes.classList.add("swap"); }
  }
  function openNotes(i) {
    if (!notes) return;
    fillNotes(i, false);
    notes.classList.remove("closing");
    if (notes.showModal) notes.showModal(); else notes.setAttribute("open", "");
    notes.scrollTop = 0;
    $("[data-fn-close]", notes).focus({ preventScroll: true });
  }
  function closeNotes() {
    if (!notes || !notes.open) return;
    if (reduceMotion) { notes.close(); return; }
    notes.classList.add("closing");
    setTimeout(function () { notes.classList.remove("closing"); notes.close(); }, 200);
  }
  if (notes) {
    stops.forEach(function (li, i) {
      li.addEventListener("click", function () { openNotes(i); });
      li.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openNotes(i); } });
    });
    $("[data-fn-close]", notes).addEventListener("click", closeNotes);
    $("[data-fn-prev]", notes).addEventListener("click", function () { if (noteIdx > 0) fillNotes(noteIdx - 1, true); });
    $("[data-fn-next]", notes).addEventListener("click", function () { if (noteIdx < stops.length - 1) fillNotes(noteIdx + 1, true); });
    notes.addEventListener("cancel", function (e) { e.preventDefault(); closeNotes(); });
    notes.addEventListener("click", function (e) { if (e.target === notes) closeNotes(); });   // backdrop
    notes.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" && noteIdx < stops.length - 1) fillNotes(noteIdx + 1, true);
      if (e.key === "ArrowLeft" && noteIdx > 0) fillNotes(noteIdx - 1, true);
    });
  }

  /* ── education: two base camps, revealed as they scroll in ─── */
  var campsEl = $(".camps");
  if (campsEl) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var cio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { campsEl.classList.add("in"); cio.disconnect(); } }, { threshold: 0.2 });
      cio.observe(campsEl);
    } else campsEl.classList.add("in");
  }

  /* ── performance: pause the looping animations of any section that's scrolled out of view ── */
  (function () {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle("is-off", !e.isIntersecting); });
    }, { rootMargin: "200px 0px" });
    $$(".hero, .trusted, #services, #reviews, #experience, #book, .footer").forEach(function (el) { io.observe(el); });
  })();

  /* ── entrance animations: anything marked data-anim gets .in once it scrolls into view ── */
  (function () {
    var els = $$("[data-anim]");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; el.classList.add("in"); io.unobserve(el);
        if (el.classList.contains("sp")) setTimeout(function () { el.classList.add("settled"); }, 1100);
      });
    }, { threshold: .18, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ── trusted-by carousel: the logo set is doubled so the loop is seamless ── */
  (function () {
    var row = $("[data-marquee]");
    if (!row) return;
    var items = $$("li", row);
    while (row.scrollWidth < window.innerWidth * 1.1 && items.length) items.forEach(function (li) { var c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); $$("a", c).forEach(function (a) { a.tabIndex = -1; }); row.appendChild(c); });
    $$("li", row).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); $$("a", c).forEach(function (a) { a.tabIndex = -1; }); row.appendChild(c); });
    row.style.setProperty("--dur", Math.round(row.scrollWidth / 2 / 45) + "s");
  })();

  /* ── services: faint contour lines behind the trailhead ── */
  (function () {
    var sv = $("#services"), cv = $("[data-svc-contours]");
    if (!sv || !cv) return;
    var paint = function () { paintContours(cv, sv, "--svc-ink", 3.7, 9.2); }, t;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint); else paint();
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(paint, 200); });
  })();

  (function () {
    var card = $("[data-tilt]");
    if (!card || !canHover || reduceMotion) return;
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = "rotate(0deg) perspective(900px) rotateY(" + f(x * 8) + "deg) rotateX(" + f(-y * 6) + "deg)";
    });
    card.addEventListener("pointerleave", function () { card.style.transform = ""; });
  })();

  /* ── services: the signpost boards pick a route; the card redraws its profile ── */
  (function () {
    var th = $("[data-trailhead]"), card = $("[data-route-card]"), boards = $$("[data-route]");
    var ROUTES = [];
    try { ROUTES = JSON.parse(($("[data-routes]") || {}).textContent || "[]"); } catch (e) {}
    if (!th || !card || !ROUTES.length) return;
    var BLAZE = { circle: '<circle cx="12" cy="12" r="8"/>', triangle: '<path d="M12 4l8.5 15h-17z"/>', square: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
      diamond: '<path d="M12 3l9 9-9 9-9-9z"/>', hexagon: '<path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z"/>' };
    var fig = $(".rc-prof", card), prof = $("[data-rc-prof]", card), cur = -1;
    // an uphill route: each stage of the work sits a little higher, with a ridge line of rough ground between them
    function profile(i) {
      var R = ROUTES[i], r = rng(900 + i * 37), W = 640, H = 170, n = R.pts.length, pts = [], wps = [];
      var stageX = function (k) { return 36 + k * (W - 72) / (n - 1); };
      var stageY = function (k) { return 140 - k * (100 / (n - 1)) - (k === n - 1 ? 8 : (r() - .5) * 14); };
      var ys = []; for (var k = 0; k < n; k++) ys.push(stageY(k));
      for (var x = 0; x <= W; x += 8) {
        var seg = Math.min(n - 2, Math.max(0, Math.floor((x - 36) / ((W - 72) / (n - 1))))), t = Math.max(0, Math.min(1, (x - stageX(seg)) / (stageX(seg + 1) - stageX(seg))));
        var e = (1 - Math.cos(t * Math.PI)) / 2, y = ys[seg] * (1 - e) + ys[seg + 1] * e - Math.sin(t * Math.PI) * (6 + r() * 10) + (r() - .5) * 5;
        if (x < 36) y = ys[0] + (36 - x) * .15; if (x > W - 36) y = ys[n - 1] - (x - (W - 36)) * .08;
        pts.push([x, y]);
      }
      var line = "M" + pts.map(function (p) { return f(p[0]) + " " + f(p[1]); }).join("L");
      var s = '<defs><pattern id="rc-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="6" fill="#e9dfc2"/><path d="M0 0v6" stroke="#cdbd93" stroke-width="1.4"/></pattern></defs>' +
        '<path class="land" d="' + line + "L" + W + " " + H + "L0 " + H + 'Z"/><path class="ridge" d="' + line + '"/>' +
        '<path class="trail" d="' + pts.map(function (p, q) { return (q ? "L" : "M") + f(p[0]) + " " + f(p[1] - 10); }).join("") + '"/>';
      for (k = 0; k < n; k++) {
        var wx = stageX(k), wy = ys[k] - 10;
        s += '<g class="wp' + (k === n - 1 ? " end" : "") + '" style="--i:' + k + '"><line x1="' + f(wx) + '" y1="' + f(wy - 22) + '" x2="' + f(wx) + '" y2="' + f(wy - 6) + '"/><circle cx="' + f(wx) + '" cy="' + f(wy) + '" r="5.5"/></g>';
        wps.push('<span class="wp-lb" style="--i:' + k + ";left:" + f(wx / W * 100) + "%;top:calc(12px + " + f((wy - 24) / H * 100) + '%)"><i>' + (k + 1) + "</i>" + R.pts[k] + "</span>");
      }
      prof.innerHTML = s;
      $$(".wp-lb", fig).forEach(function (el) { el.remove(); });
      fig.insertAdjacentHTML("beforeend", wps.join(""));
    }
    function fill(i) {
      var R = ROUTES[i];
      $("[data-rc-num]", card).textContent = "Route " + ("0" + (i + 1)).slice(-2);
      $("[data-rc-blaze]", card).innerHTML = BLAZE[R.blaze] || "";
      $("[data-rc-name]", card).textContent = R.name;
      $("[data-rc-tag]", card).textContent = R.tag;
      $("[data-rc-get]", card).innerHTML = R.get.map(function (g) { return "<li>" + g + "</li>"; }).join("");
      $("[data-rc-stack]", card).textContent = R.stack;
      $("[data-rc-best]", card).textContent = R.best;
      card.setAttribute("aria-labelledby", boards[i].id);
      profile(i);
    }
    function pick(i, instant) {
      if (i === cur) return;
      cur = i;
      boards.forEach(function (b, k) { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", k === i ? "true" : "false"); b.tabIndex = k === i ? 0 : -1; });
      if (instant || reduceMotion) { fill(i); card.classList.remove("draw"); void card.offsetWidth; card.classList.add("draw"); return; }
      card.classList.add("swap");
      setTimeout(function () { fill(i); card.classList.remove("swap", "draw"); void card.offsetWidth; card.classList.add("draw"); }, 230);
    }
    boards.forEach(function (b, k) {
      b.addEventListener("click", function () { pick(k); });
      if (canHover) b.addEventListener("mouseenter", function () { pick(k); });
      b.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return; e.preventDefault();
        var n = (k + d + boards.length) % boards.length; boards[n].focus(); pick(n);
      });
    });
    pick(0, true);
    var ct = $(".camps-trail");
    if (ct && "IntersectionObserver" in window) new IntersectionObserver(function (es, io) { if (es[0].isIntersecting) { ct.classList.add("in"); io.disconnect(); } }, { threshold: .4 }).observe(ct);
  })();

  /* ── reviews: each register row is cloned once so the drift loops seamlessly;
     speed is set from its width so both rows move at the same pace ── */
  $$("[data-reg-row]").forEach(function (row) {
    var track = $(".reg-track", row), slips = $$(".reg-slip", track);
    while (track.scrollWidth < window.innerWidth * 1.2 && slips.length) slips.forEach(function (s) { var c = s.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.appendChild(c); });
    $$(".reg-slip", track).forEach(function (s) { var c = s.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.appendChild(c); });
    track.style.setProperty("--dur", Math.round(track.scrollWidth / 2 / 38) + "s");
  });

  /* ── footer: the site as a topo trail map, in the experience map's colours ── */
  (function () {
    var foot = $(".footer"), cv = $("[data-ft-contours]"), map = $("[data-trailmap]"), top = $("[data-to-top]");
    var panel = $(".tm-panel"), paint = function () { if (cv && panel) paintContours(cv, panel, "--mp-ink", 7.3, 4.1); };
    paint();
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(paint, 200); });
    new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
    if (map) {
      if ("IntersectionObserver" in window) new IntersectionObserver(function (es, io) {
        if (es[0].isIntersecting) { map.classList.add("in"); io.disconnect(); }
      }, { threshold: .35 }).observe(map);
      else map.classList.add("in");
    }
    if (top) top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });
  })();

  /* ── toolkit: a tree-ring cross-section ─────────────────────── */
  var ringsEl = $(".rings"), sliceHost = $("[data-slice]"), sliceTip = $("[data-slice-tip]");
  var TOOLS = [];
  try { TOOLS = JSON.parse(($("[data-tools]") || {}).textContent || "[]"); } catch (e) {}
  if (ringsEl && sliceHost && TOOLS.length) buildSlice();

  function buildSlice() {
    var C = 300, zones = [[0, 80], [80, 142], [142, 198], [198, 254], [254, 290]];
    var names = ["heartwood · languages", "ring 02 · machine learning", "ring 03 · llms & genai", "ring 04 · data & analysis", "bark · cloud & mlops"];
    var fills = ["#7a4a2b", "#a06a41", "#c28c5d", "#dcb488", "#4a3322"];
    // one shared wobble so every ring bends the way real growth rings do
    var ph = [0.7, 2.1, 4.4, 1.3];
    var ringPath = function (R) {
      var pts = [], off = (1 - R / 290) * 9;   // the pith sits a little off centre
      for (var a = 0; a <= 96; a++) {
        var t = a / 96 * Math.PI * 2;
        var k = 1 + 0.018 * Math.sin(2 * t + ph[0]) + 0.011 * Math.sin(3 * t + ph[1]) + 0.006 * Math.sin(5 * t + ph[2]) + 0.004 * Math.sin(9 * t + ph[3]);
        pts.push([C + off * 0.8 + Math.cos(t) * R * k, C - off * 0.5 + Math.sin(t) * R * k]);
      }
      return poly(pts);
    };
    var s = '<defs><filter id="woodgrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .06" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .12  0 0 0 0 .05  0 0 0 .22 0"/></filter>' +
      '<clipPath id="slice-clip"><path d="' + ringPath(290) + '"/></clipPath>';
    names.forEach(function (n, i) {
      var R = zones[i][1] - 10;
      s += '<path id="zl' + i + '" d="M' + (C - R) + " " + C + " A" + R + " " + R + " 0 1 1 " + (C + R) + " " + C + '" fill="none"/>';
    });
    s += "</defs>";
    // bark: a rough outer edge
    var bark = [], br = rng(99);
    for (var a = 0; a <= 180; a++) { var t = a / 180 * Math.PI * 2, rr = 296 + br() * 7 + Math.sin(t * 23) * 2; bark.push([C + Math.cos(t) * rr, C + Math.sin(t) * rr]); }
    s += '<g class="grow" style="--gd:0s"><path d="' + poly(bark) + '" fill="#2e1f14"/></g>';
    for (var z = zones.length - 1; z >= 0; z--) {
      s += '<g class="grow" style="--gd:' + f((z) * 0.12) + 's"><path class="zonefill" data-z="' + z + '" d="' + ringPath(zones[z][1]) + '" fill="' + fills[z] + '"/></g>';
    }
    // fine growth rings across the wood, then the zone boundaries on top
    var lines = "";
    for (var R = 6; R < 254; R += 3.4 + ((R * 7) % 5) * 0.55) lines += '<path class="ringline" d="' + ringPath(R) + '"/>';
    s += '<g class="grow" style="--gd:.2s" clip-path="url(#slice-clip)">' + lines + '<rect width="600" height="600" filter="url(#woodgrain)"/></g>';
    // drying cracks, like a real cut log
    [[0.3, 150, 268], [2.5, 190, 272], [4.1, 120, 262]].forEach(function (c) {
      var x1 = C + Math.cos(c[0]) * c[1], y1 = C + Math.sin(c[0]) * c[1], x2 = C + Math.cos(c[0] + 0.03) * c[2], y2 = C + Math.sin(c[0] + 0.03) * c[2];
      s += '<path class="grow" style="--gd:.4s" d="M' + f(x1) + " " + f(y1) + " L" + f(x2) + " " + f(y2) + " L" + f(C + Math.cos(c[0] - 0.02) * c[2]) + " " + f(C + Math.sin(c[0] - 0.02) * c[2]) + 'Z" fill="#2e1c10" opacity=".7"/>';
    });
    zones.forEach(function (zz, i) { if (i) s += '<path class="zoneline grow" style="--gd:' + f(i * 0.12) + 's" data-z="' + (i - 1) + '" d="' + ringPath(zz[0]) + '"/>'; });
    s += '<path class="zoneline grow" data-z="4" style="--gd:.5s" d="' + ringPath(290) + '"/>';
    names.forEach(function (n, i) { s += '<text class="zlabel grow" style="--gd:' + f(i * 0.12 + 0.3) + 's"><textPath href="#zl' + i + '" startOffset="50%" text-anchor="middle">' + n.toUpperCase() + "</textPath></text>"; });
    // the tools, set into their ring
    var byZone = [[], [], [], [], []];
    TOOLS.forEach(function (t, i) { byZone[t.z].push(i); });
    var marks = "";
    byZone.forEach(function (list, z) {
      var mid = (zones[z][0] + zones[z][1]) / 2 + (z === 0 ? 10 : 0), n = list.length;
      // spread evenly round the ring, leaving the top clear for the ring's label
      var gap = z === 0 ? 1.4 : 0.55, from = -Math.PI / 2 + gap, span = Math.PI * 2 - gap * 2;
      list.forEach(function (ti, j) {
        var t = TOOLS[ti], ang = from + span * (n === 1 ? 0.5 : (z === 0 ? j / (n - 1) : (j + 0.5) / n));
        var x = C + Math.cos(ang) * mid, y = C + Math.sin(ang) * mid;
        t.x = x; t.y = y;
        var inner = t.p ? '<path transform="translate(' + f(x - 9) + " " + f(y - 9) + ') scale(.75)" d="' + t.p + '"/>' : '<text x="' + f(x) + '" y="' + f(y + 3.5) + '" text-anchor="middle">' + t.m + "</text>";
        marks += '<g class="tool z' + z + '" data-ti="' + ti + '" style="--pd:' + f(0.9 + z * 0.12 + j * 0.05) + 's"><g class="pop"><circle cx="' + f(x) + '" cy="' + f(y) + '" r="16"/>' + inner + "</g></g>";
      });
    });
    s += marks;
    sliceHost.innerHTML = '<svg viewBox="-20 -20 640 640" role="img" aria-label="tree-ring diagram of my tech stack">' + s + "</svg>";

    var svgEl = $("svg", sliceHost), zoneEls = $$(".zone", ringsEl);
    var focusZone = function (z) {
      var on = z !== null;
      sliceHost.classList.toggle("focus", on);
      $$(".zonefill", svgEl).forEach(function (el) { el.classList.toggle("on", on && +el.getAttribute("data-z") === z); });
      $$(".zoneline", svgEl).forEach(function (el) { el.classList.toggle("on", on && +el.getAttribute("data-z") === z); });
      $$(".tool", svgEl).forEach(function (el) { el.classList.toggle("in-zone", on && el.classList.contains("z" + z)); });
      zoneEls.forEach(function (el) { el.classList.toggle("on", on && +el.getAttribute("data-zone") === z); });
    };
    var showTool = function (ti) {
      $$(".tool", svgEl).forEach(function (el) { el.classList.toggle("on", ti !== null && +el.getAttribute("data-ti") === ti); });
      $$("[data-tool]", ringsEl).forEach(function (b) { b.classList.toggle("on", ti !== null && +b.getAttribute("data-tool") === ti); });
      if (ti === null) { sliceTip.classList.remove("show"); return; }
      var t = TOOLS[ti], k = sliceHost.offsetWidth / 640, wrap = sliceHost.getBoundingClientRect(), host = sliceHost.parentNode.getBoundingClientRect();
      sliceTip.innerHTML = "<b>" + t.n.replace(/</g, "&lt;") + "</b><small>" + names[t.z] + "</small><span>" + t.note + "</span>";
      var px = (t.x + 20) * k + (wrap.left - host.left), py = (t.y + 20) * k + (wrap.top - host.top);
      var right = px > host.width / 2;
      sliceTip.style.left = Math.max(0, Math.min(host.width - 230, right ? px - 250 : px + 24)) + "px";
      sliceTip.style.top = Math.max(0, py - 40) + "px";
      sliceTip.classList.add("show");
    };
    $$("[data-zone-btn]", ringsEl).forEach(function (b) {
      var z = +b.getAttribute("data-zone-btn");
      b.addEventListener("mouseenter", function () { focusZone(z); });
      b.addEventListener("focus", function () { focusZone(z); });
      b.addEventListener("click", function () { focusZone(sliceHost.classList.contains("focus") && zoneEls[z].classList.contains("on") ? null : z); });
    });
    $$("[data-tool]", ringsEl).forEach(function (b) {
      var ti = +b.getAttribute("data-tool");
      b.addEventListener("mouseenter", function () { focusZone(TOOLS[ti].z); showTool(ti); });
      b.addEventListener("focus", function () { focusZone(TOOLS[ti].z); showTool(ti); });
      b.addEventListener("click", function () { focusZone(TOOLS[ti].z); showTool(ti); });
      b.addEventListener("blur", function () { showTool(null); });
    });
    $$(".tool", svgEl).forEach(function (g) {
      var ti = +g.getAttribute("data-ti");
      g.addEventListener("mouseenter", function () { focusZone(TOOLS[ti].z); showTool(ti); });
      g.addEventListener("click", function () { focusZone(TOOLS[ti].z); showTool(ti); });
    });
    $(".zones", ringsEl).addEventListener("mouseleave", function () { focusZone(null); showTool(null); });
    sliceHost.addEventListener("mouseleave", function () { focusZone(null); showTool(null); });

    if ("IntersectionObserver" in window && !reduceMotion) {
      var rio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { ringsEl.classList.add("in"); rio.disconnect(); } }, { threshold: 0.25 });
      rio.observe(ringsEl);
    } else ringsEl.classList.add("in");
  }

  /* ── signpost: live distances to each stop ─────────────── */
  var planks = $$(".plank[data-target]"), targets = [];
  function measure() {
    targets = planks.map(function (p) { var el = document.getElementById(p.getAttribute("data-target")); return el ? el.getBoundingClientRect().top + window.scrollY : 0; });
  }
  function updateSigns() {
    planks.forEach(function (p, i) {
      var dy = targets[i] - window.scrollY - 40, ft = Math.abs(dy) * 0.9, up = dy < -30;
      var txt = Math.abs(dy) < 30 ? "YOU ARE HERE" : (ft < 1000 ? Math.max(10, Math.round(ft / 10) * 10) + " FT" : (ft / 5280).toFixed(1) + " MI") + (up ? " ↑" : " ↓");
      $("[data-dist]", p).textContent = txt;
      p.classList.toggle("up", up);
    });
  }
  var sign = $(".signpost");
  if (sign && !canHover) {
    sign.addEventListener("click", function (e) {
      if (!sign.classList.contains("open")) { e.preventDefault(); sign.classList.add("open"); }
    });
    document.addEventListener("click", function (e) { if (!sign.contains(e.target)) sign.classList.remove("open"); });
  }

  /* ── one scroll loop for everything ────────────────────── */
  var ticking = false;
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    // hero parallax
    if (y < vh * 1.3 && !reduceMotion) {
      heroLayers.forEach(function (l) {
        var d = parseFloat(l.getAttribute("data-depth"));
        l.style.transform = "translate3d(" + f(-mouse.x * d * 26) + "px," + f(y * (1 - d) * 0.45 - mouse.y * d * 10) + "px,0)";
      });
    }
    // parks toggle only while the work section is on screen
    if (work && toggle) {
      var wr = work.getBoundingClientRect();
      toggle.classList.toggle("show", wr.top < vh * 0.5 && wr.bottom > vh * 0.5);
    }
    updateSigns();
    updateBar();
  }
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", function () { measure(); placeStops(); requestTick(); });
  window.addEventListener("load", function () { measure(); placeStops(); requestTick(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); placeStops(); requestTick(); });
  measure();
  requestTick();
})();
