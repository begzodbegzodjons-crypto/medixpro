#!/usr/bin/env python3
"""Inject app.css and app.js into all Stitch HTML files.
Fix sidebar navigation links based on icon.
Fix page titles to 100% Uzbek.
Add loader overlay.
Add user badge if logged in.
"""
import os
import re
from pathlib import Path

DIST_DIR = Path('/home/z/my-project/clinicpro/dist')

# Icon name -> URL mapping for sidebar
ICON_TO_URL = {
    'dashboard': '/dashboard',
    'home': '/dashboard',
    'group': '/patients',
    'patients': '/patients',
    'history_edu': '/patient-history',
    'medical_records': '/patient-history',
    'payments': '/cashier',
    'payment': '/cashier',
    'cash': '/cashier',
    'inventory_2': '/invoice',
    'inventory': '/invoice',
    'receipt': '/invoice',
    'settings': '/settings',
    'admin_panel_settings': '/settings',
    'shield': '/settings',
    'shield_lock': '/settings',
    'analytics': '/analytics',
    'insights': '/analytics',
    'trending_up': '/analytics',
    'monitoring': '/system-status',
    'monitor_heart': '/system-status',
    'logout': '/',
    'logout_2': '/',
    'person': '/doctor',
    'person_2': '/doctor',
    'stethoscope': '/doctor',
    'medical_information': '/doctor-cabinet',
    'medical_services': '/doctor',
    'local_hospital': '/doctor',
    'calendar_month': '/reception',
    'calendar_today': '/reception',
    'event': '/reception',
    'how_to_reg': '/register',
    'app_registration': '/register',
    'person_add': '/register',
    'description': '/prescription-new',
    'note_add': '/prescription-new',
    'edit_note': '/prescription-new',
    'prescription': '/prescription-new',
    'medication': '/prescription-new',
    'print': '/prescription-print',
    'receipt_long': '/expenses',
    'money_off': '/expenses',
    'trending_down': '/expenses',
    'manage_accounts': '/doctor-salary',
    'paid': '/doctor-salary',
    'account_circle': '/doctor-cabinet',
    'contact_page': '/patient-detail',
    'contactless': '/patient-detail',
    'folder_shared': '/patients',
    'badge': '/staff',
    'engineering': '/system-status',
    'security': '/settings',
    'lock': '/settings',
    'tune': '/settings',
    'settings_2': '/settings',
    'summarize': '/analytics',
    'assessment': '/analytics',
    'bar_chart': '/analytics',
    'leaderboard': '/analytics',
    'report': '/analytics',
    'pie_chart': '/analytics',
}

# Plain text -> URL map (for top nav links without icons)
TEXT_TO_URL = {
    'dashboard': '/dashboard',
    'overview': '/dashboard',
    'boshqaruv': '/dashboard',
    'patients': '/patients',
    'bemorlar': '/patients',
    'schedule': '/reception',
    'jadval': '/reception',
    'qabulxona': '/reception',
    'reception': '/reception',
    'billing': '/cashier',
    'kassa': '/cashier',
    'cashier': '/cashier',
    'reports': '/analytics',
    'hisobotlar': '/analytics',
    'analytics': '/analytics',
    'tahlil': '/analytics',
    'settings': '/settings',
    'sozlamalar': '/settings',
    'inventory': '/invoice',
    'inventar': '/invoice',
    'invoice': '/invoice',
    'medical records': '/patient-history',
    'tibbiy qaydlar': '/patient-history',
    'queue': '/reception',
    'navbat': '/reception',
    'logout': '/',
    'sign out': '/',
    'chiqish': '/',
    'system status': '/system-status',
    'tizim holati': '/system-status',
    'doctor': '/doctor',
    'shifokor': '/doctor',
    'register': '/register',
    "ro'yxatdan o'tish": '/register',
    'expenses': '/expenses',
    'xarajatlar': '/expenses',
    'prescription': '/prescription-new',
    'retsept': '/prescription-new',
}

# Page titles (100% Uzbek)
TITLE_MAP = {
    'index.html': 'ClinicFlow ERP - Tizimga kirish',
    'register.html': 'ClinicFlow ERP - Yangi klinika ro\'yxatdan o\'tish',
    'dashboard.html': 'ClinicFlow ERP - Boshqaruv paneli',
    'reception.html': 'ClinicFlow ERP - Qabulxona va ro\'yxatdan o\'tish',
    'reception-pro.html': 'ClinicFlow ERP - Professional qabulxona',
    'patients.html': 'ClinicFlow ERP - Bemorlar ro\'yxati',
    'patient-detail.html': 'ClinicFlow ERP - Bemor kartochkasi',
    'patient-history.html': 'ClinicFlow ERP - Bemor kasallik tarixi',
    'doctor.html': 'ClinicFlow ERP - Shifokor kabineti',
    'doctor-cabinet.html': 'ClinicFlow ERP - Shifokor shaxsiy kabineti',
    'doctor-salary.html': 'ClinicFlow ERP - Shifokorlar ish haqi va maoshlari',
    'cashier.html': 'ClinicFlow ERP - Kassa va moliyaviy boshqaruv',
    'invoice.html': 'ClinicFlow ERP - To\'lov va hisob-faktura',
    'analytics.html': 'ClinicFlow ERP - Moliyaviy hisobotlar va tahlil',
    'expenses.html': 'ClinicFlow ERP - Xarajatlar tahlili va hisoboti',
    'prescription-new.html': 'ClinicFlow ERP - Yangi retsept yozish',
    'prescription-print.html': 'ClinicFlow ERP - Retseptni chop etish',
    'settings.html': 'ClinicFlow ERP - Tizim boshqaruvi va xavfsizlik sozlamalari',
    'system-status.html': 'ClinicFlow ERP - Klinika tizimi holati va monitoring',
}


def fix_anchor_tags(html):
    """Find all <a href="#"> tags and assign URLs based on icon or text content."""
    def fix_link(match):
        full = match.group(0)
        # Look for icon name inside the <a> tag
        icon_match = re.search(r'<span class="material-symbols-outlined"[^>]*>([^<]+)</span>', full)
        if icon_match:
            icon_name = icon_match.group(1).strip().lower()
            if icon_name in ICON_TO_URL:
                url = ICON_TO_URL[icon_name]
                return full.replace('href="#"', f'href="{url}"')
        # Look for plain text content
        # Strip HTML tags to get text
        inner_html_match = re.search(r'<a[^>]*>(.*?)</a>', full, re.DOTALL)
        if inner_html_match:
            inner_text = re.sub(r'<[^>]+>', '', inner_html_match.group(1)).strip().lower()
            for text_key, url in TEXT_TO_URL.items():
                if text_key in inner_text:
                    return full.replace('href="#"', f'href="{url}"')
        return full
    
    # Process all <a> tags with href="#"
    return re.sub(r'<a[^>]*href="#"[^>]*>.*?</a>', fix_link, html, flags=re.DOTALL)


def inject_assets(html, filename):
    """Inject app.css, app.js, loader overlay, and fix title/lang."""
    # Fix title
    if filename in TITLE_MAP:
        new_title = TITLE_MAP[filename]
        html = re.sub(r'<title>[^<]*</title>', f'<title>{new_title}</title>', html, count=1)
    
    # Fix lang attribute
    html = re.sub(r'<html\s+lang="en"', '<html lang="uz"', html)
    html = re.sub(r'<html(?![^>]*lang=)', '<html lang="uz"', html, count=1)
    
    # Add cache-control meta tags (no-cache for HTML)
    cache_meta = '''    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />'''
    if 'http-equiv="Cache-Control"' not in html:
        html = html.replace('</head>', f'{cache_meta}\n</head>')
    
    # Add app.css before </head>
    if 'assets/app.css' not in html:
        html = html.replace('</head>', '    <link rel="stylesheet" href="/assets/app.css?v=20260821">\n</head>')
    
    # Add loader overlay at start of body
    loader_html = '''<div id="cf-loader"><div><div class="spinner"></div><div class="text">ClinicFlow ERP yuklanmoqda...</div></div></div>'''
    if 'cf-loader' not in html:
        html = re.sub(r'(<body[^>]*>)', r'\1' + loader_html, html, count=1)
    
    # Add app.js before </body>
    if 'assets/app.js' not in html:
        html = html.replace('</body>', '    <script src="/assets/app.js?v=20260821"></script>\n</body>')
    
    # Hide loader when page loads
    hide_loader_script = '''
    <script>
        window.addEventListener('load', function() {
            setTimeout(function() {
                var loader = document.getElementById('cf-loader');
                if (loader) {
                    loader.classList.add('hidden');
                    setTimeout(function() { loader.remove(); }, 350);
                }
            }, 200);
        });
    </script>
'''
    if 'cf-loader' not in html or 'hide_loader_script' not in html:
        if 'loader.classList.add' not in html:
            html = html.replace('</body>', f'{hide_loader_script}</body>')
    
    return html


def main():
    html_files = sorted(DIST_DIR.glob('*.html'))
    print(f'Processing {len(html_files)} HTML files...\n')
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        original = content
        
        # 1. Fix all href="#" links
        content = fix_anchor_links(content)
        
        # 2. Inject assets (CSS, JS, loader, title, lang)
        content = inject_assets(content, html_file.name)
        
        if content != original:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'  ✓ {html_file.name}')
        else:
            print(f'  - {html_file.name}: no changes')


def fix_anchor_links(html):
    """Fix all <a href="#"> tags - check both icon and text."""
    def fix_link(match):
        full = match.group(0)
        # Look for icon name inside the <a> tag
        icon_match = re.search(r'<span class="material-symbols-outlined"[^>]*>([^<]+)</span>', full)
        if icon_match:
            icon_name = icon_match.group(1).strip().lower()
            if icon_name in ICON_TO_URL:
                url = ICON_TO_URL[icon_name]
                return full.replace('href="#"', f'href="{url}"')
        # Look for plain text content (strip HTML tags)
        inner_html_match = re.search(r'<a[^>]*>(.*?)</a>', full, re.DOTALL)
        if inner_html_match:
            inner_text = re.sub(r'<[^>]+>', '', inner_html_match.group(1)).strip().lower()
            for text_key, url in TEXT_TO_URL.items():
                if text_key in inner_text:
                    return full.replace('href="#"', f'href="{url}"')
        return full
    
    return re.sub(r'<a[^>]*href="#"[^>]*>.*?</a>', fix_link, html, flags=re.DOTALL)


if __name__ == '__main__':
    main()
