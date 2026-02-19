// Простая валидация и визуальная обратная связь
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

function setError(field, message) {
    const wrapper = document.getElementById("field-" + field);
    const errorEl = document.querySelector(
        '.error-text[data-error-for="' + field + '"]'
    );
    if (wrapper) wrapper.classList.add("field-error");
    if (errorEl) errorEl.textContent = message || "";
}

function clearErrors() {
    document
        .querySelectorAll(".field-error")
        .forEach((el) => el.classList.remove("field-error"));
    document
        .querySelectorAll(".error-text")
        .forEach((el) => (el.textContent = ""));
}

form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    statusEl.textContent = "";
    statusEl.className = "form-status";

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    let valid = true;

    if (!name) {
        setError("name", "Пожалуйста, укажите имя.");
        valid = false;
    }

    if (!email) {
        setError("email", "Email обязателен.");
        valid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\sс@]+$/;
        if (!emailRegex.test(email)) {
            setError("email", "Введите корректный email.");
            valid = false;
        }
    }

    if (!message || message.length < 10) {
        setError("message", "Сообщение должно быть чуточку подробнее (от 10 символов).");
        valid = false;
    }

    if (!valid) {
        statusEl.textContent = "Проверьте форму — есть ошибки.";
        statusEl.classList.add("form-status--error");
        return;
    }

    // Имитация отправки
    statusEl.textContent = "Отправка...";
    setTimeout(() => {
        statusEl.textContent = "Сообщение успешно отправлено (имитация).";
        statusEl.classList.add("form-status--ok");
        form.reset();
    }, 600);
});

// Мини-игры

function byId(id) {
    return document.getElementById(id);
}

function safeJsonParse(value, fallback) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

// Навигация: выпадающее меню
(function initMiniGamesDropdown() {
    const toggle = document.querySelector(".nav-dropdown-toggle");
    const menu = byId("miniGamesMenu");
    if (!toggle || !menu) return;

    function setOpen(nextOpen) {
        menu.classList.toggle("open", nextOpen);
        toggle.setAttribute("aria-expanded", String(nextOpen));
    }

    toggle.addEventListener("click", () => {
        const isOpen = menu.classList.contains("open");
        setOpen(!isOpen);
    });

    document.addEventListener("click", (e) => {
        if (!menu.classList.contains("open")) return;
        const target = e.target;
        if (target instanceof Node && (menu.contains(target) || toggle.contains(target))) return;
        setOpen(false);
    });

    menu.addEventListener("click", (e) => {
        const link = e.target && e.target.closest && e.target.closest("a");
        if (!link) return;
        setOpen(false);
    });
})();

// Задание 1: Игра на скорости реакции
(function initReactionGame() {
    const hitsEl = byId("reactionHits");
    const avgEl = byId("reactionAvg");
    const timeEl = byId("reactionTime");
    const area = byId("reactionArea");
    const button = byId("reactionButton");
    const startBtn = byId("reactionStart");
    const resetBtn = byId("reactionReset");
    const status = byId("reactionStatus");
    if (!hitsEl || !avgEl || !timeEl || !area || !button || !startBtn || !resetBtn || !status) return;

    const DURATION_SEC = 30;
    let hits = 0;
    let totalReaction = 0;
    let timeLeft = DURATION_SEC;
    let timer = null;
    let showTimeout = null;
    let active = false;
    let appearedAt = 0;

    function formatAvg() {
        if (!hits) return "—";
        return `${(totalReaction / hits / 1000).toFixed(2)} с`;
    }

    function render() {
        hitsEl.textContent = String(hits);
        avgEl.textContent = formatAvg();
        timeEl.textContent = String(timeLeft);
    }

    function setButtonVisible(visible) {
        button.classList.toggle("show", visible);
        button.disabled = !visible;
    }

    function clearTimers() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        if (showTimeout) {
            clearTimeout(showTimeout);
            showTimeout = null;
        }
    }

    function endGame() {
        active = false;
        clearTimers();
        setButtonVisible(false);
        startBtn.disabled = false;
        resetBtn.disabled = false;
        status.textContent = `Время вышло! Попаданий: ${hits}. Среднее: ${formatAvg()}.`;
        render();
    }

    function showButton() {
        if (!active) return;
        setButtonVisible(true);
        const areaRect = area.getBoundingClientRect();
        const btnRect = button.getBoundingClientRect();
        const maxX = Math.max(0, areaRect.width - btnRect.width);
        const maxY = Math.max(0, areaRect.height - btnRect.height);
        const left = Math.random() * maxX;
        const top = Math.random() * maxY;
        button.style.left = `${left}px`;
        button.style.top = `${top}px`;
        appearedAt = performance.now();
        status.textContent = "Жмите!";
    }

    function scheduleNext() {
        if (!active) return;
        setButtonVisible(false);
        appearedAt = 0;
        const delay = 1000 + Math.random() * 4000;
        status.textContent = "Ждите появления кнопки...";
        showTimeout = window.setTimeout(showButton, delay);
    }

    function startGame() {
        if (active) return;
        hits = 0;
        totalReaction = 0;
        timeLeft = DURATION_SEC;
        active = true;
        startBtn.disabled = true;
        resetBtn.disabled = false;
        status.textContent = "Игра началась. Ждите кнопку.";
        render();

        timer = window.setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
                timeLeft = 0;
                render();
                endGame();
                return;
            }
            render();
        }, 1000);

        scheduleNext();
    }

    function resetGame() {
        active = false;
        clearTimers();
        hits = 0;
        totalReaction = 0;
        timeLeft = DURATION_SEC;
        appearedAt = 0;
        setButtonVisible(false);
        startBtn.disabled = false;
        resetBtn.disabled = true;
        status.textContent = "Сброшено. Нажмите «Старт».";
        render();
    }

    button.addEventListener("click", () => {
        if (!active || !appearedAt) return;
        const reaction = performance.now() - appearedAt;
        hits += 1;
        totalReaction += reaction;
        appearedAt = 0;
        render();
        scheduleNext();
    });

    startBtn.addEventListener("click", startGame);
    resetBtn.addEventListener("click", resetGame);

    resetGame();
})();

// Задание 2: Генератор приключений
(function initAdventureGenerator() {
    const output = byId("adventureOutput");
    const btnGen = byId("adventureGenerate");
    const btnSave = byId("adventureSave");
    const btnClear = byId("adventureClear");
    const savedList = byId("adventureSaved");
    if (!output || !btnGen || !btnSave || !btnClear || !savedList) return;

    const STORAGE_KEY = "miniGames.adventures";
    const characters = ["рыцарь", "маг", "вор", "охотник", "алхимик", "путешественник", "лучник"];
    const locations = ["тёмном лесу", "заброшенном замке", "подводном царстве", "пустыне", "городе на облаках", "ледяной пещере"];
    const villains = ["драконом", "колдуном", "гоблином", "древним духом", "некромантом", "пиратским капитаном"];

    let currentText = "";

    function randomFrom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function loadSaved() {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = safeJsonParse(raw, []);
        return Array.isArray(parsed) ? parsed : [];
    }

    function saveSaved(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    function renderSaved() {
        const list = loadSaved();
        savedList.innerHTML = "";
        if (!list.length) {
            const li = document.createElement("li");
            li.textContent = "Пока пусто.";
            savedList.appendChild(li);
            return;
        }
        list.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            savedList.appendChild(li);
        });
    }

    function generate() {
        const c = randomFrom(characters);
        const l = randomFrom(locations);
        const v = randomFrom(villains);
        currentText = `Ваш персонаж — ${c} находится в ${l} и сражается с ${v}.`;
        output.textContent = currentText;
        btnSave.disabled = false;
    }

    function saveCurrent() {
        if (!currentText) return;
        const list = loadSaved();
        list.unshift(currentText);
        const unique = Array.from(new Set(list)).slice(0, 20);
        saveSaved(unique);
        renderSaved();
    }

    function clearSaved() {
        localStorage.removeItem(STORAGE_KEY);
        renderSaved();
    }

    btnGen.addEventListener("click", generate);
    btnSave.addEventListener("click", saveCurrent);
    btnClear.addEventListener("click", clearSaved);

    renderSaved();
})();

// Задание 3: Угадай число
(function initGuessNumber() {
    const hint = byId("guessHint");
    const input = byId("guessInput");
    const submit = byId("guessSubmit");
    const restart = byId("guessRestart");
    const attemptsEl = byId("guessAttempts");
    if (!hint || !input || !submit || !restart || !attemptsEl) return;

    let secret = 0;
    let attempts = 0;
    let finished = false;

    function newGame() {
        secret = Math.floor(Math.random() * 100) + 1;
        attempts = 0;
        finished = false;
        attemptsEl.textContent = "0";
        hint.textContent = "Я загадал число от 1 до 100. Попробуйте угадать.";
        input.value = "";
        input.disabled = false;
        submit.disabled = false;
    }

    function finish(text) {
        finished = true;
        hint.textContent = text;
        input.disabled = true;
        submit.disabled = true;
    }

    function check() {
        if (finished) return;
        const value = Number(input.value);
        if (!Number.isInteger(value) || value < 1 || value > 100) {
            hint.textContent = "Введите целое число от 1 до 100.";
            return;
        }
        attempts += 1;
        attemptsEl.textContent = String(attempts);

        if (value === secret) {
            finish(`Верно! Это ${secret}. Попыток: ${attempts}.`);
            return;
        }

        if (value < secret) {
            hint.textContent = "Моё число больше.";
        } else {
            hint.textContent = "Моё число меньше.";
        }
        input.select();
    }

    submit.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            check();
        }
    });
    restart.addEventListener("click", newGame);

    newGame();
})();

// Задание 2: Крестики-нолики
(function initTicTacToe() {
    const grid = byId("ticGrid");
    const statusEl = byId("ticStatus");
    const restartBtn = byId("ticRestart");
    const vsCpuToggle = byId("ticVsCpu");
    const scoreXEl = byId("ticScoreX");
    const scoreOEl = byId("ticScoreO");
    if (!grid || !statusEl || !restartBtn || !vsCpuToggle || !scoreXEl || !scoreOEl) return;

    const cells = Array.from(grid.querySelectorAll(".tic-cell"));
    const combos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    let board = Array(9).fill(null);
    let currentPlayer = "X";
    let gameOver = false;
    let scoreX = 0;
    let scoreO = 0;

    function updateScores() {
        scoreXEl.textContent = String(scoreX);
        scoreOEl.textContent = String(scoreO);
    }

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function render() {
        cells.forEach((cell, index) => {
            cell.textContent = board[index] || "";
            cell.disabled = gameOver || Boolean(board[index]);
        });
    }

    function checkResult() {
        for (const [a, b, c] of combos) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (board.every(Boolean)) {
            return "draw";
        }
        return null;
    }

    function finishGame(result) {
        gameOver = true;
        if (result === "draw") {
            setStatus("Ничья!");
        } else {
            setStatus(`Победил ${result}!`);
            if (result === "X") {
                scoreX += 1;
            } else {
                scoreO += 1;
            }
            updateScores();
        }
        render();
    }

    function cpuMove() {
        if (gameOver) return;
        const available = board
            .map((value, index) => (value ? null : index))
            .filter((value) => value !== null);
        if (!available.length) return;
        const pick = available[Math.floor(Math.random() * available.length)];
        window.setTimeout(() => makeMove(pick), 350);
    }

    function makeMove(index) {
        if (gameOver || board[index]) return;
        board[index] = currentPlayer;
        const result = checkResult();
        if (result) {
            finishGame(result);
            return;
        }
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        setStatus(`Ход ${currentPlayer}`);
        render();
        if (vsCpuToggle.checked && currentPlayer === "O") {
            cpuMove();
        }
    }

    function restart() {
        board = Array(9).fill(null);
        currentPlayer = "X";
        gameOver = false;
        setStatus("Ход X");
        render();
        if (vsCpuToggle.checked && currentPlayer === "O") {
            cpuMove();
        }
    }

    cells.forEach((cell) => {
        cell.addEventListener("click", () => {
            const index = Number(cell.dataset.index);
            if (Number.isNaN(index)) return;
            makeMove(index);
        });
    });

    vsCpuToggle.addEventListener("change", () => {
        if (!gameOver && vsCpuToggle.checked && currentPlayer === "O") {
            cpuMove();
        }
    });

    restartBtn.addEventListener("click", restart);

    updateScores();
    restart();
})();

// Задание 3: Лабиринт
(function initLabyrinth() {
    const grid = byId("labGrid");
    const statusEl = byId("labStatus");
    const timeEl = byId("labTime");
    const startBtn = byId("labStart");
    const restartBtn = byId("labRestart");
    if (!grid || !statusEl || !timeEl || !startBtn || !restartBtn) return;

    const layout = [
        "#######",
        "#S    #",
        "# ### #",
        "#   # #",
        "# # # #",
        "#   #E#",
        "#######"
    ];

    const rows = layout.length;
    const cols = layout[0].length;
    const cells = [];
    let start = { row: 0, col: 0 };
    let exit = { row: 0, col: 0 };
    let player = { row: 0, col: 0 };
    let gameOver = false;
    let gameActive = false;
    let timer = null;
    let startTime = 0;

    function buildGrid() {
        grid.innerHTML = "";
        grid.style.setProperty("--lab-cols", String(cols));
        cells.length = 0;
        for (let row = 0; row < rows; row += 1) {
            cells[row] = [];
            for (let col = 0; col < cols; col += 1) {
                const cell = document.createElement("div");
                cell.classList.add("lab-cell");
                const value = layout[row][col];
                if (value === "#") {
                    cell.classList.add("wall");
                }
                if (value === "S") {
                    start = { row, col };
                }
                if (value === "E") {
                    exit = { row, col };
                    cell.classList.add("exit");
                }
                cells[row][col] = cell;
                grid.appendChild(cell);
            }
        }
    }

    function updatePlayer(next) {
        cells[player.row][player.col].classList.remove("player");
        player = { ...next };
        cells[player.row][player.col].classList.add("player");
    }

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function startTimer() {
        stopTimer();
        startTime = performance.now();
        timeEl.textContent = "0.0";
        timer = window.setInterval(() => {
            const elapsed = (performance.now() - startTime) / 1000;
            timeEl.textContent = elapsed.toFixed(1);
        }, 100);
    }

    function prepare() {
        buildGrid();
        gameOver = false;
        gameActive = false;
        setStatus("Нажмите «Старт», чтобы начать.");
        timeEl.textContent = "0.0";
        stopTimer();
        startBtn.disabled = false;
        restartBtn.disabled = true;
    }

    function startGame() {
        buildGrid();
        player = { ...start };
        cells[player.row][player.col].classList.add("player");
        gameOver = false;
        gameActive = true;
        setStatus("Дойдите до выхода.");
        startTimer();
        grid.focus();
        startBtn.disabled = true;
        restartBtn.disabled = false;
    }

    function restart() {
        if (!gameActive) {
            startGame();
            return;
        }
        startGame();
    }

    function tryMove(rowOffset, colOffset) {
        if (gameOver || !gameActive) return;
        const nextRow = player.row + rowOffset;
        const nextCol = player.col + colOffset;
        if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) return;
        if (layout[nextRow][nextCol] === "#") return;
        updatePlayer({ row: nextRow, col: nextCol });
        if (nextRow === exit.row && nextCol === exit.col) {
            gameOver = true;
            gameActive = false;
            stopTimer();
            setStatus("Вы нашли выход!");
            startBtn.disabled = false;
        }
    }

    grid.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowUp":
                event.preventDefault();
                tryMove(-1, 0);
                break;
            case "ArrowDown":
                event.preventDefault();
                tryMove(1, 0);
                break;
            case "ArrowLeft":
                event.preventDefault();
                tryMove(0, -1);
                break;
            case "ArrowRight":
                event.preventDefault();
                tryMove(0, 1);
                break;
            default:
                break;
        }
    });

    startBtn.addEventListener("click", startGame);
    restartBtn.addEventListener("click", restart);

    prepare();
})();

// Задание 1.5: Кликер
(function initClickerGame() {
    const scoreEl = byId("clickerScore");
    const timeEl = byId("clickerTime");
    const bestEl = byId("clickerBest");
    const status = byId("clickerStatus");
    const startBtn = byId("clickerStart");
    const clickBtn = byId("clickerButton");
    const resetBtn = byId("clickerReset");
    if (!scoreEl || !timeEl || !bestEl || !status || !startBtn || !clickBtn || !resetBtn) return;

    const BEST_KEY = "miniGames.clicker.best";
    const DURATION_SEC = 30;
    let score = 0;
    let timeLeft = DURATION_SEC;
    let timer = null;
    let inGame = false;

    function loadBest() {
        const raw = localStorage.getItem(BEST_KEY);
        const num = Number(raw);
        return Number.isFinite(num) && num >= 0 ? num : 0;
    }

    function saveBest(value) {
        localStorage.setItem(BEST_KEY, String(value));
    }

    function render() {
        scoreEl.textContent = String(score);
        timeEl.textContent = String(timeLeft);
        bestEl.textContent = String(loadBest());
    }

    function endGame() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        inGame = false;
        clickBtn.disabled = true;
        resetBtn.disabled = false;
        startBtn.disabled = false;
        const best = loadBest();
        if (score > best) {
            saveBest(score);
            status.textContent = `Время вышло! Итог: ${score}. Новый рекорд!`;
        } else {
            status.textContent = `Время вышло! Итог: ${score}.`;
        }
        render();
    }

    function startGame() {
        if (inGame) return;
        score = 0;
        timeLeft = DURATION_SEC;
        inGame = true;
        status.textContent = "Игра началась. Кликай!";
        clickBtn.disabled = false;
        resetBtn.disabled = true;
        startBtn.disabled = true;
        render();

        timer = setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
                timeLeft = 0;
                render();
                endGame();
                return;
            }
            render();
        }, 1000);
    }

    function resetGame() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        inGame = false;
        score = 0;
        timeLeft = DURATION_SEC;
        status.textContent = "Сброшено. Нажмите «Старт».";
        clickBtn.disabled = true;
        resetBtn.disabled = true;
        startBtn.disabled = false;
        render();
    }

    startBtn.addEventListener("click", startGame);
    resetBtn.addEventListener("click", resetGame);

    clickBtn.addEventListener("click", () => {
        if (!inGame) return;
        score += 1;
        scoreEl.textContent = String(score);

        clickBtn.classList.add("clicked");
        window.setTimeout(() => clickBtn.classList.remove("clicked"), 120);
    });

    bestEl.textContent = String(loadBest());
    resetGame();
})();
