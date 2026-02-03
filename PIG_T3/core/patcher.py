import os
import json
import re


def clean_json_text(text):
    """
    Пытается очистить текст от Markdown оберток ```json ... ``` и найти валидный JSON список.
    """
    text = text.strip()

    # Поиск блока JSON внутри Markdown
    json_match = re.search(r'```(?:json)?\s*(\[.*\])\s*```', text, re.DOTALL)
    if json_match:
        return json_match.group(1)

    # Если просто массив начинается с [ и заканчивается ]
    list_match = re.search(r'(\[\s*{.*}\s*\])', text, re.DOTALL)
    if list_match:
        return list_match.group(1)

    return text


def apply_llm_changes(llm_response: str, root_folder: str = "."):
    """
    Применяет изменения на основе JSON-ответа от LLM.
    Поддерживает действия: create, delete, edit.
    """
    changes_log = []

    try:
        clean_json = clean_json_text(llm_response)
        actions = json.loads(clean_json)
    except json.JSONDecodeError as e:
        return f"❌ Ошибка парсинга JSON: {str(e)}\nУбедитесь, что LLM вернула корректный JSON список."
    except Exception as e:
        return f"❌ Критическая ошибка обработки: {str(e)}"

    if not isinstance(actions, list):
        return "❌ JSON должен быть списком объектов (операций)."

    success_count = 0

    for action in actions:
        action_type = action.get('action')
        rel_path = action.get('path')

        if not action_type or not rel_path:
            changes_log.append("⚠️ Пропущен action или path в блоке.")
            continue

        # Нормализация пути
        abs_path = os.path.join(root_folder, rel_path)

        # --- CREATE ---
        if action_type == 'create':
            content = action.get('content')
            if content is None:
                changes_log.append(f"⚠️ Create: нет контента для {rel_path}")
                continue
            try:
                os.makedirs(os.path.dirname(abs_path), exist_ok=True)
                with open(abs_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                changes_log.append(f"✅ CREATE: {rel_path}")
                success_count += 1
            except Exception as e:
                changes_log.append(f"❌ Create Error {rel_path}: {e}")

        # --- DELETE ---
        elif action_type == 'delete':
            if os.path.exists(abs_path):
                try:
                    os.remove(abs_path)
                    changes_log.append(f"🗑️ DELETE: {rel_path}")
                    success_count += 1
                except Exception as e:
                    changes_log.append(f"❌ Delete Error {rel_path}: {e}")
            else:
                changes_log.append(f"⚠️ Delete: файл не найден {rel_path}")

        # --- EDIT ---
        elif action_type == 'edit':
            if not os.path.exists(abs_path):
                changes_log.append(f"❌ Edit: файл не найден {rel_path}")
                continue

            operations = action.get('operations', [])
            if not operations:
                changes_log.append(f"⚠️ Edit: нет операций для {rel_path}")
                continue

            try:
                try:
                    with open(abs_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                except UnicodeDecodeError:
                    # Если файл в UTF-16 (например, вывод PowerShell/Windows), пробуем эту кодировку
                    with open(abs_path, 'r', encoding='utf-16', errors='replace') as f:
                        lines = f.readlines()

                file_changed = False

                # Сортируем операции замены строк с конца, чтобы не сбить индексы
                # Сортируем операции замены строк и вставки с конца, чтобы не сбить индексы
                # Группируем операции, завязанные на номера строк
                line_ops = [op for op in operations if op.get('type') in ('replace_lines', 'insert_after_line')]
                
                def get_op_line(op):
                    if op.get('type') == 'replace_lines':
                        return op.get('start', 0)
                    return op.get('line', 0)

                line_ops.sort(key=get_op_line, reverse=True)

                text_ops = [op for op in operations if op.get('type') == 'replace_text']

                # 1. Сначала применяем замены/вставки по номерам строк (с конца)
                for op in line_ops:
                    op_type = op.get('type')
                    new_content = op.get('content', "")
                    if new_content is None: new_content = ""
                    
                    # Подготовка контента (добавление переноса строки если нет)
                    new_lines_list = new_content.splitlines(keepends=True)
                    if new_lines_list and not new_lines_list[-1].endswith(('\n', '\r')):
                        new_lines_list[-1] += '\n'

                    # --- LOGIC: REPLACE LINES ---
                    if op_type == 'replace_lines':
                        start = op.get('start')
                        end = op.get('end')
                        if start is None or end is None: continue

                        # Convert 1-based to 0-based
                        idx_start = max(0, start - 1)
                        idx_end = min(len(lines), end)

                        if idx_start > len(lines):
                            changes_log.append(f"⚠️ Line Error {rel_path}: строки {start}-{end} вне диапазона.")
                            continue

                        # --- Anti-Duplication Logic ---
                        # Удаляем дубликат сверху
                        if idx_start > 0 and new_lines_list:
                            if lines[idx_start - 1].rstrip('\r\n') == new_lines_list[0].rstrip('\r\n'):
                                new_lines_list.pop(0)
                        # Удаляем дубликат снизу
                        if idx_end < len(lines) and new_lines_list:
                            if lines[idx_end].rstrip('\r\n') == new_lines_list[-1].rstrip('\r\n'):
                                new_lines_list.pop(-1)
                        # ------------------------------

                        lines[idx_start:idx_end] = new_lines_list
                        file_changed = True
                        changes_log.append(f"✏️ Line Patch {rel_path}: строки {start}-{end}")
                    
                    # --- LOGIC: INSERT AFTER LINE ---
                    elif op_type == 'insert_after_line':
                        line_idx = op.get('line')
                        if line_idx is None: continue
                        
                        # Индекс списка (0-based) = Номер строки (1-based)
                        # Пример: Вставить после строки 1. Список индексы: 0. insert(1, ...) вставит после 0.
                        insert_at = max(0, line_idx)
                        if insert_at > len(lines):
                             insert_at = len(lines)

                        lines[insert_at:insert_at] = new_lines_list
                        file_changed = True
                        changes_log.append(f"➕ Insert {rel_path}: после строки {line_idx}")
                # 2. Теперь применяем текстовые замены (по полному содержимому)
                if text_ops:
                    full_text = "".join(lines)
                    for op in text_ops:
                        find_str = op.get('find')
                        replace_str = op.get('replace')
                        if find_str and replace_str is not None:
                            if find_str in full_text:
                                full_text = full_text.replace(find_str, replace_str)
                                file_changed = True
                                changes_log.append(f"✏️ Text Patch {rel_path}: замена фрагмента")
                            else:
                                changes_log.append(f"⚠️ Text Patch {rel_path}: фрагмент не найден")
                    lines = full_text.splitlines(keepends=True)

                if file_changed:
                    with open(abs_path, 'w', encoding='utf-8') as f:
                        f.writelines(lines)
                    success_count += 1
                else:
                    changes_log.append(f"ℹ️ Edit {rel_path}: изменений не было.")

            except Exception as e:
                changes_log.append(f"❌ Edit Error {rel_path}: {e}")

    return "\n".join(changes_log) if changes_log else "⚠️ Нет действий для выполнения."