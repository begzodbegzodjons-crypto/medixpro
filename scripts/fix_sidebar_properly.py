#!/usr/bin/env python3
"""Fix sidebar navigation links properly - based on icon name."""
import re
from pathlib import Path

DIST_DIR = Path('/home/z/my-project/clinicpro-deploy/dist')

# Map icon name -> URL
# Icons are Material Symbols - based on icon meaning
ICON_TO_URL = {
    'dashboard': 'dashboard',           # Boshqaruv paneli
    'group': 'patients',                 # Bemorlar (group of people)
    'history_edu': 'patient-history',    # Tibbiy qaydlar
    'payments': 'cashier',              # Kassa
    'inventory_2': 'invoice',           # Hisob-faktura
    'settings': 'settings',             # Sozlamalar
    'analytics': 'analytics',           # Tahlil
    'logout': '/',                      # Chiqish
    'home': 'dashboard',
    'person': 'doctor',                 # Shifokor
    'medical_information': 'doctor-cabinet',
    'medical_services': 'doctor',
    'calendar_month': 'reception',      # Qabulxona
    'calendar_today': 'reception',
    'receipt_long': 'expenses',         # Xarajatlar
    'monitoring': 'system-status',      # Tizim holati
    'shield': 'settings',
    'shield_lock': 'settings',
    'description': 'prescription-new', # Retsept
    'print': 'prescription-print',
    'add_circle': 'patient-detail',
    'how_to_reg': 'register',
    'app_registration': 'register',
    'inventory': 'invoice',
    'payment': 'cashier',
    'insights': 'analytics',
    'trending_up': 'analytics',
    'manage_accounts': 'doctor-salary',
    'payments_outlined': 'cashier',
    'account_circle': 'doctor-cabinet',
    'admin_panel_settings': 'settings',
    'local_hospital': 'doctor',
    'local_pharmacy': 'prescription-new',
    'science': 'patient-history',
    'biotech': 'patient-history',
    'note_add': 'prescription-new',
    'report': 'analytics',
    'summarize': 'analytics',
    'assignment': 'patient-history',
    'folder_shared': 'patients',
    'contact_page': 'patients',
    'contacts': 'patients',
}

def fix_sidebar_links(html):
    """Find each <a> tag in sidebar, look at its icon, replace href with correct URL."""
    # Find aside or sidebar nav
    sidebar_match = re.search(r'(<(?:aside|nav)[^>]*(?:w-\[240px\]|sidebar|fixed left-0)[^>]*>.*?</(?:aside|nav)>)', html, re.DOTALL)
    if not sidebar_match:
        # Try aside alone
        sidebar_match = re.search(r'(<aside[^>]*>.*?</aside>)', html, re.DOTALL)
    if not sidebar_match:
        # Try nav with sidebar characteristics
        sidebar_match = re.search(r'(<nav[^>]*class="[^"]*(?:flex-col h-full w-\[240px\]|h-screen w-\[240px\])[^"]*"[^>]*>.*?</nav>)', html, re.DOTALL)
    if not sidebar_match:
        return html, 0

    sidebar_html = sidebar_match.group(1)
    original_sidebar = sidebar_html

    # Find each <a> tag and process it
    def replace_anchor(match):
        full_match = match.group(0)
        # Find icon name inside this <a> tag
        icon_match = re.search(r'<span class="material-symbols-outlined"[^>]*>([^<]+)</span>', full_match)
        if icon_match:
            icon_name = icon_match.group(1).strip().lower()
            if icon_name in ICON_TO_URL:
                url = ICON_TO_URL[icon_name]
                # Replace href="#" with correct URL
                new_anchor = re.sub(r'href="#"', f'href="{url}"', full_match)
                return new_anchor
        # If no icon match, leave as is
        return full_match

    # Process each <a>...</a> tag in the sidebar
    new_sidebar = re.sub(
        r'<a[^>]*href="#"[^>]*>.*?</a>',
        replace_anchor,
        sidebar_html,
        flags=re.DOTALL,
    )

    # Also replace any remaining href="#" that we can map
    # Look for icon nearby
    def replace_remaining(match):
        full_match = match.group(0)
        # Look for any material-symbols-outlined icon
        icon_match = re.search(r'<span class="material-symbols-outlined"[^>]*>([^<]+)</span>', full_match)
        if icon_match:
            icon_name = icon_match.group(1).strip().lower()
            if icon_name in ICON_TO_URL:
                url = ICON_TO_URL[icon_name]
                return re.sub(r'href="#"', f'href="{url}"', full_match)
        return full_match

    # Replace all <a> tags with href="#"
    new_sidebar = re.sub(
        r'<a[^>]*href="#"[^>]*>.*?</a>',
        replace_remaining,
        new_sidebar,
        flags=re.DOTALL,
    )

    html = html.replace(original_sidebar, new_sidebar)

    # Count how many sidebar links we fixed
    fixed_count = original_sidebar.count('href="#"') - new_sidebar.count('href="#"')
    return html, fixed_count

def main():
    html_files = sorted(DIST_DIR.glob('*.html'))
    print(f'Processing {len(html_files)} HTML files...\n')

    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        original = content
        content, fixed = fix_sidebar_links(content)
        if content != original:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'  ✓ {html_file.name}: fixed {fixed} sidebar links')
        else:
            print(f'  - {html_file.name}: no sidebar found')

if __name__ == '__main__':
    main()
