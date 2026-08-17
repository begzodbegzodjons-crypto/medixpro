import React, { useState } from 'react';
import { X, Printer, Wifi, Usb, Globe, Play, CheckCircle, AlertCircle, Sliders, Scissors, BellRing, Sparkles } from 'lucide-react';
import { PrinterConfig, ClinicProfile } from '../../types';
import { PrinterService } from '../../services/printerService';

interface PrinterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PrinterConfig;
  clinic: ClinicProfile;
  onSaveConfig: (newConfig: PrinterConfig) => void;
}

export const PrinterSettingsModal: React.FC<PrinterSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  clinic,
  onSaveConfig,
}) => {
  const [form, setForm] = useState<PrinterConfig>({ ...config });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestPrint = () => {
    const res = PrinterService.testPrinter(form, clinic);
    setTestResult(res);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">Xprinter & Termal Chek Chop Etish Sozlamalari</h2>
              <p className="text-xs text-emerald-100">ESC/POS USB, LAN (IP/Port) va Brauzer orqali to'g'ridan-to'g'ri chop etish</p>
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
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {testResult && (
            <div className={`p-3 rounded-lg border flex items-center gap-2 ${
              testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {testResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span className="font-semibold">{testResult.message}</span>
            </div>
          )}

          {/* Connection Type Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              Printerni Ulanish Turi (Interface):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, connectionType: 'browser' })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  form.connectionType === 'browser'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Globe className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <div className="text-xs">Brauzer Print</div>
                <div className="text-[10px] text-slate-500 font-normal">Standart dialog</div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, connectionType: 'usb_hid' })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  form.connectionType === 'usb_hid'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Usb className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <div className="text-xs">USB Xprinter</div>
                <div className="text-[10px] text-slate-500 font-normal">WebUSB / HID</div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, connectionType: 'lan_ip' })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  form.connectionType === 'lan_ip'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Wifi className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                <div className="text-xs">LAN / Wi-Fi IP</div>
                <div className="text-[10px] text-slate-500 font-normal">Tarmoq printeri</div>
              </button>
            </div>
          </div>

          {/* Paper Width */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lenta Kengligi (Paper Width):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paperWidth: '80mm' })}
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    form.paperWidth === '80mm'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  80 mm (Katta)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paperWidth: '58mm' })}
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    form.paperWidth === '58mm'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  58 mm (Kichik)
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Printer Modeli / Nomi:
              </label>
              <input
                type="text"
                value={form.printerName}
                onChange={(e) => setForm({ ...form, printerName: e.target.value })}
                placeholder="Xprinter XP-Q800 / XP-58IIH..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* LAN IP Config if LAN selected */}
          {form.connectionType === 'lan_ip' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 animate-in fade-in duration-100">
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Printer Tarmoq IP Manzili:
                </label>
                <input
                  type="text"
                  value={form.ipAddress || ''}
                  onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                  placeholder="192.168.1.200"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Port:
                </label>
                <input
                  type="number"
                  value={form.port || 9100}
                  onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 9100 })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-hidden"
                />
              </div>
              <div className="col-span-3 text-[10px] text-slate-500">
                💡 Maslahat: Xprinter Ethernet orqali 9100-portda RAW ESC/POS signallarini qabul qiladi.
              </div>
            </div>
          )}

          {/* Header & Footer text for tickets */}
          <div className="space-y-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Talon va Chek Sarlavhasi (Header Text):
              </label>
              <input
                type="text"
                value={form.customHeader}
                onChange={(e) => setForm({ ...form, customHeader: e.target.value })}
                placeholder="Xush kelibsiz!..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Talon va Chek Ostki Matni (Footer Text):
              </label>
              <input
                type="text"
                value={form.customFooter}
                onChange={(e) => setForm({ ...form, customFooter: e.target.value })}
                placeholder="Salomatligingiz — bizning oliy maqsadimiz!..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Toggles: Auto Cut, Beep, QR Code */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoCut}
                onChange={(e) => setForm({ ...form, autoCut: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <Scissors className="w-3.5 h-3.5 text-slate-500" />
                Avtomatik Qog'oz Qirqish (Auto Cut)
              </span>
            </label>

            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.beepOnPrint}
                onChange={(e) => setForm({ ...form, beepOnPrint: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <BellRing className="w-3.5 h-3.5 text-slate-500" />
                Chop etganda Ovoz Berish (Buzzer)
              </span>
            </label>
          </div>

          {/* Test and Save Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestPrint}
              className="px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-emerald-800 hover:border-emerald-300 border border-slate-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sinov Cheki Chop Etish (Test Print)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Yopish
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md transition-all cursor-pointer"
              >
                Saqlash
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
