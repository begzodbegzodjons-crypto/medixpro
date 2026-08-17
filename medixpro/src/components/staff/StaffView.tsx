import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Search,
  KeyRound,
  LogIn,
  ShieldCheck,
  Stethoscope,
  CreditCard,
  FlaskConical,
  Pill,
  Bed,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { StaffMember, ClinicProfile, UserRole } from '../../types';

interface StaffViewProps {
  staffList: StaffMember[];
  clinic: ClinicProfile;
  onAddStaff: (staff: Omit<StaffMember, 'id' | 'createdAt'>) => void;
  onUpdateStaff: (staff: StaffMember) => void;
  onDeleteStaff: (staffId: string) => void;
  onLoginAsStaff?: (staff: StaffMember) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  staffList,
  clinic,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onLoginAsStaff,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [showPasswords, setShowPasswords] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [specialty, setSpecialty] = useState('Terapevt');
  const [phone, setPhone] = useState('+998 90 123-45-67');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [pinCode, setPinCode] = useState('1234');
  const [roomNumber, setRoomNumber] = useState('101-xona');
  const [consultationFee, setConsultationFee] = useState(100000);
  const [commissionPercent, setCommissionPercent] = useState(30);

  const filteredStaff = staffList.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      (s.specialty && s.specialty.toLowerCase().includes(q)) ||
      s.role.toLowerCase().includes(q)
    );
  });

  const handleOpenEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFullName(staff.fullName);
    setRole(staff.role);
    setSpecialty(staff.specialty || '');
    setPhone(staff.phone || '');
    setUsername(staff.username);
    setPassword(staff.password || '');
    setPinCode(staff.pinCode || '1234');
    setRoomNumber(staff.roomNumber || '');
    setConsultationFee(staff.consultationFee || 100000);
    setCommissionPercent(staff.commissionPercent || 30);
    setShowAddModal(true);
  };

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFullName('');
    setRole('doctor');
    setSpecialty('Terapevt');
    setPhone('+998 9');
    setUsername(`dr_${Date.now().toString().slice(-4)}`);
    setPassword('123456');
    setPinCode('1234');
    setRoomNumber('105-xona');
    setConsultationFee(100000);
    setCommissionPercent(30);
    setShowAddModal(true);
  };

  const handleCopyCredentials = (staff: StaffMember) => {
    const text = `Klinika: ${clinic.name}\nXodim: ${staff.fullName} (${staff.role})\nLogin: ${staff.username}\nParol: ${staff.password || '123'}\nPIN-kod: ${staff.pinCode || '1234'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(staff.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      alert('Iltimos, F.I.SH va loginni kiriting.');
      return;
    }

    if (editingStaff) {
      onUpdateStaff({
        ...editingStaff,
        fullName: fullName.trim(),
        role,
        specialty,
        phone,
        email: editingStaff.email || `${username.trim()}@${clinic.shortName.toLowerCase().replace(/\s+/g, '')}.uz`,
        username: username.trim(),
        password: password.trim(),
        pinCode: pinCode.trim() || '1234',
        roomNumber,
        consultationFee,
        commissionPercent,
        status: editingStaff.status || 'active',
      });
    } else {
      onAddStaff({
        clinicId: clinic.id,
        fullName: fullName.trim(),
        role,
        specialty,
        phone,
        email: `${username.trim()}@${clinic.shortName.toLowerCase().replace(/\s+/g, '')}.uz`,
        username: username.trim(),
        password: password.trim(),
        pinCode: pinCode.trim() || '1234',
        roomNumber,
        consultationFee,
        commissionPercent,
        status: 'active',
      });
    }

    setShowAddModal(false);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin': return { label: 'Admin / Bosh Shifokor', icon: ShieldCheck, color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'doctor': return { label: 'Shifokor', icon: Stethoscope, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'reception': return { label: 'Qabulxona (Registrator)', icon: Users, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'cashier': return { label: 'Kassir', icon: CreditCard, color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'inpatient_nurse': return { label: 'Palata Hamshirasi', icon: Bed, color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'lab_tech': return { label: 'Laborant', icon: FlaskConical, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'pharmacist': return { label: 'Provizor / Dorixona', icon: Pill, color: 'bg-rose-100 text-rose-800 border-rose-200' };
      default: return { label: 'Xodim', icon: Users, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Klinika Xodimlari, Parollar va Rollar Boshqaruvi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Yangi shifokor, registrator, kassir yoki hamshira qo'shing, ularga shaxsiy login va parol bering va ularning kabinetiga o'ting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Parollarni ko'rsatish yoki yashirish"
          >
            {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPasswords ? 'Parollarni Yashirish' : 'Parollarni Ko\'rsatish'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Yangi Xodim Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Jami Xodimlar</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{staffList.length} nafar</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Shifokorlar</div>
          <div className="text-2xl font-black text-blue-600 mt-0.5">
            {staffList.filter(s => s.role === 'doctor').length} nafar
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Qabulxona & Hamshiralar</div>
          <div className="text-2xl font-black text-emerald-600 mt-0.5">
            {staffList.filter(s => s.role === 'reception' || s.role === 'inpatient_nurse').length} nafar
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Kassirlar & Laborantlar</div>
          <div className="text-2xl font-black text-amber-600 mt-0.5">
            {staffList.filter(s => s.role === 'cashier' || s.role === 'lab_tech').length} nafar
          </div>
        </div>
      </div>

      {/* Staff Grid/Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="F.I.SH, login yoki mutaxassislik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-64 focus:outline-hidden focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredStaff.length} nafar xodim topildi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Xodim F.I.SH & Telefon</th>
                <th className="py-3 px-4">Lavozim & Mutaxassislik</th>
                <th className="py-3 px-4">Xona</th>
                <th className="py-3 px-4 bg-slate-100/70">Kirish Logini & Paroli</th>
                <th className="py-3 px-4">Ko'rik Narxi</th>
                <th className="py-3 px-4">Ulush (KPI %)</th>
                <th className="py-3 px-4 text-right">Kabinetga Kirish & Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => {
                const badge = getRoleBadge(staff.role);
                const Icon = badge.icon;

                return (
                  <tr key={staff.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{staff.fullName}</div>
                      <div className="text-[11px] text-slate-500">{staff.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          {staff.role}
                        </span>
                        {staff.specialty && (
                          <span className="text-slate-700 font-semibold text-[11px]">({staff.specialty})</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {staff.roomNumber || '-'}
                    </td>
                    <td className="py-3.5 px-4 bg-slate-50/80">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-mono text-slate-900 font-bold text-[11px]">
                            Login: <span className="text-blue-600">@{staff.username}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-600 flex items-center gap-2">
                            <span>Parol: <span className="text-emerald-700 font-bold">{showPasswords ? (staff.password || '123') : '••••'}</span></span>
                            <span className="text-slate-300">|</span>
                            <span>PIN: <span className="text-indigo-700 font-bold">{showPasswords ? (staff.pinCode || '1234') : '••••'}</span></span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyCredentials(staff)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                          title="Login, parol va PIN-kodni nusxalash"
                        >
                          {copiedId === staff.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {staff.consultationFee ? `${staff.consultationFee.toLocaleString()} ${clinic.currencySymbol}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {staff.commissionPercent ? `${staff.commissionPercent}%` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onLoginAsStaff && (
                          <button
                            onClick={() => onLoginAsStaff(staff)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer border border-blue-200 hover:border-transparent"
                            title="Ushbu xodim kabinetiga o'tish"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Kabinetga Kirish</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`${staff.fullName} xodimini o'chirishga ishonchingiz komilmi?`)) {
                              onDeleteStaff(staff.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Staff */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <span>{editingStaff ? 'Xodim Ma\'lumotlarini va Parolini Tahrirlash' : 'Yangi Xodim va Parol Qo\'shish'}</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">To'liq F.I.SH *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Alisher Vohidov"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lavozim (Roli)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-bold text-slate-800"
                  >
                    <option value="doctor">Shifokor (Doctor)</option>
                    <option value="reception">Qabulxona (Registrator)</option>
                    <option value="cashier">Kassir (Cashier)</option>
                    <option value="inpatient_nurse">Palata Hamshirasi</option>
                    <option value="lab_tech">Laborant (Lab Tech)</option>
                    <option value="pharmacist">Provizor / Dorixona</option>
                    <option value="admin">Administrator (Bosh Shifokor)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mutaxassislik</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Kardiolog, Nevropatolog..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Login and Password Fields */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2.5">
                <div className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>Xodimning Tizimga Kirish Ma'lumotlari:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Login (Username) *</label>
                    <input
                      type="text"
                      required
                      placeholder="doctor_alisher"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg focus:outline-hidden font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Maxfiy Parol *</label>
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg focus:outline-hidden font-mono font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">4 xonali PIN *</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      placeholder="1234"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg focus:outline-hidden font-mono font-bold text-indigo-700"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefon Raqami</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Xona Raqami</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="104-xona"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-semibold"
                  />
                </div>
              </div>

              {role === 'doctor' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block font-semibold text-emerald-900 mb-1">Qabul Narxi ({clinic.currencySymbol})</label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-emerald-900 mb-1">Shifokor Ulushi (KPI %)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors cursor-pointer"
                >
                  {editingStaff ? 'O\'zgarishlarni Saqlash' : 'Xodimni Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
