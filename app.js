const transitionCurtain = document.querySelector(".page-transition");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let transitionTimer;

function findSection(hash) {
  if (!hash || hash === "#") {
    return document.body;
  }

  let id;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }

  return document.getElementById(id);
}

function playPageTransition(section, updateHistory) {
  if (!transitionCurtain || !section) {
    return;
  }

  window.clearTimeout(transitionTimer);
  transitionCurtain.classList.remove("is-exiting");
  transitionCurtain.classList.add("is-active");

  const finishDelay = reducedMotion.matches ? 0 : 300;
  const cleanupDelay = reducedMotion.matches ? 20 : 360;

  transitionTimer = window.setTimeout(() => {
    if (updateHistory) {
      const destination = section === document.body ? "#home" : `#${section.id}`;
      window.history.pushState(null, "", destination);
    }

    section.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });

    transitionCurtain.classList.remove("is-active");
    transitionCurtain.classList.add("is-exiting");
    transitionTimer = window.setTimeout(() => {
      transitionCurtain.classList.remove("is-exiting");
    }, cleanupDelay);
  }, finishDelay);
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element) || event.defaultPrevented) {
    return;
  }

  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const link = event.target.closest("a[href]");
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) {
    return;
  }

  const destination = new URL(link.href, window.location.href);
  const isSamePage = destination.origin === window.location.origin
    && destination.pathname === window.location.pathname
    && destination.search === window.location.search;

  if (!isSamePage || !destination.hash) {
    return;
  }

  const section = findSection(destination.hash);
  if (!section) {
    return;
  }

  event.preventDefault();
  const mobileMenu = document.querySelector("#nav-toggle");
  if (mobileMenu) {
    mobileMenu.checked = false;
  }

  playPageTransition(section, true);
});

window.addEventListener("popstate", () => {
  const section = findSection(window.location.hash);
  if (section) {
    playPageTransition(section, false);
  }
});
