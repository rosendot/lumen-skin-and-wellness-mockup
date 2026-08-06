/* Lumen Skin & Wellness — shared interactions across all pages.
   Ported from the design source's lumen.js. Each block is a no-op on pages
   that don't contain its markup, so this loads once from the layout. */

/* --- Header: transparent over hero, solid white on scroll --- */
const header = document.getElementById("header");
if (header) {
  const onScroll = () => header.classList.toggle("solid", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* --- Mobile nav toggle --- */
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");
if (navToggle && nav) {
  const focusables = () =>
    Array.from(nav.querySelectorAll<HTMLElement>("a[href]")).filter(
      (el) => el.offsetParent !== null
    );

  const isOpen = () => navToggle.getAttribute("aria-expanded") === "true";

  function openNav() {
    nav!.classList.add("open");
    navToggle!.setAttribute("aria-expanded", "true");
    navToggle!.setAttribute("aria-label", "Close menu");
    // Lock the page. Without this the hero scrolls away behind the open
    // drawer, so closing it lands you somewhere else entirely.
    document.body.style.overflow = "hidden";
    focusables()[0]?.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeNav(restoreFocus = true) {
    nav!.classList.remove("open");
    navToggle!.setAttribute("aria-expanded", "false");
    navToggle!.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (restoreFocus) navToggle!.focus();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeNav();
      return;
    }
    // Trap Tab inside the drawer. Untrapped, the first Tab leaves the menu
    // and lands on the hero buttons underneath it — a keyboard user driving
    // content they cannot see. The burger is included so Tab reaches the
    // control that closes the panel.
    if (e.key === "Tab") {
      const items = [...focusables(), navToggle!];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  navToggle.addEventListener("click", () => {
    if (isOpen()) closeNav();
    else openNav();
  });

  // Close on link tap. Every link is a real navigation, so don't steal focus
  // back to the burger on the way out.
  nav.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest(".lnk") || t.closest(".btn")) closeNav(false);
  });

  // Close when the page behind the scrim is tapped — the gesture people reach
  // for before hunting for the X.
  document.addEventListener("click", (e) => {
    if (!isOpen()) return;
    const t = e.target as Node;
    if (nav.contains(t) || navToggle.contains(t)) return;
    closeNav();
  });

  // Reset if the viewport grows past the drawer breakpoint while it's open,
  // or the body stays locked with no visible menu to unlock it.
  window.matchMedia("(min-width: 721px)").addEventListener("change", (e) => {
    if (e.matches && isOpen()) closeNav(false);
  });
}

/* --- Before / After drag sliders (multiple instances per page) --- */
document.querySelectorAll<HTMLElement>("[data-ba]").forEach((slider) => {
  const before = slider.querySelector<HTMLElement>(".ba-before");
  const inner = slider.querySelector<HTMLElement>(".ba-inner");
  const handle = slider.querySelector<HTMLElement>(".ba-handle");
  if (!before || !handle) return;

  let dragging = false;

  // The before layer is clipped by width, so its inner wrapper has to stay
  // the full slider width or the image would squash as the handle moves.
  const sizeInner = () => {
    if (inner) inner.style.width = `${slider.clientWidth}px`;
  };
  const setPos = (pct: number) => {
    const p = Math.max(2, Math.min(98, pct));
    before.style.width = `${p}%`;
    handle.style.left = `${p}%`;
  };
  const fromEvent = (e: MouseEvent | TouchEvent) => {
    const rect = slider.getBoundingClientRect();
    const clientX = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    setPos(((clientX - rect.left) / rect.width) * 100);
  };

  sizeInner();
  setPos(50);
  window.addEventListener("resize", sizeInner);

  const start = (e: MouseEvent | TouchEvent) => {
    dragging = true;
    fromEvent(e);
    e.preventDefault();
  };
  const move = (e: MouseEvent | TouchEvent) => {
    if (dragging) fromEvent(e);
  };
  const end = () => {
    dragging = false;
  };

  slider.addEventListener("mousedown", start);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  slider.addEventListener("touchstart", start, { passive: false });
  slider.addEventListener("touchmove", move, { passive: false });
  slider.addEventListener("touchend", end);
});

/* --- Testimonial slider (single, crossfade, auto-advance) --- */
const slider = document.querySelector<HTMLElement>("[data-slider]");
if (slider) {
  const slides = Array.from(slider.querySelectorAll<HTMLElement>(".t-slide"));
  const dots = Array.from(slider.querySelectorAll<HTMLElement>(".t-dot"));
  let idx = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const show = (n: number) => {
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  };
  const stop = () => {
    if (timer) clearInterval(timer);
  };
  const start = () => {
    stop();
    timer = setInterval(() => show(idx + 1), 7000);
  };

  dots.forEach((d, i) =>
    d.addEventListener("click", () => {
      show(i);
      start();
    }),
  );
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  show(0);
  // Auto-advance is decorative motion — leave it off for anyone who's asked
  // to reduce it. The dots still work.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) start();
}

/* --- Live hours status: Tue–Sat 9am–6pm, closed Sun–Mon --- */
const hoursCard = document.querySelector<HTMLElement>("[data-hours]");
if (hoursCard) {
  // 0 = Sun ... 6 = Sat
  const openDays: Record<number, [number, number]> = {
    2: [9, 18],
    3: [9, 18],
    4: [9, 18],
    5: [9, 18],
    6: [9, 18],
  };
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const todaysHours = openDays[day];
  const isOpen = !!todaysHours && hour >= todaysHours[0] && hour < todaysHours[1];

  const label = hoursCard.querySelector<HTMLElement>("[data-hours-label]");
  const sub = hoursCard.querySelector<HTMLElement>("[data-hours-sub]");

  // The pill carries the state as text + fill; there's no status dot.
  if (label) {
    label.textContent = isOpen ? "Open now" : "Closed";
    label.classList.toggle("closed", !isOpen);
  }
  if (sub) {
    if (isOpen) sub.textContent = "Today until 6:00pm";
    else if (todaysHours)
      sub.textContent =
        hour < todaysHours[0] ? "Opens today at 9:00am" : "Opens tomorrow";
    else sub.textContent = "Opens Tuesday at 9:00am";
  }

  hoursCard
    .querySelector<HTMLElement>(`.hours-row[data-day="${day}"]`)
    ?.classList.add("today");
}

/* --- Prevent dead-link jumps on visual-only forms --- */
document.querySelectorAll<HTMLFormElement>("form[data-visual]").forEach((f) => {
  f.addEventListener("submit", (e) => e.preventDefault());
});
