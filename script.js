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
