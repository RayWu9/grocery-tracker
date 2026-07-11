#!/usr/bin/env python3
"""
PricePulse Local Code Validator
Runs checks on Python, HTML, JS, and CSS files to ensure validity before deployment.
"""

import sys
import os
import subprocess
import py_compile
from html.parser import HTMLParser

# Force UTF-8 encoding for stdout and stderr to avoid Windows cp1252 crashes
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Colors for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

def log_success(msg):
    print(f"{GREEN}[OK] {msg}{RESET}")

def log_error(msg):
    print(f"{RED}[FAIL] {msg}{RESET}", file=sys.stderr)

def log_info(msg):
    print(f"{YELLOW}[INFO] {msg}{RESET}")


class StrictHTMLParser(HTMLParser):
    def handle_error(self, message):
        raise ValueError(f"HTML Parse Error: {message}")


def validate_python():
    log_info("Checking Python file compilation...")
    py_files = []
    for root, _, files in os.walk("scraper"):
        for file in files:
            if file.endswith(".py"):
                py_files.append(os.path.join(root, file))

    failed = False
    for py_file in py_files:
        try:
            py_compile.compile(py_file, doraise=True)
        except py_compile.PyCompileError as e:
            log_error(f"Syntax error in {py_file}:\n{e}")
            failed = True

    if failed:
        return False
    
    log_success(f"All {len(py_files)} Python files compiled successfully.")
    return True


def validate_scraper_execution():
    log_info("Running scraper in MOCK_MODE to verify runtime logic...")
    
    # Set environment variables so config checks pass and we run in mock mode
    env = os.environ.copy()
    env["MOCK_MODE"] = "true"
    env["SUPABASE_URL"] = "https://dummy-validation-url.supabase.co"
    env["SUPABASE_SERVICE_KEY"] = "dummy-validation-service-key"
    env["PYTHONIOENCODING"] = "utf-8"

    try:
        # Run main.py as a subprocess with explicit UTF-8 encoding
        result = subprocess.run(
            [sys.executable, "scraper/main.py"],
            env=env,
            capture_output=True,
            text=True,
            encoding='utf-8',
            check=True
        )
        
        stdout_str = result.stdout or ""
        # Check if the output indicates failure
        if "failed" in stdout_str.lower() and "0 failed" not in stdout_str.lower():
            log_error("Scraper ran but reported failures:")
            print(stdout_str)
            return False
            
        log_success("Scraper executed successfully in mock mode.")
        return True
    except subprocess.CalledProcessError as e:
        log_error(f"Scraper execution failed with exit code {e.returncode}:")
        print(e.stdout or "")
        print(e.stderr or "", file=sys.stderr)
        return False
    except Exception as e:
        log_error(f"Scraper run failed with exception: {e}")
        return False


def validate_html():
    log_info("Validating index.html...")
    if not os.path.exists("index.html"):
        log_error("index.html is missing!")
        return False

    try:
        with open("index.html", "r", encoding="utf-8") as f:
            content = f.read()
        
        parser = StrictHTMLParser()
        parser.feed(content)
        log_success("index.html parsed successfully.")
        return True
    except Exception as e:
        log_error(f"Failed to parse index.html: {e}")
        return False


def check_brackets(filepath, label):
    log_info(f"Checking brackets and brace matching in {label}...")
    if not os.path.exists(filepath):
        log_error(f"{label} is missing! ({filepath})")
        return False

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Simple brace/bracket match validation
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        lines = content.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            for char_num, char in enumerate(line, 1):
                if char in mapping.values():
                    stack.append((char, line_num, char_num))
                elif char in mapping.keys():
                    if not stack:
                        log_error(f"Unmatched closing '{char}' at {filepath}:{line_num}:{char_num}")
                        return False
                    top, start_line, start_char = stack.pop()
                    if top != mapping[char]:
                        log_error(f"Mismatched brackets: Opened '{top}' at line {start_line}:{start_char}, "
                                  f"but closed with '{char}' at line {line_num}:{char_num}")
                        return False
        
        if stack:
            top, start_line, start_char = stack[-1]
            log_error(f"Unclosed '{top}' starting at {filepath}:{start_line}:{start_char}")
            return False

        log_success(f"{label} brackets match and file is readable.")
        return True
    except Exception as e:
        log_error(f"Error checking {label}: {e}")
        return False


def main():
    print("==================================================")
    print("PricePulse Local Validation Suite")
    print("==================================================")

    steps = [
        ("Python Compilation Check", validate_python),
        ("Scraper Mock Execution Check", validate_scraper_execution),
        ("HTML Validation Check", validate_html),
        ("JS Braces Match Check", lambda: check_brackets("js/app.js", "js/app.js")),
        ("CSS Braces Match Check", lambda: check_brackets("css/style.css", "css/style.css")),
    ]

    failed_steps = []
    for name, func in steps:
        print()
        log_info(f"Running step: {name}")
        try:
            if not func():
                failed_steps.append(name)
        except Exception as e:
            log_error(f"Unhandled exception during '{name}': {e}")
            failed_steps.append(name)

    print()
    print("==================================================")
    if failed_steps:
        print(f"{RED}Validation FAILED!{RESET}")
        print("Failed steps:")
        for step in failed_steps:
            print(f" - {step}")
        sys.exit(1)
    else:
        print(f"{GREEN}Validation PASSED! Ready for deployment.{RESET}")
        sys.exit(0)


if __name__ == "__main__":
    main()
