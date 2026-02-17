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
        setError("message", "Сообщение должно быть чуть подробнее (от 10 символов).");
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

// Задание 1: Кликер
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
