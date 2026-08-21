import React, { useState, Suspense, lazy } from 'react';
import { 
  ClinicProfile, 
  ClinicState, 
  StaffMember, 
  Patient, 
  QueueTicket, 
  WardRoom, 
  PaymentTransaction, 
  LabTestOrder, 
  PharmacyItem, 
  MedicalService, 
  PrinterConfig,
  BedStatus,
  ConsultationRecord,
  UserRole,
  ClinicalProtocol,
  TiDBConfig
} from './types';
import { StorageService } from './services/storageService';
import { PrinterService } from './services/printerService';
import { TiDBSyncService } from './services/tidbSyncService';

// Layout Components (loaded immediately - they're on every page)
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// View Components - LAZY LOADED (only loaded when user opens that view)
const DashboardOverview = lazy(() => import('./components/dashboard/DashboardOverview').then(m => ({default: m.DashboardOverview})));
const ReceptionView = lazy(() => import('./components/reception/ReceptionView').then(m => ({default: m.ReceptionView})));
const PatientHistoryCentralView = lazy(() => import('./components/reception/PatientHistoryCentralView').then(m => ({default: m.PatientHistoryCentralView})));
const QueueTVDisplay = lazy(() => import('./components/queue/QueueTVDisplay').then(m => ({default: m.QueueTVDisplay})));
const DoctorView = lazy(() => import('./components/doctor/DoctorView').then(m => ({default: m.DoctorView})));
const WardsView = lazy(() => import('./components/wards/WardsView').then(m => ({default: m.WardsView})));
const CashierView = lazy(() => import('./components/cashier/CashierView').then(m => ({default: m.CashierView})));
const LabView = lazy(() => import('./components/lab/LabView').then(m => ({default: m.LabView})));
const PharmacyView = lazy(() => import('./components/pharmacy/PharmacyView').then(m => ({default: m.PharmacyView})));
const StaffView = lazy(() => import('./components/staff/StaffView').then(m => ({default: m.StaffView})));
const AnalyticsView = lazy(() => import('./components/analytics/AnalyticsView').then(m => ({default: m.AnalyticsView})));
const SettingsView = lazy(() => import('./components/settings/SettingsView').then(m => ({default: m.SettingsView})));

// Auth Components (loaded immediately - needed for initial login)
import { AuthPortal } from './components/auth/AuthPortal';
import { RegisterClinicModal } from './components/auth/RegisterClinicModal';
import { StaffLoginModal } from './components/auth/StaffLoginModal';
import { SessionLockModal } from './components/auth/SessionLockModal';
import { PrinterSettingsModal } from './components/settings/PrinterSettingsModal';
import { TiDBSyncModal } from './components/settings/TiDBSyncModal';

// Loading fallback for lazy-loaded views
function ViewLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-3"></div>
        <div className="text-slate-400 text-sm">Yuklanmoqda...</div>
      </div>
    </div>
  );
}

export default function App() {
  // 1. Authenticated Clinic ID (Tenant isolation - zero visibility of other clinics)
  const [authenticatedClinicId, setAuthenticatedClinicId] = useState<string | null>(() => {
    return StorageService.getAuthenticatedClinicId();
  });
  
  // Active Clinic Data State (isolated to current authenticated clinic)
  const [clinicData, setClinicData] = useState<ClinicState>(() => {
    const authId = StorageService.getAuthenticatedClinicId() || StorageService.getActiveClinicId();
    return StorageService.getClinicData(authId);
  });

  // Custom Disease Protocols
  const [customProtocols, setCustomProtocols] = useState<ClinicalProtocol[]>(() => {
    try {
      const saved = localStorage.getItem('klinika_custom_protocols');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current Staff User within this authenticated clinic
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(() => {
    return clinicData.currentUser || clinicData.staffList[0] || null;
  });

  // Navigation Active View
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Modals state
  const [showRegisterClinic, setShowRegisterClinic] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const [showTiDBSync, setShowTiDBSync] = useState(false);
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  // Helper: Get default view for role
  const getDefaultViewForRole = (role: UserRole): string => {
    switch (role) {
      case 'doctor': return 'doctor';
      case 'reception': return 'reception';
      case 'cashier': return 'cashier';
      case 'inpatient_nurse': return 'wards';
      case 'lab_tech': return 'lab';
      case 'pharmacist': return 'pharmacy';
      case 'admin': return 'dashboard';
      default: return 'dashboard';
    }
  };

  // Synchronize state saves to storage
  const updateAndSaveState = (updater: (prev: ClinicState) => ClinicState) => {
    setClinicData(prev => {
      const next = updater(prev);
      StorageService.saveClinicData(next.currentClinic.id, next);
      return next;
    });
  };

  // Handler: Clinic Login / Authentication
  const handleClinicAuthenticated = (clinic: ClinicProfile, staff?: StaffMember) => {
    StorageService.setAuthenticatedClinicId(clinic.id);
    setAuthenticatedClinicId(clinic.id);
    
    const loaded = StorageService.getClinicData(clinic.id);
    setClinicData(loaded);
    
    const activeStaff = staff || loaded.staffList.find(s => s.role === 'admin') || loaded.staffList[0] || null;
    setCurrentUser(activeStaff);
    if (activeStaff) {
      StorageService.setActiveUserId(activeStaff.id);
      setActiveView(getDefaultViewForRole(activeStaff.role));
    } else {
      setActiveView('dashboard');
    }
  };

  // Handler: Full Clinic Logout (Returns to Clinic Login Portal)
  const handleClinicLogout = () => {
    StorageService.logoutClinic();
    setAuthenticatedClinicId(null);
    setCurrentUser(null);
  };

  // Handler: Login as a Staff Member within this clinic
  const handleStaffLogin = (staff: StaffMember) => {
    setCurrentUser(staff);
    StorageService.setActiveUserId(staff.id);
    updateAndSaveState(prev => ({
      ...prev,
      currentUser: staff,
    }));
    setActiveView(getDefaultViewForRole(staff.role));
  };

  // Handler: Logout current staff member
  const handleLogout = () => {
    setShowStaffLogin(true);
  };

  // Handler: Register New Clinic (SaaS)
  const handleRegisterClinic = (
    profileData: Omit<ClinicProfile, 'id' | 'createdAt'>,
    adminUser?: { fullName: string; username: string; password?: string; phone: string; email: string }
  ) => {
    const defaultAdmin = adminUser || {
      fullName: 'Bosh Shifokor',
      username: 'admin',
      password: '123',
      phone: profileData.phone || '+998 71 200-00-00',
      email: profileData.email || 'info@clinic.uz',
    };
    const { clinic, adminStaff } = StorageService.registerNewClinic(profileData, defaultAdmin);
    setAuthenticatedClinicId(clinic.id);
    const loaded = StorageService.getClinicData(clinic.id);
    setClinicData(loaded);
    setCurrentUser(adminStaff);
    setActiveView('dashboard');
  };

  // Handler: Add Patient
  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: `pat_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    updateAndSaveState(prev => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
    }));

    return newPatient;
  };

  // Handler: Add to Queue
  const handleAddToQueue = (queueData: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    roomNumber: string;
    serviceId?: string;
    serviceName: string;
    price: number;
    paymentStatus?: 'paid' | 'unpaid' | 'partial';
    paidAmount?: number;
  }): QueueTicket => {
    const nextNum = clinicData.queue.length + 1;
    const ticketNumber = `A-${String(nextNum).padStart(3, '0')}`;

    const newTicket: QueueTicket = {
      id: `tkt_${Date.now()}`,
      clinicId: clinicData.currentClinic.id,
      ticketNumber,
      patientId: queueData.patientId,
      patientName: queueData.patientName,
      patientPhone: queueData.patientPhone,
      doctorId: queueData.doctorId,
      doctorName: queueData.doctorName,
      doctorSpecialty: queueData.doctorSpecialty,
      roomNumber: queueData.roomNumber,
      serviceId: queueData.serviceId,
      serviceName: queueData.serviceName,
      price: queueData.price,
      status: 'waiting',
      paymentStatus: queueData.paymentStatus || 'paid',
      paidAmount: queueData.paidAmount ?? queueData.price,
      estimatedWaitMinutes: 10,
      createdAt: new Date().toISOString(),
    };

    updateAndSaveState(prev => ({
      ...prev,
      queue: [...prev.queue, newTicket],
    }));

    // Auto print queue ticket
    PrinterService.printQueueTicket(newTicket, clinicData.currentClinic, clinicData.printerConfig);

    return newTicket;
  };

  // Handler: Update Queue Ticket Status
  const handleUpdateQueueStatus = (ticketId: string, status: QueueTicket['status']) => {
    updateAndSaveState(prev => ({
      ...prev,
      queue: prev.queue.map(t => {
        if (t.id === ticketId) {
          const updated = { ...t, status };
          if (status === 'in_consultation') {
            updated.calledAt = new Date().toISOString();
          } else if (status === 'completed') {
            updated.completedAt = new Date().toISOString();
          }
          return updated;
        }
        return t;
      }),
    }));
  };

  // Handler: Wards Admission
  const handleAdmitPatient = (wardId: string, bedId: string, admissionData: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    diagnosis: string;
    dietType?: string;
    depositAmount: number;
  }) => {
    updateAndSaveState(prev => ({
      ...prev,
      wards: prev.wards.map(ward => {
        if (ward.id === wardId) {
          return {
            ...ward,
            beds: ward.beds.map(bed => {
              if (bed.id === bedId) {
                return {
                  ...bed,
                  status: 'occupied' as BedStatus,
                  currentPatient: {
                    patientId: admissionData.patientId,
                    patientName: admissionData.patientName,
                    doctorId: admissionData.doctorId,
                    doctorName: admissionData.doctorName,
                    admissionDate: new Date().toISOString(),
                    diagnosis: admissionData.diagnosis,
                    dietType: admissionData.dietType,
                    depositAmount: admissionData.depositAmount,
                  },
                };
              }
              return bed;
            }),
          };
        }
        return ward;
      }),
    }));
  };

  // Handler: Wards Discharge
  const handleDischargePatient = (wardId: string, bedId: string) => {
    let totalDays = 1;
    let totalCost = 0;

    updateAndSaveState(prev => ({
      ...prev,
      wards: prev.wards.map(ward => {
        if (ward.id === wardId) {
          return {
            ...ward,
            beds: ward.beds.map(bed => {
              if (bed.id === bedId) {
                if (bed.currentPatient) {
                  const diff = Math.max(1, Math.ceil((Date.now() - new Date(bed.currentPatient.admissionDate).getTime()) / (1000 * 60 * 60 * 24)));
                  totalDays = diff;
                  totalCost = diff * (bed.dailyPrice || ward.dailyRate);
                }
                return {
                  ...bed,
                  status: 'cleaning' as BedStatus,
                  currentPatient: undefined,
                };
              }
              return bed;
            }),
          };
        }
        return ward;
      }),
    }));

    return { totalDays, totalCost };
  };

  // Handler: Update Bed Status
  const handleUpdateBedStatus = (wardId: string, bedId: string, status: BedStatus) => {
    updateAndSaveState(prev => ({
      ...prev,
      wards: prev.wards.map(ward => {
        if (ward.id === wardId) {
          return {
            ...ward,
            beds: ward.beds.map(bed => (bed.id === bedId ? { ...bed, status } : bed)),
          };
        }
        return ward;
      }),
    }));
  };

  // Handler: Add Ward Room
  const handleAddWardRoom = (roomData: Omit<WardRoom, 'id'>) => {
    const newRoom: WardRoom = {
      ...roomData,
      id: `ward_${Date.now()}`,
    };
    updateAndSaveState(prev => ({
      ...prev,
      wards: [...prev.wards, newRoom],
    }));
  };

  // Handler: Save Doctor Consultation
  const handleSaveConsultation = (record: Omit<ConsultationRecord, 'id' | 'createdAt'>) => {
    const newRecord: ConsultationRecord = {
      ...record,
      id: `cons_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateAndSaveState(prev => ({
      ...prev,
      consultations: [newRecord, ...prev.consultations],
    }));
  };

  // Handler: Add Payment Transaction (Cashier POS)
  const handleAddTransaction = (txData: Omit<PaymentTransaction, 'id' | 'receiptNumber' | 'createdAt'>): PaymentTransaction => {
    const receiptNumber = `CHK-${Date.now().toString().slice(-6)}`;
    const newTx: PaymentTransaction = {
      ...txData,
      id: `tx_${Date.now()}`,
      receiptNumber,
      createdAt: new Date().toISOString(),
    };

    updateAndSaveState(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));

    return newTx;
  };

  // Handler: Add Lab Test Order
  const handleAddLabOrder = (orderData: Omit<LabTestOrder, 'id' | 'orderNumber' | 'createdAt'>) => {
    const orderNumber = `LAB-${Date.now().toString().slice(-5)}`;
    const newOrder: LabTestOrder = {
      ...orderData,
      id: `lab_${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };

    updateAndSaveState(prev => ({
      ...prev,
      labOrders: [newOrder, ...prev.labOrders],
    }));
  };

  // Handler: Update Lab Test Order
  const handleUpdateLabOrder = (order: LabTestOrder) => {
    updateAndSaveState(prev => ({
      ...prev,
      labOrders: prev.labOrders.map(o => (o.id === order.id ? order : o)),
    }));
  };

  // Handler: Pharmacy Add Item
  const handleAddPharmacyItem = (itemData: Omit<PharmacyItem, 'id' | 'createdAt'>) => {
    const newItem: PharmacyItem = {
      ...itemData,
      id: `ph_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateAndSaveState(prev => ({
      ...prev,
      pharmacy: [newItem, ...prev.pharmacy],
    }));
  };

  // Handler: Pharmacy Stock Update
  const handleUpdatePharmacyStock = (itemId: string, newStock: number) => {
    updateAndSaveState(prev => ({
      ...prev,
      pharmacy: prev.pharmacy.map(item =>
        item.id === itemId ? { ...item, stockQuantity: newStock } : item
      ),
    }));
  };

  // Handler: Add Staff Member
  const handleAddStaff = (staffData: Omit<StaffMember, 'id' | 'createdAt'>) => {
    const newStaff: StaffMember = {
      ...staffData,
      id: `stf_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateAndSaveState(prev => ({
      ...prev,
      staffList: [...prev.staffList, newStaff],
    }));
  };

  // Handler: Update Staff Member
  const handleUpdateStaff = (staff: StaffMember) => {
    updateAndSaveState(prev => ({
      ...prev,
      staffList: prev.staffList.map(s => (s.id === staff.id ? staff : s)),
    }));
    if (currentUser?.id === staff.id) {
      setCurrentUser(staff);
    }
  };

  // Handler: Delete Staff Member
  const handleDeleteStaff = (staffId: string) => {
    updateAndSaveState(prev => ({
      ...prev,
      staffList: prev.staffList.filter(s => s.id !== staffId),
    }));
  };

  // Handler: Update Clinic Profile
  const handleUpdateClinic = (profile: ClinicProfile) => {
    updateAndSaveState(prev => ({
      ...prev,
      currentClinic: profile,
    }));
    const allClinics = StorageService.getClinics().map(c => c.id === profile.id ? profile : c);
    StorageService.saveClinics(allClinics);
  };

  // Handler: Update Printer Config
  const handleUpdatePrinterConfig = (config: PrinterConfig) => {
    updateAndSaveState(prev => ({
      ...prev,
      printerConfig: config,
    }));
  };

  // Handler: Add Service
  const handleAddService = (serviceData: Omit<MedicalService, 'id'>) => {
    const newService: MedicalService = {
      ...serviceData,
      id: `srv_${Date.now()}`,
    };
    updateAndSaveState(prev => ({
      ...prev,
      services: [...prev.services, newService],
    }));
  };

  // Handler: Delete Service
  const handleDeleteService = (serviceId: string) => {
    updateAndSaveState(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId),
    }));
  };

  // Handler: Export All JSON
  const handleExportAllData = () => {
    const jsonStr = StorageService.exportBackupJSON(clinicData.currentClinic.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `klinika_zaxira_${clinicData.currentClinic.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handler: Import All JSON
  const handleImportAllData = (jsonStr: string) => {
    const success = StorageService.importBackupJSON(jsonStr);
    if (success) {
      const activeId = StorageService.getActiveClinicId();
      setClinicData(StorageService.getClinicData(activeId));
    }
  };

  const handleSaveCustomProtocol = (proto: ClinicalProtocol) => {
    const updated = [proto, ...customProtocols];
    setCustomProtocols(updated);
    try {
      localStorage.setItem('klinika_custom_protocols', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleUpdateTiDBConfig = (config: TiDBConfig) => {
    updateAndSaveState(prev => ({
      ...prev,
      tidbConfig: config,
    }));
  };

  // Active count of waiting queue
  const waitingQueueCount = clinicData.queue.filter(q => q.status === 'waiting').length;

  // TV Display Mode Fullscreen render
  if (activeView === 'queue_tv') {
    return (
      <Suspense fallback={<ViewLoader />}>
        <QueueTVDisplay
          queue={clinicData.queue}
          staffList={clinicData.staffList}
          clinic={clinicData.currentClinic}
          onClose={() => setActiveView('dashboard')}
        />
      </Suspense>
    );
  }

  // If clinic is not authenticated, render the Clinic AuthPortal
  if (!authenticatedClinicId) {
    return (
      <>
        <AuthPortal
          onClinicAuthenticated={handleClinicAuthenticated}
          onOpenRegisterClinic={() => setShowRegisterClinic(true)}
          onRegisterClinicDirect={handleRegisterClinic}
        />

        {showRegisterClinic && (
          <RegisterClinicModal
            isOpen={showRegisterClinic}
            onClose={() => setShowRegisterClinic(false)}
            onRegister={handleRegisterClinic}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        clinic={clinicData.currentClinic}
        currentUser={currentUser}
        waitingCount={waitingQueueCount}
        printerConfig={clinicData.printerConfig}
        tidbConfig={clinicData.tidbConfig}
        onOpenStaffLogin={() => setShowStaffLogin(true)}
        onLogout={handleLogout}
        onLockSession={() => setIsSessionLocked(true)}
        onClinicLogout={handleClinicLogout}
        onOpenPrinterSettings={() => setShowPrinterSettings(true)}
        onOpenQueueTV={() => setActiveView('queue_tv')}
        onOpenTiDBSync={() => setShowTiDBSync(true)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with Role Access */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          currentUserRole={currentUser?.role || 'admin'}
          queueCount={waitingQueueCount}
        />

        {/* Content View Routing Area */}
        <main className="flex-1 overflow-y-auto pb-16">
          <Suspense fallback={<ViewLoader />}>
            {activeView === 'dashboard' && (
              <DashboardOverview
                clinic={clinicData.currentClinic}
                patients={clinicData.patients}
                queue={clinicData.queue}
                wards={clinicData.wards}
                transactions={clinicData.transactions}
                staffList={clinicData.staffList}
                labOrders={clinicData.labOrders}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'reception' && (
              <ReceptionView
                patients={clinicData.patients}
                staffList={clinicData.staffList}
                services={clinicData.services}
                queue={clinicData.queue}
                wards={clinicData.wards}
                clinic={clinicData.currentClinic}
                printerConfig={clinicData.printerConfig}
                consultations={clinicData.consultations}
                onAddPatient={handleAddPatient}
                onUpdatePatient={(p) => {
                  updateAndSaveState(prev => ({
                    ...prev,
                    patients: prev.patients.map(item => item.id === p.id ? p : item)
                  }));
                }}
                onCreateQueueTicket={handleAddToQueue}
                onUpdateQueueStatus={handleUpdateQueueStatus}
              />
            )}

            {activeView === 'patient_history' && (
              <PatientHistoryCentralView
                patients={clinicData.patients}
                queue={clinicData.queue}
                consultations={clinicData.consultations}
                labOrders={clinicData.labOrders}
                transactions={clinicData.transactions}
                wards={clinicData.wards}
                clinic={clinicData.currentClinic}
                printerConfig={clinicData.printerConfig}
              />
            )}

            {activeView === 'doctor' && (
              <DoctorView
                currentUser={currentUser}
                staffList={clinicData.staffList}
                queue={clinicData.queue}
                patients={clinicData.patients}
                consultations={clinicData.consultations}
                labOrders={clinicData.labOrders}
                transactions={clinicData.transactions}
                clinic={clinicData.currentClinic}
                printerConfig={clinicData.printerConfig}
                customProtocols={customProtocols}
                onUpdateQueueStatus={handleUpdateQueueStatus}
                onSaveConsultation={handleSaveConsultation}
                onOrderLabTest={handleAddLabOrder}
                onSaveCustomProtocol={handleSaveCustomProtocol}
              />
            )}

            {activeView === 'wards' && (
              <WardsView
                wards={clinicData.wards}
                patients={clinicData.patients}
                staffList={clinicData.staffList}
                clinic={clinicData.currentClinic}
                onAdmitPatient={handleAdmitPatient}
                onDischargePatient={handleDischargePatient}
                onUpdateBedStatus={handleUpdateBedStatus}
                onAddWardRoom={handleAddWardRoom}
              />
            )}

            {activeView === 'cashier' && (
              <CashierView
                transactions={clinicData.transactions}
                patients={clinicData.patients}
                services={clinicData.services}
                currentUser={currentUser}
                clinic={clinicData.currentClinic}
                printerConfig={clinicData.printerConfig}
                onAddTransaction={handleAddTransaction}
              />
            )}

            {activeView === 'lab' && (
              <LabView
                labOrders={clinicData.labOrders}
                patients={clinicData.patients}
                staffList={clinicData.staffList}
                clinic={clinicData.currentClinic}
                printerConfig={clinicData.printerConfig}
                onUpdateLabOrder={handleUpdateLabOrder}
                onAddLabOrder={handleAddLabOrder}
              />
            )}

            {activeView === 'pharmacy' && (
              <PharmacyView
                inventory={clinicData.pharmacy}
                clinic={clinicData.currentClinic}
                onAddItem={handleAddPharmacyItem}
                onUpdateStock={handleUpdatePharmacyStock}
              />
            )}

            {activeView === 'staff' && (
              <StaffView
                staffList={clinicData.staffList}
                clinic={clinicData.currentClinic}
                onAddStaff={handleAddStaff}
                onUpdateStaff={handleUpdateStaff}
                onDeleteStaff={handleDeleteStaff}
                onLoginAsStaff={handleStaffLogin}
              />
            )}

            {activeView === 'analytics' && (
              <AnalyticsView
                transactions={clinicData.transactions}
                patients={clinicData.patients}
                consultations={clinicData.consultations}
                staffList={clinicData.staffList}
                clinic={clinicData.currentClinic}
              />
            )}

          {activeView === 'settings' && (
            <SettingsView
              clinic={clinicData.currentClinic}
              printerConfig={clinicData.printerConfig}
              services={clinicData.services}
              onUpdateClinic={handleUpdateClinic}
              onUpdatePrinterConfig={handleUpdatePrinterConfig}
              onAddService={handleAddService}
              onDeleteService={handleDeleteService}
              onExportAllData={handleExportAllData}
              onImportAllData={handleImportAllData}
            />
          )}
          </Suspense>
        </main>
      </div>

      {/* Global Modals */}
      {showRegisterClinic && (
        <RegisterClinicModal
          isOpen={showRegisterClinic}
          onClose={() => setShowRegisterClinic(false)}
          onRegister={handleRegisterClinic}
        />
      )}

      {showStaffLogin && (
        <StaffLoginModal
          isOpen={showStaffLogin}
          staffList={clinicData.staffList}
          currentUser={currentUser}
          currentClinic={clinicData.currentClinic}
          onClose={() => setShowStaffLogin(false)}
          onSelectStaff={handleStaffLogin}
        />
      )}

      {showPrinterSettings && (
        <PrinterSettingsModal
          config={clinicData.printerConfig}
          clinic={clinicData.currentClinic}
          onClose={() => setShowPrinterSettings(false)}
          onSave={handleUpdatePrinterConfig}
        />
      )}

      {showTiDBSync && (
        <TiDBSyncModal
          isOpen={showTiDBSync}
          onClose={() => setShowTiDBSync(false)}
          state={clinicData}
          onUpdateConfig={handleUpdateTiDBConfig}
        />
      )}

      {isSessionLocked && (
        <SessionLockModal
          isOpen={isSessionLocked}
          clinic={clinicData.currentClinic}
          currentUser={currentUser}
          onUnlock={() => setIsSessionLocked(false)}
          onSwitchStaff={() => {
            setIsSessionLocked(false);
            setShowStaffLogin(true);
          }}
          onClinicLogout={() => {
            setIsSessionLocked(false);
            handleClinicLogout();
          }}
        />
      )}
    </div>
  );
}
