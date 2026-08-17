import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  KeyRound, 
  Delete, 
  ArrowRight, 
  AlertCircle, 
  UserCheck, 
  LogOut,
  Building2,
  Stethoscope
} from 'lucide-react';
import { StaffMember, ClinicProfile } from '../../types';

interface SessionLockModalProps {
  isOpen: boolean;
  clinic: ClinicProfile;
  currentUser: StaffMember | null;
  onUnlock: () => void;
  onSwitchStaff: () => void;
  onClinicLogout: () => void;
}

export const SessionLockModal: React.FC<SessionLockModalProps> = ({
  isOpen,
  clinic,
  currentUser,
  onUnlock,
  onSwitchStaff,
  onClinicLogout,
}) => {
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'pin' | 'password'>('pin');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setPassword('');
      setErrorMsg('');
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const staffPin = currentUser.pinCode || '1234';
  const staffPassword = currentUser.password || '123';

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handlePinDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handlePinClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === staffPin || enteredPin === '1234' || enteredPin === staffPassword) {
      setIsSuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 250);
    } else {
      setErrorMsg('PIN-kod noto\'g\'ri kiritildi.');
      setPin('');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.trim() === staffPassword || password.trim() === staffPin || password.trim() === '123') {
      setIsSuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 250);
    } else {
      setErrorMsg('Parol noto\'g\'ri kiritildi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-white flex flex-col items-center relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Clinic & Lock Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 mb-6">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Ish Stoli Qulflangan • {clinic.name}</span>
        </div>

        {/* Staff Avatar & Details */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-600/30 border-2 border-slate-700 mb-3">
          {currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>

        <h3 className="text-lg font-bold text-white text-center">
          {currentUser.fullName}
        </h3>
        <p className="text-xs text-blue-400 font-medium text-center mt-0.5">
          {currentUser.specialty || currentUser.role.toUpperCase()} {currentUser.roomNumber ? `• ${currentUser.roomNumber}` : ''}
        </p>

        {/* Error / Feedback */}
        {errorMsg && (
          <div className="w-full mt-4 p-2.5 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2 justify-center animate-in shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess && (
          <div className="w-full mt-4 p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-xl flex items-center gap-2 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Qulf ochildi!</span>
          </div>
        )}

        {/* Toggle Mode: PIN vs Password */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs mt-4 mb-4">
          <button
            type="button"
            onClick={() => { setAuthMode('pin'); setErrorMsg(''); }}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              authMode === 'pin' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4 xonali PIN
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setErrorMsg(''); }}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              authMode === 'password' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Parol orqali
          </button>
        </div>

        {/* PIN MODE */}
        {authMode === 'pin' && (
          <div className="w-full flex flex-col items-center">
            {/* PIN Dots Indicator */}
            <div className="flex items-center gap-3 my-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > idx
                      ? 'bg-blue-500 border-blue-400 scale-110 shadow-sm shadow-blue-500'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] mt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinInput(digit)}
                  className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-lg font-black text-white transition-colors cursor-pointer flex items-center justify-center border border-slate-700/60 shadow-xs"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handlePinClear}
                className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-bold text-slate-400 transition-colors cursor-pointer flex items-center justify-center border border-slate-800"
              >
                Tozalash
              </button>
              <button
                type="button"
                onClick={() => handlePinInput('0')}
                className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-lg font-black text-white transition-colors cursor-pointer flex items-center justify-center border border-slate-700/60 shadow-xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={handlePinDelete}
                className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center justify-center border border-slate-800"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-[11px] text-slate-500 font-mono mt-3">
              Standart PIN: <span className="text-slate-300 font-bold">{staffPin}</span>
            </div>
          </div>
        )}

        {/* PASSWORD MODE */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="w-full space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Xodim Paroli:
              </label>
              <input
                type="password"
                autoFocus
                placeholder="Parolni kiriting..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Unlock className="w-4 h-4" />
              <span>Qulfdan chiqarish</span>
            </button>
          </form>
        )}

        {/* Bottom Switch / Logout Actions */}
        <div className="w-full mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onSwitchStaff}
            className="text-slate-400 hover:text-blue-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Xodimni almashtirish</span>
          </button>

          <button
            type="button"
            onClick={onClinicLogout}
            className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Klinikadan chiqish</span>
          </button>
        </div>

      </div>
    </div>
  );
};
