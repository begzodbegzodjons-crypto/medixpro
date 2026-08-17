import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Bed, 
  Stethoscope, 
  CreditCard, 
  FlaskConical, 
  Pill, 
  UserCog, 
  BarChart3, 
  Settings,
  History,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  currentUserRole?: UserRole;
  queueCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  currentUserRole = 'admin',
  queueCount = 0,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Boshqaruv Paneli',
      icon: LayoutDashboard,
      roles: ['admin', 'reception', 'doctor', 'cashier', 'inpatient_nurse', 'lab_tech', 'pharmacist'],
      badge: null,
    },
    {
      id: 'reception',
      label: 'Qabulxona & Navbat',
      icon: Users,
      roles: ['admin', 'reception', 'cashier'],
      badge: queueCount > 0 ? `${queueCount}` : null,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'patient_history',
      label: 'Bemorlar Tarixi',
      icon: History,
      roles: ['admin', 'reception', 'doctor', 'cashier', 'inpatient_nurse', 'lab_tech', 'pharmacist'],
      badge: 'Baza',
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'wards',
      label: 'Palatalar',
      icon: Bed,
      roles: ['admin', 'reception', 'inpatient_nurse', 'doctor', 'cashier'],
      badge: null,
    },
    {
      id: 'doctor',
      label: 'Shifokor Kabineti',
      icon: Stethoscope,
      roles: ['admin', 'doctor'],
      badge: currentUserRole === 'doctor' ? 'EMR' : null,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'cashier',
      label: 'Kassa & Moliya',
      icon: CreditCard,
      roles: ['admin', 'cashier', 'reception'],
      badge: null,
    },
    {
      id: 'lab',
      label: 'Laboratoriya',
      icon: FlaskConical,
      roles: ['admin', 'lab_tech', 'doctor'],
      badge: null,
    },
    {
      id: 'pharmacy',
      label: 'Dorixona',
      icon: Pill,
      roles: ['admin', 'pharmacist', 'inpatient_nurse'],
      badge: null,
    },
    {
      id: 'staff',
      label: 'Xodimlar',
      icon: UserCog,
      roles: ['admin'],
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Hisobotlar',
      icon: BarChart3,
      roles: ['admin', 'cashier'],
      badge: null,
    },
    {
      id: 'settings',
      label: 'Sozlamalar',
      icon: Settings,
      roles: ['admin', 'reception', 'cashier'],
      badge: null,
    },
  ];

  return (
    <aside className="w-60 sm:w-64 bg-[#0f172a] text-white flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white text-sm shadow-xs">
            K
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Klinika<span className="text-blue-400">ERP</span>
          </h1>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isAllowed = !currentUserRole || item.roles.includes(currentUserRole);

          if (!isAllowed) return null;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Cloud Sync Status (High Density spec) */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-mono text-slate-400 font-bold tracking-wide">CLOUD SYNC: ACTIVE</span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          ID: CRM-7782-UX • Xprinter Direct
        </div>
      </div>
    </aside>
  );
};
