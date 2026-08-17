import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Ticket, 
  Printer, 
  Search, 
  Clock, 
  Stethoscope, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Volume2, 
  FileText, 
  AlertCircle,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  QrCode,
  Scan,
  Copy,
  Sparkles,
  Camera,
  Laptop,
  Check,
  Info
} from 'lucide-react';
import { 
  Patient, 
  QueueTicket, 
  StaffMember, 
  MedicalService, 
  PrinterConfig, 
  ClinicProfile,
  ConsultationRecord
} from '../../types';
import { PrinterService } from '../../services/printerService';
import { AudioService } from '../../services/audioService';

interface ReceptionViewProps {
  patients: Patient[];
  queue: QueueTicket[];
  staffList: StaffMember[];
  services: MedicalService[];
  clinic: ClinicProfile;
  printerConfig: PrinterConfig;
  consultations: ConsultationRecord[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'patientNumber' | 'totalVisits' | 'createdAt'>) => Patient;
  onUpdatePatient: (patient: Patient) => void;
  onCreateQueueTicket: (ticketData: Omit<QueueTicket, 'id' | 'ticketNumber' | 'createdAt'>) => QueueTicket;
  onUpdateQueueStatus: (ticketId: string, status: QueueTicket['status']) => void;
}

export const ReceptionView: React.FC<ReceptionViewProps> = ({
  patients,
  queue,
  staffList,
  services,
  clinic,
  printerConfig,
  consultations,
  onAddPatient,
  onUpdatePatient,
  onCreateQueueTicket,
  onUpdateQueueStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'patients' | 'clinical_history'>('queue');
  const [filterDoctor, setFilterDoctor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Clinical Consultation History States
  const [historyPeriodType, setHistoryPeriodType] = useState<'day' | 'month' | 'year' | 'all'>('day');
  const [historyDate, setHistoryDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [historyMonth, setHistoryMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [historyYear, setHistoryYear] = useState<string>(new Date().getFullYear().toString());
  const [historyDoctorId, setHistoryDoctorId] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState<string>('');

  // Modals
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<Patient | null>(null);

  // QR & Quick Scan States
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);
  const [selectedPatientForQRCard, setSelectedPatientForQRCard] = useState<Patient | null>(null);
  const [scanInputValue, setScanInputValue] = useState('');
  const [scanError, setScanError] = useState('');
  const [webcamActive, setWebcamActive] = useState(false);
  const [copiedPatientId, setCopiedPatientId] = useState<string | null>(null);

  // Webcam video ref
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Webcam capture & decode simulation
  React.useEffect(() => {
    if (webcamActive && showQRScannerModal) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        })
        .catch(err => {
          console.error('Kamera ishga tushmadi:', err);
          alert('Kamera ulanmadi yoki ruxsat berilmadi. Simulyatsiya rejimidan foydalanishingiz mumkin.');
          setWebcamActive(false);
        });
    } else {
      stopWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [webcamActive, showQRScannerModal]);

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 1000;
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio context might be blocked or unsupported
    }
  };

  const handleScanSuccess = (patient: Patient) => {
    playBeep();
    setShowQRScannerModal(false);
    stopWebcam();
    setWebcamActive(false);
    setScanInputValue('');
    setScanError('');
    
    // Open Register Queue Visit Modal
    setSelectedPatientForVisit(patient);
    setVisitDoctorId('');
    setVisitServiceId('');
    setShowNewVisitModal(true);
  };

  // New Patient Form state
  const [newPatientForm, setNewPatientForm] = useState({
    fullName: '',
    birthDate: '1990-01-01',
    gender: 'male' as 'male' | 'female',
    phone: '+998 ',
    address: '',
    passportOrPin: '',
    bloodGroup: 'A+ (II)',
    allergies: '',
    chronicDiseases: '',
    balance: 0,
  });

  // New Visit / Ticket Form state
  const [visitDoctorId, setVisitDoctorId] = useState('');
  const [visitServiceId, setVisitServiceId] = useState('');
  const [visitPaymentStatus, setVisitPaymentStatus] = useState<'paid' | 'unpaid'>('paid');

  const [selectedConsultationForDetail, setSelectedConsultationForDetail] = useState<ConsultationRecord | null>(null);

  const handleExportPDF = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    // Get stats
    const totalVisits = filteredConsultations.length;
    const uniquePatientsCount = new Set(filteredConsultations.map(c => c.patientId)).size;
    
    // Group by doctor
    const docVisits: {[key: string]: number} = {};
    filteredConsultations.forEach(c => {
      docVisits[c.doctorName] = (docVisits[c.doctorName] || 0) + 1;
    });
    
    const docStatsStr = Object.entries(docVisits)
      .map(([name, count]) => `<li>${name}: ${count} ta ko'rik</li>`)
      .join('');

    let rowsHtml = '';
    filteredConsultations.forEach((c, idx) => {
      const p = patients.find(pat => pat.id === c.patientId);
      const pName = p ? p.fullName : 'Noma\'lum';
      const pBirth = p ? p.birthDate : '—';
      const pPhone = p ? p.phone : '—';
      const pNo = p ? p.patientNumber : '—';
      
      const presStr = c.prescriptions && c.prescriptions.length > 0
        ? c.prescriptions.map(pr => `${pr.drugName} (${pr.dosage} - ${pr.frequency})`).join(', ')
        : 'Yozilmagan';

      rowsHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold; text-align: center;">${idx + 1}</td>
          <td style="padding: 10px;">
            <div style="font-weight: bold; color: #1e293b; font-size: 12px;">${pName}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">ID: ${pNo} | Tel: ${pPhone} | Tug'ilgan sana: ${pBirth}</div>
          </td>
          <td style="padding: 10px; color: #334155;">
            <strong>${c.doctorName}</strong><br/>
            <span style="font-size: 10px; color: #64748b;">${c.doctorSpecialty}</span>
          </td>
          <td style="padding: 10px; color: #0f172a;">
            <div style="font-weight: bold;">${c.diagnosis}</div>
            ${c.icdCode ? `<div style="font-size: 9px; color: #475569; margin-top: 2px;">ICD-10: ${c.icdCode}</div>` : ''}
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;"><em>Shikoyat:</em> ${c.complaints || 'Yo\'q'}</div>
          </td>
          <td style="padding: 10px; font-size: 11px; color: #334155;">${presStr}</td>
          <td style="padding: 10px; color: #334155; white-space: nowrap; text-align: center;">${(c.date || c.createdAt || '').slice(0, 10)}</td>
        </tr>
      `;
    });

    const reportPeriodText = historyPeriodType === 'day' ? `Kunlik hisobot (${historyDate})`
      : historyPeriodType === 'month' ? `Oylik hisobot (${historyMonth})`
      : historyPeriodType === 'year' ? `Yillik hisobot (${historyYear})`
      : 'Umumiy to\'liq hisobot';

    const htmlContent = `
      <html>
        <head>
          <title>Klinika Tibbiy Ko'riklar Hisoboti</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; font-size: 12px; color: #1e293b; background: white; line-height: 1.4; }
            .header { text-align: center; border-bottom: 3px double #cbd5e1; padding-bottom: 15px; margin-bottom: 20px; }
            .clinic-title { font-size: 22px; font-weight: bold; text-transform: uppercase; color: #1e3a8a; letter-spacing: 0.5px; }
            .report-title { font-size: 15px; font-weight: bold; color: #475569; margin-top: 5px; }
            .meta-section { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .meta-col { flex: 1; }
            .stats-title { font-weight: bold; color: #1e3a8a; margin-bottom: 6px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
            .table-container { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #0f172a; color: white; padding: 12px 10px; text-align: left; font-weight: bold; font-size: 11px; text-transform: uppercase; border: 1px solid #1e293b; }
            td { font-size: 11px; border: 1px solid #e2e8f0; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .sig-box { text-align: center; width: 220px; }
            .sig-line { border-bottom: 1px solid #94a3b8; height: 40px; margin-bottom: 5px; }
            ul { margin: 0; padding-left: 15px; }
            li { margin-bottom: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-title">${clinic.name}</div>
            <div style="color: #64748b; font-size: 11px; margin-top: 4px;">Manzil: ${clinic.address || 'Klinika manzili'} | Tel: ${clinic.phone || 'Klinika telefoni'}</div>
            <div class="report-title">${reportPeriodText}</div>
          </div>
          
          <div class="meta-section">
            <div class="meta-col">
              <div class="stats-title">Ko'riklar Umumiy Statistikasi</div>
              <div style="font-size: 11px; color: #334155;">
                • Jami ko'riklar soni: <strong style="color: #1e3a8a; font-size: 13px;">${totalVisits} ta</strong><br/>
                • Unikal ko'rikdan o'tgan bemorlar: <strong style="color: #1e3a8a; font-size: 13px;">${uniquePatientsCount} ta</strong><br/>
                • Hisobot yuklangan sana: ${new Date().toLocaleString('uz-UZ')}
              </div>
            </div>
            <div class="meta-col" style="border-left: 1px solid #cbd5e1; padding-left: 25px; margin-left: 25px;">
              <div class="stats-title">Shifokorlar Bo'yicha Ko'riklar Soni</div>
              <ul style="font-size: 11px; color: #334155;">
                ${docStatsStr || '<li>Ko\'riklar mavjud emas</li>'}
              </ul>
            </div>
          </div>

          <table class="table-container">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">№</th>
                <th style="width: 30%;">Bemor (F.I.SH, ID & Telefon)</th>
                <th style="width: 20%;">Shifokor & Mutaxassislik</th>
                <th style="width: 25%;">Tashxis & Shikoyat</th>
                <th style="width: 12%;">Yozilgan Retsept</th>
                <th style="width: 8%; text-align: center;">Sana</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="6" style="text-align: center; padding: 25px; color: #94a3b8; font-style: italic;">Ushbu davr bo\'yicha hech qanday ko\'rik ma\'lumoti topilmadi.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <div class="sig-box">
              <div class="sig-line"></div>
              <strong>Bosh Shifokor</strong>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <strong>Mas'ul Registrator</strong>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.parent.document.body.removeChild(window.frameElement);
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();
  };

  const doctorsList = staffList.filter(s => s.role === 'doctor' || s.role === 'admin');

  // Filtered Queue
  const filteredQueue = queue.filter(item => {
    if (filterDoctor !== 'all' && item.doctorId !== filterDoctor) return false;
    if (filterStatus === 'active') {
      if (item.status === 'completed' || item.status === 'cancelled') return false;
    } else if (filterStatus !== 'all' && item.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.patientName.toLowerCase().includes(q) ||
        item.ticketNumber.toLowerCase().includes(q) ||
        item.patientPhone.includes(q)
      );
    }
    return true;
  });

  // Filtered Patients
  const filteredPatients = patients.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.patientNumber.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.passportOrPin.toLowerCase().includes(q)
    );
  });

  // Filtered consultations for clinical diagnostics history database
  const filteredConsultations = (consultations || []).filter(c => {
    // 1. Doctor filter
    if (historyDoctorId !== 'all' && c.doctorId !== historyDoctorId) {
      return false;
    }

    // 2. Date/Period filter
    const cDateStr = c.date || c.createdAt; // e.g. "2026-08-17"
    if (!cDateStr) return false;
    
    if (historyPeriodType === 'day') {
      if (!cDateStr.startsWith(historyDate)) return false;
    } else if (historyPeriodType === 'month') {
      if (!cDateStr.startsWith(historyMonth)) return false;
    } else if (historyPeriodType === 'year') {
      if (!cDateStr.startsWith(historyYear)) return false;
    }

    // 3. Search query
    if (historySearch.trim()) {
      const qs = historySearch.toLowerCase();
      const p = patients.find(pat => pat.id === c.patientId);
      const pName = p ? p.fullName.toLowerCase() : '';
      const pNum = p ? p.patientNumber.toLowerCase() : '';
      const pPhone = p ? p.phone : '';
      
      const diagnosisMatch = (c.diagnosis || '').toLowerCase().includes(qs);
      const complaintsMatch = (c.complaints || '').toLowerCase().includes(qs);
      const docMatch = (c.doctorName || '').toLowerCase().includes(qs);
      const treatmentMatch = (c.treatmentPlan || '').toLowerCase().includes(qs);

      return (
        pName.includes(qs) ||
        pNum.includes(qs) ||
        pPhone.includes(qs) ||
        diagnosisMatch ||
        complaintsMatch ||
        docMatch ||
        treatmentMatch
      );
    }

    return true;
  });

  // Real-time duplicate matches based on name, phone, or passport
  const duplicateMatches = (() => {
    const phoneClean = newPatientForm.phone.replace(/[^0-9]/g, '');
    const passportClean = newPatientForm.passportOrPin.trim().toLowerCase();
    const nameClean = newPatientForm.fullName.trim().toLowerCase();
    
    if (phoneClean.length < 5 && nameClean.length < 3 && passportClean.length < 3) {
      return [];
    }

    return patients.filter(p => {
      const pPhoneClean = p.phone.replace(/[^0-9]/g, '');
      const pPassportClean = (p.passportOrPin || '').trim().toLowerCase();
      const pNameClean = p.fullName.trim().toLowerCase();

      if (passportClean && pPassportClean && pPassportClean === passportClean) {
        return true;
      }
      if (phoneClean.length >= 7 && pPhoneClean.endsWith(phoneClean.slice(-7))) {
        return true;
      }
      if (nameClean.length >= 3 && pNameClean === nameClean) {
        return true;
      }
      return false;
    });
  })();

  // Handle New Patient Submit
  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.fullName.trim() || !newPatientForm.phone.trim()) {
      alert('Iltimos, bemor ismi va telefonini kiriting.');
      return;
    }

    // Intercept duplicate creation and auto-select existing profile
    const existing = duplicateMatches[0];
    if (existing) {
      alert(`DIQQAT: ${existing.fullName} ismli bemor tizimda mavjud! Barcha tibbiy tarixlarni saqlab qolish uchun yangi profil yaratish bekor qilindi va ushbu bemorning qabulga yozilish oynasi avtomatik ochildi.`);
      setShowNewPatientModal(false);
      setSelectedPatientForVisit(existing);
      setVisitDoctorId('');
      setVisitServiceId('');
      setShowNewVisitModal(true);
      
      // Reset form
      setNewPatientForm({
        fullName: '',
        birthDate: '1990-01-01',
        gender: 'male',
        phone: '+998 ',
        address: '',
        passportOrPin: '',
        bloodGroup: 'A+ (II)',
        allergies: '',
        chronicDiseases: '',
        balance: 0,
      });
      return;
    }

    const created = onAddPatient({
      clinicId: clinic.id,
      fullName: newPatientForm.fullName.trim(),
      birthDate: newPatientForm.birthDate,
      gender: newPatientForm.gender,
      phone: newPatientForm.phone.trim(),
      address: newPatientForm.address.trim(),
      passportOrPin: newPatientForm.passportOrPin.trim(),
      bloodGroup: newPatientForm.bloodGroup,
      allergies: newPatientForm.allergies ? newPatientForm.allergies.split(',').map(s => s.trim()) : [],
      chronicDiseases: newPatientForm.chronicDiseases ? newPatientForm.chronicDiseases.split(',').map(s => s.trim()) : [],
      balance: Number(newPatientForm.balance) || 0,
    });

    setShowNewPatientModal(false);
    // Reset form
    setNewPatientForm({
      fullName: '',
      birthDate: '1990-01-01',
      gender: 'male',
      phone: '+998 ',
      address: '',
      passportOrPin: '',
      bloodGroup: 'A+ (II)',
      allergies: '',
      chronicDiseases: '',
      balance: 0,
    });

    // Automatically prompt to create visit
    setSelectedPatientForVisit(created);
    setShowNewVisitModal(true);
  };

  // Handle Create Queue Visit
  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForVisit) return;

    const doc = doctorsList.find(d => d.id === visitDoctorId) || doctorsList[0];
    const srv = services.find(s => s.id === visitServiceId) || services[0];

    const price = srv ? srv.price : (doc?.consultationFee || 100000);
    const doctorName = doc ? doc.fullName : 'Navbatchi Shifokor';
    const doctorSpecialty = doc?.specialty || 'Konsultatsiya';
    const roomNumber = doc?.roomNumber || '1-qabul xonasi';
    const serviceName = srv ? srv.name : 'Shifokor Ko\'rigi';

    const ticket = onCreateQueueTicket({
      clinicId: clinic.id,
      patientId: selectedPatientForVisit.id,
      patientName: selectedPatientForVisit.fullName,
      patientPhone: selectedPatientForVisit.phone,
      doctorId: doc?.id || 'doc_general',
      doctorName,
      doctorSpecialty,
      roomNumber,
      serviceId: srv?.id,
      serviceName,
      price,
      status: 'waiting',
      paymentStatus: visitPaymentStatus,
      paidAmount: visitPaymentStatus === 'paid' ? price : 0,
      estimatedWaitMinutes: 15,
    });

    setShowNewVisitModal(false);
    setSelectedPatientForVisit(null);

    // Auto print ticket via Xprinter
    PrinterService.printQueueTicket(ticket, clinic, printerConfig);
  };

  const handleCallPatient = (ticket: QueueTicket) => {
    onUpdateQueueStatus(ticket.id, 'in_consultation');
    AudioService.announceQueueCall(ticket.ticketNumber, ticket.roomNumber, ticket.doctorName);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Registratura va Qabulxona Moduli</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bemorlarni ro'yxatga olish, qabulga yozish, navbat talonlarini Xprinter orqali chop etish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowQRScannerModal(true);
              setScanInputValue('');
              setScanError('');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="QR kodni skanerlash orqali tezkor qabulga yozish"
          >
            <Scan className="w-4 h-4" />
            <span>QR Kod Skanyer</span>
          </button>

          <button
            onClick={() => setShowNewPatientModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Yangi Bemor Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Ticket className="w-4 h-4 text-blue-400" />
            <span>Elektron Navbat Ro'yxati ({queue.filter(q => q.status === 'waiting' || q.status === 'in_consultation').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'patients'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Bemorlar Bazasi ({patients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clinical_history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'clinical_history'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Ko'riklar va Tashxislar Bazasi ({consultations.length})</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500 w-48 sm:w-64"
            />
          </div>

          {activeTab === 'queue' && (
            <>
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="all">Barcha Shifokorlar</option>
                {doctorsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.specialty})
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="active">Faol Navbatlar</option>
                <option value="waiting">Faqat Kutayotganlar</option>
                <option value="in_consultation">Qabuldagilar</option>
                <option value="completed">Yakunlanganlar</option>
                <option value="all">Barchasi (Tarix)</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'queue' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Talon №</th>
                  <th className="py-3 px-4">Bemor F.I.SH</th>
                  <th className="py-3 px-4">Shifokor & Xona</th>
                  <th className="py-3 px-4">Xizmat</th>
                  <th className="py-3 px-4">Summa & To'lov</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Ticket className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                      <div className="font-semibold text-slate-600">Hozircha navbatda bemorlar yo'q</div>
                      <div className="text-xs text-slate-400 mt-1">Yangi bemorni ro'yxatga olib, navbatga qo'shing.</div>
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.status === 'in_consultation' ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-black text-sm">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-xs">
                          {item.ticketNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{item.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{item.patientPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{item.doctorName}</div>
                        <div className="text-[10px] text-blue-600 font-medium">
                          {item.doctorSpecialty} • <span className="underline">{item.roomNumber}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {item.serviceName}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <div>{(item.price ?? 0).toLocaleString()} {clinic.currencySymbol}</div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.paymentStatus === 'paid' ? 'To\'langan' : 'To\'lanmagan'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.status === 'waiting' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                            <Clock className="w-3 h-3" /> Kutmoqda
                          </span>
                        )}
                        {item.status === 'in_consultation' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 animate-pulse">
                            <Stethoscope className="w-3 h-3 text-emerald-700" /> Qabulda
                          </span>
                        )}
                        {item.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Yakunlandi
                          </span>
                        )}
                        {item.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                            <XCircle className="w-3 h-3 text-rose-600" /> Bekor qilindi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Chaqirish (Announce & Call) */}
                          <button
                            onClick={() => handleCallPatient(item)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                            title="Ovozli chaqirish va Qabulga o'tkazish"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Print Xprinter Ticket */}
                          <button
                            onClick={() => PrinterService.printQueueTicket(item, clinic, printerConfig)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Xprinter talonini chop etish"
                          >
                            <Printer className="w-4 h-4 text-slate-800" />
                          </button>

                          {/* Status buttons */}
                          {item.status === 'in_consultation' && (
                            <button
                              onClick={() => onUpdateQueueStatus(item.id, 'completed')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Tugatish
                            </button>
                          )}

                          {item.status === 'waiting' && (
                            <button
                              onClick={() => onUpdateQueueStatus(item.id, 'cancelled')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Bekor qilish"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Patients Directory */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Bemor ID</th>
                  <th className="py-3 px-4">F.I.SH</th>
                  <th className="py-3 px-4">Tug'ilgan sana & Jinsi</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Passport / JSHSHIR</th>
                  <th className="py-3 px-4">Tashriflar soni</th>
                  <th className="py-3 px-4 text-right">Qabulga yozish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Bemorlar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">{p.patientNumber}</span>
                          <button
                            onClick={() => setSelectedPatientForQRCard(p)}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-all cursor-pointer"
                            title="Bemor raqamli QR pasportini ochish"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {p.fullName}
                        {p.allergies && p.allergies.length > 0 && (
                          <div className="text-[10px] text-rose-600 font-normal">
                            Allergiya: {p.allergies.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.birthDate} • {p.gender === 'male' ? 'Erkak' : 'Ayol'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {p.phone}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {p.passportOrPin || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {p.totalVisits} marta
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedPatientForVisit(p);
                            setShowNewVisitModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Navbatga Qo'shish</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'clinical_history' && (
        <div className="space-y-4 animate-in fade-in duration-200 text-left">
          {/* Filters and Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Tibbiy Tashxislar va Ko'riklar Reyestri</h3>
                <p className="text-[11px] text-slate-500">Filtrlangan davrdagi barcha davolangan bemorlar, ko'riklar va yozilgan retseptlar ro'yxati</p>
              </div>
              
              <button
                type="button"
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>PDF Hisobotini Yuklab Olish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-[11px]">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Filtrlash Turi</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {(['day', 'month', 'year', 'all'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setHistoryPeriodType(p)}
                      className={`flex-1 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                        historyPeriodType === p
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {p === 'day' ? 'Kunlik' : p === 'month' ? 'Oylik' : p === 'year' ? 'Yillik' : 'Barchasi'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Davrni Tanlang</label>
                {historyPeriodType === 'day' && (
                  <input
                    type="date"
                    value={historyDate}
                    onChange={(e) => setHistoryDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  />
                )}
                {historyPeriodType === 'month' && (
                  <input
                    type="month"
                    value={historyMonth}
                    onChange={(e) => setHistoryMonth(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  />
                )}
                {historyPeriodType === 'year' && (
                  <select
                    value={historyYear}
                    onChange={(e) => setHistoryYear(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  >
                    {['2024', '2025', '2026', '2027'].map(y => (
                      <option key={y} value={y}>{y}-yil</option>
                    ))}
                  </select>
                )}
                {historyPeriodType === 'all' && (
                  <div className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 font-semibold select-none">
                    Barcha mavjud tarixiy ma'lumotlar
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Shifokor bo'yicha</label>
                <select
                  value={historyDoctorId}
                  onChange={(e) => setHistoryDoctorId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white"
                >
                  <option value="all">Barcha Shifokorlar</option>
                  {doctorsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tezkor qidirish (Ism, Tashxis, Retsept)</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Kalit so'zni kiriting..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mini Dashboard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/60 flex items-center gap-3 text-left">
              <div className="p-2.5 bg-blue-600 text-white rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Jami Ko'riklar</div>
                <div className="text-xl font-black text-blue-900 mt-0.5">{filteredConsultations.length} ta</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-200/60 flex items-center gap-3 text-left">
              <div className="p-2.5 bg-emerald-600 text-white rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Qabul qilingan Bemorlar</div>
                <div className="text-xl font-black text-emerald-900 mt-0.5">
                  {new Set(filteredConsultations.map(c => c.patientId)).size} nafar
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-200/60 flex items-center gap-3 text-left">
              <div className="p-2.5 bg-purple-600 text-white rounded-lg">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Tashxis Qo'yilganlar</div>
                <div className="text-xl font-black text-purple-900 mt-0.5">
                  {filteredConsultations.filter(c => c.diagnosis).length} ta
                </div>
              </div>
            </div>
          </div>

          {/* List and Table Grid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold select-none">
                    <th className="py-3 px-4">Bemor & ID</th>
                    <th className="py-3 px-4">Qabul qilgan Shifokor</th>
                    <th className="py-3 px-4">Shikoyat & Tashxis</th>
                    <th className="py-3 px-4">Tavsiya etilgan dori-darmonlar (Retsept)</th>
                    <th className="py-3 px-4">Qabul sanasi</th>
                    <th className="py-3 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredConsultations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                        Ushbu filtrlarga mos keluvchi ko'riklar topilmadi.
                      </td>
                    </tr>
                  ) : (
                    filteredConsultations.map((c) => {
                      const p = patients.find(pat => pat.id === c.patientId);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 text-left">
                            <div className="font-extrabold text-slate-900">{p?.fullName || 'Noma\'lum'}</div>
                            <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                              ID: {p?.patientNumber || '—'} • Tel: {p?.phone || '—'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-left">
                            <div className="font-bold text-slate-800">{c.doctorName}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{c.doctorSpecialty}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs text-left">
                            <div className="text-slate-600 truncate" title={c.complaints}>
                              <strong>Shikoyat:</strong> {c.complaints || 'Kiritilmagan'}
                            </div>
                            <div className="font-extrabold text-slate-900 mt-1">
                              <strong>Tashxis:</strong> {c.diagnosis} {c.icdCode ? `(ICD-10: ${c.icdCode})` : ''}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs text-left">
                            {c.prescriptions && c.prescriptions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {c.prescriptions.map(pr => (
                                  <span key={pr.id} className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[9px]">
                                    {pr.drugName} ({pr.dosage})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Dori yozilmagan</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono font-medium text-left">
                            {(c.date || c.createdAt || '').slice(0, 10)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedConsultationForDetail(c)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg font-bold text-[10px] transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Info className="w-3.5 h-3.5 text-blue-500" />
                              <span>Batafsil</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detailed Consultation Card */}
      {selectedConsultationForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-extrabold flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>Bemorning Tibbiy Ko'rik Kartasi & Retsepti</span>
              </h2>
              <button
                type="button"
                onClick={() => setSelectedConsultationForDetail(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs overflow-y-auto max-h-[80vh]">
              {/* Patient Basic Info */}
              {(() => {
                const p = patients.find(pat => pat.id === selectedConsultationForDetail.patientId);
                return (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bemor F.I.SH</div>
                      <div className="text-xs font-black text-slate-900 mt-0.5">{p?.fullName || 'Noma\'lum'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Bemor ID & Pasport</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {p?.patientNumber} • Pasport: {p?.passportOrPin || 'Kiritilmagan'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tug'ilgan sana & Jinsi</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {p?.birthDate} • {p?.gender === 'male' ? 'Erkak' : 'Ayol'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Telefon va Manzil</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {p?.phone} • {p?.address || 'Kiritilmagan'}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* Doctor & Date */}
                <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
                  <div className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Qabul qilgan Shifokor</div>
                  <div className="text-xs font-black text-slate-950 mt-1">{selectedConsultationForDetail.doctorName}</div>
                  <div className="text-[10px] text-purple-700 font-medium mt-0.5">{selectedConsultationForDetail.doctorSpecialty}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-2 font-mono">Qabul sanasi: {selectedConsultationForDetail.date || selectedConsultationForDetail.createdAt}</div>
                </div>

                {/* Objective Measurements */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Obyektiv Ko'rsatkichlar</div>
                  <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10px] font-bold text-slate-700">
                    <div>Qon bosimi: <span className="text-slate-900 font-extrabold">{selectedConsultationForDetail.objectiveExam?.bloodPressure || '—'}</span></div>
                    <div>Pulse: <span className="text-slate-900 font-extrabold">{selectedConsultationForDetail.objectiveExam?.pulse ? `${selectedConsultationForDetail.objectiveExam.pulse} /min` : '—'}</span></div>
                    <div>Tana harorati: <span className="text-slate-900 font-extrabold">{selectedConsultationForDetail.objectiveExam?.temperature ? `${selectedConsultationForDetail.objectiveExam.temperature} °C` : '—'}</span></div>
                    <div>SpO2: <span className="text-slate-900 font-extrabold">{selectedConsultationForDetail.objectiveExam?.spO2 ? `${selectedConsultationForDetail.objectiveExam.spO2} %` : '—'}</span></div>
                    <div>Vazn: <span className="text-slate-900 font-extrabold">{selectedConsultationForDetail.objectiveExam?.weight ? `${selectedConsultationForDetail.objectiveExam.weight} kg` : '—'}</span></div>
                    <div>Bo'y: <span className="text-slate-900 font-extrabold">{selectedConsultationForDetail.objectiveExam?.height ? `${selectedConsultationForDetail.objectiveExam.height} cm` : '—'}</span></div>
                  </div>
                </div>
              </div>

              {/* Diagnosis and Complaints */}
              <div className="space-y-3 text-left">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-extrabold text-slate-800">Bemor Shikoyatlari:</span>
                  <p className="text-slate-600 mt-1 leading-relaxed">{selectedConsultationForDetail.complaints || 'Kiritilmagan'}</p>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg">
                  <span className="font-extrabold text-amber-900">Qabul qilingan Yakuniy Tashxis:</span>
                  <div className="text-slate-900 font-black text-xs mt-1">
                    {selectedConsultationForDetail.diagnosis}
                    {selectedConsultationForDetail.icdCode && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded-md bg-amber-200/60 text-amber-900 text-[9px] font-extrabold">
                        XMK-10 (ICD-10): {selectedConsultationForDetail.icdCode}
                      </span>
                    )}
                  </div>
                </div>

                {selectedConsultationForDetail.anamnesis && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-extrabold text-slate-800">Kasallik Anamnezi:</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">{selectedConsultationForDetail.anamnesis}</p>
                  </div>
                )}

                {selectedConsultationForDetail.treatmentPlan && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-extrabold text-slate-800">Davolash Rejasi va Rejim:</span>
                    <p className="text-slate-600 mt-1 leading-relaxed">{selectedConsultationForDetail.treatmentPlan}</p>
                  </div>
                )}
              </div>

              {/* Prescriptions (drugs) */}
              <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl space-y-3 text-left">
                <span className="font-black text-blue-900 text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Yozilgan Dorilar & Retsept (Xprinter 80mm formatida mos)</span>
                </span>
                
                {selectedConsultationForDetail.prescriptions && selectedConsultationForDetail.prescriptions.length > 0 ? (
                  <div className="space-y-2 text-left">
                    {selectedConsultationForDetail.prescriptions.map((pr, idx) => (
                      <div key={pr.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-2">
                        <span className="font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">{idx + 1}</span>
                        <div className="flex-1">
                          <div className="font-black text-slate-900 text-xs">{pr.drugName}</div>
                          <div className="text-slate-500 text-[10px] mt-0.5">
                            Dozalash: <strong className="text-slate-700">{pr.dosage}</strong> • Davomiyligi: <strong className="text-slate-700">{pr.duration}</strong>
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            Qabul qilish: <strong className="text-slate-700">{pr.frequency}</strong>
                          </div>
                          {pr.instructions && (
                            <div className="text-slate-500 text-[10px] italic mt-1 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                              Ko'rsatma: {pr.instructions}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-center py-2">Ushbu ko'rik davomida dori-darmonlar yozilmagan.</div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedConsultationForDetail(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition-all cursor-pointer text-xs"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Patient */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>Yangi Bemorni Ro'yxatga Olish</span>
              </h2>
              <button
                onClick={() => setShowNewPatientModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bemorning F.I.SH (To'liq) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Abdullayev Jasur Rustamovich"
                    value={newPatientForm.fullName}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telefon raqami *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+998 90 123-45-67"
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tug'ilgan sanasi
                  </label>
                  <input
                    type="date"
                    value={newPatientForm.birthDate}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jinsi
                  </label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="male">Erkak</option>
                    <option value="female">Ayol</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Qon guruhi
                  </label>
                  <select
                    value={newPatientForm.bloodGroup}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="A+ (II)">A+ (II guruhi, Rh+)</option>
                    <option value="B+ (III)">B+ (III guruhi, Rh+)</option>
                    <option value="AB+ (IV)">AB+ (IV guruhi, Rh+)</option>
                    <option value="O+ (I)">O+ (I guruhi, Rh+)</option>
                    <option value="A- (II)">A- (II guruhi, Rh-)</option>
                    <option value="B- (III)">B- (III guruhi, Rh-)</option>
                    <option value="AB- (IV)">AB- (IV guruhi, Rh-)</option>
                    <option value="O- (I)">O- (I guruhi, Rh-)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pasport seriya va raqami / JSHSHIR
                  </label>
                  <input
                    type="text"
                    placeholder="AA 1234567 / 31204850010099"
                    value={newPatientForm.passportOrPin}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, passportOrPin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Yashash manzili
                  </label>
                  <input
                    type="text"
                    placeholder="Viloyat, tuman, ko'cha, uy raqami..."
                    value={newPatientForm.address}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Allergiyalar (vergul bilan)
                  </label>
                  <input
                    type="text"
                    placeholder="Penitsillin, Novokain..."
                    value={newPatientForm.allergies}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Surunkali kasalliklar
                  </label>
                  <input
                    type="text"
                    placeholder="Qandli diabet, Gipertoniya..."
                    value={newPatientForm.chronicDiseases}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, chronicDiseases: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                {duplicateMatches.length > 0 && (
                  <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5 text-red-950 font-extrabold text-[12px]">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span>BLOKLANDI: Tizimda ushbu ma'lumotlarga ega bemor mavjud!</span>
                        <p className="font-medium text-[11px] text-red-700 mt-1">
                          Ma'lumotlar takrorlanishining oldini olish va tibbiy tarix daxlsizligini saqlash maqsadida yangi bemor qo'shish tugmasi o'chirildi. Bemorning butun davolanish va tibbiy tashxislari tarixi bitta profilda jamlanishi shart!
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-red-200/60">
                      {duplicateMatches.map(p => (
                        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          <div className="text-left">
                            <div className="font-extrabold text-slate-900 text-xs">{p.fullName}</div>
                            <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                              Telefon: {p.phone} • Pasport: {p.passportOrPin || 'Kiritilmagan'} • ID: {p.patientNumber}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewPatientModal(false);
                              setSelectedPatientForVisit(p);
                              setVisitDoctorId('');
                              setVisitServiceId('');
                              setShowNewVisitModal(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-lg text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Ushbu Bemorga Navbat (Yo'llanma) Berish</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={duplicateMatches.length > 0}
                  className={`px-5 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 ${
                    duplicateMatches.length > 0
                      ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Saqlash va Qabulga Yozish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Visit & Queue Ticket */}
      {showNewVisitModal && selectedPatientForVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-300" />
                  <span>Qabulga Yozish & Navbat Taloni Berish</span>
                </h2>
                <p className="text-xs text-blue-100">Bemor: {selectedPatientForVisit.fullName}</p>
              </div>
              <button
                onClick={() => setShowNewVisitModal(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Qabul qiluvchi Shifokor *
                </label>
                <select
                  required
                  value={visitDoctorId}
                  onChange={(e) => setVisitDoctorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs"
                >
                  <option value="">Shifokorni tanlang...</option>
                  {doctorsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} — {d.specialty} ({d.roomNumber || 'Qabul xonasi'}) — {(d.consultationFee ?? 0).toLocaleString()} {clinic.currencySymbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Xizmat / Konsultatsiya Turi *
                </label>
                <select
                  value={visitServiceId}
                  onChange={(e) => setVisitServiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs"
                >
                  <option value="">Standart Shifokor Ko'rigi</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {(s.price ?? 0).toLocaleString()} {clinic.currencySymbol} ({s.durationMinutes || 15} daq.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  To'lov Holati (Kassada to'langanligi)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisitPaymentStatus('paid')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      visitPaymentStatus === 'paid'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    To'langan (Kassa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitPaymentStatus('unpaid')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      visitPaymentStatus === 'unpaid'
                        ? 'border-amber-600 bg-amber-50 text-amber-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Keyin to'lanadi
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  "Talon Chop Etish" bosilgach, Xprinter ESC/POS yoki brauzer orqali avtomatik navbat cheki chiqadi.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewVisitModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Navbatga Qo'yish & Xprinter Chek Chop Etish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bemor QR Pasporti Card */}
      {selectedPatientForQRCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-400" />
                <span>Bemorning Raqamli QR Karta Pasporti</span>
              </h2>
              <button
                onClick={() => setSelectedPatientForQRCard(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Printable Area with Beautiful ID Card Design */}
              <div 
                id="patient-qr-card-print"
                className="p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 relative overflow-hidden flex flex-col items-center text-center shadow-xs"
              >
                {/* Decorative clinic name header */}
                <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <div className="text-left">
                    <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">{clinic.name}</span>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Raqamli Bemor Pasporti</p>
                  </div>
                  <div className="p-1 bg-blue-50 text-blue-600 rounded-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                {/* QR Code itself */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs relative group transition-transform duration-300 hover:scale-[1.02]">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedPatientForQRCard.id)}&color=0f172a`}
                    alt="Bemor QR Kodi"
                    className="w-[150px] h-[150px]"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Patient Information */}
                <div className="mt-4 space-y-1 w-full text-center">
                  <h3 className="text-sm font-extrabold text-slate-900">{selectedPatientForQRCard.fullName}</h3>
                  <p className="text-xs font-mono font-bold text-blue-600 bg-blue-50/70 py-1 px-3 rounded-full inline-block">
                    {selectedPatientForQRCard.patientNumber}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-3 border-t border-slate-100 mt-3">
                    <div className="text-left">
                      <span className="block text-slate-400">Telefon raqam:</span>
                      <strong className="text-slate-700">{selectedPatientForQRCard.phone}</strong>
                    </div>
                    <div className="text-right">
                      <span className="block text-slate-400">Passport / JShShIR:</span>
                      <strong className="text-slate-700 font-mono">{selectedPatientForQRCard.passportOrPin || '—'}</strong>
                    </div>
                    <div className="text-left mt-1 col-span-2">
                      <span className="block text-slate-400">Tug'ilgan sana & jinsi:</span>
                      <strong className="text-slate-700">{selectedPatientForQRCard.birthDate} • {selectedPatientForQRCard.gender === 'male' ? 'Erkak' : 'Ayol'}</strong>
                    </div>
                  </div>
                </div>

                {/* Micro-print watermark */}
                <div className="text-[8px] text-slate-300 mt-4 tracking-tight">
                  Tizimda yaratilgan sana: {new Date(selectedPatientForQRCard.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const printContents = document.getElementById('patient-qr-card-print')?.innerHTML;
                    if (printContents) {
                      const printWindow = window.open('', '', 'height=600,width=600');
                      if (printWindow) {
                        printWindow.document.write('<html><head><title>Bemor QR Pasporti</title>');
                        printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
                        printWindow.document.write('</head><body class="p-6 bg-white flex justify-center items-center h-screen">');
                        printWindow.document.write('<div class="w-[350px] border-2 border-dashed border-slate-400 p-5 rounded-2xl bg-slate-50 relative overflow-hidden flex flex-col items-center text-center">');
                        printWindow.document.write(printContents);
                        printWindow.document.write('</div></body></html>');
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => {
                          printWindow.print();
                          printWindow.close();
                        }, 500);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Karta chop etish</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPatientForQRCard.id);
                    setCopiedPatientId(selectedPatientForQRCard.id);
                    setTimeout(() => setCopiedPatientId(null), 2000);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedPatientId === selectedPatientForQRCard.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Nusxalandi!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>ID nusxalash</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: QR Kod Skanyer va Tezkor Qabul */}
      {showQRScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Scan className="w-5 h-5 text-emerald-300" />
                <span>QR-kod orqali bemorlarni tezkor qabul qilish</span>
              </h2>
              <button
                onClick={() => {
                  setShowQRScannerModal(false);
                  stopWebcam();
                  setWebcamActive(false);
                }}
                className="p-1 text-white/80 hover:text-white rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Left Column: Webcam Scanner Simulation Viewport */}
              <div className="flex flex-col items-center justify-center bg-slate-900 rounded-2xl p-4 relative overflow-hidden min-h-[250px] border border-slate-800 group shadow-inner">
                {/* Scanner Laser Animation */}
                <div className="absolute inset-x-0 h-1 bg-emerald-500 opacity-75 shadow-[0_0_8px_#10b981] animate-[bounce_3s_infinite] z-10" />

                {/* QR Target Guide Box */}
                <div className="w-44 h-44 rounded-2xl border-2 border-emerald-400 absolute flex items-center justify-center bg-emerald-500/5 z-0">
                  {/* Corner styling for viewfinder */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-md" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-md" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-md" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-md" />
                </div>

                {webcamActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full max-h-[200px] object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center space-y-3 z-10 max-w-[180px] select-none">
                    <Camera className="w-10 h-10 text-slate-500 mx-auto animate-pulse" />
                    <div>
                      <p className="text-slate-300 font-bold text-[11px]">Skaner tayyor</p>
                      <p className="text-slate-500 text-[10px] mt-1">Kamerani faollashtiring yoki qo'lda kiriting</p>
                    </div>
                  </div>
                )}

                {/* Webcam Controls */}
                <div className="absolute bottom-3 inset-x-3 flex justify-center gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => setWebcamActive(!webcamActive)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-sm ${
                      webcamActive 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{webcamActive ? 'Kamerani o\'chirish' : 'Kamerani yoqish'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Interaction, Manual ID entry & Fast Simulation dropdown */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mb-2">
                    <Laptop className="w-4 h-4 text-emerald-600" />
                    <span>Tezkor Qidiruv va Skanerlash</span>
                  </h3>
                  <p className="text-slate-500 leading-relaxed mb-4 text-[11px]">
                    Skanerdan o'tgan bemor topilganda, tizim signal ovozi chalib uni aniqlaydi va qabulga yozish oynasini ochadi.
                  </p>

                  {/* Manual Entry */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700">Qo'lda kiritish yoki Skaner qiymati:</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Masalan: patient_1 yoki P-2026-001"
                        value={scanInputValue}
                        onChange={(e) => {
                          setScanInputValue(e.target.value);
                          setScanError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = scanInputValue.trim().toLowerCase();
                            const matched = patients.find(p => 
                              p.id.toLowerCase() === val || 
                              p.patientNumber.toLowerCase() === val
                            );
                            if (matched) {
                              handleScanSuccess(matched);
                            } else {
                              setScanError('Xatolik: Bunday ID yoki raqamli bemor topilmadi');
                            }
                          }
                        }}
                        className={`w-full pl-3 pr-10 py-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden text-xs font-mono font-bold ${
                          scanError ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = scanInputValue.trim().toLowerCase();
                          const matched = patients.find(p => 
                            p.id.toLowerCase() === val || 
                            p.patientNumber.toLowerCase() === val
                          );
                          if (matched) {
                            handleScanSuccess(matched);
                          } else {
                            setScanError('Bemor topilmadi');
                          }
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-1 text-[10px] font-bold"
                      >
                        Qidirish
                      </button>
                    </div>
                    {scanError ? (
                      <p className="text-[10px] text-rose-600 font-bold">{scanError}</p>
                    ) : (
                      <p className="text-[10px] text-slate-400">Shtrix-kod yoki QR skanerlar klaviatura sifatida kiritib Enterni bosadi.</p>
                    )}
                  </div>
                </div>

                {/* Simulation panel */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Tezkor test qilish simulyatori</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Haqiqiy skaner bo'lmaganda, quyidagi ro'yxatdan biron bemorni tanlab "Skanerlash" tugmasini bosing:
                  </p>

                  <div className="space-y-2 pt-1">
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          setScanInputValue(val);
                          setScanError('');
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-[11px]"
                    >
                      <option value="">Bemorlardan birini tanlang...</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.fullName} ({p.patientNumber})</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        const val = scanInputValue.trim();
                        const matched = patients.find(p => p.id === val);
                        if (matched) {
                          handleScanSuccess(matched);
                        } else {
                          setScanError('Iltimos, avval sinov bemorini tanlang');
                        }
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-xs animate-pulse"
                    >
                      Karta skanini simulyatsiya qilish (Beep!)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
