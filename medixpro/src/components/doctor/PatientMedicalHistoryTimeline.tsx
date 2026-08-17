import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  FileText, 
  Printer, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  HeartPulse, 
  Receipt, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  SlidersHorizontal,
  ArrowUpDown,
  User,
  Heart,
  Thermometer,
  Weight,
  HelpCircle,
  Eye,
  CalendarRange,
  X,
  RotateCcw,
  Tag
} from 'lucide-react';
import { 
  Patient, 
  ConsultationRecord, 
  LabTestOrder, 
  PaymentTransaction, 
  ClinicProfile, 
  PrinterConfig 
} from '../../types';
import { PrinterService } from '../../services/printerService';

export interface MedicalTimelineItem {
  id: string;
  date: string;
  timestamp: number;
  type: 'consultation' | 'lab_result' | 'pharmacy_order';
  title: string;
  subtitle: string;
  code?: string;
  statusBadge?: {
    label: string;
    variant: 'success' | 'warning' | 'info' | 'danger';
  };
  authorName: string;
  authorRole?: string;
  isAbnormal?: boolean;
  consultationData?: ConsultationRecord;
  labData?: LabTestOrder;
  transactionData?: PaymentTransaction;
}

export type DatePreset = 'all' | 'today' | '7days' | '30days' | '3months' | '1year' | 'custom';

interface PatientMedicalHistoryTimelineProps {
  patient: Patient;
  consultations: ConsultationRecord[];
  labOrders?: LabTestOrder[];
  transactions?: PaymentTransaction[];
  clinic: ClinicProfile;
  printerConfig: PrinterConfig;
  onSelectConsultation?: (consultation: ConsultationRecord) => void;
  compact?: boolean;
  hideHeader?: boolean;
}

export const PatientMedicalHistoryTimeline: React.FC<PatientMedicalHistoryTimelineProps> = ({
  patient,
  consultations = [],
  labOrders = [],
  transactions = [],
  clinic,
  printerConfig,
  onSelectConsultation,
  compact = false,
  hideHeader = false,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'consultations' | 'labs' | 'pharmacy'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Date Range Filter States
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');

  // Filter records belonging specifically to this patient
  const patientConsultations = useMemo(() => {
    return consultations.filter(c => c.patientId === patient.id);
  }, [consultations, patient.id]);

  const patientLabOrders = useMemo(() => {
    return labOrders.filter(l => l.patientId === patient.id);
  }, [labOrders, patient.id]);

  const patientPharmacyTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.patientId === patient.id && 
      (t.items.some(i => i.type === 'pharmacy') || t.receiptNumber.includes('PHARM') || t.receiptNumber.includes('CHEK'))
    );
  }, [transactions, patient.id]);

  // Extract unique doctors for filtering
  const availableDoctors = useMemo(() => {
    const doctors = new Set<string>();
    patientConsultations.forEach(c => {
      if (c.doctorName) doctors.add(c.doctorName);
    });
    return Array.from(doctors);
  }, [patientConsultations]);

  // Combine into unified timeline items
  const timelineItems: MedicalTimelineItem[] = useMemo(() => {
    const items: MedicalTimelineItem[] = [];

    // 1. Consultations
    patientConsultations.forEach(c => {
      items.push({
        id: `consult_${c.id}`,
        date: c.date || c.createdAt || new Date().toISOString(),
        timestamp: new Date(c.date || c.createdAt || Date.now()).getTime(),
        type: 'consultation',
        title: c.diagnosis || 'Klinik Konsultatsiya',
        subtitle: `Shifokor: ${c.doctorName} (${c.doctorSpecialty || 'Terapevt'})`,
        code: c.icdCode,
        statusBadge: {
          label: c.status === 'finalized' ? 'Yakunlangan' : 'Qoralama',
          variant: c.status === 'finalized' ? 'success' : 'warning',
        },
        authorName: c.doctorName,
        authorRole: c.doctorSpecialty,
        consultationData: c,
      });
    });

    // 2. Lab Results
    patientLabOrders.forEach(l => {
      const hasAbnormal = l.parameters?.some(p => p.isAbnormal) || false;
      const statusVariant = l.status === 'ready' ? 'success' : (l.status === 'processing' ? 'warning' : 'info');
      const statusLabel = l.status === 'ready' ? 'Natija Tayyor' : (l.status === 'processing' ? 'Jarayonda' : 'Buyurtirilgan');

      items.push({
        id: `lab_${l.id}`,
        date: l.completedAt || l.createdAt || new Date().toISOString(),
        timestamp: new Date(l.completedAt || l.createdAt || Date.now()).getTime(),
        type: 'lab_result',
        title: l.testType,
        subtitle: `Buyurtma: ${l.orderNumber} • ${l.parameters?.length || 0} ta parametr`,
        code: l.orderNumber,
        statusBadge: {
          label: statusLabel,
          variant: statusVariant,
        },
        authorName: l.performedBy || l.doctorName || 'Laborant',
        authorRole: 'Diagnostika & Laboratoriya',
        isAbnormal: hasAbnormal,
        labData: l,
      });
    });

    // 3. Pharmacy Orders & Sales
    patientPharmacyTransactions.forEach(t => {
      const pharmItems = t.items.filter(i => i.type === 'pharmacy' || t.items.length === 1);
      const firstDrugTitle = pharmItems[0]?.title || 'Dorixona Mahsulotlari';
      const extraCount = pharmItems.length > 1 ? ` (+${pharmItems.length - 1} xil)` : '';

      items.push({
        id: `pharm_${t.id}`,
        date: t.createdAt || new Date().toISOString(),
        timestamp: new Date(t.createdAt || Date.now()).getTime(),
        type: 'pharmacy_order',
        title: `Dorixona: ${firstDrugTitle}${extraCount}`,
        subtitle: `Chek №: ${t.receiptNumber} • ${t.totalAmount.toLocaleString('uz-UZ')} UZS (${t.paymentMethod})`,
        code: t.receiptNumber,
        statusBadge: {
          label: t.status === 'completed' ? 'Berildi' : 'Kutilmoqda',
          variant: t.status === 'completed' ? 'success' : 'info',
        },
        authorName: t.cashierName || 'Farmatsevt',
        authorRole: 'Dorixona / Kassa',
        transactionData: t,
      });
    });

    // Sort chronologically
    return items.sort((a, b) => {
      return sortOrder === 'desc' 
        ? b.timestamp - a.timestamp 
        : a.timestamp - b.timestamp;
    });
  }, [patientConsultations, patientLabOrders, patientPharmacyTransactions, sortOrder]);

  // Selections state for medical history records
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({});

  // Auto-initialize selected items when timelineItems change
  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    timelineItems.forEach(item => {
      initial[item.id] = true;
    });
    setSelectedItemIds(initial);
  }, [timelineItems]);

  const toggleSelectAll = () => {
    const allSelected = filteredTimeline.length > 0 && filteredTimeline.every(item => selectedItemIds[item.id]);
    if (allSelected) {
      setSelectedItemIds({});
    } else {
      const newSelections: Record<string, boolean> = {};
      filteredTimeline.forEach(item => {
        newSelections[item.id] = true;
      });
      setSelectedItemIds(newSelections);
    }
  };

  const handleDownloadPDFReport = () => {
    const selectedItems = filteredTimeline.filter(item => selectedItemIds[item.id]);

    if (selectedItems.length === 0) {
      alert("Iltimos, hisobotga kiritish uchun kamida bitta tibbiy yozuvni tanlang!");
      return;
    }

    const reportWindow = window.open('', '_blank', 'width=900,height=900');
    if (!reportWindow) {
      alert("Chop etish oynasi ochilmadi. Iltimos brauzeringizda qalqib chiquvchi oynalarga (pop-up) ruxsat bering.");
      return;
    }

    const patientAge = patient.birthDate ? (new Date().getFullYear() - new Date(patient.birthDate).getFullYear()) : '—';
    const allergiesText = (patient.allergies && patient.allergies.length > 0) ? patient.allergies.join(', ') : "Yo'q";
    const chronicDiseasesText = (patient.chronicDiseases && patient.chronicDiseases.length > 0) ? patient.chronicDiseases.join(', ') : "Yo'q";

    let itemsHtml = '';
    selectedItems.forEach((item, index) => {
      const dateStr = new Date(item.date).toLocaleString('uz-UZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      if (item.type === 'consultation' && item.consultationData) {
        const c = item.consultationData;
        const vitals = c.objectiveExam || {};
        const prescriptionsHtml = c.prescriptions && c.prescriptions.length > 0
          ? `<table class="report-table">
              <thead>
                <tr>
                  <th style="width: 5%">№</th>
                  <th style="width: 40%">Dori nomi</th>
                  <th style="width: 20%">Doza</th>
                  <th style="width: 20%">Taqsimot</th>
                  <th style="width: 15%">Muddati</th>
                </tr>
              </thead>
              <tbody>
                ${c.prescriptions.map((p, i) => 
                  '<tr>' +
                    '<td>' + (i + 1) + '</td>' +
                    '<td><strong>' + p.drugName + '</strong></td>' +
                    '<td>' + p.dosage + '</td>' +
                    '<td>' + p.frequency + '</td>' +
                    '<td>' + p.duration + '</td>' +
                  '</tr>' +
                  (p.instructions ? '<tr><td colspan="5" class="instructions-row"><em>Qabul qilish sharti:</em> ' + p.instructions + '</td></tr>' : '')
                ).join('')}
              </tbody>
             </table>`
          : '<p class="no-data">Retsept yozilmagan</p>';

        itemsHtml += `
          <div class="record-section">
            <div class="record-header border-consultation">
              <div>
                <span class="badge badge-consultation">Ko'rik / Konsultatsiya</span>
                <span class="record-date">${dateStr}</span>
              </div>
              <div class="record-author">Shifokor: ${c.doctorName} (${c.doctorSpecialty || 'Terapevt'})</div>
            </div>
            
            <div class="grid-2 mt-2">
              <div>
                <h5 class="section-sub">Shikoyatlar:</h5>
                <p class="section-text">${c.complaints || 'Yo\'q'}</p>
                
                <h5 class="section-sub">Anamnez (Kasallik tarixi):</h5>
                <p class="section-text">${c.anamnesis || 'Kiritilmagan'}</p>
              </div>
              <div>
                <h5 class="section-sub">Obyektiv ko'rik (Vitallar):</h5>
                <table class="mini-vitals-table">
                  <tr>
                    <td>Qon bosimi (BP):</td>
                    <td><strong>${vitals.bloodPressure || '—'}</strong></td>
                    <td>Harorat:</td>
                    <td><strong>${vitals.temperature ? `${vitals.temperature} °C` : '—'}</strong></td>
                  </tr>
                  <tr>
                    <td>Puls (HR):</td>
                    <td><strong>${vitals.pulse ? `${vitals.pulse} bpm` : '—'}</strong></td>
                    <td>Saturatsiya (SpO2):</td>
                    <td><strong>${vitals.spO2 ? `${vitals.spO2}%` : '—'}</strong></td>
                  </tr>
                  <tr>
                    <td>Vazn:</td>
                    <td><strong>${vitals.weight ? `${vitals.weight} kg` : '—'}</strong></td>
                    <td>Bo'y:</td>
                    <td><strong>${vitals.height ? `${vitals.height} sm` : '—'}</strong></td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="mt-2">
              <h5 class="section-sub">Diagnostik Xulosa (Tashxis):</h5>
              <div class="diagnosis-block">
                <strong>${c.diagnosis}</strong> ${c.icdCode ? `<span class="icd-badge">ICD-10: ${c.icdCode}</span>` : ''}
              </div>
            </div>

            <div class="mt-2">
              <h5 class="section-sub">Tavsiya etilgan davolash rejasi:</h5>
              <p class="section-text text-preserve">${c.treatmentPlan || 'Kiritilmagan'}</p>
            </div>

            <div class="mt-2">
              <h5 class="section-sub">Dori-darmonlar retsepti (Rp.):</h5>
              ${prescriptionsHtml}
            </div>
            
            <div class="signature-line-right">
              <span>Shifokor imzosi: _________________</span>
            </div>
          </div>
        `;
      } else if (item.type === 'lab_result' && item.labData) {
        const l = item.labData;
        const parametersHtml = l.parameters && l.parameters.length > 0
          ? `<table class="report-table">
              <thead>
                <tr>
                  <th style="width: 5%">№</th>
                  <th style="width: 45%">Klinik ko'rsatkich (Parametr)</th>
                  <th style="width: 20%">Natija qiymati</th>
                  <th style="width: 15%">O'lchov birligi</th>
                  <th style="width: 15%">Me'yoriy norma</th>
                </tr>
              </thead>
              <tbody>
                ${l.parameters.map((p, i) => 
                  '<tr class="' + (p.isAbnormal ? 'abnormal-row' : '') + '">' +
                    '<td>' + (i + 1) + '</td>' +
                    '<td>' + p.name + '</td>' +
                    '<td>' +
                      '<strong>' + p.value + '</strong>' +
                      (p.isAbnormal ? ' <span class="abnormal-indicator">▲ Patologiya</span>' : '') +
                    '</td>' +
                    '<td>' + p.unit + '</td>' +
                    '<td class="text-slate-500">' + p.normalRange + '</td>' +
                  '</tr>'
                ).join('')}
              </tbody>
             </table>`
          : '<p class="no-data">Parametrlar kiritilmagan</p>';

        itemsHtml += `
          <div class="record-section">
            <div class="record-header border-lab">
              <div>
                <span class="badge badge-lab">Laboratoriya Natijalari</span>
                <span class="record-date">${dateStr}</span>
              </div>
              <div class="record-author">Tekshiruvchi: ${l.performedBy || 'Klinik Laborant'} • Buyurtma: #${l.orderNumber}</div>
            </div>
            
            <div class="mt-2">
              <h4 class="text-sm font-bold text-slate-800">Tahlil turi: ${l.testType}</h4>
            </div>

            <div class="mt-2">
              <h5 class="section-sub">Tahlil ko'rsatkichlari:</h5>
              ${parametersHtml}
            </div>

            ${l.conclusion ? `
              <div class="mt-2">
                <h5 class="section-sub">Laboratoriya Xulosasi:</h5>
                <p class="diagnosis-block bg-emerald-50 text-emerald-900 border-emerald-200"><strong>${l.conclusion}</strong></p>
              </div>
            ` : ''}

            <div class="signature-line-right">
              <span>Laborant imzosi: _________________</span>
            </div>
          </div>
        `;
      } else if (item.type === 'pharmacy_order' && item.transactionData) {
        const t = item.transactionData;
        const itemsHtmlList = t.items && t.items.length > 0
          ? `<table class="report-table">
              <thead>
                <tr>
                  <th style="width: 5%">№</th>
                  <th style="width: 45%">Mahsulot nomi (Dori)</th>
                  <th style="width: 15%">Soni</th>
                  <th style="width: 15%">Narxi</th>
                  <th style="width: 20%">Jami summa</th>
                </tr>
              </thead>
              <tbody>
                ${t.items.map((i, idx) => 
                  '<tr>' +
                    '<td>' + (idx + 1) + '</td>' +
                    '<td><strong>' + i.title + '</strong></td>' +
                    '<td>' + i.quantity + '</td>' +
                    '<td>' + i.unitPrice.toLocaleString('uz-UZ') + ' UZS</td>' +
                    '<td><strong>' + (i.quantity * i.unitPrice).toLocaleString('uz-UZ') + ' UZS</strong></td>' +
                  '</tr>'
                ).join('')}
                <tr style="background-color: #f8fafc; font-weight: bold;">
                  <td colspan="4" style="text-align: right;">Jami:</td>
                  <td>${t.totalAmount.toLocaleString('uz-UZ')} UZS</td>
                </tr>
              </tbody>
             </table>`
          : '<p class="no-data">Ma\'lumotlar mavjud emas</p>';

        itemsHtml += `
          <div class="record-section">
            <div class="record-header border-pharm">
              <div>
                <span class="badge badge-pharm">Dorixona Cheki</span>
                <span class="record-date">${dateStr}</span>
              </div>
              <div class="record-author">Farmatsevt: ${t.cashierName || 'Provizor'} • Kvitansiya №: ${t.receiptNumber}</div>
            </div>

            <div class="mt-2">
              <h5 class="section-sub">Xarid qilingan dori-darmonlar ro'yxati:</h5>
              ${itemsHtmlList}
            </div>
          </div>
        `;
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Klinik Hisobot - ${patient.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @page {
            size: A4;
            margin: 15mm 15mm 20mm 15mm;
          }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1e293b;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.5;
          }
          .clinic-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .clinic-info {
            text-align: left;
          }
          .clinic-name {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .clinic-details {
            font-size: 9px;
            color: #64748b;
            margin-top: 2px;
          }
          .document-meta {
            text-align: right;
            font-size: 9px;
            color: #64748b;
          }
          .document-meta strong {
            color: #0f172a;
          }
          .report-title-container {
            text-align: center;
            margin-bottom: 20px;
          }
          .report-title {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin: 0;
          }
          .report-subtitle {
            font-size: 10px;
            color: #64748b;
            margin-top: 3px;
          }
          .patient-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 20px;
          }
          .patient-card-title {
            font-size: 11px;
            font-weight: 800;
            color: #1e293b;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin: 0 0 10px 0;
            letter-spacing: 0.5px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
          }
          .patient-info-table {
            width: 100%;
            border-collapse: collapse;
          }
          .patient-info-table td {
            padding: 4px 0;
            vertical-align: top;
          }
          .patient-info-table td.label {
            width: 35%;
            color: #64748b;
            font-weight: 600;
          }
          .patient-info-table td.value {
            width: 65%;
            color: #0f172a;
            font-weight: 700;
          }
          .record-section {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 15px;
            page-break-inside: avoid;
            background-color: #fff;
          }
          .record-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .border-consultation {
            border-left: 4px solid #3b82f6;
            padding-left: 8px;
          }
          .border-lab {
            border-left: 4px solid #10b981;
            padding-left: 8px;
          }
          .border-pharm {
            border-left: 4px solid #f59e0b;
            padding-left: 8px;
          }
          .badge {
            display: inline-block;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .badge-consultation { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
          .badge-lab { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
          .badge-pharm { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
          
          .record-date {
            font-size: 10px;
            font-weight: 700;
            color: #475569;
            margin-left: 8px;
          }
          .record-author {
            font-size: 10px;
            font-weight: 700;
            color: #0f172a;
          }
          .section-sub {
            font-size: 10px;
            font-weight: 800;
            color: #334155;
            margin: 8px 0 3px 0;
            text-transform: uppercase;
          }
          .section-text {
            font-size: 11px;
            color: #334155;
            margin: 0;
            line-height: 1.4;
          }
          .text-preserve {
            white-space: pre-wrap;
          }
          .mini-vitals-table {
            width: 100%;
            border-collapse: collapse;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .mini-vitals-table td {
            padding: 4px 8px;
            border: 1px solid #e2e8f0;
            font-size: 9px;
          }
          .diagnosis-block {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 11px;
            color: #0f172a;
          }
          .icd-badge {
            font-weight: 800;
            background-color: #334155;
            color: #fff;
            padding: 1px 4px;
            border-radius: 3px;
            font-size: 8px;
            margin-left: 5px;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
            font-size: 10px;
          }
          .report-table th, .report-table td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: left;
          }
          .report-table th {
            background-color: #f1f5f9;
            font-weight: 700;
            color: #0f172a;
          }
          .instructions-row {
            background-color: #f8fafc;
            font-size: 9px;
            color: #475569;
            padding: 4px 8px;
          }
          .abnormal-row {
            background-color: #fff1f2;
          }
          .abnormal-indicator {
            background-color: #e11d48;
            color: #fff;
            font-weight: 800;
            padding: 1px 4px;
            border-radius: 3px;
            font-size: 8px;
            margin-left: 5px;
            display: inline-block;
          }
          .no-data {
            font-style: italic;
            color: #64748b;
            font-size: 10px;
            margin: 0;
          }
          .signature-line-right {
            text-align: right;
            margin-top: 15px;
            font-weight: 600;
            font-size: 10px;
          }
          .report-footer {
            margin-top: 30px;
            border-top: 1px solid #cbd5e1;
            padding-top: 15px;
            page-break-inside: avoid;
          }
          .footer-stamps {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
          }
          .stamp-box {
            border: 1px dashed #94a3b8;
            border-radius: 8px;
            padding: 15px;
            width: 45%;
            text-align: center;
            font-size: 10px;
            color: #64748b;
          }
          .stamp-placeholder {
            margin: 15px auto 5px auto;
            border: 1px solid #cbd5e1;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
          }
          .system-watermark {
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
            margin-top: 25px;
          }
          .mt-2 { margin-top: 8px; }
          .font-bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="clinic-header">
          <div class="clinic-info">
            <div class="clinic-name">${clinic.name}</div>
            <div class="clinic-details">
              📍 ${clinic.address} &nbsp;|&nbsp; 📞 ${clinic.phone}<br>
              ✉️ ${clinic.email || 'info@clinic.uz'} &nbsp;|&nbsp; 🌐 ${clinic.website || 'www.clinic.uz'}
            </div>
          </div>
          <div class="document-meta">
            Hujjat №: <strong>CR-${patient.patientNumber}-${new Date().getFullYear()}</strong><br>
            Sana: <strong>${new Date().toLocaleDateString('uz-UZ')}</strong><br>
            Vaqt: <strong>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
        </div>

        <div class="report-title-container">
          <h2 class="report-title">BEMORNING TIBBIY DIAGNOSTIK VA KONSULTATIV HISOBOTI</h2>
          <div class="report-subtitle">Ambulator tibbiy yozuvlar va diagnostika natijalari jami</div>
        </div>

        <div class="patient-card">
          <h4 class="patient-card-title">Bemor haqidagi umumiy ma'lumotlar</h4>
          <div class="grid-2">
            <table class="patient-info-table">
              <tr>
                <td class="label">F.I.SH. (Bemor):</td>
                <td class="value">${patient.fullName}</td>
              </tr>
              <tr>
                <td class="label">Bemor ID (No.):</td>
                <td class="value">${patient.patientNumber}</td>
              </tr>
              <tr>
                <td class="label">Tug'ilgan sana / Yosh:</td>
                <td class="value">${patient.birthDate} (${patientAge} yosh)</td>
              </tr>
              <tr>
                <td class="label">Jinsi:</td>
                <td class="value">${patient.gender === 'male' ? 'Erkak' : 'Ayol'}</td>
              </tr>
              <tr>
                <td class="label">Bog'lanish telefoni:</td>
                <td class="value">${patient.phone}</td>
              </tr>
            </table>

            <table class="patient-info-table">
              <tr>
                <td class="label">Qon guruhi:</td>
                <td class="value">${patient.bloodGroup || 'Aniqlanmagan'}</td>
              </tr>
              <tr>
                <td class="label">Passport / PINFL:</td>
                <td class="value">${patient.passportOrPin || 'Kiritilmagan'}</td>
              </tr>
              <tr>
                <td class="label">Allergiyalar:</td>
                <td class="value" style="color: ${allergiesText !== "Yo'q" ? '#e11d48' : 'inherit'}">${allergiesText}</td>
              </tr>
              <tr>
                <td class="label">Surunkali kasalliklar:</td>
                <td class="value" style="color: ${chronicDiseasesText !== "Yo'q" ? '#d97706' : 'inherit'}">${chronicDiseasesText}</td>
              </tr>
              <tr>
                <td class="label">Tanlangan yozuvlar:</td>
                <td class="value">${selectedItems.length} ta tahlil/konsultatsiya</td>
              </tr>
            </table>
          </div>
        </div>

        <div>
          ${itemsHtml}
        </div>

        <div class="report-footer">
          <div class="footer-stamps">
            <div class="stamp-box">
              <strong>Davolovchi Shifokor</strong>
              <div style="margin-top: 10px;">_________________________ / F.I.SH.</div>
              <div class="stamp-placeholder">M.O'.</div>
              <div style="font-size: 8px; color: #94a3b8; margin-top: 4px;">Shifokor shaxsiy muhri va imzosi</div>
            </div>
            
            <div class="stamp-box">
              <strong>Klinika Bosh Shifokori / Ma'muriyati</strong>
              <div style="margin-top: 10px;">_________________________ / F.I.SH.</div>
              <div class="stamp-placeholder" style="border: 2px double #cbd5e1;">M.P.</div>
              <div style="font-size: 8px; color: #94a3b8; margin-top: 4px;">Muassasa dumaloq rasmiy muhri</div>
            </div>
          </div>
          
          <div class="system-watermark">
            Ushbu hujjat elektron tibbiyot axborot tizimi (E-TIBBIYOT) tomonidan ${new Date().toLocaleString('uz-UZ')} da generatsiya qilingan.<br>
            Hujjat tarkibidagi ma'lumotlar sir saqlanishi qonun bilan himoyalanadi.
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          }
        </script>
      </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  // Compute Active Date Range Start/End Timestamps
  const calculatedDateRange = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

    if (datePreset === 'today') {
      return { start: todayStart, end: todayEnd };
    }
    if (datePreset === '7days') {
      const start = new Date(todayStart - 7 * 24 * 60 * 60 * 1000).getTime();
      return { start, end: todayEnd };
    }
    if (datePreset === '30days') {
      const start = new Date(todayStart - 30 * 24 * 60 * 60 * 1000).getTime();
      return { start, end: todayEnd };
    }
    if (datePreset === '3months') {
      const start = new Date(todayStart - 90 * 24 * 60 * 60 * 1000).getTime();
      return { start, end: todayEnd };
    }
    if (datePreset === '1year') {
      const start = new Date(todayStart - 365 * 24 * 60 * 60 * 1000).getTime();
      return { start, end: todayEnd };
    }
    if (datePreset === 'custom') {
      const start = startDate ? new Date(startDate + 'T00:00:00').getTime() : null;
      const end = endDate ? new Date(endDate + 'T23:59:59').getTime() : null;
      return { start, end };
    }

    return { start: null, end: null };
  }, [datePreset, startDate, endDate]);

  // Filtered by Category, Search query, Date Range and Advanced Flags
  const filteredTimeline = useMemo(() => {
    return timelineItems.filter(item => {
      // 1. Type filter
      if (activeFilter === 'consultations' && item.type !== 'consultation') return false;
      if (activeFilter === 'labs' && item.type !== 'lab_result') return false;
      if (activeFilter === 'pharmacy' && item.type !== 'pharmacy_order') return false;

      // 2. Date Range filter
      if (calculatedDateRange.start !== null && item.timestamp < calculatedDateRange.start) {
        return false;
      }
      if (calculatedDateRange.end !== null && item.timestamp > calculatedDateRange.end) {
        return false;
      }

      // 3. Doctor filter
      if (selectedDoctorFilter !== 'all') {
        if (item.type === 'consultation' && item.consultationData?.doctorName !== selectedDoctorFilter) {
          return false;
        }
      }

      // 4. Abnormal / Flagged only filter
      if (onlyAbnormal) {
        if (item.type === 'lab_result') {
          if (!item.isAbnormal) return false;
        } else if (item.type === 'consultation') {
          // Consultations with fever or high BP
          const bp = item.consultationData?.objectiveExam?.bloodPressure;
          const temp = item.consultationData?.objectiveExam?.temperature;
          const hasFever = temp && temp >= 37.5;
          if (!hasFever && !bp) return false;
        } else {
          return false;
        }
      }

      // 5. Keyword search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchesAuthor = item.authorName.toLowerCase().includes(q);
        const matchesCode = item.code?.toLowerCase().includes(q);
        
        // Deep search in consultation
        const c = item.consultationData;
        const matchesPrescription = c?.prescriptions?.some(p => 
          p.drugName.toLowerCase().includes(q) || 
          p.dosage.toLowerCase().includes(q) ||
          p.frequency.toLowerCase().includes(q) ||
          (p.instructions && p.instructions.toLowerCase().includes(q))
        );
        const matchesDiagnosis = c?.diagnosis?.toLowerCase().includes(q);
        const matchesIcd = c?.icdCode?.toLowerCase().includes(q);
        const matchesComplaints = c?.complaints?.toLowerCase().includes(q);
        const matchesAnamnesis = c?.anamnesis?.toLowerCase().includes(q);
        const matchesTreatment = c?.treatmentPlan?.toLowerCase().includes(q);
        const matchesVitals = c?.objectiveExam && (
          (c.objectiveExam.bloodPressure && c.objectiveExam.bloodPressure.toLowerCase().includes(q)) ||
          (c.objectiveExam.temperature && String(c.objectiveExam.temperature).includes(q)) ||
          (c.objectiveExam.pulse && String(c.objectiveExam.pulse).includes(q)) ||
          (c.objectiveExam.spO2 && String(c.objectiveExam.spO2).includes(q))
        );

        // Deep search in Lab
        const l = item.labData;
        const matchesLabParams = l?.parameters?.some(p => 
          p.name.toLowerCase().includes(q) || 
          p.value.toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q) ||
          (p.normalRange && p.normalRange.toLowerCase().includes(q))
        );
        const matchesLabConclusion = l?.conclusion?.toLowerCase().includes(q);
        const matchesLabTestType = l?.testType?.toLowerCase().includes(q);

        // Deep search in Pharmacy
        const t = item.transactionData;
        const matchesPharm = t?.items?.some(i => 
          i.title.toLowerCase().includes(q)
        );
        const matchesReceipt = t?.receiptNumber?.toLowerCase().includes(q);
        const matchesCashier = t?.cashierName?.toLowerCase().includes(q);

        return matchesTitle || matchesSubtitle || matchesAuthor || matchesCode || 
               matchesPrescription || matchesDiagnosis || matchesIcd || matchesComplaints ||
               matchesAnamnesis || matchesTreatment || matchesVitals || matchesLabParams ||
               matchesLabConclusion || matchesLabTestType || matchesPharm || matchesReceipt || matchesCashier;
      }

      return true;
    });
  }, [
    timelineItems, 
    activeFilter, 
    searchQuery, 
    calculatedDateRange, 
    selectedDoctorFilter, 
    onlyAbnormal
  ]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() !== '' || 
           datePreset !== 'all' || 
           startDate !== '' || 
           endDate !== '' || 
           onlyAbnormal || 
           selectedDoctorFilter !== 'all' ||
           activeFilter !== 'all';
  }, [searchQuery, datePreset, startDate, endDate, onlyAbnormal, selectedDoctorFilter, activeFilter]);

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery('');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setOnlyAbnormal(false);
    setSelectedDoctorFilter('all');
    setActiveFilter('all');
  };

  // Quick Preset setter
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    filteredTimeline.forEach(item => {
      allExpanded[item.id] = true;
    });
    setExpandedIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Copy prescription text
  const handleCopyPrescription = (item: MedicalTimelineItem) => {
    if (!item.consultationData) return;
    const c = item.consultationData;
    const text = `Bemor: ${patient.fullName}\nSana: ${new Date(c.date).toLocaleDateString('uz-UZ')}\nTashxis: ${c.diagnosis} (${c.icdCode || ''})\nShifokor: ${c.doctorName}\n\nRetsept (Rp.):\n` +
      c.prescriptions.map((p, i) => `${i + 1}. ${p.drugName} ${p.dosage} - ${p.frequency}, ${p.duration} (${p.instructions || ''})`).join('\n') +
      (c.treatmentPlan ? `\n\nTavsiyalar: ${c.treatmentPlan}` : '');

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Latest Vitals from recent consultation
  const latestConsultationWithVitals = patientConsultations.find(c => c.objectiveExam && c.objectiveExam.bloodPressure);
  const latestVitals = latestConsultationWithVitals?.objectiveExam;

  // Relative date formatter
  const formatRelativeDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Bugun';
      if (diffDays === 1) return 'Kecha';
      if (diffDays < 7) return `${diffDays} kun oldin`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta oldin`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} oy oldin`;
      return `${Math.floor(diffDays / 365)} yil oldin`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Patient Profile Header Card (if not hidden) */}
      {!hideHeader && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 font-extrabold text-xl shadow-inner">
                {patient.gender === 'male' ? '👨' : '👩'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight">{patient.fullName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-xs font-mono font-bold border border-white/10">
                    {patient.patientNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold">
                    {patient.gender === 'male' ? 'Erkak' : 'Ayol'}, {patient.birthDate}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                  <span>Tel: <strong className="text-white">{patient.phone}</strong></span>
                  <span>•</span>
                  <span>Qon guruhi: <strong className="text-white">{patient.bloodGroup || 'Aniqlanmagan'}</strong></span>
                  <span>•</span>
                  <span>Passport: <strong className="text-slate-200">{patient.passportOrPin}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[70px]">
                <div className="text-lg font-black text-blue-400">{patientConsultations.length}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Ko'riklar</div>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[70px]">
                <div className="text-lg font-black text-emerald-400">{patientLabOrders.length}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Tahlillar</div>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[70px]">
                <div className="text-lg font-black text-amber-400">{patientPharmacyTransactions.length}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Dorixona</div>
              </div>
            </div>
          </div>

          {/* Allergies & Chronic Conditions Alert Strip */}
          {((patient.allergies && patient.allergies.length > 0) || (patient.chronicDiseases && patient.chronicDiseases.length > 0)) && (
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Allergiyalar: <strong className="text-white">{patient.allergies.join(', ')}</strong></span>
                </div>
              )}
              {patient.chronicDiseases && patient.chronicDiseases.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                  <HeartPulse className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Surunkali kasalliklar: <strong className="text-white">{patient.chronicDiseases.join(', ')}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Recent Vitals Strip */}
          {latestVitals && (
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-400 font-medium flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Oxirgi qayd etilgan vitallar ({latestConsultationWithVitals?.date ? new Date(latestConsultationWithVitals.date).toLocaleDateString('uz-UZ') : 'So\'nggi'}):</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono font-bold text-[11px]">
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">BP: <span className="text-blue-300">{latestVitals.bloodPressure || '-'}</span></span>
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">Puls: <span className="text-rose-300">{latestVitals.pulse ? `${latestVitals.pulse} bpm` : '-'}</span></span>
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">Harorat: <span className="text-amber-300">{latestVitals.temperature ? `${latestVitals.temperature} °C` : '-'}</span></span>
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">SpO2: <span className="text-emerald-300">{latestVitals.spO2 ? `${latestVitals.spO2}%` : '-'}</span></span>
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">Vazn: <span className="text-indigo-300">{latestVitals.weight ? `${latestVitals.weight} kg` : '-'}</span></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Control & Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Row 1: Category Filter Tabs & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Barchasi</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {timelineItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('consultations')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'consultations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Konsultatsiyalar</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'consultations' ? 'bg-white/20 text-white' : 'bg-blue-200 text-blue-900'}`}>
                {patientConsultations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('labs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'labs'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Laboratoriya & UZI</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'labs' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
                {patientLabOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('pharmacy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'pharmacy'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Dorixona & Retsept</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'pharmacy' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'}`}>
                {patientPharmacyTransactions.length}
              </span>
            </button>
          </div>

          {/* Sorting, Expand & Advanced Filter Toggle */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => setShowAdvancedFilters(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                showAdvancedFilters || onlyAbnormal || selectedDoctorFilter !== 'all' || datePreset === 'custom'
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Qo'shimcha filtrlar va sana oraliqlari"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtrlar</span>
              {(onlyAbnormal || selectedDoctorFilter !== 'all' || datePreset !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title={sortOrder === 'desc' ? 'Yangi sana birinchi' : 'Eski sana birinchi'}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'desc' ? 'Yangi' : 'Eski'}</span>
            </button>

            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Barchasini ochish"
            >
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Ochish</span>
            </button>

            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Barchasini yopish"
            >
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              <span>Yopish</span>
            </button>
          </div>
        </div>

        {/* Row 2: Keyword Search Bar & Date Presets */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kalit so'z bo'yicha qidirish (tashxis, dori, tahlil ko'rsatkichi, ICD, shifokor)..."
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                  title="Qidiruvni tozalash"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Date Presets Strip */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <CalendarRange className="w-3.5 h-3.5 text-slate-400" />
                <span>Sana:</span>
              </span>

              <button
                type="button"
                onClick={() => handleDatePresetChange('all')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  datePreset === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Barchasi
              </button>

              <button
                type="button"
                onClick={() => handleDatePresetChange('today')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  datePreset === 'today'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Bugun
              </button>

              <button
                type="button"
                onClick={() => handleDatePresetChange('7days')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  datePreset === '7days'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                7 kun
              </button>

              <button
                type="button"
                onClick={() => handleDatePresetChange('30days')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  datePreset === '30days'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                30 kun
              </button>

              <button
                type="button"
                onClick={() => handleDatePresetChange('3months')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  datePreset === '3months'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                3 oy
              </button>

              <button
                type="button"
                onClick={() => handleDatePresetChange('1year')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  datePreset === '1year'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                1 yil
              </button>

              <button
                type="button"
                onClick={() => {
                  setDatePreset('custom');
                  setShowAdvancedFilters(true);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  datePreset === 'custom'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Oraliq</span>
              </button>
            </div>
          </div>

          {/* Row 3: Advanced Filters Drawer (Custom Date Range Picker, Doctor Select, Abnormal Toggle) */}
          {(showAdvancedFilters || datePreset === 'custom') && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border border-blue-100 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kengaytirilgan Qidiruv va Sana Oralig'i Tanlash</span>
                </span>

                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(false)}
                  className="text-slate-400 hover:text-slate-600 text-[11px] font-bold"
                >
                  Yashirish ▲
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Start Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Boshlanish sanasi:
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setDatePreset('custom');
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tugash sanasi:
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setDatePreset('custom');
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Filter by Doctor */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Shifokor bo'yicha:
                  </label>
                  <select
                    value={selectedDoctorFilter}
                    onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="all">Barcha shifokorlar</option>
                    {availableDoctors.map((doc, idx) => (
                      <option key={idx} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Abnormal Flags */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-rose-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={onlyAbnormal}
                      onChange={(e) => setOnlyAbnormal(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Faqat patologik natijalar</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Summary & Chips Bar */}
          {hasActiveFilters && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Faol filtrlar:</span>

                {searchQuery && (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-medium text-[11px] flex items-center gap-1 border border-blue-200">
                    <span>So'z: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {datePreset !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-medium text-[11px] flex items-center gap-1 border border-indigo-200">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {datePreset === 'today' && 'Bugun'}
                      {datePreset === '7days' && 'Oxirgi 7 kun'}
                      {datePreset === '30days' && 'Oxirgi 30 kun'}
                      {datePreset === '3months' && 'Oxirgi 3 oy'}
                      {datePreset === '1year' && 'Oxirgi 1 yil'}
                      {datePreset === 'custom' && `${startDate || '...'} dan ${endDate || '...'} gacha`}
                    </span>
                    <button onClick={() => handleDatePresetChange('all')} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedDoctorFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-800 font-medium text-[11px] flex items-center gap-1 border border-slate-300">
                    <User className="w-3 h-3" />
                    <span>Dr. {selectedDoctorFilter}</span>
                    <button onClick={() => setSelectedDoctorFilter('all')} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {onlyAbnormal && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-medium text-[11px] flex items-center gap-1 border border-rose-200">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Faqat patologiya</span>
                    <button onClick={() => setOnlyAbnormal(false)} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-medium text-[11px] flex items-center gap-1 border border-emerald-200">
                    <Tag className="w-3 h-3" />
                    <span>
                      {activeFilter === 'consultations' && 'Faqat Konsultatsiyalar'}
                      {activeFilter === 'labs' && 'Faqat Laboratoriya'}
                      {activeFilter === 'pharmacy' && 'Faqat Dorixona'}
                    </span>
                    <button onClick={() => setActiveFilter('all')} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <span className="text-[11px] text-slate-500 font-medium">
                  Topildi: <strong className="text-slate-900">{filteredTimeline.length}</strong> / {timelineItems.length} ta yozuv
                </span>

                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                  title="Barcha filtrlarni tozalash"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Filtrlarni tozalash</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection controls and Report trigger */}
      {filteredTimeline.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-xs mb-4 shadow-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filteredTimeline.length > 0 && filteredTimeline.every(item => selectedItemIds[item.id])}
                onChange={toggleSelectAll}
                className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer transition-all"
              />
              <span className="text-slate-800 font-extrabold text-[12px]">
                {filteredTimeline.every(item => selectedItemIds[item.id]) ? 'Barcha yozuvlar tanlandi' : 'Barchasini tanlash'}
              </span>
            </label>
            <span className="text-[11px] font-bold text-slate-500 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
              {filteredTimeline.filter(item => selectedItemIds[item.id]).length} ta yozuv kiritiladi
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadPDFReport}
            className="px-4.5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 active:scale-98 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg self-stretch sm:self-auto"
          >
            <FileText className="w-4 h-4" />
            <span>Klinik Hisobotni yuklash (PDF)</span>
          </button>
        </div>
      )}

      {/* Vertical Timeline Feed */}
      {filteredTimeline.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Ma'lumotlar topilmadi</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery 
              ? `"${searchQuery}" bo'yicha tibbiy tarixda hech narsa topilmadi. Qidiruv so'zini o'zgartirib ko'ring.`
              : 'Ushbu bemor uchun tanlangan toifadagi tibbiy yozuvlar hali mavjud emas.'}
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-400 before:to-slate-300">
          {filteredTimeline.map((item) => {
            const isExpanded = expandedIds[item.id] ?? true; // expanded by default for quick reading
            const relativeTime = formatRelativeDate(item.date);
            const dateObj = new Date(item.date);
            const formattedDate = dateObj.toLocaleDateString('uz-UZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString('uz-UZ', {
              hour: '2-digit',
              minute: '2-digit'
            });

            // Node Style Configuration
            let nodeIcon = <Stethoscope className="w-4 h-4 text-white" />;
            let nodeBg = 'bg-blue-600 ring-4 ring-blue-100';
            let cardBorder = 'border-slate-200 hover:border-blue-300';
            let categoryLabel = 'Konsultatsiya';
            let categoryColor = 'bg-blue-100 text-blue-800 border-blue-200';

            if (item.type === 'lab_result') {
              nodeIcon = <FlaskConical className="w-4 h-4 text-white" />;
              nodeBg = 'bg-emerald-600 ring-4 ring-emerald-100';
              cardBorder = 'border-slate-200 hover:border-emerald-300';
              categoryLabel = 'Laboratoriya / Diagnostika';
              categoryColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
            } else if (item.type === 'pharmacy_order') {
              nodeIcon = <Pill className="w-4 h-4 text-white" />;
              nodeBg = 'bg-amber-600 ring-4 ring-amber-100';
              cardBorder = 'border-slate-200 hover:border-amber-300';
              categoryLabel = 'Dorixona';
              categoryColor = 'bg-amber-100 text-amber-800 border-amber-200';
            }

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Node Point on the Line */}
                <div className={`absolute -left-6 sm:-left-8 top-4 w-7 h-7 rounded-full ${nodeBg} flex items-center justify-center shadow-md z-10 transition-transform group-hover:scale-110`}>
                  {nodeIcon}
                </div>

                {/* Timeline Card */}
                <div className={`bg-white rounded-2xl border ${cardBorder} shadow-xs hover:shadow-md transition-all overflow-hidden`}>
                  {/* Card Header Top Strip */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Checkbox for selection */}
                      <input
                        type="checkbox"
                        checked={!!selectedItemIds[item.id]}
                        onChange={(e) => {
                          setSelectedItemIds(prev => ({
                            ...prev,
                            [item.id]: e.target.checked
                          }));
                        }}
                        className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer mt-1 shrink-0 transition-all"
                        title="Hisobotga kiritish"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${categoryColor}`}>
                            {categoryLabel}
                          </span>
                          
                          {item.code && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.code}
                            </span>
                          )}

                          {item.isAbnormal && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Normadan Farq</span>
                            </span>
                          )}

                          {item.statusBadge && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.statusBadge.variant === 'success' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {item.statusBadge.label}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{item.title}</span>
                        </h4>

                        <div className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                          <span>{item.subtitle}</span>
                        </div>
                      </div>
                    </div>

                    {/* Date and Action Toggles */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 sm:justify-end">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 sm:justify-end mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formattedTime} • <span className="font-semibold text-slate-600">{relativeTime}</span></span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title={isExpanded ? 'Batafsil ma\'lumotni yashirish' : 'Batafsil ma\'lumotni ko\'rish'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 space-y-4 text-xs text-slate-700">
                      {/* 1. CONSULTATION DETAILS */}
                      {item.type === 'consultation' && item.consultationData && (
                        <div className="space-y-4">
                          {/* Objective Exam / Vitals */}
                          {item.consultationData.objectiveExam && (
                            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                              <div className="text-[11px] font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-blue-600" />
                                <span>Ko'rik Ko'rsatkichlari (Vital Signs)</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                                  <div className="text-[10px] text-slate-400 font-semibold">Qon Bosimi</div>
                                  <div className="font-extrabold text-slate-900 text-xs">{item.consultationData.objectiveExam.bloodPressure || '120/80'}</div>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                                  <div className="text-[10px] text-slate-400 font-semibold">Puls</div>
                                  <div className="font-extrabold text-slate-900 text-xs">{item.consultationData.objectiveExam.pulse || 76} <span className="text-[10px] font-normal text-slate-500">bpm</span></div>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                                  <div className="text-[10px] text-slate-400 font-semibold">Harorat</div>
                                  <div className="font-extrabold text-slate-900 text-xs">{item.consultationData.objectiveExam.temperature || 36.6} <span className="text-[10px] font-normal text-slate-500">°C</span></div>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                                  <div className="text-[10px] text-slate-400 font-semibold">SpO2</div>
                                  <div className="font-extrabold text-slate-900 text-xs">{item.consultationData.objectiveExam.spO2 || 98} <span className="text-[10px] font-normal text-slate-500">%</span></div>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                                  <div className="text-[10px] text-slate-400 font-semibold">Vazn</div>
                                  <div className="font-extrabold text-slate-900 text-xs">{item.consultationData.objectiveExam.weight || 70} <span className="text-[10px] font-normal text-slate-500">kg</span></div>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                                  <div className="text-[10px] text-slate-400 font-semibold">Bo'yi</div>
                                  <div className="font-extrabold text-slate-900 text-xs">{item.consultationData.objectiveExam.height || 175} <span className="text-[10px] font-normal text-slate-500">sm</span></div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Complaints & Anamnesis */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <span className="font-bold text-slate-800 text-[11px] block mb-1">Bemor Shikoyatlari:</span>
                              <p className="text-slate-700 leading-relaxed">
                                {item.consultationData.complaints || 'Shikoyatlar qayd etilmagan.'}
                              </p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <span className="font-bold text-slate-800 text-[11px] block mb-1">Kasallik Tarixi (Anamnesis):</span>
                              <p className="text-slate-700 leading-relaxed">
                                {item.consultationData.anamnesis || 'Birlamchi murojaat.'}
                              </p>
                            </div>
                          </div>

                          {/* Prescribed Medications (Rp.) */}
                          {item.consultationData.prescriptions && item.consultationData.prescriptions.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between font-bold text-slate-800 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Pill className="w-4 h-4 text-emerald-600" />
                                  <span>Tayinlangan Retsept Dorilari (Rp.) — {item.consultationData.prescriptions.length} ta dori</span>
                                </div>

                                <button
                                  onClick={() => handleCopyPrescription(item)}
                                  className="px-2 py-1 text-[11px] text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  {copiedId === item.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-600 font-bold">Nusxalandi!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Retseptdan nusxa</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {item.consultationData.prescriptions.map((p, idx) => (
                                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                      <div className="font-bold text-slate-900">
                                        {p.drugName} <span className="font-semibold text-slate-600">({p.dosage})</span>
                                      </div>
                                      <div className="text-[11px] text-slate-600 mt-0.5">
                                        {p.frequency} • {p.duration}
                                      </div>
                                      {p.instructions && (
                                        <div className="text-[10px] text-slate-500 italic mt-0.5">
                                          Ko'rsatma: {p.instructions}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Treatment Plan & Follow up */}
                          {(item.consultationData.treatmentPlan || item.consultationData.followUpDate) && (
                            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                              {item.consultationData.treatmentPlan && (
                                <div>
                                  <span className="font-bold text-[11px]">Tavsiyalar va Parhez:</span>
                                  <p className="mt-0.5">{item.consultationData.treatmentPlan}</p>
                                </div>
                              )}
                              {item.consultationData.followUpDate && (
                                <div className="text-[11px] font-bold text-amber-900 pt-1 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Qayta ko'rik sanasi: {item.consultationData.followUpDate}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Consultation Actions */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                            <div className="text-[11px] text-slate-500">
                              Shifokor: <strong className="text-slate-800">{item.consultationData.doctorName}</strong> ({item.consultationData.doctorSpecialty})
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => PrinterService.printPrescriptionThermal(item.consultationData!, patient, clinic, printerConfig)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Termal Xprinter orqali retsept chop etish"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-600" />
                                <span>Xprinter Retsept</span>
                              </button>

                              <button
                                onClick={() => PrinterService.printMedicalReportA4(item.consultationData!, patient, clinic)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                                title="Rasmiy A4 Blank chop etish"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>A4 Blank</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. LAB TEST & DIAGNOSTIC DETAILS */}
                      {item.type === 'lab_result' && item.labData && (
                        <div className="space-y-4">
                          {/* Parameter Results Table */}
                          {item.labData.parameters && item.labData.parameters.length > 0 ? (
                            <div className="overflow-hidden border border-slate-200 rounded-xl">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-bold text-[11px]">
                                    <th className="p-2.5">#</th>
                                    <th className="p-2.5">Parametr Nomi</th>
                                    <th className="p-2.5">Natija</th>
                                    <th className="p-2.5">Birlik</th>
                                    <th className="p-2.5">Referens Norma</th>
                                    <th className="p-2.5 text-center">Holat</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {item.labData.parameters.map((param, idx) => (
                                    <tr 
                                      key={idx} 
                                      className={`hover:bg-slate-50/80 transition-colors ${
                                        param.isAbnormal ? 'bg-rose-50/60 font-semibold' : ''
                                      }`}
                                    >
                                      <td className="p-2.5 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                                      <td className="p-2.5 text-slate-900 font-bold">{param.name}</td>
                                      <td className={`p-2.5 font-mono font-bold text-xs ${param.isAbnormal ? 'text-rose-700' : 'text-slate-900'}`}>
                                        {param.value}
                                      </td>
                                      <td className="p-2.5 text-slate-500">{param.unit}</td>
                                      <td className="p-2.5 text-slate-600 font-mono text-[11px]">{param.normalRange}</td>
                                      <td className="p-2.5 text-center">
                                        {param.isAbnormal ? (
                                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                                            Patologiya
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                            Norma
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 italic">
                              Ushbu tahlil uchun ko'rsatkichlar kiritilmagan.
                            </div>
                          )}

                          {/* Lab Conclusion */}
                          {item.labData.conclusion && (
                            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
                              <span className="text-[11px] font-bold text-emerald-900 uppercase block mb-1">
                                Laboratoriya Xulosasi:
                              </span>
                              <p className="text-slate-800 leading-relaxed font-medium">
                                {item.labData.conclusion}
                              </p>
                            </div>
                          )}

                          {/* Lab Card Actions */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                            <div className="text-[11px] text-slate-500">
                              Laborant / Mutaxassis: <strong className="text-slate-800">{item.labData.performedBy || 'Diagnostika'}</strong> • Narxi: <strong className="text-slate-800">{item.labData.price.toLocaleString('uz-UZ')} UZS</strong>
                            </div>

                            <button
                              onClick={() => PrinterService.printLabReport(item.labData!, patient, clinic)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              title="A4 Laboratoriya xulosasini chop etish"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Laboratoriya Blanki (A4)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. PHARMACY ORDER DETAILS */}
                      {item.type === 'pharmacy_order' && item.transactionData && (
                        <div className="space-y-4">
                          <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-amber-50/70 border-b border-amber-100 text-amber-950 font-bold text-[11px]">
                                  <th className="p-2.5">#</th>
                                  <th className="p-2.5">Dori / Mahsulot</th>
                                  <th className="p-2.5 text-center">Miqdori</th>
                                  <th className="p-2.5 text-right">Dona narxi</th>
                                  <th className="p-2.5 text-right">Jami summa</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {item.transactionData.items.map((it, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/80">
                                    <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                                    <td className="p-2.5 font-bold text-slate-900">{it.title}</td>
                                    <td className="p-2.5 text-center font-bold text-slate-700">{it.quantity} dona</td>
                                    <td className="p-2.5 text-right text-slate-600 font-mono">{it.unitPrice.toLocaleString('uz-UZ')} UZS</td>
                                    <td className="p-2.5 text-right font-bold text-slate-900 font-mono">{it.totalPrice.toLocaleString('uz-UZ')} UZS</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-slate-50 font-bold text-xs border-t border-slate-200">
                                  <td colSpan={4} className="p-2.5 text-right text-slate-700">Jami To'lov:</td>
                                  <td className="p-2.5 text-right text-amber-700 font-mono text-sm">{item.transactionData.totalAmount.toLocaleString('uz-UZ')} UZS</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                            <div className="text-[11px] text-slate-500">
                              Kassir / Farmatsevt: <strong className="text-slate-800">{item.transactionData.cashierName || 'Kassir'}</strong> • To'lov turi: <span className="uppercase font-bold text-slate-700">{item.transactionData.paymentMethod}</span>
                            </div>

                            <button
                              onClick={() => PrinterService.printPaymentReceipt(item.transactionData!, clinic, printerConfig)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Kvitansiya chekini termal printerda chop etish"
                            >
                              <Receipt className="w-3.5 h-3.5 text-amber-600" />
                              <span>Chekni Chop Etish</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
