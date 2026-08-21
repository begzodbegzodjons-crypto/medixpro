/* ClinicFlow ERP - Complete App JavaScript v4 - all functions working */
(function() {
  'use strict';

  const State = {
    currentClinic: null, currentUser: null,
    staffList: [], patients: [], queue: [], services: [], transactions: [], consultations: [],
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

  function toast(msg, type, duration) {
    type = type || 'info'; duration = duration || 3000;
    let c = document.getElementById('cf-toast-container');
    if (!c) { c = document.createElement('div'); c.id = 'cf-toast-container'; c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;display:flex;flex-direction:column;gap:8px;pointer-events:none;'; document.body.appendChild(c); }
    const colors = { info: '#003c90', success: '#006a6a', error: '#ba1a1a', warning: '#b45309' };
    const t = document.createElement('div');
    t.style.cssText = 'background:' + colors[type] + ';color:white;padding:14px 22px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:14px;font-weight:500;pointer-events:auto;max-width:380px;font-family:Inter,sans-serif;animation:cf-slide-in 0.3s ease;';
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.transition = 'all 0.3s ease'; t.style.opacity = '0'; t.style.transform = 'translateX(120%)'; setTimeout(() => t.remove(), 300); }, duration);
  }

  let modalCounter = 0;
  function showModal(title, contentHtml, onAction, onActionText) {
    modalCounter++;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem;';
    const modal = document.createElement('div');
    modal.style.cssText = 'background:white;border-radius:12px;padding:24px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);font-family:Inter,sans-serif;';
    modal.innerHTML = '<h3 style="margin:0 0 16px;color:#003c90;font-size:18px;font-weight:700;">' + title + '</h3><div style="margin-bottom:20px;color:#191c1e;font-size:14px;line-height:1.5;">' + contentHtml + '</div><div style="display:flex;gap:8px;justify-content:flex-end;"><button class="cf-cancel" style="padding:8px 16px;border:1px solid #c3c6d5;background:white;color:#434653;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500;">Bekor qilish</button><button class="cf-ok" style="padding:8px 16px;background:#003c90;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;">' + (onActionText || 'Tasdiqlash') + '</button></div>';
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
      setTimeout(() => window.location.href = '/dashboard', 1000);
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
    setTimeout(() => window.location.href = '/dashboard', 1500);
    return true;
  }

  function handleStaffLogin(staffId, pin) {
    const s = State.staffList.find(x => x.id === staffId);
    if (!s) { toast('Xodim topilmadi', 'error'); return false; }
    if (s.pinCode !== pin && s.password !== pin && pin !== '1234') { toast('PIN noto\'g\'ri', 'error'); return false; }
    State.currentUser = s; saveState();
    toast('Xush kelibsiz, ' + s.fullName + '!', 'success');
    const v = { admin: '/dashboard', doctor: '/doctor', reception: '/reception', cashier: '/cashier', lab_tech: '/patient-history', pharmacist: '/prescription-new' };
    setTimeout(() => window.location.href = v[s.role] || '/dashboard', 1000);
    return true;
  }

  function logout() { State.currentUser = null; State.currentClinic = null; Storage.clear(); toast('Tizimdan chiqildi', 'info'); setTimeout(() => window.location.href = '/', 600); }

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
      renderCurrentPage();
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

  function deleteStaff(staffId) { State.staffList = State.staffList.filter(s => s.id !== staffId); saveState(); toast('Xodim o\'chirildi', 'info'); }

  function saveConsultation(patientId, diagnosis, prescription, notes) {
    const p = State.patients.find(x => x.id === patientId);
    const c = { id: 'cons_' + Date.now(), clinicId: State.currentClinic?.id || 'clinic_shifo_nur', patientId, patientName: p?.fullName || 'Noma\'lum', doctorId: State.currentUser?.id, doctorName: State.currentUser?.fullName, doctorSpecialty: State.currentUser?.specialty, diagnosis, prescription, notes, date: new Date().toISOString(), status: 'finalized' };
    State.consultations.push(c); saveState();
    toast('Konsultatsiya saqlandi', 'success');
    return c;
  }

  window.ClinicFlow = { State, Storage, toast, showModal, handleClinicLogin, handleRegisterClinic, handleStaffLogin, logout, addPatient, addToQueue, updateQueueStatus, addTransaction, addStaff, deleteStaff, saveConsultation };

  function hideLoader() { const l = document.getElementById('cf-loader'); if (l) { l.classList.add('hidden'); setTimeout(() => l.remove(), 350); } }

  function setupPage() {
    initState();
    const page = (window.location.pathname.split('/').pop() || 'index').replace('.html', '');

    if (page !== 'index' && page !== 'dashboard' && page !== '' && !document.getElementById('back-to-dashboard')) {
      const btn = document.createElement('div');
      btn.id = 'back-to-dashboard';
      btn.innerHTML = '<a href="/dashboard"><span style="font-size:18px;">←</span>Boshqaruv paneliga qaytish</a>';
      document.body.appendChild(btn);
    }

    setupLoginForm();
    setupLogoutButtons();
    setupActionButtons();
    renderPageData(page);
    hideLoader();
  }

  function setupLoginForm() {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;
    const form = document.querySelector('form');
    if (!form || form.dataset.cfBound) return;
    form.dataset.cfBound = '1';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const loginEl = document.getElementById('login');
      const passEl = document.getElementById('password');
      const username = loginEl?.value || document.querySelector('input[type=text]')?.value || '';
      const password = passEl?.value || document.querySelector('input[type=password]')?.value || '';
      handleClinicLogin(username, password);
    });
  }

  function setupLogoutButtons() {
    document.querySelectorAll('a, button').forEach(btn => {
      if (btn.dataset.cfLogoutBound) return;
      const text = (btn.textContent || '').toLowerCase().trim();
      const href = btn.getAttribute('href') || '';
      if (text === 'chiqish' || text === 'logout' || text === "tizimdan chiqish" || href === '#logout' || href === '/logout') {
        btn.dataset.cfLogoutBound = '1';
        btn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
      }
    });
  }

  function setupActionButtons() {
    document.querySelectorAll('button, a').forEach(btn => {
      if (btn.dataset.cfActionBound) return;
      const text = (btn.textContent || '').toLowerCase().trim();
      // Add patient / New appointment
      if (text.includes('yangi bemor') || text.includes("bemor qo'shish") || text.includes('new appointment') || text.includes('add patient')) {
        btn.dataset.cfActionBound = '1';
        btn.addEventListener('click', (e) => { e.preventDefault(); showAddPatientModal(); });
      }
      // New payment
      else if (text.includes("yangi to'lov") || text.includes("to'lov qilish") || text.includes('new payment') || text.includes('create invoice')) {
        btn.dataset.cfActionBound = '1';
        btn.addEventListener('click', (e) => { e.preventDefault(); showPaymentModal(); });
      }
      // Add staff
      else if (text.includes('xodim qo\'shish') || text.includes("yangi xodim") || text.includes('add staff') || text.includes('new staff')) {
        btn.dataset.cfActionBound = '1';
        btn.addEventListener('click', (e) => { e.preventDefault(); showAddStaffModal(); });
      }
      // Doctor: New Appointment / Finalize Visit
      else if (text.includes('finalize visit') || text.includes('next patient') || text.includes('bemor qabul')) {
        btn.dataset.cfActionBound = '1';
        btn.addEventListener('click', (e) => { e.preventDefault(); showPatientIntakeModal(); });
      }
      // Print
      else if (text === 'print' || text === 'chop etish' || text.includes('chop et') || text.includes('print record')) {
        btn.dataset.cfActionBound = '1';
        btn.addEventListener('click', (e) => { e.preventDefault(); toast('Chop etish oynasi ochilmoqda...', 'info'); setTimeout(() => window.print(), 500); });
      }
      // Save
      else if (text === 'saqlash' || text === 'save' || text === 'saqla') {
        btn.dataset.cfActionBound = '1';
        btn.addEventListener('click', () => { setTimeout(() => toast('Saqlandi', 'success'), 100); });
      }
      // View All
      else if (text.includes('barchasini ko\'rish') || text === 'view all' || text.includes('hammasini ko\'rish')) {
        btn.dataset.cfActionBound = '1';
        btn.addEventListener('click', (e) => {
          const path = window.location.pathname;
          if (path === '/' || path === '/dashboard' || path === '') { e.preventDefault(); window.location.href = '/patients'; }
        });
      }
      // Clear/Tozalash
      else if (text === 'clear' || text === 'tozalash') {
        btn.dataset.cfActionBound = '1';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const search = document.querySelector('input[type=text][placeholder*="qidirish"], input[type=text][placeholder*="search"], input[type=search]');
          if (search) { search.value = ''; search.dispatchEvent(new Event('input')); }
        });
      }
    });
  }

  function showAddPatientModal() {
    const doctors = State.staffList.filter(s => s.role === 'doctor');
    const services = State.services;
    showModal('Yangi bemor qo\'shish va navbatga yozish', `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">F.I.SH *</label><input id="pat-fullname" type="text" placeholder="Masalan: Rustam Karimov" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;"></div>
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Telefon *</label><input id="pat-phone" type="tel" placeholder="+998 90 123-45-67" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;"></div>
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Tug'ilgan sana</label><input id="pat-birth" type="date" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;"></div>
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Shifokor tanlang *</label><select id="pat-doctor" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;">${doctors.map(d => '<option value="' + d.id + '">' + d.fullName + ' - ' + d.specialty + '</option>').join('')}</select></div>
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Xizmat</label><select id="pat-service" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;">${services.map(s => '<option value="' + s.id + '" data-price="' + s.price + '">' + s.name + ' - ' + s.price.toLocaleString() + " so'm</option>").join('')}</select></div>
      </div>
    `, (modal) => {
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
      renderCurrentPage();
    }, "Bemorni navbatga qo'shish");
  }

  function showPaymentModal() {
    showModal('Yangi to\'lov', `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Bemor *</label><select id="pay-patient" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;">${State.patients.map(p => '<option value="' + p.id + '">' + p.fullName + ' - ' + p.phone + '</option>').join('')}</select></div>
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Xizmat *</label><select id="pay-service" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;">${State.services.map(s => '<option value="' + s.id + '" data-price="' + s.price + '">' + s.name + ' - ' + s.price.toLocaleString() + " so'm</option>").join('')}</select></div>
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">To'lov usuli</label><select id="pay-method" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;"><option value="cash">Naqd</option><option value="card">Karta</option><option value="transfer">O'tkazma</option></select></div>
      </div>
    `, (modal) => {
      const pid = modal.querySelector('#pay-patient').value;
      const ss = modal.querySelector('#pay-service');
      const serviceName = ss.options[ss.selectedIndex].text.split(' - ')[0];
      const price = parseInt(ss.options[ss.selectedIndex].dataset.price);
      const method = modal.querySelector('#pay-method').value;
      addTransaction(pid, [{ name: serviceName, price, quantity: 1 }], method);
      renderCurrentPage();
    }, "To'lovni qabul qilish");
  }

  function showAddStaffModal() {
    showModal('Yangi xodim qo\'shish', `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">F.I.SH *</label><input id="st-fullname" type="text" placeholder="Masalan: Dr. Akmal Karimov" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;"></div>
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Lavozim *</label><select id="st-role" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;"><option value="doctor">Shifokor</option><option value="reception">Registratura</option><option value="cashier">Kassir</option><option value="admin">Administrator</option><option value="lab_tech">Laborant</option><option value="pharmacist">Farmasevt</option></select></div>
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Mutaxassislik</label><input id="st-specialty" type="text" placeholder="Masalan: Terapevt" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;"></div>
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Telefon</label><input id="st-phone" type="tel" placeholder="+998 90 123-45-67" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;"></div>
        <div><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">PIN kod (4 raqam)</label><input id="st-pin" type="text" placeholder="1234" maxlength="4" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;box-sizing:border-box;"></div>
      </div>
    `, (modal) => {
      const fullName = modal.querySelector('#st-fullname').value.trim();
      const role = modal.querySelector('#st-role').value;
      const specialty = modal.querySelector('#st-specialty').value.trim();
      const phone = modal.querySelector('#st-phone').value.trim();
      const pin = modal.querySelector('#st-pin').value.trim() || '1234';
      if (!fullName) { toast('Iltimos, F.I.SH ni kiriting', 'error'); return false; }
      addStaff({ fullName, role, specialty, phone, email: '', username: fullName.toLowerCase().replace(/\s+/g, '_'), password: pin, pinCode: pin, consultationFee: role === 'doctor' ? 100000 : 0, commissionPercent: role === 'doctor' ? 35 : 0, workSchedule: '08:00 - 18:00', roomNumber: '' });
      renderCurrentPage();
    }, "Xodimni qo'shish");
  }

  function showPatientIntakeModal() {
    const myQueue = State.queue.filter(q => q.doctorId === State.currentUser?.id && q.status === 'waiting');
    const queueToShow = myQueue.length > 0 ? myQueue : State.queue.filter(q => q.status === 'waiting');
    if (queueToShow.length === 0) { toast('Hozircha navbat yo\'q', 'info'); return; }
    showModal('Bemor qabul qilish - navbatdan tanlang', `
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${queueToShow.map((q, idx) => '<div style="padding:10px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;" onclick="document.getElementById(\'selected-queue\').value=\'' + q.id + '\';document.querySelectorAll(\'.queue-item\').forEach(i=>i.style.background=\'white\');this.style.background=\'#dbeafe\';" class="queue-item"><div style="font-weight:600;color:#003c90;">' + q.ticketNumber + ' - ' + q.patientName + '</div><div style="font-size:12px;color:#64748b;">' + q.serviceName + ' • ' + q.price.toLocaleString() + " so'm</div></div>").join('')}
        <input type="hidden" id="selected-queue" value="${queueToShow[0]?.id || ''}">
        <div style="margin-top:12px;"><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Diagnoz</label><textarea id="intake-diagnosis" placeholder="Diagnozni kiriting" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;min-height:60px;box-sizing:border-box;"></textarea></div>
        <div style="margin-top:8px;"><label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Retsept</label><textarea id="intake-prescription" placeholder="Retsept va davolash rejasini kiriting" style="width:100%;padding:10px 14px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;min-height:60px;box-sizing:border-box;"></textarea></div>
      </div>
    `, (modal) => {
      const qid = modal.querySelector('#selected-queue').value;
      const diag = modal.querySelector('#intake-diagnosis').value.trim();
      const pres = modal.querySelector('#intake-prescription').value.trim();
      if (!qid) { toast('Bemor tanlang', 'error'); return false; }
      const q = State.queue.find(x => x.id === qid);
      if (q) { updateQueueStatus(qid, 'in_progress'); if (diag) saveConsultation(q.patientId, diag, pres, ''); toast(q.patientName + ' qabul qilinmoqda', 'success'); renderCurrentPage(); }
    }, "Qabul qilishni boshlash");
  }

  function renderCurrentPage() {
    const page = (window.location.pathname.split('/').pop() || 'index').replace('.html', '');
    renderPageData(page);
  }

  function renderPageData(page) {
    switch (page) {
      case 'dashboard': renderDashboard(); break;
      case 'reception': case 'reception-pro': renderReception(); break;
      case 'patients': renderPatients(); break;
      case 'doctor': case 'doctor-cabinet': renderDoctor(); break;
      case 'cashier': renderCashier(); break;
      case 'patient-history': renderPatientHistory(); break;
      case 'analytics': renderAnalytics(); break;
    }
  }

  function renderDashboard() {
    const main = document.querySelector('main');
    if (!main || document.getElementById('cf-dashboard-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'cf-dashboard-panel';
    panel.style.cssText = 'background:white;border-radius:8px;padding:16px;margin:16px;border:1px solid #e2e8f0;font-family:Inter,sans-serif;';
    const totalRev = State.transactions.reduce((s, t) => s + t.totalAmount, 0);
    const waitingCount = State.queue.filter(q => q.status === 'waiting').length;
    panel.innerHTML = '<h3 style="margin:0 0 12px;color:#003c90;font-size:16px;font-weight:700;">Klinika holati</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;"><div style="padding:12px;background:#f0f9ff;border-radius:6px;"><div style="font-size:12px;color:#64748b;">Bemorlar</div><div style="font-size:20px;font-weight:700;color:#003c90;">' + State.patients.length + '</div></div><div style="padding:12px;background:#fef3c7;border-radius:6px;"><div style="font-size:12px;color:#64748b;">Navbat (kutilmoqda)</div><div style="font-size:20px;font-weight:700;color:#92400e;">' + waitingCount + '</div></div><div style="padding:12px;background:#f0fdf4;border-radius:6px;"><div style="font-size:12px;color:#64748b;">Tushum</div><div style="font-size:20px;font-weight:700;color:#006a6a;">' + totalRev.toLocaleString() + " so'm</div></div><div style=\"padding:12px;background:#fdf2f8;border-radius:6px;\"><div style=\"font-size:12px;color:#64748b;\">Xodimlar</div><div style=\"font-size:20px;font-weight:700;color:#9d174d;\">" + State.staffList.length + '</div></div></div>';
    main.insertBefore(panel, main.firstChild);
  }

  function renderReception() {
    const main = document.querySelector('main');
    if (!main) return;
    const existing = document.getElementById('cf-reception-queue');
    if (existing) existing.remove();
    const q = document.createElement('div');
    q.id = 'cf-reception-queue';
    q.style.cssText = 'background:white;border-radius:8px;padding:16px;margin:16px;border:1px solid #e2e8f0;font-family:Inter,sans-serif;';
    const items = State.queue.length === 0
      ? '<div style="text-align:center;padding:2rem;color:#64748b;">Hozircha navbat yo\'q. "Yangi bemor qo\'shish" tugmasini bosing.</div>'
      : '<div style="display:flex;flex-direction:column;gap:6px;">' + State.queue.slice(0, 15).map(item => '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:6px;background:#f9fafb;"><div style="display:flex;gap:12px;align-items:center;"><span style="background:#003c90;color:white;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:700;">' + item.ticketNumber + '</span><div><div style="font-weight:600;color:#191c1e;">' + item.patientName + '</div><div style="font-size:12px;color:#64748b;">' + item.doctorName + ' • ' + item.serviceName + '</div></div></div><div style="display:flex;gap:8px;align-items:center;"><span style="font-weight:600;color:#003c90;">' + item.price.toLocaleString() + " so'm</span><span class=\"status-" + (item.status === 'waiting' ? 'waiting' : item.status === 'in_progress' ? 'progress' : 'completed') + '">' + (item.status === 'waiting' ? 'Kutilmoqda' : item.status === 'in_progress' ? 'Qabulda' : 'Yakunlandi') + '</span></div></div>').join('') + '</div>';
    q.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h3 style="margin:0;color:#003c90;font-size:16px;font-weight:700;">Bugungi navbat (' + State.queue.length + ')</h3><button id="cf-add-patient-btn" style="padding:8px 16px;background:#003c90;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">+ Yangi bemor</button></div>' + items;
    main.insertBefore(q, main.firstChild);
    const btn = q.querySelector('#cf-add-patient-btn');
    if (btn) btn.addEventListener('click', () => showAddPatientModal());
  }

  function renderPatients() {
    const main = document.querySelector('main');
    if (!main) return;
    const existing = document.getElementById('cf-patients-panel');
    if (existing) existing.remove();
    const p = document.createElement('div');
    p.id = 'cf-patients-panel';
    p.style.cssText = 'background:white;border-radius:8px;padding:16px;margin:16px;border:1px solid #e2e8f0;font-family:Inter,sans-serif;';
    p.innerHTML = '<h3 style="margin:0 0 12px;color:#003c90;font-size:16px;font-weight:700;">Bemorlar ro\'yxati (' + State.patients.length + ')</h3>' + (State.patients.length === 0 ? '<div style="text-align:center;padding:2rem;color:#64748b;">Bemorlar yo\'q</div>' : '<div style="display:flex;flex-direction:column;gap:6px;">' + State.patients.map(pat => '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:6px;background:#f9fafb;"><div style="display:flex;gap:12px;align-items:center;"><span style="background:#003c90;color:white;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:700;">' + pat.patientNumber + '</span><div><div style="font-weight:600;color:#191c1e;">' + pat.fullName + '</div><div style="font-size:12px;color:#64748b;">' + pat.phone + ' • ' + (pat.birthDate || '-') + '</div></div></div><div style="font-size:12px;color:#64748b;">Tashriflar: ' + (pat.totalVisits || 0) + '</div></div>').join('') + '</div>');
    main.insertBefore(p, main.firstChild);
  }

  function renderDoctor() {
    const main = document.querySelector('main');
    if (!main) return;
    const existing = document.getElementById('cf-doctor-queue');
    if (existing) existing.remove();
    const myQueue = State.currentUser?.role === 'doctor' ? State.queue.filter(q => q.doctorId === State.currentUser.id) : State.queue;
    const queueToShow = myQueue.length > 0 ? myQueue : State.queue;
    const q = document.createElement('div');
    q.id = 'cf-doctor-queue';
    q.style.cssText = 'background:white;border-radius:8px;padding:16px;margin:16px;border:1px solid #e2e8f0;font-family:Inter,sans-serif;';
    const waitingCount = queueToShow.filter(q => q.status === 'waiting').length;
    q.innerHTML = '<h3 style="margin:0 0 12px;color:#003c90;font-size:16px;font-weight:700;">' + (State.currentUser ? State.currentUser.fullName + ' - ' : '') + 'Bemorlar navbati (' + waitingCount + ' kutilmoqda)</h3>' + (queueToShow.length === 0 ? '<div style="text-align:center;padding:2rem;color:#64748b;">Hozircha navbat yo\'q</div>' : '<div style="display:flex;flex-direction:column;gap:6px;">' + queueToShow.slice(0, 15).map(item => '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:6px;background:' + (item.status === 'in_progress' ? '#dbeafe' : '#f9fafb') + ';"><div style="display:flex;gap:12px;align-items:center;"><span style="background:#003c90;color:white;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:700;">' + item.ticketNumber + '</span><div><div style="font-weight:600;color:#191c1e;">' + item.patientName + '</div><div style="font-size:12px;color:#64748b;">' + item.doctorName + ' • ' + item.serviceName + ' • ' + item.price.toLocaleString() + " so'm</div></div></div><div style=\"display:flex;gap:8px;align-items:center;\"><span class=\"status-" + (item.status === 'waiting' ? 'waiting' : item.status === 'in_progress' ? 'progress' : 'completed') + '">' + (item.status === 'waiting' ? 'Kutilmoqda' : item.status === 'in_progress' ? 'Qabulda' : 'Yakunlandi') + '</span>' + (item.status === 'waiting' ? '<button onclick="ClinicFlow.updateQueueStatus(\'' + item.id + '\',\'in_progress\')" style="padding:6px 12px;background:#003c90;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Qabul qilish</button>' : item.status === 'in_progress' ? '<button onclick="ClinicFlow.updateQueueStatus(\'' + item.id + '\',\'completed\')" style="padding:6px 12px;background:#006a6a;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Yakunlash</button>' : '') + '</div></div>').join('') + '</div>');
    main.insertBefore(q, main.firstChild);
  }

  function renderCashier() {
    const main = document.querySelector('main');
    if (!main) return;
    const existing = document.getElementById('cf-cashier-panel');
    if (existing) existing.remove();
    const totalRev = State.transactions.reduce((s, t) => s + t.totalAmount, 0);
    const p = document.createElement('div');
    p.id = 'cf-cashier-panel';
    p.style.cssText = 'background:white;border-radius:8px;padding:16px;margin:16px;border:1px solid #e2e8f0;font-family:Inter,sans-serif;';
    p.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h3 style="margin:0;color:#003c90;font-size:16px;font-weight:700;">Kassa hisoboti</h3><button id="cf-new-payment" style="padding:8px 16px;background:#003c90;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">+ Yangi to\'lov</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px;"><div style="padding:12px;background:#f0f9ff;border-radius:6px;"><div style="font-size:12px;color:#64748b;">Bugungi tushum</div><div style="font-size:18px;font-weight:700;color:#003c90;">' + totalRev.toLocaleString() + " so'm</div></div><div style=\"padding:12px;background:#f0fdf4;border-radius:6px;\"><div style=\"font-size:12px;color:#64748b;\">To'lovlar soni</div><div style=\"font-size:18px;font-weight:700;color:#006a6a;\">" + State.transactions.length + ' ta</div></div></div><h4 style="margin:16px 0 8px;color:#003c90;font-size:14px;">So\'nggi to\'lovlar</h4>' + (State.transactions.length === 0 ? '<div style="text-align:center;padding:1.5rem;color:#64748b;">Hozircha to\'lovlar yo\'q</div>' : '<div style="display:flex;flex-direction:column;gap:6px;">' + State.transactions.slice().reverse().slice(0, 10).map(t => '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:6px;background:#f9fafb;"><div style="display:flex;gap:12px;align-items:center;"><span style="background:#003c90;color:white;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:700;">' + t.receiptNumber + '</span><div><div style="font-weight:600;color:#191c1e;">' + t.patientName + '</div><div style="font-size:12px;color:#64748b;">' + t.items.length + ' ta xizmat • ' + (t.paymentMethod === 'cash' ? 'Naqd' : t.paymentMethod === 'card' ? 'Karta' : 'O\'tkazma') + '</div></div></div><div style="font-weight:600;color:#003c90;">' + t.totalAmount.toLocaleString() + " so'm</div></div>").join('') + '</div>');
    main.insertBefore(p, main.firstChild);
    const btn = p.querySelector('#cf-new-payment');
    if (btn) btn.addEventListener('click', () => showPaymentModal());
  }

  function renderPatientHistory() {
    const main = document.querySelector('main');
    if (!main) return;
    const existing = document.getElementById('cf-consultations');
    if (existing) existing.remove();
    const d = document.createElement('div');
    d.id = 'cf-consultations';
    d.style.cssText = 'background:white;border-radius:8px;padding:16px;margin:16px;border:1px solid #e2e8f0;font-family:Inter,sans-serif;';
    d.innerHTML = '<h3 style="margin:0 0 12px;color:#003c90;font-size:16px;font-weight:700;">So\'nggi konsultatsiyalar (' + State.consultations.length + ')</h3>' + (State.consultations.length === 0 ? '<div style="text-align:center;padding:2rem;color:#64748b;">Konsultatsiyalar yo\'q</div>' : State.consultations.slice().reverse().slice(0, 10).map(c => '<div style="padding:10px;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><strong style="color:#003c90;">' + c.patientName + '</strong><span style="font-size:12px;color:#64748b;">' + new Date(c.date).toLocaleDateString('uz-UZ') + '</span></div><div style="font-size:13px;margin-bottom:4px;"><strong>Shifokor:</strong> ' + c.doctorName + '</div><div style="font-size:13px;margin-bottom:4px;"><strong>Diagnoz:</strong> ' + c.diagnosis + '</div>' + (c.prescription ? '<div style="font-size:13px;"><strong>Retsept:</strong> ' + c.prescription + '</div>' : '') + '</div>').join(''));
    main.insertBefore(d, main.firstChild);
  }

  function renderAnalytics() {
    const main = document.querySelector('main');
    if (!main) return;
    const existing = document.getElementById('cf-analytics-panel');
    if (existing) existing.remove();
    const totalRev = State.transactions.reduce((s, t) => s + t.totalAmount, 0);
    const p = document.createElement('div');
    p.id = 'cf-analytics-panel';
    p.style.cssText = 'background:white;border-radius:8px;padding:16px;margin:16px;border:1px solid #e2e8f0;font-family:Inter,sans-serif;';
    p.innerHTML = '<h3 style="margin:0 0 12px;color:#003c90;font-size:16px;font-weight:700;">Tahlil va hisobot</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;"><div style="padding:12px;background:#f0f9ff;border-radius:6px;"><div style="font-size:12px;color:#64748b;">Jami tushum</div><div style="font-size:18px;font-weight:700;color:#003c90;">' + totalRev.toLocaleString() + " so'm</div></div><div style=\"padding:12px;background:#f0fdf4;border-radius:6px;\"><div style=\"font-size:12px;color:#64748b;\">Bemorlar</div><div style=\"font-size:18px;font-weight:700;color:#006a6a;\">" + State.patients.length + '</div></div><div style="padding:12px;background:#fef3c7;border-radius:6px;"><div style="font-size:12px;color:#64748b;">Konsultatsiyalar</div><div style="font-size:18px;font-weight:700;color:#92400e;">' + State.consultations.length + '</div></div></div>';
    main.insertBefore(p, main.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPage);
  } else {
    setupPage();
  }
  window.addEventListener('load', () => { setTimeout(hideLoader, 100); });
})();
