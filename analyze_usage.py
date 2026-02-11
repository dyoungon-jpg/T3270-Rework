#!/usr/bin/env python3
"""
Analyze JAWS Script files to find unused constants and global variables.
Usage: python analyze_usage.py
"""
import re
from pathlib import Path
from collections import defaultdict


def parse_header_file(header_path):
    """Parse the .jsh file to extract constants and globals."""
    with open(header_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    consts = []
    globals_vars = []

    # Find Const section
    const_match = re.search(r'Const\s+(.*?)globals',
                            content, re.DOTALL | re.IGNORECASE)
    if const_match:
        const_section = const_match.group(1)
        # Extract constant names (before = sign)
        for line in const_section.split('\n'):
            line = line.strip()
            if '=' in line and not line.startswith(';'):
                const_name = line.split('=')[0].strip()
                if const_name and ',' not in const_name:
                    consts.append(const_name)

    # Find globals section
    globals_match = re.search(
        r'globals\s+(.*)', content, re.DOTALL | re.IGNORECASE)
    if globals_match:
        globals_section = globals_match.group(1)
        # Extract variable names
        for line in globals_section.split('\n'):
            line = line.strip()
            if line and not line.startswith(';'):
                # Match patterns like: Int nAAqPointer, or string sAdminCompName,
                match = re.match(
                    r'(?:int|string|handle)\s+(\w+)', line, re.IGNORECASE)
                if match:
                    globals_vars.append(match.group(1))

    return consts, globals_vars


def parse_message_file(msg_path):
    """Parse a .jsm file to extract message constants."""
    with open(msg_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    messages = []

    # Find CONST section in message files (between CONST and Messages/EndMessages)
    # Use \s* to match any whitespace (space, tab, newline) after Messages
    const_match = re.search(
        r'CONST\s+(.*?)(?:Messages\s*|EndMessages|$)', content, re.DOTALL | re.IGNORECASE)
    if const_match:
        const_section = const_match.group(1)
        # Extract message names (before = sign)
        for line in const_section.split('\n'):
            line = line.strip()
            if '=' in line and not line.startswith(';'):
                # Extract just the identifier before =
                msg_name = line.split('=')[0].strip()
                # Remove any trailing comma if present
                msg_name = msg_name.rstrip(',')
                if msg_name:
                    messages.append(msg_name)

    # Also find Messages section with @ markers
    message_matches = re.findall(r'@(\w+)', content)
    for msg in message_matches:
        if msg not in messages:
            messages.append(msg)

    return messages


def count_usage_in_file(file_path, identifiers):
    """Count how many times each identifier appears in a file."""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    usage_count = defaultdict(int)

    for identifier in identifiers:
        # Use word boundaries to match whole words only
        pattern = r'\b' + re.escape(identifier) + r'\b'
        matches = re.findall(pattern, content, re.IGNORECASE)
        usage_count[identifier] = len(matches)

    return usage_count


def main():
    script_dir = Path(__file__).parent
    header_file = script_dir / 'Talk3270.jsh'

    # Message files to analyze
    message_files = [
        script_dir / 'talk3270.jsm',
        script_dir / 'Talk3270Help.jsm',
    ]
    message_files = [f for f in message_files if f.exists()]

    # Find all script files to check usage
    script_files = [
        script_dir / 'Talk3270.JSS',
    ]
    script_files = [f for f in script_files if f.exists()]

    print("=" * 80)
    print("JAWS Script Usage Analysis")
    print("=" * 80)
    print()

    # Parse header file
    print(f"Parsing header file: {header_file.name}")
    consts, globals_vars = parse_header_file(header_file)
    print(f"Found {len(consts)} constants")
    print(f"Found {len(globals_vars)} global variables")

    # Parse message files
    all_messages = []
    message_by_file = {}
    for msg_file in message_files:
        print(f"Parsing message file: {msg_file.name}")
        messages = parse_message_file(msg_file)
        print(f"Found {len(messages)} messages")
        all_messages.extend(messages)
        message_by_file[msg_file.name] = messages

    print()

    # Count usage in script files
    print(f"Analyzing usage in {len(script_files)} script files:")
    for f in script_files:
        print(f"  - {f.name}")
    print()

    # Analyze constants - combine usage from all files
    const_usage = defaultdict(int)
    for script_file in script_files:
        file_usage = count_usage_in_file(script_file, consts)
        for const, count in file_usage.items():
            const_usage[const] += count

    # Analyze messages
    message_usage = defaultdict(int)
    for script_file in script_files:
        file_usage = count_usage_in_file(script_file, all_messages)
        for msg, count in file_usage.items():
            message_usage[msg] += count

    # Analyze globals
    globals_usage = defaultdict(int)
    for script_file in script_files:
        file_usage = count_usage_in_file(script_file, globals_vars)
        for var, count in file_usage.items():
            globals_usage[var] += count

    # Categorize items
    print("-" * 80)

    unused_consts = []
    used_consts = []
    for const in sorted(consts):
        count = const_usage[const]
        if count == 0:
            unused_consts.append(const)
        else:
            used_consts.append((const, count))

    unused_globals = []
    used_globals = []
    for var in sorted(globals_vars):
        count = globals_usage[var]
        if count == 0:
            unused_globals.append(var)
        else:
            used_globals.append((var, count))

    unused_messages_by_file = {}
    used_messages_by_file = {}
    for file_name, messages in message_by_file.items():
        unused = []
        used = []
        for msg in sorted(messages):
            count = message_usage[msg]
            if count == 0:
                unused.append(msg)
            else:
                used.append((msg, count))
        unused_messages_by_file[file_name] = unused
        used_messages_by_file[file_name] = used

    # Display results
    print(
        f"\nHEADER FILE CONSTANTS ({len(used_consts)} used, {len(unused_consts)} unused)")
    if unused_consts:
        print(f"⚠️  UNUSED: {', '.join(unused_consts[:5])}" +
              (f" and {len(unused_consts)-5} more" if len(unused_consts) > 5 else ""))

    print(
        f"\nGLOBAL VARIABLES ({len(used_globals)} used, {len(unused_globals)} unused)")
    if unused_globals:
        print(f"⚠️  UNUSED: {', '.join(unused_globals[:5])}" +
              (f" and {len(unused_globals)-5} more" if len(unused_globals) > 5 else ""))

    for file_name in message_by_file.keys():
        unused = unused_messages_by_file[file_name]
        used = used_messages_by_file[file_name]
        print(f"\n{file_name} MESSAGES ({len(used)} used, {len(unused)} unused)")
        if unused:
            print(f"⚠️  UNUSED: {', '.join(unused[:5])}" +
                  (f" and {len(unused)-5} more" if len(unused) > 5 else ""))

    # Write markdown file
    output_file = script_dir / 'T3270_not_use.md'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Talk3270 Unused Items Report\n\n")
        f.write(f"**Generated:** {Path(__file__).name}\n\n")
        f.write("**Analysis Date:** " +
                __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S') + "\n\n")
        f.write("---\n\n")

        # Summary
        f.write("## Summary\n\n")
        f.write(
            f"- **Header Constants:** {len(unused_consts)} unused out of {len(consts)} total\n")
        f.write(
            f"- **Global Variables:** {len(unused_globals)} unused out of {len(globals_vars)} total\n")
        for file_name in message_by_file.keys():
            unused = unused_messages_by_file[file_name]
            total = len(message_by_file[file_name])
            f.write(
                f"- **{file_name} Messages:** {len(unused)} unused out of {total} total\n")
        f.write("\n---\n\n")

        # Unused Header Constants
        f.write("## Unused Header File Constants (Talk3270.jsh)\n\n")
        if unused_consts:
            f.write(f"**Total Unused:** {len(unused_consts)}\n\n")
            for const in sorted(unused_consts):
                f.write(f"- ❌ `{const}`\n")
        else:
            f.write("✅ All constants are used!\n")
        f.write("\n---\n\n")

        # Unused Globals
        f.write("## Unused Global Variables (Talk3270.jsh)\n\n")
        if unused_globals:
            f.write(f"**Total Unused:** {len(unused_globals)}\n\n")
            for var in sorted(unused_globals):
                f.write(f"- ❌ `{var}`\n")
        else:
            f.write("✅ All global variables are used!\n")
        f.write("\n---\n\n")

        # Unused Messages
        for file_name in sorted(message_by_file.keys()):
            unused = unused_messages_by_file[file_name]
            used = used_messages_by_file[file_name]

            f.write(f"## {file_name}\n\n")
            if unused:
                f.write(f"**Total Unused:** {len(unused)}\n\n")
                for msg in sorted(unused):
                    f.write(f"- ❌ `{msg}`\n")
            else:
                f.write("✅ All messages are used!\n")
            f.write("\n")

            if used:
                f.write(f"**Used Messages ({len(used)}):**\n\n")
                for msg, count in sorted(used, key=lambda x: x[1], reverse=True)[:10]:
                    f.write(f"- `{msg}` - used {count} time(s)\n")
                if len(used) > 10:
                    f.write(f"- ... and {len(used) - 10} more\n")
            f.write("\n---\n\n")

    print()
    print("=" * 80)
    print(f"✅ Report saved to: {output_file.name}")
    print("=" * 80)


if __name__ == '__main__':
    main()
