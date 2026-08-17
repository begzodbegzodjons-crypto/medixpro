import React from 'react';
import { 
  X, 
  FileText, 
  User, 
  Stethoscope, 
  History,
  Printer,
  Sparkles
} from 'lucide-react';
import { 
  Patient, 
  ConsultationRecord, 
  LabTestOrder, 
  PaymentTransaction, 
  ClinicProfile, 
  PrinterConfig 
} from '../../types';
import { PatientMedicalHistoryTimeline } from './PatientMedicalHistoryTimeline';

interface PatientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  consultations: ConsultationRecord[];
  labOrders?: LabTestOrder[];
  transactions?: PaymentTransaction[];
  clinic: ClinicProfile;
  printerConfig: PrinterConfig;
  onSelectConsultation?: (consultation: ConsultationRecord) => void;
}

export const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({
  isOpen,
  onClose,
  patient,
  consultations,
  labOrders = [],
  transactions = [],
  clinic,
  printerConfig,
  onSelectConsultation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold">Bemorning Tibbiy Tarixi & Xronologiyasi</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-blue-300 font-mono text-[11px] font-bold">
                  {patient.patientNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Konsultatsiyalar, laboratoriya tahlillari va dorixona retseptlarining to'liq vertikal arxivi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Scrollable Timeline */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <PatientMedicalHistoryTimeline
            patient={patient}
            consultations={consultations}
            labOrders={labOrders}
            transactions={transactions}
            clinic={clinic}
            printerConfig={printerConfig}
            onSelectConsultation={onSelectConsultation}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Klinika: <strong className="text-slate-800">{clinic.name}</strong> • EMR Arxiv tizimi
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
