// Types out the terminal panel line by line.
// Falls back to instant, static text if the user prefers reduced motion.

const lines = [
  { prompt: "$ whoami", output: "Simão Dantas" },
  { prompt: "$ role", output: "Foundational Software Developer" },
  { prompt: "$ education", output: "TGPSI · 12th Grade · Portugal" },
  { prompt: "$ status", output: "Expanding the stack" },
];

const body = document.getElementById("terminal-body");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function renderStatic() {
  body.innerHTML = "";
  lines.forEach(({ prompt, output }) => {
    const line = document.createElement("span");
    line.className = "line";
    line.innerHTML = `<span class="prompt">${prompt}</span><br><span class="output">${output}</span>`;
    body.appendChild(line);
  });
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  body.lastElementChild.appendChild(cursor);
}

function typeText(el, text, speed, done) {
  let i = 0;
  (function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed);
    } else if (done) {
      done();
    }
  })();
}

function typeSequence() {
  body.innerHTML = "";
  let index = 0;

  function nextLine() {
    if (index >= lines.length) return;

    const { prompt, output } = lines[index];
    const line = document.createElement("span");
    line.className = "line";
    const promptEl = document.createElement("span");
    promptEl.className = "prompt";
    line.appendChild(promptEl);
    line.appendChild(document.createElement("br"));
    const outputEl = document.createElement("span");
    outputEl.className = "output";
    line.appendChild(outputEl);
    body.appendChild(line);

    typeText(promptEl, prompt, 28, () => {
      typeText(outputEl, output, 22, () => {
        index++;
        if (index < lines.length) {
          setTimeout(nextLine, 200);
        } else {
          const cursor = document.createElement("span");
          cursor.className = "cursor";
          outputEl.after(cursor);
        }
      });
    });
  }

  nextLine();
}

if (body) {
  if (prefersReducedMotion) {
    renderStatic();
  } else {
    typeSequence();
  }
}

// Simple draggable windows and focus stacking for Windows 98 look
;(function () {
  const wins = document.querySelectorAll('.win');
  let topZ = 100;

  wins.forEach((win) => {
    // bring to front on mousedown (focus-only)
    win.addEventListener('mousedown', (event) => {
      if (event.target.closest('.win') !== win) return;
      wins.forEach(w => w.classList.remove('focused'));
      win.classList.add('focused');
      topZ++;
      win.style.zIndex = topZ;
    });
    // intentionally do not attach drag or close handlers so windows
    // are fixed and cannot be moved or closed by the user
  });
})();

// Switch between fixed index-page views without scrolling.
;(function () {
  const stage = document.querySelector('.index-page .desktop-stage');
  if (!stage) return;

  const views = Array.from(stage.querySelectorAll('.app-view'));
  const navButtons = Array.from(document.querySelectorAll('.site-nav [data-view-target]'));
  const viewLinks = Array.from(document.querySelectorAll('[data-view-target]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeView = views.find((view) => view.classList.contains('is-active'));
  let transitionId = 0;

  if (!activeView) return;

  function showView(name) {
    const nextView = views.find((view) => view.dataset.view === name);
    if (!nextView || nextView === activeView) return;

    const previousView = activeView;
    const currentTransition = ++transitionId;
    activeView = nextView;

    navButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.viewTarget === name));
    });

    viewLinks.forEach((link) => {
      if (link instanceof HTMLAnchorElement) {
        link.setAttribute('aria-current', String(link.dataset.viewTarget === name));
      }
    });

    views.forEach((view) => {
      view.classList.remove('is-active', 'is-entering', 'is-leaving');
      view.inert = view !== nextView;
      view.setAttribute('aria-hidden', String(view !== nextView));
    });

    if (reducedMotion) {
      views.forEach((view) => {
        view.classList.remove('is-off-left', 'is-off-right');
      });
      nextView.classList.add('is-active');
      return;
    }

    previousView.classList.remove('is-off-left', 'is-off-right');
    previousView.classList.add('is-leaving');
    nextView.classList.remove('is-off-left', 'is-off-right');
    nextView.classList.add('is-off-right', 'is-entering');
    void nextView.offsetWidth;
    requestAnimationFrame(() => {
      if (currentTransition !== transitionId) return;
      nextView.classList.remove('is-off-right');
      nextView.classList.add('is-active');
    });

    window.setTimeout(() => {
      if (currentTransition !== transitionId) return;
      previousView.classList.remove('is-leaving');
      previousView.classList.add('is-off-left');
      nextView.classList.remove('is-entering');
    }, 540);
  }

  viewLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) return;
      const viewName = target.dataset.viewTarget;
      if (!viewName) return;
      event.preventDefault();
      showView(viewName);
    });
  });

  navButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.viewTarget === activeView.dataset.view));
  });
})();

// Fade in windows on first load with a slight stagger
document.addEventListener('DOMContentLoaded', () => {
  const wins = Array.from(document.querySelectorAll('.win'));
  wins.forEach((win, i) => {
    setTimeout(() => win.classList.add('visible'), 100 + i * 80);
  });
});

// Project detail dialogs
document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const openButton = target.closest('[data-open-dialog]');
  if (openButton instanceof HTMLButtonElement) {
    const dialogId = openButton.dataset.openDialog;
    const dialog = dialogId ? document.getElementById(dialogId) : null;
    if (dialog instanceof HTMLDialogElement) dialog.showModal();
    return;
  }

  const closeButton = target.closest('[data-close-dialog]');
  if (closeButton) {
    const dialog = closeButton.closest('dialog');
    if (dialog instanceof HTMLDialogElement) dialog.close();
    return;
  }

  if (target instanceof HTMLDialogElement && target.classList.contains('project-dialog')) target.close();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const openDialog = document.querySelector('.project-dialog[open]');
  if (openDialog instanceof HTMLDialogElement) {
    event.preventDefault();
    openDialog.close();
  }
});

// Header reveal on scroll: show/hide .site-header-scrolled while keeping a static header visible
;(function () {
  const staticHeader = document.querySelector('.site-header.site-header-static');
  const scHeader = document.querySelector('.site-header.site-header-scrolled');
  if (!staticHeader || !scHeader) return;
  const threshold = 160; // px scrolled before scrolled header appears

  function updateHeader() {
    const y = window.scrollY || window.pageYOffset;
    if (y > threshold) {
      if (!scHeader.classList.contains('visible')) {
        scHeader.classList.add('visible');
        scHeader.setAttribute('aria-hidden', 'false');
      }
    } else {
      if (scHeader.classList.contains('visible')) {
        scHeader.classList.remove('visible');
        scHeader.setAttribute('aria-hidden', 'true');
      }
    }
  }

  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateHeader);
  }, { passive: true });

  // initialize
  updateHeader();
})();

;(function () {
  const footer = document.querySelector('.index-page .site-footer, .underveil-page .site-footer');
  if (!footer) return;
  if (document.body.classList.contains('index-page')) return;

  function updateFooter() {
    const distanceFromBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    footer.classList.toggle('footer-visible', distanceFromBottom <= 96);
  }

  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateFooter);
  }, { passive: true });
  window.addEventListener('resize', updateFooter);

  updateFooter();
})();
