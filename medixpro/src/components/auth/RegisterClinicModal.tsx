import React, { useState } from 'react';
import { X, Building2, ShieldCheck, Phone, Mail, MapPin, Stethoscope, KeyRound, UserCheck } from 'lucide-react';
import { ClinicProfile } from '../../types';

interface RegisterClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (
    profile: Omit<ClinicProfile, 'id' | 'createdAt'>,
    adminUser: { fullName: string; username: string; password?: string; phone: string; email: string }
  ) => void;
}

export const RegisterClinicModal: React.FC<RegisterClinicModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [clinicLogin, setClinicLogin] = useState('');
  const [clinicPassword, setClinicPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [inn, setInn] = useState('');
  const [city, setCity] = useState('Toshkent');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [workingHours, setWorkingHours] = useState('08:00 - 20:00 (Har kuni)');
  const [currency, setCurrency] = useState<'UZS' | 'USD'>('UZS');

  // Admin user details
  const [adminFullName, setAdminFullName] = useState('');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('123');
  const [adminPhone, setAdminPhone] = useState('+998 ');
  const [adminEmail, setAdminEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !adminFullName.trim() || !adminUsername.trim()) {
      alert('Iltimos, klinika nomi va administrator ma\'lumotlarini to\'ldiring.');
      return;
    }

    const effectiveClinicLogin = clinicLogin.trim() || shortName.trim().toLowerCase().replace(/\s+/g, '_') || name.trim().slice(0, 10).toLowerCase().replace(/\s+/g, '_');
    const effectiveClinicPassword = clinicPassword.trim() || adminPassword.trim() || '123';

    onRegister(
      {
        name: name.trim(),
        shortName: shortName.trim() || name.trim().slice(0, 15),
        loginUsername: effectiveClinicLogin,
        password: effectiveClinicPassword,
        licenseNumber: licenseNumber.trim(),
        inn: inn.trim(),
        address: address.trim(),
        city: city.trim(),
        phone: phone.trim(),
        email: email.trim(),
        telegram: telegram.trim(),
        directorName: adminFullName.trim(),
        currency,
        currencySymbol: currency === 'UZS' ? 'so\'m' : '$',
        workingHours,
      },
      {
        fullName: adminFullName.trim(),
        username: adminUsername.trim(),
        password: adminPassword.trim(),
        phone: adminPhone.trim(),
        email: adminEmail.trim(),
      }
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Yangi Klinika Ro'yxatdan O'tkazish (SaaS)</h2>
              <p className="text-xs text-blue-100">Klinika uchun alohida xavfsiz baza va Bosh Administrator yaratish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Clinic Details Section */}
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-3 pb-1 border-b border-slate-200">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>1. Klinika Ma'lumotlari</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Klinika to'liq nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 'E-Shifo Medical Plus MCHJ'"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Qisqa nomi / Brend
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 'E-Shifo'"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Klinika Kirish Logini (Tizim ID) *
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 'eshifo_med'"
                  value={clinicLogin}
                  onChange={(e) => setClinicLogin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Klinika Kirish Paroli *
                </label>
                <input
                  type="password"
                  placeholder="Parolni kiriting..."
                  value={clinicPassword}
                  onChange={(e) => setClinicPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tibbiy Litsenziya raqami
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 'LIT-2025/1102'"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  STIR / INN raqami
                </label>
                <input
                  type="text"
                  placeholder="Masalan: '308912445'"
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shahar / Viloyat
                </label>
                <input
                  type="text"
                  placeholder="Toshkent sh."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
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
                  placeholder="+998 71 200-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  To'liq Manzil
                </label>
                <input
                  type="text"
                  placeholder="Ko'cha, bino raqami, mo'ljal..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ish vaqti rejimi
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Asosiy Valyuta
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'UZS' | 'USD')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="UZS">UZS (O'zbek so'mi)</option>
                  <option value="USD">USD (AQSH dollari)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Admin User Section */}
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-3 pb-1 border-b border-slate-200">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Bosh Administrator / Bosh Shifokor Kabineti</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bosh Shifokor / Rahbar F.I.SH *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Abdullayev Jasur"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Admin Telefon raqami
                </label>
                <input
                  type="text"
                  placeholder="+998 90 123-45-67"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kirish Logini (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kirish Paroli *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Parolni kiriting..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Klinikani Ro'yxatdan O'tkazish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
