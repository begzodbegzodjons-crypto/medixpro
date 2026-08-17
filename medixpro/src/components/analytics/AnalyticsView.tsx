import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  Layers,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { PaymentTransaction, Patient, ConsultationRecord, StaffMember, ClinicProfile } from '../../types';

interface AnalyticsViewProps {
  transactions: PaymentTransaction[];
  patients: Patient[];
  consultations: ConsultationRecord[];
  staffList: StaffMember[];
  clinic: ClinicProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  patients,
  consultations,
  staffList,
  clinic,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Summary Metrics
  const totalRevenue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalPatientsCount = patients.length;
  const totalConsultations = consultations.length;
  const avgCheck = transactions.length > 0 ? Math.round(totalRevenue / transactions.length) : 0;

  // Chart Data: Revenue Trend (Last 7 Days)
  const revenueChartData = [
    { day: 'Dush', tushum: totalRevenue * 0.12, bemorlar: 24 },
    { day: 'Sesh', tushum: totalRevenue * 0.15, bemorlar: 28 },
    { day: 'Chor', tushum: totalRevenue * 0.18, bemorlar: 35 },
    { day: 'Pay', tushum: totalRevenue * 0.14, bemorlar: 26 },
    { day: 'Jum', tushum: totalRevenue * 0.22, bemorlar: 42 },
    { day: 'Shan', tushum: totalRevenue * 0.16, bemorlar: 31 },
    { day: 'Yak', tushum: totalRevenue * 0.03, bemorlar: 8 },
  ];

  // Payment methods breakdown
  const cashSum = transactions.filter(t => t.paymentMethod === 'cash').reduce((acc, t) => acc + t.totalAmount, 0) || 1;
  const cardSum = transactions.filter(t => t.paymentMethod === 'card').reduce((acc, t) => acc + t.totalAmount, 0) || 1;
  const onlineSum = transactions.filter(t => t.paymentMethod === 'payme_click').reduce((acc, t) => acc + t.totalAmount, 0) || 1;

  const paymentPieData = [
    { name: 'Naqd Pul', value: cashSum, color: '#10b981' },
    { name: 'Uzcard/Humo', value: cardSum, color: '#3b82f6' },
    { name: 'Click/Payme', value: onlineSum, color: '#8b5cf6' },
  ];

  // Doctor Performance
  const doctorStats = staffList
    .filter(s => s.role === 'doctor')
    .map(doc => {
      const docConsultations = consultations.filter(c => c.doctorId === doc.id).length;
      const generatedIncome = docConsultations * (doc.consultationFee || 100000);
      const kpiEarned = Math.round(generatedIncome * ((doc.commissionRate || 30) / 100));

      return {
        id: doc.id,
        name: doc.fullName,
        specialty: doc.specialty,
        patientsServed: docConsultations,
        generatedIncome,
        kpiEarned,
      };
    });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Chek_Raqam', 'Bemor', 'Summa', 'Toluv_Turi', 'Sana'];
    const rows = transactions.map(t => [
      t.receiptNumber,
      `"${t.patientName}"`,
      t.totalAmount,
      t.paymentMethod,
      new Date(t.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `klinika_moliya_hisoboti_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Klinika Moliyaviy va Boshqaruv Analitikasi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kassaviy tushumlar dinamikasi, shifokorlar KPI hisobi va rasmiy eksport
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excel / CSV Yuklab Olish</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Jami Daromad</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {(totalRevenue ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">{clinic.currencySymbol}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase">O'rtacha Chek</div>
          <div className="text-2xl font-black text-blue-600 mt-0.5">
            {(avgCheck ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">{clinic.currencySymbol}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Bemorlar Bazasi</div>
          <div className="text-2xl font-black text-emerald-600 mt-0.5">{totalPatientsCount} nafar</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700 uppercase">Ko'riklar Soni</div>
          <div className="text-2xl font-black text-purple-600 mt-0.5">{totalConsultations} ta</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue dynamic (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Haftalik Tushumlar Dinamikasi ({clinic.currencySymbol})
            </h2>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.8% o'sish
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString()} ${clinic.currencySymbol}`, 'Tushum']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="tushum" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            To'lov Usullari Taqsimoti
          </h2>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString()} ${clinic.currencySymbol}`, 'Summa']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {paymentPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {(item.value ?? 0).toLocaleString()} {clinic.currencySymbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Performance & KPI Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Shifokorlar Samaradorligi va Oylik KPI Hisoboti
          </h2>
          <span className="text-xs text-slate-500 font-semibold">Avtomatlashtirilgan hisob-kitob</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Shifokor F.I.SH</th>
                <th className="py-3 px-4">Mutaxassislik</th>
                <th className="py-3 px-4 text-center">Qabul Qilingan Bemorlar</th>
                <th className="py-3 px-4">Keltirilgan Daromad</th>
                <th className="py-3 px-4 text-right">Shifokor Ulushi (KPI Oylik)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctorStats.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{doc.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{doc.specialty}</td>
                  <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-800">{doc.patientsServed} nafar</td>
                  <td className="py-3.5 px-4 font-mono text-slate-800">
                    {(doc.generatedIncome ?? 0).toLocaleString()} {clinic.currencySymbol}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-right">
                    {(doc.kpiEarned ?? 0).toLocaleString()} {clinic.currencySymbol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
