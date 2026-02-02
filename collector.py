import os
import pyperclip
import re  # Добавили библиотеку для поиска и замены текста

# --- НАСТРОЙКИ ---

PROJECT_PATH = '.'

ALLOWED_EXTENSIONS = {
    '.py', '.html', '.css', '.js', '.json', '.xml',
    '.txt', '.md', '.env', '.sh', '.dockerignore', 'Dockerfile'
}

IGNORE_DIRS = {
    'venv', '.venv', 'env', '__pycache__', '.git',
    '.idea', '.vscode', 'node_modules', 'build', 'dist'
}

IGNORE_FILES = {
    'collector.py', 'package-lock.json', 'yarn.lock'
}

# Регулярное выражение для поиска токена Telegram
# Ищет конструкцию: цифры, двоеточие, и около 35-45 символов (буквы, цифры, знаки)
BOT_TOKEN_PATTERN = re.compile(r'\d{8,12}:[A-Za-z0-9_-]{35,45}')


# --- ЛОГИКА ---

def collect_project_code(root_path):
    output = []
    tree_structure = []
    total_lines = 0  # Счетчик всех строк

    print(f"🚀 Начинаю сборку проекта из: {os.path.abspath(root_path)}")

    for dirpath, dirnames, filenames in os.walk(root_path):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]

        for filename in filenames:
            if filename in IGNORE_FILES:
                continue

            _, ext = os.path.splitext(filename)
            if ext in ALLOWED_EXTENSIONS or filename in ALLOWED_EXTENSIONS:
                file_full_path = os.path.join(dirpath, filename)
                relative_path = os.path.relpath(file_full_path, root_path)

                try:
                    with open(file_full_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                        # 1. Считаем количество строк до замены
                        file_lines_count = content.count('\n') + (1 if content else 0)
                        total_lines += file_lines_count

                        # 2. Маскируем токен (Заменяем найденный токен на заглушку)
                        sanitized_content = BOT_TOKEN_PATTERN.sub("TOKEN_REDACTED", content)

                        # Формирование блока текста для файла
                        file_block = (
                            f"\n{'=' * 20}\n"
                            f"FILE START: {relative_path} | Lines: {file_lines_count}\n"
                            f"{'=' * 20}\n"
                            f"{sanitized_content}\n"
                            f"{'=' * 20}\n"
                            f"FILE END: {relative_path}\n"
                            f"{'=' * 20}\n"
                        )
                        output.append(file_block)
                        tree_structure.append(relative_path)
                        print(f"✅ Добавлен: {relative_path} ({file_lines_count} строк)")

                except Exception as e:
                    print(f"❌ Ошибка чтения {relative_path}: {e}")

    # Собираем итоговый текст
    full_text = "\n".join(output)

    if not full_text:
        print("⚠️ Не найдено подходящих файлов.")
        return

    # Копируем в буфер обмена
    try:
        pyperclip.copy(full_text)
        print(f"\n" + "=" * 30)
        print(f"🎉 Готово! Проект скопирован в буфер обмена.")
        print(f"📄 Всего файлов: {len(tree_structure)}")
        print(f"🔢 Всего строк кода: {total_lines}")
        print(f"📏 Общий размер: {len(full_text)} символов.")
        print(f"🔒 Все токены Telegram были автоматически скрыты.")
        print("=" * 30)
    except Exception as e:
        print(f"❌ Ошибка копирования в буфер: {e}")


if __name__ == "__main__":
    collect_project_code(PROJECT_PATH)