import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tv, 
  Volume2, 
  VolumeX, 
  Clock, 
  Building2, 
  Maximize2, 
  Minimize2, 
  Stethoscope, 
  BellRing,
  Sparkles,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { QueueTicket, ClinicProfile, StaffMember } from '../../types';
import { AudioService } from '../../services/audioService';

interface QueueTVDisplayProps {
  isOpen?: boolean;
  onClose: () => void;
  queue: QueueTicket[];
  clinic: ClinicProfile;
  staffList?: StaffMember[];
}

export const QueueTVDisplay: React.FC<QueueTVDisplayProps> = ({
  isOpen = true,
  onClose,
  queue,
  clinic,
  staffList = [],
}) => {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCalledTicket, setLastCalledTicket] = useState<QueueTicket | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor newly called ticket
  const inConsultationTickets = queue.filter(q => q.status === 'in_consultation');
  const waitingTickets = queue.filter(q => q.status === 'waiting');

  useEffect(() => {
    if (inConsultationTickets.length > 0) {
      const latest = inConsultationTickets[inConsultationTickets.length - 1];
      if (latest && latest.id !== lastCalledTicket?.id) {
        setLastCalledTicket(latest);
        if (soundEnabled) {
          AudioService.announceQueueCall(latest.ticketNumber, latest.roomNumber, latest.doctorName);
        }
      }
    }
  }, [inConsultationTickets, lastCalledTicket, soundEnabled]);

  if (isOpen === false) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans">
      {/* Top TV Bar */}
      <header className="px-6 lg:px-10 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-600 flex items-center justify-center font-black text-2xl shadow-lg border border-white/10">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
              <span>{clinic.name}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono font-bold">
                HDMI LIVE
              </span>
            </h1>
            <p className="text-sm text-blue-400 font-semibold tracking-wide">
              ELEKTRON NAVBAT MONITORI • QABULXONA VA KUTISH ZALI
            </p>
          </div>
        </div>

        {/* Live Clock & Controls */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-2 bg-slate-800/90 px-5 py-2.5 rounded-2xl border border-slate-700 font-mono text-xl lg:text-2xl font-bold text-emerald-400 shadow-inner">
            <Clock className="w-6 h-6 text-slate-400 animate-spin-slow" />
            <span>
              {time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={soundEnabled ? 'Ovozli diktor faol (O\'zbekcha)' : 'Ovoz o\'chirilgan'}
            >
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="To'liq ekran rejimiga o'tish (HDMI Fullscreen)"
            >
              {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
            </button>

            <button
              onClick={onClose}
              className="p-3 rounded-xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600 text-rose-400 hover:text-white transition-colors cursor-pointer"
              title="Monitordan chiqish"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main TV Screen Content */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-6 lg:p-8 overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">
        {/* Left 7 Cols: Currently in Consultation / Called */}
        <section className="col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-xl lg:text-2xl font-black text-emerald-400 tracking-wide uppercase">
                HOZIR QABULDA (Chaqirilganlar)
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              {inConsultationTickets.length} bemor xonada
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {inConsultationTickets.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-slate-700 mb-3" />
                <h3 className="text-xl font-bold text-slate-400">Hozirda chaqirilgan bemorlar yo'q</h3>
                <p className="text-sm text-slate-600 mt-1 max-w-md">
                  Shifokorlar kabinetidan "Keyingi Bemorni Chaqirish" tugmasi bosilishi bilan ovozli e'lon beriladi va ekranda paydo bo'ladi.
                </p>
              </div>
            ) : (
              inConsultationTickets.map((ticket, idx) => (
                <div
                  key={ticket.id}
                  className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between shadow-2xl ${
                    idx === 0
                      ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border-emerald-500/90 ring-4 ring-emerald-500/20 animate-pulse-slow'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="px-6 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-4xl lg:text-5xl tracking-widest shadow-xl font-mono">
                      {ticket.ticketNumber}
                    </div>
                    <div>
                      <div className="text-2xl lg:text-3xl font-extrabold text-white">
                        {ticket.patientName}
                      </div>
                      <div className="text-sm lg:text-base text-slate-300 mt-1 font-medium flex items-center gap-2">
                        <span className="font-bold text-white">{ticket.doctorName}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{ticket.doctorSpecialty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Qabul Xonasi
                    </div>
                    <div className="text-3xl lg:text-4xl font-black text-amber-400 font-mono">
                      {ticket.roomNumber}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right 5 Cols: Waiting Queue */}
        <section className="col-span-5 flex flex-col gap-4 border-l border-slate-800 pl-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <h2 className="text-xl lg:text-2xl font-black text-blue-400 tracking-wide uppercase">
                KUTMOQDA (Navbat)
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              {waitingTickets.length} navbatda
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {waitingTickets.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/30 p-6 text-center text-slate-500">
                Kutayotgan bemorlar mavjud emas
              </div>
            ) : (
              waitingTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 py-2 rounded-xl bg-slate-800 text-blue-400 font-black text-xl text-center font-mono border border-slate-700">
                      {ticket.ticketNumber}
                    </div>
                    <div>
                      <div className="font-bold text-base text-slate-200 truncate max-w-[200px]">
                        {ticket.patientName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {ticket.doctorSpecialty} • {ticket.doctorName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-sm font-semibold text-slate-400">
                    {ticket.roomNumber}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Bottom Emergency / Info Ticker */}
      <footer className="px-8 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold uppercase text-[10px]">
            E'LON
          </span>
          <span className="text-slate-300 font-medium truncate">
            Hurmatli bemorlar! Navbatingiz yetganda ovozli e'lon beriladi va ekranda raqamingiz ko'rsatiladi. Iltimos, xonaga navbat bilan kiring.
          </span>
        </div>
        <div className="font-bold text-slate-400 shrink-0">
          Tel: {clinic.phone} • {clinic.address}
        </div>
      </footer>
    </div>
  );
};
