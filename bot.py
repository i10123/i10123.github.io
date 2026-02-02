import asyncio
import logging
import sys
import time
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, FSInputFile
from aiogram.utils.markdown import hbold

# ⚙️ НАСТРОЙКИ
BOT_TOKEN = "8523429879:AAHhFNhmYTw4jsFuUEn-6ehbNSeID6LYfkw"
WEB_APP_URL = "https://i10123.github.io/"
ADMIN_IDS = [6250975346]
WELCOME_IMAGE_PATH = "welcome.png"

# 🚀 ЛОГИКА БОТА
logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

async def show_loading_animation():
    print("🚀 Инициализация систем Naval Warfare...")
    # Анимация прогресс-бара
    toolbar_width = 40
    for i in range(toolbar_width + 1):
        time.sleep(0.05)  # Имитация бурной деятельности
        progress = int((i / toolbar_width) * 100)
        bar = "█" * i + "-" * (toolbar_width - i)
        # Вывод в одну строку с обновлением (\r возвращает курсор в начало)
        sys.stdout.write(f"\r[{bar}] {progress}% Загрузка модулей")
        sys.stdout.flush()
    print("\n✅ Система готова к бою!\n")


@dp.message(CommandStart())
async def command_start_handler(message: types.Message, command: CommandObject):
    """
    Эту функцию бот выполняет, когда юзер жмет /start
    """
    user_name = message.from_user.full_name
    start_arg = command.args

    if start_arg:
        final_url = f"{WEB_APP_URL}?startapp={start_arg}"
        button_text = "🚀 ПРИСОЕДИНИТЬСЯ К БОЮ"
    else:
        final_url = WEB_APP_URL
        button_text = "🎮 ИГРАТЬ В МОРСКОЙ БОЙ"

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=button_text, web_app=WebAppInfo(url=final_url))],
        [InlineKeyboardButton(text="📢 Чат тех поддержки", url="https://t.me/+TBA0Y-Cg3aU5M2Vi")]
    ])

    caption_text = (
        f"👋 Здравия желаю, {hbold(user_name)}!\n\n"
        f"⚓️ <b>NAVAL WARFARE 2077</b> — это морской бой нового поколения.\n\n"
        f"🔥 <b>Что тебя ждет:</b>\n"
        f"• Сражения с реальными игроками\n"
        f"• Система званий и рейтингов\n"
        f"• Эпические спецэффекты\n\n"
        f"👇 Жми кнопку ниже, чтобы развернуть флот!"
    )

    # Пытаемся отправить файл, если он есть
    try:
        photo_file = FSInputFile(WELCOME_IMAGE_PATH)
        await message.answer_photo(
            photo=photo_file,
            caption=caption_text,
            parse_mode="HTML",
            reply_markup=keyboard
        )
    except Exception as e:
        # Если картинки нет, отправляем просто текст, чтобы бот не падал
        logging.error(f"Не удалось отправить картинку: {e}")
        await message.answer(caption_text, parse_mode="HTML", reply_markup=keyboard)


# Убрали аргумент b0t, используем глобальный bot
async def on_startup():
    # Запускаем красивую полоску загрузки
    await show_loading_animation()

    # Рассылка админам
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(admin_id, "✅ Бот успешно запущен и готов к работе!")
        except Exception as e:
            logging.error(f"Не удалось отправить сообщение админу {admin_id}: {e}")


# Убрали аргумент b0t
async def on_shutdown():
    print("\n🛑 Останавливаю системы...")
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(admin_id, "🛑 Бот остановлен!", parse_mode="HTML")
        except Exception:
            pass
    print("Бот выключен.")


# ▶️ ЗАПУСК
async def main():
    # Регистрируем функции без лишних аргументов
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)

    # Удаляем веб хуки, чтобы бот сразу ответил на накопившиеся сообщения
    await bot.delete_webhook(drop_pending_updates=True)

    # ВАЖНО: Тут мы явно указываем, что поллинг идет для нашего bot
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Exit")