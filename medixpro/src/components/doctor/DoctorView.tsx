import React, { useState } from 'react';
import { 
  Stethoscope, 
  UserCheck, 
  FileText, 
  Pill, 
  FlaskConical, 
  CheckCircle, 
  Printer, 
  Volume2, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  AlertCircle,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Sparkles,
  Search,
  BookOpen,
  History,
  Check,
  Zap,
  Save,
  HelpCircle
} from 'lucide-react';
import { 
  StaffMember, 
  QueueTicket, 
  Patient, 
  ConsultationRecord, 
  PrescriptionItem, 
  LabTestOrder, 
  PaymentTransaction,
  ClinicProfile, 
  PrinterConfig,
  ClinicalProtocol
} from '../../types';
import { AudioService } from '../../services/audioService';
import { PrinterService } from '../../services/printerService';
import { DEFAULT_CLINICAL_PROTOCOLS } from '../../data/clinicalProtocols';
import { PatientHistoryModal } from './PatientHistoryModal';
import { PatientMedicalHistoryTimeline } from './PatientMedicalHistoryTimeline';

interface DoctorViewProps {
  currentUser: StaffMember | null;
  staffList: StaffMember[];
  queue: QueueTicket[];
  patients: Patient[];
  consultations: ConsultationRecord[];
  labOrders?: LabTestOrder[];
  transactions?: PaymentTransaction[];
  clinic: ClinicProfile;
  printerConfig: PrinterConfig;
  customProtocols?: ClinicalProtocol[];
  onUpdateQueueStatus: (ticketId: string, status: QueueTicket['status']) => void;
  onSaveConsultation: (record: Omit<ConsultationRecord, 'id' | 'createdAt'>) => void;
  onOrderLabTest: (order: Omit<LabTestOrder, 'id' | 'orderNumber' | 'createdAt'>) => void;
  onSaveCustomProtocol?: (proto: ClinicalProtocol) => void;
}

export const DoctorView: React.FC<DoctorViewProps> = ({
  currentUser,
  staffList,
  queue,
  patients,
  consultations,
  labOrders = [],
  transactions = [],
  clinic,
  printerConfig,
  customProtocols = [],
  onUpdateQueueStatus,
  onSaveConsultation,
  onOrderLabTest,
  onSaveCustomProtocol,
}) => {
  // Current doctor
  const currentDoctor = currentUser?.role === 'doctor' || currentUser?.role === 'admin'
    ? currentUser
    : staffList.find(s => s.role === 'doctor') || staffList[0];

  // Doctor's specific queue
  const myQueue = queue.filter(q => q.doctorId === currentDoctor?.id || currentUser?.role === 'admin');
  const activeTicket = myQueue.find(q => q.status === 'in_consultation') || null;
  const waitingTickets = myQueue.filter(q => q.status === 'waiting');

  // Active patient object
  const activePatient = activeTicket ? patients.find(p => p.id === activeTicket.patientId) : null;

  // View Mode: EMR Form or Patient History Timeline
  const [activeDoctorTab, setActiveDoctorTab] = useState<'emr_form' | 'patient_timeline'>('emr_form');
  const [historyModalPatient, setHistoryModalPatient] = useState<Patient | null>(null);

  // EMR Form State
  const [complaints, setComplaints] = useState('');
  const [anamnesis, setAnamnesis] = useState('');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [pulse, setPulse] = useState<number>(76);
  const [temperature, setTemperature] = useState<number>(36.6);
  const [spO2, setSpO2] = useState<number>(98);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);
  const [diagnosis, setDiagnosis] = useState('');
  const [icdCode, setIcdCode] = useState('I10');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [autoPrintThermal, setAutoPrintThermal] = useState(true);

  // Protocols & Presets
  const allProtocols: ClinicalProtocol[] = [...DEFAULT_CLINICAL_PROTOCOLS, ...customProtocols];
  const [selectedProtocolId, setSelectedProtocolId] = useState('');
  const [protocolSearch, setProtocolSearch] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Count events for active patient
  const activePatientHistoryCount = React.useMemo(() => {
    if (!activePatient) return 0;
    const cCount = consultations.filter(c => c.patientId === activePatient.id).length;
    const lCount = (labOrders || []).filter(l => l.patientId === activePatient.id).length;
    const pCount = (transactions || []).filter(t => 
      t.patientId === activePatient.id && 
      (t.items.some(i => i.type === 'pharmacy') || t.receiptNumber.includes('PHARM') || t.receiptNumber.includes('CHEK'))
    ).length;
    return cCount + lCount + pCount;
  }, [activePatient, consultations, labOrders, transactions]);

  // Prescriptions list
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { id: '1', drugName: '', dosage: '', frequency: 'Kuniga 2 mahal', duration: '5 kun', instructions: 'Ovqatdan so\'ng' },
  ]);

  // Lab test ordering modal / form
  const [selectedLabTestType, setSelectedLabTestType] = useState('Umumiy qon tahlili');

  // Apply a Clinical Disease Protocol
  const handleApplyProtocol = (protoId: string) => {
    const proto = allProtocols.find(p => p.id === protoId);
    if (!proto) return;

    setSelectedProtocolId(proto.id);
    setDiagnosis(proto.diagnosis);
    setIcdCode(proto.icdCode);
    setComplaints(proto.complaints);
    if (proto.anamnesis) {
      setAnamnesis(proto.anamnesis);
    }
    setTreatmentPlan(proto.treatmentPlan);

    // Deep copy prescriptions with unique IDs
    const clonedPrescriptions: PrescriptionItem[] = proto.prescriptions.map((p, idx) => ({
      ...p,
      id: `${Date.now()}_${idx}`,
    }));
    setPrescriptions(clonedPrescriptions);

    if (proto.followUpDays) {
      const d = new Date();
      d.setDate(d.getDate() + proto.followUpDays);
      setFollowUpDate(d.toLocaleDateString('uz-UZ'));
    }
  };

  // Handle Call Next Patient
  const handleCallNext = () => {
    if (waitingTickets.length === 0) {
      alert('Kutayotgan bemorlar yo\'q.');
      return;
    }
    const nextTicket = waitingTickets[0];
    onUpdateQueueStatus(nextTicket.id, 'in_consultation');
    AudioService.announceQueueCall(nextTicket.ticketNumber, currentDoctor.roomNumber || '1-xona', currentDoctor.fullName);
  };

  // Add prescription line
  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { id: Date.now().toString(), drugName: '', dosage: '', frequency: 'Kuniga 2 mahal', duration: '7 kun', instructions: 'Ovqatdan keyin' },
    ]);
  };

  // Remove prescription line
  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  // Update prescription field
  const handleUpdatePrescription = (id: string, field: keyof PrescriptionItem, val: string) => {
    setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  // Handle Order Lab Test
  const handleSendLabOrder = () => {
    if (!activeTicket || !activePatient) {
      alert('Avval navbatdagi bemorni qabulga chaqiring.');
      return;
    }

    onOrderLabTest({
      clinicId: clinic.id,
      patientId: activePatient.id,
      patientName: activePatient.fullName,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.fullName,
      testType: selectedLabTestType,
      parameters: [],
      status: 'ordered',
      price: 60000,
      paymentStatus: 'unpaid',
    });

    alert(`Laboratoriyaga '${selectedLabTestType}' yo'llanmasi yuborildi!`);
  };

  // Print Thermal Prescription
  const handlePrintThermal = () => {
    if (!activePatient) return;
    const currentRecord: Omit<ConsultationRecord, 'id' | 'createdAt'> = {
      clinicId: clinic.id,
      patientId: activePatient.id,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.fullName,
      doctorSpecialty: currentDoctor.specialty || 'Shifokor',
      date: new Date().toISOString(),
      complaints,
      anamnesis,
      objectiveExam: { bloodPressure, pulse, temperature, spO2, weight, height },
      icdCode,
      diagnosis: diagnosis.trim() || 'Klinik ko\'rik xulosasi',
      treatmentPlan,
      prescriptions: prescriptions.filter(p => p.drugName.trim()),
      followUpDate,
      status: 'finalized',
    };

    PrinterService.printPrescriptionThermal(currentRecord, activePatient, clinic, printerConfig);
  };

  // Print Official A4 Blank
  const handlePrintA4 = () => {
    if (!activePatient) return;
    const currentRecord: Omit<ConsultationRecord, 'id' | 'createdAt'> = {
      clinicId: clinic.id,
      patientId: activePatient.id,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.fullName,
      doctorSpecialty: currentDoctor.specialty || 'Shifokor',
      date: new Date().toISOString(),
      complaints,
      anamnesis,
      objectiveExam: { bloodPressure, pulse, temperature, spO2, weight, height },
      icdCode,
      diagnosis: diagnosis.trim() || 'Klinik ko\'rik xulosasi',
      treatmentPlan,
      prescriptions: prescriptions.filter(p => p.drugName.trim()),
      followUpDate,
      status: 'finalized',
    };

    PrinterService.printMedicalReportA4(currentRecord, activePatient, clinic);
  };

  // Save current diagnosis as new custom protocol
  const handleSaveAsCustomTemplate = () => {
    if (!diagnosis.trim()) {
      alert('Iltimos, avval tashxisni kiriting.');
      return;
    }
    const templateName = prompt('Yangi kasallik shabloni nomini kiriting:', diagnosis);
    if (!templateName) return;

    const newProto: ClinicalProtocol = {
      id: `custom_${Date.now()}`,
      name: templateName,
      category: currentDoctor.specialty || 'Maxsus',
      icdCode: icdCode || 'R69',
      complaints,
      anamnesis,
      diagnosis,
      treatmentPlan,
      prescriptions: prescriptions.filter(p => p.drugName.trim()),
      followUpDays: 10,
    };

    if (onSaveCustomProtocol) {
      onSaveCustomProtocol(newProto);
    }
    alert(`"${templateName}" shabloni kasalliklar ro'yxatiga muvaffaqiyatli saqlandi!`);
  };

  // Complete Consultation
  const handleFinalizeConsultation = () => {
    if (!activeTicket || !activePatient) return;

    if (!diagnosis.trim()) {
      alert('Iltimos, tashxisni kiriting.');
      return;
    }

    const newRecord: Omit<ConsultationRecord, 'id' | 'createdAt'> = {
      clinicId: clinic.id,
      patientId: activePatient.id,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.fullName,
      doctorSpecialty: currentDoctor.specialty || 'Terapevt',
      date: new Date().toISOString(),
      complaints: complaints.trim(),
      anamnesis: anamnesis.trim(),
      objectiveExam: {
        bloodPressure,
        pulse,
        temperature,
        spO2,
        weight,
        height,
      },
      icdCode,
      diagnosis: diagnosis.trim(),
      treatmentPlan: treatmentPlan.trim(),
      prescriptions: prescriptions.filter(p => p.drugName.trim()),
      followUpDate,
      status: 'finalized',
    };

    onSaveConsultation(newRecord);
    onUpdateQueueStatus(activeTicket.id, 'completed');

    // Auto print thermal prescription if enabled
    if (autoPrintThermal) {
      PrinterService.printPrescriptionThermal(newRecord, activePatient, clinic, printerConfig);
    }

    alert('Konsultatsiya muvaffaqiyatli yakunlandi, retsept va EMR bazaga saqlandi!');

    // Reset Form
    setComplaints('');
    setAnamnesis('');
    setDiagnosis('');
    setTreatmentPlan('');
    setFollowUpDate('');
    setSelectedProtocolId('');
    setPrescriptions([{ id: '1', drugName: '', dosage: '', frequency: 'Kuniga 2 mahal', duration: '5 kun', instructions: 'Ovqatdan so\'ng' }]);
  };

  const filteredProtocols = allProtocols.filter(p => 
    p.name.toLowerCase().includes(protocolSearch.toLowerCase()) ||
    p.icdCode.toLowerCase().includes(protocolSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(protocolSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Doctor Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900">{currentDoctor.fullName}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {currentDoctor.specialty || 'Shifokor'}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Xona: <span className="font-bold text-slate-700">{currentDoctor.roomNumber || '104-xona'}</span> • Navbatda: <span className="font-bold text-blue-600">{waitingTickets.length} bemor</span>
            </div>
          </div>
        </div>

        {/* Call Next Patient Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCallNext}
            disabled={waitingTickets.length === 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
              waitingTickets.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Keyingi Bemorni Chaqirish ({waitingTickets.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Doctor Queue / Right Active Patient EMR Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Waiting Queue for this Doctor (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
            <div className="flex items-center justify-between font-bold text-slate-900 text-xs mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Mening Navbatim ({myQueue.length})</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">Jonli yangilanadi</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {myQueue.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Sizga yozilgan bemorlar yo'q
                </div>
              ) : (
                myQueue.map((t) => {
                  const isCurrent = t.status === 'in_consultation';
                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        isCurrent
                          ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs">
                            {t.ticketNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const pat = patients.find(p => p.id === t.patientId);
                              if (pat) {
                                setHistoryModalPatient(pat);
                                setShowHistoryModal(true);
                              }
                            }}
                            className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Bemorning tibbiy tarixini ko'rish"
                          >
                            <History className="w-3 h-3" />
                            <span>Tarix</span>
                          </button>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isCurrent ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isCurrent ? 'Qabulda' : 'Kutmoqda'}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900">{t.patientName}</div>
                      <div className="text-[11px] text-slate-500">{t.serviceName}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: EMR Sheet (8 cols) */}
        <div className="lg:col-span-8">
          {activeTicket && activePatient ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* EMR Sheet Header */}
              <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white/20 font-mono font-black text-sm">
                      {activeTicket.ticketNumber}
                    </span>
                    <h2 className="text-base font-bold">{activePatient.fullName}</h2>
                  </div>
                  <div className="text-xs text-blue-100 mt-1 flex items-center gap-3">
                    <span>Tug'ilgan: {activePatient.birthDate}</span>
                    <span>•</span>
                    <span>Tel: {activePatient.phone}</span>
                    <span>•</span>
                    <span>Qon guruhi: {activePatient.bloodGroup || 'Aniqlanmagan'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Bemorning barcha oldingi ko'riklari va tashxislari"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Kasallik Tarixi</span>
                  </button>

                  <button
                    onClick={handlePrintThermal}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Xprinter termal kvitansiya"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Xprinter Retsept</span>
                  </button>

                  <button
                    onClick={handlePrintA4}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Rasmiy A4 Blank"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-200" />
                    <span>A4 Blank</span>
                  </button>
                </div>
              </div>

              {/* Patient Alert Badges */}
              {activePatient.allergies && activePatient.allergies.length > 0 && (
                <div className="px-5 py-2 bg-rose-50 border-b border-rose-100 flex items-center gap-2 text-xs text-rose-800 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>DIQQAT! Allergiyalar: {activePatient.allergies.join(', ')}</span>
                </div>
              )}

              {/* View Switcher Tabs: EMR Form vs Patient History Timeline */}
              <div className="bg-slate-100/90 px-4 pt-2 border-b border-slate-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDoctorTab('emr_form')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                    activeDoctorTab === 'emr_form'
                      ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Joriy Qabul Varakasi (EMR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDoctorTab('patient_timeline')}
                  className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                    activeDoctorTab === 'patient_timeline'
                      ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tibbiy Tarix Xronologiyasi</span>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    activeDoctorTab === 'patient_timeline' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {activePatientHistoryCount}
                  </span>
                </button>
              </div>

              {/* TAB 1: Patient Medical History Timeline */}
              {activeDoctorTab === 'patient_timeline' ? (
                <div className="p-5 sm:p-6 bg-slate-50/50">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <span>{activePatient.fullName} — Xronologik Tibbiy Tarix</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Bemorning o'tgan barcha konsultatsiyalari, tahlil natijalari va retsept dorilari
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveDoctorTab('emr_form')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Qabulni Davom Ettirish</span>
                    </button>
                  </div>

                  <PatientMedicalHistoryTimeline
                    patient={activePatient}
                    consultations={consultations}
                    labOrders={labOrders}
                    transactions={transactions}
                    clinic={clinic}
                    printerConfig={printerConfig}
                    hideHeader={false}
                  />
                </div>
              ) : (
                /* TAB 2: EMR Form */
                <div className="p-6 space-y-5 text-xs">
                {/* 1. Clinical Protocol / Disease Templates Selector */}
                <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 rounded-2xl border border-blue-200/80 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-blue-950">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Kasallik Shablonlari & Avtomatik Dorilar Ro'yxati (1-bosishda)</span>
                    </div>
                    <span className="text-[10px] text-blue-700 font-semibold">
                      Tashxis tanlanganda dorilar, dozasi va tavsiyalar avtomatik to'ldiriladi
                    </span>
                  </div>

                  {/* Fast Selector Bar */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <select
                        value={selectedProtocolId}
                        onChange={(e) => handleApplyProtocol(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Standart Kasallik / Protokolni Tanlang --</option>
                        {allProtocols.map((proto) => (
                          <option key={proto.id} value={proto.id}>
                            [{proto.icdCode}] {proto.name} ({proto.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAsCustomTemplate}
                      className="px-3 py-2 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      title="Hozirgi tashxis va dorilar ro'yxatini yangi shablon sifatida saqlash"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Yangi Shablon Qilib Saqlash</span>
                    </button>
                  </div>

                  {/* Quick Disease Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-500 mr-1 self-center">Tezkor:</span>
                    {allProtocols.slice(0, 6).map((proto) => (
                      <button
                        key={proto.id}
                        type="button"
                        onClick={() => handleApplyProtocol(proto.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          selectedProtocolId === proto.id
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-blue-100 hover:text-blue-900 border border-slate-200'
                        }`}
                      >
                        {proto.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Vital Signs Bar */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Ob'yektiv Ko'rik & Vital Ko'rsatkichlar</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Qon bosimi (mm.sim.ust)</label>
                      <input
                        type="text"
                        value={bloodPressure}
                        onChange={(e) => setBloodPressure(e.target.value)}
                        placeholder="120/80"
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-semibold text-center focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Puls (zarba/daq)</label>
                      <input
                        type="number"
                        value={pulse}
                        onChange={(e) => setPulse(parseInt(e.target.value) || 75)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-semibold text-center focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Harorat (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value) || 36.6)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-semibold text-center focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">SpO2 (%)</label>
                      <input
                        type="number"
                        value={spO2}
                        onChange={(e) => setSpO2(parseInt(e.target.value) || 98)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-semibold text-center focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Vazn (kg)</label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(parseInt(e.target.value) || 70)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-semibold text-center focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Bo'yi (sm)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value) || 175)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-semibold text-center focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Complaints & Anamnesis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Bemorning Shikoyatlari:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Bosh og'rig'i, holsizlik, ko'krak qafasidagi bosim..."
                      value={complaints}
                      onChange={(e) => setComplaints(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Kasallik Tarixi (Anamnesis):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="3 kundan beri bezovta qiladi, ilgari dori qabul qilgan..."
                      value={anamnesis}
                      onChange={(e) => setAnamnesis(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* 4. Diagnosis & ICD-10 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-3">
                    <label className="block font-bold text-slate-800 mb-1">
                      Klinik Tashxis *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Gipertoniya kasalligi II-bosqich, o'rtacha xavf guruhi"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      XTT-10 (ICD-10) Kodi
                    </label>
                    <input
                      type="text"
                      value={icdCode}
                      onChange={(e) => setIcdCode(e.target.value)}
                      placeholder="I10, K29, J06..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* 5. Electronic Prescription Section */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-emerald-600" />
                      <span>Elektron Retsept (Rp. - Retseptura)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPrescription}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Dori Qo'shish</span>
                    </button>
                  </div>

                  {prescriptions.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Dori nomi (masalan: Amlodipin)"
                          value={item.drugName}
                          onChange={(e) => handleUpdatePrescription(item.id, 'drugName', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-hidden font-medium"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Doza: 5mg #30"
                          value={item.dosage}
                          onChange={(e) => handleUpdatePrescription(item.id, 'dosage', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-hidden"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Jadval: 1 mahal ertalab"
                          value={item.frequency}
                          onChange={(e) => handleUpdatePrescription(item.id, 'frequency', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-hidden"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Muddati: 14 kun"
                          value={item.duration}
                          onChange={(e) => handleUpdatePrescription(item.id, 'duration', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-hidden"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 6. Lab & Diagnostics Orders Section */}
                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-bold text-purple-950">Laboratoriya va UZI Yo'llanmasi</div>
                      <div className="text-[10px] text-purple-700">Tahlillar laboratoriya paneliga avtomatik yuboriladi</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedLabTestType}
                      onChange={(e) => setSelectedLabTestType(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-semibold focus:outline-hidden"
                    >
                      <option value="Umumiy qon tahlili">Umumiy qon tahlili (OAK)</option>
                      <option value="Biokimyoviy tahlil">Biokimyoviy tahlil (Jigar/Buyrak)</option>
                      <option value="UZI qorin bo'shlig'i">UZI qorin bo'shlig'i</option>
                      <option value="EKG xulosasi">EKG (Elektrokardiografiya)</option>
                      <option value="Koagulogramma">Koagulogramma (Qon ivishi)</option>
                      <option value="Gormonlar tahlili">Gormonlar (TSH, T3, T4)</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleSendLabOrder}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs whitespace-nowrap cursor-pointer"
                    >
                      Yo'llanma Berish
                    </button>
                  </div>
                </div>

                {/* 7. Treatment Recommendations & Follow-Up Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">
                      Davolash Rejimi, Parhez va Tavsiyalar:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tuz iste'molini kamaytirish, kuniga 2 litr suv ichish, parhez stoli..."
                      value={treatmentPlan}
                      onChange={(e) => setTreatmentPlan(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Qayta Ko'rik Sanasi:
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: 14 kun keyin"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Actions & Auto-print settings */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-xs">
                    <input
                      type="checkbox"
                      checked={autoPrintThermal}
                      onChange={(e) => setAutoPrintThermal(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Yakunlanganda Xprinterdan retseptni avtomatik chop etish</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleFinalizeConsultation}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Konsultatsiyani Yakunlash & Saqlash</span>
                  </button>
                </div>
              </div>
            )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center text-slate-400">
              <Stethoscope className="w-16 h-16 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">Hozirda qabulda bemor yo'q</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Navbatdagi bemorni qabul qilish uchun yuqoridagi "Keyingi Bemorni Chaqirish" tugmasini bosing.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Patient History Modal */}
      {(historyModalPatient || activePatient) && (
        <PatientHistoryModal
          isOpen={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false);
            setHistoryModalPatient(null);
          }}
          patient={historyModalPatient || activePatient!}
          consultations={consultations}
          labOrders={labOrders}
          transactions={transactions}
          clinic={clinic}
          printerConfig={printerConfig}
        />
      )}
    </div>
  );
};
