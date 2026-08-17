import React, { useState } from 'react';
import { 
  Bed as BedIcon, 
  Plus, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  LogOut, 
  CreditCard, 
  FileText, 
  AlertCircle,
  Building,
  Filter,
  Stethoscope,
  Phone,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import { WardRoom, Bed, Patient, StaffMember, ClinicProfile, BedStatus } from '../../types';

interface WardsViewProps {
  wards: WardRoom[];
  patients: Patient[];
  staffList: StaffMember[];
  clinic: ClinicProfile;
  onAdmitPatient: (wardId: string, bedId: string, admissionData: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    diagnosis: string;
    dietType?: string;
    depositAmount: number;
  }) => void;
  onDischargePatient: (wardId: string, bedId: string, dischargeNotes?: string) => { totalDays: number; totalCost: number };
  onUpdateBedStatus: (wardId: string, bedId: string, status: BedStatus) => void;
  onAddWardRoom: (roomData: Omit<WardRoom, 'id'>) => void;
}

export const WardsView: React.FC<WardsViewProps> = ({
  wards,
  patients,
  staffList,
  clinic,
  onAdmitPatient,
  onDischargePatient,
  onUpdateBedStatus,
  onAddWardRoom,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  const [activeTargetWard, setActiveTargetWard] = useState<WardRoom | null>(null);
  const [activeTargetBed, setActiveTargetBed] = useState<Bed | null>(null);

  // Admission Form State
  const [admitPatientId, setAdmitPatientId] = useState('');
  const [admitDoctorId, setAdmitDoctorId] = useState('');
  const [admitDiagnosis, setAdmitDiagnosis] = useState('');
  const [admitDiet, setAdmitDiet] = useState('Parhez stol №5');
  const [admitDeposit, setAdmitDeposit] = useState('500000');

  // Add Room Form State
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newDepartment, setNewDepartment] = useState('Terapiya');
  const [newFloor, setNewFloor] = useState(1);
  const [newType, setNewType] = useState<'standard' | 'vip' | 'intensive' | 'pediatric'>('standard');
  const [newDailyRate, setNewDailyRate] = useState(200000);
  const [newBedCount, setNewBedCount] = useState(2);
  const [newFacilities, setNewFacilities] = useState('Konditsioner, Dush, Wi-Fi');

  // Doctors
  const doctors = staffList.filter(s => s.role === 'doctor' || s.role === 'admin');

  // Departments list
  const departments = Array.from(new Set(wards.map(w => w.department)));

  // Filtered wards
  const filteredWards = wards.filter(w => {
    if (selectedDepartment !== 'all' && w.department !== selectedDepartment) return false;
    if (selectedFloor !== 'all' && w.floor.toString() !== selectedFloor) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoom = w.roomNumber.toLowerCase().includes(q) || w.department.toLowerCase().includes(q);
      const matchPatient = w.beds.some(b => b.currentPatient?.patientName.toLowerCase().includes(q));
      return matchRoom || matchPatient;
    }
    return true;
  });

  // Calculate statistics
  let totalBeds = 0;
  let occupiedBeds = 0;
  let cleaningBeds = 0;
  let availableBeds = 0;

  wards.forEach(w => {
    w.beds.forEach(b => {
      totalBeds++;
      if (b.status === 'occupied') occupiedBeds++;
      else if (b.status === 'cleaning') cleaningBeds++;
      else if (b.status === 'available') availableBeds++;
    });
  });

  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const handleOpenAdmit = (ward: WardRoom, bed: Bed) => {
    setActiveTargetWard(ward);
    setActiveTargetBed(bed);
    setShowAdmitModal(true);
  };

  const handleOpenDischarge = (ward: WardRoom, bed: Bed) => {
    setActiveTargetWard(ward);
    setActiveTargetBed(bed);
    setShowDischargeModal(true);
  };

  const handleSubmitAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetWard || !activeTargetBed) return;

    const patient = patients.find(p => p.id === admitPatientId);
    if (!patient) {
      alert('Iltimos, bemorni tanlang.');
      return;
    }

    const doc = doctors.find(d => d.id === admitDoctorId) || doctors[0];

    onAdmitPatient(activeTargetWard.id, activeTargetBed.id, {
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doc?.id || 'doc_gen',
      doctorName: doc ? doc.fullName : 'Navbatchi Shifokor',
      diagnosis: admitDiagnosis.trim() || 'Kuzatuv va statsionar davo',
      dietType: admitDiet,
      depositAmount: Number(admitDeposit) || 0,
    });

    setShowAdmitModal(false);
    setActiveTargetWard(null);
    setActiveTargetBed(null);
  };

  const handleConfirmDischarge = () => {
    if (!activeTargetWard || !activeTargetBed) return;
    const result = onDischargePatient(activeTargetWard.id, activeTargetBed.id);
    alert(`Bemor muvaffaqiyatli chiqarildi!\nJami yotgan kunlar: ${result.totalDays} kun\nHisoblangan palata summasi: ${(result.totalCost ?? 0).toLocaleString()} ${clinic.currencySymbol}\nKrovat dezinfeksiya holatiga o'tkazildi.`);
    setShowDischargeModal(false);
    setActiveTargetWard(null);
    setActiveTargetBed(null);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) {
      alert('Iltimos, palata raqamini kiriting.');
      return;
    }

    const beds: Bed[] = [];
    for (let i = 1; i <= newBedCount; i++) {
      beds.push({
        id: `bed_${Date.now()}_${i}`,
        bedNumber: `${i}-o'rin`,
        status: 'available',
        dailyPrice: newDailyRate,
      });
    }

    onAddWardRoom({
      clinicId: clinic.id,
      roomNumber: newRoomNumber.trim(),
      department: newDepartment,
      floor: newFloor,
      type: newType,
      dailyRate: newDailyRate,
      facilities: newFacilities.split(',').map(f => f.trim()),
      beds,
    });

    setShowAddRoomModal(false);
    setNewRoomNumber('');
  };

  // Helper for days spent
  const calculateDaysSpent = (admissionDate?: string) => {
    if (!admissionDate) return 1;
    const diff = Math.max(1, Math.ceil((Date.now() - new Date(admissionDate).getTime()) / (1000 * 60 * 60 * 24)));
    return diff;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <BedIcon className="w-6 h-6 text-indigo-600" />
            <span>Palatalar va Statsionar Boshqaruvi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sxematik interaktiv xarita, bo'sh/band krovatlar, yotqizish, kunlik narx va kassa hisob-kitobi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddRoomModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Palata Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Jami Krovatlar</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalBeds}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase">Bo'sh Krovatlar</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{availableBeds}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            🟢
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-700 uppercase">Band (Yotgan bemorlar)</div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{occupiedBeds}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            🔴
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase">Bandlik Foizi</div>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{occupancyRate}%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs font-mono">
            {occupancyRate}%
          </div>
        </div>
      </div>

      {/* Legend & Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Legend */}
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-700">Holat belgilari:</span>
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Bo'sh (Qabulga tayyor)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Band</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Tozalanmoqda / Sanitar ishlov</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Palata yoki bemor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-44 focus:outline-hidden focus:bg-white"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">Barcha Bo'limlar</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">Barcha Qavatlar</option>
            <option value="1">1-qavat</option>
            <option value="2">2-qavat</option>
            <option value="3">3-qavat</option>
          </select>
        </div>
      </div>

      {/* Schematic Wards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWards.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <BedIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-600">Palatalar topilmadi</div>
            <div className="text-xs text-slate-400 mt-1">Yangi palata qo'shish uchun yuqoridagi tugmani bosing.</div>
          </div>
        ) : (
          filteredWards.map((ward) => {
            const wardOccupied = ward.beds.filter(b => b.status === 'occupied').length;
            const isFull = wardOccupied === ward.beds.length;

            return (
              <div
                key={ward.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {/* Room Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-base">{ward.roomNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ward.type === 'vip' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ward.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {ward.department} • {ward.floor}-qavat
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {(ward.dailyRate ?? 0).toLocaleString()} {clinic.currencySymbol}/kun
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      {wardOccupied} / {ward.beds.length} band
                    </div>
                  </div>
                </div>

                {/* Facilities tags */}
                {ward.facilities && ward.facilities.length > 0 && (
                  <div className="px-4 py-2 bg-slate-50/40 border-b border-slate-100 flex flex-wrap gap-1">
                    {ward.facilities.map((fac, idx) => (
                      <span key={idx} className="text-[9px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                        {fac}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bed Matrix inside this Room */}
                <div className="p-4 space-y-3 flex-1">
                  {ward.beds.map((bed) => {
                    const isOccupied = bed.status === 'occupied';
                    const isCleaning = bed.status === 'cleaning';
                    const isAvailable = bed.status === 'available';

                    const daysSpent = calculateDaysSpent(bed.currentPatient?.admissionDate);
                    const totalBill = daysSpent * (bed.dailyPrice || ward.dailyRate);

                    return (
                      <div
                        key={bed.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isOccupied
                            ? 'bg-rose-50/40 border-rose-200'
                            : isCleaning
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              isOccupied ? 'bg-rose-500' : isCleaning ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></span>
                            <span className="font-bold text-xs text-slate-900">{bed.bedNumber}</span>
                          </div>

                          <div className="text-[10px] font-bold">
                            {isOccupied && <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded">BAND</span>}
                            {isCleaning && <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">TOZALANMOQDA</span>}
                            {isAvailable && <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">BO'SH</span>}
                          </div>
                        </div>

                        {/* If Occupied Patient Details */}
                        {isOccupied && bed.currentPatient && (
                          <div className="space-y-1.5 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-rose-100 mb-2">
                            <div className="font-bold text-slate-900 flex items-center justify-between">
                              <span>{bed.currentPatient.patientName}</span>
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {daysSpent} kun yotmoqda
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Shifokor: <span className="font-semibold text-slate-700">{bed.currentPatient.doctorName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              Tashxis: <span className="font-medium text-slate-800">{bed.currentPatient.diagnosis}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                              <span>Kunlik hisob:</span>
                              <span className="font-bold text-slate-900">{(totalBill ?? 0).toLocaleString()} {clinic.currencySymbol}</span>
                            </div>
                          </div>
                        )}

                        {/* Bed Action Buttons */}
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          {isAvailable && (
                            <button
                              onClick={() => handleOpenAdmit(ward, bed)}
                              className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Bemor Yotqizish</span>
                            </button>
                          )}

                          {isOccupied && (
                            <button
                              onClick={() => handleOpenDischarge(ward, bed)}
                              className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Chiqarish & Hisob-kitob</span>
                            </button>
                          )}

                          {isCleaning && (
                            <button
                              onClick={() => onUpdateBedStatus(ward.id, bed.id, 'available')}
                              className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Dezinfeksiya Tugadi (Bo'shatish)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Admit Patient to Ward */}
      {showAdmitModal && activeTargetWard && activeTargetBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-300" />
                  <span>Statsionarga Bemor Yotqizish</span>
                </h2>
                <p className="text-xs text-emerald-100">
                  {activeTargetWard.roomNumber} ({activeTargetWard.department}) • {activeTargetBed.bedNumber}
                </p>
              </div>
              <button
                onClick={() => setShowAdmitModal(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Yotqiziladigan Bemorni Tanlang *
                </label>
                <select
                  required
                  value={admitPatientId}
                  onChange={(e) => setAdmitPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-hidden text-xs"
                >
                  <option value="">Bemorni tanlang...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.phone}) — {p.birthDate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Biriktirilgan Davolovchi Shifokor *
                </label>
                <select
                  required
                  value={admitDoctorId}
                  onChange={(e) => setAdmitDoctorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-hidden text-xs"
                >
                  <option value="">Shifokorni tanlang...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Klinik Tashxis / Sabab
                </label>
                <textarea
                  rows={2}
                  placeholder="Klinik tashxis va yotqizish sababi..."
                  value={admitDiagnosis}
                  onChange={(e) => setAdmitDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Parhez / Ovqatlanish rejimi
                  </label>
                  <input
                    type="text"
                    value={admitDiet}
                    onChange={(e) => setAdmitDiet(e.target.value)}
                    placeholder="Parhez stol №5..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Boshlang'ich Depozit (Oldindan to'lov)
                  </label>
                  <input
                    type="number"
                    value={admitDeposit}
                    onChange={(e) => setAdmitDeposit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-semibold flex items-center justify-between">
                <span>Palata kunlik to'lovi:</span>
                <span className="font-mono text-sm">{(activeTargetWard.dailyRate ?? 0).toLocaleString()} {clinic.currencySymbol}/kun</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md transition-colors"
                >
                  Yotqizishni Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Discharge Patient & Billing */}
      {showDischargeModal && activeTargetWard && activeTargetBed && activeTargetBed.currentPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-rose-700 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                <span>Statsionardan Chiqarish & Kassa</span>
              </h2>
              <button onClick={() => setShowDischargeModal(false)} className="p-1 text-white/80 hover:text-white rounded-lg">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">{activeTargetBed.currentPatient.patientName}</div>
                <div className="text-slate-500">Palata: {activeTargetWard.roomNumber} • {activeTargetBed.bedNumber}</div>
                <div className="text-slate-500">Yotqizilgan sana: {new Date(activeTargetBed.currentPatient.admissionDate).toLocaleDateString('uz-UZ')}</div>
              </div>

              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                <div className="flex items-center justify-between font-semibold text-rose-900">
                  <span>Yotgan kunlar soni:</span>
                  <span className="font-bold font-mono text-sm">{calculateDaysSpent(activeTargetBed.currentPatient.admissionDate)} kun</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-rose-900">
                  <span>Kunlik palata narxi:</span>
                  <span className="font-mono">{(activeTargetWard.dailyRate ?? 0).toLocaleString()} {clinic.currencySymbol}</span>
                </div>
                <div className="pt-2 border-t border-rose-200 flex items-center justify-between font-black text-sm text-rose-950">
                  <span>JAMI TO'LOV:</span>
                  <span>
                    {(calculateDaysSpent(activeTargetBed.currentPatient.admissionDate) * (activeTargetWard.dailyRate || 0)).toLocaleString()} {clinic.currencySymbol}
                  </span>
                </div>
              </div>

              <div className="text-slate-500 text-[11px]">
                Bemor chiqarilgandan so'ng, krovat avtomatik ravishda dezinfeksiya holatiga o'tadi va kassa hisob-kitobiga yo'naltiriladi.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDischargeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDischarge}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-md transition-colors"
                >
                  Chiqarishni Tasdiqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Room */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <BedIcon className="w-5 h-5" />
                <span>Yangi Palata Qo'shish</span>
              </h2>
              <button onClick={() => setShowAddRoomModal(false)} className="p-1 text-white/80 hover:text-white rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Palata Raqami / Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="301-palata yoki VIP-3"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bo'lim</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Terapiya, Xirurgiya..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qavat</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newFloor}
                    onChange={(e) => setNewFloor(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Palata Toifasi</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'standard' | 'vip' | 'intensive' | 'pediatric')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  >
                    <option value="standard">Standart</option>
                    <option value="vip">VIP Lyuks</option>
                    <option value="intensive">Reanimatsiya</option>
                    <option value="pediatric">Bolalar bo'limi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Krovatlar soni</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newBedCount}
                    onChange={(e) => setNewBedCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kunlik To'lov Narxi ({clinic.currencySymbol})</label>
                <input
                  type="number"
                  value={newDailyRate}
                  onChange={(e) => setNewDailyRate(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qulayliklar (vergul bilan)</label>
                <input
                  type="text"
                  value={newFacilities}
                  onChange={(e) => setNewFacilities(e.target.value)}
                  placeholder="Konditsioner, Dush, Wi-Fi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition-colors"
                >
                  Palatani Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
