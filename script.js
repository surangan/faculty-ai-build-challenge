const filters = document.querySelectorAll('.filter');
const ideaCards = document.querySelectorAll('.idea-card');

filters.forEach(filter => {
  filter.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active'));
    filter.classList.add('active');
    const selected = filter.dataset.filter;

    ideaCards.forEach(card => {
      const category = card.dataset.category;
      const visible = selected === 'all' || category === selected || category === 'all';
      card.classList.toggle('hidden', !visible);
    });
  });
});

document.querySelectorAll('.copy-button').forEach(button => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy);
    const text = target.innerText;
    let copied = false;

    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      const writeFromCopyEvent = event => {
        event.clipboardData.setData('text/plain', text);
        event.preventDefault();
      };
      document.addEventListener('copy', writeFromCopyEvent);
      copied = document.execCommand('copy');
      document.removeEventListener('copy', writeFromCopyEvent);
    }

    if (!copied) {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.left = '-9999px';
      document.body.appendChild(fallback);
      fallback.focus();
      fallback.select();
      fallback.setSelectionRange(0, fallback.value.length);
      copied = document.execCommand('copy');
      fallback.remove();
    }

    const old = button.innerText;
    button.innerText = copied ? 'Copied' : 'Select text';
    setTimeout(() => button.innerText = old, 1400);
  });
});

let selectedMinutes = Number(document.querySelector('.mode-button.active')?.dataset.minutes) || 55;
let remainingSeconds = selectedMinutes * 60;
let timerId = null;

const display = document.getElementById('timerDisplay');
const message = document.getElementById('timerMessage');
const modeButtons = document.querySelectorAll('.mode-button');

function renderTimer() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (remainingSeconds <= 300 && remainingSeconds > 0) {
    message.textContent = 'Five-minute warning: finish the demo path and publish your link.';
  } else if (remainingSeconds === 0) {
    message.textContent = 'Time. Submit the link and prepare to share.';
  }
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    stopTimer();
    modeButtons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    selectedMinutes = Number(button.dataset.minutes);
    remainingSeconds = selectedMinutes * 60;
    message.textContent = 'Ready when you are.';
    renderTimer();
  });
});

document.getElementById('startTimer').addEventListener('click', () => {
  if (timerId || remainingSeconds === 0) return;
  message.textContent = 'Build sprint in progress.';
  timerId = setInterval(() => {
    remainingSeconds -= 1;
    renderTimer();
    if (remainingSeconds <= 0) stopTimer();
  }, 1000);
});

document.getElementById('pauseTimer').addEventListener('click', () => {
  stopTimer();
  message.textContent = 'Timer paused.';
});

document.getElementById('resetTimer').addEventListener('click', () => {
  stopTimer();
  remainingSeconds = selectedMinutes * 60;
  message.textContent = 'Ready when you are.';
  renderTimer();
});

renderTimer();

document.querySelectorAll('.disabled-link').forEach(link => {
  link.addEventListener('click', event => {
    if (link.getAttribute('href') === '#') {
      event.preventDefault();
      alert('Organiser: replace this placeholder with your Google Doc or Google Form link in index.html.');
    }
  });
});
