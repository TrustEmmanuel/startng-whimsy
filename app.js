(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* theme */
  const root = document.documentElement;
  const themeToggle = $("#theme-toggle");
  const themeMeta = $('meta[name="theme-color"]');

  function syncTheme() {
    const dark = root.getAttribute("data-theme") === "dark";
    themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.setAttribute("aria-pressed", String(dark));
    if (themeMeta) themeMeta.setAttribute("content", dark ? "#292a23" : "#f6f5ee");
  }

  themeToggle.addEventListener("click", () => {
    const dark = root.getAttribute("data-theme") === "dark";
    if (dark) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", "dark");
    try {
      localStorage.setItem("startng-concept-theme", dark ? "light" : "dark");
    } catch (e) {}
    syncTheme();
  });
  syncTheme();

  /* countdown to midnight WAT */
  const cdH = $("#cd-h");
  const cdM = $("#cd-m");
  const cdS = $("#cd-s");
  const pad = (n) => String(n).padStart(2, "0");
  const WAT_OFFSET = 60 * 60 * 1000; // Nigeria is UTC+1 all year

  function nextMidnightWAT() {
    const wat = new Date(Date.now() + WAT_OFFSET);
    const nextUtc = Date.UTC(wat.getUTCFullYear(), wat.getUTCMonth(), wat.getUTCDate() + 1, 0, 0, 0);
    return nextUtc - WAT_OFFSET;
  }

  function tick() {
    const total = Math.max(0, Math.floor((nextMidnightWAT() - Date.now()) / 1000));
    cdH.textContent = pad(Math.floor(total / 3600));
    cdM.textContent = pad(Math.floor((total % 3600) / 60));
    cdS.textContent = pad(total % 60);
  }

  if (cdH && cdM && cdS) {
    tick();
    setInterval(tick, 1000);
  }

  const dailyLeft = $("#daily-left");
  function updateDailyLeft() {
    const total = Math.max(0, Math.floor((nextMidnightWAT() - Date.now()) / 1000));
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    if (!dailyLeft) return;
    if (total <= 0) dailyLeft.textContent = "new goal soon";
    else if (hours >= 1) dailyLeft.textContent = `${hours}h ${pad(mins)}m left`;
    else dailyLeft.textContent = `${mins}m left`;
  }
  if (dailyLeft) {
    updateDailyLeft();
    setInterval(updateDailyLeft, 30000);
  }

  /* games for the lucky dip */
  const games = [
    { name: "Danfo Defense", creator: "emmyanz", tag: "Arcade", art: "assets/art/game-danfo.webp", slug: "danfo-defense" },
    { name: "Jollof Rush", creator: "Y_Aisha", tag: "Arcade", art: "assets/art/game-jollof.webp", slug: "jollof-rush" },
    { name: "Suwe", creator: "The Product Girlie", tag: "Naija classic", art: "assets/art/game-suwe.webp", slug: "suwe" },
    { name: "Owambe", creator: "Victor", tag: "Party", art: "assets/art/game-owambe.webp", slug: "owambe" },
    { name: "Ayo", creator: "Hamzat", tag: "Board", art: "assets/art/game-ayo.webp", slug: "ayo" },
    { name: "Whot", creator: "Hamzat", tag: "Cards", art: "assets/art/game-whot.webp", slug: "whot" },
    { name: "Okada Dodge", creator: "Abdul-Baaqi", tag: "Arcade", art: "assets/art/game-okada.webp", slug: "okada-dodge" },
    { name: "Nepa Light Up Lagos", creator: "Oluwasanmi", tag: "Puzzle", art: "assets/art/game-nepa.webp", slug: "nepa-light-up-lagos" },
    { name: "Neon Drift", creator: "Miracle", tag: "Racing", art: "assets/art/game-neon.webp", slug: "neon-drift" },
    { name: "Lagos Legends Street Quest", creator: "Triple", tag: "Adventure", art: "assets/art/game-lagos.webp", slug: "lagos-legends-street-quest" },
    { name: "Bingo", creator: "Hamzat", tag: "Board", art: "assets/art/game-bingo.webp", slug: "bingo" },
    { name: "Quiz", creator: "Hamzat", tag: "Brainy", art: "assets/art/game-quiz.webp", slug: "quiz" },
    { name: "Ludo", creator: "Hamzat", tag: "Board", art: "assets/art/game-ludo.webp", slug: "ludo" }
  ];

  const surpriseDialog = $("#surprise-dialog");
  const surpriseImg = $("#surprise-img");
  const surpriseName = $("#surprise-name");
  const surpriseMeta = $("#surprise-meta");
  const surprisePlay = $("#surprise-play");
  const confettiBox = $("#confetti");
  let lastPick = null;

  function burstConfetti() {
    if (!confettiBox || reduceMotion) return;
    const colors = ["#d8fd71", "#ff6b4a", "#7cc6ff", "#ffb3d9", "#ffd166", "#c9b8ff"];
    confettiBox.innerHTML = "";
    for (let i = 0; i < 26; i += 1) {
      const piece = document.createElement("i");
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.18}s`;
      piece.style.animationDuration = `${0.8 + Math.random() * 0.5}s`;
      piece.style.setProperty("--r", `${Math.random() * 260 - 130}deg`);
      confettiBox.append(piece);
    }
    setTimeout(() => {
      confettiBox.innerHTML = "";
    }, 1500);
  }

  function roll() {
    let pick = games[Math.floor(Math.random() * games.length)];
    if (games.length > 1) {
      while (pick === lastPick) pick = games[Math.floor(Math.random() * games.length)];
    }
    lastPick = pick;
    surpriseImg.src = pick.art;
    surpriseImg.alt = "";
    surpriseName.textContent = pick.name;
    surpriseMeta.textContent = `by ${pick.creator} · ${pick.tag}`;
    surprisePlay.href = `https://start.ng/games/${pick.slug}`;
    burstConfetti();
  }

  if (surpriseDialog && typeof surpriseDialog.showModal === "function") {
    $("#surprise").addEventListener("click", () => {
      roll();
      surpriseDialog.showModal();
    });

    $("#surprise-again").addEventListener("click", roll);
    $("#surprise-close").addEventListener("click", () => surpriseDialog.close());

    surpriseDialog.addEventListener("click", (event) => {
      if (event.target === surpriseDialog) surpriseDialog.close();
    });
  }

  /* shuffle the shelf */
  const grid = $("#games-grid");
  const shuffleBtn = $("#shuffle");
  const shuffleStatus = $("#shuffle-status");

  if (grid && shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      const cards = $$(".game", grid).filter((card) => !card.classList.contains("ghost-game"));
      const ghost = $(".ghost-game", grid);

      for (let i = cards.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }

      cards.forEach((card) => {
        grid.insertBefore(card, ghost);
        if (!reduceMotion) {
          card.animate(
            [
              { transform: "scale(1) rotate(0deg)" },
              { transform: "scale(0.94) rotate(-1.5deg)", offset: 0.45 },
              { transform: "scale(1) rotate(0deg)" }
            ],
            { duration: 340, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
          );
        }
      });

      shuffleStatus.textContent = "Shelf shuffled.";
    });
  }

  /* reveal on scroll */
  const revealItems = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    revealItems.forEach((item) => io.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("in"));
  }

  /* side quest: puff puff dash */
  const sqRoot = $("#side-quest");
  const sqCanvas = $("#sq-canvas");

  if (sqRoot && sqCanvas && sqCanvas.getContext) {
    const ctx = sqCanvas.getContext("2d");
    const sqPanel = $(".sq-panel", sqRoot);
    const sqMin = $("#sq-min");
    const sqLauncher = $("#sq-launcher");
    const sqOverlay = $("#sq-over");
    const sqKicker = $("#sq-over-kicker");
    const sqOverTitle = $("#sq-over-title");
    const sqOverCopy = $("#sq-over-copy");
    const sqAgain = $("#sq-again");
    const sqScoreEl = $("#sq-score");
    const sqBestEl = $("#sq-best");
    const sqLivesEl = $("#sq-lives");
    const bestBadge = sqBestEl.parentElement;

    const W = 600;
    const H = 380;
    const BEST_KEY = "startng-sidequest-best";
    const INK = "#292a23";
    const CREAM = "#fffefa";
    const LIME = "#d8fd71";

    let best = 0;
    try {
      best = Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch (e) {}
    sqBestEl.textContent = String(best);

    const state = {
      mode: "ready",
      paused: false,
      score: 0,
      lives: 3,
      newBest: false,
      items: [],
      bits: [],
      pops: [],
      spawnIn: 0.5,
      shake: 0,
      flash: 0,
      last: performance.now()
    };
    const bowl = { x: W / 2, target: W / 2, vx: 0, width: 124, y: H - 34 };
    const keys = { left: false, right: false };
    let scaleFactor = 1;
    let autoTuckOff = false;

    function fitCanvas() {
      const rect = sqCanvas.getBoundingClientRect();
      if (rect.width < 10) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      scaleFactor = (rect.width / W) * dpr;
      sqCanvas.width = Math.round(W * scaleFactor);
      sqCanvas.height = Math.round(H * scaleFactor);
      ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawSpark(x, y, r, color) {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 8; i += 1) {
        const radius = i % 2 === 0 ? r : r * 0.32;
        const a = (Math.PI / 4) * i - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.restore();
    }

    function drawBackground() {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      ctx.fillStyle = dark ? "#2b2c25" : "#f8f7ef";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = dark ? "rgba(246, 245, 238, 0.12)" : "rgba(41, 42, 35, 0.1)";
      for (let x = 18; x < W; x += 26) {
        for (let y = 16; y < H; y += 26) {
          ctx.beginPath();
          ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = dark ? "#39412b" : "#eef9c6";
      ctx.beginPath();
      ctx.ellipse(W / 2, H + 66, W * 0.64, 118, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = dark ? "rgba(246, 245, 238, 0.22)" : "rgba(41, 42, 35, 0.22)";
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 12]);
      ctx.beginPath();
      ctx.moveTo(20, H - 20);
      ctx.lineTo(W - 20, H - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      drawSpark(W - 66, 52, 12, "#ffd166");
      drawSpark(56, 96, 9, "#c9b8ff");
      drawSpark(W - 96, 128, 7, "#ffb3d9");
    }

    function drawBowl() {
      const w = bowl.width;
      const tilt = Math.max(-0.12, Math.min(0.12, bowl.vx / 5200));
      ctx.save();
      ctx.translate(bowl.x, bowl.y);
      ctx.rotate(tilt * 0.55);

      ctx.fillStyle = "rgba(41, 42, 35, 0.12)";
      ctx.beginPath();
      ctx.ellipse(0, 22, w * 0.42, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-w / 2, -16);
      ctx.quadraticCurveTo(-w / 2 + 6, 22, 0, 24);
      ctx.quadraticCurveTo(w / 2 - 6, 22, w / 2, -16);
      ctx.closePath();
      ctx.fillStyle = LIME;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = INK;
      ctx.stroke();

      roundRect(-w / 2 - 3, -24, w + 6, 14, 7);
      ctx.fillStyle = CREAM;
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "rgba(41, 42, 35, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-w * 0.22, -2);
      ctx.quadraticCurveTo(0, 6, w * 0.22, -2);
      ctx.stroke();

      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(-14, 2, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(14, 2, 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 4, 7, 0.35, Math.PI - 0.35);
      ctx.stroke();
      ctx.restore();
    }

    function drawPuff(item) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rot);
      ctx.beginPath();
      ctx.arc(0, 0, item.r, 0, Math.PI * 2);
      ctx.fillStyle = "#f0b75c";
      ctx.fill();
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.fillStyle = "rgba(41, 42, 35, 0.5)";
      [
        [-5, -4],
        [4, -6],
        [7, 3],
        [-2, 6]
      ].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 1, 4, 0.3, Math.PI - 0.3);
      ctx.stroke();
      ctx.restore();
    }

    function drawPepper(item) {
      ctx.save();
      ctx.translate(item.x, item.y + 3);
      ctx.rotate(item.rot * 0.7);
      ctx.beginPath();
      ctx.moveTo(0, -item.r - 2);
      ctx.bezierCurveTo(item.r * 1.1, -item.r * 0.4, item.r * 0.9, item.r * 0.8, 0, item.r + 2);
      ctx.bezierCurveTo(-item.r * 0.9, item.r * 0.8, -item.r * 1.05, -item.r * 0.2, -item.r * 0.34, -item.r * 0.7);
      ctx.closePath();
      ctx.fillStyle = "#ff6b4a";
      ctx.fill();
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = INK;
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-item.r * 0.42, -item.r * 0.2);
      ctx.quadraticCurveTo(-item.r * 0.55, item.r * 0.4, -item.r * 0.12, item.r * 0.72);
      ctx.stroke();

      ctx.strokeStyle = "#3f8f58";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(0, -item.r - 1);
      ctx.lineTo(item.r * 0.28, -item.r - 7);
      ctx.stroke();
      ctx.restore();
    }

    function drawStarItem(item) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rot);
      ctx.beginPath();
      for (let i = 0; i < 10; i += 1) {
        const radius = i % 2 === 0 ? item.r : item.r * 0.46;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
      }
      ctx.closePath();
      ctx.fillStyle = "#c9b8ff";
      ctx.fill();
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.save();
      if (state.shake > 0) {
        const amount = state.shake * 13;
        ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
      }
      drawBackground();

      state.items.forEach((item) => {
        if (item.type === "puff") drawPuff(item);
        else if (item.type === "pepper") drawPepper(item);
        else drawStarItem(item);
      });

      drawBowl();

      state.bits.forEach((bit) => {
        ctx.save();
        ctx.translate(bit.x, bit.y);
        ctx.rotate(bit.rot);
        ctx.globalAlpha = Math.max(0, Math.min(1, bit.life / 0.5));
        ctx.fillStyle = bit.color;
        if (bit.shape === "dot") {
          ctx.beginPath();
          ctx.arc(0, 0, bit.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-bit.size, -bit.size * 0.6, bit.size * 2, bit.size * 1.2);
        }
        ctx.restore();
      });

      state.pops.forEach((pop) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, pop.life / 0.6));
        ctx.font = '700 26px "Bricolage Grotesque", Helvetica, sans-serif';
        ctx.textAlign = "center";
        ctx.lineJoin = "round";
        ctx.lineWidth = 5;
        ctx.strokeStyle = document.documentElement.getAttribute("data-theme") === "dark" ? "#2b2c25" : CREAM;
        ctx.strokeText(pop.text, pop.x, pop.y);
        ctx.fillStyle = pop.color;
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
      });

      if (state.flash > 0) {
        ctx.fillStyle = `rgba(255, 107, 74, ${0.24 * (state.flash / 0.4)})`;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    }

    function syncHud() {
      sqScoreEl.textContent = String(state.score);
      sqLivesEl.textContent = [0, 1, 2].map((i) => (i < state.lives ? "♥" : "♡")).join(" ");
      sqLivesEl.setAttribute("aria-label", `${state.lives} ${state.lives === 1 ? "life" : "lives"} left`);
    }

    function popBest() {
      bestBadge.classList.remove("pop");
      void bestBadge.offsetWidth;
      bestBadge.classList.add("pop");
    }

    function noteBest() {
      if (state.score <= best) return;
      best = state.score;
      sqBestEl.textContent = String(best);
      if (!state.newBest) state.newBest = true;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch (e) {}
    }

    function setOverlay(mode) {
      if (mode === "playing") {
        sqOverlay.hidden = true;
        return;
      }
      sqOverlay.hidden = false;
      if (mode === "ready") {
        sqKicker.textContent = "side quest";
        sqOverTitle.textContent = "Catch the puff puff";
        sqOverCopy.textContent = "Dodge the pepper. One little game while you browse.";
        sqAgain.textContent = "Play";
      } else {
        sqKicker.textContent = "gist over";
        sqOverTitle.textContent = "Scooped!";
        sqOverCopy.textContent = `${state.score} puff puff caught · best ${best}`;
        sqAgain.textContent = "One more";
      }
    }

    function startGame() {
      autoTuckOff = true;
      state.mode = "playing";
      state.paused = false;
      state.score = 0;
      state.lives = 3;
      state.newBest = false;
      state.items = [];
      state.bits = [];
      state.pops = [];
      state.spawnIn = 0.6;
      state.shake = 0;
      state.flash = 0;
      bowl.x = W / 2;
      bowl.target = W / 2;
      bowl.vx = 0;
      syncHud();
      setOverlay("playing");
      fitCanvas();
      sqCanvas.focus({ preventScroll: true });
    }

    function endGame() {
      state.mode = "over";
      if (state.newBest) popBest();
      setOverlay("over");
      sqAgain.focus({ preventScroll: true });
    }

    function spawn() {
      const roll = Math.random();
      const type = roll < 0.68 ? "puff" : roll < 0.9 ? "pepper" : "star";
      const r = type === "star" ? 20 : 17;
      state.items.push({
        type,
        r,
        x: 30 + r + Math.random() * (W - 60 - r * 2),
        y: -r - 8,
        speed: 118 + Math.min(150, state.score * 5) + Math.random() * 40,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 1.8
      });
    }

    function crumb(x, y, count, color) {
      for (let i = 0; i < count; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 160;
        state.bits.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 80,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 8,
          size: 2 + Math.random() * 3,
          color,
          shape: "dot",
          life: 0.5 + Math.random() * 0.3
        });
      }
    }

    function confettiBurst(x, y, count) {
      if (reduceMotion) return;
      const colors = ["#d8fd71", "#ff6b4a", "#7cc6ff", "#ffb3d9", "#ffd166", "#c9b8ff"];
      for (let i = 0; i < count; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 220;
        state.bits.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 120,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 10,
          size: 3 + Math.random() * 3,
          color: colors[i % colors.length],
          shape: "rect",
          life: 0.8 + Math.random() * 0.5
        });
      }
    }

    function addPops(x, y, text, color) {
      state.pops.push({ x, y, text, color, life: 0.9 });
    }

    function update(dt) {
      const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (dir !== 0) {
        bowl.x += dir * 470 * dt;
        bowl.target = bowl.x;
        bowl.vx = dir * 470;
      } else {
        const ease = Math.min(1, dt * 14);
        const nx = bowl.x + (bowl.target - bowl.x) * ease;
        bowl.vx = dt > 0 ? (nx - bowl.x) / dt : 0;
        bowl.x = nx;
      }
      const half = bowl.width / 2;
      if (bowl.x < half + 6) {
        bowl.x = half + 6;
        bowl.target = bowl.x;
        bowl.vx = 0;
      }
      if (bowl.x > W - half - 6) {
        bowl.x = W - half - 6;
        bowl.target = bowl.x;
        bowl.vx = 0;
      }

      state.spawnIn -= dt;
      if (state.spawnIn <= 0) {
        spawn();
        state.spawnIn = Math.max(0.44, 0.94 - state.score * 0.013);
      }

      const catchTop = H - 66;
      const catchBottom = H - 26;

      for (let i = state.items.length - 1; i >= 0; i -= 1) {
        const item = state.items[i];
        item.y += item.speed * dt;
        item.rot += item.spin * dt;

        const inBand = item.y + item.r > catchTop && item.y - item.r < catchBottom;
        if (inBand && Math.abs(item.x - bowl.x) < half + item.r * 0.5) {
          state.items.splice(i, 1);
          if (item.type === "puff") {
            state.score += 1;
            addPops(item.x, item.y, "+1", "#a8680f");
            crumb(item.x, item.y, 6, "#f0b75c");
            if (state.score % 10 === 0) {
              addPops(W / 2, H * 0.45, "nice!", "#4f9fdc");
              confettiBurst(W / 2, H * 0.35, 26);
            }
          } else if (item.type === "star") {
            state.score += 3;
            addPops(item.x, item.y, "+3", "#8b74d6");
            crumb(item.x, item.y, 10, "#c9b8ff");
          } else {
            state.lives -= 1;
            state.shake = reduceMotion ? 0 : 0.32;
            state.flash = 0.4;
            crumb(item.x, item.y, 8, "#ff6b4a");
            if (state.lives <= 0) {
              noteBest();
              syncHud();
              endGame();
              return;
            }
          }
          noteBest();
          syncHud();
          continue;
        }

        if (item.y - item.r > H + 12) state.items.splice(i, 1);
      }

      state.bits.forEach((bit) => {
        bit.vy += 780 * dt;
        bit.x += bit.vx * dt;
        bit.y += bit.vy * dt;
        bit.rot += bit.vr * dt;
        bit.life -= dt;
      });
      state.bits = state.bits.filter((bit) => bit.life > 0);

      state.pops.forEach((pop) => {
        pop.y -= 44 * dt;
        pop.life -= dt;
      });
      state.pops = state.pops.filter((pop) => pop.life > 0);

      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
      if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);
    }

    function frame(now) {
      const dt = Math.min((now - state.last) / 1000, 0.05);
      state.last = now;
      if (state.mode === "playing" && !state.paused && !document.hidden) update(dt);
      draw();
      requestAnimationFrame(frame);
    }

    function showPanel() {
      sqRoot.hidden = false;
      sqPanel.hidden = false;
      sqLauncher.hidden = true;
      sqMin.setAttribute("aria-expanded", "true");
      fitCanvas();
    }

    function hidePanel() {
      autoTuckOff = true;
      state.paused = true;
      sqPanel.hidden = true;
      sqLauncher.hidden = false;
      sqMin.setAttribute("aria-expanded", "false");
      sqLauncher.focus({ preventScroll: true });
    }

    function tuckSilently() {
      if (state.mode === "playing" || sqPanel.hidden) return;
      state.paused = true;
      sqPanel.hidden = true;
      sqLauncher.hidden = false;
      sqMin.setAttribute("aria-expanded", "false");
    }

    sqMin.addEventListener("click", hidePanel);

    sqLauncher.addEventListener("click", () => {
      autoTuckOff = true;
      showPanel();
      state.paused = false;
      state.last = performance.now();
      sqMin.focus({ preventScroll: true });
    });

    sqAgain.addEventListener("click", startGame);

    function pointerTarget(event) {
      const rect = sqCanvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * W;
      const half = bowl.width / 2;
      bowl.target = Math.max(half + 6, Math.min(W - half - 6, x));
    }

    sqCanvas.addEventListener("pointermove", pointerTarget);
    sqCanvas.addEventListener("pointerdown", (event) => {
      pointerTarget(event);
      sqCanvas.focus({ preventScroll: true });
      try {
        sqCanvas.setPointerCapture(event.pointerId);
      } catch (e) {}
    });

    sqCanvas.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") keys.left = true;
      else if (key === "arrowright" || key === "d") keys.right = true;
      else return;
      event.preventDefault();
    });

    sqCanvas.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") keys.left = false;
      else if (key === "arrowright" || key === "d") keys.right = false;
    });

    sqCanvas.addEventListener("blur", () => {
      keys.left = false;
      keys.right = false;
    });

    document.addEventListener("visibilitychange", () => {
      state.last = performance.now();
      if (!document.hidden && !sqPanel.hidden) fitCanvas();
    });

    window.addEventListener("resize", fitCanvas);

    syncHud();
    setOverlay("ready");
    showPanel();
    requestAnimationFrame(() => {
      fitCanvas();
      requestAnimationFrame(frame);
    });
    setTimeout(() => sqRoot.classList.add("settled"), 1800);
    const narrow = window.matchMedia("(max-width: 560px)").matches;
    setTimeout(() => {
      if (!autoTuckOff && state.mode === "ready") tuckSilently();
    }, narrow ? 14000 : 18000);

    window.addEventListener(
      "scroll",
      () => {
        if (!autoTuckOff && window.scrollY > (narrow ? 200 : 360)) tuckSilently();
      },
      { passive: true }
    );
  }
})();

/* ---------------------------------------------------------------
   Whimsy: a tap releases six butterflies
   --------------------------------------------------------------- */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const COLORS = ["#ff8a5b", "#ffd166", "#ffb3d9", "#c9b8ff", "#7cc6ff", "#5fd6a8"];
  const COUNT = 6;
  const MAX_LIVE = 48;
  const JAR_REVEAL = [1, 3, 6, 10, 15, 21];
  const jarBtn = document.getElementById("jar-btn");
  const jarCountEl = document.getElementById("jar-count");
  const jarPlus = document.getElementById("jar-plus");
  const jarTip = document.getElementById("jar-tip");
  const catchHint = document.getElementById("catch-hint");
  const jarStatus = document.getElementById("jar-status");
  const jarFlies = Array.from(document.querySelectorAll(".jar-fly"));
  let caught = 0;
  let layer = null;
  let live = 0;
  let press = null;

  const butterfly = (color) => `
    <svg class="bfly" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g class="bfly-wing bfly-wing-l">
        <path d="M23 24C19 11 10 5 5.5 8.5 1.5 11.7 4 20 11.5 24 4.5 26 2.5 33 6.5 36.5 10.5 40 18 34 23 27Z" fill="${color}" stroke="#292a23" stroke-width="2.1" stroke-linejoin="round"/>
        <circle cx="12" cy="15" r="2.6" fill="#fffefa" opacity=".75"/>
        <circle cx="11.5" cy="31.5" r="1.9" fill="#292a23" opacity=".28"/>
      </g>
      <g class="bfly-wing bfly-wing-r">
        <path d="M25 24C29 11 38 5 42.5 8.5 46.5 11.7 44 20 36.5 24 43.5 26 45.5 33 41.5 36.5 37.5 40 30 34 25 27Z" fill="${color}" stroke="#292a23" stroke-width="2.1" stroke-linejoin="round"/>
        <circle cx="36" cy="15" r="2.6" fill="#fffefa" opacity=".75"/>
        <circle cx="36.5" cy="31.5" r="1.9" fill="#292a23" opacity=".28"/>
      </g>
      <ellipse cx="24" cy="26" rx="2.1" ry="7.4" fill="#292a23"/>
      <circle cx="24" cy="18" r="2.8" fill="#292a23"/>
      <path d="M22.6 15.4C20.6 11.5 18.7 10 16.5 9.4M25.4 15.4C27.4 11.5 29.3 10 31.5 9.4" stroke="#292a23" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>`;

  function ensureLayer() {
    if (layer && layer.isConnected) return layer;
    layer = document.createElement("div");
    layer.className = "bfly-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    return layer;
  }

  function kill(wrap) {
    if (wrap.dataset.dead) return;
    wrap.dataset.dead = "1";
    wrap.remove();
    live -= 1;
  }

  function release(x, y) {
    if (reduceMotion.matches || live >= MAX_LIVE) return;
    const host = ensureLayer();

    for (let i = 0; i < COUNT; i++) {
      const size = 40 + Math.random() * 14;
      const angle = -Math.PI / 2 + (i - (COUNT - 1) / 2) * 0.44 + (Math.random() - 0.5) * 0.28;
      const dist = 120 + Math.random() * 110;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist + 34 + Math.random() * 54;
      const dur = 2 + Math.random() * 0.8;
      const delay = i * 0.04 + Math.random() * 0.05;
      const start = 8 + Math.random() * 10;

      const wrap = document.createElement("div");
      wrap.className = "bfly-burst";
      wrap.style.left = x + Math.cos(angle) * start - size / 2 + "px";
      wrap.style.top = y + Math.sin(angle) * start - size / 2 + "px";
      wrap.style.width = size + "px";
      wrap.style.height = size + "px";
      wrap.style.setProperty("--dur", dur + "s");
      wrap.style.setProperty("--delay", delay + "s");
      wrap.style.setProperty("--hx", dx * 0.5 + "px");
      wrap.style.setProperty("--hy", dy * 0.5 - 30 + "px");
      wrap.style.setProperty("--dx", dx + "px");
      wrap.style.setProperty("--dy", dy + "px");
      wrap.style.setProperty("--r0", (Math.random() * 40 - 20).toFixed(0) + "deg");
      wrap.style.setProperty("--r1", (Math.random() * 50 - 25).toFixed(0) + "deg");
      wrap.style.setProperty("--r2", (Math.random() * 80 - 40).toFixed(0) + "deg");
      wrap.innerHTML = butterfly(COLORS[i]);

      host.appendChild(wrap);
      live += 1;
      window.setTimeout(() => kill(wrap), (dur + delay) * 1000 + 250);
    }
  }

  function drift() {
    if (reduceMotion.matches || document.hidden || live >= MAX_LIVE) return;
    const host = ensureLayer();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const fromLeft = Math.random() < 0.5;
    const size = 40 + Math.random() * 16;
    const x = fromLeft ? -size * 0.55 : vw - size * 0.45;
    const y = vh * (0.14 + Math.random() * 0.68) - size / 2;
    const inward = vw * (0.16 + Math.random() * 0.19);
    const dx = (fromLeft ? 1 : -1) * inward;
    const dy = (Math.random() - 0.3) * 180;
    const dur = 6 + Math.random() * 3;
    const delay = Math.random() * 0.5;

    const wrap = document.createElement("div");
    wrap.className = "bfly-drift";
    wrap.style.left = x + "px";
    wrap.style.top = y + "px";
    wrap.style.width = size + "px";
    wrap.style.height = size + "px";
    wrap.style.setProperty("--dur", dur + "s");
    wrap.style.setProperty("--delay", delay + "s");
    wrap.style.setProperty("--mx", dx * 0.5 + "px");
    wrap.style.setProperty("--my", dy * 0.4 - 34 + "px");
    wrap.style.setProperty("--dx", dx + "px");
    wrap.style.setProperty("--dy", dy + "px");
    wrap.style.setProperty("--r0", (Math.random() * 30 - 15).toFixed(0) + "deg");
    wrap.style.setProperty("--r1", (Math.random() * 40 - 20).toFixed(0) + "deg");
    wrap.style.setProperty("--r2", (Math.random() * 50 - 25).toFixed(0) + "deg");
    wrap.innerHTML = butterfly(COLORS[Math.floor(Math.random() * COLORS.length)]);

    host.appendChild(wrap);
    live += 1;
    window.setTimeout(() => kill(wrap), (dur + delay) * 1000 + 250);
  }

  function rush() {
    if (reduceMotion.matches || live >= MAX_LIVE) return;
    const host = ensureLayer();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const total = vw < 560 ? 16 : 26;

    for (let i = 0; i < total; i++) {
      const size = 42 + Math.random() * 22;
      const edge = i % 4;
      const spreadX = vw * (0.4 + Math.random() * 0.45);
      const spreadY = vh * (0.22 + Math.random() * 0.4);
      let x;
      let y;
      let dx;
      let dy;

      if (edge === 0) {
        x = -size * 0.7;
        y = vh * (0.08 + Math.random() * 0.84);
        dx = spreadX;
        dy = (Math.random() - 0.5) * vh * 0.28;
      } else if (edge === 1) {
        x = vw - size * 0.3;
        y = vh * (0.08 + Math.random() * 0.84);
        dx = -spreadX;
        dy = (Math.random() - 0.5) * vh * 0.28;
      } else if (edge === 2) {
        x = vw * (0.04 + Math.random() * 0.92) - size / 2;
        y = -size * 0.7;
        dx = (Math.random() - 0.5) * vw * 0.32;
        dy = spreadY;
      } else {
        x = vw * (0.04 + Math.random() * 0.92) - size / 2;
        y = vh - size * 0.3;
        dx = (Math.random() - 0.5) * vw * 0.32;
        dy = -spreadY;
      }

      const dur = 2.6 + Math.random() * 1.6;
      const delay = i * 0.045 + Math.random() * 0.12;

      const wrap = document.createElement("div");
      wrap.className = "bfly-drift";
      wrap.style.left = x + "px";
      wrap.style.top = y + "px";
      wrap.style.width = size + "px";
      wrap.style.height = size + "px";
      wrap.style.setProperty("--dur", dur + "s");
      wrap.style.setProperty("--delay", delay + "s");
      wrap.style.setProperty("--mx", dx * 0.55 + "px");
      wrap.style.setProperty("--my", dy * 0.55 + "px");
      wrap.style.setProperty("--dx", dx + "px");
      wrap.style.setProperty("--dy", dy + "px");
      wrap.style.setProperty("--r0", (Math.random() * 30 - 15).toFixed(0) + "deg");
      wrap.style.setProperty("--r1", (Math.random() * 40 - 20).toFixed(0) + "deg");
      wrap.style.setProperty("--r2", (Math.random() * 50 - 25).toFixed(0) + "deg");
      wrap.innerHTML = butterfly(COLORS[i % COLORS.length]);

      host.appendChild(wrap);
      live += 1;
      window.setTimeout(() => kill(wrap), (dur + delay) * 1000 + 250);
    }
  }

  function aimHintArrow() {
    if (!catchHint) return;
    const arrow = catchHint.querySelector(".catch-arrow");
    if (!arrow) return;
    if (window.innerWidth <= 560 || !jarBtn) {
      arrow.style.left = "";
      arrow.style.top = "";
      arrow.style.bottom = "";
      return;
    }
    const hintRect = catchHint.getBoundingClientRect();
    const jarRect = jarBtn.getBoundingClientRect();
    const arrowRect = arrow.getBoundingClientRect();
    const w = arrowRect.width;
    const h = arrowRect.height;
    const scale = Math.min(w / 190, h / 140);
    const ox = (w - 190 * scale) / 2;
    const oy = (h - 140 * scale) / 2;
    const tipX = jarRect.left + jarRect.width / 2;
    const tipY = jarRect.top - 8;
    const boxLeft = tipX - ox - 8 * scale;
    const boxBottom = tipY + 20 * scale + oy;
    arrow.style.left = boxLeft - hintRect.left + "px";
    arrow.style.top = "auto";
    arrow.style.bottom = hintRect.bottom - boxBottom + "px";
  }

  if (catchHint) {
    window.setTimeout(() => {
      aimHintArrow();
      catchHint.classList.add("show");
    }, 2100);
    window.addEventListener("resize", () => {
      if (catchHint.classList.contains("show")) aimHintArrow();
    });
  }

  function updateJar() {
    if (!jarBtn) return;
    jarCountEl.textContent = String(caught);
    jarBtn.setAttribute(
      "aria-label",
      caught
        ? `Butterfly jar, ${caught} caught. Tap to set them free.`
        : "Butterfly jar, empty. Tap a butterfly to catch it."
    );
    jarFlies.forEach((fly, index) => fly.classList.toggle("show", caught >= JAR_REVEAL[index]));
  }

  function bumpJar() {
    if (!jarBtn) return;
    jarBtn.classList.remove("pop");
    void jarBtn.offsetWidth;
    jarBtn.classList.add("pop");
    if (jarPlus) {
      jarPlus.classList.remove("go");
      void jarPlus.offsetWidth;
      jarPlus.classList.add("go");
    }
  }

  function butterflyAt(x, y) {
    const list = document.querySelectorAll(".bfly-drift, .bfly-burst");
    for (let i = list.length - 1; i >= 0; i--) {
      const el = list[i];
      if (el.dataset.dead) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8) return el;
    }
    return null;
  }

  function catchButterfly(wrap) {
    if (!jarBtn) return;
    wrap.dataset.dead = "1";
    live -= 1;

    const from = wrap.getBoundingClientRect();
    const jar = jarBtn.getBoundingClientRect();
    wrap.style.animation = "none";
    wrap.style.position = "fixed";
    wrap.style.left = from.left + "px";
    wrap.style.top = from.top + "px";
    wrap.style.width = from.width + "px";
    wrap.style.height = from.height + "px";
    wrap.style.transform = "none";

    const dx = jar.left + jar.width / 2 - (from.left + from.width / 2);
    const dy = jar.top + jar.height * 0.4 - (from.top + from.height / 2);
    const flight = wrap.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.15 }
      ],
      { duration: 520, easing: "cubic-bezier(0.5, 0, 0.7, 0.35)" }
    );
    flight.onfinish = () => wrap.remove();
    flight.oncancel = () => wrap.remove();

    caught += 1;
    updateJar();
    bumpJar();
    if (jarStatus) jarStatus.textContent = `Caught. ${caught} in the jar.`;
    if (jarTip && caught === 1) {
      jarTip.classList.add("show");
      window.setTimeout(() => jarTip.classList.remove("show"), 4200);
    }
  }

  function setFree() {
    if (!jarBtn) return;
    jarBtn.classList.remove("shake");
    void jarBtn.offsetWidth;
    jarBtn.classList.add("shake");

    if (!caught) {
      if (jarStatus) jarStatus.textContent = "The jar is empty. Tap a butterfly to catch it.";
      return;
    }

    const freed = caught;
    caught = 0;
    updateJar();
    if (jarTip) jarTip.classList.remove("show");
    if (jarStatus) jarStatus.textContent = `Set ${freed} butterflies free.`;

    if (reduceMotion.matches || live >= MAX_LIVE) return;
    const host = ensureLayer();
    const jar = jarBtn.getBoundingClientRect();
    const originX = jar.left + jar.width / 2;
    const originY = jar.top + jar.height * 0.4;
    const total = Math.min(freed, 18);
    const vw = window.innerWidth;

    for (let i = 0; i < total; i++) {
      const size = 36 + Math.random() * 14;
      const dur = 2.4 + Math.random() * 1;
      const delay = i * 0.04 + Math.random() * 0.05;
      const dx = 40 + Math.random() * Math.min(360, vw * 0.5);
      const dy = -(190 + Math.random() * 380);

      const wrap = document.createElement("div");
      wrap.className = "bfly-burst";
      wrap.style.left = originX - size / 2 + "px";
      wrap.style.top = originY - size / 2 + "px";
      wrap.style.width = size + "px";
      wrap.style.height = size + "px";
      wrap.style.setProperty("--dur", dur + "s");
      wrap.style.setProperty("--delay", delay + "s");
      wrap.style.setProperty("--hx", dx * 0.5 + "px");
      wrap.style.setProperty("--hy", dy * 0.5 + "px");
      wrap.style.setProperty("--dx", dx + "px");
      wrap.style.setProperty("--dy", dy + "px");
      wrap.style.setProperty("--r0", (Math.random() * 40 - 20).toFixed(0) + "deg");
      wrap.style.setProperty("--r1", (Math.random() * 50 - 25).toFixed(0) + "deg");
      wrap.style.setProperty("--r2", (Math.random() * 80 - 40).toFixed(0) + "deg");
      wrap.innerHTML = butterfly(COLORS[i % COLORS.length]);

      host.appendChild(wrap);
      live += 1;
      window.setTimeout(() => kill(wrap), (dur + delay) * 1000 + 250);
    }
  }

  if (jarBtn) {
    updateJar();
    jarBtn.addEventListener("click", setFree);
  }

  function scheduleDrift() {
    window.setTimeout(() => {
      drift();
      if (Math.random() < 0.5) window.setTimeout(drift, 400 + Math.random() * 900);
      scheduleDrift();
    }, 1200 + Math.random() * 1400);
  }

  window.setTimeout(rush, 420);

  window.setTimeout(scheduleDrift, 3200);

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      press = { id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now() };
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerup",
    (event) => {
      if (!press || press.id !== event.pointerId) return;
      const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y);
      const quick = performance.now() - press.at < 700;
      press = null;
      if (moved > 10 || !quick) return;
      if (event.target.closest("#side-quest, dialog, #butterfly-jar")) return;
      const hit = butterflyAt(event.clientX, event.clientY);
      if (hit) {
        catchButterfly(hit);
        return;
      }
      release(event.clientX, event.clientY);
    },
    { passive: true }
  );

  document.addEventListener("pointercancel", () => {
    press = null;
  });
})();

/* ---------------------------------------------------------------
   Whimsy: the hero headline spins like a tornado
   --------------------------------------------------------------- */
(() => {
  const headline = document.querySelector(".hero h1");
  if (!headline) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const tornado = () => {
    if (reduceMotion.matches) return;
    headline.animate(
      [
        { transform: "rotate(0deg) scale(1) translateX(0)" },
        { transform: "rotate(-6deg) scale(0.98) translateX(3px)", offset: 0.1 },
        { transform: "rotate(150deg) scale(0.9) translateX(-4px)", offset: 0.45 },
        { transform: "rotate(300deg) scale(0.94) translateX(4px)", offset: 0.78 },
        { transform: "rotate(354deg) scale(0.99) translateX(0)", offset: 0.94 },
        { transform: "rotate(360deg) scale(1) translateX(0)" }
      ],
      { duration: 1150, easing: "cubic-bezier(0.45, 0.05, 0.25, 1)" }
    );
  };

  window.setTimeout(tornado, 450);
  window.setInterval(tornado, 15000);
})();
