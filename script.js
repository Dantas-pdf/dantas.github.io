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
    win.addEventListener('mousedown', () => {
      wins.forEach(w => w.classList.remove('focused'));
      win.classList.add('focused');
      topZ++;
      win.style.zIndex = topZ;
    });
    // intentionally do not attach drag or close handlers so windows
    // are fixed and cannot be moved or closed by the user
  });
})();

// Fade in windows on first load with a slight stagger
document.addEventListener('DOMContentLoaded', () => {
  const wins = Array.from(document.querySelectorAll('.win'));
  wins.forEach((win, i) => {
    setTimeout(() => win.classList.add('visible'), 100 + i * 80);
  });
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
