/* Ramsidh Hotel & Resorts — site interactions */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WA = document.body.getAttribute("data-wa");

  /* ---------- Loader ---------- */
  var loader = $(".loader");
  function ready() { document.body.classList.remove("is-loading"); }
  if (loader) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        loader.classList.add("is-done");
        ready();
        setTimeout(function () { loader.remove(); }, 700);
      }, 500);
    });
  } else { ready(); }

  /* ---------- Navbar: hide on scroll down, show on scroll up ---------- */
  var nav = $(".navbar");
  var lastY = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (nav) {
      nav.classList.toggle("is-scrolled", y > 30);
      nav.classList.toggle("is-hidden", y > 120 && y > lastY && !document.body.classList.contains("menu-open"));
    }
    lastY = y;
  }, { passive: true });

  /* Staggered nav item fade (animationDelay: index * 100ms, as in the reference) */
  $$(".nav-pill a").forEach(function (a, i) { a.style.animationDelay = (0.3 + i * 0.1) + "s"; });

  /* ---------- Mobile menu ---------- */
  var openMenu = function (open) {
    document.body.classList.toggle("menu-open", open);
    var b = $(".menu-btn"); if (b) b.setAttribute("aria-expanded", open);
  };
  var mb = $(".menu-btn"); if (mb) mb.addEventListener("click", function () { openMenu(true); });
  var mc = $(".mobile-menu__close"); if (mc) mc.addEventListener("click", function () { openMenu(false); });
  $$(".mobile-menu a").forEach(function (a) { a.addEventListener("click", function () { openMenu(false); }); });

  /* ---------- whileInView reveal ---------- */
  var revealEls = $$(".reveal");
  $$("[data-stagger]").forEach(function (g) {
    var step = parseFloat(g.getAttribute("data-stagger")) || 0.1;
    $$(".reveal", g).forEach(function (el, i) { el.style.setProperty("--d", (i * step).toFixed(2) + "s"); });
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Count-up stats ---------- */
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var run = function (el) {
      var end = parseFloat(el.getAttribute("data-count"));
      var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
      var suf = el.getAttribute("data-suffix") || "";
      if (reduceMotion) { el.textContent = end.toFixed(dec) + suf; return; }
      var t0 = null;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 1600);
        el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Hero background crossfade ---------- */
  var heroImgs = $$(".hero__bg img");
  if (heroImgs.length > 1) {
    var hi = 0;
    setInterval(function () {
      heroImgs[hi].classList.remove("is-active");
      hi = (hi + 1) % heroImgs.length;
      heroImgs[hi].classList.add("is-active");
    }, 6000);
  }

  /* ---------- Rotating word (y:20→0 in, 0→-20 out) ---------- */
  $$(".rotator").forEach(function (r) {
    var words = $$("span", r);
    if (words.length < 2) return;
    var i = 0;
    setInterval(function () {
      var cur = words[i];
      cur.classList.remove("is-active");
      cur.classList.add("is-leaving");
      setTimeout(function () { cur.classList.remove("is-leaving"); }, 500);
      i = (i + 1) % words.length;
      words[i].classList.add("is-active");
    }, 2500);
  });


  /* ---------- Gallery paging (large photo set) ---------- */
  var gal = $("[data-paged]");
  var applyPaging = null;
  if (gal) {
    var PAGE = parseInt(gal.getAttribute("data-paged"), 10) || 24;
    var more = $(".load-more");
    var limit = PAGE;
    applyPaging = function (reset) {
      if (reset) limit = PAGE;
      var visible = $$(".gallery__item", gal).filter(function (it) { return !it.classList.contains("is-hidden"); });
      visible.forEach(function (it, i) {
        var hide = i >= limit;
        it.classList.toggle("is-more", hide);
        if (!hide) it.classList.add("is-in");
      });
      if (more) {
        more.hidden = visible.length <= limit;
        $("b", more).textContent = Math.max(0, visible.length - limit);
      }
    };
    if (more) more.addEventListener("click", function () { limit += PAGE; applyPaging(false); });
    applyPaging(true);
  }

  /* ---------- Pill tabs (rooms showcase, FAQ, gallery filter) ---------- */
  $$("[data-tabs]").forEach(function (group) {
    var pills = $$(".pill", group);
    var target = $(group.getAttribute("data-tabs"));
    pills.forEach(function (p) {
      p.addEventListener("click", function () {
        pills.forEach(function (x) { x.classList.toggle("is-active", x === p); x.setAttribute("aria-selected", x === p); });
        var key = p.getAttribute("data-tab");
        if (group.hasAttribute("data-filter")) {
          $$("[data-cat]", target).forEach(function (it) {
            it.classList.toggle("is-hidden", key !== "all" && it.getAttribute("data-cat") !== key);
          });
          if (applyPaging) applyPaging(true);
        } else {
          $$("[data-panel]", target).forEach(function (pn) { pn.classList.toggle("is-active", pn.getAttribute("data-panel") === key); });
        }
      });
    });
  });

  /* ---------- Testimonials slider ---------- */
  var testi = $(".testi");
  if (testi) {
    var track = $(".testi__track", testi);
    var cards = $$(".testi-card", testi);
    var idx = 0, timer;
    var perView = function () { return window.innerWidth <= 600 ? 1 : window.innerWidth <= 1024 ? 2 : 3; };
    var go = function (n) {
      var max = Math.max(0, cards.length - perView());
      idx = n > max ? 0 : n < 0 ? max : n;
      track.style.transform = "translateX(" + (-idx * (100 / perView())) + "%)";
      clearTimeout(timer);
      timer = setTimeout(function () { go(idx + 1); }, 5000);
    };
    $(".testi__prev", testi).addEventListener("click", function () { go(idx - 1); });
    $(".testi__next", testi).addEventListener("click", function () { go(idx + 1); });
    window.addEventListener("resize", function () { go(idx); });
    go(0);
  }

  /* ---------- Accordion ---------- */
  $$(".acc__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var open = q.parentElement.classList.toggle("is-open");
      q.setAttribute("aria-expanded", open);
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = $(".lightbox");
  if (lb) {
    var lbImg = $("img", lb), lbCap = $(".lightbox__cap", lb), list = [], li = 0;
    var show = function (n) {
      li = (n + list.length) % list.length;
      lbImg.src = list[li].getAttribute("href");
      lbImg.alt = lbCap.textContent = list[li].getAttribute("data-caption") || "";
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    var close = function () { lb.classList.remove("is-open"); document.body.style.overflow = ""; };
    $$("[data-lightbox]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        list = $$("[data-lightbox]").filter(function (x) { return !x.classList.contains("is-hidden") && !x.classList.contains("is-more"); });
        show(list.indexOf(a));
      });
    });
    $(".lightbox__close", lb).addEventListener("click", close);
    $(".lightbox__prev", lb).addEventListener("click", function () { show(li - 1); });
    $(".lightbox__next", lb).addEventListener("click", function () { show(li + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(li - 1);
      if (e.key === "ArrowRight") show(li + 1);
    });
  }

  /* ---------- Get-in-touch popup (opens once per session after a delay) ---------- */
  var modal = $(".modal");
  if (modal) {
    var openModal = function () { modal.classList.add("is-open"); };
    var closeModal = function () { modal.classList.remove("is-open"); };
    $(".modal__close", modal).addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
    $$("[data-open-modal]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); openMenu(false); openModal(); });
    });
    var shown = false;
    try { shown = sessionStorage.getItem("rs-popup") === "1"; } catch (e) {}
    if (!shown && document.body.hasAttribute("data-autopopup")) {
      setTimeout(function () {
        if (document.body.classList.contains("menu-open")) return;
        openModal();
        try { sessionStorage.setItem("rs-popup", "1"); } catch (e) {}
      }, 9000);
    }
  }

  /* ---------- Enquire widget: one button for call, WhatsApp, email, booking form ---------- */
  var enq = $(".enq");
  if (enq) {
    var enqBtn = $(".enq__btn", enq);
    var setEnq = function (open) {
      enq.classList.toggle("is-open", open);
      enqBtn.setAttribute("aria-expanded", open);
    };
    enqBtn.addEventListener("click", function () { setEnq(!enq.classList.contains("is-open")); });
    $(".enq__close", enq).addEventListener("click", function () { setEnq(false); });
    $$(".enq__opt", enq).forEach(function (a) { a.addEventListener("click", function () { setEnq(false); }); });
    document.addEventListener("click", function (e) { if (!enq.contains(e.target)) setEnq(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setEnq(false); });
  }

  /* ---------- Enquiry forms → pre-filled WhatsApp message ---------- */
  var labels = { name: "Name", phone: "Phone", email: "Email", room: "Room / Purpose", checkin: "Check-in / Event date", checkout: "Check-out", guests: "Guests", message: "Message" };
  $$("form[data-enquiry]").forEach(function (form) {
    var today = new Date().toISOString().split("T")[0];
    $$('input[type="date"]', form).forEach(function (d) { d.min = today; });
    var ci = $('[name="checkin"]', form), co = $('[name="checkout"]', form);
    if (ci && co) ci.addEventListener("change", function () { co.min = ci.value; if (co.value && co.value <= ci.value) co.value = ""; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var lines = ["Hello Ramsidh Hotel & Resorts, I'd like to enquire:"];
      new FormData(form).forEach(function (v, k) { if (v && labels[k]) lines.push(labels[k] + ": " + v); });
      var st = $(".form-status", form);
      if (st) st.textContent = "Opening WhatsApp with your enquiry…";
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  });

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
