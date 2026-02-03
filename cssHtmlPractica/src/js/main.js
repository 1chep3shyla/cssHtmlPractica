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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
