import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Trash2,
  Edit2
} from 'lucide-react';
import { PharmacyItem, ClinicProfile } from '../../types';

interface PharmacyViewProps {
  inventory: PharmacyItem[];
  clinic: ClinicProfile;
  onAddItem: (item: Omit<PharmacyItem, 'id' | 'createdAt'>) => void;
  onUpdateStock: (itemId: string, newStock: number) => void;
}

export const PharmacyView: React.FC<PharmacyViewProps> = ({
  inventory,
  clinic,
  onAddItem,
  onUpdateStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Antibiotiklar');
  const [stockQuantity, setStockQuantity] = useState(100);
  const [minThreshold, setMinThreshold] = useState(10);
  const [unit, setUnit] = useState('quti');
  const [costPrice, setCostPrice] = useState(25000);
  const [salePrice, setSalePrice] = useState(35000);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [manufacturer, setManufacturer] = useState('Nobel Pharmsanoat');

  const filteredItems = inventory.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q)
    );
  });

  const lowStockCount = inventory.filter(i => i.stockQuantity <= i.minThreshold).length;
  const totalValue = inventory.reduce((acc, i) => acc + (i.stockQuantity * i.salePrice), 0);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Iltimos, dori nomini kiriting.');
      return;
    }

    onAddItem({
      clinicId: clinic.id,
      name: name.trim(),
      category,
      stockQuantity,
      minThreshold,
      unit,
      costPrice,
      salePrice,
      expiryDate,
      manufacturer,
    });

    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Pill className="w-6 h-6 text-teal-600" />
            <span>Dorixona va Dori-darmon Ombori</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Qoldiqlar hisobi, kam qolgan dorilar signali, kirim-chiqim va yaroqlilik muddati nazorati
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yangi Dori / Vosita Kirim Qilish</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Jami Dori Turlari</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{inventory.length} ta</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-xs">
          <div className="text-[11px] font-bold text-teal-700 uppercase">Ombordagi Umumiy Qiymat</div>
          <div className="text-2xl font-black text-teal-600 mt-0.5">
            {(totalValue ?? 0).toLocaleString()} <span className="text-xs font-normal">{clinic.currencySymbol}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold text-rose-700 uppercase">Kam Qolgan Dorilar</div>
          <div className="text-2xl font-black text-rose-600 mt-0.5">{lowStockCount} ta</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Yaroqlilik Holati</div>
          <div className="text-2xl font-black text-blue-600 mt-0.5">Nazoratda</div>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockCount > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-900">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Diqqat: Omborda {lowStockCount} ta preparat minimal chegaradan kam qolgan! Yangi partiya buyurtma qiling.</span>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Dori nomi yoki ishlab chiqaruvchi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-64 focus:outline-hidden focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredItems.length} ta dori ro'yxatda
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Dori / Preparat Nomi</th>
                <th className="py-3 px-4">Kategoriya</th>
                <th className="py-3 px-4">Qoldiq Soni</th>
                <th className="py-3 px-4">Tannarx</th>
                <th className="py-3 px-4">Sotuv Narxi</th>
                <th className="py-3 px-4">Yaroqlilik Muddati</th>
                <th className="py-3 px-4">Ishlab Chiqaruvchi</th>
                <th className="py-3 px-4 text-right">Qoldiqni O'zgartirish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Dorilar topilmadi
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.stockQuantity <= item.minThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.stockQuantity} {item.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {(item.costPrice ?? 0).toLocaleString()} {clinic.currencySymbol}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {(item.salePrice ?? 0).toLocaleString()} {clinic.currencySymbol}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {item.expiryDate}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.manufacturer}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onUpdateStock(item.id, Math.max(0, item.stockQuantity - 1))}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded font-black text-slate-700 cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            onClick={() => onUpdateStock(item.id, item.stockQuantity + 1)}
                            className="w-7 h-7 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 text-teal-800 rounded font-black cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Medicine */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-teal-700 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Pill className="w-5 h-5" />
                <span>Yangi Dori / Tibbiy Vosita Kirim Qilish</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-white/80 hover:text-white rounded-lg">✕</button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dori Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Paratsetamol 500mg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategoriya</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  >
                    <option value="Antibiotiklar">Antibiotiklar</option>
                    <option value="Og'riq qoldiruvchi">Og'riq qoldiruvchi</option>
                    <option value="Kardio preparatlar">Kardio preparatlar</option>
                    <option value="Vitaminlar">Vitaminlar</option>
                    <option value="Shprits va sarf materiallar">Shprits va sarf materiallar</option>
                    <option value="Infuzion eritmalar">Infuzion eritmalar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">O'lchov Birligi</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="quti, ampula, dona..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kirim Miqdori</label>
                  <input
                    type="number"
                    min={1}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Minimal Limit (Signal)</label>
                  <input
                    type="number"
                    min={1}
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kirim (Tannarx) Narxi</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sotuv Narxi</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Yaroqlilik Muddati</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ishlab Chiqaruvchi Zavod</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="Nobel, Jurabek..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-md transition-colors"
                >
                  Omborga Kirim Qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
