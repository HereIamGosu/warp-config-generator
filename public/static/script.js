async function generateConfig() {
    const button = document.getElementById('generateButton');
    const button_text = document.querySelector('#generateButton .button__text');
    const status = document.getElementById('status');
    
    // Получаем текущую дату в формате "DD.MM.YYYY"
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const year = currentDate.getFullYear();
    const formattedDate = `${day}.${month}.${year}`; // Форматируем дату как "22.12.2024"

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
                link.download = `AmneziaWarp_${formattedDate}.conf`; // Используем текущую дату
                link.click();
            };

            button_text.textContent = `Скачать AmneziaWarp_${formattedDate}.conf`; // Используем текущую дату
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
