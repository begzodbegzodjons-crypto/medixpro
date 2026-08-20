#!/usr/bin/env python3
"""Add proper navigation links to all HTML files."""

import os
import re
from pathlib import Path

DIST_DIR = Path('/home/z/my-project/clinicpro-deploy/dist')

# Sidebar nav order - icon name -> URL
NAV_MAPPING = [
    ('dashboard', 'dashboard.html'),
    ('group', 'patients.html'),
    ('history_edu', 'patient-history.html'),
    ('payments', 'cashier.html'),
    ('inventory_2', 'invoice.html'),
    ('analytics', 'analytics.html'),
    ('settings', 'settings.html'),
    ('logout', 'index.html'),
]

# Extra nav items to add to sidebar (after existing items)
EXTRA_NAV = [
    ('person', 'doctor.html', 'Shifokor kabineti'),
    ('medical_information', 'doctor-cabinet.html', 'Shifokor shaxsiy'),
    ('payments', 'doctor-salary.html', 'Shifokorlar maoshi'),
    ('add_circle', 'reception.html', 'Qabulxona'),
    ('description', 'prescription-new.html', 'Yangi retsept'),
    ('print', 'prescription-print.html', 'Retsept chop etish'),
    ('monitoring', 'system-status.html', 'Tizim holati'),
    ('receipt_long', 'expenses.html', 'Xarajatlar'),
    ('person_add', 'patient-detail.html', 'Bemor kartochkasi'),
    ('how_to_reg', 'register.html', 'Yangi klinika'),
]

def update_sidebar_links(html, filename):
    """Replace href='#' in sidebar nav items with actual URLs.
    Supports both <aside> and <nav> sidebars."""
    # Try <aside> first
    for pattern in [r'(<aside[^>]*>.*?</aside>)', r'(<nav[^>]*class="[^"]*(?:sidebar|fixed left-0|h-screen w-)[^"]*"[^>]*>.*?</nav>)']:
        match = re.search(pattern, html, re.DOTALL)
        if match:
            break
    else:
        # Try any nav with w-[240px]
        match = re.search(r'(<nav[^>]*w-\[240px\][^>]*>.*?</nav>)', html, re.DOTALL)

    if not match:
        return html, 0

    aside_content = match.group(1)
    # Find all <a> tags with href="#"
    a_pattern = r'(<a[^>]*?)href="#"([^>]*>.*?</a>)'

    counter = [0]

    def replace_href(m):
        idx = counter[0]
        counter[0] += 1
        if idx < len(NAV_MAPPING):
            icon, url = NAV_MAPPING[idx]
            return f'{m.group(1)}href="{url}"{m.group(2)}'
        return m.group(0)

    new_aside = re.sub(a_pattern, replace_href, aside_content, flags=re.DOTALL)

    html = html.replace(aside_content, new_aside)
    return html, counter[0]


def update_login_links(html, filename):
    """Update login/register page to link to dashboard."""
    # Replace form action or any '#' links with dashboard.html
    # Find login form submit button
    return html


def main():
    html_files = sorted(DIST_DIR.glob('*.html'))
    print(f'Found {len(html_files)} HTML files\n')

    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content
        content, links_updated = update_sidebar_links(content, html_file.name)
        content = update_login_links(content, html_file.name)

        if content != original:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'  ✓ {html_file.name}: updated {links_updated} sidebar links')
        else:
            print(f'  - {html_file.name}: no sidebar found')

if __name__ == '__main__':
    main()
