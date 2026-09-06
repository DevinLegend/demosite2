(function () {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const form = document.getElementById("citaForm");
  const formNote = document.getElementById("formNote");
  const chip = document.getElementById("hoursChip");
  const chipText = document.getElementById("hoursChipText");

  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 28);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (toggle && nav && header) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
      });
    });
  }

  function minutosEnTijuana(date) {
    const parts = new Intl.DateTimeFormat("es-MX", {
      timeZone: "America/Tijuana",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23"
    }).formatToParts(date);
    const val = (type) => parts.find((p) => p.type === type).value;
    const weekday = val("weekday").toLowerCase().replace(".", "");
    const mins = Number(val("hour")) * 60 + Number(val("minute"));
    return { weekday, mins };
  }

  function horarioDelDia(weekday) {
    if (weekday.startsWith("dom")) return { abre: 11 * 60, cierra: 16 * 60, cierraTxt: "16:00", abreTxt: "11:00" };
    if (weekday.startsWith("sáb") || weekday.startsWith("sab")) {
      return { abre: 10 * 60, cierra: 18 * 60, cierraTxt: "18:00", abreTxt: "10:00" };
    }
    return { abre: 10 * 60, cierra: 20 * 60, cierraTxt: "20:00", abreTxt: "10:00" };
  }

  function actualizarHorario() {
    if (!chip || !chipText) return;
    const { weekday, mins } = minutosEnTijuana(new Date());
    const h = horarioDelDia(weekday);
    const abierto = mins >= h.abre && mins < h.cierra;
    chip.classList.toggle("is-closed", !abierto);
    chipText.textContent = abierto
      ? "Abierto · Cierra a las " + h.cierraTxt
      : "Cerrado · Abre a las " + h.abreTxt;
  }
  actualizarHorario();

  if (form && formNote) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.reset();
      formNote.hidden = false;
      formNote.focus();
    });
  }
})();
