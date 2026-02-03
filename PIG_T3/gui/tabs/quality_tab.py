import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import threading
from typing import List, Optional

from PIG_T3.core.quality import ProjectScanner, FileMetrics
from PIG_T3.utils.dep_installer import DependencyInstaller
from config import ConfigManager


class QualityTab(tk.Frame):
    def __init__(self, parent, path_var: tk.StringVar):
        super().__init__(parent, bg="#2b2b2b")

        self.scanner: Optional[ProjectScanner] = None
        self.metrics_data: List[FileMetrics] = []
        self.is_scanning = False
        self.sort_orders = {}  # col -> bool (reverse)
        self.current_sort_col = "path"  # Текущая колонка сортировки
        self.compact_view_var = tk.BooleanVar(value=False) # Переменная для чекбокса


        self.path_var = path_var
        
        self.setup_ui()

    def setup_ui(self):
        # --- Path Selection (Synchronized) ---
        path_frame = tk.Frame(self, bg="#2b2b2b", pady=5, padx=5)
        path_frame.pack(fill=tk.X)
        tk.Label(path_frame, text="Целевая папка:", bg="#2b2b2b", fg="#a9b7c6").pack(side=tk.LEFT)
        tk.Entry(path_frame, textvariable=self.path_var, bg="#3c3f41", fg="white",
                 insertbackground="white", relief="flat").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=10)

        # --- Toolbar ---
        toolbar = tk.Frame(self, bg="#2b2b2b", pady=5, padx=5)
        toolbar.pack(fill=tk.X)

        self.btn_scan = tk.Button(toolbar, text="🚀 ЗАПУСТИТЬ АНАЛИЗ", command=self.start_scan,
                                  bg="#365880", fg="white", font=("Segoe UI", 10, "bold"), relief="flat", padx=15)
        self.btn_scan.pack(side=tk.LEFT)

        self.status_lbl = tk.Label(toolbar, text="Нажмите кнопку для начала аудита", bg="#2b2b2b", fg="#a9b7c6")
        self.status_lbl.pack(side=tk.LEFT, padx=15)

        # Progress Bar
        self.progress = ttk.Progressbar(toolbar, orient="horizontal", mode="determinate", style="Horizontal.TProgressbar")

        # Checkbox for Compact Mode
        self.cb_compact = ttk.Checkbutton(toolbar, text="Свёрнутый вид (только важные)", 
                                          variable=self.compact_view_var, 
                                          style="TCheckbutton", command=self.update_columns_visibility)
        self.cb_compact.pack(side=tk.RIGHT, padx=10)

        # --- Split View (Tree + Details) ---
        paned = tk.PanedWindow(self, orient=tk.VERTICAL, bg="#2b2b2b", sashwidth=4, sashrelief="flat")
        paned.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # 1. Treeview Frame
        tree_frame = tk.Frame(paned, bg="#2b2b2b")
        paned.add(tree_frame, height=400)

        cols = ("path", "sloc", "cc", "mi", "score", "sec")
        self.tree = ttk.Treeview(tree_frame, columns=cols, show="headings", selectmode="browse")
        
        # Scrollbars
        vsb = ttk.Scrollbar(tree_frame, orient="vertical", command=self.tree.yview)
        hsb = ttk.Scrollbar(tree_frame, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
        
        self.tree.grid(row=0, column=0, sticky="nsew")
        vsb.grid(row=0, column=1, sticky="ns")
        hsb.grid(row=1, column=0, sticky="ew")
        tree_frame.grid_rowconfigure(0, weight=1)
        tree_frame.grid_columnconfigure(0, weight=1)

        # Columns Setup
        headers = {
            "path": "📄 Файл (Путь)",
            "sloc": "📝 Строк",
            "cc": "🌀 Сложность",
            "mi": "🛠️ Поддерж.",
            "score": "⭐ Score",
            "sec": "🛡️ Безоп."
        }
        
        for col in cols:
            self.tree.heading(col, text=headers[col], command=lambda c=col: self.sort_by(c))
            self.sort_orders[col] = False

        self.tree.column("path", width=300, anchor="w")
        self.tree.column("sloc", width=70, anchor="center")
        self.tree.column("cc", width=90, anchor="center")
        self.tree.column("mi", width=110, anchor="center")
        self.tree.column("score", width=90, anchor="center")
        self.tree.column("sec", width=90, anchor="center")

        # Colors Config
        self.tree.tag_configure("green", foreground="#98c379")
        self.tree.tag_configure("yellow", foreground="#e5c07b")
        self.tree.tag_configure("red", foreground="#e06c75", font=("Segoe UI", 9, "bold"))

        self.tree.bind("<<TreeviewSelect>>", self.on_select)

        # 2. Details Frame
        details_frame = tk.LabelFrame(paned, text="📋 Детали найденных проблем", bg="#2b2b2b", fg="#a9b7c6")
        paned.add(details_frame, height=200)

        self.details_text = scrolledtext.ScrolledText(details_frame, bg="#3c3f41", fg="#dcdcdc", 
                                                      font=("Consolas", 10), relief="flat")
        self.details_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.details_text.tag_config("err", foreground="#e06c75")
        self.details_text.tag_config("warn", foreground="#e5c07b")
        self.details_text.tag_config("info", foreground="#61afef")

    def _update_progress_ui(self, percent, text):
        self.progress['value'] = percent
        self.status_lbl.config(text=f"{text} ({percent}%)")

    def start_scan(self):
        path = self.path_var.get()
        if not path:
            messagebox.showwarning("Ошибка", "Выберите папку проекта на вкладке Генератора.")
            return
            
        if self.is_scanning:
            if not messagebox.askyesno("Подтверждение", "Анализ уже выполняется. Вы уверены, что хотите перезапустить процесс?"):
                return

        self.is_scanning = True
        self.btn_scan.config(text="⏳ ОСТАНОВИТЬ / ПЕРЕЗАПУСТИТЬ", bg="#4b7aa6")
        # Кнопку не блокируем (state normal), чтобы можно было нажать для перезапуска
        
        self.tree.delete(*self.tree.get_children())
        self.details_text.delete("1.0", tk.END)

        # Show progress bar
        self.progress.pack(side=tk.LEFT, padx=10, fill=tk.X, expand=True)
        self.progress['value'] = 0
        
        threading.Thread(target=self._run_scan_thread, args=(path,), daemon=True).start()
    def _run_scan_thread(self, path):
        # 1. Check Deps
        def update_lbl(text): 
            self.after(0, lambda: self.status_lbl.config(text=text))

        def update_progress(percent, text):
            self.after(0, lambda: self._update_progress_ui(percent, text))
        
        if not DependencyInstaller.check_and_install(callback=update_lbl):
            self.after(0, lambda: messagebox.showerror("Ошибка", "Не удалось установить анализаторы."))
            def _reset_fail():
                self.is_scanning = False
                self.btn_scan.config(text="🚀 ЗАПУСТИТЬ АНАЛИЗ", bg="#365880")
            self.after(0, _reset_fail)
            return

        # 2. Run Scan
        self.scanner = ProjectScanner(path)
        data = self.scanner.scan(progress_callback=update_progress)
        
        self.after(0, lambda: self._on_scan_complete(data))

    def _on_scan_complete(self, data: List[FileMetrics]):
        self.is_scanning = False
        self.btn_scan.config(text="🚀 ЗАПУСТИТЬ АНАЛИЗ", bg="#365880")
        self.progress.pack_forget()  # Hide progress bar
        self.metrics_data = data
        self.populate_tree(data)
        
        # Generate Statistics
        total = len(data)
        reds = sum(1 for m in data if m.overall_status == "red")
        yellows = sum(1 for m in data if m.overall_status == "yellow")
        greens = total - reds - yellows
        
        stats_msg = f"Всего файлов: {total} | 🔴 Critical: {reds} | ⚠️ Warnings: {yellows} | ✅ Clean: {greens}"
        self.status_lbl.config(text=stats_msg)
        
        if reds > 0:
             self.status_lbl.config(fg="#e06c75")
        else:
             self.status_lbl.config(fg="#98c379")

    def _get_icon(self, status):
        if status == "green": return "✅"
        if status == "yellow": return "⚠️"
        return "❌"

    def populate_tree(self, data: List[FileMetrics]):
        self.tree.delete(*self.tree.get_children())
        sort_col = self.current_sort_col
        
        for m in data:
            # Icons
            cc_icon = self._get_icon(m.status_cc)
            mi_icon = self._get_icon(m.status_mi)
            sc_icon = self._get_icon(m.status_pylint)
            sec_icon = self._get_icon(m.status_security)

            # Values
            sloc_str = f"{m.sloc}"
            cc_str = f"{m.complexity:>4.1f} {cc_icon}"
            mi_str = f"{m.maintainability:>5.1f} {mi_icon}"
            sc_str = f"{m.pylint_score:>4.1f} {sc_icon}"
            sec_str = f"{m.security_issues:>2} {sec_icon}"

            values = (m.path, sloc_str, cc_str, mi_str, sc_str, sec_str)

            # Tag determination
            if sort_col == "path":
                tag = m.overall_status
            else:
                tag = m.get_status_for_column(sort_col)

            self.tree.insert("", "end", iid=m.path, values=values, tags=(tag,))

    def sort_by(self, col):
        # Переключаем порядок
        descending = not self.sort_orders[col]
        self.sort_orders[col] = descending
        
        # Индикатор сортировки в заголовке
        for c in self.tree["columns"]:
            clean_text = self.tree.heading(c, "text").replace(" 🔼", "").replace(" 🔽", "")
            self.tree.heading(c, text=clean_text)
        
        arrow = " 🔽" if descending else " 🔼"
        self.tree.heading(col, text=self.tree.heading(col, "text") + arrow)

        # Сортировка данных
        self.current_sort_col = col  # Запоминаем текущую колонку

        def get_sort_key(m: FileMetrics):
            if col == "path": return m.path
            if col == "sloc": return m.sloc
            if col == "cc": return m.complexity
            if col == "mi": return m.maintainability
            if col == "score": return m.pylint_score
            if col == "sec": return m.security_issues
            return 0

        self.metrics_data.sort(key=get_sort_key, reverse=descending)
        self.populate_tree(self.metrics_data)
        self.update_columns_visibility() # Обновляем видимость колонок

    def update_columns_visibility(self):
        """
        Реализует логику 'В свёрнутом виде отображается только та метрика, по которой сортировка'.
        Если сортировка по Пути, показываем Путь + CC (как самую важную).
        """
        if self.compact_view_var.get():
            target_col = self.current_sort_col
            
            if target_col == "path":
                # Default compact view: Path + Complexity
                display_cols = ("path", "cc")
            else:
                # Dynamic compact view: Path + Sorted Metric
                display_cols = ("path", target_col)
            
            self.tree["displaycolumns"] = display_cols
        else:
            self.tree["displaycolumns"] = "#all"
    def on_select(self, event):
        selected_items = self.tree.selection()
        if not selected_items: return
        
        path = selected_items[0]
        metric = next((m for m in self.metrics_data if m.path == path), None)
        
        self.details_text.delete("1.0", tk.END)
        if not metric:
            return

        # --- Rich Header Generation ---
        self.details_text.insert(tk.END, f"📄 ANALYSIS REPORT: {metric.path}\n", "header_main")
        self.details_text.tag_config("header_main", font=("Segoe UI", 12, "bold"), foreground="white", background="#365880")
        
        self.details_text.insert(tk.END, "-"*80 + "\n")
        
        # Helper to print metric line
        def print_metric(label, value, status, extra=""):
            icon = self._get_icon(status)
            color = "#98c379" if status == "green" else "#e5c07b" if status == "yellow" else "#e06c75"
            tag_name = f"stat_{label}"
            self.details_text.tag_config(tag_name, foreground=color, font=("Consolas", 10, "bold"))
            
            self.details_text.insert(tk.END, f"{label:<20}: ", "label_def")
            self.details_text.insert(tk.END, f"{value} {icon} {extra}\n", tag_name)

        self.details_text.tag_config("label_def", foreground="#a9b7c6")

        print_metric("Cyclomatic Complex.", metric.complexity, metric.status_cc, "(Lower is better)")
        print_metric("Maintainability I.", metric.maintainability, metric.status_mi, "(Higher is better)")
        print_metric("Linter Score", metric.pylint_score, metric.status_pylint, "(Max 10.0)")
        print_metric("Security Issues", metric.security_issues, metric.status_security, "(Bandit Audit)")
        
        self.details_text.insert(tk.END, "-"*80 + "\n\n")

        # --- Issues List ---
        if not metric.issues:
            self.details_text.insert(tk.END, "✨ Great Job! No issues detected in this file.\n", "green")
        else:
            self.details_text.insert(tk.END, f"🔍 FOUND {len(metric.issues)} ISSUES:\n", "header_issues")
            self.details_text.tag_config("header_issues", foreground="#e5c07b", font=("Segoe UI", 10, "bold"))

            for i, issue in enumerate(metric.issues, 1):
                prefix = "[INFO]" 
                tag = "info"
                if issue.severity == "warning": 
                    prefix = "[WARN]"
                    tag = "warn"
                elif issue.severity == "error": 
                    prefix = "[CRIT]"
                    tag = "err"
                
                self.details_text.insert(tk.END, f"{i:02d}. ", "dim")
                self.details_text.insert(tk.END, f"{prefix:<6} ", tag)
                self.details_text.insert(tk.END, f"Line {issue.line:<4} ", "line_num")
                self.details_text.insert(tk.END, f"[{issue.tool.upper()}] ", "tool_tag")
                self.details_text.insert(tk.END, f"{issue.msg}\n")

        self.details_text.tag_config("line_num", foreground="#61afef")
        self.details_text.tag_config("tool_tag", foreground="#c678dd")
        self.details_text.tag_config("dim", foreground="#5c6370")
