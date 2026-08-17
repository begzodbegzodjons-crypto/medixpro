import React from 'react';
import { 
  Plus, 
  ArrowRight, 
} from 'lucide-react';
import { 
  ClinicProfile, 
  Patient, 
  QueueTicket, 
  WardRoom, 
  PaymentTransaction, 
  StaffMember, 
  LabTestOrder 
} from '../../types';
import { PrinterService } from '../../services/printerService';

interface DashboardOverviewProps {
  clinic: ClinicProfile;
  patients: Patient[];
  queue: QueueTicket[];
  wards: WardRoom[];
  transactions: PaymentTransaction[];
  staffList: StaffMember[];
  labOrders: LabTestOrder[];
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  clinic,
  queue,
  wards,
  transactions,
  staffList,
  onNavigate,
}) => {
  // Statistics
  const todayRevenue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const activeQueue = queue.filter(q => q.status === 'waiting' || q.status === 'in_consultation');

  let totalBeds = 0;
  let occupiedBeds = 0;
  wards.forEach(w => {
    w.beds.forEach(b => {
      totalBeds++;
      if (b.status === 'occupied') occupiedBeds++;
    });
  });
  const freeBeds = totalBeds - occupiedBeds;

  const currentAdmin = staffList.find(s => s.role === 'admin') || staffList[0];

  const handleTestPrint = () => {
    PrinterService.testPrinter({
      printerName: 'Xprinter XP-58',
      connectionType: 'browser',
      paperWidth: '80mm',
      autoCut: true,
      beepOnPrint: true,
      customHeader: clinic.name,
      customFooter: 'Salomatligingiz — bizning oliy maqsadimiz!',
      copiesCount: 1,
      printLogo: true,
      printQrCode: true,
    }, clinic);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* High Density Main Grid (4 cols left, 8 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Card 1: Navbat Faoliyati */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-800 text-sm">Navbat Faoliyati</h2>
              <button 
                onClick={() => onNavigate('reception')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
              >
                Yangi Navbat +
              </button>
            </div>

            <div className="space-y-2">
              {activeQueue.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Hozirda faol navbatlar yo'q
                </div>
              ) : (
                activeQueue.slice(0, 5).map((item, idx) => {
                  const isFirst = idx === 0 || item.status === 'in_consultation';
                  return (
                    <div 
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isFirst 
                          ? 'bg-blue-50/60 border-blue-200' 
                          : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-bold font-mono ${isFirst ? 'text-blue-600' : 'text-slate-500'}`}>
                          {item.ticketNumber}
                        </div>
                        <div className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">
                          {item.patientName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.doctorName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.status === 'in_consultation' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status === 'in_consultation' ? 'Qabulda' : 'Kutmoqda'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex justify-center">
              <button 
                onClick={() => onNavigate('reception')}
                className="text-xs font-bold text-slate-500 hover:text-blue-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <span>Barcha Navbatlar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2: Moliyaviy Hisobot (Dark Accent Card from theme) */}
          <div className="bg-[#1e293b] p-4 sm:p-5 rounded-xl text-white shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Moliyaviy Hisobot (Bugun)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {(todayRevenue / 1000000).toFixed(1)}M
                </div>
                <div className="text-[10px] text-slate-400 font-medium">KIRIM ({clinic.currencySymbol})</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 tracking-tight">
                  100%
                </div>
                <div className="text-[10px] text-slate-400 font-medium">REJA IJROSI</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/60 text-[11px] text-slate-300 flex justify-between items-center">
              <span>Jami: {(todayRevenue ?? 0).toLocaleString()} {clinic.currencySymbol}</span>
              <button 
                onClick={() => onNavigate('cashier')}
                className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                Kassaga o'tish →
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Card: Palatalar Sxemasi va Holati */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <h2 className="font-bold text-slate-800 text-sm sm:text-base">
                Palatalar Sxemasi va Holati
              </h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  <span>Bo'sh ({freeBeds})</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  <span>Band ({occupiedBeds})</span>
                </div>
              </div>
            </div>

            {/* High Density Ward Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {wards.map((ward) => {
                const isOccupied = ward.beds.some(b => b.status === 'occupied');
                const occupiedBed = ward.beds.find(b => b.status === 'occupied');
                
                if (isOccupied && occupiedBed?.currentPatient) {
                  return (
                    <div 
                      key={ward.id}
                      onClick={() => onNavigate('wards')}
                      className="p-3.5 border-2 border-red-100 bg-red-50/70 rounded-xl relative overflow-hidden cursor-pointer hover:border-red-300 transition-all"
                    >
                      <div className="text-xs font-bold text-red-600 mb-1 uppercase tracking-tight">
                        {ward.roomNumber} - {ward.type.toUpperCase()}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 mb-3 truncate">
                        {occupiedBed.currentPatient.patientName}
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-[10px] text-slate-400 font-mono">
                          {occupiedBed.currentPatient.diagnosis.slice(0, 15)}...
                        </div>
                        <div className="w-5 h-5 bg-red-200 rounded flex items-center justify-center text-red-700 text-[10px] font-bold">
                          B
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={ward.id}
                    onClick={() => onNavigate('wards')}
                    className="p-3.5 border-2 border-green-100 bg-green-50/30 rounded-xl hover:border-green-400 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-green-600 mb-1 uppercase tracking-tight">
                        {ward.roomNumber} - {ward.type.toUpperCase()}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-400 mb-3">
                        BO'SH
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-[10px] text-slate-400 font-mono uppercase">
                        {ward.department}
                      </div>
                      <div className="w-5 h-5 border border-green-300 rounded flex items-center justify-center text-green-600 text-[11px] font-bold">
                        +
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom High Density 3-Column Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Box 1: Device status */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Qurilma Sozlamalari
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Xprinter-58 USB</span>
                  <span className="text-green-600 font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">LAN Printer (IP)</span>
                  <span className="text-blue-600 font-bold">ONLINE</span>
                </div>
              </div>
            </div>

            {/* Box 2: Print test button */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Navbat Chop Etish
              </h4>
              <button 
                onClick={handleTestPrint}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-xs sm:text-sm font-bold active:scale-98 transition-all cursor-pointer"
              >
                XPRINTER TEST
              </button>
            </div>

            {/* Box 3: Staff Status */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Xodim Statusi
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  {currentAdmin?.fullName.slice(0, 2).toUpperCase() || 'AD'}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800">
                    {currentAdmin?.fullName || 'Bosh Shifokor'}
                  </div>
                  <div className="text-[9px] text-green-600 font-bold uppercase tracking-wider">
                    {currentAdmin?.role || 'ADMINISTRATOR'}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
