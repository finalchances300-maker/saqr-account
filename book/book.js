/* Saqar Alkhaleej - Game Book. Chapters register with Book.chapter({...}); numbers come from data.js (BOOK_DATA). */
(function () {
  "use strict";
  var DATA = window.BOOK_DATA || { config: {}, extra: {} };
  var CFG = DATA.config;
  var chapters = [];
  var widgets = {};
  var lang = "ar";

  // ---------- helpers for chapter authors ----------
  /** A number (or anything) from the game config by path, e.g. D("nests.chickSellCoins"). Arrays of {id} accept [id]. */
  function D(path, fallback) {
    var parts = String(path).replace(/\[(\w+)\]/g, ".$1").split(".");
    var v = path.indexOf("extra.") === 0 ? DATA : CFG;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) break;
      var p = parts[i];
      if (Array.isArray(v) && isNaN(+p)) v = v.filter(function (x) { return x && x.id === p; })[0];
      else v = v[p];
    }
    if (v === undefined) { console.warn("book: missing data", path); return fallback !== undefined ? fallback : "?"; }
    return v;
  }
  /** A number with thousands separators (Western digits, like the game's default). */
  function N(x, digits) {
    if (typeof x === "string" && x.indexOf(".") < 0 && isNaN(+x)) x = D(x);
    if (typeof x !== "number") return String(x);
    var s = x.toLocaleString("en-US", { maximumFractionDigits: digits == null ? 2 : digits });
    return '<span class="num">' + s + "</span>";
  }
  /** A percent from a 0..1 value. */
  function P(x, digits) { if (typeof x === "string") x = D(x); return N(Math.round(x * 100 * Math.pow(10, digits || 0)) / Math.pow(10, digits || 0), digits || 0) + "%"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function T(o) { return o == null ? "" : typeof o === "string" ? o : (o[lang] != null ? o[lang] : o.ar); }

  // ---------- content building blocks (return HTML strings) ----------
  var H = {
    /** table(headers[], rows[][], opts) */
    table: function (head, rows, cls) {
      return '<div class="tbl"><table class="' + (cls || "") + '"><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
        "</tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
    },
    tip: function (html) { return '<div class="call tip"><div>' + html + "</div></div>"; },
    next: function (html) { return '<div class="call next"><div>' + html + "</div></div>"; },
    warn: function (html) { return '<div class="call warn"><div>' + html + "</div></div>"; },
    info: function (html) { return '<div class="call info"><div>' + html + "</div></div>"; },
    /** kpis([[value, label], ...]) */
    kpis: function (items) { return '<div class="kpis">' + items.map(function (k) { return '<div class="kpi"><div class="v">' + k[0] + '</div><div class="l">' + k[1] + "</div></div>"; }).join("") + "</div>"; },
    steps: function (items) { return '<ol class="steps">' + items.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>"; },
    /** shots([["folder/name", caption, "wide"?], ...]): real game screenshots, Arabic or English picture by the page language */
    shots: function (items) {
      return '<div class="shots">' + items.map(function (s) {
        return '<figure class="shot' + (s[2] ? " " + s[2] : "") + '"><div class="ph"><img loading="lazy" data-shot="' + s[0] + '" alt=""></div>' +
          (s[1] ? "<figcaption>" + s[1] + "</figcaption>" : "") + "</figure>";
      }).join("") + "</div>";
    },
    /** a widget placeholder: H.w("bars", {...}) */
    w: function (name, args) { return '<div class="w" data-w="' + name + '" data-args="' + esc(JSON.stringify(args || {})) + '"></div>'; },
    tag: function (tier) { return '<span class="tag t-' + tier + '">' + T(TIER_NAMES[tier] || { ar: tier, en: tier }) + "</span>"; },
    sw: function (colorId) { var c = (CFG.colors || []).filter(function (x) { return x.id === colorId; })[0]; return '<span class="sw" style="background:' + (c ? c.hex : "#888") + '"></span>'; }
  };

  var TIER_NAMES = {
    common: { ar: "عادي", en: "Common" }, good: { ar: "جيد", en: "Good" }, rare: { ar: "نادر", en: "Rare" },
    elite: { ar: "نخبة", en: "Elite" }, legendary: { ar: "أسطوري", en: "Legendary" }
  };
  var STAT_NAMES = {
    speed: { ar: "السرعة", en: "Speed" }, stamina: { ar: "التحمل", en: "Stamina" }, agility: { ar: "الرشاقة", en: "Agility" },
    obedience: { ar: "الطاعة", en: "Obedience" }, beauty: { ar: "الجمال", en: "Beauty" }
  };
  var COLOR_NAMES = {
    dark: { ar: "داكن", en: "Dark" }, brown: { ar: "بني", en: "Brown" }, grey: { ar: "رمادي", en: "Grey" },
    silver: { ar: "فضي", en: "Silver" }, black: { ar: "أسود", en: "Black" }, white: { ar: "أبيض", en: "White" }
  };
  var SPECIES_NAMES = { saker: { ar: "حر", en: "Saker" }, peregrine: { ar: "شاهين", en: "Peregrine" }, gyr: { ar: "جير", en: "Gyrfalcon" } };
  var REGION_NAMES = { head: { ar: "الرأس", en: "Head" }, back: { ar: "الظهر", en: "Back" }, chest: { ar: "الصدر", en: "Chest" }, tail: { ar: "الذيل", en: "Tail" } };
  var STATS = ["speed", "stamina", "agility", "obedience", "beauty"];

  var UI = {
    title: { ar: "كتاب صقار الخليج", en: "The Saqar Alkhaleej Book" },
    game: { ar: "صقار الخليج", en: "Saqar Alkhaleej" },
    sub: { ar: "كل أنظمة اللعبة بالأرقام الحقيقية والصور من داخل اللعبة. اقرأ، جرّب الحاسبات، وخطّط لسلالتك.", en: "Every system of the game, with the real numbers and pictures from inside the game. Read, try the calculators, plan your line." },
    search: { ar: "ابحث في الكتاب…", en: "Search the book…" },
    chapters: { ar: "الفصول", en: "Chapters" },
    home: { ar: "الرئيسية", en: "Home" },
    prev: { ar: "→ السابق", en: "← Previous" }, next: { ar: "التالي ←", en: "Next →" },
    none: { ar: "لا توجد نتائج", en: "No results" },
    upd: { ar: "الأرقام محدّثة من إعدادات اللعبة", en: "Numbers taken from the game's settings" },
    other: { ar: "English", en: "العربية" },
    soon: { ar: "قريبًا", en: "Coming soon" }
  };

  // ---------- registry ----------
  var Book = window.Book = {
    D: D, N: N, P: P, H: H, T: T, STATS: STATS, STAT_NAMES: STAT_NAMES, COLOR_NAMES: COLOR_NAMES, SPECIES_NAMES: SPECIES_NAMES,
    REGION_NAMES: REGION_NAMES, TIER_NAMES: TIER_NAMES, data: DATA,
    get lang() { return lang; },
    /** Book.chapter({id, order, icon, cover, title:{ar,en}, blurb:{ar,en}, sections: () => [{id, title:{ar,en}, html:{ar,en}}]}) */
    chapter: function (c) { chapters.push(c); chapters.sort(function (a, b) { return a.order - b.order; }); },
    /** Book.widget(name, function (el, args, lang) {...}) */
    widget: function (name, fn) { widgets[name] = fn; }
  };

  // ---------- page ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function sectionsOf(c) { if (!c._s) c._s = typeof c.sections === "function" ? c.sections() : c.sections; return c._s; }

  function parseHash() {
    var h = decodeURIComponent(location.hash.replace(/^#/, "")).split("/");
    var l = h[0] === "en" ? "en" : "ar";
    return { lang: l, ch: h[1] || "", sec: h[2] || "" };
  }
  function go(ch, sec) { location.hash = "#" + lang + (ch ? "/" + ch + (sec ? "/" + sec : "") : ""); }

  function render() {
    var r = parseHash();
    var langChanged = r.lang !== lang || !document.body.dataset.ready;
    lang = r.lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = T(UI.title);
    if (langChanged) { chapters.forEach(function (c) { c._s = null; }); renderChrome(); }
    document.body.dataset.ready = "1";
    var key = lang + "/" + r.ch;
    if (key !== shown) {
      shown = key;
      var c = chapters.filter(function (x) { return x.id === r.ch; })[0];
      $("#main").innerHTML = c ? chapterHtml(c) : homeHtml();
      mount($("#main"));
      document.querySelectorAll(".side a[data-ch]").forEach(function (a) { a.classList.toggle("on", a.dataset.ch === r.ch); });
      buildIndex();
    }
    document.body.classList.remove("menu-open");
    var target = r.sec && document.getElementById(r.sec);
    if (target) requestAnimationFrame(function () { requestAnimationFrame(function () { target.scrollIntoView({ behavior: "auto", block: "start" }); }); });
    else window.scrollTo(0, 0);
  }
  var shown = "";

  function renderChrome() {
    $("#brand-name").textContent = T(UI.game) + " · " + (lang === "ar" ? "الكتاب" : "Book");
    $("#q").placeholder = T(UI.search);
    $("#lang").textContent = T(UI.other);
    var side = '<div class="label">' + T(UI.chapters) + "</div>" +
      '<a href="#' + lang + '" data-ch=""><img src="icons/bar_home.png" alt="">' + T(UI.home) + "</a>" +
      chapters.map(function (c) { return '<a href="#' + lang + "/" + c.id + '" data-ch="' + c.id + '"><img src="' + c.icon + '" alt="">' + T(c.title) + "</a>"; }).join("");
    $("#side").innerHTML = side;
  }

  function homeHtml() {
    var nextCount = chapters.filter(function (c) { return c.next; }).length;
    return '<div class="hero"><div class="txt"><h1>' + T(UI.title) + "</h1><p>" + T(UI.sub) + '</p><div class="chips"><span class="chip gold">📖 ' +
      chapters.length + " " + T(UI.chapters) + '</span><span class="chip">🔢 ' + T(UI.upd) + " · " + '<span class="num">' + DATA.built + "</span></span></div></div>" +
      '<div class="pic"><img data-shot="village/village" alt=""></div></div>' +
      '<div class="grid">' + chapters.map(function (c, i) {
        return '<a class="ccard" href="#' + lang + "/" + c.id + '"><img src="' + c.icon + '" alt=""><div><span class="n">' + (i + 1) + "</span><b>" + T(c.title) + "</b><small>" + T(c.blurb) + "</small></div></a>";
      }).join("") + "</div>" + '<p class="foot">' + T(UI.game) + " · " + T(UI.upd) + "</p>";
  }

  function chapterHtml(c) {
    var i = chapters.indexOf(c), s = sectionsOf(c);
    var prev = chapters[i - 1], next = chapters[i + 1];
    return '<div class="chead"><img src="' + c.icon + '" alt=""><div><h1>' + T(c.title) + "</h1><p>" + T(c.blurb) + "</p></div></div>" +
      '<nav class="toc">' + s.map(function (x) { return '<a class="chip" href="#' + lang + "/" + c.id + "/" + x.id + '">' + T(x.title) + "</a>"; }).join("") + "</nav>" +
      s.map(function (x) { return '<section class="s" id="' + x.id + '"><h2>' + T(x.title) + "</h2>" + T(x.html) + "</section>"; }).join("") +
      '<div class="pager">' + (prev ? '<a class="btn" href="#' + lang + "/" + prev.id + '">' + T(UI.prev) + " · " + T(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a class="btn" href="#' + lang + "/" + next.id + '">' + T(next.title) + " · " + T(UI.next) + "</a>" : "") + "</div>";
  }

  function mount(root) {
    root.querySelectorAll("img[data-shot]").forEach(function (img) {
      var name = img.dataset.shot;
      img.src = "img/" + lang + "/" + name + ".jpg";
      img.onerror = function () { if (img.dataset.tried) { img.closest(".shot") ? img.closest(".shot").style.display = "none" : (img.style.display = "none"); return; } img.dataset.tried = 1; img.src = "img/" + (lang === "ar" ? "en" : "ar") + "/" + name + ".jpg"; };
    });
    root.querySelectorAll(".shot .ph").forEach(function (ph) { ph.onclick = function () { var lb = $("#lb"); lb.querySelector("img").src = ph.querySelector("img").src; lb.classList.add("on"); }; });
    root.querySelectorAll(".w[data-w]").forEach(function (el) {
      var fn = widgets[el.dataset.w];
      if (!fn) { el.textContent = "?" + el.dataset.w; return; }
      try { fn(el, JSON.parse(el.dataset.args || "{}"), lang); } catch (e) { console.error(e); el.textContent = "widget error"; }
    });
  }

  // ---------- search ----------
  var index = [];
  function buildIndex() {
    index = [];
    chapters.forEach(function (c) {
      sectionsOf(c).forEach(function (s) {
        var div = document.createElement("div"); div.innerHTML = T(s.html);
        index.push({ ch: c, s: s, text: (T(c.title) + " " + T(s.title) + " " + div.textContent).toLowerCase() });
      });
    });
  }
  function search(q) {
    var box = $("#results");
    q = q.trim().toLowerCase();
    if (q.length < 2) { box.classList.remove("on"); return; }
    var words = q.split(/\s+/);
    var hits = index.filter(function (x) { return words.every(function (w) { return x.text.indexOf(w) >= 0; }); }).slice(0, 25);
    box.innerHTML = hits.length ? hits.map(function (x) {
      return '<a href="#' + lang + "/" + x.ch.id + "/" + x.s.id + '">' + T(x.s.title) + "<small>" + T(x.ch.title) + "</small></a>";
    }).join("") : '<a>' + T(UI.none) + "</a>";
    box.classList.add("on");
  }

  // ---------- generic widgets ----------
  /** bars: {title:{ar,en}, items:[{label:{ar,en}|string, value:number, text?:string}], max?, unit?} */
  Book.widget("bars", function (el, a) {
    var max = a.max || Math.max.apply(null, a.items.map(function (x) { return x.value; }));
    el.innerHTML = (a.title ? '<div class="wt">' + T(a.title) + "</div>" : "") + '<div class="bars">' + a.items.map(function (x) {
      return '<div class="b"><span>' + T(x.label) + '</span><div class="track"><div class="fill" style="width:' + Math.max(1, x.value / max * 100) + '%"></div></div><span class="v">' +
        (x.text != null ? T(x.text) : x.value.toLocaleString("en-US") + (a.unit ? " " + T(a.unit) : "")) + "</span></div>";
    }).join("") + "</div>";
  });
  /** ranges: {title, items:[{label, min, max}], scaleMax} - a min..max band per row (rival ladder, stat ranges) */
  Book.widget("ranges", function (el, a) {
    var M = a.scaleMax || 100;
    el.innerHTML = (a.title ? '<div class="wt">' + T(a.title) + "</div>" : "") + '<div class="bars">' + a.items.map(function (x) {
      var dir = lang === "ar" ? "right" : "left";
      return '<div class="b"><span>' + T(x.label) + '</span><div class="track"><div class="rng" style="' + dir + ":" + (x.min / M * 100) + "%;width:" + Math.max(1, (x.max - x.min) / M * 100) +
        '%"></div></div><span class="v">' + x.min + "–" + x.max + "</span></div>";
    }).join("") + "</div>";
  });
  /** timeline: {title, items:[{icon, label, text}]} */
  Book.widget("timeline", function (el, a) {
    el.innerHTML = (a.title ? '<div class="wt">' + T(a.title) + "</div>" : "") + '<div class="timeline">' + a.items.map(function (x) {
      return '<div class="tl"><div class="dot">' + (x.icon || "•") + "</div><b>" + T(x.label) + "</b><small>" + T(x.text) + "</small></div>";
    }).join("") + "</div>";
  });

  // ---------- breeding calculator (rule "now" = live; rule "next" = update 0.1.2) ----------
  function sexBonus(sex, stat) { var m = (CFG.sexModifiers || {})[sex] || {}; return m[stat] || 0; }
  function roundAway(x) { return x < 0 ? -Math.round(-x) : Math.round(x); }
  function chickStats(sp, mom, dad, chickSex, rule, rnd) {
    var spec = D("species[" + sp + "]"), b = CFG.breeding, out = {};
    var picked = STATS[Math.floor(rnd() * 5)];
    STATS.forEach(function (st) {
      var w = spec.stats[st], wildMean = (w.wildMin + w.wildMax) / 2;
      var mid = ((mom[st] - sexBonus("female", st)) + (dad[st] - sexBonus("male", st))) / 2;
      var v;
      if (rule === "now") {
        var pull = mid < wildMean ? b.regressionUp : b.regressionToMean;
        v = mid + (wildMean - mid) * pull + (rnd() + rnd() - 1) * b.statVariation;
      } else {
        var p = b.push, m = b.mutation;
        v = mid;
        if (mid < wildMean) { var pc = mid < p.edgeLow ? p.chanceLow : mid < p.edgeHigh ? p.chanceMid : p.chanceHigh; if (rnd() < pc) v += p.size; }
        if (st === picked) {
          var mc = mid < m.edgeLow ? m.chanceLow : mid < m.edgeHigh ? m.chanceMid : m.chanceHigh;
          if (rnd() < mc) {
            var size = m.sizeMin + Math.floor(rnd() * (m.sizeMax - m.sizeMin + 1));
            var up = rnd() < (mid < m.upEdge ? m.upChanceBelow : m.upChanceAbove);
            v += up ? size : -size;
          }
        }
      }
      var bonus = sexBonus(chickSex, st);
      var cap = Math.min(100, w.cap + bonus);
      out[st] = Math.max(0, Math.min(cap, roundAway(v + bonus)));
    });
    return out;
  }
  Book.chickStats = chickStats;
  Book.widget("breed", function (el, a) {
    var L = {
      t: { ar: "حاسبة التزاوج", en: "Breeding calculator" }, sp: { ar: "السلالة", en: "Species" },
      mom: { ar: "الأم ♀", en: "Mother ♀" }, dad: { ar: "الأب ♂", en: "Father ♂" },
      rule: { ar: "القاعدة", en: "Rule" }, now: { ar: "الآن", en: "Now" }, nxt: { ar: "تحديث 0.1.2", en: "Update 0.1.2" },
      chick: { ar: "الفرخ", en: "Chick" }, f: { ar: "أنثى", en: "Female" }, m: { ar: "ذكر", en: "Male" },
      rng: { ar: "المدى", en: "Range" }, avg: { ar: "المتوسط", en: "Average" }, better: { ar: "أفضل من متوسط الأبوين", en: "Better than parents' average" },
      note: { ar: "محاكاة 20,000 فرخ بنفس قواعد الخادم. الأرقام التي تُدخلها هي الأرقام الظاهرة في بطاقة الصقر (مع ميزة الجنس).", en: "20,000 simulated chicks with the server's own rules. Enter the numbers shown on the falcon card (sex bonus included)." }
    };
    var st = { sp: a.species || "saker", rule: a.rule || "now", sex: "female",
      mom: a.mom || { speed: 30, stamina: 28, agility: 22, obedience: 20, beauty: 24 }, dad: a.dad || { speed: 24, stamina: 22, agility: 26, obedience: 27, beauty: 22 } };
    function draw() {
      var html = '<div class="wt">' + T(L.t) + "</div>" +
        '<div class="row"><label>' + T(L.sp) + ' <select data-k="sp">' + ["saker", "peregrine", "gyr"].map(function (s) { return '<option value="' + s + '"' + (s === st.sp ? " selected" : "") + ">" + T(SPECIES_NAMES[s]) + "</option>"; }).join("") + "</select></label>" +
        '<span class="seg" data-k="rule"><button data-v="now"' + (st.rule === "now" ? ' class="on"' : "") + ">" + T(L.now) + '</button><button data-v="next"' + (st.rule === "next" ? ' class="on"' : "") + ">" + T(L.nxt) + "</button></span>" +
        '<span class="seg" data-k="sex"><button data-v="female"' + (st.sex === "female" ? ' class="on"' : "") + ">" + T(L.chick) + " " + T(L.f) + '</button><button data-v="male"' + (st.sex === "male" ? ' class="on"' : "") + ">" + T(L.m) + "</button></span></div>" +
        '<div class="parents"><span></span><span class="h fem">' + T(L.mom) + '</span><span class="h mal">' + T(L.dad) + "</span>" +
        STATS.map(function (s) { return "<label>" + T(STAT_NAMES[s]) + '</label><input type="number" min="0" max="100" data-p="mom" data-s="' + s + '" value="' + st.mom[s] + '"><input type="number" min="0" max="100" data-p="dad" data-s="' + s + '" value="' + st.dad[s] + '">'; }).join("") +
        '</div><div class="breed-out"></div><p style="font-size:13px;color:var(--muted);margin-top:10px">' + T(L.note) + "</p>";
      el.innerHTML = html;
      el.querySelector("select").onchange = function (e) { st.sp = e.target.value; calc(); };
      el.querySelectorAll(".seg").forEach(function (seg) { seg.onclick = function (e) { var v = e.target.dataset.v; if (!v) return; st[seg.dataset.k] = v; draw(); }; });
      el.querySelectorAll("input[data-p]").forEach(function (inp) { inp.oninput = function () { st[inp.dataset.p][inp.dataset.s] = Math.max(0, Math.min(100, +inp.value || 0)); calc(); }; });
      calc();
    }
    function calc() {
      var n = 20000, seed = 12345, rnd = function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      var acc = {}; STATS.forEach(function (s) { acc[s] = { min: 999, max: -1, sum: 0, better: 0, h: {} }; });
      for (var i = 0; i < n; i++) {
        var c = chickStats(st.sp, st.mom, st.dad, st.sex, st.rule, rnd);
        STATS.forEach(function (s) {
          var a2 = acc[s], v = c[s], parAvg = (st.mom[s] + st.dad[s]) / 2;
          a2.min = Math.min(a2.min, v); a2.max = Math.max(a2.max, v); a2.sum += v; if (v > parAvg) a2.better++; a2.h[v] = (a2.h[v] || 0) + 1;
        });
      }
      el.querySelector(".breed-out").innerHTML = STATS.map(function (s) {
        var a2 = acc[s], keys = []; for (var k = a2.min; k <= a2.max; k++) keys.push(k);
        var peak = Math.max.apply(null, keys.map(function (k) { return a2.h[k] || 0; }));
        var parAvg = (st.mom[s] + st.dad[s]) / 2;
        return '<div class="o"><b>' + T(STAT_NAMES[s]) + '</b><div class="hist">' + keys.map(function (k) {
          return '<i title="' + k + ": " + ((a2.h[k] || 0) / n * 100).toFixed(1) + '%" class="' + (Math.abs(k - parAvg) < 0.5 ? "par" : "") + '" style="height:' + ((a2.h[k] || 0) / peak * 100) + '%"></i>';
        }).join("") + "</div><small>" + T(L.rng) + ': <span class="num">' + a2.min + "–" + a2.max + "</span> · " + T(L.avg) + ': <span class="num">' + (a2.sum / n).toFixed(1) +
          "</span><br>" + T(L.better) + ': <span class="num">' + (a2.better / n * 100).toFixed(0) + "%</span></small></div>";
      }).join("");
    }
    draw();
  });

  // ---------- colour genes: one region, 2 genes from each parent ----------
  Book.widget("genes", function (el, a) {
    var colors = (CFG.colors || []).slice().sort(function (x, y) { return y.dominance - x.dominance; });
    var dom = {}; colors.forEach(function (c) { dom[c.id] = c.dominance; });
    var st = { m1: a.m1 || "silver", m2: a.m2 || "white", f1: a.f1 || "grey", f2: a.f2 || "white" };
    var L = { t: { ar: "حاسبة الجينات (منطقة واحدة)", en: "Gene calculator (one region)" }, mom: { ar: "جينا الأم", en: "Mother's genes" }, dad: { ar: "جينا الأب", en: "Father's genes" },
      looks: { ar: "يظهر", en: "Looks" }, res: { ar: "الفرخ: كل خانة احتمالها 25%", en: "Chick: each box is a 25% chance" } };
    function shows(a1, a2) { return dom[a1] >= dom[a2] ? a1 : a2; }
    function opt(sel) { return colors.map(function (c) { return '<option value="' + c.id + '"' + (c.id === sel ? " selected" : "") + ">" + T(COLOR_NAMES[c.id]) + "</option>"; }).join(""); }
    function cell(g1, g2) { var s = shows(g1, g2); return '<div class="' + (s === "white" ? "white" : "") + '">' + H.sw(g1) + H.sw(g2) + "<br>" + T(L.looks) + ": <b>" + H.sw(s) + T(COLOR_NAMES[s]) + "</b></div>"; }
    function draw() {
      el.innerHTML = '<div class="wt">' + T(L.t) + '</div><div class="row"><label class="fem">' + T(L.mom) + ' <select data-k="m1">' + opt(st.m1) + '</select> <select data-k="m2">' + opt(st.m2) + "</select></label> " +
        '<label class="mal">' + T(L.dad) + ' <select data-k="f1">' + opt(st.f1) + '</select> <select data-k="f2">' + opt(st.f2) + "</select></label></div>" +
        '<div class="row" style="font-size:14px;color:var(--muted)">♀ ' + T(L.looks) + ": " + H.sw(shows(st.m1, st.m2)) + T(COLOR_NAMES[shows(st.m1, st.m2)]) + " · ♂ " + T(L.looks) + ": " + H.sw(shows(st.f1, st.f2)) + T(COLOR_NAMES[shows(st.f1, st.f2)]) + "</div>" +
        "<div style=\"font-size:14px;color:var(--muted)\">" + T(L.res) + '</div><div class="gene-grid"><div class="hd"></div><div class="hd mal">' + H.sw(st.f1) + '</div><div class="hd mal">' + H.sw(st.f2) + "</div>" +
        '<div class="hd fem">' + H.sw(st.m1) + "</div>" + cell(st.m1, st.f1) + cell(st.m1, st.f2) + '<div class="hd fem">' + H.sw(st.m2) + "</div>" + cell(st.m2, st.f1) + cell(st.m2, st.f2) + "</div>";
      el.querySelectorAll("select").forEach(function (s) { s.onchange = function () { st[s.dataset.k] = s.value; draw(); }; });
    }
    draw();
  });

  // ---------- rarity calculator ----------
  Book.widget("rarity", function (el, a) {
    var R = CFG.rarity, W = CFG.colorRegions.regionWeights, regions = Object.keys(W);
    var st = { s: { speed: 60, stamina: 60, agility: 60, obedience: 60, beauty: 60 }, c: { head: "silver", back: "grey", chest: "silver", tail: "grey" } };
    var L = { t: { ar: "حاسبة الندرة", en: "Rarity calculator" }, score: { ar: "النقاط", en: "Score" }, cb: { ar: "ميزة اللون", en: "Colour bonus" }, avg: { ar: "متوسط الصفات الموزون", en: "Weighted stat average" } };
    function draw() {
      var colors = Object.keys(R.colorBonus);
      el.innerHTML = '<div class="wt">' + T(L.t) + '</div><div class="two"><div>' + STATS.map(function (s) {
        return '<label>' + T(STAT_NAMES[s]) + ' <b class="num" data-v="' + s + '">' + st.s[s] + '</b> <span style="color:var(--dim)">×' + R.statWeights[s] + '</span></label><input type="range" min="0" max="100" data-s="' + s + '" value="' + st.s[s] + '">';
      }).join("") + "</div><div>" + regions.map(function (r) {
        return '<div class="row"><label style="min-width:70px">' + T(REGION_NAMES[r]) + ' <span style="color:var(--dim)">' + W[r] + '%</span></label><select data-r="' + r + '">' + colors.map(function (c) { return '<option value="' + c + '"' + (c === st.c[r] ? " selected" : "") + ">" + T(COLOR_NAMES[c]) + "</option>"; }).join("") + "</select></div>";
      }).join("") + '<div class="out"></div></div></div>';
      el.querySelectorAll("input[data-s]").forEach(function (i) { i.oninput = function () { st.s[i.dataset.s] = +i.value; el.querySelector('[data-v="' + i.dataset.s + '"]').textContent = i.value; calc(); }; });
      el.querySelectorAll("select[data-r]").forEach(function (s) { s.onchange = function () { st.c[s.dataset.r] = s.value; calc(); }; });
      calc();
    }
    function calc() {
      var avg = 0; STATS.forEach(function (s) { avg += st.s[s] * R.statWeights[s]; });
      var cb = 0, sumW = 0; regions.forEach(function (r) { cb += (R.colorBonus[st.c[r]] || 0) * W[r]; sumW += W[r]; }); cb /= sumW;
      var first = st.c[regions[0]], solid = regions.every(function (r) { return st.c[r] === first; });
      if (solid) cb += (R.solidColorBonus[first] || 0);
      var score = avg + cb, tier = R.tiers[0].id;
      R.tiers.forEach(function (t) { if (score >= t.minScore) tier = t.id; });
      var bar = R.tiers.map(function (t, i) { var end = i + 1 < R.tiers.length ? R.tiers[i + 1].minScore : 116; return '<span style="width:' + ((end - t.minScore) / 116 * 100) + "%;background:var(--" + t.id + ')"></span>'; }).join("");
      el.querySelector(".out").innerHTML = '<div class="score num">' + score.toFixed(1) + "</div> " + H.tag(tier) +
        '<div class="tierbar">' + bar + '<i class="mark" style="left:' + Math.min(100, score / 116 * 100) + '%"></i></div>' +
        '<small style="color:var(--muted)">' + T(L.avg) + ': <span class="num">' + avg.toFixed(1) + "</span> + " + T(L.cb) + ': <span class="num">' + cb.toFixed(1) + "</span></small>";
    }
    draw();
  });

  // ---------- release meter (try the race start) ----------
  Book.widget("release", function (el) {
    var R = CFG.race.release;
    var L = { t: { ar: "جرّب الإطلاق: اضغط على الشريط", en: "Try the release: tap the bar" }, q: { ar: "الجودة", en: "Quality" }, p: { ar: "قوة الانطلاق", en: "Start power" },
      z: { green: { ar: "أخضر", en: "Green" }, yellow: { ar: "أصفر", en: "Yellow" }, orange: { ar: "برتقالي", en: "Orange" }, red: { ar: "أحمر", en: "Red" } }, again: { ar: "مرة أخرى", en: "Again" } };
    var center = 0.35 + Math.random() * 0.3, t0 = performance.now(), stopped = false, raf;
    var g = R.greenWidth / 2, y = (R.greenWidth + R.yellowWidth) / 2, o = (R.greenWidth + R.yellowWidth + R.orangeWidth) / 2;
    function zones() {
      var parts = [[0, center - o, "red"], [center - o, center - y, "orange"], [center - y, center - g, "yellow"], [center - g, center + g, "green"], [center + g, center + y, "yellow"], [center + y, center + o, "orange"], [center + o, 1, "red"]];
      return parts.map(function (p) { return '<span style="width:' + (Math.max(0, p[1] - p[0]) * 100) + "%;background:var(--" + p[2] + ')"></span>'; }).join("");
    }
    el.innerHTML = '<div class="wt">' + T(L.t) + '</div><div class="meter">' + zones() + '<i class="needle"></i></div><div class="row out" style="min-height:34px"></div>';
    var needle = el.querySelector(".needle");
    function pos(now) { var u = ((now - t0) / 1000) / R.sweepSeconds; var f = u % 2; return f < 1 ? f : 2 - f; }
    function tick(now) { if (!stopped) { needle.style.left = (pos(now) * 100) + "%"; raf = requestAnimationFrame(tick); } }
    raf = requestAnimationFrame(tick);
    el.querySelector(".meter").onclick = function () {
      if (stopped) return;
      stopped = true; cancelAnimationFrame(raf);
      var x = pos(performance.now()), q = Math.max(0, 1 - 2 * Math.abs(x - center));
      var zone = q >= 0.9 ? "green" : q >= 0.7 ? "yellow" : q >= 0.4 ? "orange" : "red";
      var power = R[zone + "StartPower"];
      el.querySelector(".out").innerHTML = '<b style="color:var(--' + zone + ')">' + T(L.z[zone]) + "</b> · " + T(L.q) + ': <span class="num">' + q.toFixed(2) + "</span> · " + T(L.p) + ': <span class="num">' + power + '</span> <button class="btn">' + T(L.again) + "</button>";
      el.querySelector(".out .btn").onclick = function (e) { e.stopPropagation(); Book.widgetsMount(el, "release"); };
    };
  });
  Book.widgetsMount = function (el, name) { el.innerHTML = ""; widgets[name](el, JSON.parse(el.dataset.args || "{}"), lang); };

  // ---------- start ----------
  document.addEventListener("DOMContentLoaded", function () {
    $("#lang").onclick = function () { var r = parseHash(); location.hash = "#" + (lang === "ar" ? "en" : "ar") + (r.ch ? "/" + r.ch : ""); };
    $("#menu").onclick = function () { document.body.classList.toggle("menu-open"); };
    $("#q").oninput = function (e) { search(e.target.value); };
    $("#q").onkeydown = function (e) { if (e.key === "Escape") { e.target.value = ""; search(""); } };
    document.addEventListener("click", function (e) { if (!e.target.closest(".search")) $("#results").classList.remove("on"); });
    $("#results").onclick = function () { $("#results").classList.remove("on"); $("#q").value = ""; };
    $("#lb").onclick = function () { $("#lb").classList.remove("on"); };
    window.addEventListener("hashchange", render);
    render();
  });
})();
