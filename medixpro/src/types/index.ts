export type UserRole = 
  | 'admin'          // Bosh Shifokor / Klinika Rahbari
  | 'reception'      // Registratura / Qabulxona
  | 'doctor'         // Shifokor
  | 'cashier'        // Kassir / Buxgalter
  | 'inpatient_nurse'// Statsionar / Palata hamshirasi
  | 'lab_tech'       // Laborant / Diagnostika
  | 'pharmacist';    // Dorixona / Omborchi

export interface ClinicProfile {
  id: string;
  name: string;
  shortName: string;
  loginUsername?: string;
  password?: string;
  licenseNumber: string;
  inn: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  telegram?: string;
  directorName: string;
  currency: 'UZS' | 'USD';
  currencySymbol: string;
  workingHours: string;
  logoUrl?: string;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    mfo: string;
  };
  createdAt: string;
}

export interface StaffMember {
  id: string;
  clinicId: string;
  fullName: string;
  role: UserRole;
  specialty?: string; // e.g. Terapevt, Kardiolog, Stomatolog, UZI, LOR, Pediatr, Xirurg
  roomNumber?: string; // e.g. 104-xona
  phone: string;
  email: string;
  username: string;
  password?: string;
  pinCode?: string; // e.g. "1234"
  doctorActivityStatus?: 'available' | 'in_consultation' | 'break' | 'busy';
  consultationFee: number;
  commissionPercent: number; // e.g. 30%
  status: 'active' | 'on_leave' | 'inactive';
  workSchedule?: string; // e.g. "08:30 - 17:00 (Dush-Juma)"
  avatarUrl?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  clinicId: string;
  patientNumber: string; // e.g. "P-2026-001"
  fullName: string;
  birthDate: string;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  passportOrPin: string; // Passport / JSHSHIR
  bloodGroup?: string; // 'A+', 'B+', 'AB+', 'O+', 'A-', etc.
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  notes?: string;
  balance: number; // Musbat bo'lsa depozit, manfiy bo'lsa qarz
  totalVisits: number;
  lastVisitDate?: string;
  createdAt: string;
}

export type QueueStatus = 'waiting' | 'in_consultation' | 'completed' | 'cancelled';

export interface QueueTicket {
  id: string;
  clinicId: string;
  ticketNumber: string; // e.g. "T-104", "K-102"
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
  status: QueueStatus;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  estimatedWaitMinutes: number;
  calledAt?: string;
  completedAt?: string;
  createdAt: string;
}

export type BedStatus = 'available' | 'occupied' | 'cleaning' | 'reserved';

export interface Bed {
  id: string;
  bedNumber: string; // e.g. "1-o'rin"
  status: BedStatus;
  dailyPrice: number;
  currentPatient?: {
    patientId: string;
    patientName: string;
    admissionDate: string;
    doctorId: string;
    doctorName: string;
    diagnosis: string;
    dietType?: string;
    notes?: string;
    depositAmount: number;
  };
}

export interface WardRoom {
  id: string;
  clinicId: string;
  roomNumber: string; // e.g. "201-palata"
  department: string; // e.g. "Terapiya", "Kardiologiya", "VIP", "Xirurgiya"
  floor: number;
  type: 'standard' | 'vip' | 'intensive' | 'pediatric';
  dailyRate: number; // e.g. 250000 UZS
  facilities: string[]; // e.g. ["Konditsioner", "TV", "Dush", "Kislorod"]
  beds: Bed[];
}

export interface MedicalService {
  id: string;
  clinicId: string;
  name: string;
  category: 'consultation' | 'diagnostics' | 'procedure' | 'lab' | 'surgery' | 'dental';
  price: number;
  doctorSharePercent: number; // Shifokor foizi
  durationMinutes: number;
  description?: string;
  isActive: boolean;
}

export interface ConsultationRecord {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  complaints: string; // Shikoyatlar
  anamnesis: string; // Kasallik tarixi
  objectiveExam: {
    bloodPressure?: string; // 120/80
    pulse?: number; // 75
    temperature?: number; // 36.6
    spO2?: number; // 98
    weight?: number; // 70 kg
    height?: number; // 175 cm
  };
  icdCode?: string; // ICD-10 kodi
  diagnosis: string; // Tashxis
  treatmentPlan: string; // Davolash rejimi
  prescriptions: PrescriptionItem[];
  orderedLabTests?: string[];
  orderedProcedures?: string[];
  followUpDate?: string;
  status: 'draft' | 'finalized';
  createdAt: string;
}

export interface PrescriptionItem {
  id: string;
  drugName: string;
  dosage: string; // e.g. "500 mg"
  frequency: string; // e.g. "Kuniga 2 mahal ovqatdan keyin"
  duration: string; // e.g. "7 kun"
  instructions: string;
}

export interface LabTestOrder {
  id: string;
  clinicId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testType: string; // e.g. "Umumiy qon tahlili", "Biokimyoviy", "UZI", "Koagulogramma"
  parameters: LabParameterResult[];
  conclusion?: string;
  status: 'ordered' | 'processing' | 'ready';
  price: number;
  paymentStatus: 'paid' | 'unpaid';
  performedBy?: string;
  completedAt?: string;
  createdAt: string;
}

export interface LabParameterResult {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  isAbnormal?: boolean;
}

export interface PharmacyItem {
  id: string;
  clinicId: string;
  name: string;
  genericName?: string;
  category: 'antibiotic' | 'analgesic' | 'vitamin' | 'consumable' | 'infusion' | 'other';
  barcode: string;
  unit: string; // dona, ampula, quti, flakon
  stockQuantity: number;
  minAlertQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: string;
  supplier?: string;
  location?: string; // e.g. "1-javon, 3-polka"
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  clinicId: string;
  receiptNumber: string;
  patientId: string;
  patientName: string;
  items: {
    title: string;
    type: 'consultation' | 'service' | 'lab' | 'ward' | 'pharmacy';
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'payme_click' | 'insurance' | 'debt';
  status: 'completed' | 'refunded' | 'pending';
  cashierName: string;
  notes?: string;
  createdAt: string;
}

export interface ClinicalProtocol {
  id: string;
  name: string; // Masalan: "Gipertoniya kasalligi II-bosqich"
  category: string; // "Kardiologiya", "Terapiya", "Nevrologiya", "Gastroenterologiya", "Pulmonologiya", "Endokrinologiya", "Urologiya", "Pediatriya"
  icdCode: string; // "I10"
  complaints: string;
  anamnesis?: string;
  diagnosis: string;
  prescriptions: PrescriptionItem[];
  treatmentPlan: string;
  recommendedLabTests?: string[];
  dietNumber?: string; // "Stol № 10 (Gipoxolesterin, tuzsiz)"
  followUpDays?: number; // 10
}

export interface TiDBConfig {
  enabled: boolean;
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  ssl: boolean;
  syncIntervalSeconds: number;
  autoSyncOnAction: boolean;
  lastSyncTime?: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  errorDetails?: string;
  pendingMutationsCount: number;
  syncedClinicsCount: number;
  syncedRecordsCount: number;
}

export interface PrinterConfig {
  printerName: string;
  connectionType: 'browser' | 'usb_hid' | 'lan_ip';
  paperWidth: '58mm' | '80mm';
  ipAddress?: string;
  port?: number;
  autoCut: boolean;
  beepOnPrint: boolean;
  customHeader: string;
  customFooter: string;
  copiesCount: number;
  printLogo: boolean;
  printQrCode: boolean;
}

export interface ClinicState {
  currentClinic: ClinicProfile;
  currentUser: StaffMember | null;
  staffList: StaffMember[];
  patients: Patient[];
  queue: QueueTicket[];
  wards: WardRoom[];
  services: MedicalService[];
  consultations: ConsultationRecord[];
  labOrders: LabTestOrder[];
  pharmacy: PharmacyItem[];
  transactions: PaymentTransaction[];
  printerConfig: PrinterConfig;
  customProtocols?: ClinicalProtocol[];
  tidbConfig?: TiDBConfig;
}
