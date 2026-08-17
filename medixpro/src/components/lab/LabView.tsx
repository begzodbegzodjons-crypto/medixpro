import React, { useState } from 'react';
import { 
  FlaskConical, 
  Search, 
  Plus, 
  CheckCircle, 
  Printer, 
  FileText, 
  Clock, 
  AlertCircle,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { LabTestOrder, LabParameterResult, Patient, StaffMember, ClinicProfile, PrinterConfig } from '../../types';

interface LabViewProps {
  labOrders: LabTestOrder[];
  patients: Patient[];
  staffList: StaffMember[];
  clinic: ClinicProfile;
  printerConfig: PrinterConfig;
  onUpdateLabOrder: (order: LabTestOrder) => void;
  onAddLabOrder: (order: Omit<LabTestOrder, 'id' | 'orderNumber' | 'createdAt'>) => void;
}

export const LabView: React.FC<LabViewProps> = ({
  labOrders,
  patients,
  staffList,
  clinic,
  onUpdateLabOrder,
  onAddLabOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeOrderForResults, setActiveOrderForResults] = useState<LabTestOrder | null>(null);

  // New Lab Order Modal
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderPatientId, setNewOrderPatientId] = useState('');
  const [newOrderDoctorId, setNewOrderDoctorId] = useState('');
  const [newOrderTestType, setNewOrderTestType] = useState('Umumiy qon tahlili');

  // Result entry form parameters
  const [parameters, setParameters] = useState<LabParameterResult[]>([]);
  const [conclusion, setConclusion] = useState('');

  // Open Results entry modal
  const handleOpenResults = (order: LabTestOrder) => {
    setActiveOrderForResults(order);
    setConclusion(order.conclusion || '');

    if (order.parameters && order.parameters.length > 0) {
      setParameters([...order.parameters]);
    } else {
      // Default parameters based on test type
      if (order.testType.includes('qon')) {
        setParameters([
          { name: 'Gemoglobin (Hb)', value: '142', unit: 'g/l', normalRange: '130 - 160' },
          { name: 'Eritrotsitlar (RBC)', value: '4.5', unit: 'x10¹²/l', normalRange: '4.0 - 5.0' },
          { name: 'Leykotsitlar (WBC)', value: '6.8', unit: 'x10⁹/l', normalRange: '4.0 - 9.0' },
          { name: 'Trombotsitlar (PLT)', value: '250', unit: 'x10⁹/l', normalRange: '180 - 320' },
          { name: 'SOE (Eritrotsitlar cho\'kish tezligi)', value: '8', unit: 'mm/soat', normalRange: '2 - 15' },
          { name: 'Glyukoza (qand miqdori)', value: '5.2', unit: 'mmol/l', normalRange: '3.3 - 5.5' },
        ]);
      } else if (order.testType.includes('Biokimyo')) {
        setParameters([
          { name: 'ALT (Alaninaminotransferaza)', value: '28', unit: 'U/l', normalRange: '< 41' },
          { name: 'AST (Aspartataminotransferaza)', value: '24', unit: 'U/l', normalRange: '< 38' },
          { name: 'Umumiy Bilirubin', value: '14.5', unit: 'mkmol/l', normalRange: '8.5 - 20.5' },
          { name: 'Kreatinin', value: '78', unit: 'mkmol/l', normalRange: '62 - 106' },
          { name: 'Mochevina (Urea)', value: '4.8', unit: 'mmol/l', normalRange: '2.5 - 8.3' },
        ]);
      } else {
        setParameters([
          { name: 'Asosiy Ko\'rsatkich', value: 'Normada', unit: '-', normalRange: 'Norma' },
          { name: 'Kuzatuv parametri', value: 'O\'zgarishsiz', unit: '-', normalRange: 'Norma' },
        ]);
      }
    }
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderForResults) return;

    onUpdateLabOrder({
      ...activeOrderForResults,
      parameters,
      conclusion,
      status: 'ready',
      completedAt: new Date().toISOString(),
    });

    setActiveOrderForResults(null);
  };

  // Print Official Laboratory Report
  const handlePrintLabReport = (order: LabTestOrder) => {
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) return;

    const paramsRows = order.parameters.map((p, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <td style="padding: 8px 10px;">${idx + 1}. <b>${p.name}</b></td>
        <td style="padding: 8px 10px; font-weight: bold; color: ${p.isAbnormal ? '#dc2626' : '#0f172a'};">${p.value}</td>
        <td style="padding: 8px 10px; color: #64748b;">${p.unit}</td>
        <td style="padding: 8px 10px; color: #334155;">${p.normalRange}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laboratoriya Tahlil Natijasi - ${order.orderNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 30px; color: #0f172a; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
          .clinic-name { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #1e3a8a; }
          .clinic-sub { font-size: 11px; color: #475569; }
          .title { text-align: center; font-size: 18px; font-weight: 800; margin: 20px 0; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; font-size: 13px; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .conclusion-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; font-size: 13px; margin-bottom: 30px; }
          .footer { display: flex; justify-content: space-between; font-size: 12px; margin-top: 50px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="clinic-name">${clinic.name}</div>
            <div class="clinic-sub">${clinic.address} • Tel: ${clinic.phone}</div>
            <div class="clinic-sub">Litsenziya: ${clinic.licenseNumber || 'LIT-2025/4891'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 14px;">TAHLIL BLANKASI</div>
            <div style="font-family: monospace; font-size: 13px; color: #2563eb;">№ ${order.orderNumber}</div>
            <div style="font-size: 11px; color: #64748b;">Sana: ${new Date(order.createdAt).toLocaleDateString('uz-UZ')}</div>
          </div>
        </div>

        <div class="title">${order.testType}</div>

        <div class="info-grid">
          <div>Bemor: <b>${order.patientName}</b></div>
          <div>Buyurtmachi shifokor: <b>${order.doctorName}</b></div>
          <div>Tahlil o'tkazilgan sana: <b>${order.completedAt ? new Date(order.completedAt).toLocaleString('uz-UZ') : new Date().toLocaleString('uz-UZ')}</b></div>
          <div>Laboratoriya bo'limi: <b>Klinik-Biokimyo</b></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Ko'rsatkich nomi</th>
              <th>Natija</th>
              <th>Birlik</th>
              <th>Me'yor (Norma)</th>
            </tr>
          </thead>
          <tbody>
            ${paramsRows || '<tr><td colspan="4" style="text-align:center; padding: 20px;">Natijalar kiritilmagan</td></tr>'}
          </tbody>
        </table>

        ${order.conclusion ? `
          <div class="conclusion-box">
            <div style="font-weight: bold; color: #1e3a8a; margin-bottom: 4px;">Klinik Xulosa / Sharh:</div>
            <div>${order.conclusion}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>Laborant-mutaxassis: _____________________</div>
          <div style="text-align: center;">
            <div style="width: 80px; height: 80px; border: 2px dashed #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748b; margin: 0 auto;">
              KLINIKA MUHRI
            </div>
          </div>
          <div>Bosh shifokor imzosi: _____________________</div>
        </div>

        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === newOrderPatientId);
    if (!patient) {
      alert('Iltimos, bemorni tanlang.');
      return;
    }

    const doc = staffList.find(s => s.id === newOrderDoctorId) || staffList[0];

    onAddLabOrder({
      clinicId: clinic.id,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doc.id,
      doctorName: doc.fullName,
      testType: newOrderTestType,
      parameters: [],
      status: 'ordered',
      price: 55000,
      paymentStatus: 'paid',
    });

    setShowNewOrderModal(false);
  };

  const filteredOrders = labOrders.filter(o => {
    if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.patientName.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.testType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-purple-600" />
            <span>Laboratoriya va Diagnostika Moduli (LIS)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Klinik tahlillar, norma ko'rsatkichlari, rasmiy tahlil blankalarini chop etish
          </p>
        </div>

        <button
          onClick={() => setShowNewOrderModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yangi Tahlil Buyurtmasi</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              selectedStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Barchasi ({labOrders.length})
          </button>
          <button
            onClick={() => setSelectedStatus('ordered')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              selectedStatus === 'ordered' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kutilmoqda ({labOrders.filter(l => l.status === 'ordered').length})
          </button>
          <button
            onClick={() => setSelectedStatus('ready')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              selectedStatus === 'ready' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tayyor Natijalar ({labOrders.filter(l => l.status === 'ready').length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tahlil yoki bemor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-64 focus:outline-hidden focus:bg-white"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Buyurtma №</th>
                <th className="py-3 px-4">Bemor F.I.SH</th>
                <th className="py-3 px-4">Tahlil Turi</th>
                <th className="py-3 px-4">Buyurtmachi Shifokor</th>
                <th className="py-3 px-4">Holati</th>
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tahlillar topilmadi
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {order.patientName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {order.testType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {order.doctorName}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.status === 'ready' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" /> Tayyor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Kutilmoqda
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status !== 'ready' ? (
                          <button
                            onClick={() => handleOpenResults(order)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Natijalarni Kiritish
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenResults(order)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => handlePrintLabReport(order)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Blankani Chop Etish</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Entry Modal */}
      {activeOrderForResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-purple-700 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  <span>Tahlil Natijalarini Kiritish: {activeOrderForResults.testType}</span>
                </h2>
                <p className="text-xs text-purple-100">Bemor: {activeOrderForResults.patientName} • № {activeOrderForResults.orderNumber}</p>
              </div>
              <button onClick={() => setActiveOrderForResults(null)} className="p-1 text-white/80 hover:text-white rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSaveResults} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-xs mb-1">Ko'rsatkichlar va Qiymatlar:</div>
                {parameters.map((param, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="col-span-4 font-semibold text-slate-800">{param.name}</div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        required
                        value={param.value}
                        onChange={(e) => {
                          const updated = [...parameters];
                          updated[idx].value = e.target.value;
                          setParameters(updated);
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-bold text-center focus:outline-hidden"
                      />
                    </div>
                    <div className="col-span-2 text-slate-500">{param.unit}</div>
                    <div className="col-span-3 text-slate-500 text-[10px]">Norma: {param.normalRange}</div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Laborant Xulosasi / Izoh:</label>
                <textarea
                  rows={2}
                  placeholder="Klinik xulosa..."
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveOrderForResults(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-md transition-colors"
                >
                  Natijalarni Saqlash & Tayyorlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-purple-700 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Yangi Tahlil Buyurtmasi</span>
              </h2>
              <button onClick={() => setShowNewOrderModal(false)} className="p-1 text-white/80 hover:text-white rounded-lg">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bemor *</label>
                <select
                  required
                  value={newOrderPatientId}
                  onChange={(e) => setNewOrderPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                >
                  <option value="">Bemorni tanlang...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tahlil Turi *</label>
                <select
                  value={newOrderTestType}
                  onChange={(e) => setNewOrderTestType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-semibold"
                >
                  <option value="Umumiy qon tahlili">Umumiy qon tahlili (OAK)</option>
                  <option value="Biokimyoviy tahlil">Biokimyoviy tahlil (ALT, AST, Bilirubin)</option>
                  <option value="UZI qorin bo'shlig'i">UZI qorin bo'shlig'i</option>
                  <option value="EKG xulosasi">EKG (Elektrokardiografiya)</option>
                  <option value="Koagulogramma">Koagulogramma (Qon ivishi)</option>
                  <option value="Gormonlar tahlili">Gormonlar (TSH, T3, T4)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyurtmachi Shifokor</label>
                <select
                  value={newOrderDoctorId}
                  onChange={(e) => setNewOrderDoctorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                >
                  <option value="">Shifokorni tanlang...</option>
                  {staffList.filter(s => s.role === 'doctor' || s.role === 'admin').map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-md transition-colors"
                >
                  Buyurtmani Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
