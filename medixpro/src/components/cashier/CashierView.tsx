import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Printer, 
  Plus, 
  Trash2, 
  DollarSign, 
  CheckCircle2, 
  Search, 
  Calendar, 
  AlertCircle,
  FileSpreadsheet,
  Wallet,
  Clock,
  UserCheck
} from 'lucide-react';
import { 
  PaymentTransaction, 
  Patient, 
  MedicalService, 
  StaffMember, 
  ClinicProfile, 
  PrinterConfig 
} from '../../types';
import { PrinterService } from '../../services/printerService';

interface CashierViewProps {
  transactions: PaymentTransaction[];
  patients: Patient[];
  services: MedicalService[];
  currentUser: StaffMember | null;
  clinic: ClinicProfile;
  printerConfig: PrinterConfig;
  onAddTransaction: (tx: Omit<PaymentTransaction, 'id' | 'receiptNumber' | 'createdAt'>) => PaymentTransaction;
}

export const CashierView: React.FC<CashierViewProps> = ({
  transactions,
  patients,
  services,
  currentUser,
  clinic,
  printerConfig,
  onAddTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'history' | 'debtors'>('pos');
  const [searchQuery, setSearchQuery] = useState('');

  // POS State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction['paymentMethod']>('cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [cartItems, setCartItems] = useState<{
    title: string;
    type: 'consultation' | 'service' | 'lab' | 'ward' | 'pharmacy';
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[]>([
    { title: 'Birlamchi Shifokor Ko\'rigi', type: 'consultation', quantity: 1, unitPrice: 100000, totalPrice: 100000 },
  ]);

  // Selected Service to add to cart
  const [quickServiceId, setQuickServiceId] = useState('');

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Add Item to POS Cart
  const handleAddServiceToCart = () => {
    const srv = services.find(s => s.id === quickServiceId);
    if (!srv) return;

    setCartItems([
      ...cartItems,
      {
        title: srv.name,
        type: srv.category === 'lab' ? 'lab' : 'service',
        quantity: 1,
        unitPrice: srv.price,
        totalPrice: srv.price,
      },
    ]);
    setQuickServiceId('');
  };

  const handleRemoveCartItem = (idx: number) => {
    setCartItems(cartItems.filter((_, i) => i !== idx));
  };

  const handleUpdateItemQty = (idx: number, qty: number) => {
    const validQty = Math.max(1, qty);
    setCartItems(
      cartItems.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            quantity: validQty,
            totalPrice: validQty * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  // Submit Payment & Print Receipt
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Iltimos, kamida bitta xizmat qo\'shing.');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    const patientName = patient ? patient.fullName : 'Oddiy Mijoz / Mehmon';

    const tx = onAddTransaction({
      clinicId: clinic.id,
      patientId: selectedPatientId || 'pat_guest',
      patientName,
      items: cartItems,
      subtotal,
      discount: discountAmount,
      totalAmount: finalTotal,
      paymentMethod,
      status: 'completed',
      cashierName: currentUser?.fullName || 'Bosh Kassir',
    });

    // Automatically print thermal receipt
    PrinterService.printPaymentReceipt(tx, clinic, printerConfig);

    // Reset POS
    setCartItems([]);
    setSelectedPatientId('');
    setDiscountAmount(0);
  };

  // Filtered Transactions
  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.patientName.toLowerCase().includes(q) ||
      t.receiptNumber.toLowerCase().includes(q) ||
      t.paymentMethod.toLowerCase().includes(q)
    );
  });

  // Calculate daily totals
  const totalRevenue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const cashRevenue = transactions.filter(t => t.paymentMethod === 'cash').reduce((acc, t) => acc + t.totalAmount, 0);
  const cardRevenue = transactions.filter(t => t.paymentMethod === 'card').reduce((acc, t) => acc + t.totalAmount, 0);
  const paymeRevenue = transactions.filter(t => t.paymentMethod === 'payme_click').reduce((acc, t) => acc + t.totalAmount, 0);

  // Daily Z-Report print
  const handlePrintZReport = () => {
    const printWin = window.open('', '_blank', 'width=420,height=700');
    if (!printWin) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Kunlik Z-Hisobot (Kassa)</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: monospace; padding: 10px; width: 80mm; font-size: 12px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 15px;">${clinic.name}</div>
        <div class="center" style="font-size: 10px;">${clinic.address} • Tel: ${clinic.phone}</div>
        <div class="divider"></div>
        <div class="center bold" style="font-size: 14px;">KUNLIK Z-HISOBOT (YOPILISH)</div>
        <div class="row"><span>Sana / Vaqt:</span><span>${new Date().toLocaleString('uz-UZ')}</span></div>
        <div class="row"><span>Mas'ul kassir:</span><span>${currentUser?.fullName || 'Bosh Kassir'}</span></div>
        <div class="row"><span>Jami cheklar soni:</span><span class="bold">${transactions.length} ta</span></div>
        <div class="divider"></div>
        <div class="row"><span>Naqd pul tushumi:</span><span>${(cashRevenue ?? 0).toLocaleString()} ${clinic.currencySymbol}</span></div>
        <div class="row"><span>Uzcard / Humo (Terminal):</span><span>${(cardRevenue ?? 0).toLocaleString()} ${clinic.currencySymbol}</span></div>
        <div class="row"><span>Click / Payme (Online):</span><span>${(paymeRevenue ?? 0).toLocaleString()} ${clinic.currencySymbol}</span></div>
        <div class="divider"></div>
        <div class="row bold" style="font-size: 15px;">
          <span>JAMI SOF TUSHUM:</span>
          <span>${(totalRevenue ?? 0).toLocaleString()} ${clinic.currencySymbol}</span>
        </div>
        <div class="divider"></div>
        <div class="center" style="margin-top: 15px; font-size: 11px;">Kassa smenasi muvaffaqiyatli yopildi.</div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Metrics */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-600" />
            <span>Kassa va Moliya Terminali (POS)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            To'lovlarni qabul qilish, Xprinter cheklarini chop etish, kassa hisobotlari va Z-Otchet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintZReport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Z-Hisobot (Kassani Yopish)</span>
          </button>
        </div>
      </div>

      {/* Revenue Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Bugungi Jami Tushum</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {(totalRevenue ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">{clinic.currencySymbol}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Naqd Pul (Kassa)</div>
          <div className="text-xl font-black text-emerald-600 mt-0.5">
            {(cashRevenue ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">{clinic.currencySymbol}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Karta (Terminal)</div>
          <div className="text-xl font-black text-blue-600 mt-0.5">
            {(cardRevenue ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">{clinic.currencySymbol}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700 uppercase">Click / Payme</div>
          <div className="text-xl font-black text-purple-600 mt-0.5">
            {(paymeRevenue ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">{clinic.currencySymbol}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'pos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4 text-amber-400" />
          <span>Yangi To'lov Qabul Qilish (POS)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-400" />
          <span>To'lovlar Tarixi & Cheklar ({transactions.length})</span>
        </button>
      </div>

      {/* POS Content */}
      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Service picker & items list */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Xizmatlar va Narxlar Tanlash
              </h2>

              {/* Quick service selector */}
              <div className="flex items-center gap-2">
                <select
                  value={quickServiceId}
                  onChange={(e) => setQuickServiceId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden focus:bg-white"
                >
                  <option value="">Ro'yxatdan xizmat yoki tahlilni tanlang...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {(s.price ?? 0).toLocaleString()} {clinic.currencySymbol}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddServiceToCart}
                  disabled={!quickServiceId}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Qo'shish</span>
                </button>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Xizmat nomi</th>
                      <th className="py-2.5 px-3">Narxi</th>
                      <th className="py-2.5 px-3 w-20">Soni</th>
                      <th className="py-2.5 px-3 text-right">Jami</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cartItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Xizmatlar savatchasi bo'sh
                        </td>
                      </tr>
                    ) : (
                      cartItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{item.title}</td>
                          <td className="py-2.5 px-3 font-mono">{(item.unitPrice ?? 0).toLocaleString()} {clinic.currencySymbol}</td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleUpdateItemQty(idx, parseInt(e.target.value) || 1)}
                              className="w-14 px-1.5 py-0.5 border border-slate-300 rounded-lg text-center font-bold text-xs"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                            {(item.totalPrice ?? 0).toLocaleString()} {clinic.currencySymbol}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveCartItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 5 cols: Patient, payment type & Process button */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleProcessPayment} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                To'lovni Rasmiylashtirish
              </h2>

              {/* Select Patient */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bemor (Mijoz):
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden focus:bg-white"
                >
                  <option value="">Oddiy Mehmon / Shaxsi ko'rsatilmagan</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  To'lov usuli:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    💵 Naqd Pul
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    💳 Uzcard / Humo
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('payme_click')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'payme_click'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    📲 Click / Payme
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('debt')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'debt'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    📝 Nasiya / Qarz
                  </button>
                </div>
              </div>

              {/* Discount */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chegirma Summasi ({clinic.currencySymbol}):
                </label>
                <input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-hidden focus:bg-white"
                />
              </div>

              {/* Totals Calculation Box */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Oraliq summa:</span>
                  <span>{(subtotal ?? 0).toLocaleString()} {clinic.currencySymbol}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-rose-400 text-xs">
                    <span>Chegirma:</span>
                    <span>-{(discountAmount ?? 0).toLocaleString()} {clinic.currencySymbol}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-black text-lg text-emerald-400">
                  <span>JAMI TO'LOV:</span>
                  <span>{(finalTotal ?? 0).toLocaleString()} {clinic.currencySymbol}</span>
                </div>
              </div>

              {/* Submit Payment Button */}
              <button
                type="submit"
                disabled={cartItems.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-5 h-5" />
                <span>To'lovni Qabul Qilish & Chek Chop Etish</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* History of transactions */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Chek yoki bemor qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-64 focus:outline-hidden focus:bg-white"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Jami {filteredTransactions.length} ta chek
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Chek №</th>
                  <th className="py-3 px-4">Bemor F.I.SH</th>
                  <th className="py-3 px-4">Xizmatlar</th>
                  <th className="py-3 px-4">To'lov turi</th>
                  <th className="py-3 px-4">Summa</th>
                  <th className="py-3 px-4">Sana & Vaqt</th>
                  <th className="py-3 px-4 text-right">Chekni chop etish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Cheklar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {tx.receiptNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {tx.patientName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {tx.items.map(i => i.title).join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        {(tx.totalAmount ?? 0).toLocaleString()} {clinic.currencySymbol}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString('uz-UZ') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => PrinterService.printPaymentReceipt(tx, clinic, printerConfig)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Qayta Chop Etish</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
