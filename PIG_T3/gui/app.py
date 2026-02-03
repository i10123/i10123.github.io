import tkinter as tk
from tkinter import filedialog, messagebox, ttk, scrolledtext
import threading
import os
import json

from config import ConfigManager
from core.analyzer import ProjectAnalyzer
from core.patcher import apply_llm_changes, clean_json_text
from utils.clipboard import copy_file_to_clipboard_windows
from core.ollama_client import OllamaClient, get_installed_models
from gui.tabs.quality_tab import QualityTab
from core.ollama_client import OllamaClient, get_installed_models


class DarkApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("AI Context Generator & Patcher (JSON Edition)")
        self.geometry("900x950")  # Increased size for TreeView
        self.configure(bg="#2b2b2b")
        self.config_manager = ConfigManager()
        self.settings = self.config_manager.load()
        self.analyzer = ProjectAnalyzer()
        self.setup_styles()
        self.setup_global_bindings()
        self.create_widgets()
        self._debounce_timer = None
        self._last_applied_content = None

    def setup_styles(self):
        style = ttk.Style(self)
        style.theme_use('clam')
        bg_color = "#2b2b2b"
        fg_color = "#ffffff"
        entry_bg = "#3c3f41"
        btn_bg = "#365880"
        btn_active = "#4b7aa6"
        style.configure("TLabel", background=bg_color, foreground=fg_color, font=("Segoe UI", 10))
        style.configure("TButton", background=btn_bg, foreground=fg_color, borderwidth=0, font=("Segoe UI", 10, "bold"))
        style.map("TButton", background=[('active', btn_active)])
        style.configure("TCheckbutton", background=bg_color, foreground=fg_color, font=("Segoe UI", 10))
        style.map("TCheckbutton", background=[('active', bg_color)], indicatorcolor=[('selected', '#4CAF50')])
        style.configure("TEntry", fieldbackground=entry_bg, foreground=fg_color, insertcolor="white", borderwidth=0)
        style.configure("Horizontal.TProgressbar", background="#4CAF50", troughcolor="#3c3f41", bordercolor="#2b2b2b",
                        lightcolor="#4CAF50", darkcolor="#4CAF50")
        style.configure("TNotebook", background="#2b2b2b", borderwidth=0)
        style.configure("TNotebook.Tab", background="#3c3f41", foreground="#a9b7c6", padding=[15, 5],
                        font=("Segoe UI", 10))
        style.map("TNotebook.Tab", background=[("selected", "#365880")], foreground=[("selected", "white")])

    def setup_global_bindings(self):
        def select_all(event):
            widget = event.widget
            if isinstance(widget, tk.Entry):
                widget.select_range(0, 'end')
                widget.icursor('end')
            elif isinstance(widget, tk.Text) or isinstance(widget, scrolledtext.ScrolledText):
                widget.tag_add("sel", "1.0", "end")
            return "break"

        self.bind_class("Entry", "<Control-a>", select_all)
        self.bind_class("Text", "<Control-a>", select_all)
        self.bind_class("Entry", "<Control-f>", select_all)

    def create_widgets(self):
        self.path_var = tk.StringVar(value=self.settings["root_folder"])
        self.notebook = ttk.Notebook(self)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        self.tab_gen = tk.Frame(self.notebook, bg="#2b2b2b")
        self.notebook.add(self.tab_gen, text="🏠 Генератор")
        self.tab_help = tk.Frame(self.notebook, bg="#2b2b2b")
        self.notebook.add(self.tab_help, text="🎓 Инфо / JSON Specs")
        self.tab_editor = tk.Frame(self.notebook, bg="#2b2b2b")
        self.notebook.add(self.tab_editor, text="✏️ Редактор (JSON Patcher)")
        
        self.tab_quality = QualityTab(self.notebook, self.path_var)
        self.notebook.add(self.tab_quality, text="📊 Анализ кода")

        self.create_generator_tab(self.tab_gen)
        self.create_help_tab(self.tab_help)
        self.create_editor_tab(self.tab_editor)

    def create_generator_tab(self, parent):
        main_frame = tk.Frame(parent, bg="#2b2b2b", padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Row 1: Path
        tk.Label(main_frame, text="Папка проекта:", bg="#2b2b2b", fg="#a9b7c6", font=("Segoe UI", 10, "bold")).pack(anchor="w")
        path_frame = tk.Frame(main_frame, bg="#2b2b2b")
        path_frame.pack(fill=tk.X, pady=(5, 10))
        path_entry = tk.Entry(path_frame, textvariable=self.path_var, bg="#3c3f41", fg="white", insertbackground="white", relief="flat")
        path_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=4, padx=(0, 10))
        tk.Button(path_frame, text="Обзор...", command=self.browse_folder, bg="#4a4a4a", fg="white", relief="flat", padx=10).pack(side=tk.RIGHT)

        # Row 2: Extensions & Output
        grid_frame = tk.Frame(main_frame, bg="#2b2b2b")
        grid_frame.pack(fill=tk.X, pady=5)

        tk.Label(grid_frame, text="Расширения:", bg="#2b2b2b", fg="#a9b7c6", font=("Segoe UI", 9)).grid(row=0, column=0, sticky="w")
        self.ext_var = tk.StringVar(value=self.settings["extensions"])
        tk.Entry(grid_frame, textvariable=self.ext_var, bg="#3c3f41", fg="white", relief="flat").grid(row=1, column=0, sticky="ew", padx=(0, 10), ipady=3)

        tk.Label(grid_frame, text="Имя отчета:", bg="#2b2b2b", fg="#a9b7c6", font=("Segoe UI", 9)).grid(row=0, column=1, sticky="w")
        self.out_var = tk.StringVar(value=self.settings["output_name"])
        tk.Entry(grid_frame, textvariable=self.out_var, bg="#3c3f41", fg="white", relief="flat").grid(row=1, column=1, sticky="ew", ipady=3)
        grid_frame.columnconfigure(0, weight=1)
        grid_frame.columnconfigure(1, weight=1)

        # Row 3: Ignore
        tk.Label(main_frame, text="Исключить (Ignore):", bg="#2b2b2b", fg="#a9b7c6", font=("Segoe UI", 10, "bold")).pack(anchor="w", pady=(10, 0))
        self.ignore_var = tk.StringVar(value=self.settings["ignore_list"])
        tk.Entry(main_frame, textvariable=self.ignore_var, bg="#3c3f41", fg="white", relief="flat").pack(fill=tk.X, pady=(5, 10), ipady=4)

        # Options
        options_frame = tk.LabelFrame(main_frame, text="Опции генерации", bg="#2b2b2b", fg="#a9b7c6", font=("Segoe UI", 9), relief="flat", labelanchor="n")
        options_frame.pack(fill=tk.X, pady=(0, 15), ipady=5)

        self.use_md_var = tk.BooleanVar(value=self.settings.get("use_markdown", False))
        ttk.Checkbutton(options_frame, text="Markdown формат (.md)", variable=self.use_md_var, style="TCheckbutton", command=self.toggle_format_hint).pack(anchor="w", padx=10)

        self.add_edit_prompt_var = tk.BooleanVar(value=self.settings.get("add_edit_prompt", False))
        ttk.Checkbutton(options_frame, text="Добавить инструкцию для AI (JSON Format)", variable=self.add_edit_prompt_var, style="TCheckbutton").pack(anchor="w", padx=10)

        self.line_numbers_var = tk.BooleanVar(value=self.settings.get("line_numbers", False))
        ttk.Checkbutton(options_frame, text="Нумеровать строки (для точного редактирования)", variable=self.line_numbers_var, style="TCheckbutton").pack(anchor="w", padx=10)

        self.auto_copy_var = tk.BooleanVar(value=self.settings.get("auto_copy_file", False))
        ttk.Checkbutton(options_frame, text="Авто-копировать ФАЙЛ в буфер (для вставки в чат)", variable=self.auto_copy_var, style="TCheckbutton").pack(anchor="w", padx=10)

        # Row 4: Project Tree Preview
        tree_container = tk.LabelFrame(main_frame, text="Структура проекта (выберите файлы для отчёта)", bg="#2b2b2b", fg="#a9b7c6", font=("Segoe UI", 9))
        tree_container.pack(fill=tk.BOTH, expand=True, pady=(0, 15))

        # Treeview
        self.tree_scroll = ttk.Scrollbar(tree_container)
        self.tree_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.tree = ttk.Treeview(tree_container, selectmode="none", yscrollcommand=self.tree_scroll.set)
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.tree_scroll.config(command=self.tree.yview)
        
        # Configure Tree
        self.tree.heading("#0", text="Проект", anchor="w")
        self.tree.column("#0", width=400)
        self.tree.bind("<Button-1>", self.on_tree_click)
        
        # State storage for tree items: item_id -> True/False
        self.tree_checked_state = {}
        # Mapping: item_id -> full_path
        self.tree_path_map = {}

        # Run
        self.btn_run = tk.Button(main_frame, text="ГЕНЕРИРОВАТЬ КОНТЕКСТ", command=self.start_processing, bg="#365880", fg="white", font=("Segoe UI", 11, "bold",), relief="flat", pady=8, cursor="hand2")
        self.btn_run.pack(fill=tk.X, pady=(0, 10))

        self.progress = ttk.Progressbar(main_frame, orient="horizontal", length=100, mode="determinate", style="Horizontal.TProgressbar")
        self.status_var = tk.StringVar(value="Готов к работе")
        tk.Label(main_frame, textvariable=self.status_var, bg="#2b2b2b", fg="#808080", font=("Segoe UI", 9)).pack(side=tk.BOTTOM, pady=5)

        self.toggle_format_hint()
        # Bindings for auto-update
        self.path_var.trace_add("write", self.on_param_change)
        self.ext_var.trace_add("write", self.on_param_change)
        self.ignore_var.trace_add("write", self.on_param_change)
        # Force initial tree population
        self.refresh_preview_tree()

    def create_help_tab(self, parent):
        # Используем PanedWindow для разделения меню и контента
        paned = tk.PanedWindow(parent, orient=tk.HORIZONTAL, sashwidth=4, bg="#2b2b2b")
        paned.pack(fill=tk.BOTH, expand=True)

        # --- Левая панель (Меню) ---
        nav_frame = tk.Frame(paned, bg="#2b2b2b", width=220)
        nav_frame.pack_propagate(False)  # Фиксируем ширину
        paned.add(nav_frame)

        tk.Label(nav_frame, text="СПРАВОЧНИК", bg="#2b2b2b", fg="#61afef", font=("Segoe UI", 12, "bold"), pady=10).pack(fill=tk.X)

        # Стиль кнопок меню
        def create_nav_btn(text, cmd):
            btn = tk.Button(nav_frame, text=text, command=cmd, bg="#3c3f41", fg="#a9b7c6",
                            activebackground="#4b7aa6", activeforeground="white",
                            relief="flat", font=("Segoe UI", 10), anchor="w", padx=10)
            btn.pack(fill=tk.X, pady=2, padx=5)
            return btn

        create_nav_btn("🔰 БАЗОВАЯ ИНФО", lambda: self.show_help_content("basic"))

        tk.Label(nav_frame, text="ПРОДВИНУТОЕ", bg="#2b2b2b", fg="#5c6370", font=("Segoe UI", 9, "bold"), pady=5).pack(fill=tk.X, pady=(10, 0))
        
        create_nav_btn("🔧 Механика вкладок", lambda: self.show_help_content("mechanics"))
        create_nav_btn("🧬 JSON Структура", lambda: self.show_help_content("json"))
        create_nav_btn("📊 Расшифровка метрик", lambda: self.show_help_content("metrics"))
        create_nav_btn("🤖 Ollama и Авто-фикс", lambda: self.show_help_content("ollama"))

        # --- Правая панель (Контент) ---
        content_frame = tk.Frame(paned, bg="#2b2b2b")
        paned.add(content_frame)

        self.help_text = scrolledtext.ScrolledText(content_frame, wrap=tk.WORD, bg="#282c34", fg="#abb2bf",
                                                   font=("Consolas", 11), relief="flat", padx=20, pady=20)
        self.help_text.pack(fill=tk.BOTH, expand=True)

        # Настройка тегов для красоты
        self.help_text.tag_config("h1", font=("Segoe UI", 18, "bold"), foreground="#61afef", spacing3=15)
        self.help_text.tag_config("h2", font=("Segoe UI", 14, "bold"), foreground="#98c379", spacing1=10, spacing3=5)
        self.help_text.tag_config("code", font=("Consolas", 10), background="#3e4451", foreground="#56b6c2")
        self.help_text.tag_config("warn", foreground="#e5c07b")
        self.help_text.tag_config("crit", foreground="#e06c75", font=("Segoe UI", 10, "bold"))
        self.help_text.tag_config("success", foreground="#98c379")
        self.help_text.tag_config("bold", font=("Segoe UI", 11, "bold"))

        # Загружаем базовый контент при старте
        self.show_help_content("basic")

    def show_help_content(self, section):
        self.help_text.config(state='normal')
        self.help_text.delete("1.0", tk.END)

        text_map = {
            "basic": self._get_text_basic,
            "mechanics": self._get_text_mechanics,
            "json": self._get_text_json,
            "metrics": self._get_text_metrics,
            "ollama": self._get_text_ollama
        }

        content_func = text_map.get(section, self._get_text_basic)
        content_func()

        self.help_text.config(state='disabled')

    # --- TEXT GENERATORS ---

    def _get_text_basic(self):
        self._insert_header("🔰 БАЗОВАЯ ИНСТРУКЦИЯ")
        
        self.help_text.insert(tk.END, "1. Вкладка 'Генератор'\n", "h2")
        self.help_text.insert(tk.END, "Эта вкладка создает 'контекст' — единый файл со всем кодом вашего проекта.\n\n")
        self.help_text.insert(tk.END, "• Выберите папку проекта.\n• Нажмите 'ГЕНЕРИРОВАТЬ'.\n• Полученный файл (.txt или .md) отправьте в чат с AI (ChatGPT, Claude, DeepSeek).\n")
        self.help_text.insert(tk.END, "💡 Совет: Включите 'Нумеровать строки' и 'Инструкцию для AI' для лучших результатов редактирования.\n")

        self.help_text.insert(tk.END, "\n2. Вкладка 'Редактор'\n", "h2")
        self.help_text.insert(tk.END, "Сюда вставляется ответ от нейросети в формате JSON для автоматического применения изменений.\n\n")
        self.help_text.insert(tk.END, "• Скопируйте JSON-код из ответа AI.\n• Вставьте в поле редактора.\n• Нажмите 'Проверить' -> 'Применить'.\n")

        self.help_text.insert(tk.END, "\n3. Вкладка 'Анализ кода'\n", "h2")
        self.help_text.insert(tk.END, "Локальный аудит качества без отправки кода в сеть.\n\n")
        self.help_text.insert(tk.END, "• Нажмите 'Запустить анализ'.\n• Смотрите таблицу метрик и детали найденных проблем.")

    def _get_text_mechanics(self):
        self._insert_header("🔧 КАК ЭТО РАБОТАЕТ (ПОД КАПОТОМ)")
        
        self.help_text.insert(tk.END, "Генератор контекста (Analyzer)\n", "h2")
        self.help_text.insert(tk.END, "Скрипт обходит дерево файлов, игнорируя папки из списка 'Ignore'.\n")
        self.help_text.insert(tk.END, "Он собирает весь код в один текстовый файл, добавляя XML-теги <file path='...'>.\n")
        self.help_text.insert(tk.END, "Это позволяет AI четко понимать, где начинается и заканчивается каждый файл.")

        self.help_text.insert(tk.END, "\n\nПатчер (Patcher)\n", "h2")
        self.help_text.insert(tk.END, "1. Разбирает входящий JSON.\n2. Для 'edit' операций сортирует изменения снизу вверх (чтобы не сбить номера строк).\n3. Безопасно перезаписывает файлы.\n")

        self.help_text.insert(tk.END, "\nАнализатор качества (Scanner)\n", "h2")
        self.help_text.insert(tk.END, "Запускает 4 утилиты как подпроцессы:\n")
        self.help_text.insert(tk.END, "• Radon CC (Сложность)\n• Radon MI (Поддерживаемость)\n• Pylint (Стиль/Ошибки)\n• Bandit (Безопасность)\n\n")
        self.help_text.insert(tk.END, "Результаты парсятся из JSON-вывода этих утилит и сводятся в единую таблицу.")

    def _get_text_json(self):
        self._insert_header("🧬 СТРУКТУРА JSON ДЛЯ РЕДАКТИРОВАНИЯ")
        self.help_text.insert(tk.END, "Чтобы изменить код, AI должен вернуть ответ строго в таком формате:\n\n")
        
        json_ex = """
[
  {
    "action": "create",
    "path": "utils/helper.py",
    "content": "def help():\n    pass"
  },
  {
    "action": "delete",
    "path": "old_file.py"
  },
  {
    "action": "edit",
    "path": "main.py",
    "operations": [
       {
         "type": "replace_lines",
         "start": 10, "end": 12,
         "content": "    new_code()\n    fixed_line()"
       },
       {
         "type": "insert_after_line",
         "line": 15,
         "content": "    print('Debug info')"
       },
       {
         "type": "replace_text",
         "find": "old_string",
         "replace": "new_string"
       }
    ]
  }
]
"""
        self.help_text.insert(tk.END, json_ex, "code")
        self.help_text.insert(tk.END, "\n\n⚠️ ВАЖНО: При replace_lines не включайте контекст (соседние неизменные строки), иначе они продублируются. Для вставки нового блока лучше использовать insert_after_line.", "crit")

    def _get_text_metrics(self):
        self._insert_header("📊 ПОДРОБНАЯ РАСШИФРОВКА МЕТРИК")
        
        self.help_text.insert(tk.END, "1. Cyclomatic Complexity (CC) — Цикломатическая сложность\n", "h2")
        self.help_text.insert(tk.END, "Мера запутанности логики (количество развилок if/for/while).\n")
        self.help_text.insert(tk.END, "• 1-10: ", "bold"); self.help_text.insert(tk.END, "Простой код (🟢)\n", "success")
        self.help_text.insert(tk.END, "• 11-20: ", "bold"); self.help_text.insert(tk.END, "Умеренная сложность (⚠️)\n", "warn")
        self.help_text.insert(tk.END, "• 21+: ", "bold"); self.help_text.insert(tk.END, "Сложный код, риск багов (🔴)\n", "crit")

        self.help_text.insert(tk.END, "\n2. Maintainability Index (MI) — Индекс поддерживаемости\n", "h2")
        self.help_text.insert(tk.END, "Оценка (0-100), насколько легко читать и менять код.\n")
        self.help_text.insert(tk.END, "• > 20: ", "bold"); self.help_text.insert(tk.END, "Высокая (🟢)\n", "success")
        self.help_text.insert(tk.END, "• 10-20: ", "bold"); self.help_text.insert(tk.END, "Средняя (⚠️)\n", "warn")
        self.help_text.insert(tk.END, "• < 10: ", "bold"); self.help_text.insert(tk.END, "Низкая, спагетти-код (🔴)\n", "crit")

        self.help_text.insert(tk.END, "\n3. Linter Score (Pylint) — Оценка качества\n", "h2")
        self.help_text.insert(tk.END, "Строгая оценка 'учителя' по 10-балльной шкале (PEP8, ошибки, стиль).\n")
        self.help_text.insert(tk.END, "• > 8.0: ", "bold"); self.help_text.insert(tk.END, "Отлично (🟢)\n", "success")
        self.help_text.insert(tk.END, "• 5.0-8.0: ", "bold"); self.help_text.insert(tk.END, "Есть замечания (⚠️)\n", "warn")
        self.help_text.insert(tk.END, "• < 5.0: ", "bold"); self.help_text.insert(tk.END, "Плохо (🔴)\n", "crit")

        self.help_text.insert(tk.END, "\n4. Security Issues (Bandit) — Безопасность\n", "h2")
        self.help_text.insert(tk.END, "Поиск уязвимостей: зашитые пароли, injection, unsafe functions.\n")
        self.help_text.insert(tk.END, "• 0 проблем: ", "bold"); self.help_text.insert(tk.END, "Чисто (🟢)\n", "success")
        self.help_text.insert(tk.END, "• > 0: ", "bold"); self.help_text.insert(tk.END, "Найдены уязвимости! (🔴)\n", "crit")

    def _get_text_ollama(self):
        self._insert_header("🤖 OLLAMA И AUTO-FIX")
        self.help_text.insert(tk.END, "Приложение умеет использовать локальные нейросети через Ollama.\n\n", "bold")
        self.help_text.insert(tk.END, "Зачем это нужно?\n", "h2")
        self.help_text.insert(tk.END, "Если вы вставили JSON с ошибкой (например, лишняя запятая), приложение может попросить локальную модель исправить синтаксис, не отправляя данные в интернет.\n\n")
        self.help_text.insert(tk.END, "Как настроить:\n", "h2")
        self.help_text.insert(tk.END, "1. Установите Ollama (ollama.com).\n")
        self.help_text.insert(tk.END, "2. Скачайте модель: `ollama pull qwen2.5-coder` (или любую другую).\n")
        self.help_text.insert(tk.END, "3. Перезапустите приложение — модель появится в списке во вкладке 'Редактор'.")

    def _insert_header(self, text):
        self.help_text.insert(tk.END, text + "\n", "h1")
        self.help_text.insert(tk.END, "=" * 60 + "\n\n", "dim")

    def create_editor_tab(self, parent):
        main_frame = tk.Frame(parent, bg="#2b2b2b", padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Папка
        top_frame = tk.Frame(main_frame, bg="#2b2b2b")
        top_frame.pack(fill=tk.X, pady=(0, 10))
        tk.Label(top_frame, text="Целевая папка:", bg="#2b2b2b", fg="#a9b7c6").pack(side=tk.LEFT)
        tk.Entry(top_frame, textvariable=self.path_var, bg="#3c3f41", fg="gray", relief="flat", width=40).pack(side=tk.LEFT, padx=10)

        tk.Label(main_frame, text="Вставьте JSON ответ от AI (можно с ```json):", bg="#2b2b2b", fg="#a9b7c6", font=("Segoe UI", 10, "bold")).pack(anchor="w")

        self.editor_text = scrolledtext.ScrolledText(main_frame, wrap=tk.WORD, height=20, bg="#3c3f41", fg="#a9b7c6",
                                                     font=("Consolas", 10), insertbackground="white", relief="flat")
        self.editor_text.pack(fill=tk.BOTH, expand=True, pady=(5, 10))

        # --- Настройки Ollama (Collapsible or just frame) ---
        self.create_ollama_settings(main_frame)

        # Buttons
        btn_frame = tk.Frame(main_frame, bg="#2b2b2b")
        btn_frame.pack(fill=tk.X)

        tk.Button(btn_frame, text="📋 Вставить", command=self.paste_from_clipboard,
                  bg="#4a4a4a", fg="white", relief="flat", padx=15, pady=5).pack(side=tk.LEFT, padx=(0, 10))

        tk.Button(btn_frame, text="🔍 Проверить / Форматировать JSON", command=self.validate_json_ui,
                  bg="#4a4a4a", fg="white", relief="flat", padx=15, pady=5).pack(side=tk.LEFT, padx=(0, 10))

        self.btn_apply = tk.Button(btn_frame, text="ПРИМЕНИТЬ ИЗМЕНЕНИЯ", command=self.apply_changes,
                                   bg="#365880", fg="white", font=("Segoe UI", 10, "bold"), relief="flat", pady=5)
        self.btn_apply.pack(side=tk.LEFT, fill=tk.X, expand=True)

        self.editor_status_var = tk.StringVar(value="")
        tk.Label(main_frame, textvariable=self.editor_status_var, bg="#2b2b2b", fg="#e5c07b", font=("Consolas", 9)).pack(side=tk.BOTTOM, pady=5)

    def create_ollama_settings(self, parent):
        frame = tk.LabelFrame(parent, text="🛠️ Ollama Auto-Fix (Локальная LLM)", bg="#2b2b2b", fg="#a9b7c6", font=("Segoe UI", 9), padx=10, pady=5)
        frame.pack(fill=tk.X, pady=(0, 10))

        # Model Selection
        row1 = tk.Frame(frame, bg="#2b2b2b")
        row1.pack(fill=tk.X, pady=2)
        tk.Label(row1, text="Модель:", bg="#2b2b2b", fg="#a9b7c6", width=10, anchor="w").pack(side=tk.LEFT)
        
        current_model = self.settings.get("ollama_model", "None")
        models = ["None"] + get_installed_models()
        
        self.ollama_model_var = tk.StringVar(value=current_model)
        self.combo_models = ttk.Combobox(row1, textvariable=self.ollama_model_var, values=models, state="readonly")
        self.combo_models.pack(side=tk.LEFT, fill=tk.X, expand=True)

        # Options
        row2 = tk.Frame(frame, bg="#2b2b2b")
        row2.pack(fill=tk.X, pady=5)
        
        def mk_entry(p, label, key, default):
            tk.Label(p, text=label, bg="#2b2b2b", fg="#a9b7c6", font=("Segoe UI", 8)).pack(side=tk.LEFT, padx=(5, 2))
            var = tk.StringVar(value=str(self.settings.get("ollama_options", {}).get(key, default)))
            e = tk.Entry(p, textvariable=var, bg="#3c3f41", fg="white", width=8, relief="flat", font=("Consolas", 9))
            e.pack(side=tk.LEFT)
            return var

        self.opt_ctx = mk_entry(row2, "Ctx:", "num_ctx", 24000)
        self.opt_pred = mk_entry(row2, "Predict:", "num_predict", 12000)
        self.opt_temp = mk_entry(row2, "Temp:", "temperature", 0.5)
        self.opt_topp = mk_entry(row2, "TopP:", "top_p", 0.95)
        self.opt_topk = mk_entry(row2, "TopK:", "top_k", 100)
    def paste_from_clipboard(self):
        try:
            content = self.clipboard_get()
            self.editor_text.delete("1.0", tk.END)
            self.editor_text.insert("1.0", content)
            self.editor_status_var.set("📋 Вставлено из буфера обмена")
        except Exception:
            self.editor_status_var.set("⚠️ Ошибка: буфер обмена пуст или не содержит текста")
    def validate_json_ui(self):
        """Пытается распарсить JSON, форматирует его красиво или показывает ошибку."""
        raw_text = self.editor_text.get("1.0", tk.END).strip()
        if not raw_text:
            self.editor_status_var.set("Пустое поле.")
            return False

        # Пытаемся вытащить JSON из markdown
        cleaned = clean_json_text(raw_text)

        try:
            data = json.loads(cleaned)
            if not isinstance(data, list):
                raise ValueError("JSON должен быть списком (root array).")

            # Pretty print back to editor
            pretty_json = json.dumps(data, indent=2, ensure_ascii=False)
            self.editor_text.delete("1.0", tk.END)
            self.editor_text.insert("1.0", pretty_json)

            count = len(data)
            self.editor_status_var.set(f"✅ Валидный JSON. Найдено операций: {count}")
            return True
        except Exception as e:
            self.editor_status_var.set(f"❌ Ошибка JSON: {e}")
            
            # --- Auto Fix Logic ---
            model = self.ollama_model_var.get()
            if model and model != "None":
                self.run_ollama_fix(raw_text, model)
                return False
            # ----------------------

            messagebox.showerror("Ошибка валидации", f"Некорректный JSON:\n{e}")
            return False

    def apply_changes(self):
        # Сначала валидируем
        if not self.validate_json_ui():
            return

        llm_text = self.editor_text.get("1.0", tk.END).strip()

        # Защита от случайного повторного нажатия
        if self._last_applied_content and llm_text == self._last_applied_content:
            if not messagebox.askyesno("Подтверждение", "Эти изменения уже были применены.\nПовторить применение патча?"):
                return

        self._last_applied_content = llm_text
        root_folder = self.path_var.get()

        if not os.path.exists(root_folder):
            messagebox.showerror("Ошибка", "Папка проекта не существует.")
            return

        self.btn_apply.config(state=tk.DISABLED, text="Применение...", bg="#555555")

        def _apply():
            try:
                log = apply_llm_changes(llm_text, root_folder)
                self.after(0, lambda: self._on_apply_complete(log))
            except Exception as e:
                self.after(0, lambda: self._on_apply_error(str(e)))

        threading.Thread(target=_apply).start()

    def _on_apply_complete(self, log):
        self.btn_apply.config(state=tk.NORMAL, text="ПРИМЕНИТЬ ИЗМЕНЕНИЯ", bg="#365880")

        # Создаем окно с результатом
        top = tk.Toplevel(self)
        top.title("Результат патча")
        top.geometry("600x400")
        top.configure(bg="#2b2b2b")

        st = scrolledtext.ScrolledText(top, bg="#3c3f41", fg="white", font=("Consolas", 10), relief="flat")
        st.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        st.insert(tk.END, log)
        st.configure(state='disabled')

    def _on_apply_error(self, error_msg):
        self.btn_apply.config(state=tk.NORMAL, text="ПРИМЕНИТЬ ИЗМЕНЕНИЯ", bg="#365880")
        messagebox.showerror("Критическая ошибка", error_msg)

    def toggle_format_hint(self):
        if self.use_md_var.get():
            self.btn_run.config(text="ГЕНЕРИРОВАТЬ MARKDOWN")
        else:
            self.btn_run.config(text="ГЕНЕРИРОВАТЬ LLM-OPTIMIZED TXT")



    def on_param_change(self, *args):
        """Debounced refresh of the tree."""
        if self._debounce_timer:
            self.after_cancel(self._debounce_timer)
        self._debounce_timer = self.after(600, self.refresh_preview_tree)
    def _get_tree_state(self):
        """Collects currently expanded paths and unchecked paths (relative)."""
        expanded = set()
        unchecked = set()
        root_path = self.path_var.get()
        
        if not self.tree.get_children():
            return expanded, unchecked

        for item_id, full_path in self.tree_path_map.items():
            # Check expansion
            if self.tree.item(item_id, "open"):
                try:
                    rel = os.path.relpath(full_path, root_path).replace("\\", "/")
                    expanded.add(rel)
                except ValueError:
                    pass
            
            # Check checked state
            if not self.tree_checked_state.get(item_id, True):
                try:
                    rel = os.path.relpath(full_path, root_path).replace("\\", "/")
                    unchecked.add(rel)
                except ValueError:
                    pass
        return expanded, unchecked

    def refresh_preview_tree(self):
        # 1. Capture current state to restore it after refresh
        # If tree is empty (startup), try to load from settings
        if not self.tree_path_map:
            current_expanded = set(self.settings.get("ui_tree_expanded", []))
            current_unchecked = set(self.settings.get("ui_tree_unchecked", []))
        else:
            current_expanded, current_unchecked = self._get_tree_state()

        self.tree.delete(*self.tree.get_children())
        self.tree_checked_state.clear()
        self.tree_path_map.clear()
        
        root_path = self.path_var.get()
        if not os.path.exists(root_path):
            return

        # Use current settings for scanning (without saving yet to avoid recursion loops)
        cfg = self.settings.copy()
        cfg.update({
            "root_folder": root_path,
            "extensions": self.ext_var.get(),
            "ignore_list": self.ignore_var.get(),
            "strict_mode": self.settings.get("strict_mode", False)
        })

        try:
            files, empty_dirs = self.analyzer.scan_directory(cfg)
            files.sort(key=lambda x: x[0])
            
            # Root Node
            root_id = self.tree.insert("", "end", text=f"✅ {root_path}", open=True)
            self.tree_path_map[root_id] = os.path.abspath(root_path)
            self.tree_checked_state[root_id] = True
            
            dir_nodes = {".": root_id}
            
            # Helper to check/uncheck based on saved state
            def set_state(node_id, rel_p, is_dir=False):
                # Default is True (Checked). Only uncheck if explicitly in unchecked list.
                # For directories, we default to True, logic propagates.
                should_be_checked = (rel_p not in current_unchecked)
                self.tree_checked_state[node_id] = should_be_checked
                
                # Restore expansion
                if is_dir and rel_p in current_expanded:
                    self.tree.item(node_id, open=True)
                
                # Update visual text
                txt = self.tree.item(node_id, "text")
                prefix = "✅ " if should_be_checked else "⬜ "
                # Strip existing prefix if logic added it (though we just created it)
                if txt.startswith("✅ ") or txt.startswith("⬜ "):
                    txt = txt[2:]
                self.tree.item(node_id, text=prefix + txt)

            # Process Files
            for full_path, ext in files:
                rel_path = os.path.relpath(full_path, root_path)
                parts = rel_path.split(os.sep)
                
                parent_id = root_id
                current_rel = ""
                
                # Create directories
                for part in parts[:-1]:
                    current_rel = os.path.join(current_rel, part) if current_rel else part
                    rel_slash = current_rel.replace("\\", "/")
                    
                    if current_rel not in dir_nodes:
                        node_id = self.tree.insert(parent_id, "end", text=f"{part}", open=False)
                        dir_nodes[current_rel] = node_id
                        self.tree_path_map[node_id] = os.path.join(root_path, current_rel)
                        set_state(node_id, rel_slash, is_dir=True)
                    parent_id = dir_nodes[current_rel]
                
                # Create file
                fname = parts[-1]
                file_id = self.tree.insert(parent_id, "end", text=f"{fname} ({ext})")
                self.tree_path_map[file_id] = full_path
                set_state(file_id, rel_path.replace("\\", "/"), is_dir=False)
                
        except Exception as e:
            # If scanning fails (e.g. invalid regex in ignore), just ignore or print
            print(f"Tree update error: {e}")
    def on_tree_click(self, event):
        region = self.tree.identify("region", event.x, event.y)
        element = self.tree.identify_element(event.x, event.y)

        # Игнорируем клик по треугольнику раскрытия (пусть работает штатно)
        if "indicator" in element:
            return

        if region == "tree":
            item_id = self.tree.identify_row(event.y)
            if not item_id: return
            current = self.tree_checked_state.get(item_id, True)
            self._toggle_item(item_id, not current)
            # Блокируем стандартную обработку (чтобы клик по тексту не вызывал раскрытия/выделения)
            return "break"

    def _toggle_item(self, item_id, state):
        self.tree_checked_state[item_id] = state
        txt = self.tree.item(item_id, "text")
        clean_txt = txt[2:] if txt.startswith("✅ ") or txt.startswith("⬜ ") else txt
        prefix = "✅ " if state else "⬜ "
        self.tree.item(item_id, text=prefix + clean_txt)
        for child in self.tree.get_children(item_id):
            self._toggle_item(child, state)
    def browse_folder(self):
        folder = filedialog.askdirectory(initialdir=self.path_var.get())
        if folder: self.path_var.set(folder)

    def save_current_settings(self):
        # Get UI state to save
        expanded, unchecked = self._get_tree_state()
        settings_to_save = {
            "root_folder": self.path_var.get(),
            "extensions": self.ext_var.get(),
            "ignore_list": self.ignore_var.get(),
            "output_name": self.out_var.get(),
            "use_markdown": self.use_md_var.get(),
            "add_edit_prompt": self.add_edit_prompt_var.get(),
            "auto_copy_file": self.auto_copy_var.get(),
            "line_numbers": self.line_numbers_var.get(),
            "ollama_model": getattr(self, 'ollama_model_var', tk.StringVar(value="None")).get(),
            "ollama_options": {
                "num_ctx": int(getattr(self, 'opt_ctx', tk.StringVar(value="24000")).get()),
                "num_predict": int(getattr(self, 'opt_pred', tk.StringVar(value="12000")).get()),
                "temperature": float(getattr(self, 'opt_temp', tk.StringVar(value="0.5")).get()),
                "top_p": float(getattr(self, 'opt_topp', tk.StringVar(value="0.95")).get()),
                "top_k": int(getattr(self, 'opt_topk', tk.StringVar(value="100")).get())
            },
            "ui_tree_expanded": list(expanded),
            "ui_tree_unchecked": list(unchecked)
        }

        self.config_manager.save(settings_to_save)
        return settings_to_save

    def start_processing(self):
        settings = self.save_current_settings()
        
        if self.tree.get_children():
            excluded = set()
            for item_id, path in self.tree_path_map.items():
                # Собираем только явно отключенные файлы (Blacklist approach)
                if not self.tree_checked_state.get(item_id, True):
                    if os.path.isfile(path):
                        excluded.add(os.path.normcase(os.path.abspath(path)))
            settings["excluded_paths"] = excluded

        # Добавляем скрытые настройки, которые не меняются в GUI, но нужны анализатору
        settings["strict_mode"] = self.settings.get("strict_mode", False)
        settings["ignore_self"] = True

        self.btn_run.config(state=tk.DISABLED, text="Сканирование...", bg="#555555")
        self.status_var.set("Поиск файлов...")
        self.progress.pack(fill=tk.X, pady=(0, 10))
        self.progress['value'] = 0
        thread = threading.Thread(target=self.run_logic, args=(settings,))
        thread.start()

    def update_progress_safe(self, current, total):
        percent = int((current / total) * 100) if total > 0 else 0
        self.after(0, lambda: self._update_ui_progress(current, total, percent))

    def _update_ui_progress(self, current, total, percent):
        self.progress['maximum'] = total
        self.progress['value'] = current
        self.status_var.set(f"Обработка: {current}/{total} ({percent}%)")

    def run_logic(self, settings):
        try:
            output_path, count, lines = self.analyzer.process(settings, self.update_progress_safe)
            self.after(0, lambda: self.on_success(output_path, count, lines, settings.get("auto_copy_file", False)))
        except Exception as e:
            self.after(0, lambda: self.on_error(str(e)))

    def on_success(self, path, count, lines, auto_copy):
        self.toggle_format_hint()
        self.btn_run.config(state=tk.NORMAL, bg="#365880")
        self.status_var.set(f"Готово! Файлов: {count}, Строк: {lines}")
        self.progress.pack_forget()

        msg = f"Отчет создан:\n{path}\n\nФайлов: {count}\nСтрок кода: {lines}"
        if auto_copy:
            if copy_file_to_clipboard_windows(path):
                msg += "\n\n📋 ФАЙЛ СКОПИРОВАН В БУФЕР!"
            else:
                msg += "\n\n⚠️ Ошибка копирования в буфер."
        messagebox.showinfo("Успех", msg)

    def on_error(self, error_msg):
        self.toggle_format_hint()
        self.btn_run.config(state=tk.NORMAL, bg="#365880")
        self.status_var.set("Ошибка выполнения")
        self.progress.pack_forget()
        messagebox.showerror("Ошибка", f"Что-то пошло не так:\n{error_msg}")

    def run_ollama_fix(self, text, model):
        if messagebox.askyesno("Auto-Fix", f"JSON некорректен. Попробовать исправить через {model}?"):
            self.editor_status_var.set(f"⏳ Исправление через {model}...")
            self.editor_text.config(state=tk.DISABLED)
            
            def _worker():
                options = {
                    "num_ctx": int(self.opt_ctx.get()),
                    "num_predict": int(self.opt_pred.get()),
                    "temperature": float(self.opt_temp.get()),
                    "top_p": float(self.opt_topp.get()),
                    "top_k": int(self.opt_topk.get())
                }
                client = OllamaClient(model, options)
                fixed = client.fix_json(text)
                self.after(0, lambda: self._on_fix_done(fixed))

            threading.Thread(target=_worker).start()

    def _on_fix_done(self, result):
        self.editor_text.config(state=tk.NORMAL)
        if result:
            # Дополнительная очистка на уровне GUI перед вставкой
            cleaned = clean_json_text(result)
            self.editor_text.delete("1.0", tk.END)
            self.editor_text.insert("1.0", cleaned)
            self.validate_json_ui() # Re-validate
        else:
            self.editor_status_var.set("❌ Не удалось исправить JSON.")
            messagebox.showerror("Ollama", "Модель вернула пустой ответ или произошла ошибка.")
