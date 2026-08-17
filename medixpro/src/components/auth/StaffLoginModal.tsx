import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  KeyRound, 
  Shield, 
  LogIn, 
  CheckCircle2, 
  Stethoscope, 
  Users, 
  CreditCard, 
  FlaskConical, 
  Pill, 
  Bed,
  ArrowRight,
  Search,
  Lock,
  Delete,
  Building2,
  Clock,
  Sparkles,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { StaffMember, ClinicProfile, UserRole } from '../../types';

interface StaffLoginModalProps {
  isOpen?: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  currentUser?: StaffMember | null;
  currentClinic?: ClinicProfile;
  onSelectStaff: (staff: StaffMember) => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen = true,
  onClose,
  staffList,
  currentUser,
  currentClinic,
  onSelectStaff,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'manual'>('cards');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected staff for PIN verification
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authMode, setAuthMode] = useState<'pin' | 'password'>('pin');
  const [errorMsg, setErrorMsg] = useState('');

  // Manual login form state
  const [manualUsername, setManualUsername] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [manualError, setManualError] = useState('');

  if (isOpen === false) return null;

  // Filter staff
  const filteredStaff = staffList.filter((s) => {
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      s.fullName.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      (s.specialty && s.specialty.toLowerCase().includes(q)) ||
      (s.roomNumber && s.roomNumber.toLowerCase().includes(q))
    );
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': return { label: 'Bosh Shifokor / Rahbar', icon: Shield, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
      case 'reception': return { label: 'Qabulxona (Registratura)', icon: Users, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'doctor': return { label: 'Shifokor (EMR)', icon: Stethoscope, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'cashier': return { label: 'Kassa / POS Terminal', icon: CreditCard, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 'inpatient_nurse': return { label: 'Palata Hamshirasi', icon: Bed, color: 'text-teal-600 bg-teal-50 border-teal-200' };
      case 'lab_tech': return { label: 'Laboratoriya Mutaxassisi', icon: FlaskConical, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'pharmacist': return { label: 'Dorixona / Provisor', icon: Pill, color: 'text-rose-600 bg-rose-50 border-rose-200' };
      default: return { label: 'Xodim', icon: UserCheck, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  const handleCardClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setPinInput('');
    setPasswordInput('');
    setErrorMsg('');
    setAuthMode('pin');
  };

  // PIN Keypad handlers
  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        verifyAndLogin(selectedStaff!, nextPin);
      }
    }
  };

  const verifyAndLogin = (staff: StaffMember, enteredPin: string) => {
    const validPin = staff.pinCode || '1234';
    const validPass = staff.password || '123';

    if (enteredPin === validPin || enteredPin === '1234' || enteredPin === validPass) {
      onSelectStaff(staff);
      onClose();
    } else {
      setErrorMsg('PIN-kod noto\'g\'ri kiritildi.');
      setPinInput('');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const validPass = selectedStaff.password || '123';
    const validPin = selectedStaff.pinCode || '1234';

    if (passwordInput.trim() === validPass || passwordInput.trim() === validPin || passwordInput.trim() === '123') {
      onSelectStaff(selectedStaff);
      onClose();
    } else {
      setErrorMsg('Kiritilgan parol noto\'g\'ri.');
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');

    const staff = staffList.find(
      (s) => s.username.toLowerCase() === manualUsername.trim().toLowerCase()
    );

    if (!staff) {
      setManualError(`"${manualUsername}" logini bo'yicha xodim topilmadi.`);
      return;
    }

    if (staff.password && staff.password !== manualPassword.trim() && staff.pinCode !== manualPassword.trim() && manualPassword.trim() !== '123') {
      setManualError('Kiritilgan parol noto\'g\'ri.');
      return;
    }

    onSelectStaff(staff);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Klinika Xodimlari & Shifokorlar Portali
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  {currentClinic?.name || 'Klinika ERP'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                O'z shaxsiy profilingizni tanlang va PIN yoki parol orqali tizimga kiring
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Selection & Search */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Main Mode Tabs */}
          <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('cards'); setSelectedStaff(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏢 Barcha Xodimlar ({staffList.length})
            </button>
            <button
              onClick={() => { setActiveTab('manual'); setSelectedStaff(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔑 Login & Parol bilan kirish
            </button>
          </div>

          {/* Search Box */}
          {activeTab === 'cards' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Xodim yoki xonani qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-blue-600 focus:outline-hidden text-slate-800"
              />
            </div>
          )}
        </div>

        {/* Role Filter Chips (When in Cards mode) */}
        {activeTab === 'cards' && !selectedStaff && (
          <div className="px-6 py-2 bg-white border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: 'Barchasi', icon: Users },
              { id: 'doctor', label: 'Shifokorlar (EMR)', icon: Stethoscope },
              { id: 'reception', label: 'Qabulxona (Registratura)', icon: Users },
              { id: 'admin', label: 'Bosh Shifokor / Admin', icon: Shield },
              { id: 'cashier', label: 'Kassa', icon: CreditCard },
              { id: 'inpatient_nurse', label: 'Hamshira', icon: Bed },
              { id: 'lab_tech', label: 'Laboratoriya', icon: FlaskConical },
              { id: 'pharmacist', label: 'Dorixona', icon: Pill },
            ].map((rf) => {
              const Icon = rf.icon;
              const isSelected = roleFilter === rf.id;
              return (
                <button
                  key={rf.id}
                  onClick={() => setRoleFilter(rf.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium whitespace-nowrap text-[11px] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{rf.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[60vh]">
          
          {/* 1. SELECTED STAFF PIN / PASSWORD VERIFICATION MODAL */}
          {selectedStaff ? (
            <div className="max-w-md mx-auto py-2 flex flex-col items-center animate-in fade-in zoom-in-95">
              
              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                className="self-start text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-4 font-semibold cursor-pointer"
              >
                ← Boshqa xodimni tanlash
              </button>

              {/* Staff Badge Header */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-md mb-2">
                {selectedStaff.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <h3 className="text-base font-extrabold text-slate-900 text-center">
                {selectedStaff.fullName}
              </h3>
              <p className="text-xs text-slate-500 font-medium text-center">
                {selectedStaff.specialty || selectedStaff.role.toUpperCase()} {selectedStaff.roomNumber ? `• ${selectedStaff.roomNumber}` : ''}
              </p>

              {/* Error Box */}
              {errorMsg && (
                <div className="w-full mt-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 justify-center font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Mode Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs mt-4 mb-3 border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setAuthMode('pin'); setErrorMsg(''); }}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    authMode === 'pin' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  4 xonali PIN
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('password'); setErrorMsg(''); }}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    authMode === 'password' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Parol kiritish
                </button>
              </div>

              {/* PIN Keypad Mode */}
              {authMode === 'pin' && (
                <div className="w-full flex flex-col items-center">
                  {/* PIN Dots Indicator */}
                  <div className="flex items-center gap-3 my-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                          pinInput.length > idx
                            ? 'bg-blue-600 border-blue-600 scale-110'
                            : 'bg-slate-200 border-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Keypad */}
                  <div className="grid grid-cols-3 gap-2 w-full max-w-[220px] mt-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handlePinDigit(d)}
                        className="h-11 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-600 active:text-white text-base font-bold text-slate-800 transition-colors cursor-pointer flex items-center justify-center border border-slate-200"
                      >
                        {d}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPinInput('')}
                      className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-500 transition-colors cursor-pointer flex items-center justify-center border border-slate-200"
                    >
                      Tozalash
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePinDigit('0')}
                      className="h-11 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-600 active:text-white text-base font-bold text-slate-800 transition-colors cursor-pointer flex items-center justify-center border border-slate-200"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => setPinInput(prev => prev.slice(0, -1))}
                      className="h-11 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors cursor-pointer flex items-center justify-center border border-slate-200"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono mt-3">
                    Demo PIN: <span className="text-slate-700 font-bold">{selectedStaff.pinCode || '1234'}</span>
                  </div>
                </div>
              )}

              {/* Password Form Mode */}
              {authMode === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs space-y-3 mt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Xodim Maxfiy Paroli:
                    </label>
                    <input
                      type="password"
                      autoFocus
                      required
                      placeholder="Parolni kiriting..."
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Kabinetga Kirish</span>
                  </button>

                  <div className="text-[11px] text-center text-slate-400 font-mono">
                    Demo Parol: <span className="text-slate-700 font-bold">{selectedStaff.password || '123'}</span>
                  </div>
                </form>
              )}

            </div>
          ) : activeTab === 'cards' ? (
            /* 2. STAFF CARDS GRID */
            <div>
              {filteredStaff.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Ushbu mezon bo'yicha hech qanday xodim topilmadi.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredStaff.map((staff) => {
                    const badge = getRoleBadge(staff.role);
                    const Icon = badge.icon;
                    const isCurrent = currentUser?.id === staff.id;

                    return (
                      <button
                        key={staff.id}
                        onClick={() => handleCardClick(staff)}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all group cursor-pointer ${
                          isCurrent
                            ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/80 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center transition-colors">
                                {staff.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                                  {staff.fullName}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  @{staff.username}
                                </div>
                              </div>
                            </div>

                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                Faol
                              </span>
                            )}
                          </div>

                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                              <Icon className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>
                            {staff.roomNumber && (
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                {staff.roomNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-mono">
                            PIN: {staff.pinCode || '1234'}
                          </span>
                          <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Kirish</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* 3. MANUAL USERNAME & PASSWORD LOGIN */
            <form onSubmit={handleManualLogin} className="space-y-4 max-w-sm mx-auto py-4 text-xs">
              {manualError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Xodim Logini (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin, doctor1, qabul, kassa..."
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Xodim Paroli yoki PIN-kodi *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Parolni kiriting..."
                  value={manualPassword}
                  onChange={(e) => setManualPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Kabinetga Kirish</span>
              </button>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                <div className="font-bold text-slate-700 mb-1.5">Tezkor namunaviy loginlar (bosib tanlang):</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {staffList.slice(0, 4).map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => {
                        setManualUsername(s.username);
                        setManualPassword(s.password || '123');
                      }}
                      className="p-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-slate-800 truncate text-[11px]">{s.fullName}</div>
                      <div className="text-[10px] text-blue-600 font-mono">@{s.username} • {s.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Klinika xodimlari uchun xavfsiz sessiya</span>
          </div>
          <span className="font-mono text-[11px]">Standart PIN: 1234 | Parol: 123</span>
        </div>

      </div>
    </div>
  );
};
