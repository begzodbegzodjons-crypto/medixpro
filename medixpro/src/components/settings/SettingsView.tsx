import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  Printer, 
  ListPlus, 
  Download, 
  Upload, 
  Save, 
  Trash2, 
  Plus, 
  Network, 
  Usb, 
  Globe
} from 'lucide-react';
import { ClinicProfile, PrinterConfig, MedicalService } from '../../types';
import { PrinterService } from '../../services/printerService';

interface SettingsViewProps {
  clinic: ClinicProfile;
  printerConfig: PrinterConfig;
  services: MedicalService[];
  onUpdateClinic: (profile: ClinicProfile) => void;
  onUpdatePrinterConfig: (config: PrinterConfig) => void;
  onAddService: (service: Omit<MedicalService, 'id'>) => void;
  onDeleteService: (serviceId: string) => void;
  onExportAllData: () => void;
  onImportAllData: (jsonData: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  clinic,
  printerConfig,
  services,
  onUpdateClinic,
  onUpdatePrinterConfig,
  onAddService,
  onDeleteService,
  onExportAllData,
  onImportAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'clinic' | 'printer' | 'services' | 'backup'>('clinic');

  // Clinic form
  const [name, setName] = useState(clinic.name);
  const [address, setAddress] = useState(clinic.address);
  const [phone, setPhone] = useState(clinic.phone);
  const [email, setEmail] = useState(clinic.email || '');
  const [licenseNumber, setLicenseNumber] = useState(clinic.licenseNumber || '');
  const [currencySymbol, setCurrencySymbol] = useState(clinic.currencySymbol);

  // Printer form
  const [printerName, setPrinterName] = useState(printerConfig.printerName || 'Xprinter XP-Q800');
  const [connectionType, setConnectionType] = useState<PrinterConfig['connectionType']>(printerConfig.connectionType || 'browser');
  const [printerIp, setPrinterIp] = useState(printerConfig.ipAddress || '192.168.1.200');
  const [printerPort, setPrinterPort] = useState(printerConfig.port || 9100);
  const [paperWidth, setPaperWidth] = useState<PrinterConfig['paperWidth']>(printerConfig.paperWidth || '80mm');
  const [autoCut, setAutoCut] = useState(printerConfig.autoCut);
  const [beepOnPrint, setBeepOnPrint] = useState(printerConfig.beepOnPrint);
  const [customHeader, setCustomHeader] = useState(printerConfig.customHeader || '');
  const [customFooter, setCustomFooter] = useState(printerConfig.customFooter || '');

  // New service form
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState<MedicalService['category']>('consultation');
  const [newServicePrice, setNewServicePrice] = useState(100000);
  const [newServiceDuration, setNewServiceDuration] = useState(20);

  // Import JSON input
  const [importJsonString, setImportJsonString] = useState('');

  const handleSaveClinic = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClinic({
      ...clinic,
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      licenseNumber: licenseNumber.trim(),
      currencySymbol,
    });
    alert('Klinika ma\'lumotlari muvaffaqiyatli yangilandi!');
  };

  const handleSavePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePrinterConfig({
      ...printerConfig,
      printerName,
      connectionType,
      ipAddress: printerIp.trim(),
      port: Number(printerPort) || 9100,
      paperWidth,
      autoCut,
      beepOnPrint,
      customHeader,
      customFooter,
    });
    alert('Printer sozlamalari saqlandi!');
  };

  const handleTestPrint = () => {
    const res = PrinterService.testPrinter({
      ...printerConfig,
      printerName,
      connectionType,
      ipAddress: printerIp,
      port: printerPort,
      paperWidth,
      autoCut,
      beepOnPrint,
      customHeader,
      customFooter,
    }, clinic);
    alert(res.message);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    onAddService({
      clinicId: clinic.id,
      name: newServiceName.trim(),
      category: newServiceCategory,
      price: newServicePrice,
      doctorSharePercent: 30,
      durationMinutes: newServiceDuration,
      isActive: true,
    });

    setNewServiceName('');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonString.trim()) {
      alert('Iltimos, JSON fayl matnini kiriting.');
      return;
    }
    try {
      onImportAllData(importJsonString);
      alert('Barcha ma\'lumotlar muvaffaqiyatli tiklandi!');
      setImportJsonString('');
    } catch (err: any) {
      alert('JSON formatida xatolik: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-slate-700" />
            <span>Tizim va Uskunalar Sozlamalari</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Klinika ma'lumotlari, Xprinter (USB/LAN), Narxlar preyskuranti va Zaxira nusxa (Backup)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('clinic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'clinic'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4 text-blue-400" />
          <span>Klinika Ma'lumotlari</span>
        </button>

        <button
          onClick={() => setActiveTab('printer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'printer'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Xprinter USB & LAN Sozlash</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'services'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ListPlus className="w-4 h-4 text-emerald-400" />
          <span>Xizmatlar Preyskuranti ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'backup'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Download className="w-4 h-4 text-purple-400" />
          <span>Zaxira Nusxa & Import / Export</span>
        </button>
      </div>

      {/* Tab: Clinic Details */}
      {activeTab === 'clinic' && (
        <form onSubmit={handleSaveClinic} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Klinika Asosiy Rekvizitlari
          </h2>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Klinika Nomi *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Aloqa Telefoni</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">To'liq Manzil</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tibbiy Litsenziya Raqami</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="LIT-2025/4891"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pul Birligi (Valyuta)</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Ma'lumotlarni Saqlash</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Printer Hardware Config */}
      {activeTab === 'printer' && (
        <form onSubmit={handleSavePrinter} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <span>Xprinter Termal Chek & Talon Printeri</span>
              </h2>
              <p className="text-slate-500 text-[11px] mt-0.5">
                USB va LAN (Ethernet/Wi-Fi) printerlarini to'liq sozlash va test qilish
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestPrint}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Test Talon Chop Etish</span>
            </button>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Printer Modeli / Nomi</label>
            <input
              type="text"
              value={printerName}
              onChange={(e) => setPrinterName(e.target.value)}
              placeholder="Xprinter XP-Q800 / XP-58"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Ulanish Turi (Protokol):</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setConnectionType('browser')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  connectionType === 'browser' ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Brauzer Print</span>
                </div>
                <div className="text-[10px] text-slate-500">Standart Web Print</div>
              </button>

              <button
                type="button"
                onClick={() => setConnectionType('usb_hid')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  connectionType === 'usb_hid' ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Usb className="w-3.5 h-3.5 text-amber-600" />
                  <span>USB Xprinter</span>
                </div>
                <div className="text-[10px] text-slate-500">USB Direct Port</div>
              </button>

              <button
                type="button"
                onClick={() => setConnectionType('lan_ip')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  connectionType === 'lan_ip' ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Network className="w-3.5 h-3.5 text-emerald-600" />
                  <span>LAN / Ethernet</span>
                </div>
                <div className="text-[10px] text-slate-500">IP Tarmoq printeri</div>
              </button>
            </div>
          </div>

          {connectionType === 'lan_ip' && (
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-150">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Printer IP Manzili</label>
                <input
                  type="text"
                  value={printerIp}
                  onChange={(e) => setPrinterIp(e.target.value)}
                  placeholder="192.168.1.200"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Port</label>
                <input
                  type="number"
                  value={printerPort}
                  onChange={(e) => setPrinterPort(parseInt(e.target.value) || 9100)}
                  placeholder="9100"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Qog'oz Kengligi</label>
              <select
                value={paperWidth}
                onChange={(e) => setPaperWidth(e.target.value as PrinterConfig['paperWidth'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold focus:bg-white focus:outline-hidden"
              >
                <option value="80mm">80 mm (Standart Xprinter)</option>
                <option value="58mm">58 mm (Ixcham chek printer)</option>
              </select>
            </div>

            <div className="space-y-1 mt-1">
              <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCut}
                  onChange={(e) => setAutoCut(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span>Avtomatik qog'oz kesish (Auto-cut)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={beepOnPrint}
                  onChange={(e) => setBeepOnPrint(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span>Chop etilganda ovozli signal (Beep)</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Printer Sozlamalarini Saqlash</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Services & Price List */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Add new service */}
          <form onSubmit={handleCreateService} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-end gap-3 text-xs">
            <div className="flex-1 min-w-[200px]">
              <label className="block font-semibold text-slate-700 mb-1">Xizmat / Tahlil Nomi *</label>
              <input
                type="text"
                required
                placeholder="Kardiolog ko'rigi, UZI, Qon tahlili..."
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-semibold"
              />
            </div>

            <div className="w-40">
              <label className="block font-semibold text-slate-700 mb-1">Kategoriya</label>
              <select
                value={newServiceCategory}
                onChange={(e) => setNewServiceCategory(e.target.value as MedicalService['category'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
              >
                <option value="consultation">Ko'rik</option>
                <option value="diagnostics">Diagnostika / UZI</option>
                <option value="lab">Laboratoriya</option>
                <option value="procedure">Muolaja</option>
                <option value="surgery">Jarrohlik</option>
              </select>
            </div>

            <div className="w-36">
              <label className="block font-semibold text-slate-700 mb-1">Narxi ({clinic.currencySymbol})</label>
              <input
                type="number"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-mono font-bold"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Qo'shish</span>
            </button>
          </form>

          {/* Services list table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Xizmat Nomi</th>
                  <th className="py-3 px-4">Kategoriya</th>
                  <th className="py-3 px-4">Narxi</th>
                  <th className="py-3 px-4 text-right">O'chirish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {(s.price ?? 0).toLocaleString()} {clinic.currencySymbol}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteService(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Export card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Download className="w-5 h-5 text-purple-600" />
              <span>To'liq Bazani Eksport Qilish (JSON Backup)</span>
            </div>
            <p className="text-slate-500">
              Klinikaning barcha bemorlari, shifokorlar, qabulxona navbatlari, palatalar, tahlillar va kassa cheklarini bitta fayl sifatida xavfsiz yuklab oling.
            </p>
            <button
              onClick={onExportAllData}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Zaxira Nusxani Yuklab Olish (.json)</span>
            </button>
          </div>

          {/* Import card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Bazani Tiklash (Import)</span>
            </div>
            <p className="text-slate-500">
              Ilgari yuklab olingan zaxira fayl matnini bu yerga joylashtirib bazani tiklashingiz mumkin.
            </p>
            <form onSubmit={handleImportSubmit} className="space-y-3">
              <textarea
                rows={3}
                placeholder='JSON formatidagi bazani bu yerga joylashtiring...'
                value={importJsonString}
                onChange={(e) => setImportJsonString(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px] focus:bg-white focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Bazani Tiklash</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
