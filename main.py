import asyncio
import logging
import sys
import time
import os  # Добавили
from dotenv import load_dotenv  # Добавили
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, FSInputFile
from aiogram.utils.markdown import hbold

# ⚙️ ЗАГРУЗКА НАСТРОЕК
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL")
WELCOME_IMAGE_PATH = os.getenv("WELCOME_IMAGE_PATH")
raw_admin_ids = os.getenv("ADMIN_IDS", "")
ADMIN_IDS = [int(i.strip()) for i in raw_admin_ids.split(",") if i.strip()]

if not BOT_TOKEN:
    exit("Ошибка: BOT_TOKEN не найден в файле .env")

# 🚀 ЛОГИКА БОТА
logging.basicConfig(level=logging.WARNING)
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

async def show_loading_animation():
    print("🚀 Инициализация систем Naval Warfare...")
    toolbar_width = 40
    for i in range(toolbar_width + 1):
        time.sleep(0.03)  # Чуть ускорил для комфорта
        progress = int((i / toolbar_width) * 100)
        bar = "█" * i + "-" * (toolbar_width - i)
        sys.stdout.write(f"\r[{bar}] {progress}% Загрузка модулей")
        sys.stdout.flush()
    print("\n✅ Система готова к бою!\n")


@dp.message(CommandStart())
async def command_start_handler(message: types.Message, command: CommandObject):
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

    try:
        photo_file = FSInputFile(WELCOME_IMAGE_PATH)
        await message.answer_photo(
            photo=photo_file,
            caption=caption_text,
            parse_mode="HTML",
            reply_markup=keyboard
        )
    except Exception as e:
        logging.error(f"Не удалось отправить картинку: {e}")
        await message.answer(caption_text, parse_mode="HTML", reply_markup=keyboard)


async def on_startup():
    await show_loading_animation()
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(admin_id, "✅ Бот запущен")
        except Exception as e:
            logging.error(f"Не удалось отправить сообщение админу {admin_id}: {e}")


async def on_shutdown():
    print("\n🛑 Останавливаю системы...")
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(admin_id, "🛑 Бот остановлен", parse_mode="HTML")
        except Exception:
            pass
    print("Бот выключен.")


async def main():
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Exit")