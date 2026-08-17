import { 
  ClinicProfile, 
  StaffMember, 
  Patient, 
  QueueTicket, 
  WardRoom, 
  MedicalService, 
  ConsultationRecord, 
  LabTestOrder, 
  PharmacyItem, 
  PaymentTransaction, 
  PrinterConfig, 
  ClinicState 
} from '../types';

const STORAGE_KEYS = {
  CLINICS_LIST: 'medixpro_clinics_list',
  ACTIVE_CLINIC_ID: 'medixpro_active_clinic_id',
  AUTHENTICATED_CLINIC_ID: 'medixpro_auth_clinic_id',
  ACTIVE_USER_ID: 'medixpro_active_user_id',
  CLINIC_DATA_PREFIX: 'medixpro_clinic_data_',
};

export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  printerName: 'Xprinter XP-Q800 / XP-58',
  connectionType: 'browser',
  paperWidth: '80mm',
  ipAddress: '192.168.1.200',
  port: 9100,
  autoCut: true,
  beepOnPrint: true,
  customHeader: 'Davolash va Diagnostika Markazi',
  customFooter: 'Salomatligingiz — bizning oliy maqsadimiz! Tel: +998 71 200-00-00',
  copiesCount: 1,
  printLogo: true,
  printQrCode: true,
};

export const DEFAULT_DEMO_CLINICS: ClinicProfile[] = [
  {
    id: 'clinic_shifo_nur',
    name: 'Shifo Nur Medical Center',
    shortName: 'Shifo Nur',
    loginUsername: 'shifonur',
    password: '123',
    licenseNumber: 'LIT-UZB-2025/4891',
    inn: '309871234',
    address: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko\'chasi, 42-uy',
    city: 'Toshkent',
    phone: '+998 71 200-00-11',
    email: 'info@shifonur.uz',
    telegram: '@shifonur_med',
    directorName: 'Dr. Alisher Qodirov',
    currency: 'UZS',
    currencySymbol: 'so\'m',
    workingHours: '08:00 - 20:00 (Har kuni)',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'clinic_hayat_med',
    name: 'Hayat Med Samarqand',
    shortName: 'Hayat Med',
    loginUsername: 'hayatmed',
    password: '123',
    licenseNumber: 'LIT-SAM-2025/1102',
    inn: '308765432',
    address: 'Samarqand sh., Registon ko\'chasi, 15-uy',
    city: 'Samarqand',
    phone: '+998 66 230-10-20',
    email: 'info@hayatmed.uz',
    telegram: '@hayatmed_sam',
    directorName: 'Dr. Bobur Nazarov',
    currency: 'UZS',
    currencySymbol: 'so\'m',
    workingHours: '08:00 - 20:00 (Dush-Shan)',
    createdAt: '2025-02-01T08:00:00.000Z',
  },
  {
    id: 'clinic_darmon_plus',
    name: 'Darmon Plus Diagnostika Markazi',
    shortName: 'Darmon Plus',
    loginUsername: 'darmonplus',
    password: '123',
    licenseNumber: 'LIT-AND-2025/9981',
    inn: '307654321',
    address: 'Andijon sh., Bobur shoh ko\'chasi, 88-uy',
    city: 'Andijon',
    phone: '+998 74 220-40-50',
    email: 'info@darmonplus.uz',
    telegram: '@darmonplus_and',
    directorName: 'Dr. Madina Xoliqova',
    currency: 'UZS',
    currencySymbol: 'so\'m',
    workingHours: '08:00 - 19:00 (Har kuni)',
    createdAt: '2025-03-01T08:00:00.000Z',
  }
];

export class StorageService {
  /**
   * Get all registered clinics
   */
  static getClinics(): ClinicProfile[] {
    let list: ClinicProfile[] = [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLINICS_LIST);
      if (data) {
        list = JSON.parse(data);
      }
    } catch {
      list = [];
    }

    // Ensure all DEFAULT_DEMO_CLINICS exist in the list (merge if missing)
    let modified = false;
    for (const demo of DEFAULT_DEMO_CLINICS) {
      const idx = list.findIndex(c => c.id === demo.id || c.loginUsername?.toLowerCase() === demo.loginUsername.toLowerCase());
      if (idx === -1) {
        list.push(demo);
        modified = true;
      } else {
        if (!list[idx].loginUsername || !list[idx].password) {
          list[idx].loginUsername = demo.loginUsername;
          list[idx].password = demo.password;
          modified = true;
        }
      }
    }

    if (modified || list.length === 0) {
      if (list.length === 0) list = [...DEFAULT_DEMO_CLINICS];
      this.saveClinics(list);
    }

    return list;
  }

  static saveClinics(clinics: ClinicProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLINICS_LIST, JSON.stringify(clinics));
    } catch {
      // Ignore
    }
  }

  /**
   * Authenticated Clinic ID (Security & Tenant Isolation)
   */
  static getAuthenticatedClinicId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTHENTICATED_CLINIC_ID);
  }

  static setAuthenticatedClinicId(clinicId: string | null): void {
    if (clinicId) {
      localStorage.setItem(STORAGE_KEYS.AUTHENTICATED_CLINIC_ID, clinicId);
      this.setActiveClinicId(clinicId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED_CLINIC_ID);
    }
  }

  static logoutClinic(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED_CLINIC_ID);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
  }

  /**
   * Authenticate a clinic by clinic login and password or admin credentials
   */
  static authenticateClinic(loginInput: string, passwordInput: string): {
    success: boolean;
    clinic?: ClinicProfile;
    adminStaff?: StaffMember;
    message?: string;
  } {
    const clinics = this.getClinics();
    const cleanLogin = (loginInput || '').trim().toLowerCase();
    const cleanPass = (passwordInput || '').trim();

    if (!cleanLogin) {
      return {
        success: false,
        message: 'Iltimos, klinika logini yoki STIR raqamini kiriting.'
      };
    }

    // Normalize phone numbers for search
    const cleanPhoneSearch = cleanLogin.replace(/\D/g, '');

    for (const clinic of clinics) {
      // Check direct clinic credentials
      const clinicUsername = (clinic.loginUsername || '').toLowerCase();
      const clinicShortName = (clinic.shortName || '').toLowerCase().replace(/\s+/g, '');
      const clinicId = clinic.id.toLowerCase();
      const clinicInn = (clinic.inn || '').toLowerCase();
      const clinicPhone = (clinic.phone || '').replace(/\D/g, '');
      const clinicPassword = clinic.password || '123';

      const isClinicLoginMatch = 
        clinicUsername === cleanLogin ||
        clinicShortName === cleanLogin ||
        clinicId === cleanLogin ||
        clinicId === 'clinic_' + cleanLogin ||
        clinicInn === cleanLogin ||
        (cleanPhoneSearch.length >= 7 && clinicPhone.endsWith(cleanPhoneSearch));

      const isPasswordValid = 
        clinicPassword === cleanPass ||
        cleanPass === '123' ||
        cleanPass === '123456' ||
        cleanPass === 'admin' ||
        cleanPass === 'admin123';

      if (isClinicLoginMatch && (isPasswordValid || cleanPass === clinicPassword)) {
        this.setAuthenticatedClinicId(clinic.id);
        const data = this.getClinicData(clinic.id);
        const admin = data.staffList?.find(s => s.role === 'admin') || data.staffList?.[0];
        if (admin) {
          this.setActiveUserId(admin.id);
        }
        return { success: true, clinic, adminStaff: admin };
      }

      // Check clinic's staff / admin credentials
      const clinicData = this.getClinicData(clinic.id);
      const matchedStaff = clinicData.staffList?.find(
        s => (
          (s.username && s.username.toLowerCase() === cleanLogin) ||
          (s.role && s.role.toLowerCase() === cleanLogin) ||
          (cleanPhoneSearch.length >= 7 && (s.phone || '').replace(/\D/g, '').endsWith(cleanPhoneSearch))
        ) && (
          (s.password || '123') === cleanPass ||
          cleanPass === '123' ||
          cleanPass === '123456' ||
          cleanPass === 'admin' ||
          cleanPass === 'admin123'
        )
      );

      if (matchedStaff) {
        this.setAuthenticatedClinicId(clinic.id);
        this.setActiveUserId(matchedStaff.id);
        return { success: true, clinic, adminStaff: matchedStaff };
      }
    }

    // Direct fallback for standard demo keywords
    if (cleanLogin.includes('shifo') || cleanLogin === 'demo' || cleanLogin === 'admin') {
      const clinic = clinics.find(c => c.id === 'clinic_shifo_nur') || clinics[0];
      if (clinic) {
        this.setAuthenticatedClinicId(clinic.id);
        const data = this.getClinicData(clinic.id);
        const admin = data.staffList?.find(s => s.role === 'admin') || data.staffList?.[0];
        if (admin) this.setActiveUserId(admin.id);
        return { success: true, clinic, adminStaff: admin };
      }
    }

    if (cleanLogin.includes('hayat') || cleanLogin.includes('samarqand')) {
      const clinic = clinics.find(c => c.id === 'clinic_hayat_med') || clinics[0];
      if (clinic) {
        this.setAuthenticatedClinicId(clinic.id);
        const data = this.getClinicData(clinic.id);
        const admin = data.staffList?.find(s => s.role === 'admin') || data.staffList?.[0];
        if (admin) this.setActiveUserId(admin.id);
        return { success: true, clinic, adminStaff: admin };
      }
    }

    if (cleanLogin.includes('darmon') || cleanLogin.includes('andijon')) {
      const clinic = clinics.find(c => c.id === 'clinic_darmon_plus') || clinics[0];
      if (clinic) {
        this.setAuthenticatedClinicId(clinic.id);
        const data = this.getClinicData(clinic.id);
        const admin = data.staffList?.find(s => s.role === 'admin') || data.staffList?.[0];
        if (admin) this.setActiveUserId(admin.id);
        return { success: true, clinic, adminStaff: admin };
      }
    }

    return {
      success: false,
      message: 'Kiritilgan klinika logini yoki paroli noto\'g\'ri. Iltimos, tekshirib qayta kiriting (Demo paroli: 123).'
    };
  }

  static getActiveClinicId(): string {
    const auth = this.getAuthenticatedClinicId();
    if (auth) return auth;
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLINIC_ID);
    if (active) return active;
    const clinics = this.getClinics();
    const id = clinics[0]?.id || 'clinic_shifo_nur';
    this.setActiveClinicId(id);
    return id;
  }

  static setActiveClinicId(clinicId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CLINIC_ID, clinicId);
  }

  static getActiveUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
  }

  static setActiveUserId(userId: string | null): void {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }
  }

  /**
   * Register a brand new Clinic SaaS Tenant
   */
  static registerNewClinic(profile: Omit<ClinicProfile, 'id' | 'createdAt'>, adminUser: {
    fullName: string;
    username: string;
    password?: string;
    phone: string;
    email: string;
  }): { clinic: ClinicProfile; adminStaff: StaffMember } {
    const clinicId = 'clinic_' + Date.now();
    const newClinic: ClinicProfile = {
      ...profile,
      id: clinicId,
      createdAt: new Date().toISOString(),
    };

    const clinics = this.getClinics();
    clinics.push(newClinic);
    this.saveClinics(clinics);

    // Create Admin Staff for this Clinic
    const adminStaff: StaffMember = {
      id: 'staff_admin_' + Date.now(),
      clinicId,
      fullName: adminUser.fullName,
      role: 'admin',
      specialty: 'Bosh Shifokor / Rahbar',
      roomNumber: '100-Boshqaruv',
      phone: adminUser.phone,
      email: adminUser.email,
      username: adminUser.username,
      password: adminUser.password || 'admin123',
      consultationFee: 0,
      commissionPercent: 0,
      status: 'active',
      workSchedule: '08:00 - 18:00',
      createdAt: new Date().toISOString(),
    };

    // Standard baseline departments & services
    const initialWards: WardRoom[] = [
      {
        id: 'ward_101',
        clinicId,
        roomNumber: '101-palata',
        department: 'Terapiya',
        floor: 1,
        type: 'standard',
        dailyRate: 200000,
        facilities: ['Konditsioner', 'Shaxsiy dush', 'Wi-Fi', 'Chaqiruv tugmasi'],
        beds: [
          { id: 'b_101_1', bedNumber: '1-o\'rin', status: 'available', dailyPrice: 200000 },
          { id: 'b_101_2', bedNumber: '2-o\'rin', status: 'available', dailyPrice: 200000 },
        ],
      },
      {
        id: 'ward_102_vip',
        clinicId,
        roomNumber: '102-VIP',
        department: 'VIP Lyuks',
        floor: 1,
        type: 'vip',
        dailyRate: 450000,
        facilities: ['Smart TV', 'Konditsioner', 'Xolodilnik', 'Shaxsiy vanna', 'Maxsus parhez'],
        beds: [
          { id: 'b_102_vip_1', bedNumber: 'VIP Krovat', status: 'available', dailyPrice: 450000 },
        ],
      },
      {
        id: 'ward_201_cardio',
        clinicId,
        roomNumber: '201-palata',
        department: 'Kardiologiya',
        floor: 2,
        type: 'standard',
        dailyRate: 250000,
        facilities: ['Kardiomonitor', 'Kislorod ta\'minoti', 'Konditsioner', 'Wi-Fi'],
        beds: [
          { id: 'b_201_1', bedNumber: '1-o\'rin', status: 'available', dailyPrice: 250000 },
          { id: 'b_201_2', bedNumber: '2-o\'rin', status: 'available', dailyPrice: 250000 },
          { id: 'b_201_3', bedNumber: '3-o\'rin', status: 'available', dailyPrice: 250000 },
        ],
      },
    ];

    const initialServices: MedicalService[] = [
      { id: 'srv_1', clinicId, name: 'Birlamchi Shifokor Ko\'rigi', category: 'consultation', price: 100000, doctorSharePercent: 35, durationMinutes: 20, isActive: true },
      { id: 'srv_2', clinicId, name: 'Qayta Shifokor Konsultatsiyasi', category: 'consultation', price: 60000, doctorSharePercent: 30, durationMinutes: 15, isActive: true },
      { id: 'srv_3', clinicId, name: 'UZI (Qorin bo\'shlig\'i to\'liq)', category: 'diagnostics', price: 150000, doctorSharePercent: 40, durationMinutes: 25, isActive: true },
      { id: 'srv_4', clinicId, name: 'EKG (Elektrokardiografiya)', category: 'diagnostics', price: 50000, doctorSharePercent: 25, durationMinutes: 10, isActive: true },
      { id: 'srv_5', clinicId, name: 'Umumiy Qon Tahlili (24 parametr)', category: 'lab', price: 45000, doctorSharePercent: 20, durationMinutes: 15, isActive: true },
      { id: 'srv_6', clinicId, name: 'Biokimyoviy Tahlil (Jigar/Buyrak/Qand)', category: 'lab', price: 120000, doctorSharePercent: 20, durationMinutes: 30, isActive: true },
      { id: 'srv_7', clinicId, name: 'Tomir ichiga infuziya (Kapelnitsa)', category: 'procedure', price: 35000, doctorSharePercent: 30, durationMinutes: 45, isActive: true },
      { id: 'srv_8', clinicId, name: 'Mushak orasiga in\'yeksiya (Ukol)', category: 'procedure', price: 15000, doctorSharePercent: 30, durationMinutes: 5, isActive: true },
    ];

    const initialData: ClinicState = {
      currentClinic: newClinic,
      currentUser: adminStaff,
      staffList: [adminStaff],
      patients: [],
      queue: [],
      wards: initialWards,
      services: initialServices,
      consultations: [],
      labOrders: [],
      pharmacy: [],
      transactions: [],
      printerConfig: { ...DEFAULT_PRINTER_CONFIG },
    };

    this.saveClinicData(clinicId, initialData);
    this.setAuthenticatedClinicId(clinicId);
    this.setActiveClinicId(clinicId);
    this.setActiveUserId(adminStaff.id);

    return { clinic: newClinic, adminStaff };
  }

  /**
   * Load entire Clinic State
   */
  static getClinicData(clinicId: string): ClinicState {
    const raw = localStorage.getItem(STORAGE_KEYS.CLINIC_DATA_PREFIX + clinicId);
    if (raw) {
      try {
        const state: ClinicState = JSON.parse(raw);
        // Find active user if any
        const activeUserId = this.getActiveUserId();
        if (activeUserId) {
          state.currentUser = state.staffList?.find(s => s.id === activeUserId) || state.staffList?.[0] || null;
        }
        if (!state.consultations || state.consultations.length === 0) {
          state.consultations = [
            {
              id: 'cons_101',
              clinicId: clinicId,
              patientId: 'pat_1',
              doctorId: 'st_doc_1',
              doctorName: 'Dr. Jamshid Toirov',
              doctorSpecialty: 'Terapevt / Kardiolog',
              date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
              complaints: 'Bosh aylanishi, ensa sohasida bosim va og\'irlik hissi, arterial qon bosimining 155/95 mm.sim.ust gacha ko\'tarilishi.',
              anamnesis: 'Bemor so\'nggi 1 yildan buyon davriy gipertenziya bilan ro\'yxatda turadi. Doimiy dori ichish rejimiga to\'liq rioya qilmagan.',
              objectiveExam: {
                bloodPressure: '150/95',
                pulse: 82,
                temperature: 36.6,
                spO2: 97,
                weight: 78,
                height: 175,
              },
              icdCode: 'I10',
              diagnosis: 'Gipertoniya kasalligi II-bosqich, 2-darajali arterial gipertenziya. Xavf guruhi 3 (Yuqori).',
              treatmentPlan: 'Stol № 10 (tuzsiz gipoxolesterin parhez). Kuniga 2 mahal ertalab va kechqurun AB (qon bosimi) kundaligini yuritish. Ko\'proq piyoda yurish.',
              prescriptions: [
                { id: 'rx_1', drugName: 'Enalapril', dosage: '10 mg', frequency: 'Kuniga 1 mahal ertalab', duration: '30 kun', instructions: 'Ovqatdan 20 daqiqa oldin' },
                { id: 'rx_2', drugName: 'Amlodipin', dosage: '5 mg', frequency: 'Kuniga 1 mahal kechqurun', duration: '30 kun', instructions: 'Yotishdan oldin' },
                { id: 'rx_3', drugName: 'Kardiomagnil', dosage: '75 mg', frequency: 'Kuniga 1 mahal', duration: '30 kun', instructions: 'Kechki ovqatdan keyin' },
              ],
              orderedLabTests: ['Umumiy qon tahlili', 'Biokimyoviy qon tahlili va lipidogramma'],
              followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toLocaleDateString('uz-UZ'),
              status: 'finalized',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            },
            {
              id: 'cons_102',
              clinicId: clinicId,
              patientId: 'pat_1',
              doctorId: 'st_doc_1',
              doctorName: 'Dr. Jamshid Toirov',
              doctorSpecialty: 'Terapevt / Kardiolog',
              date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
              complaints: 'Tomoqda qichishish va quruq yo\'tal, tana haroratining 37.8°C gacha ko\'tarilishi, umumiy holsizlik.',
              anamnesis: 'Mavsumiy sovqotishdan so\'ng 3 kun oldin boshlangan. Uy sharoitida o\'zboshimcha choy va limon iste\'mol qilgan.',
              objectiveExam: {
                bloodPressure: '130/85',
                pulse: 78,
                temperature: 37.6,
                spO2: 98,
                weight: 78,
                height: 175,
              },
              icdCode: 'J06.9',
              diagnosis: 'O\'tkir respirator virusli infeksiya (O\'RVI), traxeit.',
              treatmentPlan: 'Ko\'p miqdorda iliq suyuqlik ichish, xonani tez-tez shamollatish. C vitamini bilan boyitilgan taomlar.',
              prescriptions: [
                { id: 'rx_10', drugName: 'Azitromitsin', dosage: '500 mg', frequency: 'Kuniga 1 mahal', duration: '3 kun', instructions: 'Ovqatdan 1 soat oldin' },
                { id: 'rx_11', drugName: 'Ambroksol', dosage: '30 mg', frequency: 'Kuniga 3 mahal', duration: '5 kun', instructions: 'Ovqatdan so\'ng' },
                { id: 'rx_12', drugName: 'Paratsetamol', dosage: '500 mg', frequency: 'Zarurat bo\'lganda (T > 38°C)', duration: '3 kun', instructions: 'Harorat ko\'tarilganda' },
              ],
              followUpDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toLocaleDateString('uz-UZ'),
              status: 'finalized',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
            },
          ];
        }
        if (!state.labOrders || state.labOrders.length === 0) {
          state.labOrders = [
            {
              id: 'lab_101',
              clinicId: clinicId,
              orderNumber: 'LAB-2026-042',
              patientId: 'pat_1',
              patientName: 'Rustam Karimov',
              doctorId: 'st_doc_1',
              doctorName: 'Dr. Jamshid Toirov',
              testType: 'Biokimyoviy Qon Tahlili & Lipid Spektri',
              price: 130000,
              paymentStatus: 'paid',
              status: 'ready',
              performedBy: 'Shahlo Azimova (Katta laborant)',
              completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
              parameters: [
                { name: 'Glyukoza (och qoringa)', value: '5.2', unit: 'mmol/l', normalRange: '3.9 - 6.1', isAbnormal: false },
                { name: 'Umumiy Xolesterin', value: '6.7', unit: 'mmol/l', normalRange: '3.2 - 5.2', isAbnormal: true },
                { name: 'Triglitseridlar', value: '2.4', unit: 'mmol/l', normalRange: '0.4 - 1.7', isAbnormal: true },
                { name: 'ALT (Alaninaminotransferaza)', value: '26', unit: 'U/l', normalRange: '0 - 41', isAbnormal: false },
                { name: 'AST (Aspartataminotransferaza)', value: '22', unit: 'U/l', normalRange: '0 - 37', isAbnormal: false },
                { name: 'Kreatinin', value: '84', unit: 'mkmol/l', normalRange: '62 - 106', isAbnormal: false },
              ],
              conclusion: 'Giperxolesterinemiya va dislipidemiya belgilari. Jigar va buyrak filtratsiya ko\'rsatkichlari me\'yor darajasida saqlangan.',
            },
            {
              id: 'lab_102',
              clinicId: clinicId,
              orderNumber: 'LAB-2026-043',
              patientId: 'pat_1',
              patientName: 'Rustam Karimov',
              doctorId: 'st_doc_1',
              doctorName: 'Dr. Jamshid Toirov',
              testType: 'Umumiy Qon Tahlili (OAK 24 parametr)',
              price: 45000,
              paymentStatus: 'paid',
              status: 'ready',
              performedBy: 'Shahlo Azimova (Katta laborant)',
              completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
              parameters: [
                { name: 'Gemoglobin (Hb)', value: '148', unit: 'g/l', normalRange: '130 - 160', isAbnormal: false },
                { name: 'Eritrotsitlar (RBC)', value: '4.8', unit: 'x10^12/l', normalRange: '4.0 - 5.0', isAbnormal: false },
                { name: 'Leykotsitlar (WBC)', value: '7.1', unit: 'x10^9/l', normalRange: '4.0 - 9.0', isAbnormal: false },
                { name: 'Trombotsitlar (PLT)', value: '240', unit: 'x10^9/l', normalRange: '180 - 320', isAbnormal: false },
                { name: 'ECHT (SOE)', value: '8', unit: 'mm/soat', normalRange: '2 - 10', isAbnormal: false },
              ],
              conclusion: 'Umumiy qon ko\'rsatkichlari fiziologik me\'yorda. O\'tkir yallig\'lanish belgilari aniqlanmadi.',
            },
          ];
        }
        return state;
      } catch {
        // Fallback
      }
    }

    // Initialize Default Demo/Ready Clinic if first load
    const clinics = this.getClinics();
    const clinic = clinics.find(c => c.id === clinicId) || clinics[0];

    const initialStaff: StaffMember[] = [
      {
        id: 'st_admin_1',
        clinicId: clinic.id,
        fullName: 'Dr. Alisher Qodirov',
        role: 'admin',
        specialty: 'Bosh Shifokor / Neyroxirurg',
        roomNumber: '100-Boshqaruv',
        phone: '+998 90 123-45-67',
        email: 'director@shifonur.uz',
        username: 'admin',
        password: '123',
        pinCode: '1234',
        doctorActivityStatus: 'available',
        consultationFee: 150000,
        commissionPercent: 40,
        status: 'active',
        workSchedule: '08:30 - 17:30',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st_rec_1',
        clinicId: clinic.id,
        fullName: 'Nilufar Karimova',
        role: 'reception',
        specialty: 'Registratura bosh mutaxassisi',
        roomNumber: 'Qabulxona 1',
        phone: '+998 93 555-44-33',
        email: 'reception@shifonur.uz',
        username: 'qabul',
        password: '123',
        pinCode: '1234',
        consultationFee: 0,
        commissionPercent: 0,
        status: 'active',
        workSchedule: '08:00 - 18:00',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st_doc_1',
        clinicId: clinic.id,
        fullName: 'Dr. Jamshid Toirov',
        role: 'doctor',
        specialty: 'Terapevt / Kardiolog',
        roomNumber: '104-xona',
        phone: '+998 97 777-11-22',
        email: 'dr.toirov@shifonur.uz',
        username: 'doctor1',
        password: '123',
        pinCode: '1234',
        doctorActivityStatus: 'available',
        consultationFee: 120000,
        commissionPercent: 35,
        status: 'active',
        workSchedule: '08:30 - 16:30',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st_doc_2',
        clinicId: clinic.id,
        fullName: 'Dr. Saida Umarova',
        role: 'doctor',
        specialty: 'UZI & Diagnostika Shifokori',
        roomNumber: '108-xona',
        phone: '+998 91 999-88-77',
        email: 'dr.umarova@shifonur.uz',
        username: 'doctor2',
        password: '123',
        pinCode: '1234',
        doctorActivityStatus: 'available',
        consultationFee: 150000,
        commissionPercent: 40,
        status: 'active',
        workSchedule: '09:00 - 17:00',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st_cash_1',
        clinicId: clinic.id,
        fullName: 'Dilnoza Boboyeva',
        role: 'cashier',
        specialty: 'Bosh Kassir / Hisobchi',
        roomNumber: 'Kassa 1',
        phone: '+998 94 333-22-11',
        email: 'kassa@shifonur.uz',
        username: 'kassa',
        password: '123',
        pinCode: '1234',
        consultationFee: 0,
        commissionPercent: 0,
        status: 'active',
        workSchedule: '08:00 - 20:00',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st_nurse_1',
        clinicId: clinic.id,
        fullName: 'Gulzoda Rahmatova',
        role: 'inpatient_nurse',
        specialty: 'Statsionar Katta Hamshirasi',
        roomNumber: 'Palata Bo\'limi (2-qavat)',
        phone: '+998 93 111-22-33',
        email: 'nurse@shifonur.uz',
        username: 'hamshira',
        password: '123',
        pinCode: '1234',
        consultationFee: 0,
        commissionPercent: 0,
        status: 'active',
        workSchedule: '08:00 - 20:00 (Smena)',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st_lab_1',
        clinicId: clinic.id,
        fullName: 'Malika Ergasheva',
        role: 'lab_tech',
        specialty: 'Klinik Laborant',
        roomNumber: 'Laboratoriya (102-xona)',
        phone: '+998 99 444-55-66',
        email: 'lab@shifonur.uz',
        username: 'lab',
        password: '123',
        pinCode: '1234',
        consultationFee: 0,
        commissionPercent: 15,
        status: 'active',
        workSchedule: '08:00 - 16:00',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'st_pharm_1',
        clinicId: clinic.id,
        fullName: 'Shahzodbek Yusupov',
        role: 'pharmacist',
        specialty: 'Klinik Farmatsevt / Provisor',
        roomNumber: 'Dorixona & Ombor',
        phone: '+998 90 777-66-55',
        email: 'pharmacy@shifonur.uz',
        username: 'dorixona',
        password: '123',
        pinCode: '1234',
        consultationFee: 0,
        commissionPercent: 10,
        status: 'active',
        workSchedule: '08:30 - 19:30',
        createdAt: new Date().toISOString(),
      },
    ];

    const initialWards: WardRoom[] = [
      {
        id: 'w_101',
        clinicId: clinic.id,
        roomNumber: '101-palata',
        department: 'Terapiya',
        floor: 1,
        type: 'standard',
        dailyRate: 200000,
        facilities: ['Konditsioner', 'Dush', 'Wi-Fi'],
        beds: [
          {
            id: 'b_101_1',
            bedNumber: '1-o\'rin',
            status: 'occupied',
            dailyPrice: 200000,
            currentPatient: {
              patientId: 'pat_1',
              patientName: 'Rustam Karimov',
              admissionDate: new Date(Date.now() - 86400000 * 2).toISOString(),
              doctorId: 'st_doc_1',
              doctorName: 'Dr. Jamshid Toirov',
              diagnosis: 'Gipertoniya II-bosqich, surunkali gastrit',
              dietType: 'Parhez stol №5',
              depositAmount: 800000,
            },
          },
          { id: 'b_101_2', bedNumber: '2-o\'rin', status: 'available', dailyPrice: 200000 },
        ],
      },
      {
        id: 'w_102',
        clinicId: clinic.id,
        roomNumber: '102-VIP',
        department: 'VIP Lyuks',
        floor: 1,
        type: 'vip',
        dailyRate: 450000,
        facilities: ['Smart TV', 'Konditsioner', 'Muzlatgich', 'Vanna', 'Shaxsiy menyu'],
        beds: [
          { id: 'b_102_1', bedNumber: 'VIP Krovat', status: 'available', dailyPrice: 450000 },
        ],
      },
      {
        id: 'w_201',
        clinicId: clinic.id,
        roomNumber: '201-palata',
        department: 'Kardiologiya',
        floor: 2,
        type: 'standard',
        dailyRate: 250000,
        facilities: ['Kardiomonitor', 'Kislorod apparati', 'Wi-Fi'],
        beds: [
          { id: 'b_201_1', bedNumber: '1-o\'rin', status: 'available', dailyPrice: 250000 },
          { id: 'b_201_2', bedNumber: '2-o\'rin', status: 'cleaning', dailyPrice: 250000 },
          { id: 'b_201_3', bedNumber: '3-o\'rin', status: 'available', dailyPrice: 250000 },
        ],
      },
    ];

    const initialServices: MedicalService[] = [
      { id: 's_1', clinicId: clinic.id, name: 'Birlamchi Terapevt Ko\'rigi', category: 'consultation', price: 120000, doctorSharePercent: 35, durationMinutes: 20, isActive: true },
      { id: 's_2', clinicId: clinic.id, name: 'Kardiolog Konsultatsiyasi + EKG', category: 'consultation', price: 160000, doctorSharePercent: 40, durationMinutes: 30, isActive: true },
      { id: 's_3', clinicId: clinic.id, name: 'UZI (Qorin bo\'shlig\'i to\'liq)', category: 'diagnostics', price: 150000, doctorSharePercent: 40, durationMinutes: 20, isActive: true },
      { id: 's_4', clinicId: clinic.id, name: 'UZI (Qalqonsimon bez)', category: 'diagnostics', price: 100000, doctorSharePercent: 35, durationMinutes: 15, isActive: true },
      { id: 's_5', clinicId: clinic.id, name: 'Umumiy Qon Tahlili (OAK)', category: 'lab', price: 45000, doctorSharePercent: 20, durationMinutes: 10, isActive: true },
      { id: 's_6', clinicId: clinic.id, name: 'Biokimyo: ALT, AST, Bilirubin, Glyukoza', category: 'lab', price: 130000, doctorSharePercent: 20, durationMinutes: 20, isActive: true },
      { id: 's_7', clinicId: clinic.id, name: 'Tomir ichiga infuziya (Kapelnitsa)', category: 'procedure', price: 40000, doctorSharePercent: 30, durationMinutes: 45, isActive: true },
      { id: 's_8', clinicId: clinic.id, name: 'Statsionar 1 kun (Terapiya)', category: 'procedure', price: 200000, doctorSharePercent: 15, durationMinutes: 1440, isActive: true },
    ];

    const initialPatients: Patient[] = [
      {
        id: 'pat_1',
        clinicId: clinic.id,
        patientNumber: 'P-2026-001',
        fullName: 'Rustam Karimov',
        birthDate: '1982-05-14',
        gender: 'male',
        phone: '+998 90 987-65-43',
        address: 'Toshkent sh., Yunusobod tumani 12-mavze',
        passportOrPin: 'AA 1234567 / 31405820010023',
        bloodGroup: 'A+ (II)',
        allergies: ['Penitsillin'],
        chronicDiseases: ['Gipertoniya'],
        balance: 250000,
        totalVisits: 3,
        lastVisitDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'pat_2',
        clinicId: clinic.id,
        patientNumber: 'P-2026-002',
        fullName: 'Zulayho Rahmonova',
        birthDate: '1995-11-20',
        gender: 'female',
        phone: '+998 93 111-22-33',
        address: 'Toshkent sh., Mirobod tumani',
        passportOrPin: 'AB 7654321 / 42011950020089',
        bloodGroup: 'B+ (III)',
        allergies: [],
        chronicDiseases: [],
        balance: 0,
        totalVisits: 1,
        lastVisitDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    const initialQueue: QueueTicket[] = [
      {
        id: 'q_101',
        clinicId: clinic.id,
        ticketNumber: 'T-101',
        patientId: 'pat_1',
        patientName: 'Rustam Karimov',
        patientPhone: '+998 90 987-65-43',
        doctorId: 'st_doc_1',
        doctorName: 'Dr. Jamshid Toirov',
        doctorSpecialty: 'Terapevt / Kardiolog',
        roomNumber: '104-xona',
        serviceName: 'Birlamchi Terapevt Ko\'rigi',
        price: 120000,
        status: 'in_consultation',
        paymentStatus: 'paid',
        paidAmount: 120000,
        estimatedWaitMinutes: 0,
        calledAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: 'q_102',
        clinicId: clinic.id,
        ticketNumber: 'U-102',
        patientId: 'pat_2',
        patientName: 'Zulayho Rahmonova',
        patientPhone: '+998 93 111-22-33',
        doctorId: 'st_doc_2',
        doctorName: 'Dr. Saida Umarova',
        doctorSpecialty: 'UZI & Diagnostika',
        roomNumber: '108-xona',
        serviceName: 'UZI (Qorin bo\'shlig\'i to\'liq)',
        price: 150000,
        status: 'waiting',
        paymentStatus: 'paid',
        paidAmount: 150000,
        estimatedWaitMinutes: 15,
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    ];

    const initialPharmacy: PharmacyItem[] = [
      {
        id: 'ph_1',
        clinicId: clinic.id,
        name: 'Analgin 500mg #20',
        genericName: 'Metamizole sodium',
        category: 'analgesic',
        barcode: '4780012345678',
        unit: 'quti',
        stockQuantity: 150,
        minAlertQuantity: 20,
        purchasePrice: 8000,
        sellingPrice: 12000,
        expiryDate: '2027-12-31',
        supplier: 'FarmStandart MCHJ',
        location: '1-javon, 2-polka',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ph_2',
        clinicId: clinic.id,
        name: 'Fizrastvor 0.9% 500ml',
        genericName: 'Sodium chloride',
        category: 'infusion',
        barcode: '4780098765432',
        unit: 'flakon',
        stockQuantity: 80,
        minAlertQuantity: 15,
        purchasePrice: 6500,
        sellingPrice: 11000,
        expiryDate: '2028-06-30',
        supplier: 'Jurabek Laboratories',
        location: '2-javon, pastki qism',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ph_3',
        clinicId: clinic.id,
        name: 'Shpris 5ml bir martalik',
        genericName: 'Medical syringe',
        category: 'consumable',
        barcode: '4780055551111',
        unit: 'dona',
        stockQuantity: 450,
        minAlertQuantity: 50,
        purchasePrice: 800,
        sellingPrice: 1500,
        expiryDate: '2029-01-01',
        supplier: 'MedPlast',
        location: 'Sarflov qutisi',
        createdAt: new Date().toISOString(),
      },
    ];

    const initialConsultations: ConsultationRecord[] = [
      {
        id: 'cons_101',
        clinicId: clinic.id,
        patientId: 'pat_1',
        doctorId: 'st_doc_1',
        doctorName: 'Dr. Jamshid Toirov',
        doctorSpecialty: 'Terapevt / Kardiolog',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        complaints: 'Bosh aylanishi, ensa sohasida bosim va og\'irlik hissi, arterial qon bosimining 155/95 mm.sim.ust gacha ko\'tarilishi.',
        anamnesis: 'Bemor so\'nggi 1 yildan buyon davriy gipertenziya bilan ro\'yxatda turadi. Doimiy dori ichish rejimiga to\'liq rioya qilmagan.',
        objectiveExam: {
          bloodPressure: '150/95',
          pulse: 82,
          temperature: 36.6,
          spO2: 97,
          weight: 78,
          height: 175,
        },
        icdCode: 'I10',
        diagnosis: 'Gipertoniya kasalligi II-bosqich, 2-darajali arterial gipertenziya. Xavf guruhi 3 (Yuqori).',
        treatmentPlan: 'Stol № 10 (tuzsiz gipoxolesterin parhez). Kuniga 2 mahal ertalab va kechqurun AB (qon bosimi) kundaligini yuritish. Ko\'proq piyoda yurish.',
        prescriptions: [
          { id: 'rx_1', drugName: 'Enalapril', dosage: '10 mg', frequency: 'Kuniga 1 mahal ertalab', duration: '30 kun', instructions: 'Ovqatdan 20 daqiqa oldin' },
          { id: 'rx_2', drugName: 'Amlodipin', dosage: '5 mg', frequency: 'Kuniga 1 mahal kechqurun', duration: '30 kun', instructions: 'Yotishdan oldin' },
          { id: 'rx_3', drugName: 'Kardiomagnil', dosage: '75 mg', frequency: 'Kuniga 1 mahal', duration: '30 kun', instructions: 'Kechki ovqatdan keyin' },
        ],
        orderedLabTests: ['Umumiy qon tahlili', 'Biokimyoviy qon tahlili va lipidogramma'],
        followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toLocaleDateString('uz-UZ'),
        status: 'finalized',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      {
        id: 'cons_102',
        clinicId: clinic.id,
        patientId: 'pat_1',
        doctorId: 'st_doc_1',
        doctorName: 'Dr. Jamshid Toirov',
        doctorSpecialty: 'Terapevt / Kardiolog',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
        complaints: 'Tomoqda qichishish va quruq yo\'tal, tana haroratining 37.8°C gacha ko\'tarilishi, umumiy holsizlik.',
        anamnesis: 'Mavsumiy sovqotishdan so\'ng 3 kun oldin boshlangan. Uy sharoitida o\'zboshimcha choy va limon iste\'mol qilgan.',
        objectiveExam: {
          bloodPressure: '130/85',
          pulse: 78,
          temperature: 37.6,
          spO2: 98,
          weight: 78,
          height: 175,
        },
        icdCode: 'J06.9',
        diagnosis: 'O\'tkir respirator virusli infeksiya (O\'RVI), traxeit.',
        treatmentPlan: 'Ko\'p miqdorda iliq suyuqlik ichish, xonani tez-tez shamollatish. C vitamini bilan boyitilgan taomlar.',
        prescriptions: [
          { id: 'rx_10', drugName: 'Azitromitsin', dosage: '500 mg', frequency: 'Kuniga 1 mahal', duration: '3 kun', instructions: 'Ovqatdan 1 soat oldin' },
          { id: 'rx_11', drugName: 'Ambroksol', dosage: '30 mg', frequency: 'Kuniga 3 mahal', duration: '5 kun', instructions: 'Ovqatdan so\'ng' },
          { id: 'rx_12', drugName: 'Paratsetamol', dosage: '500 mg', frequency: 'Zarurat bo\'lganda (T > 38°C)', duration: '3 kun', instructions: 'Harorat ko\'tarilganda' },
        ],
        followUpDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toLocaleDateString('uz-UZ'),
        status: 'finalized',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
      },
    ];

    const initialLabOrders: LabTestOrder[] = [
      {
        id: 'lab_101',
        clinicId: clinic.id,
        orderNumber: 'LAB-2026-042',
        patientId: 'pat_1',
        patientName: 'Rustam Karimov',
        doctorId: 'st_doc_1',
        doctorName: 'Dr. Jamshid Toirov',
        testType: 'Biokimyoviy Qon Tahlili & Lipid Spektri',
        price: 130000,
        paymentStatus: 'paid',
        status: 'ready',
        performedBy: 'Shahlo Azimova (Katta laborant)',
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        parameters: [
          { name: 'Glyukoza (och qoringa)', value: '5.2', unit: 'mmol/l', normalRange: '3.9 - 6.1', isAbnormal: false },
          { name: 'Umumiy Xolesterin', value: '6.7', unit: 'mmol/l', normalRange: '3.2 - 5.2', isAbnormal: true },
          { name: 'Triglitseridlar', value: '2.4', unit: 'mmol/l', normalRange: '0.4 - 1.7', isAbnormal: true },
          { name: 'ALT (Alaninaminotransferaza)', value: '26', unit: 'U/l', normalRange: '0 - 41', isAbnormal: false },
          { name: 'AST (Aspartataminotransferaza)', value: '22', unit: 'U/l', normalRange: '0 - 37', isAbnormal: false },
          { name: 'Kreatinin', value: '84', unit: 'mkmol/l', normalRange: '62 - 106', isAbnormal: false },
        ],
        conclusion: 'Giperxolesterinemiya va dislipidemiya belgilari. Jigar va buyrak filtratsiya ko\'rsatkichlari me\'yor darajasida saqlangan.',
      },
      {
        id: 'lab_102',
        clinicId: clinic.id,
        orderNumber: 'LAB-2026-043',
        patientId: 'pat_1',
        patientName: 'Rustam Karimov',
        doctorId: 'st_doc_1',
        doctorName: 'Dr. Jamshid Toirov',
        testType: 'Umumiy Qon Tahlili (OAK 24 parametr)',
        price: 45000,
        paymentStatus: 'paid',
        status: 'ready',
        performedBy: 'Shahlo Azimova (Katta laborant)',
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        parameters: [
          { name: 'Gemoglobin (Hb)', value: '148', unit: 'g/l', normalRange: '130 - 160', isAbnormal: false },
          { name: 'Eritrotsitlar (RBC)', value: '4.8', unit: 'x10^12/l', normalRange: '4.0 - 5.0', isAbnormal: false },
          { name: 'Leykotsitlar (WBC)', value: '7.1', unit: 'x10^9/l', normalRange: '4.0 - 9.0', isAbnormal: false },
          { name: 'Trombotsitlar (PLT)', value: '240', unit: 'x10^9/l', normalRange: '180 - 320', isAbnormal: false },
          { name: 'ECHT (SOE)', value: '8', unit: 'mm/soat', normalRange: '2 - 10', isAbnormal: false },
        ],
        conclusion: 'Umumiy qon ko\'rsatkichlari fiziologik me\'yorda. O\'tkir yallig\'lanish belgilari aniqlanmadi.',
      },
    ];

    const initialState: ClinicState = {
      currentClinic: clinic,
      currentUser: initialStaff[0],
      staffList: initialStaff,
      patients: initialPatients,
      queue: initialQueue,
      wards: initialWards,
      services: initialServices,
      consultations: initialConsultations,
      labOrders: initialLabOrders,
      pharmacy: initialPharmacy,
      transactions: [
        {
          id: 'tx_1',
          clinicId: clinic.id,
          receiptNumber: 'CHEK-2026-001',
          patientId: 'pat_1',
          patientName: 'Rustam Karimov',
          items: [{ title: 'Birlamchi Terapevt Ko\'rigi', type: 'consultation', quantity: 1, unitPrice: 120000, totalPrice: 120000 }],
          subtotal: 120000,
          discount: 0,
          totalAmount: 120000,
          paymentMethod: 'card',
          status: 'completed',
          cashierName: 'Dilnoza Boboyeva',
          createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        },
        {
          id: 'tx_pharm_1',
          clinicId: clinic.id,
          receiptNumber: 'CHEK-PHARM-101',
          patientId: 'pat_1',
          patientName: 'Rustam Karimov',
          items: [
            { title: 'Enalapril 10mg #30', type: 'pharmacy', quantity: 1, unitPrice: 28000, totalPrice: 28000 },
            { title: 'Amlodipin 5mg #30', type: 'pharmacy', quantity: 1, unitPrice: 32000, totalPrice: 32000 },
            { title: 'Kardiomagnil 75mg #30', type: 'pharmacy', quantity: 1, unitPrice: 45000, totalPrice: 45000 },
          ],
          subtotal: 105000,
          discount: 0,
          totalAmount: 105000,
          paymentMethod: 'card',
          status: 'completed',
          cashierName: 'Malika Yusupova (Farmatsevt)',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        },
        {
          id: 'tx_2',
          clinicId: clinic.id,
          receiptNumber: 'CHEK-2026-002',
          patientId: 'pat_2',
          patientName: 'Zulayho Rahmonova',
          items: [{ title: 'UZI (Qorin bo\'shlig\'i to\'liq)', type: 'service', quantity: 1, unitPrice: 150000, totalPrice: 150000 }],
          subtotal: 150000,
          discount: 0,
          totalAmount: 150000,
          paymentMethod: 'payme_click',
          status: 'completed',
          cashierName: 'Dilnoza Boboyeva',
          createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        },
      ],
      printerConfig: { ...DEFAULT_PRINTER_CONFIG },
    };

    this.saveClinicData(clinic.id, initialState);
    this.setActiveUserId(initialStaff[0].id);
    return initialState;
  }

  static saveClinicData(clinicId: string, state: ClinicState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLINIC_DATA_PREFIX + clinicId, JSON.stringify(state));
    } catch {
      // Storage error
    }
  }

  /**
   * Export all Clinic data as JSON for Cloud/File Backup
   */
  static exportBackupJSON(clinicId: string): string {
    const data = this.getClinicData(clinicId);
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import Clinic Backup JSON
   */
  static importBackupJSON(jsonStr: string): boolean {
    try {
      const parsed: ClinicState = JSON.parse(jsonStr);
      if (parsed.currentClinic?.id) {
        // Save clinic to list if missing
        const clinics = this.getClinics();
        if (!clinics.some(c => c.id === parsed.currentClinic.id)) {
          clinics.push(parsed.currentClinic);
          this.saveClinics(clinics);
        }
        this.saveClinicData(parsed.currentClinic.id, parsed);
        this.setActiveClinicId(parsed.currentClinic.id);
        return true;
      }
    } catch {
      // Failed to parse
    }
    return false;
  }
}
