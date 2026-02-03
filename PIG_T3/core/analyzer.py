import os
import sys
from datetime import datetime
from config import EXTENSION_TO_MARKDOWN


class ProjectAnalyzer:
    def get_markdown_lang(self, ext):
        return EXTENSION_TO_MARKDOWN.get(ext.lower(), '')

    def generate_tree(self, file_paths):
        tree = {}
        for path in sorted(file_paths):
            parts = path.split("/")
            current = tree
            for part in parts:
                current = current.setdefault(part, {})
        lines = []

        def _build(node, prefix=""):
            items = list(node.keys())
            items.sort()
            for i, item in enumerate(items):
                is_last = (i == len(items) - 1)
                connector = "└── " if is_last else "├── "
                lines.append(f"{prefix}{connector}{item}")
                if node[item]:
                    ext = " " if is_last else "│ "
                    _build(node[item], prefix + ext)

        _build(tree)
        return "\n".join(lines)

    def _write_patching_instructions(self, f, line_numbers=False, use_sharp_indent=False):
        instructions = [
            "\n" + "=" * 80,
            "SYSTEM INSTRUCTION: HOW TO MODIFY CODE (JSON FORMAT)",
            "=" * 80,
            "You are a coding assistant. To modify code, you MUST return the response strictly in JSON format.",
            "Do not use old formats with separators. Use only the JSON structure described below.",
            "",
            "👉 RESPONSE STRUCTURE (JSON):",
            "Return a list of operations within a root array. Example:",
            "```json",
            "[",
            "  {",
            "    \"action\": \"create\",",
            "    \"path\": \"path/to/new_file.py\",",
            "    \"content\": \"print('Hello World')\\n\"",
            "  },",
            "  {",
            "    \"action\": \"delete\",",
            "    \"path\": \"path/to/obsolete_file.py\"",
            "  },",
            "  {",
            "    \"action\": \"edit\",",
            "    \"path\": \"path/to/existing_file.py\",",
            "    \"operations\": [",
            "       {",
            "         \"type\": \"replace_lines\",",
            "         \"start\": 10, \"end\": 12,",
            "         \"content\": \"    new_code_here()\\n    another_line()\"",
            "       },",
            "       {",
            "         \"type\": \"replace_text\",",
            "         \"find\": \"old_exact_string_code()\",",
            "         \"replace\": \"new_exact_string_code()\"",
            "       }",
            "    ]",
            "  }",
            "]",
            "```",
            "",
            "👉 OPERATIONS EXPLANATION:",
            "1. **action: create** — Creates a new file (or overwrites it entirely). Requires 'content'.",
            "2. **action: delete** — Deletes a file.",
            "3. **action: edit** — Modifies an existing file. Requires 'operations' array.",
            "   - **type: replace_lines**: Replaces lines from 'start' to 'end' (inclusive, 1-based numbering). Ideal if line numbers are enabled.",
            "   - **type: insert_after_line**: Inserts 'content' strictly AFTER the specified 'line' number.",
            "   - **type: replace_text**: Searches for an exact match of text 'find' and changes it to 'replace'. Pay attention to indentation.",
            "",
            "IMPORTANT: When using 'replace_lines', ensure line numbers correspond to the current context.",
            "⚠️ VERY IMPORTANT: Do not include neighboring lines (context) in 'content' if you have not changed them and have not included them in the 'start'-'end' range. This leads to code duplication!"
        ]

        f.write("\n".join(instructions))

    def scan_directory(self, config):
        """
        Scans the directory and returns a list of valid files and empty directories.
        Used by both the GUI (for preview) and the Generator.
        """
        root_folder = config['root_folder']
        extensions = [e.strip() for e in config['extensions'].split(',')]
        ignore_list = [i.strip() for i in config['ignore_list'].split(',')]
        strict_mode = config['strict_mode']
        ignore_self = config.get("ignore_self", False)
        
        # Prepare forbidden paths
        forbidden_paths = set()
        if ignore_self:
            # Try to guess output file path to ignore it
            base_name = config.get('output_name', 'project_context')
            use_markdown = config.get('use_markdown', False)
            final_ext = ".md" if use_markdown else ".txt"
            if base_name.lower().endswith('.txt') or base_name.lower().endswith('.md'):
                base_name = os.path.splitext(base_name)[0]
            output_file = os.path.join(root_folder, base_name + final_ext)
            
            forbidden_paths.add(os.path.normcase(os.path.abspath(output_file)))
            if config.get("config_path_abs"):
                forbidden_paths.add(os.path.normcase(os.path.abspath(config['config_path_abs'])))
            script_path = os.path.abspath(sys.argv[0])
            forbidden_paths.add(os.path.normcase(script_path))

        if not os.path.exists(root_folder):
             return [], []

        paths_to_process = []
        empty_dirs = []

        for root, dirs, files in os.walk(root_folder):
            dirs[:] = [d for d in dirs if not any(ign in d for ign in ignore_list)]
            rel_root = os.path.relpath(root, root_folder)
            if rel_root != "." and any(ign in rel_root.split(os.sep) for ign in ignore_list):
                continue
            
            has_valid_files = False
            for file in files:
                full_path = os.path.join(root, file)
                norm_path = os.path.normcase(os.path.abspath(full_path))
                if norm_path in forbidden_paths: continue
                if any(ign in file for ign in ignore_list): continue
                
                matched_ext = None
                for ext_check in extensions:
                    if file.endswith(ext_check):
                        matched_ext = ext_check
                        break
                
                if matched_ext:
                    if strict_mode and '.' in file[:-len(matched_ext)]: continue
                    paths_to_process.append((full_path, matched_ext))
                    has_valid_files = True
            
            if not has_valid_files and not dirs and rel_root != ".":
                empty_dirs.append(rel_root.replace("\\", "/"))
        
        return paths_to_process, empty_dirs

    def process(self, config, progress_callback=None):
        root_folder = config['root_folder']
        base_name = config['output_name']
        use_markdown = config['use_markdown']
        add_edit_prompt = config.get("add_edit_prompt", False)
        line_numbers = config.get("line_numbers", False)
        use_sharp_indent = config.get("use_sharp_indent", False)
        
        # Optional: List of specifically allowed files (from GUI checkboxes)
        # If None/Empty, assume all found files are allowed.
        # Изменено на Blacklist: список явно исключенных файлов (из GUI)
        # Если файла нет в excluded_paths, он считается включенным (полезно для новых файлов).
        excluded_paths_abs = config.get("excluded_paths", None)

        final_ext = ".md" if use_markdown else ".txt"
        if base_name.lower().endswith('.txt') or base_name.lower().endswith('.md'):
            base_name = os.path.splitext(base_name)[0]
        output_file = os.path.join(root_folder, base_name + final_ext)

        # 1. Scan files
        paths_to_process, empty_dirs = self.scan_directory(config)
        total_files_count = len(paths_to_process)
        files_data = []
        found_paths = []
        total_lines = 0

        for i, (full_path, ext) in enumerate(paths_to_process):
            rel_path = os.path.relpath(full_path, root_folder).replace("\\", "/")
            
            # Check if we should include CONTENT of this file
            # If allowed_paths_abs is set, we check if full_path is in it.
            include_content = True
            if excluded_paths_abs is not None:
                if os.path.normcase(os.path.abspath(full_path)) in excluded_paths_abs:
                    include_content = False

            try:
                if include_content:
                    with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
                        content = f.read()
                lines_count = len(content.splitlines())

                # Нумерация строк полезна для JSON режима replace_lines
                if line_numbers:
                    numbered_content = []
                    for num, line in enumerate(content.splitlines(), 1):
                        numbered_content.append(f"{num:4d} | {line}")
                    content = "\n".join(numbered_content)

                files_data.append({'path': rel_path, 'content': content, 'lines': lines_count, 'ext': ext, 'included': include_content})
                found_paths.append(rel_path)
                if include_content:
                    total_lines += lines_count
            except Exception as e:
                print(f"Ошибка чтения {rel_path}: {e}")
            if progress_callback:
                progress_callback(i + 1, total_files_count)

        files_data.sort(key=lambda x: x['path'])
        all_tree_paths = found_paths + [f"{d} (empty)" for d in sorted(empty_dirs)]
        tree_view = self.generate_tree(all_tree_paths)
        date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        with open(output_file, 'w', encoding='utf-8') as f:
            if not use_markdown:
                intro = (
                    f"PROJECT CONTEXT REPORT\n"
                    f"Generated: {date_str}\n"
                    f"Total Files: {len(files_data)}\n"
                    f"Total Lines: {total_lines}\n\n"
                    f"INSTRUCTION FOR AI:\n"
                    f"This file contains the full source code of a project.\n"
                    f"The structure is provided in the <project_structure> tag.\n"
                    f"Each file's content is wrapped in a <file path=\"...\"> tag.\n"
                    f"Use this context to understand the codebase.\n"
                    f"================================================================================\n\n"
                )
                f.write(intro)
                f.write("<project_structure>\n")
                f.write(tree_view)
                f.write("\n</project_structure>\n\n")
                f.write("================================================================================\n")
                f.write("FILE CONTENTS\n")
                f.write("================================================================================\n\n")
                for item in files_data:
                    if not item['included']: continue
                    f.write(f"<file path=\"{item['path']}\">\n")
                    f.write(item['content'])
                    if not item['content'].endswith('\n'): f.write('\n')
                    f.write(f"</file>\n\n")
                if add_edit_prompt: self._write_patching_instructions(f, line_numbers, use_sharp_indent)
            else:
                toc_lines = ["## Оглавление"]
                for i, item in enumerate(files_data, 1):
                    toc_lines.append(f"{i}. [{item['path']}](#file-{i})")
                header = (
                    f"# PROJECT CONTEXT REPORT\n"
                    f"**Date:** {date_str} \n"
                    f"**Files:** {len(files_data)} | **Lines:** {total_lines}\n\n"
                    f"> **Note for AI:** This document contains the source code. Interpret the code blocks below according to their file paths.\n\n"
                    f"---\n### Project Structure\n```text\n{tree_view}\n```\n---\n"
                    f"{chr(10).join(toc_lines)}\n\n---\n"
                )
                f.write(header)
                for i, item in enumerate(files_data, 1):
                    if not item['included']: continue
                    lang = self.get_markdown_lang(item['ext'])
                    block = (
                        f"\n<div id='file-{i}'></div>\n\n"
                        f"## {i}. {item['path']}\n"
                        f"> Lines: {item['lines']}\n\n"
                        f"```{lang}\n{item['content']}\n```\n---\n"
                    )
                    f.write(block)
                if add_edit_prompt:
                    f.write("\n")
                    self._write_patching_instructions(f, line_numbers, use_sharp_indent)
                    f.write("\n")
        return output_file, len(files_data), total_lines