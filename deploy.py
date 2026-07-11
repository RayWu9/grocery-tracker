#!/usr/bin/env python3
"""
PricePulse Automated Deployer
Runs validate.py, commits any pending changes, and pushes to GitHub.
"""

import sys
import os
import subprocess
import argparse
from datetime import datetime

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


def run_command(args, env=None, capture=True):
    """Run a system command and return (exit_code, stdout, stderr)."""
    try:
        result = subprocess.run(
            args,
            env=env,
            capture_output=capture,
            text=True,
            encoding='utf-8'
        )
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return -1, "", str(e)


def run_validation():
    log_info("Executing local validation suite...")
    
    # Run validate.py
    code, stdout, stderr = run_command([sys.executable, "validate.py"], capture=False)
    
    if code != 0:
        log_error("Validation suite FAILED. Aborting deployment.")
        return False
        
    log_success("Validation suite PASSED.")
    return True


def get_git_status():
    """Return True if there are uncommitted changes, False otherwise."""
    code, stdout, _ = run_command(["git", "status", "--porcelain"])
    if code != 0:
        log_error("Failed to run 'git status'. Is Git installed?")
        sys.exit(1)
    
    # Non-empty output means changes exist
    changes = [line.strip() for line in stdout.splitlines() if line.strip()]
    return len(changes) > 0, changes


def get_current_branch():
    code, stdout, _ = run_command(["git", "branch", "--show-current"])
    if code != 0:
        return "main" # Fallback
    return stdout.strip() or "main"


def prompt_commit_message(default_msg):
    """Prompt for commit message if in interactive shell, otherwise return default."""
    if sys.stdin.isatty():
        try:
            msg = input(f"Enter commit message [Default: '{default_msg}']: ").strip()
            if msg:
                return msg
        except (KeyboardInterrupt, EOFError):
            print("\nAborted by user.")
            sys.exit(1)
    return default_msg


def main():
    parser = argparse.ArgumentParser(description="Validate code and deploy to GitHub.")
    parser.add_argument("-m", "--message", help="Commit message for pending changes.")
    parser.add_argument("--skip-validation", action="store_true", help="Skip running validate.py.")
    args = parser.parse_args()

    print("==================================================")
    print("PricePulse Automated Deployment Script")
    print("==================================================")

    # 1. Run local validation checks
    if not args.skip_validation:
        if not run_validation():
            sys.exit(1)
    else:
        log_info("Skipping validation checks as requested.")

    # 2. Check git status
    has_changes, changes_list = get_git_status()
    current_branch = get_current_branch()
    
    if has_changes:
        log_info(f"Detected {len(changes_list)} uncommitted changes on branch '{current_branch}':")
        for change in changes_list[:10]:
            print(f"  {change}")
        if len(changes_list) > 10:
            print(f"  ... and {len(changes_list) - 10} more.")

        # Determine commit message
        default_msg = f"Deploy update - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        if args.message:
            commit_msg = args.message
        else:
            commit_msg = prompt_commit_message(default_msg)

        # Commit changes
        log_info("Adding changes and committing...")
        add_code, _, add_err = run_command(["git", "add", "."])
        if add_code != 0:
            log_error(f"Failed to run 'git add': {add_err}")
            sys.exit(1)

        commit_code, _, commit_err = run_command(["git", "commit", "-m", commit_msg])
        if commit_code != 0:
            log_error(f"Failed to run 'git commit': {commit_err}")
            sys.exit(1)
            
        log_success(f"Committed changes with message: '{commit_msg}'")
    else:
        log_info(f"No uncommitted changes detected on branch '{current_branch}'.")

    # 3. Push to remote origin
    log_info(f"Pushing branch '{current_branch}' to remote origin...")
    # Run push in interactive mode (or with output printed to terminal)
    push_code, stdout, stderr = run_command(["git", "push", "origin", current_branch], capture=False)
    
    if push_code != 0:
        log_error("Push failed. Please check your network connection and git authentication status.")
        sys.exit(1)

    print()
    print("==================================================")
    log_success(f"Deployment process COMPLETED successfully!")
    log_info(f"Branch '{current_branch}' is up-to-date with remote.")
    print("==================================================")


if __name__ == "__main__":
    main()
