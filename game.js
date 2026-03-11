/* ── Word list: Cub Scout Oath, Motto & Law ── */
const WORD_LIST = [
  { word: 'HONOR',  hint: '"On my ___ I will do my best" — Cub Scout Oath' },
  { word: 'BEST',     hint: '"Do your ___" — Cub Scout Motto' },
  { word: 'DUTY',     hint: '"Do my ___ to God and my country" — Oath' },
  { word: 'COUNTRY',  hint: '"Duty to God and my ___" — Oath' },
  { word: 'HELP',     hint: '"___ other people" — Oath' },
  { word: 'PHYSICALLY',    hint: '"To keep myself ___ strong" — Oath' },
  { word: 'MENTALLY',   hint: '", ___ awake" — Oath' },
  { word: 'MORALLY',     hint: '"and ___ straight." — Oath' },
  { word: 'TRUSTWORTHY',     hint: '"A scout is ___" — Law' },
  { word: 'LOYAL',    hint: 'Scout Law' },
  { word: 'HELPFUL', hint: 'Scout Law' },
  { word: 'COURTEOUS',  hint: 'Scout Law' },
  { word: 'KIND',  hint: 'Scout Law' },
  { word: 'OBEDIENT',  hint: 'Scout Law' },
  { word: 'CHEERFUL',  hint: 'Scout Law' },
  { word: 'THRIFTY',  hint: 'Scout Law' },
  { word: 'BRAVE',  hint: 'Scout Law' },
  { word: 'CLEAN',  hint: 'Scout Law' },
  { word: 'REVERENT',  hint: 'Scout Law' },
];

/* ── Melt stages: which SVG parts disappear at each wrong guess ── */
const MELT_STAGES = [
  { parts: ['hat'],                    puddleRx: 0  }, // 1 wrong
  { parts: ['scarf'],                  puddleRx: 8  }, // 2 wrong
  { parts: ['right-arm'],              puddleRx: 16 }, // 3 wrong
  { parts: ['left-arm'],               puddleRx: 24 }, // 4 wrong
  { parts: ['buttons'],                puddleRx: 32 }, // 5 wrong
  { parts: ['nose'],                   puddleRx: 40 }, // 6 wrong
  { parts: ['eyes'],                   puddleRx: 50 }, // 7 wrong
  { parts: ['smile'],                  puddleRx: 62 }, // 8 wrong
  { parts: ['head', 'middle', 'base'], puddleRx: 85 }, // 9 wrong — game over
];

const MAX_WRONG = 9;

/* ── State ── */
let currentWord   = '';
let currentHint   = '';
let guessedLetters = new Set();
let wrongGuesses  = 0;
let gameOver      = false;
let wordQueue     = [];   // shuffled queue — no repeats until all played

/* ── Entry point ── */
function newGame() {
  if (wordQueue.length === 0) wordQueue = shuffle([...WORD_LIST]);
  const wordObj    = wordQueue.pop();
  currentWord      = wordObj.word;
  currentHint      = wordObj.hint;
  guessedLetters   = new Set();
  wrongGuesses     = 0;
  gameOver         = false;

  resetSnowman();
  renderAlphabet();
  updateDisplay();
  updateWrongBars();

  document.getElementById('hint-text').textContent    = currentHint;
  document.getElementById('message').textContent      = '';
  document.getElementById('message').className        = '';
  document.getElementById('wrong-letters-display').textContent = '';
}

/* ── Snowman helpers ── */
function resetSnowman() {
  const parts = ['hat', 'scarf', 'left-arm', 'right-arm', 'buttons',
                 'nose', 'eyes', 'smile', 'head', 'middle', 'base'];
  parts.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('melted');
  });

  const puddle = document.getElementById('puddle');
  puddle.setAttribute('rx', '0');
  puddle.setAttribute('ry', '0');
}

function meltStage(stageIndex) {
  if (stageIndex < 0 || stageIndex >= MELT_STAGES.length) return;
  const stage = MELT_STAGES[stageIndex];

  stage.parts.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('melted');
  });

  const puddle = document.getElementById('puddle');
  const rx = stage.puddleRx;
  puddle.setAttribute('rx', rx);
  puddle.setAttribute('ry', Math.round(rx * 0.36));
}

/* ── Guess a letter ── */
function guessLetter(letter) {
  if (gameOver || guessedLetters.has(letter)) return;
  guessedLetters.add(letter);

  const isCorrect = currentWord.includes(letter);
  if (!isCorrect) {
    wrongGuesses++;
    meltStage(wrongGuesses - 1);
    updateWrongBars();
  }

  // Style the alphabet button
  const btn = document.querySelector(`[data-letter="${letter}"]`);
  if (btn) {
    btn.disabled = true;
    btn.classList.add(isCorrect ? 'correct' : 'wrong');
  }

  updateDisplay();
  checkGameEnd();
}

/* ── Update the word display ── */
function updateDisplay() {
  const wordDisplay = document.getElementById('word-display');
  wordDisplay.innerHTML = currentWord.split('').map(letter => {
    const known = guessedLetters.has(letter);
    return `<span class="letter-box${(!known && gameOver) ? ' revealed' : ''}">${
      known || gameOver ? letter : ''
    }</span>`;
  }).join('');

  const wrongLetters = [...guessedLetters]
    .filter(l => !currentWord.includes(l))
    .sort()
    .join('  ');
  document.getElementById('wrong-letters-display').textContent =
    wrongLetters ? 'Missed: ' + wrongLetters : '';

  document.getElementById('wrong-num').textContent = wrongGuesses;
}

/* ── Progress bars ── */
function updateWrongBars() {
  const container = document.getElementById('wrong-bars');
  container.innerHTML = '';
  for (let i = 0; i < MAX_WRONG; i++) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    if (i < wrongGuesses) {
      bar.classList.add(wrongGuesses >= 7 ? 'danger' : 'filled');
    }
    container.appendChild(bar);
  }
}

/* ── Win / Lose check ── */
function checkGameEnd() {
  const allGuessed = currentWord.split('').every(l => guessedLetters.has(l));

  if (allGuessed) {
    gameOver = true;
    showMessage('You saved the snowman! Great work!', 'win-message');
    disableAllButtons();
  } else if (wrongGuesses >= MAX_WRONG) {
    gameOver = true;
    updateDisplay(); // reveal the word
    showMessage(`The snowman melted! The word was: ${currentWord}`, 'lose-message');
    disableAllButtons();
  }
}

function showMessage(text, cls) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className = cls;
}

function disableAllButtons() {
  document.querySelectorAll('.letter-btn').forEach(btn => (btn.disabled = true));
}

/* ── Render the A–Z keyboard ── */
function renderAlphabet() {
  const container = document.getElementById('alphabet');
  container.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter =>
    `<button class="letter-btn" data-letter="${letter}"
             onclick="guessLetter('${letter}')">${letter}</button>`
  ).join('');
}

/* ── Keyboard support ── */
document.addEventListener('keydown', e => {
  const key = e.key.toUpperCase();
  if (/^[A-Z]$/.test(key)) guessLetter(key);
});

/* ── Animated background snowflakes ── */
function createSnowflakes() {
  const container = document.querySelector('.snowflakes');
  const symbols   = ['❄', '❅', '❆', '·', '*'];
  for (let i = 0; i < 22; i++) {
    const flake = document.createElement('div');
    flake.className  = 'snowflake';
    flake.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    flake.style.left            = Math.random() * 100 + '%';
    flake.style.fontSize        = (0.6 + Math.random() * 1.4) + 'em';
    flake.style.animationDuration = (6 + Math.random() * 12) + 's';
    flake.style.animationDelay  = (-Math.random() * 18) + 's';
    flake.style.opacity         = 0.25 + Math.random() * 0.45;
    container.appendChild(flake);
  }
}

/* ── Utility: Fisher-Yates shuffle ── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ── Init ── */
createSnowflakes();
newGame();
