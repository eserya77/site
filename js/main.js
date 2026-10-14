gsap.registerPlugin(ScrollTrigger);

// ─── Pila de imágenes: cambia y crece con el scroll ─────────────────────
const hero = document.querySelector(".hero");
const photo = document.querySelector("[data-stack]");
const media = photo.querySelector(".hero__media");
const images = gsap.utils.toArray(".hero__media img");
const counter = document.querySelector("[data-stack-count]");
const bar = document.querySelector(".bar");
const fadeOut = gsap.utils.toArray(
  ".hero__social, .hero__bio, .hero__watch, .release, .hero__foot, .hero__caption"
);

const steps = images.length - 1;
const RATIO = 1474 / 1067; // proporción de la primera foto

// Equivalente JS de fl() en _tokens.scss
const fl = (px) => Math.min((window.innerWidth * px) / 1440, (window.innerHeight * px) / 900);
const pad = (n) => String(n).padStart(2, "0");

gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
  // Cada imagen siguiente espera recortada por debajo
  gsap.set(images.slice(1), { clipPath: "inset(100% 0% 0% 0%)", scale: 1.2 });

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: () => "+=" + window.innerHeight * (steps + 1),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
    // En el timeline (no en el ScrollTrigger) para seguir el scrub suavizado
    onUpdate: () => {
      const index = gsap.utils.clamp(0, steps, Math.floor(tl.time() + 0.5));
      counter.textContent = pad(index + 1);
    },
  });

  // La interfaz alrededor se retira al empezar
  tl.to(fadeOut, { autoAlpha: 0, y: -16, duration: 0.5, stagger: 0.02 }, 0);

  // El contenedor crece durante todo el recorrido hasta cubrir la pantalla.
  // Inicio y fin explícitos: mismo cálculo que fl() en SCSS (lienzo 1440×900).
  const grow = { duration: steps, ease: "power1.inOut" };
  tl.fromTo(photo,
    { top: () => fl(270), width: () => fl(350) },
    { top: 0, width: () => window.innerWidth, ...grow }, 0);
  tl.fromTo(media,
    { height: () => fl(350) * RATIO },
    { height: () => window.innerHeight, ...grow }, 0);

  // Cada imagen entra con un barrido de abajo hacia arriba
  images.slice(1).forEach((img, i) => {
    const at = i + 0.15;
    tl.to(img, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power3.inOut" }, at);
    tl.to(img, { scale: 1, duration: 1, ease: "power2.out" }, at);
    tl.to(images[i], { scale: 1.08, duration: 0.7, ease: "power3.inOut" }, at);
  });

  // La barra cambia a --color-sobre-foto cuando la foto ya ocupa casi todo
  const onPhoto = getComputedStyle(document.documentElement).getPropertyValue("--color-sobre-foto").trim();
  tl.to(bar, { color: onPhoto, duration: 0.6 }, steps - 0.9);

  // Pausa breve a pantalla completa antes de soltar el pin
  tl.to({}, { duration: 0.5 });
});

// ─── Discografía: ciclo lunar ───────────────────────────────────────────
// Entrada: la luna crece y "se llena" (la sombra la descubre), la línea
// de tiempo se dibuja y entra el primer título.
// Recorrido (pin + scrub): cada cambio de lanzamiento es un eclipse.
const disco = document.querySelector(".disco");

if (disco) {
  const items = gsap.utils.toArray(".disco__item", disco);
  const covers = gsap.utils.toArray(".moon__disc img", disco);
  const dots = gsap.utils.toArray(".rail__dot", disco);
  const moon = disco.querySelector(".moon");
  const ring = disco.querySelector(".moon__ring");
  const shadow = disco.querySelector(".moon__shadow");
  const corona = disco.querySelector(".moon__corona");
  const progress = disco.querySelector(".rail__progress");
  const discoCount = disco.querySelector("[data-disco-count]");

  const lines = items.map((item) => item.querySelectorAll(".line > span"));
  const infos = items.map((item) => item.querySelector(".disco__info"));
  const marks = dots.map((dot) => parseFloat(dot.style.getPropertyValue("--x")));
  const total = items.length;

  const HOLD = 0.3; // pausa antes del primer eclipse y después del último

  const setActive = (index) => {
    discoCount.textContent = pad(index + 1);
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  };

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    // Estado inicial: solo el primer lanzamiento; luna en "luna nueva"
    gsap.set(covers.slice(1), { autoAlpha: 0 });
    gsap.set(lines.slice(1), { yPercent: 135 });
    gsap.set(infos.slice(1), { autoAlpha: 0 });
    gsap.set(shadow, { x: 0, xPercent: -101 });
    gsap.set(ring, { transformOrigin: "50% 50%" });
    setActive(0);

    // ── Entrada ──────────────────────────────────────────────────────
    // Solo anima capas propias (luna completa, velo, span interior del
    // título, hijos de los datos) para no pisar al timeline del recorrido.
    const veil = disco.querySelector(".moon__veil");
    const firstLines = items[0].querySelectorAll(".line > span > span");

    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: disco, start: "top bottom", end: "top top", scrub: 1 },
    })
      .from(moon, { scale: 0.55, rotation: -60, ease: "power2.out" }, 0)
      .to(veil, { xPercent: 101, ease: "power2.inOut" }, 0.15)
      .from(covers[0], { scale: 1.25, ease: "power2.out" }, 0.15)
      .from(".rail__line", { scaleX: 0, transformOrigin: "left center", ease: "power2.inOut" }, 0.1)
      .fromTo(dots, { scale: 0 }, { scale: 1, stagger: 0.04, ease: "back.out(3)", duration: 0.3 }, 0.4)
      .from(firstLines, { yPercent: 135, stagger: 0.08, ease: "power3.out", duration: 0.5 }, 0.45)
      .from(infos[0].children, { autoAlpha: 0, y: fl(16), stagger: 0.05, ease: "power2.out", duration: 0.4 }, 0.6)
      .from(".disco__head", { autoAlpha: 0, y: fl(-12), duration: 0.4 }, 0.5);

    // ── Recorrido: un eclipse por lanzamiento ────────────────────────
    const tl = gsap.timeline({
      defaults: { ease: "none", immediateRender: false },
      scrollTrigger: {
        trigger: disco,
        start: "top top",
        end: () => "+=" + window.innerHeight * (total - 1) * 0.9,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        setActive(gsap.utils.clamp(0, total - 1, Math.floor(tl.time() - HOLD + 0.5)));
      },
    });

    // La línea de tiempo llega al primer lanzamiento durante la pausa inicial
    tl.fromTo(progress, { scaleX: 0 }, { scaleX: marks[0], duration: HOLD, ease: "power2.out" }, 0);

    // El anillo gira durante todo el recorrido
    tl.fromTo(ring, { rotation: 0 }, { rotation: -45 * (total - 1), duration: HOLD * 2 + total - 1 }, 0);

    for (let i = 0; i < total - 1; i++) {
      const at = HOLD + i; // inicio del eclipse i → i+1
      const totality = at + 0.5;

      // 1. La sombra entra y cubre la luna
      tl.fromTo(shadow, { xPercent: -101 }, { xPercent: 0, duration: 0.4, ease: "power2.in" }, at + 0.1);
      // 2. Corona magenta en la totalidad
      tl.fromTo(corona, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1.04, duration: 0.15, ease: "power1.out" }, totality - 0.15);
      tl.to(corona, { opacity: 0, scale: 1, duration: 0.3, ease: "power1.in" }, totality + 0.05);
      // 3. Cambio de portada oculto por la sombra
      tl.set(covers[i], { autoAlpha: 0 }, totality);
      tl.set(covers[i + 1], { autoAlpha: 1 }, totality);
      tl.fromTo(covers[i + 1], { scale: 1.2 }, { scale: 1, duration: 0.5, ease: "power2.out" }, totality);
      // 4. La sombra sale por el otro lado y revela la nueva portada
      tl.fromTo(shadow, { xPercent: 0 }, { xPercent: 101, duration: 0.4, ease: "power2.out" }, totality);

      // Título: sale línea por línea hacia arriba, entra el siguiente desde abajo
      tl.fromTo(lines[i], { yPercent: 0 }, { yPercent: -135, duration: 0.35, stagger: 0.05, ease: "power3.in" }, at + 0.1);
      tl.fromTo(lines[i + 1], { yPercent: 135 }, { yPercent: 0, duration: 0.45, stagger: 0.06, ease: "power3.out" }, totality);

      // Datos
      tl.fromTo(infos[i], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: () => -fl(16), duration: 0.3, ease: "power2.in" }, at + 0.1);
      tl.fromTo(infos[i + 1], { autoAlpha: 0, y: () => fl(16) }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, totality + 0.1);

      // La línea de tiempo avanza hasta la fecha del siguiente lanzamiento
      tl.fromTo(progress, { scaleX: marks[i] }, { scaleX: marks[i + 1], duration: 0.6, ease: "power2.inOut" }, at + 0.2);
    }

    tl.to({}, { duration: HOLD });
  });
}
