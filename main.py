import asyncio
import logging
import sys
import time
import os
import signal
import json
from pathlib import Path
from dotenv import load_dotenv
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

# Файл для сохранения состояния (кэш, данные) при выключении бота
DB_PATH = Path(__file__).parent / "bot_state.json"

cached_welcome_file_id = None

# Подавить шумные логи aiogram при обрыве соединения
logging.basicConfig(
    level=logging.WARNING,
    format="%(levelname)s: %(message)s"
)
logging.getLogger("aiogram.dispatcher").setLevel(logging.WARNING)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


def load_db():
    """Загрузить состояние бота из файла (при старте)."""
    global cached_welcome_file_id
    try:
        if DB_PATH.exists():
            with open(DB_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                cached_welcome_file_id = data.get("cached_welcome_file_id")
    except Exception as e:
        logging.warning(f"Не удалось загрузить bot_state.json: {e}")


def save_db():
    """Сохранить состояние бота в файл (при выключении/перезагрузке)."""
    try:
        data = {
            "cached_welcome_file_id": cached_welcome_file_id,
        }
        with open(DB_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logging.warning(f"Не удалось сохранить bot_state.json: {e}")


async def show_loading_animation():
    print("🚀 Инициализация систем Naval Warfare...")
    toolbar_width = 40
    for i in range(toolbar_width + 1):
        time.sleep(0.03)
        progress = int((i / toolbar_width) * 100)
        bar = "█" * i + "-" * (toolbar_width - i)
        sys.stdout.write(f"\r[{bar}] {progress}% Загрузка модулей")
        sys.stdout.flush()
    print("\n✅ Система готова к бою!\n")


@dp.message(CommandStart())
async def command_start_handler(message: types.Message, command: CommandObject):
    global cached_welcome_file_id

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
        if cached_welcome_file_id:
            await message.answer_photo(
                photo=cached_welcome_file_id,
                caption=caption_text,
                parse_mode="HTML",
                reply_markup=keyboard
            )
        else:
            photo_file = FSInputFile(WELCOME_IMAGE_PATH)
            sent_message = await message.answer_photo(
                photo=photo_file,
                caption=caption_text,
                parse_mode="HTML",
                reply_markup=keyboard
            )
            cached_welcome_file_id = sent_message.photo[-1].file_id
            logging.info(f"Файл загружен и кэш сохранён. ID: {cached_welcome_file_id}")
    except Exception as e:
        logging.error(f"Ошибка при отправке фото: {e}")
        await message.answer(caption_text, parse_mode="HTML", reply_markup=keyboard)


async def on_startup():
    load_db()
    await show_loading_animation()
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(admin_id, "✅ Бот запущен")
        except Exception as e:
            logging.error(f"Не удалось отправить сообщение админу {admin_id}: {e}")


async def on_shutdown():
    print("\n🛑 Останавливаю системы...")
    save_db()
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
    try:
        await dp.start_polling(bot)
    except asyncio.CancelledError:
        pass
    finally:
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Остановка бота...")
        save_db()
