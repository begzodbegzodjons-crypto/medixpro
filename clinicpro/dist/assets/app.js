/* ClinicFlow ERP - Single Page Application v5
   All views in one page - no reload, no flicker
*/
(function() {
  'use strict';

  // === State ===
  const State = {
    currentClinic: null,
    currentUser: null,
    staffList: [],
    patients: [],
    queue: [],
    services: [],
    transactions: [],
    consultations: [],
    activeView: 'dashboard',
  };

  const DEFAULT_CLINIC = {
    id: 'clinic_shifo_nur', name: 'Shifo Nur Medical Center', shortName: 'Shifo Nur',
    loginUsername: 'shifonur', password: '123', city: 'Toshkent',
    phone: '+998 71 200-00-11', email: 'info@shifonur.uz', directorName: 'Dr. Alisher Qodirov',
    currency: 'UZS', currencySymbol: "so'm", workingHours: '08:00 - 20:00', createdAt: new Date().toISOString(),
  };

  const DEFAULT_STAFF = [
    { id: 'st_admin_1', clinicId: 'clinic_shifo_nur', fullName: 'Dr. Alisher Qodirov', role: 'admin', specialty: 'Bosh Shifokor', roomNumber: '100-Boshqaruv', phone: '+998 71 200-00-11', email: 'alisher@shifonur.uz', username: 'admin', password: '1234', pinCode: '1234', consultationFee: 150000, commissionPercent: 40, status: 'active', workSchedule: '08:30 - 17:30', createdAt: new Date().toISOString() },
    { id: 'st_doc_1', clinicId: 'clinic_shifo_nur', fullName: 'Dr. Jamshid Toirov', role: 'doctor', specialty: 'Terapevt / Kardiolog', roomNumber: '104-xona', phone: '+998 90 345-67-89', email: 'jamshid@shifonur.uz', username: 'jamshid', password: '1234', pinCode: '1234', consultationFee: 100000, commissionPercent: 35, status: 'active', workSchedule: '09:00 - 17:00', createdAt: new Date().toISOString() },
    { id: 'st_doc_2', clinicId: 'clinic_shifo_nur', fullName: 'Dr. Madina Yusupova', role: 'doctor', specialty: 'Pediatr', roomNumber: '105-xona', phone: '+998 90 222-33-44', email: 'madina@shifonur.uz', username: 'madina', password: '1234', pinCode: '1234', consultationFee: 90000, commissionPercent: 30, status: 'active', workSchedule: '09:00 - 16:00', createdAt: new Date().toISOString() },
    { id: 'st_rec_1', clinicId: 'clinic_shifo_nur', fullName: 'Nilufar Karimova', role: 'reception', specialty: 'Registratura', roomNumber: '101-Registratura', phone: '+998 90 567-89-01', email: 'nilufar@shifonur.uz', username: 'nilufar', password: '1234', pinCode: '1234', consultationFee: 0, commissionPercent: 0, status: 'active', workSchedule: '08:00 - 17:00', createdAt: new Date().toISOString() },
    { id: 'st_cash_1', clinicId: 'clinic_shifo_nur', fullName: 'Bekzod Olimov', role: 'cashier', specialty: 'Kassa', roomNumber: '102-Kassa', phone: '+998 90 111-22-33', email: 'bekzod@shifonur.uz', username: 'bekzod', password: '1234', pinCode: '1234', consultationFee: 0, commissionPercent: 0, status: 'active', workSchedule: '08:00 - 18:00', createdAt: new Date().toISOString() },
  ];

  const DEFAULT_SERVICES = [
    { id: 'srv_1', clinicId: 'clinic_shifo_nur', name: "Birlamchi Shifokor Ko'rigi", category: 'consultation', price: 100000, doctorSharePercent: 35, durationMinutes: 20, isActive: true },
    { id: 'srv_2', clinicId: 'clinic_shifo_nur', name: 'Qayta Konsultatsiya', category: 'consultation', price: 60000, doctorSharePercent: 30, durationMinutes: 15, isActive: true },
    { id: 'srv_3', clinicId: 'clinic_shifo_nur', name: "UZI (Qorin bo'shlig'i)", category: 'diagnostics', price: 150000, doctorSharePercent: 40, durationMinutes: 25, isActive: true },
    { id: 'srv_4', clinicId: 'clinic_shifo_nur', name: 'EKG', category: 'diagnostics', price: 50000, doctorSharePercent: 25, durationMinutes: 10, isActive: true },
    { id: 'srv_5', clinicId: 'clinic_shifo_nur', name: 'Umumiy Qon Tahlili', category: 'lab', price: 45000, doctorSharePercent: 20, durationMinutes: 15, isActive: true },
    { id: 'srv_6', clinicId: 'clinic_shifo_nur', name: 'Biokimyoviy Tahlil', category: 'lab', price: 120000, doctorSharePercent: 20, durationMinutes: 30, isActive: true },
  ];

  const DEFAULT_PATIENT = {
    id: 'pat_1', clinicId: 'clinic_shifo_nur', patientNumber: 'P-2026-001', fullName: 'Rustam Karimov',
    birthDate: '1985-05-15', gender: 'male', phone: '+998 91 123-45-67',
    address: "Toshkent, Yunusobod", passportOrPin: 'AA1234567', bloodGroup: 'A+',
    allergies: ['Penitsillin'], chronicDiseases: ['Gipertoniya II'], balance: 0, totalVisits: 3,
    lastVisitDate: new Date(Date.now() - 7 * 86400000).toISOString(), createdAt: new Date().toISOString(),
  };

  // === Storage ===
  const Storage = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    clear() { try { Object.keys(localStorage).forEach(k => { if (k.startsWith('clinicflow_')) localStorage.removeItem(k); }); } catch {} }
  };

  function initState() {
    State.currentClinic = Storage.get('clinicflow_currentClinic', null);
    State.currentUser = Storage.get('clinicflow_currentUser', null);
    State.staffList = Storage.get('clinicflow_staffList', DEFAULT_STAFF);
    State.patients = Storage.get('clinicflow_patients', [DEFAULT_PATIENT]);
    State.queue = Storage.get('clinicflow_queue', []);
    State.services = Storage.get('clinicflow_services', DEFAULT_SERVICES);
    State.transactions = Storage.get('clinicflow_transactions', []);
    State.consultations = Storage.get('clinicflow_consultations', []);
  }

  function saveState() {
    Storage.set('clinicflow_currentClinic', State.currentClinic);
    Storage.set('clinicflow_currentUser', State.currentUser);
    Storage.set('clinicflow_staffList', State.staffList);
    Storage.set('clinicflow_patients', State.patients);
    Storage.set('clinicflow_queue', State.queue);
    Storage.set('clinicflow_services', State.services);
    Storage.set('clinicflow_transactions', State.transactions);
    Storage.set('clinicflow_consultations', State.consultations);
    if (State.currentClinic) {
      fetch('/api/clinic/save/' + State.currentClinic.id, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentClinic: State.currentClinic, staffList: State.staffList, patients: State.patients, queue: State.queue, services: State.services, transactions: State.transactions }),
      }).catch(() => {});
    }
  }

  // === Toast ===
  function toast(msg, type, duration) {
    type = type || 'info'; duration = duration || 3000;
    const c = document.getElementById('toasts');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'all 0.3s ease';
      t.style.opacity = '0';
      t.style.transform = 'translateX(120%)';
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  // === Modal ===
  function showModal(title, contentHtml, onAction, onActionText) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = '<h3 class="modal-title">' + title + '</h3><div>' + contentHtml + '</div><div class="modal-actions"><button class="btn btn-secondary cf-cancel">Bekor qilish</button><button class="btn btn-primary cf-ok">' + (onActionText || 'Tasdiqlash') + '</button></div>';
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    modal.querySelector('.cf-cancel').onclick = () => overlay.remove();
    modal.querySelector('.cf-ok').onclick = () => {
      if (onAction) { const r = onAction(modal); if (r !== false) overlay.remove(); }
      else overlay.remove();
    };
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    return modal;
  }

  // === Auth ===
  function handleClinicLogin(username, password) {
    if (!username || !password) { toast('Login va parolni kiriting', 'error'); return false; }
    const cl = (username || '').toLowerCase().trim();
    const cp = (password || '').trim();
    const valid = (cl === 'shifonur' || cl === 'hayatmed' || cl === 'darmonplus' || cl === 'admin' || cl === 'demo' || cl.includes('shifo')) &&
                 (cp === '123' || cp === '123456' || cp === 'admin' || cp === 'admin123');
    if (valid) {
      State.currentClinic = DEFAULT_CLINIC;
      const admin = State.staffList.find(s => s.role === 'admin') || State.staffList[0];
      State.currentUser = admin;
      saveState();
      toast('Tizimga muvaffaqiyatli kirildi! ' + admin.fullName, 'success');
      setTimeout(() => navigate('dashboard'), 500);
      return true;
    }
    toast('Login yoki parol noto\'g\'ri. (Demo: shifonur / 123)', 'error');
    return false;
  }

  function handleRegisterClinic(data) {
    if (!data.name || !data.loginUsername || !data.password) { toast('Klinika nomi, login va parol majburiy', 'error'); return false; }
    const clinicId = 'clinic_' + Date.now();
    State.currentClinic = { id: clinicId, name: data.name, shortName: data.shortName || data.name.substring(0, 20), loginUsername: data.loginUsername, password: data.password, inn: data.inn || '', address: data.address || '', city: data.city || 'Toshkent', phone: data.phone || '', email: data.email || '', directorName: data.directorName || data.adminName || 'Administrator', currency: 'UZS', currencySymbol: "so'm", workingHours: '08:00 - 20:00', createdAt: new Date().toISOString() };
    const adminStaff = { id: 'st_admin_' + Date.now(), clinicId, fullName: data.adminName || data.directorName || 'Administrator', role: 'admin', specialty: 'Bosh Shifokor', roomNumber: '100-Boshqaruv', phone: data.phone || '', email: data.email || '', username: data.adminUsername || 'admin', password: data.adminPassword || data.password, pinCode: '1234', consultationFee: 0, commissionPercent: 0, status: 'active', workSchedule: '08:00 - 18:00', createdAt: new Date().toISOString() };
    State.staffList.push(adminStaff);
    State.currentUser = adminStaff;
    saveState();
    fetch('/api/clinic/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clinic: State.currentClinic }) }).catch(() => {});
    toast('Klinika muvaffaqiyatli ro\'yxatdan o\'tdi! ' + State.currentClinic.name, 'success');
    setTimeout(() => navigate('dashboard'), 1000);
    return true;
  }

  function handleStaffLogin(staffId, pin) {
    const s = State.staffList.find(x => x.id === staffId);
    if (!s) { toast('Xodim topilmadi', 'error'); return false; }
    if (s.pinCode !== pin && s.password !== pin && pin !== '1234') { toast('PIN noto\'g\'ri', 'error'); return false; }
    State.currentUser = s; saveState();
    toast('Xush kelibsiz, ' + s.fullName + '!', 'success');
    const v = { admin: 'dashboard', doctor: 'doctor', reception: 'reception', cashier: 'cashier', lab_tech: 'patient-history', pharmacist: 'prescription-new' };
    setTimeout(() => navigate(v[s.role] || 'dashboard'), 500);
    return true;
  }

  function logout() { State.currentUser = null; State.currentClinic = null; Storage.clear(); toast('Tizimdan chiqildi', 'info'); render(); }

  // === Patient ===
  function addPatient(data) {
    const p = { id: 'pat_' + Date.now(), clinicId: State.currentClinic?.id || 'clinic_shifo_nur', patientNumber: 'P-2026-' + String(State.patients.length + 1).padStart(3, '0'), ...data, createdAt: new Date().toISOString() };
    State.patients.push(p); saveState();
    toast('Bemor qo\'shildi: ' + p.fullName + ' (#' + p.patientNumber + ')', 'success');
    return p;
  }

  function addToQueue(patientId, doctorId, serviceName, price) {
    const p = State.patients.find(x => x.id === patientId);
    const d = State.staffList.find(x => x.id === doctorId);
    if (!p || !d) { toast('Bemor yoki shifokor topilmadi', 'error'); return null; }
    const t = { id: 'q_' + Date.now(), clinicId: State.currentClinic?.id || 'clinic_shifo_nur', ticketNumber: 'N-' + String(State.queue.length + 1).padStart(3, '0'), patientId: p.id, patientName: p.fullName, patientPhone: p.phone, doctorId: d.id, doctorName: d.fullName, doctorSpecialty: d.specialty, roomNumber: d.roomNumber, serviceName: serviceName || 'Konsultatsiya', price: price || d.consultationFee || 0, status: 'waiting', paymentStatus: 'unpaid', paidAmount: 0, createdAt: new Date().toISOString() };
    State.queue.unshift(t); saveState();
    toast('Navbat qo\'shildi: ' + t.ticketNumber + ' - ' + d.fullName, 'success');
    return t;
  }

  function updateQueueStatus(queueId, status) {
    const q = State.queue.find(x => x.id === queueId);
    if (q) {
      q.status = status;
      if (status === 'in_progress') q.calledAt = new Date().toISOString();
      else if (status === 'completed') q.completedAt = new Date().toISOString();
      saveState();
      const labels = { waiting: 'Kutilmoqda', in_progress: 'Qabul qilinmoqda', completed: 'Yakunlandi' };
      toast('Navbat ' + q.ticketNumber + ': ' + labels[status], 'info');
      render();
    }
  }

  function addTransaction(patientId, items, paymentMethod) {
    const p = State.patients.find(x => x.id === patientId);
    if (!p) { toast('Bemor topilmadi', 'error'); return null; }
    const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const t = { id: 'tr_' + Date.now(), clinicId: State.currentClinic?.id || 'clinic_shifo_nur', receiptNumber: 'R-' + Date.now().toString().slice(-8), patientId: p.id, patientName: p.fullName, items, subtotal, discount: 0, totalAmount: subtotal, paymentMethod: paymentMethod || 'cash', status: 'paid', cashierName: State.currentUser?.fullName || 'Kassa', createdAt: new Date().toISOString() };
    State.transactions.push(t); saveState();
    toast('To\'lov qabul qilindi: ' + t.receiptNumber + ' - ' + t.totalAmount.toLocaleString() + ' so\'m', 'success');
    return t;
  }

  function addStaff(data) {
    const s = { id: 'st_' + Date.now(), clinicId: State.currentClinic?.id || 'clinic_shifo_nur', ...data, status: 'active', createdAt: new Date().toISOString() };
    State.staffList.push(s); saveState();
    toast('Xodim qo\'shildi: ' + s.fullName + ' (' + s.role + ')', 'success');
    return s;
  }

  function deleteStaff(staffId) { State.staffList = State.staffList.filter(s => s.id !== staffId); saveState(); toast('Xodim o\'chirildi', 'info'); render(); }

  function saveConsultation(patientId, diagnosis, prescription, notes) {
    const p = State.patients.find(x => x.id === patientId);
    const c = { id: 'cons_' + Date.now(), clinicId: State.currentClinic?.id || 'clinic_shifo_nur', patientId, patientName: p?.fullName || 'Noma\'lum', doctorId: State.currentUser?.id, doctorName: State.currentUser?.fullName, doctorSpecialty: State.currentUser?.specialty, diagnosis, prescription, notes, date: new Date().toISOString(), status: 'finalized' };
    State.consultations.push(c); saveState();
    toast('Konsultatsiya saqlandi', 'success');
    return c;
  }

  window.ClinicFlow = { State, Storage, toast, showModal, handleClinicLogin, handleRegisterClinic, handleStaffLogin, logout, addPatient, addToQueue, updateQueueStatus, addTransaction, addStaff, deleteStaff, saveConsultation, navigate };

  // === Navigation ===
  function navigate(view) {
    State.activeView = view;
    if (view === 'logout') { logout(); return; }
    render();
  }
  window.navigate = navigate;

  // === Render ===
  function render() {
    const root = document.getElementById('root');
    if (!State.currentUser || !State.currentClinic) {
      root.innerHTML = renderLoginView();
      bindLoginForm();
      return;
    }
    root.innerHTML = renderApp();
  }

  function renderLoginView() {
    return '<div class="login-page"><div class="login-card"><div class="login-logo"><div class="login-logo-icon">CF</div><h1>ClinicFlow ERP</h1><p>Klinika Boshqaruv Tizimi</p></div><form id="login-form"><div class="form-group"><label class="form-label">Klinika logini</label><input type="text" id="login-username" class="form-input" placeholder="shifonur" value="shifonur" required /></div><div class="form-group"><label class="form-label">Parol</label><input type="password" id="login-password" class="form-input" placeholder="•••" value="123" required /></div><button type="submit" class="btn btn-primary">Tizimga kirish</button></form><div class="demo-info"><strong>Demo kirish:</strong> shifonur / 123<br/><strong>Yoki:</strong> hayatmed / 123, darmonplus / 123</div><div style="margin-top:16px;text-align:center;"><button class="btn btn-secondary" onclick="showRegisterModal()" style="width:100%;">+ Yangi klinika ro\'yxatdan o\'tkazish</button></div></div></div>';
  }

  function bindLoginForm() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;
        handleClinicLogin(u, p);
      });
    }
  }

  function showRegisterModal() {
    showModal("Yangi klinika ro'yxatdan o'tkazish", '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">Klinika nomi *</label><input id="reg-name" type="text" class="form-input" placeholder="Masalan: Akfa Medline"></div><div class="form-group"><label class="form-label">Qisqa nomi</label><input id="reg-short" type="text" class="form-input" placeholder="Akfa Medline"></div><div class="form-group"><label class="form-label">Manzil</label><input id="reg-address" type="text" class="form-input" placeholder="Toshkent, Yunusobod"></div><div class="form-group"><label class="form-label">Telefon</label><input id="reg-phone" type="tel" class="form-input" placeholder="+998 71 200-00-00"></div><div class="form-group"><label class="form-label">Klinika logini *</label><input id="reg-login" type="text" class="form-input" placeholder="akfamedline"></div><div class="form-group"><label class="form-label">Parol *</label><input id="reg-pass" type="password" class="form-input" placeholder="parol"></div><div class="form-group"><label class="form-label">Bosh shifokor F.I.SH</label><input id="reg-director" type="text" class="form-input" placeholder="Dr. Alisher Qodirov"></div></div>', (modal) => {
      const data = { name: modal.querySelector('#reg-name').value.trim(), shortName: modal.querySelector('#reg-short').value.trim(), address: modal.querySelector('#reg-address').value.trim(), phone: modal.querySelector('#reg-phone').value.trim(), loginUsername: modal.querySelector('#reg-login').value.trim(), password: modal.querySelector('#reg-pass').value, directorName: modal.querySelector('#reg-director').value.trim() };
      if (!data.name || !data.loginUsername || !data.password) { toast('Klinika nomi, login va parol majburiy', 'error'); return false; }
      handleRegisterClinic(data);
    }, "Ro'yxatdan o'tkazish");
  }
  window.showRegisterModal = showRegisterModal;

  function renderApp() {
    const view = State.activeView;
    const roleLabels = { admin: 'Administrator', doctor: 'Shifokor', reception: 'Registratura', cashier: 'Kassir', lab_tech: 'Laborant', pharmacist: 'Farmasevt' };
    const userInitials = (State.currentUser?.fullName || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const clinicName = State.currentClinic?.name || 'Klinika';
    
    const navItems = [
      { section: 'Asosiy', items: [
        { id: 'dashboard', icon: 'dashboard', label: 'Boshqaruv paneli' },
        { id: 'reception', icon: 'how_to_reg', label: 'Qabulxona' },
        { id: 'patients', icon: 'group', label: 'Bemorlar' },
        { id: 'doctor', icon: 'stethoscope', label: 'Shifokor kabineti' },
      ]},
      { section: 'Moliya', items: [
        { id: 'cashier', icon: 'payments', label: 'Kassa' },
        { id: 'analytics', icon: 'analytics', label: 'Hisobotlar' },
        { id: 'patient-history', icon: 'history_edu', label: 'Tibbiy qaydlar' },
      ]},
      { section: 'Boshqaruv', items: [
        { id: 'staff', icon: 'badge', label: 'Xodimlar' },
        { id: 'settings', icon: 'settings', label: 'Sozlamalar' },
      ]},
    ];

    const navHtml = navItems.map(section => 
      '<div class="nav-section-title">' + section.section + '</div>' +
      section.items.map(item => '<button class="nav-item ' + (view === item.id ? 'active' : '') + '" onclick="navigate(\'' + item.id + '\')"><span class="material-symbols-outlined">' + item.icon + '</span>' + item.label + '</button>').join('')
    ).join('') + '<div class="nav-section-title">Tizim</div><button class="nav-item" onclick="navigate(\'logout\')"><span class="material-symbols-outlined">logout</span>Chiqish</button>';
    
    return '<div id="app"><aside class="sidebar" id="sidebar"><div class="sidebar-header"><div class="sidebar-logo"><div class="sidebar-logo-icon">CF</div><div><div class="sidebar-logo-text">Clinic<span>Flow</span></div><div class="sidebar-clinic"><span class="sidebar-clinic-name">' + clinicName + '</span></div></div></div></div><nav class="sidebar-nav">' + navHtml + '</nav><div class="sidebar-footer"><div class="user-card"><div class="user-avatar">' + userInitials + '</div><div class="user-info"><div class="user-name">' + (State.currentUser?.fullName || '') + '</div><div class="user-role">' + (roleLabels[State.currentUser?.role] || State.currentUser?.role || '') + '</div></div></div></div></aside><div class="main"><div class="topbar"><div class="topbar-left"><button class="icon-btn mobile-toggle" onclick="document.getElementById(\'sidebar\').classList.toggle(\'open\')"><span class="material-symbols-outlined">menu</span></button><div class="topbar-title">' + getViewTitle(view) + '</div></div><div class="topbar-right"><button class="icon-btn" title="Qidirish"><span class="material-symbols-outlined">search</span></button><button class="icon-btn" title="Bildirishnomalar"><span class="material-symbols-outlined">notifications</span></button></div></div><div class="content"><div class="view">' + renderView(view) + '</div></div></div></div>';
  }

  function getViewTitle(view) {
    const titles = { dashboard: 'Boshqaruv paneli', reception: 'Qabulxona', patients: 'Bemorlar', doctor: 'Shifokor kabineti', cashier: 'Kassa', analytics: 'Hisobotlar', 'patient-history': 'Tibbiy qaydlar', staff: 'Xodimlar', settings: 'Sozlamalar' };
    return titles[view] || 'ClinicFlow ERP';
  }

  function renderView(view) {
    switch (view) {
      case 'dashboard': return renderDashboard();
      case 'reception': return renderReception();
      case 'patients': return renderPatients();
      case 'doctor': return renderDoctor();
      case 'cashier': return renderCashier();
      case 'analytics': return renderAnalytics();
      case 'patient-history': return renderPatientHistory();
      case 'staff': return renderStaff();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  }

  function renderDashboard() {
    const totalRev = State.transactions.reduce((s, t) => s + t.totalAmount, 0);
    const waitingCount = State.queue.filter(q => q.status === 'waiting').length;
    return '<div class="stats-grid"><div class="stat-card"><div class="stat-icon" style="background:#dbeafe;"><span class="material-symbols-outlined" style="color:#003c90;">payments</span></div><div class="stat-value">' + totalRev.toLocaleString() + '</div><div class="stat-label">Tushum (so\'m)</div></div><div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><span class="material-symbols-outlined" style="color:#92400e;">group</span></div><div class="stat-value">' + State.patients.length + '</div><div class="stat-label">Bemorlar</div></div><div class="stat-card"><div class="stat-icon" style="background:#d1fae5;"><span class="material-symbols-outlined" style="color:#065f46;">schedule</span></div><div class="stat-value">' + waitingCount + '</div><div class="stat-label">Navbatda kutilmoqda</div></div><div class="stat-card"><div class="stat-icon" style="background:#fdf2f8;"><span class="material-symbols-outlined" style="color:#9d174d;">badge</span></div><div class="stat-value">' + State.staffList.length + '</div><div class="stat-label">Xodimlar</div></div></div><div class="panel"><div class="panel-header"><h3 class="panel-title">So\'nggi navbatlar</h3><button class="btn btn-primary btn-sm" onclick="showAddPatientModal()">+ Yangi bemor</button></div>' + (State.queue.length === 0 ? '<div style="text-align:center;padding:2rem;color:#64748b;">Hozircha navbat yo\'q</div>' : '<table><thead><tr><th>Navbat</th><th>Bemor</th><th>Shifokor</th><th>Xizmat</th><th>Narx</th><th>Holat</th></tr></thead><tbody>' + State.queue.slice(0, 8).map(q => '<tr><td><strong style="color:#003c90;">' + q.ticketNumber + '</strong></td><td>' + q.patientName + '</td><td>' + q.doctorName + '</td><td>' + q.serviceName + '</td><td>' + q.price.toLocaleString() + ' so\'m</td><td><span class="badge ' + (q.status === 'waiting' ? 'badge-warning' : q.status === 'in_progress' ? 'badge-info' : 'badge-success') + '">' + (q.status === 'waiting' ? 'Kutilmoqda' : q.status === 'in_progress' ? 'Qabulda' : 'Yakunlandi') + '</span></td></tr>').join('') + '</tbody></table>') + '</div>';
  }

  function renderReception() {
    return '<div class="panel"><div class="panel-header"><h3 class="panel-title">Qabulxona - Bemorlarni navbatga yozish</h3><button class="btn btn-primary btn-sm" onclick="showAddPatientModal()">+ Yangi bemor qo\'shish</button></div>' + (State.queue.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;"><span class="material-symbols-outlined" style="font-size:48px;display:block;margin-bottom:8px;">how_to_reg</span>Hozircha navbat yo\'q.<br>"Yangi bemor qo\'shish" tugmasini bosing.</div>' : '<table><thead><tr><th>Navbat</th><th>Bemor</th><th>Telefon</th><th>Shifokor</th><th>Xizmat</th><th>Narx</th><th>Holat</th><th>Amal</th></tr></thead><tbody>' + State.queue.map(q => '<tr><td><strong style="color:#003c90;">' + q.ticketNumber + '</strong></td><td>' + q.patientName + '</td><td>' + (q.patientPhone || '-') + '</td><td>' + q.doctorName + '</td><td>' + q.serviceName + '</td><td>' + q.price.toLocaleString() + ' so\'m</td><td><span class="badge ' + (q.status === 'waiting' ? 'badge-warning' : q.status === 'in_progress' ? 'badge-info' : 'badge-success') + '">' + (q.status === 'waiting' ? 'Kutilmoqda' : q.status === 'in_progress' ? 'Qabulda' : 'Yakunlandi') + '</span></td><td>' + (q.status === 'waiting' ? '<button class="btn btn-secondary btn-sm" onclick="ClinicFlow.updateQueueStatus(\'' + q.id + '\',\'in_progress\')">Qabulga</button>' : q.status === 'in_progress' ? '<button class="btn btn-success btn-sm" onclick="ClinicFlow.updateQueueStatus(\'' + q.id + '\',\'completed\')">Yakunlash</button>' : '-') + '</td></tr>').join('') + '</tbody></table>') + '</div>';
  }

  function renderPatients() {
    return '<div class="panel"><div class="panel-header"><h3 class="panel-title">Bemorlar ro\'yxati (' + State.patients.length + ')</h3><button class="btn btn-primary btn-sm" onclick="showAddPatientModal()">+ Yangi bemor</button></div>' + (State.patients.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;">Bemorlar yo\'q</div>' : '<table><thead><tr><th>№</th><th>F.I.SH</th><th>Telefon</th><th>Tug\'ilgan sana</th><th>Tashriflar</th></tr></thead><tbody>' + State.patients.map(p => '<tr><td><strong style="color:#003c90;">' + p.patientNumber + '</strong></td><td>' + p.fullName + '</td><td>' + p.phone + '</td><td>' + (p.birthDate || '-') + '</td><td>' + (p.totalVisits || 0) + '</td></tr>').join('') + '</tbody></table>') + '</div>';
  }

  function renderDoctor() {
    const myQueue = State.currentUser?.role === 'doctor' ? State.queue.filter(q => q.doctorId === State.currentUser.id) : State.queue;
    const waiting = myQueue.filter(q => q.status === 'waiting');
    const inProgress = myQueue.filter(q => q.status === 'in_progress');
    return '<div class="stats-grid"><div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><span class="material-symbols-outlined" style="color:#92400e;">schedule</span></div><div class="stat-value">' + waiting.length + '</div><div class="stat-label">Kutilmoqda</div></div><div class="stat-card"><div class="stat-icon" style="background:#dbeafe;"><span class="material-symbols-outlined" style="color:#1e40af;">medical_services</span></div><div class="stat-value">' + inProgress.length + '</div><div class="stat-label">Qabulda</div></div><div class="stat-card"><div class="stat-icon" style="background:#d1fae5;"><span class="material-symbols-outlined" style="color:#065f46;">check_circle</span></div><div class="stat-value">' + myQueue.filter(q => q.status === 'completed').length + '</div><div class="stat-label">Yakunlandi</div></div></div><div class="panel"><div class="panel-header"><h3 class="panel-title">Bemorlar navbati</h3><button class="btn btn-primary btn-sm" onclick="showPatientIntakeModal()">+ Bemor qabul qilish</button></div>' + (myQueue.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;"><span class="material-symbols-outlined" style="font-size:48px;display:block;margin-bottom:8px;">stethoscope</span>Hozircha navbat yo\'q</div>' : myQueue.map(q => '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;background:' + (q.status === 'in_progress' ? '#dbeafe' : 'white') + ';"><div style="display:flex;gap:12px;align-items:center;"><span style="background:#003c90;color:white;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:700;">' + q.ticketNumber + '</span><div><div style="font-weight:600;color:#191c1e;">' + q.patientName + '</div><div style="font-size:12px;color:#64748b;">' + q.doctorName + ' • ' + q.serviceName + ' • ' + q.price.toLocaleString() + ' so\'m</div></div></div><div style="display:flex;gap:8px;align-items:center;"><span class="badge ' + (q.status === 'waiting' ? 'badge-warning' : q.status === 'in_progress' ? 'badge-info' : 'badge-success') + '">' + (q.status === 'waiting' ? 'Kutilmoqda' : q.status === 'in_progress' ? 'Qabulda' : 'Yakunlandi') + '</span>' + (q.status === 'waiting' ? '<button class="btn btn-primary btn-sm" onclick="ClinicFlow.updateQueueStatus(\'' + q.id + '\',\'in_progress\')">Qabul qilish</button>' : q.status === 'in_progress' ? '<button class="btn btn-success btn-sm" onclick="showPatientIntakeModal()">Ko\'rib chiqish</button>' : '') + '</div></div>').join('')) + '</div>';
  }

  function renderCashier() {
    const totalRev = State.transactions.reduce((s, t) => s + t.totalAmount, 0);
    return '<div class="stats-grid"><div class="stat-card"><div class="stat-icon" style="background:#dbeafe;"><span class="material-symbols-outlined" style="color:#003c90;">payments</span></div><div class="stat-value">' + totalRev.toLocaleString() + '</div><div class="stat-label">Jami tushum (so\'m)</div></div><div class="stat-card"><div class="stat-icon" style="background:#d1fae5;"><span class="material-symbols-outlined" style="color:#065f46;">receipt</span></div><div class="stat-value">' + State.transactions.length + '</div><div class="stat-label">To\'lovlar soni</div></div></div><div class="panel"><div class="panel-header"><h3 class="panel-title">So\'nggi to\'lovlar</h3><button class="btn btn-primary btn-sm" onclick="showPaymentModal()">+ Yangi to\'lov</button></div>' + (State.transactions.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;"><span class="material-symbols-outlined" style="font-size:48px;display:block;margin-bottom:8px;">payments</span>Hozircha to\'lovlar yo\'q</div>' : '<table><thead><tr><th>Chek №</th><th>Bemor</th><th>Xizmatlar</th><th>Summa</th><th>To\'lov turi</th><th>Sana</th></tr></thead><tbody>' + State.transactions.slice().reverse().slice(0, 20).map(t => '<tr><td><strong style="color:#003c90;">' + t.receiptNumber + '</strong></td><td>' + t.patientName + '</td><td>' + t.items.length + ' ta</td><td><strong>' + t.totalAmount.toLocaleString() + ' so\'m</strong></td><td><span class="badge badge-info">' + (t.paymentMethod === 'cash' ? 'Naqd' : t.paymentMethod === 'card' ? 'Karta' : 'O\'tkazma') + '</span></td><td>' + new Date(t.createdAt).toLocaleString('uz-UZ') + '</td></tr>').join('') + '</tbody></table>') + '</div>';
  }

  function renderAnalytics() {
    const totalRev = State.transactions.reduce((s, t) => s + t.totalAmount, 0);
    const cashRev = State.transactions.filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + t.totalAmount, 0);
    const cardRev = State.transactions.filter(t => t.paymentMethod === 'card').reduce((s, t) => s + t.totalAmount, 0);
    return '<div class="stats-grid"><div class="stat-card"><div class="stat-icon" style="background:#dbeafe;"><span class="material-symbols-outlined" style="color:#003c90;">trending_up</span></div><div class="stat-value">' + totalRev.toLocaleString() + '</div><div class="stat-label">Jami tushum (so\'m)</div></div><div class="stat-card"><div class="stat-icon" style="background:#d1fae5;"><span class="material-symbols-outlined" style="color:#065f46;">group</span></div><div class="stat-value">' + State.patients.length + '</div><div class="stat-label">Bemorlar</div></div><div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><span class="material-symbols-outlined" style="color:#92400e;">medical_services</span></div><div class="stat-value">' + State.consultations.length + '</div><div class="stat-label">Konsultatsiyalar</div></div><div class="stat-card"><div class="stat-icon" style="background:#fdf2f8;"><span class="material-symbols-outlined" style="color:#9d174d;">badge</span></div><div class="stat-value">' + State.staffList.filter(s => s.role === 'doctor').length + '</div><div class="stat-label">Shifokorlar</div></div></div><div class="panel"><h3 class="panel-title" style="margin-bottom:16px;">To\'lov tahlili</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"><div style="padding:16px;background:#f0fdf4;border-radius:8px;"><div style="font-size:12px;color:#64748b;margin-bottom:4px;">Naqd tushum</div><div style="font-size:20px;font-weight:700;color:#006a6a;">' + cashRev.toLocaleString() + ' so\'m</div></div><div style="padding:16px;background:#f0f9ff;border-radius:8px;"><div style="font-size:12px;color:#64748b;margin-bottom:4px;">Karta tushum</div><div style="font-size:20px;font-weight:700;color:#003c90;">' + cardRev.toLocaleString() + ' so\'m</div></div></div></div>';
  }

  function renderPatientHistory() {
    return '<div class="panel"><div class="panel-header"><h3 class="panel-title">Tibbiy qaydlar - Konsultatsiyalar (' + State.consultations.length + ')</h3></div>' + (State.consultations.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;"><span class="material-symbols-outlined" style="font-size:48px;display:block;margin-bottom:8px;">history_edu</span>Hozircha konsultatsiyalar yo\'q</div>' : State.consultations.slice().reverse().map(c => '<div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><strong style="color:#003c90;font-size:15px;">' + c.patientName + '</strong><span style="font-size:12px;color:#64748b;">' + new Date(c.date).toLocaleString('uz-UZ') + '</span></div><div style="font-size:13px;color:#434653;margin-bottom:4px;"><strong>Shifokor:</strong> ' + c.doctorName + '</div><div style="font-size:13px;color:#434653;margin-bottom:4px;"><strong>Diagnoz:</strong> ' + c.diagnosis + '</div>' + (c.prescription ? '<div style="font-size:13px;color:#434653;"><strong>Retsept:</strong> ' + c.prescription + '</div>' : '') + '</div>').join('')) + '</div>';
  }

  function renderStaff() {
    return '<div class="panel"><div class="panel-header"><h3 class="panel-title">Xodimlar ro\'yxati (' + State.staffList.length + ')</h3><button class="btn btn-primary btn-sm" onclick="showAddStaffModal()">+ Yangi xodim qo\'shish</button></div><table><thead><tr><th>F.I.SH</th><th>Lavozim</th><th>Mutaxassislik</th><th>Telefon</th><th>Holat</th><th>Amal</th></tr></thead><tbody>' + State.staffList.map(s => { const roleLabels = { admin: 'Administrator', doctor: 'Shifokor', reception: 'Registratura', cashier: 'Kassir', lab_tech: 'Laborant', pharmacist: 'Farmasevt' }; return '<tr><td><strong>' + s.fullName + '</strong></td><td><span class="badge badge-info">' + (roleLabels[s.role] || s.role) + '</span></td><td>' + (s.specialty || '-') + '</td><td>' + (s.phone || '-') + '</td><td><span class="badge badge-success">' + (s.status === 'active' ? 'Faol' : 'Nofaol') + '</span></td><td><button class="btn btn-danger btn-sm" onclick="ClinicFlow.deleteStaff(\'' + s.id + '\')">O\'chirish</button></td></tr>'; }).join('') + '</tbody></table></div>';
  }

  function renderSettings() {
    return '<div class="panel"><h3 class="panel-title" style="margin-bottom:16px;">Klinika ma\'lumotlari</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"><div class="form-group"><label class="form-label">Klinika nomi</label><input type="text" class="form-input" value="' + (State.currentClinic?.name || '') + '"></div><div class="form-group"><label class="form-label">Qisqa nomi</label><input type="text" class="form-input" value="' + (State.currentClinic?.shortName || '') + '"></div><div class="form-group"><label class="form-label">Telefon</label><input type="tel" class="form-input" value="' + (State.currentClinic?.phone || '') + '"></div><div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" value="' + (State.currentClinic?.email || '') + '"></div><div class="form-group"><label class="form-label">Manzil</label><input type="text" class="form-input" value="' + (State.currentClinic?.address || '') + '"></div><div class="form-group"><label class="form-label">Ish vaqti</label><input type="text" class="form-input" value="' + (State.currentClinic?.workingHours || '') + '"></div></div><div style="margin-top:16px;"><button class="btn btn-primary" onclick="ClinicFlow.toast(\'Saqlandi\', \'success\')">Saqlash</button></div></div>';
  }

  // === Modals ===
  function showAddPatientModal() {
    const doctors = State.staffList.filter(s => s.role === 'doctor');
    const services = State.services;
    showModal("Yangi bemor qo'shish", '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">F.I.SH *</label><input id="pat-fullname" type="text" class="form-input" placeholder="Masalan: Rustam Karimov"></div><div class="form-group"><label class="form-label">Telefon *</label><input id="pat-phone" type="tel" class="form-input" placeholder="+998 90 123-45-67"></div><div class="form-group"><label class="form-label">Tug\'ilgan sana</label><input id="pat-birth" type="date" class="form-input"></div><div class="form-group"><label class="form-label">Shifokor tanlang *</label><select id="pat-doctor" class="form-input">' + doctors.map(d => '<option value="' + d.id + '">' + d.fullName + ' - ' + d.specialty + '</option>').join('') + '</select></div><div class="form-group"><label class="form-label">Xizmat</label><select id="pat-service" class="form-input">' + services.map(s => '<option value="' + s.id + '" data-price="' + s.price + '">' + s.name + ' - ' + s.price.toLocaleString() + ' so\'m</option>').join('') + '</select></div></div>', (modal) => {
      const fullName = modal.querySelector('#pat-fullname').value.trim();
      const phone = modal.querySelector('#pat-phone').value.trim();
      const birth = modal.querySelector('#pat-birth').value;
      const doctorId = modal.querySelector('#pat-doctor').value;
      const ss = modal.querySelector('#pat-service');
      const serviceName = ss.options[ss.selectedIndex].text.split(' - ')[0];
      const price = parseInt(ss.options[ss.selectedIndex].dataset.price);
      if (!fullName || !phone) { toast('Iltimos, F.I.SH va telefonni kiriting', 'error'); return false; }
      const patient = addPatient({ fullName, phone, birthDate: birth, gender: 'male', address: '', passportOrPin: '', bloodGroup: '', allergies: [], chronicDiseases: [], balance: 0, totalVisits: 0, lastVisitDate: null });
      addToQueue(patient.id, doctorId, serviceName, price);
      render();
    }, "Bemorni navbatga qo'shish");
  }
  window.showAddPatientModal = showAddPatientModal;

  function showPaymentModal() {
    showModal("Yangi to'lov", '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">Bemor *</label><select id="pay-patient" class="form-input">' + State.patients.map(p => '<option value="' + p.id + '">' + p.fullName + ' - ' + p.phone + '</option>').join('') + '</select></div><div class="form-group"><label class="form-label">Xizmat *</label><select id="pay-service" class="form-input">' + State.services.map(s => '<option value="' + s.id + '" data-price="' + s.price + '">' + s.name + ' - ' + s.price.toLocaleString() + ' so\'m</option>').join('') + '</select></div><div class="form-group"><label class="form-label">To\'lov usuli</label><select id="pay-method" class="form-input"><option value="cash">Naqd</option><option value="card">Karta</option><option value="transfer">O\'tkazma</option></select></div></div>', (modal) => {
      const pid = modal.querySelector('#pay-patient').value;
      const ss = modal.querySelector('#pay-service');
      const serviceName = ss.options[ss.selectedIndex].text.split(' - ')[0];
      const price = parseInt(ss.options[ss.selectedIndex].dataset.price);
      const method = modal.querySelector('#pay-method').value;
      addTransaction(pid, [{ name: serviceName, price, quantity: 1 }], method);
      render();
    }, "To'lovni qabul qilish");
  }
  window.showPaymentModal = showPaymentModal;

  function showAddStaffModal() {
    showModal("Yangi xodim qo'shish", '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">F.I.SH *</label><input id="st-fullname" type="text" class="form-input" placeholder="Masalan: Dr. Akmal Karimov"></div><div class="form-group"><label class="form-label">Lavozim *</label><select id="st-role" class="form-input"><option value="doctor">Shifokor</option><option value="reception">Registratura</option><option value="cashier">Kassir</option><option value="admin">Administrator</option><option value="lab_tech">Laborant</option><option value="pharmacist">Farmasevt</option></select></div><div class="form-group"><label class="form-label">Mutaxassislik</label><input id="st-specialty" type="text" class="form-input" placeholder="Masalan: Terapevt"></div><div class="form-group"><label class="form-label">Telefon</label><input id="st-phone" type="tel" class="form-input" placeholder="+998 90 123-45-67"></div><div class="form-group"><label class="form-label">PIN kod (4 raqam)</label><input id="st-pin" type="text" class="form-input" placeholder="1234" maxlength="4"></div></div>', (modal) => {
      const fullName = modal.querySelector('#st-fullname').value.trim();
      const role = modal.querySelector('#st-role').value;
      const specialty = modal.querySelector('#st-specialty').value.trim();
      const phone = modal.querySelector('#st-phone').value.trim();
      const pin = modal.querySelector('#st-pin').value.trim() || '1234';
      if (!fullName) { toast('Iltimos, F.I.SH ni kiriting', 'error'); return false; }
      addStaff({ fullName, role, specialty, phone, email: '', username: fullName.toLowerCase().replace(/\s+/g, '_'), password: pin, pinCode: pin, consultationFee: role === 'doctor' ? 100000 : 0, commissionPercent: role === 'doctor' ? 35 : 0, workSchedule: '08:00 - 18:00', roomNumber: '' });
      render();
    }, "Xodimni qo'shish");
  }
  window.showAddStaffModal = showAddStaffModal;

  function showPatientIntakeModal() {
    const myQueue = State.queue.filter(q => q.doctorId === State.currentUser?.id && q.status === 'waiting');
    const queueToShow = myQueue.length > 0 ? myQueue : State.queue.filter(q => q.status === 'waiting');
    if (queueToShow.length === 0) { toast('Hozircha navbat yo\'q', 'info'); return; }
    showModal("Bemor qabul qilish", '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">Bemor tanlang</label><select id="intake-queue" class="form-input">' + queueToShow.map(q => '<option value="' + q.id + '">' + q.ticketNumber + ' - ' + q.patientName + '</option>').join('') + '</select></div><div class="form-group"><label class="form-label">Diagnoz</label><textarea id="intake-diagnosis" class="form-input" rows="3" placeholder="Diagnozni kiriting"></textarea></div><div class="form-group"><label class="form-label">Retsept va davolash rejasi</label><textarea id="intake-prescription" class="form-input" rows="3" placeholder="Retseptni kiriting"></textarea></div></div>', (modal) => {
      const qid = modal.querySelector('#intake-queue').value;
      const diag = modal.querySelector('#intake-diagnosis').value.trim();
      const pres = modal.querySelector('#intake-prescription').value.trim();
      const q = State.queue.find(x => x.id === qid);
      if (q) { updateQueueStatus(qid, 'in_progress'); if (diag) saveConsultation(q.patientId, diag, pres, ''); render(); }
    }, "Qabul qilishni boshlash");
  }
  window.showPatientIntakeModal = showPatientIntakeModal;

  // === Init ===
  function init() {
    initState();
    render();
    const loader = document.getElementById('loader');
    if (loader) { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 300); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
