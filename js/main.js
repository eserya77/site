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
      onUpdate: () => {
        const index = gsap.utils.clamp(0, steps, Math.floor(tl.time() + 0.5));
        counter.textContent = pad(index + 1);
      },
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

  // La barra pasa a crema cuando la foto ya ocupa casi todo
  tl.to(bar, { color: "#fff6ee", duration: 0.6 }, steps - 0.9);

  // Pausa breve a pantalla completa antes de soltar el pin
  tl.to({}, { duration: 0.5 });
});
