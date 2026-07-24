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
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.classList.contains("lnk") || t.classList.contains("btn")) {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
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

  const dot = hoursCard.querySelector<HTMLElement>(".dot");
  const label = hoursCard.querySelector<HTMLElement>("[data-hours-label]");
  const sub = hoursCard.querySelector<HTMLElement>("[data-hours-sub]");

  if (dot) dot.classList.toggle("closed", !isOpen);
  if (label) label.textContent = isOpen ? "Open now" : "Closed now";
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
