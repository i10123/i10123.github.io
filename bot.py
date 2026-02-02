import asyncio
import logging
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

    photo_file = FSInputFile(WELCOME_IMAGE_PATH)
    await message.answer_photo(
        photo=photo_file,
        caption=caption_text,
        parse_mode="HTML",
        reply_markup=keyboard
    )


async def on_startup(b0t: Bot):
    print("Бот запущен!")
    for admin_id in ADMIN_IDS:
        try:
            await b0t.send_message(admin_id, "✅ Бот запущен!")
        except Exception as e:
            print(f"Не удалось отправить сообщение админу {admin_id}: {e}")


async def on_shutdown(b0t: Bot):
    print("Бот остановлен!")
    for admin_id in ADMIN_IDS:
        try:
            await b0t.send_message(admin_id, "🛑 Бот остановлен!", parse_mode="HTML")
        except Exception:
            pass


# ▶️ ЗАПУСК
async def main():
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)
    # Удаляем веб хуки, чтобы бот сразу ответил на накопившиеся сообщения
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Exit")