/* ====================================================================
   Elephant — landing PWA (vanilla JS).
   Reimplementa la lógica DCLogic del diseño: beat de silencio, marquesina,
   count-up, demo curada (cajón→drawer), demo live con IA + fallback,
   voz (speechSynthesis), checkout y success overlays.
   ==================================================================== */
(function () {
  "use strict";

  var PICK_WORDS = ["armario", "grifo", "bañera", "cojín", "colchón"];

  // ---- Estado ----
  var state = {
    view: "landing",          // landing | checkout | success
    beatDone: false,
    curatedStage: "input",    // input | loading | revealed | success
    repeatMode: false,
    loadStep: 0,
    live: "pick",             // pick | assoc | loading | done
    userWord: "",
    userAssoc: "",
    scene: null,
    count: 0,
    reps: 0,
  };

  // ---- Timers / flags ----
  var beatStarted = false, beatTimer = null;
  var stepTimer = null, revealTimer = null, liveStart = 0;
  var repStarted = false, repRAF = null, repWait = null;
  var counted = false, countPoll = null, countRAF = null;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // ============================ ESCENAS ============================
  function fallbackScene(word, assoc) {
    var curated = {
      "armario": { eng: "wardrobe", hook: "GUARDA + ROPA", gloss: "suena como wardrobe", pron: "/ˈwɔːd.roʊb/",
        scene: "Abres el armario y un GUARDA de seguridad te ROBA toda la ropa de un tirón." },
      "grifo": { eng: "tap", hook: "TAPÓN", gloss: "suena como tap", pron: "/tæp/",
        scene: "Abres el grifo de la bañera pero hay un TAPón de corcho enorme bloqueando, de repente sale disparado y se llena todo de mierda en vez de agua." },
      "bañera": { eng: "bathtub", hook: "BATA + TUBO", gloss: "suena como bathtub", pron: "/ˈbɑːθ.tʌb/",
        scene: "Te metes en la bañera con una BATA puesta y respirando por un TUBO de buceo." },
      "cojín": { eng: "cushion", hook: "CUCHIllo", gloss: "suena como cushion", pron: "/ˈkʊʃ.ən/",
        scene: "Te sientas en el cojín y de dentro sale disparado un CUCHIllo que te pincha el trasero." },
      "colchón": { eng: "mattress", hook: "MAta + tRES", gloss: "suena como mattress", pron: "/ˈmæt.rəs/",
        scene: "Saltas en el colchón y de un bote MAtas a tRES ratones que dormían debajo." },
    };
    var hit = curated[(word || "").toLowerCase()];
    if (hit) return hit;
    var eng = word;
    return {
      eng: eng,
      hook: assoc ? assoc.toUpperCase() : eng.toUpperCase(),
      gloss: "suena como " + eng,
      pron: "",
      scene: "Aparece un «" + word + "» y, de golpe, hace algo imposible y ridículo que suena como «" + eng + "»; la escena es tan absurda que se te queda grabada.",
    };
  }

  // ---- Ilustraciones SVG por palabra (estilo línea, como el dromedario) ----
  var ART = {
    "cojín": '<svg viewBox="0 0 220 150" width="100%" style="max-width:230px;display:block;" fill="none" stroke="#F4EFE7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M44 86 q-8 -30 30 -34 q58 -6 86 4 q22 28 6 54 q-10 16 -42 16 q-58 4 -78 -10 q-12 -14 -2 -30 Z" fill="rgba(244,239,231,0.08)"/><circle cx="100" cy="92" r="4" fill="#F4EFE7" stroke="none"/><path d="M44 86 l-9 -7 M160 56 l9 -7 M166 108 l9 7 M52 122 l-9 7" stroke="rgba(244,239,231,0.6)" stroke-width="2.4"/><line x1="118" y1="74" x2="168" y2="30" stroke="#E8B881" stroke-width="4.5"/><path d="M168 30 l13 -9 l-1 11 l-9 4 z" fill="#E8B881" stroke="#E8B881"/><path d="M118 74 l-8 7 l11 -1 z" fill="#E8B881" stroke="#E8B881"/><path d="M150 56 l-9 7 M159 64 l-9 7" stroke="rgba(232,184,129,0.7)" stroke-width="2.2"/></svg>',
    "armario": '<svg viewBox="0 0 220 150" width="100%" style="max-width:210px;display:block;" fill="none" stroke="#F4EFE7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="78" y="30" width="64" height="104" rx="5" stroke="rgba(244,239,231,0.5)"/><line x1="110" y1="30" x2="110" y2="134" stroke="rgba(244,239,231,0.4)"/><path d="M78 34 L52 24 L52 126 L78 130" fill="rgba(244,239,231,0.06)"/><path d="M142 34 L168 24 L168 126 L142 130" fill="rgba(244,239,231,0.06)"/><path d="M96 52 q14 -7 28 0" stroke="rgba(244,239,231,0.7)" stroke-width="2.4"/><line x1="110" y1="47" x2="110" y2="52" stroke="rgba(244,239,231,0.7)" stroke-width="2.4"/><path d="M118 92 q20 6 30 -8" stroke="#E8B881" stroke-width="3.4"/><path d="M148 84 q10 -2 14 6" stroke="#E8B881" stroke-width="3"/><circle cx="120" cy="92" r="3" fill="#E8B881" stroke="none"/></svg>',
    "grifo": '<svg viewBox="0 0 220 150" width="100%" style="max-width:220px;display:block;" fill="none" stroke="#F4EFE7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M44 42 L44 66" stroke="rgba(244,239,231,0.85)"/><path d="M44 50 Q70 50 86 64 L86 80" stroke="rgba(244,239,231,0.85)"/><path d="M78 80 L94 80" stroke="rgba(244,239,231,0.85)"/><line x1="44" y1="42" x2="44" y2="32" stroke="rgba(244,239,231,0.65)" stroke-width="2.4"/><ellipse cx="44" cy="29" rx="9" ry="4" stroke="rgba(244,239,231,0.65)" stroke-width="2.4"/><g transform="translate(156 44) rotate(-26)"><rect x="-15" y="-12" width="30" height="24" rx="7" fill="rgba(232,184,129,0.22)" stroke="#E8B881" stroke-width="3"/><line x1="-15" y1="-3.5" x2="15" y2="-3.5" stroke="rgba(232,184,129,0.55)" stroke-width="1.6"/><line x1="-15" y1="4" x2="15" y2="4" stroke="rgba(232,184,129,0.55)" stroke-width="1.6"/></g><path d="M108 56 l16 -9 M114 66 l16 -9" stroke="rgba(232,184,129,0.7)" stroke-width="2.4"/><path d="M86 82 q1 11 5 20" stroke="#A9733E" stroke-width="3"/><circle cx="92" cy="100" r="3" fill="#A9733E" stroke="none"/><path d="M58 126 C55 113 73 111 81 116 C79 104 98 102 101 113 C104 101 120 103 117 115 C129 116 131 126 120 126 Z" fill="rgba(154,107,62,0.45)" stroke="#A9733E" stroke-width="2.6"/><path d="M76 118 q9 -4 17 0 M92 111 q6 -3 12 0" stroke="#A9733E" stroke-width="2" opacity="0.7"/><path d="M132 104 q5 -7 0 -14 M142 108 q5 -7 0 -14" stroke="rgba(244,239,231,0.4)" stroke-width="2"/></svg>',
    "bañera": '<svg viewBox="0 0 220 150" width="100%" style="max-width:230px;display:block;" fill="none" stroke="#F4EFE7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M40 86 L180 86 Q176 122 150 122 L70 122 Q44 122 40 86 Z" fill="rgba(244,239,231,0.06)"/><line x1="34" y1="86" x2="186" y2="86" stroke="rgba(244,239,231,0.5)"/><ellipse cx="46" cy="74" rx="5" ry="8" stroke="rgba(244,239,231,0.5)" stroke-width="2.4"/><circle cx="108" cy="100" r="12" stroke="#F4EFE7"/><path d="M118 92 q20 -10 18 -34" stroke="#E8B881" stroke-width="4"/><path d="M136 58 q0 -8 8 -8 q8 0 8 8 l0 8" stroke="#E8B881" stroke-width="4"/><circle cx="103" cy="98" r="2" fill="#241F40" stroke="none"/></svg>',
    "colchón": '<svg viewBox="0 0 220 150" width="100%" style="max-width:230px;display:block;" fill="none" stroke="#F4EFE7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="34" y="92" width="152" height="34" rx="14" fill="rgba(244,239,231,0.07)"/><path d="M58 92 v6 M84 92 v6 M110 92 v6 M136 92 v6 M162 92 v6" stroke="rgba(244,239,231,0.4)" stroke-width="2"/><path d="M70 92 q4 -14 16 -16" stroke="rgba(232,184,129,0.7)" stroke-width="2.4"/><circle cx="150" cy="84" r="9" stroke="#E8B881" stroke-width="3"/><path d="M158 80 l8 -4 M159 86 l8 2" stroke="#E8B881" stroke-width="2.4"/><circle cx="147" cy="83" r="2" fill="#E8B881" stroke="none"/><path d="M96 80 q6 -8 14 -2" stroke="rgba(232,184,129,0.6)" stroke-width="2.2"/></svg>',
  };
  var ART_GENERIC = '<svg viewBox="0 0 220 150" width="100%" style="max-width:150px;display:block;" fill="none"><g fill="rgba(244,239,231,0.85)"><ellipse cx="60" cy="78" rx="20" ry="30"/><ellipse cx="160" cy="78" rx="20" ry="30"/><path d="M70 72 C70 46 92 36 110 36 C128 36 150 46 150 72 C150 96 140 110 130 118 C131 130 132 140 124 150 L96 150 C88 140 89 130 90 118 C80 110 70 96 70 72 Z"/></g><path d="M176 34 l3 11 l11 3 l-11 3 l-3 11 l-3 -11 l-11 -3 l11 -3 z" fill="#E8B881"/></svg>';

  // ============================ RENDER ============================
  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
  }

  // Resalta en oro las MAYÚSCULAS (gancho) dentro de la escena.
  function sceneHTML(txt) {
    txt = txt || "";
    var re = /[A-ZÁÉÍÓÚÜÑ]{2,}/g, out = "", last = 0, m;
    while ((m = re.exec(txt)) !== null) {
      if (m.index > last) out += esc(txt.slice(last, m.index));
      out += '<span style="color:#E8B881;font-weight:600;">' + esc(m[0]) + "</span>";
      last = m.index + m[0].length;
    }
    if (last < txt.length) out += esc(txt.slice(last));
    return out;
  }

  function fmtThousands(n) {
    return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function makeLoadingSteps(curated) {
    var step = state.loadStep;
    var labels = curated
      ? ["Escuchando cómo suena «drawer»… «dro».", "Buscando una palabra que ya conoces y suena igual…", "Montando una sola escena, rara y vívida."]
      : ["Escuchando cómo suena en inglés…", "Buscando una palabra que ya conoces y suena igual…", "Montando una sola escena, rara y vívida."];
    return labels.map(function (label, i) {
      return { label: label, done: i < step, active: i === step, todo: i > step, lit: i <= step, dim: i > step };
    });
  }

  function stepIconSVG(st) {
    if (st.done) return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C7A61" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke="rgba(92,122,97,0.3)"/><path d="M7.5 12 l3 3 L16.5 8.5"/></svg>';
    if (st.active) return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B2752" stroke-width="2.4" stroke-linecap="round" style="animation:spin .9s linear infinite;"><path d="M12 3 a9 9 0 1 0 9 9"/></svg>';
    return '<span style="width:7px;height:7px;border-radius:50%;background:#D2C8B7;"></span>';
  }

  function renderLoadingSteps() {
    $$(".loadingSteps").forEach(function (host) {
      var curated = host.getAttribute("data-mode") === "curated";
      var steps = makeLoadingSteps(curated);
      host.innerHTML = steps.map(function (st) {
        var color = st.lit ? "#3E372E" : "#B4AA9A";
        return '<div style="display:flex;align-items:flex-start;gap:11px;text-align:left;padding:7px 0;">' +
          '<div style="width:22px;height:22px;flex:none;display:flex;align-items:center;justify-content:center;margin-top:1px;">' + stepIconSVG(st) + "</div>" +
          '<span style="font:400 16px/1.4 \'Newsreader\',serif;color:' + color + ';">' + esc(st.label) + "</span>" +
          "</div>";
      }).join("");
    });
  }

  function setHidden(el, hidden) { if (el) el.hidden = !!hidden; }

  function render() {
    var s = state;

    // Overlays
    setHidden($("#checkout"), s.view !== "checkout");
    setHidden($("#success"), s.view !== "success");
    document.body.style.overflow = (s.view === "landing") ? "" : "hidden";

    // Contador marquesina
    var rc = $("#repCount"); if (rc) rc.textContent = String(s.reps || 0);
    // Count-up
    var cn = $("#countNum"); if (cn) cn.textContent = fmtThousands(s.count);

    // ---- Demo curada: sub-vistas ----
    var ready = (s.curatedStage === "revealed" || s.curatedStage === "success");
    setHidden($('[data-c="input"]'), s.curatedStage !== "input");
    setHidden($('[data-c="loading"]'), s.curatedStage !== "loading");
    setHidden($('[data-c="ready"]'), !ready);
    setHidden($('[data-c="success"]'), s.curatedStage !== "success");
    setHidden($('[data-c="curatedCard"]'), !(s.curatedStage === "revealed" && !s.repeatMode));

    // ---- Demo live: sub-vistas ----
    setHidden($('[data-l="pick"]'), s.live !== "pick");
    setHidden($('[data-l="assoc"]'), s.live !== "assoc");
    setHidden($('[data-l="loading"]'), s.live !== "loading");
    setHidden($('[data-l="done"]'), s.live !== "done");

    renderLoadingSteps();

    // ---- Bindings de la escena live ----
    var sc = s.scene || {};
    $$('[data-bind="liveWord"]').forEach(function (el) { el.textContent = s.userWord || ""; });
    $$('[data-bind="sceneEng"]').forEach(function (el) { el.textContent = sc.eng || ""; });
    var b;
    b = $('[data-bind="scenePron"]'); if (b) b.textContent = sc.pron || "";
    b = $('[data-bind="sceneHook"]'); if (b) b.textContent = sc.hook || "";
    b = $('[data-bind="sceneGloss"]'); if (b) b.textContent = sc.gloss || "";
    b = $('[data-bind="sceneNode"]'); if (b) b.innerHTML = sceneHTML(sc.scene || "");

    var art = $("#liveArt");
    if (art) art.innerHTML = ART[(s.userWord || "").toLowerCase()] || ART_GENERIC;

    // ---- Overlay copy ----
    var word = s.userWord;
    var carry = word
      ? "Tu palabra «" + word + "» te está esperando dentro, ya con su escena."
      : "Tus primeras palabras te esperan dentro, ya con su escena.";
    var success = word
      ? "Tu palabra «" + word + "» ya está guardada con su escena. Te esperan 5 más — y un repaso justo a tiempo."
      : "Tus primeras 5 palabras te esperan dentro, cada una con su escena y su repaso justo a tiempo.";
    b = $('[data-bind="carryLine"]'); if (b) b.textContent = carry;
    b = $('[data-bind="successLine"]'); if (b) b.textContent = success;
  }

  function setState(patch) { Object.assign(state, patch); render(); }

  // ============================ VOZ ============================
  function speak(word) {
    try {
      if (!("speechSynthesis" in window) || !word) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(word);
      u.lang = "en-US";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ============================ SCROLL ============================
  function scrollToId(id, offset) {
    var e = document.getElementById(id);
    if (!e) return;
    var top = e.getBoundingClientRect().top + window.scrollY - (offset || 0);
    window.scrollTo({ top: top, behavior: "smooth" });
  }
  function scrollToTry() { scrollToId("try", 24); }
  function scrollToDemo() { scrollToId("demo"); startBeat(); }

  // ============================ BEAT ============================
  function startBeat() {
    if (beatStarted) return;
    beatStarted = true;
    beatTimer = setTimeout(function () { setState({ beatDone: true }); }, 2100);
  }

  // ============================ LOAD STEPS ============================
  function startLoadSteps() {
    if (stepTimer) clearInterval(stepTimer);
    stepTimer = setInterval(function () {
      if (state.loadStep >= 2) return;
      setState({ loadStep: state.loadStep + 1 });
    }, 1350);
  }

  // ============================ DEMO CURADA ============================
  function checkCurated() {
    if (state.curatedStage !== "input") return;
    var el = $("#curatedInput");
    var val = (el ? el.value : "").trim().toLowerCase().replace(/^(a |an |the )/, "");
    if (!val) return;
    if (val === "drawer") {
      setState({ curatedStage: "success" });
    } else {
      revealCurated();
    }
  }

  function revealCurated() {
    if (state.curatedStage !== "input") return;
    setState({ curatedStage: "loading", loadStep: 0 });
    startLoadSteps();
    revealTimer = setTimeout(function () {
      if (stepTimer) clearInterval(stepTimer);
      setState({ curatedStage: "revealed" });
    }, 4300);
  }

  // ============================ DEMO LIVE ============================
  function pickWord(w) {
    setState({ userWord: w, userAssoc: "", scene: null, live: "assoc" });
  }

  function submitAssoc() {
    setState({ userAssoc: "", live: "loading", loadStep: 0 });
    startLoadSteps();
    liveStart = Date.now();
    runGenerate();
  }

  function runGenerate() {
    // Demo guionizada: las escenas están pre-escritas (sin IA ni red). El cargador
    // solo da la sensación de que "piensa"; luego revela la escena fija.
    var word = state.userWord;
    var assoc = state.userAssoc;
    var scene = fallbackScene(word, assoc);
    if (stepTimer) clearInterval(stepTimer);
    var elapsed = Date.now() - (liveStart || 0);
    var wait = Math.max(0, 3600 - elapsed); // mínimo para que se lean los micro-pasos del cargador
    setTimeout(function () { setState({ scene: scene, loadStep: 2, live: "done" }); }, wait);
  }

  function resetLive() {
    setState({ live: "pick", userWord: "", userAssoc: "", scene: null, loadStep: 0, repeatMode: true });
    scrollToTry();
  }

  // ============================ VIEWS ============================
  function goCheckout() { setState({ view: "checkout" }); window.scrollTo(0, 0); }
  function goLanding() { setState({ view: "landing" }); }
  function paySuccess() { setState({ view: "success" }); window.scrollTo(0, 0); }

  // ============================ MARQUESINA ============================
  function startReps() {
    if (repStarted) return;
    var track = $("#repTrack");
    var words = track ? $$("[data-rep]", track) : [];
    if (!track || !words.length) { repWait = setTimeout(startReps, 200); return; }
    repStarted = true;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var tw0 = track.offsetWidth || 380;
    words.forEach(function (el, k) {
      el._x = -(k + 1) * (tw0 / words.length) - 80;
      el._was = false;
      el._base = el.style.color;
    });
    if (reduced) {
      // sin animación: deja un contador representativo y no muevas nada
      setState({ reps: 47 });
      return;
    }
    var tick = function () {
      var tw = track.offsetWidth;
      words.forEach(function (el) {
        var ew = el.offsetWidth, center = tw / 2 - ew / 2;
        el._x += 6;
        if (el._x > tw + 40) el._x = -ew - 40;
        el.style.transform = "translate(" + el._x + "px,-50%)";
        var at = Math.abs(el._x - center) < ew * 0.22;
        if (at && !el._was) {
          el._was = true; el.style.color = "#2B6FDB"; el.style.fontWeight = "600";
          setState({ reps: (state.reps || 0) + 1 });
        } else if (!at && el._was) {
          el._was = false; el.style.color = el._base; el.style.fontWeight = "400";
        }
      });
      repRAF = requestAnimationFrame(tick);
    };
    repRAF = requestAnimationFrame(tick);
  }

  // ============================ COUNT-UP ============================
  function setupCounter() {
    var check = function () {
      if (counted) { clearInterval(countPoll); return; }
      var el = $("#countNum");
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (!(r.top < window.innerHeight && r.bottom > 0 && r.left < window.innerWidth && r.right > 0)) return;
      counted = true;
      clearInterval(countPoll);
      var target = 1825, dur = 1100, t0 = performance.now();
      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) { setState({ count: target }); return; }
      var tick = function (now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        setState({ count: Math.round(target * e) });
        if (p < 1) countRAF = requestAnimationFrame(tick);
        else setState({ count: target });
      };
      countRAF = requestAnimationFrame(tick);
    };
    countPoll = setInterval(check, 200);
    check();
  }

  // ============================ BEAT POR SCROLL ============================
  function setupBeatScroll() {
    var onScroll = function () {
      if (beatStarted) return;
      var n = $("#demo");
      if (!n) return;
      if (n.getBoundingClientRect().top < window.innerHeight * 0.55) startBeat();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    setTimeout(onScroll, 400);
  }

  // ============================ EVENTOS ============================
  var ACTIONS = {
    revealCurated: revealCurated,
    sayDrawer: function () { speak("drawer"); },
    sayEng: function () { speak((state.scene || {}).eng || ""); },
    submitAssoc: submitAssoc,
    resetLive: resetLive,
    scrollToTry: scrollToTry,
    scrollToScience: function () { scrollToId("lacuenta"); },
    goCheckout: goCheckout,
    goLanding: goLanding,
    paySuccess: paySuccess,
  };

  function wire() {
    // clicks de acciones
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-act]");
      if (t) { var a = t.getAttribute("data-act"); if (ACTIONS[a]) { ACTIONS[a](); return; } }
      var sc = e.target.closest("[data-scroll]");
      if (sc) { scrollToId(sc.getAttribute("data-scroll")); }
    });

    // Enter en el input curado
    var ci = $("#curatedInput");
    if (ci) ci.addEventListener("keydown", function (e) { if (e.key === "Enter") checkCurated(); });

    // botones de palabras del selector
    var host = $("#pickWords");
    if (host) {
      host.innerHTML = PICK_WORDS.map(function (w) {
        return '<button class="pick-word" data-pick="' + esc(w) + '" style="background:#fff;border:1.5px solid #E2DACB;border-radius:999px;padding:13px 22px;font:400 21px \'Newsreader\',serif;color:#221C16;cursor:pointer;">' + esc(w) + "</button>";
      }).join("");
      host.addEventListener("click", function (e) {
        var b = e.target.closest("[data-pick]");
        if (b) pickWord(b.getAttribute("data-pick"));
      });
    }
  }

  // ============================ INIT ============================
  function init() {
    wire();
    render();
    startReps();
    setupCounter();
    setupBeatScroll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
