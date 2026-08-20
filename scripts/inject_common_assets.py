#!/usr/bin/env python3
"""Inject common.css and common.js into all HTML files.
Also fix titles to be 100% Uzbek.
Add loader overlay at top of body to prevent flicker.
"""

import os
import re
from pathlib import Path

DIST_DIR = Path('/home/z/my-project/clinicpro-deploy/dist')

# Page-specific Uzbek titles
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

# English text -> Uzbek translation (for body content)
TRANSLATIONS = {
    # Sidebar/Navigation
    'Dashboard': 'Boshqaruv paneli',
    'Patients': 'Bemorlar',
    'Medical Records': 'Tibbiy qaydlar',
    'Schedule': 'Davolash jadvali',
    'Billing': 'Kassa',
    'Inventory': 'Inventar',
    'Reports': 'Hisobotlar',
    'Analytics': 'Tahlil',
    'Settings': 'Sozlamalar',
    'Logout': 'Chiqish',
    'Login': 'Kirish',
    'Sign In': 'Tizimga kirish',
    'Register': 'Ro\'yxatdan o\'tish',
    'Overview': 'Ko\'rinish',
    'Queue': 'Navbat',
    'Network Overview': 'Tarmoq ko\'rinishi',
    'Patient Intake Volume': 'Bemor qabul qilish hajmi',
    'Switch Clinic': 'Klinikani o\'zgartirish',
    'System Status': 'Tizim holati',
    'Clinic Settings': 'Klinika sozlamalari',

    # Buttons
    'Add New': 'Yangi qo\'shish',
    'Create': 'Yaratish',
    'Edit': 'Tahrirlash',
    'Delete': 'O\'chirish',
    'Save': 'Saqlash',
    'Cancel': 'Bekor qilish',
    'Submit': 'Tasdiqlash',
    'Close': 'Yopish',
    'Print': 'Chop etish',
    'Export': 'Eksport',
    'View All': 'Hammasini ko\'rish',
    'View Details': 'Tafsilotlar',
    'Search': 'Qidirish',
    'Filter': 'Filtr',
    'Back': 'Orqaga',
    'Next': 'Keyingi',
    'Previous': 'Oldingi',
    'Refresh': 'Yangilash',
    'Download': 'Yuklab olish',
    'Upload': 'Yuklash',

    # Forms
    'Name': 'Ism',
    'Phone': 'Telefon',
    'Email': 'Email',
    'Address': 'Manzil',
    'Date': 'Sana',
    'Time': 'Vaqt',
    'Status': 'Holat',
    'Action': 'Amal',
    'Total': 'Jami',
    'Amount': 'Summa',
    'Price': 'Narx',
    'Quantity': 'Miqdor',
    'Subtotal': 'Oraliq summa',
    'Discount': 'Chegirma',
    'Payment': 'To\'lov',
    'Payment Method': 'To\'lov usuli',
    'Cash': 'Naqd',
    'Card': 'Karta',
    'Receipt': 'Chek',
    'Invoice': 'Hisob-faktura',
    'Patient Name': 'Bemor ismi',
    'Doctor Name': 'Shifokor ismi',
    'Department': 'Bo\'lim',
    'Ward': 'Palata',
    'Room': 'Xona',
    'Doctor': 'Shifokor',
    'Nurse': 'Hamshira',
    'Specialty': 'Mutaxassislik',
    'Diagnosis': 'Diagnoz',
    'Treatment': 'Davolash',
    'Medicine': 'Dori',
    'Prescription': 'Retsept',

    # Status
    'Active': 'Faol',
    'Inactive': 'Nofaol',
    'Pending': 'Kutilmoqda',
    'Completed': 'Tugatilgan',
    'Cancelled': 'Bekor qilingan',
    'Approved': 'Tasdiqlangan',
    'Waiting': 'Kutmoqda',
    'In Progress': 'Jarayonda',
    'Done': 'Bajarildi',

    # Days of week
    'Monday': 'Dushanba',
    'Tuesday': 'Seshanba',
    'Wednesday': 'Chorshanba',
    'Thursday': 'Payshanba',
    'Friday': 'Juma',
    'Saturday': 'Shanba',
    'Sunday': 'Yakshanba',
    'Mon': 'Dush',
    'Tue': 'Sesh',
    'Wed': 'Chor',
    'Thu': 'Pay',
    'Fri': 'Jum',
    'Sat': 'Shan',
    'Sun': 'Yak',

    # Page-specific
    'Clinic Management Dashboard': 'Klinika Boshqaruv Paneli',
    "Doctor's Consultation Room": 'Shifokor Konsultatsiya Xonasi',
    'Patient Medical Record': 'Bemor Tibbiy Qaydi',
    'Billing and Finance Dashboard': 'Kassa va Moliyaviy Boshqaruv',
    'East Park Center': 'Sharqiy Park Markazi',
    'Main City Clinic': 'Shahar Asosiy Klinikasi',
    'Northwood Branch': 'Shimoliy tarmoq',
    'South Terminal': 'Janubiy Terminal',
    'Patient Invoice': 'Bemor hisob-fakturasi',
    'Loading...': 'Yuklanmoqda...',
    'No data': 'Ma\'lumot yo\'q',
    'No results found': 'Natija topilmadi',
    'Today': 'Bugun',
    'Yesterday': 'Kecha',
    'This Week': 'Shu hafta',
    'This Month': 'Shu oy',
    'This Year': 'Shu yil',
    'All': 'Hammasi',
    'Yes': 'Ha',
    'No': 'Yo\'q',
    'OK': 'OK',
    'Confirm': 'Tasdiqlash',
    'Are you sure?': 'Ishonchingiz komilmi?',
}

def translate_text(text):
    """Translate text node content if English equivalent found."""
    trimmed = text.strip()
    if not trimmed or len(trimmed) > 80:
        return text
    if trimmed in TRANSLATIONS:
        # Preserve leading/trailing whitespace
        leading = text[:len(text) - len(text.lstrip())]
        trailing = text[len(text.rstrip()):]
        return leading + TRANSLATIONS[trimmed] + trailing
    return text

def process_html(content, filename):
    """Process one HTML file: update title, add common.css/js, translate, add loader."""
    # 1. Update title
    if filename in TITLE_MAP:
        new_title = TITLE_MAP[filename]
        content = re.sub(
            r'<title>[^<]*</title>',
            f'<title>{new_title}</title>',
            content,
            count=1,
        )

    # 2. Add common.css before </head>
    css_link = '<link rel="stylesheet" href="/common.css?v=20260820">'
    if 'common.css' not in content:
        content = content.replace('</head>', f'    {css_link}\n</head>')

    # 3. Add loader overlay at start of body
    loader_html = '''<div id="cf-loader"><div><div class="spinner"></div><div class="text">ClinicFlow ERP yuklanmoqda...</div></div></div>'''
    if 'cf-loader' not in content:
        content = re.sub(
            r'(<body[^>]*>)',
            r'\1' + loader_html,
            content,
            count=1,
        )

    # 4. Add common.js before </body>
    js_link = '<script src="/common.js?v=20260820"></script>'
    if 'common.js' not in content:
        content = content.replace('</body>', f'    {js_link}\n</body>')

    # 5. Add lang attribute
    content = re.sub(r'<html(?![^>]*lang=)', '<html lang="uz"', content, count=1)

    # 6. Translate English text in body
    # Use TreeWalker-like approach with regex
    def replace_text_node(match):
        full_match = match.group(0)
        # Get text content between > and <
        text = match.group(1)
        translated = translate_text(text)
        return f'>{translated}<'

    # Only translate text between tags (not inside script/style/attributes)
    # Skip script and style blocks
    parts = re.split(r'(<script[^>]*>.*?</script>|<style[^>]*>.*?</style>)', content, flags=re.DOTALL)
    for i, part in enumerate(parts):
        if i % 2 == 0:  # Not inside script/style
            parts[i] = re.sub(r'>([^<>{}]+)<', replace_text_node, part)
    content = ''.join(parts)

    return content

def main():
    html_files = sorted(DIST_DIR.glob('*.html'))
    print(f'Processing {len(html_files)} HTML files...\n')

    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            original = f.read()

        updated = process_html(original, html_file.name)

        if updated != original:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(updated)
            print(f'  ✓ {html_file.name}: title + css + js + loader + translations')
        else:
            print(f'  - {html_file.name}: no changes needed')

if __name__ == '__main__':
    main()
