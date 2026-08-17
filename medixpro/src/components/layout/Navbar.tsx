import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserCheck, 
  Printer, 
  Tv, 
  Search, 
  PlusCircle, 
  SlidersHorizontal,
  Volume2,
  Clock,
  Stethoscope,
  Usb,
  Network,
  LogOut,
  ChevronDown,
  Database,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { ClinicProfile, StaffMember, PrinterConfig, TiDBConfig } from '../../types';
import { AudioService } from '../../services/audioService';

interface NavbarProps {
  clinic: ClinicProfile;
  currentUser: StaffMember | null;
  waitingCount?: number;
  printerConfig: PrinterConfig;
  tidbConfig?: TiDBConfig;
  onOpenStaffLogin: () => void;
  onLogout?: () => void;
  onLockSession?: () => void;
  onClinicLogout?: () => void;
  onOpenPrinterSettings: () => void;
  onOpenQueueTV: () => void;
  onOpenTiDBSync?: () => void;
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  clinic,
  currentUser,
  printerConfig,
  tidbConfig,
  onOpenStaffLogin,
  onLogout,
  onLockSession,
  onClinicLogout,
  onOpenPrinterSettings,
  onOpenQueueTV,
  onOpenTiDBSync,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return { label: 'Bosh Shifokor', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'reception': return { label: 'Qabulxona', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'doctor': return { label: 'Shifokor', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'cashier': return { label: 'Kassir', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'inpatient_nurse': return { label: 'Hamshira', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'lab_tech': return { label: 'Laborant', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'pharmacist': return { label: 'Farmatsevt', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      default: return { label: 'Xodim', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = getRoleLabel(currentUser?.role);

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-xs">
      {/* Left: Brand & Authenticated Clinic Display */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-xs text-sm">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
              {clinic.name}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Faol Tizim
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{clinic.city || 'Toshkent'}</span>
            {clinic.inn && (
              <span className="hidden md:inline text-slate-400 font-mono">• STIR: {clinic.inn}</span>
            )}
            {clinic.phone && (
              <span className="hidden lg:inline text-slate-400">• Tel: {clinic.phone}</span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Bemor qidirish (F.I.SH, telefon, pasport)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Right: User Profile & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* TV Monitor Button */}
        <button
          onClick={onOpenQueueTV}
          className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Kutish zali TV Tablosi (HDMI)"
        >
          <Tv className="w-3.5 h-3.5 text-slate-700" />
          <span className="hidden xl:inline">TV Tablo</span>
        </button>

        {/* Audio Test */}
        <button
          onClick={() => AudioService.playChime()}
          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          title="Ovozli qo'ng'iroqni sinash (Ding-dong)"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200"></div>

        {/* User Account / Profile Box */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <div 
              onClick={onOpenStaffLogin}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer group transition-all"
              title="Xodimni almashtirish yoki parol bilan kirish"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-xs group-hover:bg-blue-600 transition-colors">
                {currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                  {currentUser.roomNumber && (
                    <span className="text-[10px] text-slate-500 font-semibold">• {currentUser.roomNumber}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Lock Session Button */}
            {onLockSession && (
              <button
                onClick={onLockSession}
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-[11px] font-semibold rounded-md border border-slate-200 transition-colors cursor-pointer"
                title="Ekranni vaqtincha qulflash (PIN/parol bilan qayta ochish)"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Qulflash</span>
              </button>
            )}

            {/* Staff Switch / Profile */}
            <button
              onClick={onOpenStaffLogin}
              className="hidden lg:flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-semibold rounded-md border border-slate-200 transition-colors cursor-pointer"
              title="Xodimni almashtirish yoki boshqa kabinetga kirish"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Xodimni almashtirish</span>
            </button>

            {/* Clinic Logout button */}
            {onClinicLogout && (
              <button
                onClick={onClinicLogout}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                title="Klinika hisobidan to'liq chiqish (Klinika kirish ekraniga qaytish)"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Klinikadan Chiqish</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenStaffLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Xodim Kirishi</span>
            </button>
            {onClinicLogout && (
              <button
                onClick={onClinicLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Klinikadan Chiqish"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
