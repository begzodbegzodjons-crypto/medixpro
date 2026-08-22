/* ClinicFlow ERP - Multi-role SPA v7
   - Role-based login (clinic login + staff PIN)
   - Each role sees only their cabinet
   - Reception: patients + queue + WARDS management
   - Doctor: queue + consultation + history
   - Cashier: payments + invoices
   - Admin: full management
*/
(function() {
  'use strict';

  const State = {
    currentClinic: null,
    currentUser: null,
    staffList: [],
    patients: [],
    queue: [],
    services: [],
    transactions: [],
    consultations: [],
    labOrders: [],
    pharmacy: [],
    wards: [],
    activeView: 'dashboard',
  };

  const DEFAULT_CLINIC = {
    id: 'clinic_shifo_nur', name: 'Shifo Nur Medical Center', shortName: 'Shifo Nur',
    loginUsername: 'shifonur', password: '123', city: 'Toshkent',
    phone: '+998 71 200-00-11', email: 'info@shifonur.uz', directorName: 'Dr. Alisher Qodirov',
    currency: 'UZS', currencySymbol: "so\'m", workingHours: '08:00 - 20:00', createdAt: new Date().toISOString(),
  };

  const DEFAULT_STAFF = [
    { id: 'st_admin_1', clinicId: 'clinic_shifo_nur', fullName: 'Dr. Alisher Qodirov', role: 'admin', specialty: 'Bosh Shifokor', roomNumber: '100-Boshqaruv', phone: '+998 71 200-00-11', email: 'alisher@shifonur.uz', username: 'admin', password: '1234', pinCode: '1234', consultationFee: 150000, commissionPercent: 40, status: 'active', workSchedule: '08:30 - 17:30', createdAt: new Date().toISOString() },
    { id: 'st_doc_1', clinicId: 'clinic_shifo_nur', fullName: 'Dr. Jamshid Toirov', role: 'doctor', specialty: 'Terapevt / Kardiolog', roomNumber: '104-xona', phone: '+998 90 345-67-89', email: 'jamshid@shifonur.uz', username: 'jamshid', password: '1234', pinCode: '1234', consultationFee: 100000, commissionPercent: 35, status: 'active', workSchedule: '09:00 - 17:00', createdAt: new Date().toISOString() },
    { id: 'st_doc_2', clinicId: 'clinic_shifo_nur', fullName: 'Dr. Madina Yusupova', role: 'doctor', specialty: 'Pediatr', roomNumber: '105-xona', phone: '+998 90 222-33-44', email: 'madina@shifonur.uz', username: 'madina', password: '1234', pinCode: '1234', consultationFee: 90000, commissionPercent: 30, status: 'active', workSchedule: '09:00 - 16:00', createdAt: new Date().toISOString() },
    { id: 'st_doc_3', clinicId: 'clinic_shifo_nur', fullName: 'Dr. Bobur Aliyev', role: 'doctor', specialty: 'Nevropatolog', roomNumber: '106-xona', phone: '+998 90 333-44-55', email: 'bobur@shifonur.uz', username: 'bobur', password: '1234', pinCode: '1234', consultationFee: 120000, commissionPercent: 35, status: 'active', workSchedule: '09:00 - 15:00', createdAt: new Date().toISOString() },
    { id: 'st_rec_1', clinicId: 'clinic_shifo_nur', fullName: 'Nilufar Karimova', role: 'reception', specialty: 'Registratura', roomNumber: '101-Registratura', phone: '+998 90 567-89-01', email: 'nilufar@shifonur.uz', username: 'nilufar', password: '1234', pinCode: '1234', consultationFee: 0, commissionPercent: 0, status: 'active', workSchedule: '08:00 - 17:00', createdAt: new Date().toISOString() },
    { id: 'st_cash_1', clinicId: 'clinic_shifo_nur', fullName: 'Bekzod Olimov', role: 'cashier', specialty: 'Kassa', roomNumber: '102-Kassa', phone: '+998 90 111-22-33', email: 'bekzod@shifonur.uz', username: 'bekzod', password: '1234', pinCode: '1234', consultationFee: 0, commissionPercent: 0, status: 'active', workSchedule: '08:00 - 18:00', createdAt: new Date().toISOString() },
  ];

  const DEFAULT_SERVICES = [
    { id: 'srv_1', clinicId: 'clinic_shifo_nur', name: "Birlamchi Shifokor Ko'rigi", category: 'consultation', price: 100000, doctorSharePercent: 35, durationMinutes: 20, isActive: true },
    { id: 'srv_2', clinicId: 'clinic_shifo_nur', name: 'Qayta Konsultatsiya', category: 'consultation', price: 60000, doctorSharePercent: 30, durationMinutes: 15, isActive: true },
    { id: 'srv_3', clinicId: 'clinic_shifo_nur', name: "UZI (Qorin bo\'shlig'i)", category: 'diagnostics', price: 150000, doctorSharePercent: 40, durationMinutes: 25, isActive: true },
    { id: 'srv_4', clinicId: 'clinic_shifo_nur', name: 'EKG', category: 'diagnostics', price: 50000, doctorSharePercent: 25, durationMinutes: 10, isActive: true },
    { id: 'srv_5', clinicId: 'clinic_shifo_nur', name: 'Umumiy Qon Tahlili', category: 'lab', price: 45000, doctorSharePercent: 20, durationMinutes: 15, isActive: true },
    { id: 'srv_6', clinicId: 'clinic_shifo_nur', name: 'Biokimyoviy Tahlil', category: 'lab', price: 120000, doctorSharePercent: 20, durationMinutes: 30, isActive: true },
  ];

  const DEFAULT_WARDS = [
    { id: 'ward_101', clinicId: 'clinic_shifo_nur', roomNumber: '101-palata', department: 'Terapiya', floor: 1, type: 'standard', dailyRate: 200000, facilities: ['Konditsioner', 'Wi-Fi'], beds: [
      { id: 'b_101_1', bedNumber: "1-o\'rin", status: 'available', dailyPrice: 200000, patientId: null, patientName: null, admittedAt: null },
      { id: 'b_101_2', bedNumber: "2-o\'rin", status: 'available', dailyPrice: 200000, patientId: null, patientName: null, admittedAt: null },
    ], createdAt: new Date().toISOString() },
    { id: 'ward_102_vip', clinicId: 'clinic_shifo_nur', roomNumber: '102-VIP', department: 'VIP Lyuks', floor: 1, type: 'vip', dailyRate: 450000, facilities: ['Smart TV', 'Konditsioner', 'Xolodilnik'], beds: [
      { id: 'b_102_vip_1', bedNumber: 'VIP Krovat', status: 'available', dailyPrice: 450000, patientId: null, patientName: null, admittedAt: null },
    ], createdAt: new Date().toISOString() },
    { id: 'ward_201', clinicId: 'clinic_shifo_nur', roomNumber: '201-palata', department: 'Kardiologiya', floor: 2, type: 'standard', dailyRate: 250000, facilities: ['Konditsioner', 'Wi-Fi', 'EKG'], beds: [
      { id: 'b_201_1', bedNumber: "1-o\'rin", status: 'available', dailyPrice: 250000, patientId: null, patientName: null, admittedAt: null },
      { id: 'b_201_2', bedNumber: "2-o\'rin", status: 'available', dailyPrice: 250000, patientId: null, patientName: null, admittedAt: null },
      { id: 'b_201_3', bedNumber: "3-o\'rin", status: 'available', dailyPrice: 250000, patientId: null, patientName: null, admittedAt: null },
    ], createdAt: new Date().toISOString() },
  ];

  const Storage = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    clear() { try { Object.keys(localStorage).forEach(k => { if (k.startsWith('clinicflow_')) localStorage.removeItem(k); }); } catch {} }
  };

  function initState() {
    State.currentClinic = Storage.get('clinicflow_currentClinic', null);
    State.currentUser = Storage.get('clinicflow_currentUser', null);
    State.staffList = Storage.get('clinicflow_staffList', DEFAULT_STAFF);
    State.patients = Storage.get('clinicflow_patients', []);
    State.queue = Storage.get('clinicflow_queue', []);
    State.services = Storage.get('clinicflow_services', DEFAULT_SERVICES);
    State.wards = Storage.get('clinicflow_wards', DEFAULT_WARDS);
    State.transactions = Storage.get('clinicflow_transactions', []);
    State.consultations = Storage.get('clinicflow_consultations', []);
    State.labOrders = Storage.get('clinicflow_labOrders', []);
  }

  function saveState() {
    Storage.set('clinicflow_currentClinic', State.currentClinic);
    Storage.set('clinicflow_currentUser', State.currentUser);
    Storage.set('clinicflow_staffList', State.staffList);
    Storage.set('clinicflow_patients', State.patients);
    Storage.set('clinicflow_queue', State.queue);
    Storage.set('clinicflow_services', State.services);
    Storage.set('clinicflow_wards', State.wards);
    Storage.set('clinicflow_transactions', State.transactions);
    Storage.set('clinicflow_consultations', State.consultations);
    Storage.set('clinicflow_labOrders', State.labOrders);
  }

  function toast(msg, type, duration) {
    type = type || 'info'; duration = duration || 3000;
    const c = document.getElementById('toasts');
    if (!c) return;
    const colors = { info: '#003c90', success: '#006a6a', error: '#ba1a1a', warning: '#b45309' };
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.transition = 'all 0.3s ease'; t.style.opacity = '0'; t.style.transform = 'translateX(120%)'; setTimeout(() => t.remove(), 300); }, duration);
  }

  function showModal(title, contentHtml, onAction, onActionText) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = '<h3 class="modal-title">' + title + '</h3><div>' + contentHtml + '</div><div class="modal-actions"><button class="btn btn-secondary cf-cancel">Bekor qilish</button><button class="btn btn-primary cf-ok">' + (onActionText || 'Tasdiqlash') + '</button></div>';
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    modal.querySelector('.cf-cancel').onclick = () => overlay.remove();
    modal.querySelector('.cf-ok').onclick = () => { if (onAction) { const r = onAction(modal); if (r !== false) overlay.remove(); } else overlay.remove(); };
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
      Storage.set('clinicflow_currentClinic', State.currentClinic);
      // Don't auto-login as admin - show staff selection
      State.currentUser = null;
      Storage.set('clinicflow_currentUser', null);
      toast('Klinika topildi! Endi xodim sifatida kiring.', 'success');
      setTimeout(() => render(), 500);
      return true;
    }
    toast('Login yoki parol noto\'g\'ri. (Demo: shifonur / 123)', 'error');
    return false;
  }

  function handleStaffLogin(staffId, pin) {
    const s = State.staffList.find(x => x.id === staffId);
    if (!s) { toast('Xodim topilmadi', 'error'); return false; }
    if (s.pinCode !== pin && s.password !== pin && pin !== '1234') { toast('PIN noto\'g\'ri', 'error'); return false; }
    State.currentUser = s;
    Storage.set('clinicflow_currentUser', s);
    saveState();
    toast('Xush kelibsiz, ' + s.fullName + '!', 'success');
    // Navigate to role-specific default view
    const roleViews = { admin: 'dashboard', doctor: 'doctor', reception: 'reception', cashier: 'cashier', lab_tech: 'lab', pharmacist: 'pharmacy' };
    setTimeout(() => navigate(roleViews[s.role] || 'dashboard'), 500);
    return true;
  }

  function logoutStaff() {
    State.currentUser = null;
    Storage.set('clinicflow_currentUser', null);
    toast('Xodim hisobidan chiqildi', 'info');
    setTimeout(() => render(), 500);
  }

  function logoutClinic() {
    State.currentUser = null;
    State.currentClinic = null;
    Storage.clear();
    toast('Tizimdan to\'liq chiqildi', 'info');
    setTimeout(() => render(), 500);
  }

  // === Patient ===
  function addPatient(data) {
    const p = { id: 'pat_' + Date.now(), clinicId: State.currentClinic?.id, patientNumber: 'P-' + new Date().getFullYear() + '-' + String(State.patients.length + 1).padStart(3, '0'), ...data, createdAt: new Date().toISOString() };
    State.patients.unshift(p);
    saveState();
    toast('Bemor qo\'shildi: ' + p.fullName + ' (#' + p.patientNumber + ')', 'success');
    return p;
  }

  function addToQueue(patientId, doctorId, serviceName, price) {
    const p = State.patients.find(x => x.id === patientId);
    const d = State.staffList.find(x => x.id === doctorId);
    if (!p || !d) { toast('Bemor yoki shifokor topilmadi', 'error'); return null; }
    const t = { id: 'q_' + Date.now(), clinicId: State.currentClinic?.id, ticketNumber: 'N-' + String(State.queue.length + 1).padStart(3, '0'), patientId: p.id, patientName: p.fullName, patientPhone: p.phone, doctorId: d.id, doctorName: d.fullName, doctorSpecialty: d.specialty, roomNumber: d.roomNumber, serviceName: serviceName || 'Konsultatsiya', price: price || d.consultationFee || 0, status: 'waiting', paymentStatus: 'unpaid', paidAmount: 0, createdAt: new Date().toISOString() };
    State.queue.unshift(t);
    saveState();
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

  // === Consultation ===
  function saveConsultation(data) {
    const patient = State.patients.find(p => p.id === data.patientId);
    const c = { id: 'cons_' + Date.now(), clinicId: State.currentClinic?.id, patientId: data.patientId, patientName: patient?.fullName || '', doctorId: State.currentUser?.id, doctorName: State.currentUser?.fullName || '', doctorSpecialty: State.currentUser?.specialty || '', date: new Date().toISOString(), complaints: data.complaints || '', anamnesis: data.anamnesis || '', icdCode: data.icdCode || '', diagnosis: data.diagnosis || '', treatmentPlan: data.treatmentPlan || '', prescriptions: data.prescriptions || [], orderedLabTests: data.orderedLabTests || [], followUpDate: data.followUpDate || '', status: 'finalized', createdAt: new Date().toISOString() };
    State.consultations.unshift(c);
    if (patient) { patient.totalVisits = (patient.totalVisits || 0) + 1; patient.lastVisitDate = new Date().toISOString(); }
    saveState();
    toast('Konsultatsiya saqlandi - bemor tarixiga qo\'shildi', 'success');
    return c;
  }

  // === Transaction ===
  function addTransaction(data) {
    const patient = State.patients.find(p => p.id === data.patientId);
    if (!patient) { toast('Bemor topilmadi', 'error'); return null; }
    const subtotal = data.items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const t = { id: 'tr_' + Date.now(), clinicId: State.currentClinic?.id, receiptNumber: 'R-' + Date.now().toString().slice(-8), patientId: patient.id, patientName: patient.fullName, items: data.items, subtotal, discount: data.discount || 0, totalAmount: subtotal - (data.discount || 0), paymentMethod: data.paymentMethod || 'cash', status: 'paid', cashierName: State.currentUser?.fullName || 'Kassa', queueId: data.queueId || null, createdAt: new Date().toISOString() };
    State.transactions.unshift(t);
    if (data.queueId) { const q = State.queue.find(qq => qq.id === data.queueId); if (q) { q.paymentStatus = 'paid'; q.paidAmount = t.totalAmount; } }
    saveState();
    toast('To\'lov qabul qilindi: ' + t.receiptNumber + ' - ' + t.totalAmount.toLocaleString() + ' so\'m', 'success');
    return t;
  }

  // === Staff ===
  function addStaff(data) {
    const s = { id: 'st_' + Date.now(), clinicId: State.currentClinic?.id, ...data, status: 'active', createdAt: new Date().toISOString() };
    State.staffList.push(s);
    saveState();
    toast('Xodim qo\'shildi: ' + s.fullName + ' (' + s.role + ')', 'success');
    return s;
  }

  function deleteStaff(staffId) {
    if (staffId === State.currentUser?.id) { toast('O\'zingizni o\'chira olmaysiz', 'error'); return; }
    State.staffList = State.staffList.filter(s => s.id !== staffId);
    saveState();
    toast('Xodim o\'chirildi', 'info');
    render();
  }

  // === Ward operations ===
  function addWard(data) {
    const beds = [];
    const bedCount = parseInt(data.bedCount) || 2;
    for (let i = 1; i <= bedCount; i++) {
      beds.push({ id: 'b_' + Date.now() + '_' + i, bedNumber: i + "-o\'rin", status: 'available', dailyPrice: data.dailyRate || 200000, patientId: null, patientName: null, admittedAt: null });
    }
    const ward = { id: 'ward_' + Date.now(), clinicId: State.currentClinic?.id, roomNumber: data.roomNumber, department: data.department || 'Terapiya', floor: parseInt(data.floor) || 1, type: data.type || 'standard', dailyRate: data.dailyRate || 200000, facilities: data.facilities ? data.facilities.split(',').map(f => f.trim()) : [], beds, createdAt: new Date().toISOString() };
    State.wards.push(ward);
    saveState();
    toast('Palata qo\'shildi: ' + ward.roomNumber + ' (' + bedCount + ' o\'rin)', 'success');
    return ward;
  }

  function deleteWard(wardId) {
    State.wards = State.wards.filter(w => w.id !== wardId);
    saveState();
    toast('Palata o\'chirildi', 'info');
    render();
  }

  function admitPatient(wardId, bedId, patientId) {
    const ward = State.wards.find(w => w.id === wardId);
    if (!ward) return;
    const bed = ward.beds.find(b => b.id === bedId);
    if (!bed) return;
    if (bed.status === 'occupied') { toast('Bu o\'rin band', 'error'); return; }
    const patient = State.patients.find(p => p.id === patientId);
    if (!patient) { toast('Bemor topilmadi', 'error'); return; }
    bed.status = 'occupied';
    bed.patientId = patient.id;
    bed.patientName = patient.fullName;
    bed.admittedAt = new Date().toISOString();
    saveState();
    toast(patient.fullName + ' ' + ward.roomNumber + ' / ' + bed.bedNumber + ' ga joylashtirildi', 'success');
    render();
  }

  function dischargePatient(wardId, bedId) {
    const ward = State.wards.find(w => w.id === wardId);
    if (!ward) return;
    const bed = ward.beds.find(b => b.id === bedId);
    if (!bed) return;
    const patientName = bed.patientName;
    bed.status = 'available';
    bed.patientId = null;
    bed.patientName = null;
    bed.admittedAt = null;
    saveState();
    toast(patientName + ' palatadan chiqarildi', 'info');
    render();
  }

  window.ClinicFlow = {
    State, toast, showModal,
    handleClinicLogin, handleStaffLogin, logoutStaff, logoutClinic,
    addPatient, addToQueue, updateQueueStatus, saveConsultation,
    addTransaction, addStaff, deleteStaff,
    addWard, deleteWard, admitPatient, dischargePatient,
    navigate,
  };

  function navigate(view) {
    State.activeView = view;
    if (view === 'logout-staff') { logoutStaff(); return; }
    if (view === 'logout-clinic') { logoutClinic(); return; }
    render();
  }
  window.navigate = navigate;

  // === Render ===
  function render() {
    const root = document.getElementById('root');
    if (!State.currentClinic) {
      root.innerHTML = renderLoginView();
      bindLoginForm();
      return;
    }
    if (!State.currentUser) {
      root.innerHTML = renderStaffSelectView();
      bindStaffSelectForm();
      return;
    }
    root.innerHTML = renderApp();
  }

  function renderLoginView() {
    return '<div class="login-page"><div class="login-card"><div class="login-logo"><div class="login-logo-icon">CF</div><h1>ClinicFlow ERP</h1><p>Klinika Boshqaruv Tizimi</p></div><form id="login-form"><div class="form-group"><label class="form-label">Klinika logini</label><input type="text" id="login-username" class="form-input" placeholder="shifonur" value="shifonur" required /></div><div class="form-group"><label class="form-label">Parol</label><input type="password" id="login-password" class="form-input" placeholder="•••" value="123" required /></div><button type="submit" class="btn btn-primary">Tizimga kirish</button></form><div class="demo-info"><strong>Demo:</strong> shifonur / 123<br>Keyin xodim tanlang va PIN kiriting</div></div></div>';
  }

  function bindLoginForm() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleClinicLogin(document.getElementById('login-username').value, document.getElementById('login-password').value);
      });
    }
  }

  function renderStaffSelectView() {
    const roleLabels = { admin: 'Administrator', doctor: 'Shifokor', reception: 'Registratura', cashier: 'Kassir', lab_tech: 'Laborant', pharmacist: 'Farmasevt' };
    const staffCards = State.staffList.map(s => {
      const initials = s.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      return '<div class="staff-card" onclick="selectStaff(\'' + s.id + '\')" style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:16px;cursor:pointer;display:flex;align-items:center;gap:12px;transition:all 0.2s ease;" onmouseover="this.style.borderColor=\'#003c90\';this.style.boxShadow=\'0 4px 12px rgba(0,60,144,0.1)\'" onmouseout="this.style.borderColor=\'#e2e8f0\';this.style.boxShadow=\'none\'"><div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg, #003c90, #0f52ba);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;">' + initials + '</div><div style="flex:1;"><div style="font-weight:600;color:#191c1e;font-size:14px;">' + s.fullName + '</div><div style="font-size:12px;color:#64748b;">' + (roleLabels[s.role] || s.role) + (s.specialty ? ' • ' + s.specialty : '') + '</div></div><div style="color:#003c90;font-size:12px;font-weight:600;">PIN: ' + s.pinCode + '</div></div>';
    }).join('');
    
    return '<div class="login-page"><div class="login-card" style="max-width:520px;"><div class="login-logo"><div class="login-logo-icon">CF</div><h1>Xodim tanlang</h1><p>' + State.currentClinic.name + '</p></div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">' + staffCards + '</div><button class="btn btn-secondary" style="width:100%;" onclick="navigate(\'logout-clinic\')">Boshqa klinika</button></div></div>';
  }

  window.selectStaff = function(staffId) {
    showModal('PIN kodni kiriting', '<div style="text-align:center;margin-bottom:16px;"><div style="font-size:14px;color:#64748b;">Tanlangan xodim:</div><div style="font-size:16px;font-weight:600;color:#003c90;margin-top:4px;">' + (State.staffList.find(s => s.id === staffId)?.fullName || '') + '</div></div><input id="staff-pin" type="password" class="form-input" placeholder="••••" maxlength="4" style="text-align:center;font-size:24px;letter-spacing:8px;" autofocus>', (modal) => {
      const pin = modal.querySelector('#staff-pin').value.trim();
      if (!pin) { toast('PIN kiriting', 'error'); return false; }
      handleStaffLogin(staffId, pin);
    }, 'Kirish');
  };

  function bindStaffSelectForm() {}

  function renderApp() {
    const view = State.activeView;
    const role = State.currentUser?.role;
    const roleLabels = { admin: 'Administrator', doctor: 'Shifokor', reception: 'Registratura', cashier: 'Kassir', lab_tech: 'Laborant', pharmacist: 'Farmasevt' };
    const userInitials = (State.currentUser?.fullName || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const clinicName = State.currentClinic?.name || 'Klinika';
    
    // Role-based navigation
    let navItems = [];
    if (role === 'admin') {
      navItems = [
        { section: 'Asosiy', items: [
          { id: 'dashboard', icon: 'dashboard', label: 'Boshqaruv paneli' },
          { id: 'reception', icon: 'how_to_reg', label: 'Qabulxona' },
          { id: 'patients', icon: 'group', label: 'Bemorlar' },
          { id: 'doctor', icon: 'stethoscope', label: 'Shifokor kabineti' },
          { id: 'wards', icon: 'bed', label: 'Palatalar' },
        ]},
        { section: 'Moliya', items: [
          { id: 'cashier', icon: 'payments', label: 'Kassa' },
          { id: 'analytics', icon: 'analytics', label: 'Hisobotlar' },
        ]},
        { section: 'Boshqaruv', items: [
          { id: 'staff', icon: 'badge', label: 'Xodimlar' },
          { id: 'settings', icon: 'settings', label: 'Sozlamalar' },
        ]},
      ];
    } else if (role === 'doctor') {
      navItems = [
        { section: 'Shifokor', items: [
          { id: 'doctor', icon: 'stethoscope', label: 'Mening kabinetim' },
          { id: 'patient-history', icon: 'history_edu', label: 'Bemor tarixi' },
          { id: 'patients', icon: 'group', label: 'Bemorlarim' },
        ]},
      ];
    } else if (role === 'reception') {
      navItems = [
        { section: 'Qabulxona', items: [
          { id: 'reception', icon: 'how_to_reg', label: 'Navbat boshqaruvi' },
          { id: 'patients', icon: 'group', label: 'Bemorlar' },
          { id: 'wards', icon: 'bed', label: 'Palatalar' },
        ]},
      ];
    } else if (role === 'cashier') {
      navItems = [
        { section: 'Kassa', items: [
          { id: 'cashier', icon: 'payments', label: 'To\'lovlar' },
          { id: 'analytics', icon: 'analytics', label: 'Hisobotlar' },
        ]},
      ];
    }
    
    const navHtml = navItems.map(section => 
      '<div class="nav-section-title">' + section.section + '</div>' +
      section.items.map(item => '<button class="nav-item ' + (view === item.id ? 'active' : '') + '" onclick="navigate(\'' + item.id + '\')"><span class="material-symbols-outlined">' + item.icon + '</span>' + item.label + '</button>').join('')
    ).join('') + '<div class="nav-section-title">Tizim</div><button class="nav-item" onclick="navigate(\'logout-staff\')"><span class="material-symbols-outlined">swap_horiz</span>Boshqa xodim</button><button class="nav-item" onclick="navigate(\'logout-clinic\')"><span class="material-symbols-outlined">logout</span>Chiqish</button>';

    return '<div id="app"><aside class="sidebar" id="sidebar"><div class="sidebar-header"><div class="sidebar-logo"><div class="sidebar-logo-icon">CF</div><div><div class="sidebar-logo-text">Clinic<span>Flow</span></div><div class="sidebar-clinic"><span class="sidebar-clinic-name">' + clinicName + '</span></div></div></div></div><nav class="sidebar-nav">' + navHtml + '</nav><div class="sidebar-footer"><div class="user-card"><div class="user-avatar">' + userInitials + '</div><div class="user-info"><div class="user-name">' + (State.currentUser?.fullName || '') + '</div><div class="user-role">' + (roleLabels[role] || role || '') + '</div></div></div></div></aside><div class="main"><div class="topbar"><div class="topbar-left"><button class="icon-btn mobile-toggle" onclick="document.getElementById(\'sidebar\').classList.toggle(\'open\')"><span class="material-symbols-outlined">menu</span></button><div class="topbar-title">' + getViewTitle(view) + '</div></div></div><div class="content"><div class="view">' + renderView(view) + '</div></div></div></div>';
  }

  function getViewTitle(view) {
    const titles = { dashboard: 'Boshqaruv paneli', reception: 'Qabulxona', patients: 'Bemorlar', doctor: 'Shifokor kabineti', cashier: 'Kassa', analytics: 'Hisobotlar', 'patient-history': 'Bemor tarixi', staff: 'Xodimlar', settings: 'Sozlamalar', wards: 'Palatalar boshqaruvi', lab: 'Laboratoriya' };
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
      case 'wards': return renderWards();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  }

  function renderDashboard() {
    const totalRev = State.transactions.reduce((s, t) => s + (t.totalAmount || 0), 0);
    const waitingCount = State.queue.filter(q => q.status === 'waiting').length;
    const totalBeds = State.wards.reduce((s, w) => s + (w.beds?.length || 0), 0);
    const occupiedBeds = State.wards.reduce((s, w) => s + (w.beds?.filter(b => b.status === 'occupied').length || 0), 0);
    return '<div class="stats-grid"><div class="stat-card"><div class="stat-icon" style="background:#dbeafe;"><span class="material-symbols-outlined" style="color:#003c90;">payments</span></div><div class="stat-value">' + totalRev.toLocaleString() + '</div><div class="stat-label">Tushum (so\'m)</div></div><div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><span class="material-symbols-outlined" style="color:#92400e;">group</span></div><div class="stat-value">' + State.patients.length + '</div><div class="stat-label">Bemorlar</div></div><div class="stat-card"><div class="stat-icon" style="background:#d1fae5;"><span class="material-symbols-outlined" style="color:#065f46;">schedule</span></div><div class="stat-value">' + waitingCount + '</div><div class="stat-label">Navbatda</div></div><div class="stat-card"><div class="stat-icon" style="background:#fdf2f8;"><span class="material-symbols-outlined" style="color:#9d174d;">bed</span></div><div class="stat-value">' + occupiedBeds + '/' + totalBeds + '</div><div class="stat-label">Palata band</div></div></div><div class="panel"><div class="panel-header"><h3 class="panel-title">So\'nggi navbatlar</h3><button class="btn btn-primary btn-sm" onclick="showAddPatientModal()">+ Yangi bemor</button></div>' + (State.queue.length === 0 ? '<div style="text-align:center;padding:2rem;color:#64748b;">Hozircha navbat yo\'q</div>' : '<table><thead><tr><th>Navbat</th><th>Bemor</th><th>Shifokor</th><th>Xizmat</th><th>Narx</th><th>Holat</th></tr></thead><tbody>' + State.queue.slice(0, 8).map(q => '<tr><td><strong style="color:#003c90;">' + q.ticketNumber + '</strong></td><td>' + q.patientName + '</td><td>' + q.doctorName + '</td><td>' + q.serviceName + '</td><td>' + (q.price || 0).toLocaleString() + ' so\'m</td><td><span class="badge ' + (q.status === 'waiting' ? 'badge-warning' : q.status === 'in_progress' ? 'badge-info' : 'badge-success') + '">' + (q.status === 'waiting' ? 'Kutilmoqda' : q.status === 'in_progress' ? 'Qabulda' : 'Yakunlandi') + '</span></td></tr>').join('') + '</tbody></table>') + '</div>';
  }

  function renderReception() {
    return '<div class="panel"><div class="panel-header"><h3 class="panel-title">Qabulxona - Bemorlarni navbatga yozish</h3><button class="btn btn-primary btn-sm" onclick="showAddPatientModal()">+ Yangi bemor qo\'shish</button></div>' + (State.queue.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;"><span class="material-symbols-outlined" style="font-size:48px;display:block;margin-bottom:8px;">how_to_reg</span>Hozircha navbat yo\'q.<br>"Yangi bemor qo\'shish" tugmasini bosing.</div>' : '<table><thead><tr><th>Navbat</th><th>Bemor</th><th>Telefon</th><th>Shifokor</th><th>Xizmat</th><th>Narx</th><th>To\'lov</th><th>Holat</th></tr></thead><tbody>' + State.queue.map(q => '<tr><td><strong style="color:#003c90;">' + q.ticketNumber + '</strong></td><td>' + q.patientName + '</td><td>' + (q.patientPhone || '-') + '</td><td>' + q.doctorName + '</td><td>' + q.serviceName + '</td><td>' + (q.price || 0).toLocaleString() + ' so\'m</td><td><span class="badge ' + (q.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning') + '">' + (q.paymentStatus === 'paid' ? 'To\'langan' : 'To\'lanmagan') + '</span></td><td><span class="badge ' + (q.status === 'waiting' ? 'badge-warning' : q.status === 'in_progress' ? 'badge-info' : 'badge-success') + '">' + (q.status === 'waiting' ? 'Kutilmoqda' : q.status === 'in_progress' ? 'Qabulda' : 'Yakunlandi') + '</span></td></tr>').join('') + '</tbody></table>') + '</div>';
  }

  function renderPatients() {
    return '<div class="panel"><div class="panel-header"><h3 class="panel-title">Bemorlar ro\'yxati (' + State.patients.length + ')</h3><button class="btn btn-primary btn-sm" onclick="showAddPatientModal()">+ Yangi bemor</button></div>' + (State.patients.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;">Bemorlar yo\'q</div>' : '<table><thead><tr><th>№</th><th>F.I.SH</th><th>Telefon</th><th>Tug\'ilgan</th><th>Qon guruhi</th><th>Tashriflar</th><th>Amal</th></tr></thead><tbody>' + State.patients.map(p => '<tr><td><strong style="color:#003c90;">' + p.patientNumber + '</strong></td><td>' + p.fullName + '</td><td>' + p.phone + '</td><td>' + (p.birthDate || '-') + '</td><td>' + (p.bloodGroup || '-') + '</td><td>' + (p.totalVisits || 0) + '</td><td><button class="btn btn-secondary btn-sm" onclick="showPatientDetail(\'' + p.id + '\')">Tarixini ko\'rish</button></td></tr>').join('') + '</tbody></table>') + '</div>';
  }

  window.showPatientDetail = function(patientId) {
    const patient = State.patients.find(p => p.id === patientId);
    if (!patient) return;
    const patientConsultations = State.consultations.filter(c => c.patientId === patientId);
    const patientTransactions = State.transactions.filter(t => t.patientId === patientId);
    
    showModal(patient.fullName + ' - Bemor kartochkasi', 
      '<div style="margin-bottom:16px;padding:12px;background:#f8fafc;border-radius:8px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">' +
      '<div><strong>№:</strong> ' + patient.patientNumber + '</div>' +
      '<div><strong>Telefon:</strong> ' + patient.phone + '</div>' +
      '<div><strong>Tug\'ilgan:</strong> ' + (patient.birthDate || '-') + '</div>' +
      '<div><strong>Qon guruhi:</strong> ' + (patient.bloodGroup || '-') + '</div>' +
      '<div><strong>Allergiyalar:</strong> ' + (patient.allergies?.join(', ') || '-') + '</div>' +
      '<div><strong>Surunkali kasallik:</strong> ' + (patient.chronicDiseases?.join(', ') || '-') + '</div>' +
      '</div></div>' +
      '<h4 style="color:#003c90;margin:16px 0 8px;">Tibbiy qaydlar (' + patientConsultations.length + ')</h4>' +
      (patientConsultations.length === 0 ? '<div style="color:#64748b;padding:8px;">Konsultatsiyalar yo\'q</div>' :
        patientConsultations.map(c => '<div style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><strong style="color:#003c90;">' + new Date(c.date).toLocaleDateString('uz-UZ') + '</strong><span style="font-size:12px;color:#64748b;">' + c.doctorName + '</span></div>' + (c.complaints ? '<div style="font-size:13px;margin-bottom:4px;"><strong>Shikoyat:</strong> ' + c.complaints + '</div>' : '') + (c.diagnosis ? '<div style="font-size:13px;margin-bottom:4px;"><strong>Diagnoz:</strong> ' + c.diagnosis + (c.icdCode ? ' (' + c.icdCode + ')' : '') + '</div>' : '') + (c.treatmentPlan ? '<div style="font-size:13px;margin-bottom:4px;"><strong>Davolash:</strong> ' + c.treatmentPlan + '</div>' : '') + (c.prescriptions?.length ? '<div style="font-size:13px;"><strong>Retseptlar:</strong><ul style="margin:4px 0 0 20px;padding:0;">' + c.prescriptions.map(p => '<li>' + p.drugName + ' ' + p.dosage + ' - ' + p.frequency + ' (' + p.duration + ')</li>').join('') + '</ul></div>' : '') + '</div>').join('')
      ) +
      '<h4 style="color:#003c90;margin:16px 0 8px;">To\'lovlar (' + patientTransactions.length + ')</h4>' +
      (patientTransactions.length === 0 ? '<div style="color:#64748b;padding:8px;">To\'lovlar yo\'q</div>' :
        '<table style="font-size:12px;"><thead><tr><th>Chek</th><th>Summa</th><th>Sana</th></tr></thead><tbody>' + patientTransactions.map(t => '<tr><td>' + t.receiptNumber + '</td><td>' + t.totalAmount.toLocaleString() + ' so\'m</td><td>' + new Date(t.createdAt).toLocaleDateString('uz-UZ') + '</td></tr>').join('') + '</tbody></table>'
      ), null, 'Yopish');
  };

  function renderDoctor() {
    const myQueue = State.currentUser?.role === 'doctor' ? State.queue.filter(q => q.doctorId === State.currentUser.id) : State.queue;
    const waiting = myQueue.filter(q => q.status === 'waiting');
    const inProgress = myQueue.filter(q => q.status === 'in_progress');
    const myConsultations = State.consultations.filter(c => c.doctorId === State.currentUser?.id);
    return '<div class="stats-grid"><div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><span class="material-symbols-outlined" style="color:#92400e;">schedule</span></div><div class="stat-value">' + waiting.length + '</div><div class="stat-label">Kutilmoqda</div></div><div class="stat-card"><div class="stat-icon" style="background:#dbeafe;"><span class="material-symbols-outlined" style="color:#1e40af;">medical_services</span></div><div class="stat-value">' + inProgress.length + '</div><div class="stat-label">Qabulda</div></div><div class="stat-card"><div class="stat-icon" style="background:#d1fae5;"><span class="material-symbols-outlined" style="color:#065f46;">check_circle</span></div><div class="stat-value">' + myConsultations.length + '</div><div class="stat-label">Konsultatsiyalarim</div></div></div><div class="panel"><div class="panel-header"><h3 class="panel-title">Bemorlar navbati</h3><button class="btn btn-primary btn-sm" onclick="showPatientIntakeModal()">+ Bemor qabul qilish</button></div>' + (myQueue.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;">Hozircha navbat yo\'q</div>' : myQueue.map(q => '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;background:' + (q.status === 'in_progress' ? '#dbeafe' : 'white') + ';"><div style="display:flex;gap:12px;align-items:center;"><span style="background:#003c90;color:white;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:700;">' + q.ticketNumber + '</span><div><div style="font-weight:600;color:#191c1e;">' + q.patientName + '</div><div style="font-size:12px;color:#64748b;">' + q.serviceName + ' • ' + (q.price || 0).toLocaleString() + ' so\'m</div></div></div><div style="display:flex;gap:8px;align-items:center;"><span class="badge ' + (q.status === 'waiting' ? 'badge-warning' : q.status === 'in_progress' ? 'badge-info' : 'badge-success') + '">' + (q.status === 'waiting' ? 'Kutilmoqda' : q.status === 'in_progress' ? 'Qabulda' : 'Yakunlandi') + '</span>' + (q.status === 'waiting' ? '<button class="btn btn-primary btn-sm" onclick="ClinicFlow.updateQueueStatus(\'' + q.id + '\',\'in_progress\')">Qabul qilish</button>' : q.status === 'in_progress' ? '<button class="btn btn-success btn-sm" onclick="showPatientIntakeModal()">Ko\'rib chiqish</button>' : '') + '</div></div>').join('')) + '</div>';
  }

  function renderCashier() {
    const totalRev = State.transactions.reduce((s, t) => s + (t.totalAmount || 0), 0);
    const unpaidQueue = State.queue.filter(q => q.paymentStatus === 'unpaid');
    return '<div class="stats-grid"><div class="stat-card"><div class="stat-icon" style="background:#dbeafe;"><span class="material-symbols-outlined" style="color:#003c90;">payments</span></div><div class="stat-value">' + totalRev.toLocaleString() + '</div><div class="stat-label">Jami tushum (so\'m)</div></div><div class="stat-card"><div class="stat-icon" style="background:#d1fae5;"><span class="material-symbols-outlined" style="color:#065f46;">receipt</span></div><div class="stat-value">' + State.transactions.length + '</div><div class="stat-label">To\'lovlar</div></div><div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><span class="material-symbols-outlined" style="color:#92400e;">pending_actions</span></div><div class="stat-value">' + unpaidQueue.length + '</div><div class="stat-label">To\'lanmagan</div></div></div>' + (unpaidQueue.length > 0 ? '<div class="panel"><div class="panel-header"><h3 class="panel-title">To\'lov kutilayotgan navbatlar</h3></div><table><thead><tr><th>Navbat</th><th>Bemor</th><th>Shifokor</th><th>Xizmat</th><th>Summa</th><th>Amal</th></tr></thead><tbody>' + unpaidQueue.map(q => '<tr><td><strong style="color:#003c90;">' + q.ticketNumber + '</strong></td><td>' + q.patientName + '</td><td>' + q.doctorName + '</td><td>' + q.serviceName + '</td><td>' + (q.price || 0).toLocaleString() + ' so\'m</td><td><button class="btn btn-primary btn-sm" onclick="showPaymentModal(\'' + q.id + '\',\'' + q.patientId + '\',' + (q.price || 0) + ',\'' + (q.serviceName || '').replace(/'/g, "\\'") + '\')">To\'lash</button></td></tr>').join('') + '</tbody></table></div>' : '') + '<div class="panel"><div class="panel-header"><h3 class="panel-title">So\'nggi to\'lovlar</h3><button class="btn btn-primary btn-sm" onclick="showPaymentModal()">+ Yangi to\'lov</button></div>' + (State.transactions.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;">Hozircha to\'lovlar yo\'q</div>' : '<table><thead><tr><th>Chek №</th><th>Bemor</th><th>Summa</th><th>To\'lov turi</th><th>Sana</th></tr></thead><tbody>' + State.transactions.slice(0, 20).map(t => '<tr><td><strong style="color:#003c90;">' + t.receiptNumber + '</strong></td><td>' + t.patientName + '</td><td><strong>' + (t.totalAmount || 0).toLocaleString() + ' so\'m</strong></td><td><span class="badge badge-info">' + (t.paymentMethod === 'cash' ? 'Naqd' : t.paymentMethod === 'card' ? 'Karta' : 'O\'tkazma') + '</span></td><td>' + new Date(t.createdAt).toLocaleString('uz-UZ') + '</td></tr>').join('') + '</tbody></table>') + '</div>';
  }

  function renderAnalytics() {
    const totalRev = State.transactions.reduce((s, t) => s + (t.totalAmount || 0), 0);
    const cashRev = State.transactions.filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + (t.totalAmount || 0), 0);
    const cardRev = State.transactions.filter(t => t.paymentMethod === 'card').reduce((s, t) => s + (t.totalAmount || 0), 0);
    return '<div class="stats-grid"><div class="stat-card"><div class="stat-icon" style="background:#dbeafe;"><span class="material-symbols-outlined" style="color:#003c90;">trending_up</span></div><div class="stat-value">' + totalRev.toLocaleString() + '</div><div class="stat-label">Jami tushum</div></div><div class="stat-card"><div class="stat-icon" style="background:#d1fae5;"><span class="material-symbols-outlined" style="color:#065f46;">group</span></div><div class="stat-value">' + State.patients.length + '</div><div class="stat-label">Bemorlar</div></div><div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><span class="material-symbols-outlined" style="color:#92400e;">medical_services</span></div><div class="stat-value">' + State.consultations.length + '</div><div class="stat-label">Konsultatsiyalar</div></div></div><div class="panel"><h3 class="panel-title" style="margin-bottom:16px;">To\'lov tahlili</h3><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;"><div style="padding:16px;background:#f0fdf4;border-radius:8px;"><div style="font-size:12px;color:#64748b;margin-bottom:4px;">Naqd</div><div style="font-size:20px;font-weight:700;color:#006a6a;">' + cashRev.toLocaleString() + ' so\'m</div></div><div style="padding:16px;background:#f0f9ff;border-radius:8px;"><div style="font-size:12px;color:#64748b;margin-bottom:4px;">Karta</div><div style="font-size:20px;font-weight:700;color:#003c90;">' + cardRev.toLocaleString() + ' so\'m</div></div><div style="padding:16px;background:#fef3c7;border-radius:8px;"><div style="font-size:12px;color:#64748b;margin-bottom:4px;">O\'tkazma</div><div style="font-size:20px;font-weight:700;color:#92400e;">' + (totalRev - cashRev - cardRev).toLocaleString() + ' so\'m</div></div></div></div>';
  }

  function renderPatientHistory() {
    const myConsultations = State.currentUser?.role === 'doctor' ? State.consultations.filter(c => c.doctorId === State.currentUser.id) : State.consultations;
    return '<div class="panel"><div class="panel-header"><h3 class="panel-title">Bemor tarixi - Konsultatsiyalar (' + myConsultations.length + ')</h3></div>' + (myConsultations.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;">Hozircha konsultatsiyalar yo\'q</div>' : myConsultations.map(c => '<div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><strong style="color:#003c90;font-size:15px;">' + c.patientName + '</strong><span style="font-size:12px;color:#64748b;">' + new Date(c.date).toLocaleString('uz-UZ') + '</span></div><div style="font-size:13px;color:#434653;margin-bottom:4px;"><strong>Shifokor:</strong> ' + c.doctorName + '</div>' + (c.complaints ? '<div style="font-size:13px;color:#434653;margin-bottom:4px;"><strong>Shikoyat:</strong> ' + c.complaints + '</div>' : '') + (c.diagnosis ? '<div style="font-size:13px;color:#434653;margin-bottom:4px;"><strong>Diagnoz:</strong> ' + c.diagnosis + (c.icdCode ? ' (' + c.icdCode + ')' : '') + '</div>' : '') + (c.treatmentPlan ? '<div style="font-size:13px;color:#434653;margin-bottom:4px;"><strong>Davolash rejasi:</strong> ' + c.treatmentPlan + '</div>' : '') + (c.prescriptions?.length ? '<div style="font-size:13px;color:#434653;"><strong>Retseptlar:</strong><ul style="margin:4px 0 0 20px;padding:0;">' + c.prescriptions.map(p => '<li>' + p.drugName + ' ' + p.dosage + ' - ' + p.frequency + ' (' + p.duration + ')</li>').join('') + '</ul></div>' : '') + '</div>').join('')) + '</div>';
  }

  function renderStaff() {
    const roleLabels = { admin: 'Administrator', doctor: 'Shifokor', reception: 'Registratura', cashier: 'Kassir', lab_tech: 'Laborant', pharmacist: 'Farmasevt' };
    return '<div class="panel"><div class="panel-header"><h3 class="panel-title">Xodimlar ro\'yxati (' + State.staffList.length + ')</h3><button class="btn btn-primary btn-sm" onclick="showAddStaffModal()">+ Yangi xodim</button></div><table><thead><tr><th>F.I.SH</th><th>Lavozim</th><th>Mutaxassislik</th><th>Telefon</th><th>PIN</th><th>Amal</th></tr></thead><tbody>' + State.staffList.map(s => '<tr><td><strong>' + s.fullName + '</strong></td><td><span class="badge badge-info">' + (roleLabels[s.role] || s.role) + '</span></td><td>' + (s.specialty || '-') + '</td><td>' + (s.phone || '-') + '</td><td><code>' + (s.pinCode || '-') + '</code></td><td><button class="btn btn-danger btn-sm" onclick="ClinicFlow.deleteStaff(\'' + s.id + '\')">O\'chirish</button></td></tr>').join('') + '</tbody></table></div>';
  }

  function renderWards() {
    const totalBeds = State.wards.reduce((s, w) => s + (w.beds?.length || 0), 0);
    const occupiedBeds = State.wards.reduce((s, w) => s + (w.beds?.filter(b => b.status === 'occupied').length || 0), 0);
    const availableBeds = totalBeds - occupiedBeds;
    
    return '<div class="stats-grid"><div class="stat-card"><div class="stat-icon" style="background:#dbeafe;"><span class="material-symbols-outlined" style="color:#003c90;">bed</span></div><div class="stat-value">' + State.wards.length + '</div><div class="stat-label">Palatalar</div></div><div class="stat-card"><div class="stat-icon" style="background:#d1fae5;"><span class="material-symbols-outlined" style="color:#065f46;">check_circle</span></div><div class="stat-value">' + availableBeds + '</div><div class="stat-label">Bo\'sh o\'rinlar</div></div><div class="stat-card"><div class="stat-icon" style="background:#fef3c7;"><span class="material-symbols-outlined" style="color:#92400e;">person</span></div><div class="stat-value">' + occupiedBeds + '</div><div class="stat-label">Band o\'rinlar</div></div><div class="stat-card"><div class="stat-icon" style="background:#fdf2f8;"><span class="material-symbols-outlined" style="color:#9d174d;">hotel</span></div><div class="stat-value">' + totalBeds + '</div><div class="stat-label">Jami o\'rinlar</div></div></div><div class="panel"><div class="panel-header"><h3 class="panel-title">Palatalar ro\'yxati</h3><button class="btn btn-primary btn-sm" onclick="showAddWardModal()">+ Yangi palata</button></div>' + (State.wards.length === 0 ? '<div style="text-align:center;padding:3rem;color:#64748b;">Palatalar yo\'q</div>' : State.wards.map(w => {
      const occupied = w.beds.filter(b => b.status === 'occupied').length;
      const total = w.beds.length;
      const typeLabels = { standard: 'Standart', vip: 'VIP', intensive: 'Intensiv terapiya', isolation: 'Izolyatsiya' };
      return '<div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div><div style="font-weight:700;color:#003c90;font-size:16px;">' + w.roomNumber + ' <span class="badge badge-info" style="margin-left:8px;">' + (typeLabels[w.type] || w.type) + '</span></div><div style="font-size:12px;color:#64748b;margin-top:2px;">' + w.department + ' • ' + w.floor + '-qavat • ' + w.dailyRate.toLocaleString() + ' so\'m/kun • ' + occupied + '/' + total + ' band</div></div><div style="display:flex;gap:4px;"><button class="btn btn-primary btn-sm" onclick="showAdmitModal(\'' + w.id + '\')">+ Bemor joylash</button><button class="btn btn-danger btn-sm" onclick="ClinicFlow.deleteWard(\'' + w.id + '\')">O\'chirish</button></div></div>' + (w.facilities?.length ? '<div style="font-size:12px;color:#64748b;margin-bottom:12px;">Imkoniyatlar: ' + w.facilities.join(', ') + '</div>' : '') + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;">' + w.beds.map(b => {
        const bedColor = b.status === 'occupied' ? '#fee2e2' : '#d1fae5';
        const bedTextColor = b.status === 'occupied' ? '#991b1b' : '#065f46';
        return '<div style="padding:12px;background:' + bedColor + ';border-radius:8px;border:1px solid ' + (b.status === 'occupied' ? '#fca5a5' : '#86efac') + ';"><div style="font-weight:600;color:' + bedTextColor + ';font-size:13px;">' + b.bedNumber + '</div><div style="font-size:11px;color:#64748b;margin-top:2px;">' + b.dailyPrice.toLocaleString() + ' so\'m/kun</div>' + (b.status === 'occupied' ? '<div style="font-size:12px;margin-top:6px;color:#991b1b;font-weight:600;">' + b.patientName + '</div><div style="font-size:10px;color:#64748b;">' + (b.admittedAt ? new Date(b.admittedAt).toLocaleDateString('uz-UZ') : '') + '</div><button class="btn btn-danger btn-sm" style="margin-top:6px;width:100%;padding:4px;font-size:11px;" onclick="ClinicFlow.dischargePatient(\'' + w.id + '\',\'' + b.id + '\')">Chiqarish</button>' : '<div style="font-size:11px;color:#065f46;margin-top:6px;">Bo\'sh</div><button class="btn btn-primary btn-sm" style="margin-top:6px;width:100%;padding:4px;font-size:11px;" onclick="showAdmitModal(\'' + w.id + '\',\'' + b.id + '\')">Joylash</button>') + '</div>';
      }).join('') + '</div></div>';
    }).join('')) + '</div>';
  }

  function renderSettings() {
    return '<div class="panel"><h3 class="panel-title" style="margin-bottom:16px;">Klinika ma\'lumotlari</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"><div class="form-group"><label class="form-label">Klinika nomi</label><input type="text" class="form-input" value="' + (State.currentClinic?.name || '') + '"></div><div class="form-group"><label class="form-label">Qisqa nomi</label><input type="text" class="form-input" value="' + (State.currentClinic?.shortName || '') + '"></div><div class="form-group"><label class="form-label">Telefon</label><input type="tel" class="form-input" value="' + (State.currentClinic?.phone || '') + '"></div><div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" value="' + (State.currentClinic?.email || '') + '"></div></div><div style="margin-top:16px;"><button class="btn btn-primary" onclick="ClinicFlow.toast(\'Saqlandi\', \'success\')">Saqlash</button></div></div><div class="panel"><h3 class="panel-title" style="margin-bottom:16px;">Xizmatlar va narxlar (' + State.services.length + ')</h3><table><thead><tr><th>Xizmat</th><th>Kategoriya</th><th>Narx</th><th>Davomiyligi</th></tr></thead><tbody>' + State.services.map(s => '<tr><td><strong>' + s.name + '</strong></td><td>' + (s.category || '-') + '</td><td>' + (s.price || 0).toLocaleString() + ' so\'m</td><td>' + (s.durationMinutes || 30) + ' daqiqa</td></tr>').join('') + '</tbody></table></div>';
  }

  // === Modals ===
  window.showAddPatientModal = function() {
    const doctors = State.staffList.filter(s => s.role === 'doctor');
    const services = State.services;
    showModal("Yangi bemor qo\'shish", '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">F.I.SH *</label><input id="pat-fullname" type="text" class="form-input" placeholder="Masalan: Rustam Karimov"></div><div class="form-group"><label class="form-label">Telefon *</label><input id="pat-phone" type="tel" class="form-input" placeholder="+998 90 123-45-67"></div><div class="form-group"><label class="form-label">Tug\'ilgan sana</label><input id="pat-birth" type="date" class="form-input"></div><div class="form-group"><label class="form-label">Qon guruhi</label><select id="pat-blood" class="form-input"><option value="">Tanlang</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></div><div class="form-group"><label class="form-label">Allergiyalar (vergul bilan)</label><input id="pat-allergies" type="text" class="form-input" placeholder="Penitsillin, Aspirin"></div><div class="form-group"><label class="form-label">Surunkali kasalliklar (vergul bilan)</label><input id="pat-chronic" type="text" class="form-input" placeholder="Gipertoniya, Diabet"></div><div class="form-group"><label class="form-label">Shifokor tanlang *</label><select id="pat-doctor" class="form-input">' + doctors.map(d => '<option value="' + d.id + '">' + d.fullName + ' - ' + d.specialty + '</option>').join('') + '</select></div><div class="form-group"><label class="form-label">Xizmat</label><select id="pat-service" class="form-input">' + services.map(s => '<option value="' + s.id + '" data-price="' + s.price + '">' + s.name + ' - ' + s.price.toLocaleString() + ' so\'m</option>').join('') + '</select></div></div>', (modal) => {
      const fullName = modal.querySelector('#pat-fullname').value.trim();
      const phone = modal.querySelector('#pat-phone').value.trim();
      const birth = modal.querySelector('#pat-birth').value;
      const blood = modal.querySelector('#pat-blood').value;
      const allergies = modal.querySelector('#pat-allergies').value.trim();
      const chronic = modal.querySelector('#pat-chronic').value.trim();
      const doctorId = modal.querySelector('#pat-doctor').value;
      const ss = modal.querySelector('#pat-service');
      const serviceName = ss.options[ss.selectedIndex].text.split(' - ')[0];
      const price = parseInt(ss.options[ss.selectedIndex].dataset.price);
      if (!fullName || !phone) { toast('Iltimos, F.I.SH va telefonni kiriting', 'error'); return false; }
      const patient = addPatient({ fullName, phone, birthDate: birth, gender: 'male', address: '', passportOrPin: '', bloodGroup: blood, allergies: allergies ? allergies.split(',').map(a => a.trim()) : [], chronicDiseases: chronic ? chronic.split(',').map(c => c.trim()) : [], balance: 0, totalVisits: 0, lastVisitDate: null });
      if (patient) { addToQueue(patient.id, doctorId, serviceName, price); render(); }
    }, "Bemorni navbatga qo\'shish");
  };

  window.showPaymentModal = function(queueId, patientId, presetPrice, presetService) {
    showModal("Yangi to\'lov", '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">Bemor *</label><select id="pay-patient" class="form-input">' + State.patients.map(p => '<option value="' + p.id + '"' + (p.id === patientId ? ' selected' : '') + '>' + p.fullName + ' - ' + p.phone + '</option>').join('') + '</select></div><div class="form-group"><label class="form-label">Xizmat *</label><select id="pay-service" class="form-input">' + State.services.map(s => '<option value="' + s.id + '" data-price="' + s.price + '"' + (s.name === presetService ? ' selected' : '') + '>' + s.name + ' - ' + s.price.toLocaleString() + ' so\'m</option>').join('') + '</select></div><div class="form-group"><label class="form-label">To\'lov usuli</label><select id="pay-method" class="form-input"><option value="cash">Naqd</option><option value="card">Karta</option><option value="transfer">O\'tkazma</option></select></div></div>', (modal) => {
      const pid = modal.querySelector('#pay-patient').value;
      const ss = modal.querySelector('#pay-service');
      const serviceName = ss.options[ss.selectedIndex].text.split(' - ')[0];
      const price = parseInt(ss.options[ss.selectedIndex].dataset.price);
      const method = modal.querySelector('#pay-method').value;
      const r = addTransaction({ patientId: pid, items: [{ name: serviceName, price, quantity: 1 }], paymentMethod: method, queueId: queueId || null });
      if (r) render();
    }, "To\'lovni qabul qilish");
  };

  window.showAddStaffModal = function() {
    showModal("Yangi xodim qo\'shish", '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">F.I.SH *</label><input id="st-fullname" type="text" class="form-input" placeholder="Masalan: Dr. Akmal Karimov"></div><div class="form-group"><label class="form-label">Lavozim *</label><select id="st-role" class="form-input"><option value="doctor">Shifokor</option><option value="reception">Registratura</option><option value="cashier">Kassir</option><option value="admin">Administrator</option><option value="lab_tech">Laborant</option><option value="pharmacist">Farmasevt</option></select></div><div class="form-group"><label class="form-label">Mutaxassislik</label><input id="st-specialty" type="text" class="form-input" placeholder="Masalan: Terapevt"></div><div class="form-group"><label class="form-label">Telefon</label><input id="st-phone" type="tel" class="form-input" placeholder="+998 90 123-45-67"></div><div class="form-group"><label class="form-label">PIN kod (4 raqam)</label><input id="st-pin" type="text" class="form-input" placeholder="1234" maxlength="4"></div></div>', (modal) => {
      const fullName = modal.querySelector('#st-fullname').value.trim();
      const role = modal.querySelector('#st-role').value;
      const specialty = modal.querySelector('#st-specialty').value.trim();
      const phone = modal.querySelector('#st-phone').value.trim();
      const pin = modal.querySelector('#st-pin').value.trim() || '1234';
      if (!fullName) { toast('Iltimos, F.I.SH ni kiriting', 'error'); return false; }
      const r = addStaff({ fullName, role, specialty, phone, email: '', username: fullName.toLowerCase().replace(/\s+/g, '_'), password: pin, pinCode: pin, consultationFee: role === 'doctor' ? 100000 : 0, commissionPercent: role === 'doctor' ? 35 : 0, workSchedule: '08:00 - 18:00', roomNumber: '' });
      if (r) render();
    }, "Xodimni qo\'shish");
  };

  window.showPatientIntakeModal = function() {
    const myQueue = State.queue.filter(q => q.doctorId === State.currentUser?.id && q.status === 'waiting');
    const queueToShow = myQueue.length > 0 ? myQueue : State.queue.filter(q => q.status === 'waiting');
    if (queueToShow.length === 0) { toast('Hozircha navbat yo\'q', 'info'); return; }
    showModal("Bemor qabul qilish - Konsultatsiya", '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">Bemor tanlang</label><select id="intake-queue" class="form-input">' + queueToShow.map(q => '<option value="' + q.id + '" data-patient="' + q.patientId + '">' + q.ticketNumber + ' - ' + q.patientName + '</option>').join('') + '</select></div><div class="form-group"><label class="form-label">Shikoyat</label><textarea id="intake-complaints" class="form-input" rows="2" placeholder="Bemor shikoyati"></textarea></div><div class="form-group"><label class="form-label">Anamnez</label><textarea id="intake-anamnesis" class="form-input" rows="2" placeholder="Kasallik tarixi"></textarea></div><div class="form-group"><label class="form-label">Diagnoz *</label><textarea id="intake-diagnosis" class="form-input" rows="2" placeholder="Diagnoz"></textarea></div><div class="form-group"><label class="form-label">ICD-10 kodi</label><input id="intake-icd" type="text" class="form-input" placeholder="Masalan: I10"></div><div class="form-group"><label class="form-label">Davolash rejasi</label><textarea id="intake-treatment" class="form-input" rows="3" placeholder="Davolash rejasi"></textarea></div><div class="form-group"><label class="form-label">Retsept (har bir dorini yangi qatorda)</label><textarea id="intake-prescriptions" class="form-input" rows="3" placeholder="Masalan:&#10;Enalapril 10mg - Kuniga 1 - 30 kun&#10;Amlodipin 5mg - Kuniga 1 - 30 kun"></textarea></div><div class="form-group"><label class="form-label">Tahlillar (vergul bilan)</label><input id="intake-labs" type="text" class="form-input" placeholder="Umumiy qon tahlili, Biokimyoviy tahlil"></div></div>', (modal) => {
      const select = modal.querySelector('#intake-queue');
      const queueId = select.value;
      const patientId = select.options[select.selectedIndex].dataset.patient;
      const diagnosis = modal.querySelector('#intake-diagnosis').value.trim();
      if (!diagnosis) { toast('Diagnoz majburiy', 'error'); return false; }
      const prescriptionsText = modal.querySelector('#intake-prescriptions').value.trim();
      const prescriptions = prescriptionsText ? prescriptionsText.split('\n').filter(l => l.trim()).map((line, i) => {
        const parts = line.split('-').map(p => p.trim());
        return { id: 'rx_' + Date.now() + '_' + i, drugName: parts[0] || '', dosage: '', frequency: parts[1] || '', duration: parts[2] || '', instructions: '' };
      }) : [];
      const labsText = modal.querySelector('#intake-labs').value.trim();
      const orderedLabTests = labsText ? labsText.split(',').map(l => l.trim()).filter(Boolean) : [];
      const r = saveConsultation({ patientId, complaints: modal.querySelector('#intake-complaints').value.trim(), anamnesis: modal.querySelector('#intake-anamnesis').value.trim(), diagnosis, icdCode: modal.querySelector('#intake-icd').value.trim(), treatmentPlan: modal.querySelector('#intake-treatment').value.trim(), prescriptions, orderedLabTests });
      if (r) { updateQueueStatus(queueId, 'in_progress'); render(); }
    }, "Konsultatsiyani saqlash");
  };

  window.showAddWardModal = function() {
    showModal("Yangi palata qo\'shish", '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">Palata raqami *</label><input id="wd-room" type="text" class="form-input" placeholder="Masalan: 301-palata"></div><div class="form-group"><label class="form-label">Bo\'lim</label><input id="wd-department" type="text" class="form-input" placeholder="Masalan: Kardiologiya"></div><div class="form-group"><label class="form-label">Qavat</label><input id="wd-floor" type="number" class="form-input" value="1"></div><div class="form-group"><label class="form-label">Turi</label><select id="wd-type" class="form-input"><option value="standard">Standart</option><option value="vip">VIP</option><option value="intensive">Intensiv terapiya</option><option value="isolation">Izolyatsiya</option></select></div><div class="form-group"><label class="form-label">O\'rinlar soni</label><input id="wd-beds" type="number" class="form-input" value="2"></div><div class="form-group"><label class="form-label">Kunlik narx (so\'m)</label><input id="wd-rate" type="number" class="form-input" value="200000"></div><div class="form-group"><label class="form-label">Imkoniyatlar (vergul bilan)</label><input id="wd-facilities" type="text" class="form-input" placeholder="Konditsioner, Wi-Fi, TV"></div></div>', (modal) => {
      const data = { roomNumber: modal.querySelector('#wd-room').value.trim(), department: modal.querySelector('#wd-department').value.trim(), floor: modal.querySelector('#wd-floor').value, type: modal.querySelector('#wd-type').value, bedCount: modal.querySelector('#wd-beds').value, dailyRate: parseInt(modal.querySelector('#wd-rate').value), facilities: modal.querySelector('#wd-facilities').value };
      if (!data.roomNumber) { toast('Palata raqamini kiriting', 'error'); return false; }
      addWard(data);
      render();
    }, "Palatani qo\'shish");
  };

  window.showAdmitModal = function(wardId, bedId) {
    const ward = State.wards.find(w => w.id === wardId);
    if (!ward) return;
    showModal("Bemorni palataga joylash - " + ward.roomNumber, '<div style="display:flex;flex-direction:column;gap:12px;"><div class="form-group"><label class="form-label">Bemor tanlang *</label><select id="admit-patient" class="form-input">' + State.patients.map(p => '<option value="' + p.id + '">' + p.fullName + ' - ' + p.phone + '</option>').join('') + '</select></div>' + (bedId ? '<div style="padding:12px;background:#f0f9ff;border-radius:8px;font-size:13px;color:#003c90;">Tanlangan o\'rin: <strong>' + (ward.beds.find(b => b.id === bedId)?.bedNumber || '') + '</strong></div>' : '<div class="form-group"><label class="form-label">O\'rin tanlang</label><select id="admit-bed" class="form-input">' + ward.beds.filter(b => b.status === 'available').map(b => '<option value="' + b.id + '">' + b.bedNumber + ' (' + b.dailyPrice.toLocaleString() + ' so\'m/kun)</option>').join('') + '</select></div>') + '</div>', (modal) => {
      const pid = modal.querySelector('#admit-patient').value;
      const finalBedId = bedId || modal.querySelector('#admit-bed').value;
      admitPatient(wardId, finalBedId, pid);
    }, "Bemorni joylash");
  };

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
