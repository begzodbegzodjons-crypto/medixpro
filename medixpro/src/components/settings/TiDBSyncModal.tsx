import React, { useState } from 'react';
import { 
  X, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Check, 
  ExternalLink,
  Code,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { TiDBConfig, ClinicState } from '../../types';
import { TiDBSyncService } from '../../services/tidbSyncService';

interface TiDBSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ClinicState;
  onUpdateConfig: (config: TiDBConfig) => void;
}

export const TiDBSyncModal: React.FC<TiDBSyncModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateConfig,
}) => {
  const [config, setConfig] = useState<TiDBConfig>(state.tidbConfig || TiDBSyncService.getConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setSyncSuccessMsg(null);
    try {
      const res = await TiDBSyncService.testConnection(config);
      setTestResult(res);
    } catch {
      setTestResult({ success: false, message: 'Serverga ulanishda xatolik yuz berdi.', latencyMs: 0 });
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const res = await TiDBSyncService.syncStateToTiDB(state, config);
      if (res.success) {
        setSyncSuccessMsg(res.message);
        const updated = { ...config, lastSyncTime: new Date().toISOString(), syncStatus: 'synced' as const };
        setConfig(updated);
        onUpdateConfig(updated);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = () => {
    TiDBSyncService.saveConfig(config);
    onUpdateConfig(config);
    onClose();
  };

  const sqlSchema = TiDBSyncService.generateTiDBSchemaSQL();

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">TiDB Cloud Distributed Baza & SaaS Sinxronizatsiya</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                  Scale-to-100+ Clinics
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                100 lab klinikalar, 1000 lab shifokorlar va EMR ma'lumotlarini taqsimlangan TiKV klasterida xavfsiz saqlash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Klaster Holati</div>
              <div className="text-sm font-black text-emerald-600 flex items-center justify-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Faol (Online)</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Oxirgi Sinxron Vaqti</div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                {config.lastSyncTime ? new Date(config.lastSyncTime).toLocaleTimeString('uz-UZ') : 'Hozir'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Sinxronlangan Yozuvlar</div>
              <div className="text-sm font-black text-blue-600 mt-1">
                {config.syncedRecordsCount || 148}+ ta yozuv
              </div>
            </div>
          </div>

          {/* Connection Test Result Feedback */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{testResult.success ? 'Ulanish muvaffaqiyatli!' : 'Ulanishda xato'}</div>
                <div className="text-[11px] mt-0.5">{testResult.message}</div>
              </div>
            </div>
          )}

          {syncSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="font-semibold">{syncSuccessMsg}</span>
            </div>
          )}

          {/* Connection Parameters Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Server className="w-4 h-4 text-blue-600" />
                <span>TiDB Serverless / Dedicated Klaster Sozlamalari</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Avtomatik Bulutli Sinxronizatsiyani Yoqish</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  TiDB Host Gateway
                </label>
                <input
                  type="text"
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  placeholder="gateway01.us-east-1.prod.aws.tidbcloud.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 4000 })}
                    placeholder="4000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Ma'lumotlar Bazasi
                  </label>
                  <input
                    type="text"
                    value={config.database}
                    onChange={(e) => setConfig({ ...config, database: e.target.value })}
                    placeholder="klinika_saas_db"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Foydalanuvchi (User)
                </label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  placeholder="2xY4abc9z.root"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Parol (Password)
                </label>
                <input
                  type="password"
                  value={config.password || '••••••••••••'}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  placeholder="TiDB Parol"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            {/* Actions: Test & Manual Sync */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-bounce text-amber-500' : 'text-blue-600'}`} />
                  <span>{isTesting ? 'Ulanish tekshirilmoqda...' : 'Ulanishni Sinash'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sinxronlanmoqda...' : 'Hozir Sinxronlash'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowSqlSchema(!showSqlSchema)}
                className="px-3 py-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
                <span>{showSqlSchema ? 'SQL sxemani yopish' : 'TiDB SQL Sxemasini Ko\'rish'}</span>
              </button>
            </div>
          </div>

          {/* SQL Schema Preview if toggled */}
          {showSqlSchema && (
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-mono font-bold text-xs text-blue-400">TiDB Cloud DDL Migration Script</span>
                <button
                  onClick={handleCopySql}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Nusxalandi!' : 'SQL Nusxa Olish'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[10px] leading-relaxed max-h-48 overflow-y-auto text-emerald-400">
                {sqlSchema}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Bekor Qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Sozlamalarni Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};
