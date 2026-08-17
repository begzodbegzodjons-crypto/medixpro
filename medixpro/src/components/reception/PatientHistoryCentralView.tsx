import React, { useState, useMemo, useEffect, useRef } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { 
  Search, 
  QrCode, 
  Printer, 
  History, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Heart, 
  Activity, 
  Clock, 
  CreditCard, 
  FlaskConical, 
  Pill, 
  Bed, 
  Sparkles, 
  XCircle, 
  CheckCircle, 
  FileText, 
  Lock, 
  AlertCircle, 
  Camera, 
  Eye, 
  Clipboard,
  Award
} from 'lucide-react';
import { 
  Patient, 
  ConsultationRecord, 
  LabTestOrder, 
  PaymentTransaction, 
  ClinicProfile, 
  QueueTicket, 
  WardRoom,
  PrinterConfig
} from '../../types';

interface PatientHistoryCentralViewProps {
  patients: Patient[];
  queue: QueueTicket[];
  consultations: ConsultationRecord[];
  labOrders: LabTestOrder[];
  transactions: PaymentTransaction[];
  wards: WardRoom[];
  clinic: ClinicProfile;
  printerConfig: PrinterConfig;
}

interface UnifiedTimelineItem {
  id: string;
  timestamp: number;
  date: string;
  type: 'checkin' | 'consultation' | 'lab' | 'ward' | 'billing';
  title: string;
  subtitle: string;
  statusText: string;
  statusColor: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
  meta: string;
  details?: any;
}

export const PatientHistoryCentralView: React.FC<PatientHistoryCentralViewProps> = ({
  patients,
  queue,
  consultations,
  labOrders,
  transactions,
  wards,
  clinic,
  printerConfig
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showPrintPreviewModal, setShowPrintPreviewModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Camera scan states
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-select patient if searched patient number is exact or parsed via QR code
  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().trim();
      // QR codes in this system are represented as patientNumber, e.g., "P-2026-001"
      const found = patients.find(p => p.patientNumber === q || p.id === q);
      if (found && found.id !== selectedPatientId) {
        setSelectedPatientId(found.id);
      }
    }
  }, [searchQuery, patients, selectedPatientId]);

  // Selected Patient Object
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Filtered patient list based on search (name, phone, passport, or exact patientNumber)
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase().trim();
    return patients.filter(p => 
      p.fullName.toLowerCase().includes(q) ||
      p.patientNumber.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.passportOrPin && p.passportOrPin.toLowerCase().includes(q))
    );
  }, [patients, searchQuery]);

  // Unified Chronological Medical Timeline for the selected patient
  const patientTimeline = useMemo((): UnifiedTimelineItem[] => {
    if (!selectedPatient) return [];
    const items: UnifiedTimelineItem[] = [];

    const pId = selectedPatient.id;

    // 1. Check-ins (Qabulxona navbatga qo'shilgan chiptalari)
    const patientQueue = queue.filter(q => q.patientId === pId);
    patientQueue.forEach(q => {
      items.push({
        id: `queue_${q.id}`,
        timestamp: new Date(q.createdAt).getTime(),
        date: q.createdAt,
        type: 'checkin',
        title: `Registraturadan Ro'yxatdan O'tish`,
        subtitle: `Yo'naltirildi: ${q.doctorName} (${q.doctorSpecialty})`,
        statusText: q.status === 'completed' ? 'Tugallangan' : q.status === 'in_consultation' ? 'Huzurida' : 'Kutmoqda',
        statusColor: q.status === 'completed' ? 'emerald' : q.status === 'in_consultation' ? 'blue' : 'amber',
        meta: `Chipta: ${q.ticketNumber} | To'lov: ${q.paymentStatus === 'paid' ? 'To\'langan' : 'To\'lanmagan'} (${q.price.toLocaleString()} UZS)`,
        details: q
      });
    });

    // 2. Doctor Consultations (Shifokor ko'rigi, tashxislar va retseptlar)
    const patientConsultations = consultations.filter(c => c.patientId === pId);
    patientConsultations.forEach(c => {
      items.push({
        id: `consultation_${c.id}`,
        timestamp: new Date(c.date || c.createdAt).getTime(),
        date: c.date || c.createdAt,
        type: 'consultation',
        title: `Shifokor Ko'rigi & Tashxis`,
        subtitle: `Shifokor: ${c.doctorName} (${c.doctorSpecialty})`,
        statusText: c.status === 'finalized' ? 'Tasdiqlangan' : 'Qoralama',
        statusColor: c.status === 'finalized' ? 'emerald' : 'amber',
        meta: `Tashxis: ${c.diagnosis} ${c.icdCode ? `(XMK-10: ${c.icdCode})` : ''} | Retseptlar: ${c.prescriptions?.length || 0} ta dori`,
        details: c
      });
    });

    // 3. Laboratoriya buyurtmalari va tahlillari
    const patientLabs = labOrders.filter(l => l.patientId === pId);
    patientLabs.forEach(l => {
      const isAbnormal = l.parameters?.some(p => p.isAbnormal) || false;
      items.push({
        id: `lab_${l.id}`,
        timestamp: new Date(l.completedAt || l.createdAt).getTime(),
        date: l.completedAt || l.createdAt,
        type: 'lab',
        title: `Laboratoriya Tahlili: ${l.testType}`,
        subtitle: `Ijrochi: ${l.performedBy || 'Klinik Laborant'} | Yo'llanma shifokor: ${l.doctorName}`,
        statusText: l.status === 'ready' ? 'Natija Tayyor' : l.status === 'processing' ? 'Jarayonda' : 'Buyurtirilgan',
        statusColor: l.status === 'ready' ? 'emerald' : l.status === 'processing' ? 'blue' : 'slate',
        meta: `${l.parameters?.length || 0} ta ko'rsatkich ${isAbnormal ? '• PATOLOGIYA ANIQLANGAN!' : ''}`,
        details: l
      });
    });

    // 4. Kasalxona / Palata joylashuvi (Inpatient stay info)
    wards.forEach(ward => {
      ward.beds.forEach(bed => {
        if (bed.currentPatient?.patientId === pId) {
          const cp = bed.currentPatient;
          items.push({
            id: `ward_${ward.id}_${bed.id}`,
            timestamp: new Date(cp.admissionDate).getTime(),
            date: cp.admissionDate,
            type: 'ward',
            title: `Statsionar Bo'limga Joylashtirish`,
            subtitle: `Xona: ${ward.roomNumber} (${ward.department}) | O'rin: ${bed.bedNumber}`,
            statusText: 'Kasalxonada yotibdi',
            statusColor: 'blue',
            meta: `Tashxis: ${cp.diagnosis} | Mas'ul shifokor: ${cp.doctorName}`,
            details: { ward, bed, cp }
          });
        }
      });
    });

    // 5. Kassa va to'lovlar
    const patientTrans = transactions.filter(t => t.patientId === pId);
    patientTrans.forEach(t => {
      items.push({
        id: `billing_${t.id}`,
        timestamp: new Date(t.createdAt).getTime(),
        date: t.createdAt,
        type: 'billing',
        title: `Kassa To'lovi: ${t.items[0]?.title || 'Tibbiy xizmat'}${t.items.length > 1 ? ` (+${t.items.length - 1} xizmat)` : ''}`,
        subtitle: `Kvitansiya: ${t.receiptNumber} | Kassir: ${t.cashierName}`,
        statusText: t.status === 'completed' ? 'To\'landi' : t.status === 'refunded' ? 'Qaytarildi' : 'Kutilmoqda',
        statusColor: t.status === 'completed' ? 'emerald' : t.status === 'refunded' ? 'rose' : 'slate',
        meta: `Jami: ${t.totalAmount.toLocaleString()} UZS (${t.paymentMethod === 'cash' ? 'Naqd' : t.paymentMethod === 'card' ? 'Plastik karta' : 'Elektron to\'lov'})`,
        details: t
      });
    });

    // Sort chronologically (newest first)
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [selectedPatient, queue, consultations, labOrders, transactions, wards]);

  // Start QR Camera stream (Simulated and actual)
  const startCamera = async () => {
    setShowScanner(true);
    setScannerError(null);
    setScanResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Kameraga ulanib bo'lmadi:", err);
      setScannerError("Kamera ruxsatnomasi rad etildi yoki qurilma topilmadi. Simulyatordan foydalaning.");
    }
  };

  // Stop QR Camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
  };

  // Simulate scanning of a QR code
  const handleSimulateScan = (patientNo: string) => {
    setSearchQuery(patientNo);
    setScanResult(`Muvaffaqiyatli skanerlandi: ${patientNo}`);
    setTimeout(() => {
      stopCamera();
    }, 1000);
  };

  // Generate Branded Beautiful "Firmenniy Blanka" PDF/HTML for the entire Patient File
  const getAmbulatoryHtmlContent = (includeShell: boolean = true): string => {
    if (!selectedPatient) return '';

    // Calculate Age
    const patientAge = selectedPatient.birthDate ? (new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear()) : '—';
    const allergiesStr = (selectedPatient.allergies && selectedPatient.allergies.length > 0) ? selectedPatient.allergies.join(', ') : "Yo'q";
    const chronicStr = (selectedPatient.chronicDiseases && selectedPatient.chronicDiseases.length > 0) ? selectedPatient.chronicDiseases.join(', ') : "Yo'q";

    // Build timeline details in HTML
    let historyHtml = '';
    
    if (patientTimeline.length === 0) {
      historyHtml = `
        <div style="text-align: center; padding: 40px; color: #94a3b8; font-style: italic; border: 1px dashed #cbd5e1; border-radius: 12px; margin-top: 20px;">
          Ushbu bemor bo'yicha hech qanday tarixiy tibbiy ma'lumotlar topilmadi.
        </div>
      `;
    } else {
      patientTimeline.forEach((item) => {
        const itemDate = new Date(item.date).toLocaleString('uz-UZ', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });

        let specificDetailsHtml = '';

        if (item.type === 'consultation' && item.details) {
          const c = item.details as ConsultationRecord;
          const vitals = c.objectiveExam || {};
          
          specificDetailsHtml = `
            <div style="margin-top: 10px; font-size: 11px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 8px;">
                <div>
                  <strong>Birlamchi shikoyatlar:</strong> ${c.complaints || 'Yo\'q'}<br>
                  <strong>Kasallik anamnezi:</strong> ${c.anamnesis || 'Kiritilmagan'}
                </div>
                <div>
                  <strong>Vitallar (Obyektiv o'lchovlar):</strong><br>
                  <span style="font-size: 10px; color: #475569;">
                    BP: ${vitals.bloodPressure || '—'} | 
                    Temp: ${vitals.temperature ? `${vitals.temperature} °C` : '—'} | 
                    Puls: ${vitals.pulse ? `${vitals.pulse} bpm` : '—'} | 
                    SpO2: ${vitals.spO2 ? `${vitals.spO2}%` : '—'} | 
                    Vazn: ${vitals.weight ? `${vitals.weight} kg` : '—'}
                  </span>
                </div>
              </div>

              <div style="padding: 10px; background: #fffbeb; border-left: 3px solid #d97706; font-size: 11px; margin-bottom: 8px;">
                <strong>Diagnostik xulosa (Yakuniy Tashxis):</strong> 
                <span style="font-weight: 800; color: #1e293b;">${c.diagnosis}</span> 
                ${c.icdCode ? `<span style="background: #334155; color: white; padding: 2px 4px; font-size: 9px; border-radius: 3px; font-weight: bold; margin-left: 5px;">ICD-10: ${c.icdCode}</span>` : ''}
              </div>

              ${c.treatmentPlan ? `
                <div style="margin-bottom: 8px;">
                  <strong>Tavsiya etilgan davolash va rejim:</strong><br>
                  <span style="color: #334155;">${c.treatmentPlan}</span>
                </div>
              ` : ''}

              ${c.prescriptions && c.prescriptions.length > 0 ? `
                <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 5px;">
                  <thead>
                    <tr style="background: #e2e8f0;">
                      <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: left;">№</th>
                      <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: left;">Dori nomi</th>
                      <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: left;">Dozalash</th>
                      <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: left;">Taqsimot</th>
                      <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: left;">Muddati</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${c.prescriptions.map((pr, idx) => `
                      <tr>
                        <td style="border: 1px solid #cbd5e1; padding: 4px;">${idx + 1}</td>
                        <td style="border: 1px solid #cbd5e1; padding: 4px; font-weight: bold;">${pr.drugName}</td>
                        <td style="border: 1px solid #cbd5e1; padding: 4px;">${pr.dosage}</td>
                        <td style="border: 1px solid #cbd5e1; padding: 4px;">${pr.frequency}</td>
                        <td style="border: 1px solid #cbd5e1; padding: 4px;">${pr.duration}</td>
                      </tr>
                      ${pr.instructions ? `
                        <tr>
                          <td colspan="5" style="border: 1px solid #cbd5e1; padding: 3px 6px; background: #f8fafc; font-style: italic; color: #64748b; font-size: 9px;">
                            Ko'rsatma: ${pr.instructions}
                          </td>
                        </tr>
                      ` : ''}
                    `).join('')}
                  </tbody>
                </table>
              ` : '<div style="color: #64748b; font-style: italic; font-size: 10px; margin-top: 4px;">Dori retsepti yozilmagan.</div>'}
            </div>
          `;
        } else if (item.type === 'lab' && item.details) {
          const l = item.details as LabTestOrder;
          specificDetailsHtml = `
            <div style="margin-top: 8px; font-size: 11px;">
              <strong style="color: #065f46;">Tahlil turi: ${l.testType}</strong><br>
              ${l.parameters && l.parameters.length > 0 ? `
                <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 5px;">
                  <thead>
                    <tr style="background: #ecfdf5; color: #065f46;">
                      <th style="border: 1px solid #a7f3d0; padding: 5px; text-align: left;">Klinik parametr</th>
                      <th style="border: 1px solid #a7f3d0; padding: 5px; text-align: left;">Natija</th>
                      <th style="border: 1px solid #a7f3d0; padding: 5px; text-align: left;">O'lchov birligi</th>
                      <th style="border: 1px solid #a7f3d0; padding: 5px; text-align: left;">Sog'lom me'yor (Norma)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${l.parameters.map(p => `
                      <tr style="${p.isAbnormal ? 'background: #fff1f2;' : ''}">
                        <td style="border: 1px solid #e2e8f0; padding: 4px;">${p.name}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 4px; font-weight: bold;">
                          ${p.value} 
                          ${p.isAbnormal ? '<span style="color: #e11d48; font-size: 8px; font-weight: 800; margin-left: 5px;">[ ▲ Patologiya ]</span>' : ''}
                        </td>
                        <td style="border: 1px solid #e2e8f0; padding: 4px;">${p.unit}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 4px; color: #64748b;">${p.normalRange}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : '<div style="color: #64748b; font-style: italic; font-size: 10px;">Parametrlar kiritilmagan.</div>'}
              ${l.conclusion ? `
                <div style="margin-top: 5px; padding: 6px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; color: #166534;">
                  <strong>Laboratoriya xulosasi:</strong> ${l.conclusion}
                </div>
              ` : ''}
            </div>
          `;
        } else if (item.type === 'ward' && item.details) {
          const { ward, bed, cp } = item.details;
          specificDetailsHtml = `
            <div style="margin-top: 8px; font-size: 11px; background: #f0fdfa; border: 1px solid #ccfbf1; padding: 8px; border-radius: 6px;">
              <strong>Bo'lim:</strong> ${ward.department} (${ward.roomNumber}) | <strong>O'rin:</strong> ${bed.bedNumber}<br>
              <strong>Kirish vaqti:</strong> ${new Date(cp.admissionDate).toLocaleDateString('uz-UZ')} ${new Date(cp.admissionDate).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}<br>
              <strong>Dastlabki tashxis:</strong> ${cp.diagnosis} | <strong>Mas'ul shifokor:</strong> ${cp.doctorName}
            </div>
          `;
        } else if (item.type === 'billing' && item.details) {
          const t = item.details as PaymentTransaction;
          specificDetailsHtml = `
            <div style="margin-top: 6px; font-size: 10px;">
              <table style="width: 100%; border-collapse: collapse; margin-top: 3px;">
                <thead>
                  <tr style="background: #f8fafc; font-size: 9px;">
                    <th style="border: 1px solid #cbd5e1; padding: 3px; text-align: left;">Xizmat/Dori nomi</th>
                    <th style="border: 1px solid #cbd5e1; padding: 3px; text-align: left;">Turi</th>
                    <th style="border: 1px solid #cbd5e1; padding: 3px; text-align: left;">Soni</th>
                    <th style="border: 1px solid #cbd5e1; padding: 3px; text-align: left;">Narxi</th>
                    <th style="border: 1px solid #cbd5e1; padding: 3px; text-align: left;">Jami</th>
                  </tr>
                </thead>
                <tbody>
                  ${t.items.map(i => `
                    <tr>
                      <td style="border: 1px solid #e2e8f0; padding: 3px;">${i.title}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 3px; font-size: 8px;">${i.type}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 3px;">${i.quantity}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 3px;">${i.unitPrice.toLocaleString()} UZS</td>
                      <td style="border: 1px solid #e2e8f0; padding: 3px; font-weight: bold;">${i.totalPrice.toLocaleString()} UZS</td>
                    </tr>
                  `).join('')}
                  <tr style="font-weight: bold; background: #f1f5f9;">
                    <td colspan="4" style="border: 1px solid #e2e8f0; padding: 3px; text-align: right;">Jami to'langan summa:</td>
                    <td style="border: 1px solid #e2e8f0; padding: 3px; color: #1e3a8a;">${t.totalAmount.toLocaleString()} UZS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `;
        }

        const borderClass = item.type === 'consultation' ? 'border-left: 4px solid #3b82f6;'
          : item.type === 'lab' ? 'border-left: 4px solid #10b981;'
          : item.type === 'ward' ? 'border-left: 4px solid #14b8a6;'
          : item.type === 'billing' ? 'border-left: 4px solid #f59e0b;'
          : 'border-left: 4px solid #64748b;';

        const badgeColor = item.type === 'consultation' ? 'background: #eff6ff; color: #1e40af;'
          : item.type === 'lab' ? 'background: #ecfdf5; color: #065f46;'
          : item.type === 'ward' ? 'background: #f0fdfa; color: #115e59;'
          : item.type === 'billing' ? 'background: #fffbeb; color: #92400e;'
          : 'background: #f1f5f9; color: #334155;';

        historyHtml += `
          <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 12px; page-break-inside: avoid; background: white; ${borderClass}">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 8px;">
              <div>
                <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; ${badgeColor}">
                  ${item.title}
                </span>
                <span style="font-size: 10px; color: #64748b; margin-left: 8px; font-weight: bold;">${itemDate}</span>
              </div>
              <span style="font-size: 9px; font-weight: bold; color: #475569;">${item.subtitle}</span>
            </div>
            
            <div style="font-size: 11px; color: #1e293b;">
              <strong>Katalog ma'lumoti:</strong> ${item.meta}
            </div>

            ${specificDetailsHtml}
          </div>
        `;
      });
    }

    const innerContent = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          #print-preview-content-area, .clinic-print-container {
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            color: #1e293b !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
          }
          .clinic-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px double #0f172a;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .clinic-info {
            text-align: left;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: 800;
            color: #1e3a8a;
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
            margin-bottom: 15px;
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
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 15px;
          }
          .patient-card-title {
            font-size: 10px;
            font-weight: 800;
            color: #1e293b;
            text-transform: uppercase;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin: 0 0 8px 0;
            letter-spacing: 0.5px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .patient-info-table {
            width: 100%;
            border-collapse: collapse;
          }
          .patient-info-table td {
            padding: 3px 0;
            vertical-align: top;
          }
          .patient-info-table td.label {
            width: 38%;
            color: #64748b;
            font-weight: 600;
          }
          .patient-info-table td.value {
            width: 62%;
            color: #0f172a;
            font-weight: 700;
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
            padding: 10px;
            width: 45%;
            text-align: center;
          }
          .stamp-placeholder {
            margin: 10px auto 5px auto;
            border: 1px solid #cbd5e1;
            width: 45px;
            height: 45px;
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
            margin-top: 20px;
          }
          
          /* Custom styles for medical content inside the document */
          .visit-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .visit-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .visit-date {
            font-weight: 700;
            color: #0f172a;
          }
          .visit-doctor {
            font-size: 10px;
            color: #475569;
          }
          .visit-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .visit-section-title {
            font-size: 10px;
            font-weight: 700;
            color: #1e3a8a;
            text-transform: uppercase;
            margin-bottom: 4px;
            border-bottom: 1px dashed #e2e8f0;
            padding-bottom: 2px;
          }
          .visit-section-text {
            color: #334155;
            font-size: 10px;
            line-height: 1.3;
          }
          .recipe-item {
            background: #f8fafc;
            border-left: 3px solid #10b981;
            padding: 4px 8px;
            margin-bottom: 4px;
            border-radius: 0 6px 6px 0;
          }
        </style>

        <div class="clinic-header">
          <div class="clinic-info">
            <div class="clinic-name">${clinic.name}</div>
            <div class="clinic-details">
              📍 ${clinic.address || 'Klinika manzili'} &nbsp;|&nbsp; 📞 ${clinic.phone || 'Telefon raqam'}<br>
              ✉️ ${clinic.email || 'info@clinic.uz'} &nbsp;|&nbsp; 🌐 www.clinic.uz
            </div>
          </div>
          <div class="document-meta">
            Bemor karta raqami: <strong>${selectedPatient.patientNumber}</strong><br>
            Sana: <strong>${new Date().toLocaleDateString('uz-UZ')}</strong><br>
            Chop etildi: <strong>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
        </div>

        <div class="report-title-container">
          <h2 class="report-title">BEMORNING AMBULATOR TIBBIY AMAL KARTASI (PASSPORTI)</h2>
          <div class="report-subtitle">Barcha ko'riklar, tashxislar, laboratoriya tahlillari va retseptlar tarixi jamlanmasi</div>
        </div>

        <div class="patient-card">
          <h3 class="patient-card-title">Bemor haqida umumiy ma'lumotlar (Tibbiy Passport)</h3>
          <div class="grid-2">
            <div>
              <table class="patient-info-table">
                <tr>
                  <td class="label">Bemor F.I.SH:</td>
                  <td class="value" style="color: #1e3a8a; font-size: 12px;">${selectedPatient.fullName}</td>
                </tr>
                <tr>
                  <td class="label">Tug'ilgan sana:</td>
                  <td class="value">${selectedPatient.birthDate ? new Date(selectedPatient.birthDate).toLocaleDateString('uz-UZ') : '—'} (${patientAge} yosh)</td>
                </tr>
                <tr>
                  <td class="label">Jinsi:</td>
                  <td class="value">${selectedPatient.gender === 'male' ? 'Erkak' : selectedPatient.gender === 'female' ? 'Ayol' : '—'}</td>
                </tr>
                <tr>
                  <td class="label">Telefon raqam:</td>
                  <td class="value">${selectedPatient.phone || '—'}</td>
                </tr>
              </table>
            </div>
            <div>
              <table class="patient-info-table">
                <tr>
                  <td class="label">Pasport/ID:</td>
                  <td class="value">${selectedPatient.passportId || '—'}</td>
                </tr>
                <tr>
                  <td class="label">Allergiyalar:</td>
                  <td class="value" style="color: #b91c1c;">${allergiesStr}</td>
                </tr>
                <tr>
                  <td class="label">Surunkali kasalliklar:</td>
                  <td class="value" style="color: #b91c1c;">${chronicStr}</td>
                </tr>
                <tr>
                  <td class="label">Qon guruhi:</td>
                  <td class="value">${selectedPatient.bloodGroup || '—'}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Timeline Chronology of Events -->
        <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 3px; margin: 20px 0 10px 0; font-weight: 800;">
          Murojaatlar va Muolajalar Xronologiyasi
        </h3>
        
        ${historyHtml}

        <div class="report-footer">
          <div class="footer-stamps">
            <div class="stamp-box">
              <strong>Mas'ul Shifokor imzosi</strong>
              <div style="margin-top: 10px;">_________________________ / (F.I.SH.)</div>
              <div class="stamp-placeholder">M.O'.</div>
              <div style="font-size: 8px; color: #94a3b8; margin-top: 4px;">Shifokor shaxsiy muassasa muhri</div>
            </div>
            
            <div class="stamp-box">
              <strong>Klinika Rahbariyati / Bosh hamshira</strong>
              <div style="margin-top: 10px;">_________________________ / (F.I.SH.)</div>
              <div class="stamp-placeholder" style="border: 2px double #94a3b8;">M.P.</div>
              <div style="font-size: 8px; color: #94a3b8; margin-top: 4px;">Klinika rasmiy yumaloq muhri</div>
            </div>
          </div>
          
          <div class="system-watermark">
            Ushbu ambulator hisobot elektron tibbiy arxiv (E-TIBBIYOT CRM) tomonidan ${new Date().toLocaleString('uz-UZ')} da chop etildi.<br>
            Bemorga oid ma'lumotlarning sir saqlanishi shaxsiy daxlsizlik qonunlariga muvofiq kafolatlanadi.
          </div>
        </div>
    `;

    if (!includeShell) {
      return innerContent;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Klinik Passport - ${selectedPatient.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1e293b;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
          }
          .clinic-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px double #0f172a;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .clinic-info {
            text-align: left;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: 800;
            color: #1e3a8a;
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
            margin-bottom: 15px;
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
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 15px;
          }
          .patient-card-title {
            font-size: 10px;
            font-weight: 800;
            color: #1e293b;
            text-transform: uppercase;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin: 0 0 8px 0;
            letter-spacing: 0.5px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .patient-info-table {
            width: 100%;
            border-collapse: collapse;
          }
          .patient-info-table td {
            padding: 3px 0;
            vertical-align: top;
          }
          .patient-info-table td.label {
            width: 38%;
            color: #64748b;
            font-weight: 600;
          }
          .patient-info-table td.value {
            width: 62%;
            color: #0f172a;
            font-weight: 700;
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
            padding: 10px;
            width: 45%;
            text-align: center;
          }
          .stamp-placeholder {
            margin: 10px auto 5px auto;
            border: 1px solid #cbd5e1;
            width: 45px;
            height: 45px;
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
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        ${innerContent}
      </body>
      </html>
    `;
    /*
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Klinik Passport - ${selectedPatient.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1e293b;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
          }
          .clinic-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px double #0f172a;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          .clinic-info {
            text-align: left;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: 800;
            color: #1e3a8a;
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
            margin-bottom: 15px;
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
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 15px;
          }
          .patient-card-title {
            font-size: 10px;
            font-weight: 800;
            color: #1e293b;
            text-transform: uppercase;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin: 0 0 8px 0;
            letter-spacing: 0.5px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .patient-info-table {
            width: 100%;
            border-collapse: collapse;
          }
          .patient-info-table td {
            padding: 3px 0;
            vertical-align: top;
          }
          .patient-info-table td.label {
            width: 38%;
            color: #64748b;
            font-weight: 600;
          }
          .patient-info-table td.value {
            width: 62%;
            color: #0f172a;
            font-weight: 700;
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
            padding: 10px;
            width: 45%;
            text-align: center;
          }
          .stamp-placeholder {
            margin: 10px auto 5px auto;
            border: 1px solid #cbd5e1;
            width: 45px;
            height: 45px;
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
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="clinic-header">
          <div class="clinic-info">
            <div class="clinic-name">${clinic.name}</div>
            <div class="clinic-details">
              📍 ${clinic.address || 'Klinika manzili'} &nbsp;|&nbsp; 📞 ${clinic.phone || 'Telefon raqam'}<br>
              ✉️ ${clinic.email || 'info@clinic.uz'} &nbsp;|&nbsp; 🌐 www.clinic.uz
            </div>
          </div>
          <div class="document-meta">
            Bemor karta raqami: <strong>${selectedPatient.patientNumber}</strong><br>
            Sana: <strong>${new Date().toLocaleDateString('uz-UZ')}</strong><br>
            Chop etildi: <strong>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
        </div>

        <div class="report-title-container">
          <h2 class="report-title">BEMORNING AMBULATOR TIBBIY AMAL KARTASI (PASSPORTI)</h2>
          <div class="report-subtitle">Barcha ko'riklar, tashxislar, laboratoriya tahlillari va retseptlar tarixi jamlanmasi</div>
        </div>

        <div class="patient-card">
          <h4 class="patient-card-title">Bemorning Shaxsiy Ma'lumotlari</h4>
          <div class="grid-2">
            <table class="patient-info-table">
              <tr>
                <td class="label">Bemor F.I.SH:</td>
                <td class="value">${selectedPatient.fullName}</td>
              </tr>
              <tr>
                <td class="label">Tug'ilgan sana / Yosh:</td>
                <td class="value">${selectedPatient.birthDate} (${patientAge} yosh)</td>
              </tr>
              <tr>
                <td class="label">Jinsi:</td>
                <td class="value">${selectedPatient.gender === 'male' ? 'Erkak' : 'Ayol'}</td>
              </tr>
              <tr>
                <td class="label">Telefon raqami:</td>
                <td class="value">${selectedPatient.phone}</td>
              </tr>
            </table>

            <table class="patient-info-table">
              <tr>
                <td class="label">Passport / JSHSHIR:</td>
                <td class="value">${selectedPatient.passportOrPin || 'Kiritilmagan'}</td>
              </tr>
              <tr>
                <td class="label">Qon guruhi:</td>
                <td class="value">${selectedPatient.bloodGroup || 'Aniqlanmagan'}</td>
              </tr>
              <tr>
                <td class="label">Allergiyalar:</td>
                <td class="value" style="color: ${allergiesStr !== 'Yo\'q' ? '#e11d48' : 'inherit'}; font-weight: bold;">${allergiesStr}</td>
              </tr>
              <tr>
                <td class="label">Surunkali kasalliklar:</td>
                <td class="value" style="color: ${chronicStr !== 'Yo\'q' ? '#d97706' : 'inherit'}; font-weight: bold;">${chronicStr}</td>
              </tr>
            </table>
          </div>
        </div>

        <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; margin: 15px 0 10px 0; border-bottom: 2px solid #334155; padding-bottom: 4px; color: #0f172a;">
          Tibbiy Xronologiya & Muolajalar Tarixi
        </h3>

        <div>
          ${historyHtml}
        </div>

        <div class="report-footer">
          <div class="footer-stamps">
            <div class="stamp-box">
              <strong>Mas'ul Shifokor imzosi</strong>
              <div style="margin-top: 10px;">_________________________ / (F.I.SH.)</div>
              <div class="stamp-placeholder">M.O'.</div>
              <div style="font-size: 8px; color: #94a3b8; margin-top: 4px;">Shifokor shaxsiy muassasa muhri</div>
            </div>
            
            <div class="stamp-box">
              <strong>Klinika Rahbariyati / Bosh hamshira</strong>
              <div style="margin-top: 10px;">_________________________ / (F.I.SH.)</div>
              <div class="stamp-placeholder" style="border: 2px double #94a3b8;">M.P.</div>
              <div style="font-size: 8px; color: #94a3b8; margin-top: 4px;">Klinika rasmiy yumaloq muhri</div>
            </div>
          </div>
          
          <div class="system-watermark">
            Ushbu ambulator hisobot elektron tibbiy arxiv (E-TIBBIYOT CRM) tomonidan ${new Date().toLocaleString('uz-UZ')} da chop etildi.<br>
            Bemorga oid ma'lumotlarning sir saqlanishi shaxsiy daxlsizlik qonunlariga muvofiq kafolatlanadi.
          </div>
        </div>
      </body>
      </html>
    `;
    */
  };

  // Trigger preview modal to allow direct download and popup-sandbox free print
  const handlePrintComprehensiveHistory = () => {
    setShowPrintPreviewModal(true);
  };

  const handleDownloadAmbulatoryPdf = () => {
    if (!selectedPatient) return;
    setIsGeneratingPdf(true);
    
    // Create an isolated temporary iframe to avoid parsing the massive global Tailwind CSS stylesheet.
    // This reduces the CSS parsing overhead for html2canvas from ~15,000 selectors down to just our 50 custom selectors.
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.setAttribute('title', 'PDF Export Sandboxed Frame');
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) {
      setIsGeneratingPdf(false);
      document.body.removeChild(iframe);
      return;
    }

    // Write the clean standalone HTML shell into the isolated frame document.
    iframeDoc.open();
    iframeDoc.write(getAmbulatoryHtmlContent(true));
    iframeDoc.close();

    // Allow resources and styles to bind inside the iframe document before initiating canvas compilation.
    setTimeout(() => {
      const elementToPrint = iframeDoc.body;
      if (!elementToPrint) {
        setIsGeneratingPdf(false);
        document.body.removeChild(iframe);
        return;
      }

      const opt = {
        margin:       10, // 10mm margins on A4 paper page boundaries
        filename:     `Ambulator_Karta_${selectedPatient.fullName.replace(/\s+/g, '_')}_${selectedPatient.patientNumber}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 1.5, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      html2pdf()
        .from(elementToPrint)
        .set(opt)
        .save()
        .then(() => {
          setIsGeneratingPdf(false);
          document.body.removeChild(iframe);
        })
        .catch((err: any) => {
          console.error("PDF generation error: ", err);
          setIsGeneratingPdf(false);
          document.body.removeChild(iframe);
        });
    }, 350);
  };

  const handlePrintInNewTab = () => {
    if (!selectedPatient) return;
    const rawHtml = getAmbulatoryHtmlContent();
    const printableHtml = rawHtml.replace(
      '</body>',
      `
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 300);
        };
      </script>
      </body>
      `
    );

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printableHtml);
      printWindow.document.close();
    } else {
      alert("Iltimos, brauzeringizda qalqib chiquvchi oynalarga (Pop-ups) ruxsat bering va qaytadan urining.");
    }
  };

  return (
    <div className="space-y-4 text-left animate-in fade-in duration-200">
      {/* Header Area with Title & Unified QR Code Scanner Trigger */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Markaziy Bemorlar Tarixi & Tibbiy Registr</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ro'yxatdan o'tishdan boshlab barcha tashxislar, ko'riklar, retseptlar va statsionar palata muolajalari avtomatik arxivlanadi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Webcam Scanner Button */}
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <QrCode className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Kamera orqali QR Kod Skanerlash</span>
          </button>
        </div>
      </div>

      {/* Grid: Search & Patients Directory (Left) and Timeline View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Search & Directory List */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Bemorni Qidirish (Ism, Telefon, ID yoki Pasport)</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ism, familiya, tel yoki P-2026-001..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:outline-hidden focus:border-blue-500 focus:bg-white focus:shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bemorlar Ro'yxati ({filteredPatients.length} ta)</div>
            
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Hech qanday bemor topilmadi.
              </div>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = selectedPatientId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-blue-600/10 border-blue-500/50 shadow-xs' 
                        : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-base">
                          {p.gender === 'male' ? '👨' : '👩'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{p.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                            ID: {p.patientNumber} | {p.gender === 'male' ? 'Erkak' : 'Ayol'}
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded bg-slate-200/60 text-slate-800 font-bold text-[9px]">
                        {p.totalVisits} ta tashrif
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-semibold">
                      <div>📞 {p.phone}</div>
                      <div className="text-right">🎂 {p.birthDate}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Medical Dossier View */}
        <div className="lg:col-span-7 space-y-4">
          {selectedPatient ? (
            <div className="space-y-4">
              {/* Patient Header Card */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-2xl">
                      {selectedPatient.gender === 'male' ? '👨' : '👩'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white">{selectedPatient.fullName}</h3>
                        <span className="px-1.5 py-0.5 bg-blue-500/30 text-blue-300 rounded font-mono text-[10px] font-bold">
                          {selectedPatient.patientNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Tug'ilgan sana: <strong className="text-white">{selectedPatient.birthDate}</strong> | Jinsi: {selectedPatient.gender === 'male' ? 'Erkak' : 'Ayol'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrintComprehensiveHistory}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer self-start sm:self-center"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Ambulator Kartani PDF Yuklash</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10 text-[10px]">
                  <div>
                    <div className="text-slate-400 font-bold uppercase tracking-wider">Telefon raqam</div>
                    <div className="font-extrabold text-white mt-0.5">{selectedPatient.phone}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold uppercase tracking-wider">Pasport / PINFL</div>
                    <div className="font-extrabold text-white mt-0.5">{selectedPatient.passportOrPin || 'Yo\'q'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold uppercase tracking-wider">Allergiyalar</div>
                    <div className="font-extrabold text-rose-300 mt-0.5 truncate" title={selectedPatient.allergies?.join(', ')}>
                      {selectedPatient.allergies?.join(', ') || "Yo'q"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold uppercase tracking-wider font-mono">Qon Guruhi</div>
                    <div className="font-extrabold text-white mt-0.5">{selectedPatient.bloodGroup || 'Kiritilmagan'}</div>
                  </div>
                </div>
              </div>

              {/* Patient Timeline Feed */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-blue-500" />
                    <span>To'liq Muolajalar & Tashriflar Tarixi ({patientTimeline.length} ta hodisa)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">Chronological Archive</span>
                </div>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {patientTimeline.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-bold text-xs italic">
                      Ushbu bemor uchun hozircha tibbiy tarix yozuvlari mavjud emas.
                    </div>
                  ) : (
                    patientTimeline.map((item) => {
                      const Icon = item.type === 'checkin' ? User
                        : item.type === 'consultation' ? Activity
                        : item.type === 'lab' ? FlaskConical
                        : item.type === 'ward' ? Bed
                        : CreditCard;

                      const colorClasses = item.type === 'checkin' ? 'bg-blue-100 text-blue-600 border-blue-200'
                        : item.type === 'consultation' ? 'bg-purple-100 text-purple-600 border-purple-200'
                        : item.type === 'lab' ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
                        : item.type === 'ward' ? 'bg-teal-100 text-teal-600 border-teal-200'
                        : 'bg-amber-100 text-amber-600 border-amber-200';

                      const dateObj = new Date(item.date);
                      const formattedDate = dateObj.toLocaleDateString('uz-UZ', { month: '2-digit', day: '2-digit' });
                      const formattedTime = dateObj.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div key={item.id} className="relative pl-8 flex gap-4 text-xs group">
                          {/* Dot Icon */}
                          <div className={`absolute left-0 top-1 w-7.5 h-7.5 rounded-full border flex items-center justify-center z-10 ${colorClasses} shadow-xs`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          {/* Content Card */}
                          <div className="flex-1 bg-slate-50/60 group-hover:bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl transition-all text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2.5">
                              <div>
                                <span className="font-extrabold text-slate-900">{item.title}</span>
                                <div className="text-[10px] text-slate-500 font-bold mt-0.5">{item.subtitle}</div>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-[9px] font-black text-slate-500 bg-slate-200/50 px-1.5 py-0.5 rounded-md">
                                  {formattedDate} | {formattedTime}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                              {item.meta}
                            </p>

                            {/* Collapsible/Details Render Area */}
                            {item.type === 'consultation' && item.details && (
                              <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 space-y-2 text-[10px]">
                                {item.details.complaints && (
                                  <div>
                                    <strong className="text-slate-800">Shikoyat:</strong> <span className="text-slate-600">{item.details.complaints}</span>
                                  </div>
                                )}
                                {item.details.objectiveExam && (
                                  <div className="bg-slate-100/80 p-1.5 rounded-lg border border-slate-200 flex flex-wrap gap-x-4 gap-y-1 font-bold text-slate-600">
                                    <span>Bosim (BP): <strong className="text-slate-900">{item.details.objectiveExam.bloodPressure || '—'}</strong></span>
                                    <span>Puls: <strong className="text-slate-900">{item.details.objectiveExam.pulse || '—'} bpm</strong></span>
                                    <span>Harorat: <strong className="text-slate-900">{item.details.objectiveExam.temperature || '—'} °C</strong></span>
                                    <span>SpO2: <strong className="text-slate-900">{item.details.objectiveExam.spO2 || '—'} %</strong></span>
                                  </div>
                                )}
                                {item.details.treatmentPlan && (
                                  <div>
                                    <strong className="text-slate-800">Davolash Rejasi:</strong> <p className="text-slate-600 mt-0.5 leading-relaxed bg-white p-2 rounded-lg border border-slate-200/60">{item.details.treatmentPlan}</p>
                                  </div>
                                )}
                                {item.details.prescriptions && item.details.prescriptions.length > 0 && (
                                  <div className="space-y-1">
                                    <strong className="text-slate-800">Yozilgan dori-darmonlar (Rp):</strong>
                                    <div className="flex flex-wrap gap-1">
                                      {item.details.prescriptions.map((pr: any) => (
                                        <span key={pr.id} className="inline-block bg-purple-100 text-purple-950 font-bold border border-purple-200 rounded px-1.5 py-0.5 text-[9px]">
                                          💊 {pr.drugName} ({pr.dosage}) - {pr.frequency}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {item.type === 'lab' && item.details && item.details.parameters && (
                              <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 space-y-1 text-[10px]">
                                <strong className="text-slate-800">Tahlil Parametrlari qiymati:</strong>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                                  {item.details.parameters.map((p: any, idx: number) => (
                                    <div key={idx} className={`p-1.5 rounded-md border flex justify-between items-center ${p.isAbnormal ? 'bg-red-50 border-red-200/60 text-red-900' : 'bg-white border-slate-200 text-slate-800'}`}>
                                      <span className="font-semibold">{p.name}:</span>
                                      <span className="font-extrabold">{p.value} {p.unit} {p.isAbnormal ? '⚠️' : ''}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
              <History className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
              <h3 className="font-extrabold text-slate-800 text-sm">Bemor Tarixini Ko'rish</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Chap tarafdagi bemorlar ro'yxatidan bemorni tanlang yoki uning QR kodini skanerlang. Barcha tashriflar, xizmatlar, shifokor ko'riklari, laboratoriya javoblari va kassa kvitansiyalari markaziy tizimda jamlanadi.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Web Camera View Overlay Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-800 shadow-2xl flex flex-col">
            <div className="px-5 py-3.5 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black uppercase tracking-wider">Kamera QR Skaneri</span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-72 h-72 bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {/* Active scan red/green line */}
                <div className="absolute inset-x-0 h-0.5 bg-green-500 animate-bounce top-1/2 z-20 shadow-[0_0_8px_#22c55e]"></div>
                
                {/* Visual Camera target brackets */}
                <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-green-500 z-10 rounded-tl-md"></div>
                <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-green-500 z-10 rounded-tr-md"></div>
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-green-500 z-10 rounded-bl-md"></div>
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-green-500 z-10 rounded-br-md"></div>

                {scannerError ? (
                  <div className="p-4 text-center text-slate-400 text-xs font-bold leading-relaxed">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <span>{scannerError}</span>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Simulation Quick triggers for mock QR Codes */}
              <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Bemor QR Kodlarini Skanerlashni Simulyatsiya Qilish:</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {patients.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSimulateScan(p.patientNumber)}
                      className="px-2 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold border border-blue-500/30 rounded-lg truncate cursor-pointer transition-all"
                    >
                      {p.fullName} ({p.patientNumber})
                    </button>
                  ))}
                </div>
              </div>

              {scanResult && (
                <div className="p-3 bg-green-600/20 border border-green-500/40 text-green-300 rounded-xl text-center text-xs font-black w-full">
                  {scanResult}
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Interactive Print Preview Modal */}
      {showPrintPreviewModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-black uppercase tracking-wider">Tibbiy Karta Chop Etish & Yuklash Tizimi</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Control Panel */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-left">
                <h4 className="text-xs font-extrabold text-slate-900">{selectedPatient.fullName}</h4>
                <p className="text-[10px] text-slate-500 font-bold">Karta raqami: {selectedPatient.patientNumber}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handlePrintInNewTab}
                  disabled={isGeneratingPdf}
                  className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all ${
                    isGeneratingPdf 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>Chop Etish (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAmbulatoryPdf}
                  disabled={isGeneratingPdf}
                  className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all ${
                    isGeneratingPdf 
                      ? 'bg-emerald-400 cursor-not-allowed animate-pulse' 
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer'
                  }`}
                >
                  <FileText className="w-4 h-4 animate-bounce" />
                  <span>{isGeneratingPdf ? 'PDF Tayyorlanmoqda...' : 'Faylni Yuklab Olish (PDF)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintPreviewModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            </div>

            {/* Print Preview Canvas Frame */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
              <div 
                id="print-preview-content-area"
                className="bg-white shadow-xl border border-slate-300 p-10 w-full max-w-[210mm] min-h-[297mm] text-slate-800 rounded-lg text-left overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: getAmbulatoryHtmlContent(false) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
