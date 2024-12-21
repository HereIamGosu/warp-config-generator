async function generateConfig() {
    const button = document.getElementById('generateButton');
    const button_text = document.querySelector('#generateButton .button__text');
    const status = document.getElementById('status');
    
    // Изменяем состояние кнопки на загрузку
    button.disabled = true;
    button.classList.add("button--loading");

    try {
        const response = await fetch(`/warp`);
        const data = await response.json();

        if (data.success) {
            const downloadFile = () => {
                const link = document.createElement('a');
                link.href = 'data:text/plain;base64,' + data.content;
                link.download = "AmneziaWarp.conf"; // Без даты в имени файла
                link.click();
            };

            button_text.textContent = 'Скачать AmneziaWarp.conf'; // Текст кнопки без даты
            button.onclick = downloadFile;
            downloadFile();
        } else {
            status.textContent = 'Ошибка: ' + data.message;
        }
    } catch (error) {
        status.textContent = 'Произошла ошибка при генерации.';
    } finally {
        button.disabled = false;
        button.classList.remove("button--loading");
    }
}

document.getElementById('generateButton').onclick = generateConfig;

document.getElementById('telegramButton').onclick = function() {
    window.location.href = 'https://t.me/findllimonix';
}

document.getElementById('githubButton').onclick = function() {
    window.location.href = 'https://github.com/llimonix/warp-config-generator-vercel';
}
