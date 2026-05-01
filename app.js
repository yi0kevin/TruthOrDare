(function () {
  const $ = (s) => document.querySelector(s);

  const textCard = $('#textCard');
  const answerArea = $('#answerArea');
  const circleBtn = $('#circleBtn');
  const btnIcon = $('#btnIcon');
  const typeRow = $('#typeRow');

  const COLORS = {
    truth:      '#6BAAD7',
    dare:       '#D1383C',
    turtleSoup: '#44A687'
  };
  const ICONS = {
    truth:      '💬',
    dare:       '🔥',
    turtleSoup: '💡'
  };
  const PROMPTS = {
    truth:      '点击按钮\n随机生成真心话问题',
    dare:       '点击按钮\n随机生成大冒险挑战',
    turtleSoup: '点击按钮\n随机生成海龟汤谜题'
  };

  let currentType = 'truth';
  let turtleAnswer = null;
  let showAnswer = false;

  // Per-type used-index tracking to avoid repeats
  const used = { truth: new Set(), dare: new Set(), turtleSoup: new Set() };

  // ---- Type selection ----
  typeRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.type-btn');
    if (!btn) return;
    const type = btn.dataset.type;
    if (type === currentType) return;

    currentType = type;
    showAnswer = false;
    turtleAnswer = null;
    textCard.textContent = PROMPTS[type];
    textCard.classList.remove('fade');
    answerArea.innerHTML = '';
    btnIcon.textContent = ICONS[type];
    document.body.style.setProperty('--bg', COLORS[type]);

    typeRow.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  // ---- Generate ----
  circleBtn.addEventListener('click', () => {
    // Press animation
    circleBtn.classList.add('pressed');
    if (navigator.vibrate) navigator.vibrate(15);

    setTimeout(() => {
      circleBtn.classList.remove('pressed');
    }, 120);

    // Trigger generation
    triggerGenerate();
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      circleBtn.click();
    }
  });

  function triggerGenerate() {
    showAnswer = false;
    turtleAnswer = null;

    textCard.classList.add('fade');

    setTimeout(() => {
      let text;
      switch (currentType) {
        case 'truth':
          text = pickNext(TRUTH_QUESTIONS, used.truth);
          break;
        case 'dare':
          text = pickNext(DARE_CHALLENGES, used.dare);
          break;
        case 'turtleSoup': {
          const idx = pickNextIndex(TURTLE_SOUPS, used.turtleSoup);
          text = TURTLE_SOUPS[idx].scenario;
          turtleAnswer = TURTLE_SOUPS[idx].answer;
          break;
        }
      }
      textCard.textContent = text;
      textCard.classList.remove('fade');
      renderAnswerArea();
    }, 200);
  }

  function pickNext(arr, usedSet) {
    return arr[pickNextIndex(arr, usedSet)];
  }

  function pickNextIndex(arr, usedSet) {
    const n = arr.length;
    if (n === 0) return 0;
    const avail = [];
    for (let i = 0; i < n; i++) { if (!usedSet.has(i)) avail.push(i); }
    if (avail.length === 0) { usedSet.clear(); avail.push(...Array.from({length: n}, (_, i) => i)); }
    const idx = avail[Math.floor(Math.random() * avail.length)];
    usedSet.add(idx);
    return idx;
  }

  // ---- Answer reveal (turtle soup) ----
  answerArea.addEventListener('click', (e) => {
    const btn = e.target.closest('.answer-btn');
    if (!btn || showAnswer) return;
    showAnswer = true;
    renderAnswerArea();
  });

  function renderAnswerArea() {
    if (currentType !== 'turtleSoup' || !turtleAnswer) {
      answerArea.innerHTML = '';
      return;
    }
    if (showAnswer) {
      answerArea.innerHTML = `<div class="answer-text">${escapeHTML(turtleAnswer)}</div>`;
    } else {
      answerArea.innerHTML = '<button class="answer-btn">点击查看汤底</button>';
    }
  }

  function escapeHTML(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ---- Init ----
  document.body.style.setProperty('--bg', COLORS[currentType]);
})();
