// Утилита для получения текущей даты в формате "DD.MM.YYYY"
function getFormattedDate() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const year = currentDate.getFullYear();
    return `${day}.${month}.${year}`;
}

// Функция для управления состоянием кнопки (активная/неактивная)
function toggleButtonState(button, isLoading) {
    button.disabled = isLoading;
    button.classList.toggle('button--loading', isLoading);
}

// Основная функция генерации конфигурации
async function generateConfig() {
    const button = document.getElementById('generateButton');
    const buttonText = document.querySelector('#generateButton .button__text');
    const status = document.getElementById('status');
    const formattedDate = getFormattedDate(); // Получаем текущую дату

    // Устанавливаем состояние кнопки на загрузку
    toggleButtonState(button, true);

    try {
        const response = await fetch(`/warp`);
        const data = await response.json();

        if (data.success) {
            const downloadFile = () => {
                const link = document.createElement('a');
                link.href = `data:text/plain;base64,${data.content}`;
                link.download = `AmneziaWarp_${formattedDate}.conf`; // Имя файла с текущей датой
                link.click();
            };

            buttonText.textContent = `Скачать warp_llimonix_${formattedDate}.conf`; // Обновление текста на кнопке
            button.onclick = downloadFile; // Установка обработчика события для кнопки
            downloadFile(); // Скачиваем файл
        } else {
            status.textContent = `Ошибка: ${data.message}`;
        }
    } catch (error) {
        status.textContent = 'Произошла ошибка при генерации.';
    } finally {
        toggleButtonState(button, false); // Снимаем загрузку с кнопки
    }
}

// Обработчики событий для кнопок
document.getElementById('generateButton').onclick = generateConfig;

};
