import React, { useState } from 'react';
import { 
  Building2, 
  KeyRound, 
  PlusCircle, 
  ShieldCheck, 
  Stethoscope, 
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  FileText,
  UserCheck,
  Eye,
  EyeOff,
  Activity,
  Layers,
  Database,
  Check
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { ClinicProfile, StaffMember } from '../../types';

interface AuthPortalProps {
  onClinicAuthenticated: (clinic: ClinicProfile, staff?: StaffMember) => void;
  onOpenRegisterClinic?: () => void;
  onRegisterClinicDirect?: (
    profileData: Omit<ClinicProfile, 'id' | 'createdAt'>,
    adminUser?: { fullName: string; username: string; password?: string; phone: string; email: string }
  ) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  onClinicAuthenticated,
  onOpenRegisterClinic,
  onRegisterClinicDirect,
}) => {
  // Mode for mobile/small screens (desktop shows side-by-side)
  const [mobileActiveTab, setMobileActiveTab] = useState<'login' | 'register'>('login');

  // --- Login State ---
  const [loginUsername, setLoginUsername] = useState('shifonur');
  const [loginPassword, setLoginPassword] = useState('123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- Registration State ---
  const [regName, setRegName] = useState('');
  const [regShortName, setRegShortName] = useState('');
  const [regClinicLogin, setRegClinicLogin] = useState('');
  const [regClinicPassword, setRegClinicPassword] = useState('123456');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regInn, setRegInn] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regCity, setRegCity] = useState('Toshkent');
  const [regAddress, setRegAddress] = useState('');
  const [regPhone, setRegPhone] = useState('+998 9');
  const [regEmail, setRegEmail] = useState('');
  const [regDirectorName, setRegDirectorName] = useState('');
  const [regAdminUsername, setRegAdminUsername] = useState('admin');
  const [regAdminPassword, setRegAdminPassword] = useState('123456');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // Handle Clinic Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Iltimos, klinika logini va parolini to\'liq kiriting.');
      return;
    }

    setIsLoggingIn(true);

    setTimeout(() => {
      const res = StorageService.authenticateClinic(loginUsername, loginPassword);
      setIsLoggingIn(false);

      if (res.success && res.clinic) {
        onClinicAuthenticated(res.clinic, res.adminStaff);
      } else {
        setLoginError(res.message || 'Kiritilgan login yoki parol noto\'g\'ri. Iltimos, qayta tekshirib ko\'ring.');
      }
    }, 250);
  };

  // Quick instant login demo clinic (1-bosishda to'g'ridan-to'g'ri kirish)
  const handleInstantDemoLogin = (username: string, pass: string) => {
    setLoginUsername(username);
    setLoginPassword(pass);
    setLoginError('');
    setIsLoggingIn(true);

    setTimeout(() => {
      const res = StorageService.authenticateClinic(username, pass);
      setIsLoggingIn(false);

      if (res.success && res.clinic) {
        onClinicAuthenticated(res.clinic, res.adminStaff);
      } else {
        setLoginError(res.message || 'Kirishda xatolik yuz berdi. Qayta urinib ko\'ring.');
      }
    }, 200);
  };

  // Auto-fill sample registration data for quick testing
  const handleFillSampleRegistration = () => {
    const randomId = Math.floor(100 + Math.random() * 900);
    setRegName(`Akfa Medline ${randomId} MCHJ`);
    setRegShortName(`Akfa Med ${randomId}`);
    setRegClinicLogin(`akfamed_${randomId}`);
    setRegClinicPassword('123456');
    setRegCity('Toshkent');
    setRegAddress('Toshkent sh., Olmazor tumani, Kichik halqa yo\'li, 5A-uy');
    setRegPhone('+998 71 203-30-03');
    setRegEmail(`info@akfamed${randomId}.uz`);
    setRegInn(`308${Math.floor(100000 + Math.random() * 900000)}`);
    setRegLicense(`LIT-UZB-2026/${randomId}`);
    setRegDirectorName('Dr. Kamol Saidov');
    setRegAdminUsername('admin');
    setRegAdminPassword('123456');
    setRegError('');
  };

  // Handle Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Iltimos, klinika nomini kiriting.');
      return;
    }
    if (!regDirectorName.trim()) {
      setRegError('Iltimos, Bosh shifokor / Rahbar F.I.Sh ni kiriting.');
      return;
    }

    const effectiveClinicLogin = regClinicLogin.trim() || 
      (regShortName.trim() ? regShortName.toLowerCase().replace(/[^a-z0-9]/gi, '_') : `med_${Date.now().toString().slice(-4)}`);
    const effectiveClinicPassword = regClinicPassword.trim() || '123456';
    const effectiveAdminUsername = regAdminUsername.trim() || 'admin';
    const effectiveAdminPassword = regAdminPassword.trim() || effectiveClinicPassword;

    setIsRegistering(true);

    setTimeout(() => {
      try {
        const newClinicProfile: Omit<ClinicProfile, 'id' | 'createdAt'> = {
          name: regName.trim(),
          shortName: regShortName.trim() || regName.trim().slice(0, 15),
          loginUsername: effectiveClinicLogin,
          password: effectiveClinicPassword,
          licenseNumber: regLicense.trim() || `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
          inn: regInn.trim() || `${Math.floor(300000000 + Math.random() * 99999999)}`,
          address: regAddress.trim() || `${regCity} shahri, Tibbiyot ko'chasi, 12-uy`,
          city: regCity.trim(),
          phone: regPhone.trim(),
          email: regEmail.trim() || `info@${effectiveClinicLogin}.uz`,
          telegram: `@${effectiveClinicLogin}_clinic`,
          directorName: regDirectorName.trim(),
          currency: 'UZS',
          currencySymbol: 'so\'m',
          workingHours: '08:00 - 20:00 (Dush-Shan)',
        };

        const adminUser = {
          fullName: regDirectorName.trim(),
          username: effectiveAdminUsername,
          password: effectiveAdminPassword,
          phone: regPhone.trim(),
          email: regEmail.trim() || `${effectiveAdminUsername}@${effectiveClinicLogin}.uz`,
        };

        if (onRegisterClinicDirect) {
          onRegisterClinicDirect(newClinicProfile, adminUser);
        } else {
          const { clinic, adminStaff } = StorageService.registerNewClinic(newClinicProfile, adminUser);
          setRegSuccessMsg(`"${clinic.name}" klinikasi muvaffaqiyatli ro'yxatdan o'tdi! Tizimga yo'naltirilmoqda...`);
          setTimeout(() => {
            onClinicAuthenticated(clinic, adminStaff);
          }, 600);
        }
      } catch (err: any) {
        setRegError(err?.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi. Qayta urinib ko\'ring.');
      } finally {
        setIsRegistering(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Universal Navbar */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-slate-800/90 bg-slate-900/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-500/20">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Medix<span className="text-blue-400">Pro</span> ERP</span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/80">
                Hospital OS v4.5
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Tibbiyot markazlari, poliklinikalar va shifoxonalar uchun yagona avtomatlashtirilgan boshqaruv tizimi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-bit Shifrlangan Multi-Tenant Baza</span>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMobileActiveTab('login')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mobileActiveTab === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kirish
            </button>
            <button
              onClick={() => setMobileActiveTab('register')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mobileActiveTab === 'register'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              + Ro'yxatdan o'tish
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Side by Side (Yonma-yon) on Desktop */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        
        {/* Top Info Banner */}
        <div className="mb-6 text-center max-w-2xl mx-auto hidden lg:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Klinikangiz uchun xavfsiz shaxsiy EMR & ERP tizimi</span>
          </div>
          <h2 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight">
            Klinikaga Kirish yoki Yangi Klinikani Ro'yxatdan O'tkazish
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mavjud hisobingiz bilan kiring yoki o'z tibbiy markazingiz uchun mustaqil yangi baza oching
          </p>
        </div>

        {/* Side by Side Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ================= LEFT COLUMN: KLINIKA TIZIMIGA KIRISH (LOGIN) ================= */}
          <div className={`lg:col-span-5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col ${
            mobileActiveTab === 'login' ? 'block' : 'hidden lg:flex'
          }`}>
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-950 border border-blue-800 text-blue-300 text-[11px] font-bold">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  Klinika Portali
                </span>
                <span className="text-[11px] font-mono text-slate-400">SSL Himoyalangan</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Klinika Tizimiga Kirish
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Klinika unikal logini (ID/STIR) va maxfiy parolini kiriting.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4 text-xs flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {loginError && (
                  <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Kirishda xatolik</div>
                      <div className="mt-0.5">{loginError}</div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Klinika Logini / ID / STIR *</span>
                    <span className="text-[10px] text-slate-400">Masalan: shifonur</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="shifonur yoki STIR"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Klinika Maxfiy Paroli *</span>
                    <span className="text-[10px] text-slate-400">Standart demo: 123</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Parol..."
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Klinika Tizimiga Kirish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Demo Accounts Helper */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tayyor Demo Klinikalar (1-bosishda sinash):</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Parol: 123
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Demo 1: Shifo Nur */}
                  <div
                    onClick={() => handleInstantDemoLogin('shifonur', '123')}
                    className="p-3 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 text-left transition-all flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-blue-500/10"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-blue-300 text-xs flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Shifo Nur Medical (Toshkent)</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Login: <span className="text-white font-bold">shifonur</span> | Parol: <span className="text-white font-bold">123</span>
                        <span className="text-slate-500 ml-1.5">(Statsionar, EMR, Kassa, Lab)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isLoggingIn}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-xs shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Kirish ⚡</span>
                    </button>
                  </div>

                  {/* Demo 2: Hayat Med */}
                  <div
                    onClick={() => handleInstantDemoLogin('hayatmed', '123')}
                    className="p-3 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 text-left transition-all flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-emerald-500/10"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-300 text-xs flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Hayat Med Samarqand</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Login: <span className="text-white font-bold">hayatmed</span> | Parol: <span className="text-white font-bold">123</span>
                        <span className="text-slate-500 ml-1.5">(Kardiologiya & Terapiya)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isLoggingIn}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-xs shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Kirish ⚡</span>
                    </button>
                  </div>

                  {/* Demo 3: Darmon Plus */}
                  <div
                    onClick={() => handleInstantDemoLogin('darmonplus', '123')}
                    className="p-3 rounded-xl bg-slate-950/90 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/50 text-left transition-all flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-purple-500/10"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-purple-300 text-xs flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Darmon Plus Diagnostika (Andijon)</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Login: <span className="text-white font-bold">darmonplus</span> | Parol: <span className="text-white font-bold">123</span>
                        <span className="text-slate-500 ml-1.5">(Diagnostika & Lab)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isLoggingIn}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-xs shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Kirish ⚡</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* ================= RIGHT COLUMN: YANGI KLINIKANI RO'YXATDAN O'TKAZISH (REGISTER) ================= */}
          <div className={`lg:col-span-7 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col ${
            mobileActiveTab === 'register' ? 'block' : 'hidden lg:flex'
          }`}>
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 text-[11px] font-bold">
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Yangi Klinika Onboarding
                </span>
                <button
                  type="button"
                  onClick={handleFillSampleRegistration}
                  className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/80 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Formani namunaviy ma'lumotlar bilan avtomatik to'ldirish"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>✨ Namuna bilan to'ldirish</span>
                </button>
              </div>
              <h3 className="text-xl font-black text-white">
                Yangi Klinikani Ro'yxatdan O'tkazish
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Klinikangiz uchun mustaqil shifrlangan ma'lumotlar bazasi va Bosh administrator kabineti ochiladi.
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              {regError && (
                <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Ro'yxatdan o'tishda xatolik</div>
                    <div className="mt-0.5">{regError}</div>
                  </div>
                </div>
              )}

              {regSuccessMsg && (
                <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Muvaffaqiyatli!</div>
                    <div className="mt-0.5">{regSuccessMsg}</div>
                  </div>
                </div>
              )}

              {/* 1. Klinika Ma'lumotlari */}
              <div className="space-y-3">
                <div className="font-bold text-slate-300 text-xs flex items-center gap-2 pb-1 border-b border-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>1. Klinika Asosiy Ma'lumotlari</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Klinika to'liq nomi *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: 'Akfa Medline MCHJ'"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        if (!regShortName) setRegShortName(e.target.value.slice(0, 15));
                        if (!regClinicLogin) setRegClinicLogin(e.target.value.slice(0, 10).toLowerCase().replace(/[^a-z0-9]/gi, ''));
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Qisqa nomi / Brend
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: 'Akfa Medline'"
                      value={regShortName}
                      onChange={(e) => setRegShortName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Shahar / Viloyat *
                    </label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="Toshkent">Toshkent shahri</option>
                      <option value="Samarqand">Samarqand viloyati</option>
                      <option value="Andijon">Andijon viloyati</option>
                      <option value="Farg'ona">Farg'ona viloyati</option>
                      <option value="Namangan">Namangan viloyati</option>
                      <option value="Buxoro">Buxoro viloyati</option>
                      <option value="Xorazm">Xorazm viloyati</option>
                      <option value="Qashqadaryo">Qashqadaryo viloyati</option>
                      <option value="Surxondaryo">Surxondaryo viloyati</option>
                      <option value="Jizzax">Jizzax viloyati</option>
                      <option value="Sirdaryo">Sirdaryo viloyati</option>
                      <option value="Navoiy">Navoiy viloyati</option>
                      <option value="Qoraqalpog'iston">Qoraqalpog'iston Respublikasi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Aloqa telefoni *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+998 71 200-00-00"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      STIR (INN) raqami
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: 308912345"
                      value={regInn}
                      onChange={(e) => setRegInn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Tibbiy Litsenziya raqami
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: LIC-UZ-2026-88"
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Klinika Tizimiga Kirish Ma'lumotlari */}
              <div className="space-y-3 pt-2">
                <div className="font-bold text-slate-300 text-xs flex items-center gap-2 pb-1 border-b border-slate-800">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Klinika Kirish Logini va Paroli</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Klinika Logini (Tizim ID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="akfamed, shifo_plus..."
                      value={regClinicLogin}
                      onChange={(e) => setRegClinicLogin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Klinika Kirish Paroli *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Maxfiy parol..."
                        value={regClinicPassword}
                        onChange={(e) => setRegClinicPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:border-blue-500 focus:outline-hidden pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Bosh Shifokor / Administrator */}
              <div className="space-y-3 pt-2">
                <div className="font-bold text-slate-300 text-xs flex items-center gap-2 pb-1 border-b border-slate-800">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>3. Bosh Shifokor & Administrator Shaxsiy Kabineti</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block font-semibold text-slate-300 mb-1">
                      Bosh Shifokor F.I.Sh *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Alisher Qodirov"
                      value={regDirectorName}
                      onChange={(e) => setRegDirectorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Admin Logini *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={regAdminUsername}
                      onChange={(e) => setRegAdminUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Admin Paroli *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="123456"
                      value={regAdminPassword}
                      onChange={(e) => setRegAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRegistering ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Ro'yxatdan O'tish va Yangi Klinikani Ochish</span>
                    </>
                  )}
                </button>
                <div className="text-[11px] text-center text-slate-400 mt-2">
                  Ro'yxatdan o'tgandan so'ng dastlabki standart bo'limlar, palatalar va xizmatlar avtomatik yaratiladi.
                </div>
              </div>
            </form>
          </div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="px-6 py-3 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Cloud Multi-Tenant SaaS Engine Faol</span>
        </div>
        <div>
          © 2026 MedixPro Clinic ERP. O'zbekiston Respublikasi Tibbiyot Standartlari Asosida.
        </div>
      </footer>
    </div>
  );
};
