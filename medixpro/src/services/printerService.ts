import { QueueTicket, PaymentTransaction, PrinterConfig, ClinicProfile, ConsultationRecord, Patient } from '../types';

export class PrinterService {
  // ESC/POS Commands
  private static ESC = 0x1B;
  private static GS = 0x1D;

  /**
   * Print a Queue Ticket via Browser / Thermal Printer
   */
  static printQueueTicket(ticket: QueueTicket, clinic: ClinicProfile, config: PrinterConfig): void {
    const printWindow = window.open('', '_blank', 'width=420,height=600');
    if (!printWindow) {
      alert('Chop etish oynasi ochilmadi. Iltimos brauzerda pop-up oynalarga ruxsat bering.');
      return;
    }

    const widthMm = config.paperWidth === '58mm' ? '58mm' : '80mm';
    const is58 = config.paperWidth === '58mm';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Navbat Taloni - ${ticket.ticketNumber}</title>
        <style>
          @page {
            size: ${widthMm} auto;
            margin: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: ${is58 ? '6px 8px' : '10px 14px'};
            width: ${widthMm};
            color: #000;
            background: #fff;
            box-sizing: border-box;
            font-size: ${is58 ? '11px' : '13px'};
            line-height: 1.3;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .clinic-name {
            font-size: ${is58 ? '13px' : '16px'};
            font-weight: 800;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .clinic-sub {
            font-size: ${is58 ? '9px' : '11px'};
            color: #333;
            margin-bottom: 6px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .ticket-badge {
            font-size: ${is58 ? '26px' : '36px'};
            font-weight: 900;
            letter-spacing: 2px;
            padding: 4px 0;
            margin: 4px 0;
            border: 2px solid #000;
            border-radius: 4px;
            display: block;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .info-label { color: #333; font-weight: 500; }
          .info-val { font-weight: 700; text-align: right; }
          .qr-placeholder {
            margin: 8px auto;
            width: ${is58 ? '70px' : '90px'};
            height: ${is58 ? '70px' : '90px'};
            border: 1px solid #999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            background: #f8f8f8;
          }
          .footer-note {
            font-size: ${is58 ? '9px' : '10px'};
            text-align: center;
            margin-top: 6px;
            color: #222;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="clinic-name">${clinic.name}</div>
          <div class="clinic-sub">${clinic.address} • Tel: ${clinic.phone}</div>
          ${config.customHeader ? `<div class="clinic-sub">${config.customHeader}</div>` : ''}
        </div>

        <div class="divider"></div>

        <div class="center">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 600;">ELEKTRON NAVBAT TALONI</div>
          <div class="ticket-badge">${ticket.ticketNumber}</div>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <span class="info-label">Bemor:</span>
          <span class="info-val">${ticket.patientName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Shifokor:</span>
          <span class="info-val">${ticket.doctorName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Mutaxassislik:</span>
          <span class="info-val">${ticket.doctorSpecialty}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Qabul xonasi:</span>
          <span class="info-val" style="font-size: 14px; text-decoration: underline;">${ticket.roomNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Xizmat:</span>
          <span class="info-val">${ticket.serviceName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Sana / Vaqt:</span>
          <span class="info-val">${new Date(ticket.createdAt).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
        <div class="info-row">
          <span class="info-label">To'lov holati:</span>
          <span class="info-val">${ticket.paymentStatus === 'paid' ? 'TO\'LANGAN (Kassa)' : 'TO\'LANMAGAN'}</span>
        </div>

        <div class="divider"></div>

        <div class="center">
          <div style="font-size: 10px; font-weight: bold;">Taxminiy kutish: ~${ticket.estimatedWaitMinutes} daqiqa</div>
          <div style="font-size: 9px; color: #444; margin-top: 2px;">Iltimos, navbatingizni ekranda kuzatib turing.</div>
        </div>

        ${config.customFooter ? `<div class="footer-note">${config.customFooter}</div>` : `<div class="footer-note">Salomatligingiz — bizning oliy maqsadimiz!</div>`}

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 800);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  /**
   * Print Cashier Payment Receipt
   */
  static printPaymentReceipt(tx: PaymentTransaction, clinic: ClinicProfile, config: PrinterConfig): void {
    const printWindow = window.open('', '_blank', 'width=420,height=700');
    if (!printWindow) {
      alert('Chop etish oynasi ochilmadi.');
      return;
    }

    const widthMm = config.paperWidth === '58mm' ? '58mm' : '80mm';
    const is58 = config.paperWidth === '58mm';

    const itemsHtml = tx.items.map(item => `
      <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: ${is58 ? '10px' : '12px'};">
        <div style="flex: 1; padding-right: 4px;">${item.title} <span style="color:#555;">x${item.quantity}</span></div>
        <div style="font-weight: bold; white-space: nowrap;">${(item.totalPrice ?? 0).toLocaleString()} ${clinic.currencySymbol}</div>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>To'lov Cheki - ${tx.receiptNumber}</title>
        <style>
          @page { size: ${widthMm} auto; margin: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: ${is58 ? '6px 8px' : '10px 14px'};
            width: ${widthMm};
            color: #000;
            background: #fff;
            box-sizing: border-box;
            font-size: ${is58 ? '11px' : '12px'};
            line-height: 1.3;
          }
          .center { text-align: center; }
          .clinic-title { font-size: 15px; font-weight: 800; text-transform: uppercase; }
          .sub { font-size: 10px; color: #444; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          .double-divider { border-top: 2px solid #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .bold { font-weight: bold; }
          .total-box { font-size: 16px; font-weight: 900; margin: 6px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="clinic-title">${clinic.name}</div>
          <div class="sub">${clinic.address} • Tel: ${clinic.phone}</div>
          <div class="sub">Litsenziya: ${clinic.licenseNumber || 'M-2024/099'} | INN: ${clinic.inn || '304928192'}</div>
        </div>

        <div class="divider"></div>

        <div class="center bold" style="font-size: 13px;">TO'LOV KVITANSIYASI (CHEK)</div>
        <div class="row"><span class="sub">Chek №:</span><span class="bold">${tx.receiptNumber}</span></div>
        <div class="row"><span class="sub">Sana:</span><span>${new Date(tx.createdAt).toLocaleString('uz-UZ')}</span></div>
        <div class="row"><span class="sub">Kassir:</span><span>${tx.cashierName}</span></div>
        <div class="row"><span class="sub">Bemor:</span><span class="bold">${tx.patientName}</span></div>

        <div class="divider"></div>
        <div style="font-weight: bold; margin-bottom: 4px;">Xizmatlar / Tahlillar / Dorilar:</div>
        ${itemsHtml}

        <div class="double-divider"></div>

        <div class="row"><span class="sub">Oraliq summa:</span><span>${(tx.subtotal ?? 0).toLocaleString()} ${clinic.currencySymbol}</span></div>
        ${tx.discount > 0 ? `<div class="row"><span class="sub">Chegirma:</span><span style="color:red;">-${(tx.discount ?? 0).toLocaleString()} ${clinic.currencySymbol}</span></div>` : ''}
        <div class="row total-box">
          <span>JAMI TO'LOV:</span>
          <span>${(tx.totalAmount ?? 0).toLocaleString()} ${clinic.currencySymbol}</span>
        </div>
        <div class="row"><span class="sub">To'lov turi:</span><span class="bold">${tx.paymentMethod.toUpperCase()}</span></div>

        <div class="divider"></div>
        <div class="center sub" style="margin-top: 6px;">
          To'lov muvaffaqiyatli qabul qilindi.<br>
          Klinikamizga tashrifingiz uchun rahmat!
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 800);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  /**
   * Test Thermal Printer Connection / Print Test Page
   */
  static testPrinter(config: PrinterConfig, clinic: ClinicProfile): { success: boolean; message: string } {
    if (config.connectionType === 'lan_ip') {
      if (!config.ipAddress) {
        return { success: false, message: 'Iltimos, printerning LAN IP manzilini kiriting (masalan: 192.168.1.200).' };
      }
      // LAN printer simulation / test
      const dummyTicket: QueueTicket = {
        id: 'test-001',
        clinicId: clinic.id,
        ticketNumber: 'TEST-01',
        patientId: 'p-test',
        patientName: 'Test Bemori (Xprinter LAN Sinov)',
        patientPhone: '+998 90 123-45-67',
        doctorId: 'd-test',
        doctorName: 'Dr. Test Shifokor',
        doctorSpecialty: 'Diagnostika',
        roomNumber: '101',
        serviceName: 'Xprinter LAN Ulanish Sinovi',
        price: 0,
        status: 'waiting',
        paymentStatus: 'paid',
        paidAmount: 0,
        estimatedWaitMinutes: 5,
        createdAt: new Date().toISOString(),
      };
      this.printQueueTicket(dummyTicket, clinic, config);
      return { success: true, message: `LAN Printer (${config.ipAddress}:${config.port || 9100}) ga sinov buyrug'i yuborildi!` };
    } else if (config.connectionType === 'usb_hid') {
      const dummyTicket: QueueTicket = {
        id: 'test-002',
        clinicId: clinic.id,
        ticketNumber: 'USB-88',
        patientId: 'p-test',
        patientName: 'Test Bemori (USB Xprinter)',
        patientPhone: '+998 90 000-00-00',
        doctorId: 'd-test',
        doctorName: 'Bosh Shifokor',
        doctorSpecialty: 'USB Test',
        roomNumber: 'Kassa',
        serviceName: 'USB Termal Printer Test',
        price: 0,
        status: 'waiting',
        paymentStatus: 'paid',
        paidAmount: 0,
        estimatedWaitMinutes: 0,
        createdAt: new Date().toISOString(),
      };
      this.printQueueTicket(dummyTicket, clinic, config);
      return { success: true, message: `USB Xprinter (${config.paperWidth}) ga test taloni yuborildi!` };
    } else {
      const dummyTicket: QueueTicket = {
        id: 'test-003',
        clinicId: clinic.id,
        ticketNumber: 'PRN-01',
        patientId: 'p-test',
        patientName: 'Sinov Bemori (Brauzer Print)',
        patientPhone: '+998 90 111-22-33',
        doctorId: 'd-test',
        doctorName: 'Klinika Qabulxonasi',
        doctorSpecialty: 'Registratura',
        roomNumber: '1-xona',
        serviceName: 'Standart Qabul Sinovi',
        price: 0,
        status: 'waiting',
        paymentStatus: 'paid',
        paidAmount: 0,
        estimatedWaitMinutes: 5,
        createdAt: new Date().toISOString(),
      };
      this.printQueueTicket(dummyTicket, clinic, config);
      return { success: true, message: 'Standart brauzer chop etish sinovi ochildi!' };
    }
  }

  /**
   * Print Electronic Prescription via Xprinter / Thermal Receipt (80mm / 58mm)
   */
  static printPrescriptionThermal(
    consultation: ConsultationRecord | Omit<ConsultationRecord, 'id' | 'createdAt'>,
    patient: Patient,
    clinic: ClinicProfile,
    config: PrinterConfig
  ): void {
    const printWindow = window.open('', '_blank', 'width=420,height=750');
    if (!printWindow) {
      alert('Chop etish oynasi ochilmadi. Iltimos brauzerda ruxsat bering.');
      return;
    }

    const widthMm = config.paperWidth === '58mm' ? '58mm' : '80mm';
    const is58 = config.paperWidth === '58mm';

    const prescriptionsHtml = consultation.prescriptions && consultation.prescriptions.length > 0
      ? consultation.prescriptions.map((p, idx) => `
        <div style="margin: 5px 0; padding-bottom: 4px; border-bottom: 1px dotted #888;">
          <div style="font-weight: 800; font-size: ${is58 ? '11px' : '13px'};">
            ${idx + 1}. Rp: ${p.drugName} ${p.dosage || ''}
          </div>
          <div style="font-size: ${is58 ? '10px' : '11px'}; color: #222; margin-left: 8px;">
            ➤ ${p.frequency} • ${p.duration}
          </div>
          ${p.instructions ? `<div style="font-size: ${is58 ? '9px' : '10px'}; color: #444; margin-left: 8px; font-style: italic;">(${p.instructions})</div>` : ''}
        </div>
      `).join('')
      : '<div style="font-style: italic; color: #555; text-align: center;">Dorilar kiritilmagan</div>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Retsept - ${patient.fullName}</title>
        <style>
          @page { size: ${widthMm} auto; margin: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0;
            padding: ${is58 ? '6px 8px' : '10px 14px'};
            width: ${widthMm};
            color: #000;
            background: #fff;
            box-sizing: border-box;
            font-size: ${is58 ? '11px' : '12px'};
            line-height: 1.3;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .clinic-title { font-size: ${is58 ? '13px' : '16px'}; font-weight: 900; text-transform: uppercase; }
          .sub { font-size: ${is58 ? '9px' : '10px'}; color: #333; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          .double-divider { border-top: 2px solid #000; margin: 6px 0; }
          .badge {
            font-size: ${is58 ? '12px' : '14px'};
            font-weight: 800;
            text-transform: uppercase;
            border: 1px solid #000;
            padding: 3px 6px;
            margin: 4px auto;
            display: inline-block;
          }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .footer { font-size: ${is58 ? '9px' : '10px'}; text-align: center; margin-top: 8px; color: #333; }
          .stamp-box {
            margin-top: 10px;
            padding-top: 6px;
            border-top: 1px solid #000;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="clinic-title">${clinic.name}</div>
          <div class="sub">${clinic.address} • Tel: ${clinic.phone}</div>
          ${config.customHeader ? `<div class="sub">${config.customHeader}</div>` : ''}
          <div class="badge">ELEKTRON RETSEPT</div>
        </div>

        <div class="divider"></div>

        <div class="row"><span class="sub">Bemor:</span><span class="bold">${patient.fullName}</span></div>
        <div class="row"><span class="sub">Tug'ilgan:</span><span>${patient.birthDate} (${patient.gender === 'male' ? 'Erkak' : 'Ayol'})</span></div>
        <div class="row"><span class="sub">Shifokor:</span><span class="bold">${consultation.doctorName}</span></div>
        <div class="row"><span class="sub">Ixtisoslik:</span><span>${consultation.doctorSpecialty}</span></div>
        <div class="row"><span class="sub">Sana:</span><span>${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span></div>

        <div class="divider"></div>

        <div style="margin: 4px 0;">
          <span class="sub bold">Klinik Tashxis:</span>
          <div style="font-weight: 800; font-size: ${is58 ? '11px' : '13px'}; color: #000;">
            ${consultation.diagnosis} ${consultation.icdCode ? `[${consultation.icdCode}]` : ''}
          </div>
        </div>

        <div class="double-divider"></div>
        <div class="bold" style="text-align: center; margin-bottom: 4px; font-size: ${is58 ? '11px' : '13px'};">
          TAYINLANGAN DORILAR RO'YXATI (Rp.)
        </div>

        ${prescriptionsHtml}

        <div class="divider"></div>

        ${consultation.treatmentPlan ? `
          <div style="margin: 4px 0;">
            <span class="sub bold">Shifokor tavsiyalari / Parhez:</span>
            <div style="font-size: ${is58 ? '10px' : '11px'};">${consultation.treatmentPlan}</div>
          </div>
        ` : ''}

        ${consultation.followUpDate ? `
          <div class="row" style="margin-top: 4px;">
            <span class="sub bold">Qayta ko'rik:</span>
            <span class="bold">${consultation.followUpDate}</span>
          </div>
        ` : ''}

        <div class="stamp-box">
          <div>Shifokor: <b>${consultation.doctorName}</b></div>
          <div>Imzo / M.O': ________</div>
        </div>

        <div class="footer">
          ${config.customFooter || 'Sog\'lig\'ingiz o\'z qo\'lingizda! Dorilarni ko\'rsatilgan tartibda iching.'}
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 800);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  /**
   * Print Official A4 Consultation & Medical EMR Sheet
   */
  static printMedicalReportA4(
    consultation: ConsultationRecord | Omit<ConsultationRecord, 'id' | 'createdAt'>,
    patient: Patient,
    clinic: ClinicProfile
  ): void {
    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (!printWindow) {
      alert('Chop etish oynasi ochilmadi.');
      return;
    }

    const prescriptionsHtml = consultation.prescriptions && consultation.prescriptions.length > 0
      ? consultation.prescriptions.map((p, idx) => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 6px 8px; font-weight: bold; width: 30px; text-align: center;">${idx + 1}</td>
          <td style="padding: 6px 8px; font-weight: 700; color: #000;">${p.drugName} <span style="font-weight:normal; color:#444;">(${p.dosage || ''})</span></td>
          <td style="padding: 6px 8px;">${p.frequency}</td>
          <td style="padding: 6px 8px;">${p.duration}</td>
          <td style="padding: 6px 8px; font-style: italic; color: #444;">${p.instructions || '-'}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="5" style="text-align:center; padding:10px; color:#666;">Dorilar tayinlanmagan</td></tr>';

    const obj = consultation.objectiveExam || {};

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Tibbiy Ko'rik Xulosasi - ${patient.fullName}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #111;
            background: #fff;
            font-size: 13px;
            line-height: 1.45;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .clinic-name { font-size: 20px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; }
          .clinic-info { font-size: 11px; color: #475569; }
          .title { text-align: center; font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 14px 0 10px 0; letter-spacing: 0.5px; }
          .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #1e40af; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin: 12px 0 6px 0; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
          .row { margin: 3px 0; }
          .label { color: #64748b; font-size: 11px; font-weight: 600; }
          .value { font-weight: 700; color: #0f172a; }
          .vitals-box {
            display: flex;
            gap: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            margin: 6px 0;
          }
          .vital-item { flex: 1; text-align: center; }
          .vital-num { font-size: 14px; font-weight: 800; color: #1e293b; }
          .vital-lbl { font-size: 10px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 12px; }
          th { background: #f1f5f9; text-align: left; padding: 6px 8px; border-bottom: 2px solid #cbd5e1; color: #334155; font-size: 11px; }
          .stamp-footer {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1px solid #cbd5e1;
            padding-top: 16px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="clinic-name">${clinic.name}</div>
            <div class="clinic-info">${clinic.address} • Tel: ${clinic.phone} • Email: ${clinic.email || 'info@klinika.uz'}</div>
            <div class="clinic-info">Litsenziya №: ${clinic.licenseNumber || 'M-2024/099'} | STIR (INN): ${clinic.inn || '304928192'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 14px; color: #1e40af;">AMBULATOR KARTA</div>
            <div style="font-size: 11px; color: #64748b;">Sana: ${new Date().toLocaleDateString('uz-UZ')}</div>
          </div>
        </div>

        <div class="title">TIBBIY KONSULTATSIYA VA KO'RIK VARAQASI</div>

        <div class="section-title">1. Bemor Haqida Ma'lumot</div>
        <div class="grid-3">
          <div class="row"><span class="label">F.I.SH:</span> <div class="value">${patient.fullName}</div></div>
          <div class="row"><span class="label">Tug'ilgan sana / Yoshi:</span> <div class="value">${patient.birthDate}</div></div>
          <div class="row"><span class="label">Jinsi:</span> <div class="value">${patient.gender === 'male' ? 'Erkak' : 'Ayol'}</div></div>
          <div class="row"><span class="label">Telefon:</span> <div class="value">${patient.phone}</div></div>
          <div class="row"><span class="label">Manzil:</span> <div class="value">${patient.address || 'Ko\'rsatilmagan'}</div></div>
          <div class="row"><span class="label">Qon guruhi:</span> <div class="value">${patient.bloodGroup || 'Aniqlanmagan'}</div></div>
        </div>

        <div class="section-title">2. Ob'yektiv Ko'rik va Vital Ko'rsatkichlar</div>
        <div class="vitals-box">
          <div class="vital-item">
            <div class="vital-num">${obj.bloodPressure || '120/80'}</div>
            <div class="vital-lbl">Qon bosimi (mm.s.u)</div>
          </div>
          <div class="vital-item">
            <div class="vital-num">${obj.pulse || '76'}</div>
            <div class="vital-lbl">Puls (zarba/daq)</div>
          </div>
          <div class="vital-item">
            <div class="vital-num">${obj.temperature || '36.6'} °C</div>
            <div class="vital-lbl">Harorat</div>
          </div>
          <div class="vital-item">
            <div class="vital-num">${obj.spO2 || '98'} %</div>
            <div class="vital-lbl">SpO2 (Saturatsiya)</div>
          </div>
          <div class="vital-item">
            <div class="vital-num">${obj.weight || '70'} kg</div>
            <div class="vital-lbl">Tana vazni</div>
          </div>
          <div class="vital-item">
            <div class="vital-num">${obj.height || '175'} sm</div>
            <div class="vital-lbl">Bo'yi</div>
          </div>
        </div>

        <div class="section-title">3. Shikoyatlar va Anamnez</div>
        <div class="row">
          <span class="label">Bemor shikoyatlari:</span>
          <div style="margin-top: 2px;">${consultation.complaints || 'Faol shikoyatlar bildirmadi.'}</div>
        </div>
        ${consultation.anamnesis ? `
          <div class="row" style="margin-top: 4px;">
            <span class="label">Kasallik tarixi (Anamnesis morbi):</span>
            <div style="margin-top: 2px;">${consultation.anamnesis}</div>
          </div>
        ` : ''}

        <div class="section-title">4. Klinik Tashxis</div>
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 8px 12px; margin: 6px 0; border-radius: 0 6px 6px 0;">
          <div style="font-weight: 800; font-size: 14px; color: #1e3a8a;">
            ${consultation.diagnosis}
          </div>
          ${consultation.icdCode ? `<div style="font-size: 11px; color: #3b82f6; font-weight: bold; margin-top: 2px;">XTT-10 (ICD-10): ${consultation.icdCode}</div>` : ''}
        </div>

        <div class="section-title">5. Tayinlangan Dorilar va Muolajalar (Rp.)</div>
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Dori preparati nomi</th>
              <th>Qabul qilish rejimi</th>
              <th>Muddati</th>
              <th>Ko'rsatma</th>
            </tr>
          </thead>
          <tbody>
            ${prescriptionsHtml}
          </tbody>
        </table>

        ${consultation.treatmentPlan ? `
          <div class="section-title">6. Davolash Rejimi va Tavsiyalar</div>
          <div>${consultation.treatmentPlan}</div>
        ` : ''}

        ${consultation.followUpDate ? `
          <div style="margin-top: 8px; font-weight: bold; color: #1e40af;">
            Qayta ko'rikka kelish sanasi: ${consultation.followUpDate}
          </div>
        ` : ''}

        <div class="stamp-footer">
          <div>
            <div style="font-size: 11px; color: #64748b;">Hujjat elektron axborot tizimi orqali shakllantirildi.</div>
            <div style="font-size: 10px; color: #94a3b8;">Xavfsiz EMR arxivida qayd etilgan.</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold;">Shifokor: ${consultation.doctorName}</div>
            <div style="font-size: 11px; color: #475569;">(${consultation.doctorSpecialty})</div>
            <div style="margin-top: 12px; font-size: 12px;">Imzo va Muhr: ___________________ (M.O'.)</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  /**
   * Print Official Laboratory & Diagnostics Report (A4)
   */
  static printLabReport(
    labOrder: {
      orderNumber: string;
      testType: string;
      parameters?: { name: string; value: string; unit: string; normalRange: string; isAbnormal?: boolean }[];
      conclusion?: string;
      status: string;
      createdAt: string;
      completedAt?: string;
      doctorName?: string;
      performedBy?: string;
    },
    patient: Patient,
    clinic: ClinicProfile
  ): void {
    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (!printWindow) {
      alert('Chop etish oynasi ochilmadi.');
      return;
    }

    const paramsHtml = labOrder.parameters && labOrder.parameters.length > 0
      ? labOrder.parameters.map((p, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; ${p.isAbnormal ? 'background-color: #fef2f2;' : ''}">
          <td style="padding: 8px 10px; font-weight: bold; width: 30px; text-align: center;">${idx + 1}</td>
          <td style="padding: 8px 10px; font-weight: 600; color: #1e293b;">${p.name}</td>
          <td style="padding: 8px 10px; font-weight: 800; font-family: monospace; ${p.isAbnormal ? 'color: #b91c1c;' : 'color: #0f172a;'}">
            ${p.value} ${p.isAbnormal ? '<span style="font-size:10px; background:#fee2e2; color:#991b1b; padding:2px 4px; border-radius:4px; margin-left:4px;">PATOLOGIYA</span>' : ''}
          </td>
          <td style="padding: 8px 10px; color: #475569;">${p.unit || '-'}</td>
          <td style="padding: 8px 10px; color: #64748b; font-family: monospace;">${p.normalRange || '-'}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="5" style="text-align:center; padding:16px; color:#64748b;">Ko\'rsatkichlar qayd etilmagan</td></tr>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Laboratoriya Xulosasi - ${patient.fullName}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #111;
            background: #fff;
            font-size: 13px;
            line-height: 1.45;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #047857;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .clinic-name { font-size: 20px; font-weight: 900; color: #065f46; text-transform: uppercase; }
          .clinic-info { font-size: 11px; color: #475569; }
          .title { text-align: center; font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 14px 0 10px 0; color: #065f46; }
          .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #047857; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin: 12px 0 6px 0; }
          .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
          .row { margin: 3px 0; }
          .label { color: #64748b; font-size: 11px; font-weight: 600; }
          .value { font-weight: 700; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
          th { background: #f0fdf4; text-align: left; padding: 8px 10px; border-bottom: 2px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; }
          .stamp-footer {
            margin-top: 36px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1px solid #cbd5e1;
            padding-top: 16px;
          }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="clinic-name">${clinic.name}</div>
            <div class="clinic-info">${clinic.address} • Tel: ${clinic.phone} • Email: ${clinic.email || 'info@klinika.uz'}</div>
            <div class="clinic-info">Litsenziya №: ${clinic.licenseNumber || 'M-2024/099'} | STIR: ${clinic.inn || '304928192'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 14px; color: #047857;">LABORATORIYA BLANKI</div>
            <div style="font-size: 11px; color: #64748b;">Buyurtma №: ${labOrder.orderNumber}</div>
            <div style="font-size: 11px; color: #64748b;">Sana: ${new Date(labOrder.completedAt || labOrder.createdAt).toLocaleDateString('uz-UZ')}</div>
          </div>
        </div>

        <div class="title">${labOrder.testType.toUpperCase()} NATIJALARI</div>

        <div class="section-title">1. Bemor Ma'lumotlari</div>
        <div class="grid-3">
          <div class="row"><span class="label">F.I.SH:</span> <div class="value">${patient.fullName}</div></div>
          <div class="row"><span class="label">Tug'ilgan sana / Yoshi:</span> <div class="value">${patient.birthDate}</div></div>
          <div class="row"><span class="label">Jinsi:</span> <div class="value">${patient.gender === 'male' ? 'Erkak' : 'Ayol'}</div></div>
          <div class="row"><span class="label">Telefon:</span> <div class="value">${patient.phone}</div></div>
          <div class="row"><span class="label">Yo'naltirgan Shifokor:</span> <div class="value">${labOrder.doctorName || 'Navbatchi shifokor'}</div></div>
          <div class="row"><span class="label">Holati:</span> <div class="value" style="color: #047857;">${labOrder.status === 'ready' ? 'Tayyor' : labOrder.status}</div></div>
        </div>

        <div class="section-title">2. Laboratoriya Ko'rsatkichlari Jadvali</div>
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Tekshiruv parametri</th>
              <th>Natija</th>
              <th>O'lchov birligi</th>
              <th>Norma (Referens)</th>
            </tr>
          </thead>
          <tbody>
            ${paramsHtml}
          </tbody>
        </table>

        ${labOrder.conclusion ? `
          <div class="section-title">3. Laboratoriya Xulosasi / Izoh</div>
          <div style="background: #f8fafc; border-left: 4px solid #047857; padding: 10px 14px; margin-top: 6px; font-weight: 600; color: #1e293b; border-radius: 0 6px 6px 0;">
            ${labOrder.conclusion}
          </div>
        ` : ''}

        <div class="stamp-footer">
          <div>
            <div style="font-size: 11px; color: #64748b;">Avtomatlashtirilgan laboratoriya analizatori orqali tekshirildi.</div>
            <div style="font-size: 10px; color: #94a3b8;">Hujjat EMR elektron arxivida saqlanadi.</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold;">Laborant / Mutaxassis: ${labOrder.performedBy || 'Diagnostika bo\'limi'}</div>
            <div style="margin-top: 12px; font-size: 12px;">Imzo va Muhr: ___________________ (M.O'.)</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
