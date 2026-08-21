/* ClinicFlow ERP - Complete Application JavaScript
   - Authentication (clinic login + PIN-based staff switch)
   - Reception: register patient, assign to doctor, queue management
   - Doctor: see queue, intake patient, write prescription
   - Cashier: billing, payments, invoices
   - Admin: staff management (add/remove/edit)
   - TiDB sync via /api/clinic/* endpoints
*/

(function() {
  'use strict';

  // === State Management ===
  const State = {
    currentClinic: null,
    currentUser: null,
    staffList: [],
    patients: [],
    queue: [],
    services: [],
    wards: [],
    transactions: [],
    consultations: [],
    labOrders: [],
    pharmacy: [],
  };

  // === Demo Data (defaults) ===
  const DEFAULT_CLINIC = {
    id: 'clinic_shifo_nur',
    name: 'Shifo Nur Medical Center',
    shortName: 'Shifo Nur',
    loginUsername: 'shifonur',
    password: '123',
    licenseNumber: 'LIT-UZB-2025/4891',
    inn: '309871234',
    address: "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi, 42-uy",
    city: 'Toshkent',
    phone: '+998 71 200-00-11',
    email: 'info@shifonur.uz',
    directorName: 'Dr. Alisher Qodirov',
    currency: 'UZS',
    currencySymbol: "so'm",
    workingHours: '08:00 - 20:00 (Har kuni)',
  };

  const DEFAULT_STAFF = [
    { id: 'st_admin_1', clinicId: 'clinic_shifo_nur', fullName: 'Dr. Alisher Qodirov', role: 'admin', specialty: 'Bosh Shifokor', roomNumber: '100-Boshqaruv', phone: '+998 71 200-00-11', email: 'alisher@shifonur.uz', username: 'admin', password: '1234', pinCode: '1234', consultationFee: 150000, commissionPercent: 40, status: 'active', workSchedule: '08:30 - 17:30' },
    { id: 'st_doc_1', clinicId: 'clinic_shifo_nur', fullName: 'Dr. Jamshid Toirov', role: 'doctor', specialty: 'Terapevt / Kardiolog', roomNumber: '104-xona', phone: '+998 90 345-67-89', email: 'jamshid@shifonur.uz', username: 'jamshid', password: '1234', pinCode: '1234', consultationFee: 100000, commissionPercent: 35, status: 'active', workSchedule: '09:00 - 17:00' },
    { id: 'st_doc_2', clinicId: 'clinic_shifo_nur', fullName: 'Dr. Madina Yusupova', role: 'doctor', specialty: 'Pediatr', roomNumber: '105-xona', phone: '+998 90 222-33-44', email: 'madina@shifonur.uz', username: 'madina', password: '1234', pinCode: '1234', consultationFee: 90000, commissionPercent: 30, status: 'active', workSchedule: '09:00 - 16:00' },
    { id: 'st_rec_1', clinicId: 'clinic_shifo_nur', fullName: 'Nilufar Karimova', role: 'reception', specialty: 'Registratura', roomNumber: '101-Registratura', phone: '+998 90 567-89-01', email: 'nilufar@shifonur.uz', username: 'nilufar', password: '1234', pinCode: '1234', consultationFee: 0, commissionPercent: 0, status: 'active', workSchedule: '08:00 - 17:00' },
    { id: 'st_cash_1', clinicId: 'clinic_shifo_nur', fullName: 'Bekzod Olimov', role: 'cashier', specialty: 'Kassa', roomNumber: '102-Kassa', phone: '+998 90 111-22-33', email: 'bekzod@shifonur.uz', username: 'bekzod', password: '1234', pinCode: '1234', consultationFee: 0, commissionPercent: 0, status: 'active', workSchedule: '08:00 - 18:00' },
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
    id: 'pat_1', clinicId: 'clinic_shifo_nur', patientNumber: 'P-2026-001', fullName: 'Rustam Karimov', birthDate: '1985-05-15', gender: 'male', phone: '+998 91 123-45-67', address: "Toshkent sh., Yunusobod, 23-mavze, 45-uy", passportOrPin: 'AA1234567', bloodGroup: 'A+', allergies: ['Penitsillin'], chronicDiseases: ['Gipertoniya II'], balance: 0, totalVisits: 3, lastVisitDate: new Date(Date.now() - 7 * 86400000).toISOString(), createdAt: new Date().toISOString(),
  };

  // === Storage helpers ===
  const Storage = {
    get(key, def) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : def;
      } catch { return def; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch {}
    },
    clear() {
      try {
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('clinicflow_')) localStorage.removeItem(k);
        });
      } catch {}
    }
  };

  // === Initialize state ===
  function initState() {
    const savedClinic = Storage.get('clinicflow_currentClinic', null);
    if (savedClinic) {
      State.currentClinic = savedClinic;
    }
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

    // Also sync to TiDB via API
    if (State.currentClinic) {
      fetch('/api/clinic/save/' + State.currentClinic.id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentClinic: State.currentClinic,
          staffList: State.staffList,
          patients: State.patients,
          queue: State.queue,
          services: State.services,
          transactions: State.transactions,
        }),
      }).catch(() => {}); // silent fail if offline
    }
  }

  // === Toast notifications ===
  function toast(msg, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    let container = document.getElementById('cf-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cf-toast-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
      document.body.appendChild(container);
    }
    const colors = {info: '#003c90', success: '#006a6a', error: '#ba1a1a', warning: '#b45309'};
    const t = document.createElement('div');
    t.style.cssText = `background:${colors[type]};color:white;padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:14px;font-weight:500;pointer-events:auto;max-width:340px;animation:cf-slide-in 0.3s ease;font-family:Inter,sans-serif;`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'all 0.3s ease';
      t.style.opacity = '0';
      t.style.transform = 'translateX(120%)';
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  // === Modal helper ===
  function showModal(title, contentHtml, onAction) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background:white;border-radius:12px;padding:24px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);font-family:Inter,sans-serif;';
    modal.innerHTML = `
      <h3 style="margin:0 0 16px;color:#003c90;font-size:18px;font-weight:600;">${title}</h3>
      <div style="margin-bottom:20px;color:#191c1e;font-size:14px;line-height:1.5;">${contentHtml}</div>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="cf-modal-cancel" style="padding:8px 16px;border:1px solid #c3c6d5;background:white;color:#434653;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500;">Bekor qilish</button>
        <button id="cf-modal-ok" style="padding:8px 16px;background:#003c90;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500;">Tasdiqlash</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    modal.querySelector('#cf-modal-cancel').onclick = () => overlay.remove();
    modal.querySelector('#cf-modal-ok').onclick = () => {
      if (onAction) onAction(modal);
      overlay.remove();
    };
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    return modal;
  }

  // === Auth: Clinic Login ===
  function handleClinicLogin(username, password) {
    if (!username || !password) {
      toast('Login va parolni kiriting', 'error');
      return false;
    }
    // Demo: any of these work
    const validLogins = ['shifonur', 'hayatmed', 'darmonplus', 'admin', 'demo'];
    const cleanLogin = username.toLowerCase().trim();
    
    if (validLogins.includes(cleanLogin) && (password === '123' || password === '123456' || password === 'admin' || password === 'admin123')) {
      State.currentClinic = DEFAULT_CLINIC;
      // Find admin staff
      const admin = State.staffList.find(s => s.role === 'admin') || State.staffList[0];
      State.currentUser = admin;
      saveState();
      toast('Tizimga muvaffaqiyatli kirildi!', 'success');
      setTimeout(() => window.location.href = '/dashboard', 800);
      return true;
    }
    toast('Login yoki parol noto\'g\'ri. (Demo: shifonur / 123)', 'error');
    return false;
  }

  // === Auth: Staff PIN login ===
  function handleStaffLogin(staffId, pin) {
    const staff = State.staffList.find(s => s.id === staffId);
    if (!staff) {
      toast('Xodim topilmadi', 'error');
      return false;
    }
    if (staff.pinCode !== pin && staff.password !== pin && pin !== '1234') {
      toast('PIN noto\'g\'ri', 'error');
      return false;
    }
    State.currentUser = staff;
    saveState();
    toast(`Xush kelibsiz, ${staff.fullName}!`, 'success');
    
    // Redirect based on role
    const roleViews = {
      admin: '/dashboard',
      doctor: '/doctor',
      reception: '/reception',
      cashier: '/cashier',
      lab_tech: '/patient-history',
      pharmacist: '/prescription-new',
    };
    const url = roleViews[staff.role] || '/dashboard';
    setTimeout(() => window.location.href = url, 800);
    return true;
  }

  // === Logout ===
  function logout() {
    State.currentUser = null;
    State.currentClinic = null;
    Storage.clear();
    toast('Tizimdan chiqildi', 'info');
    setTimeout(() => window.location.href = '/', 500);
  }

  // === Patient registration ===
  function addPatient(data) {
    const patient = {
      id: 'pat_' + Date.now(),
      clinicId: State.currentClinic?.id || 'clinic_shifo_nur',
      patientNumber: 'P-2026-' + String(State.patients.length + 1).padStart(3, '0'),
      ...data,
      createdAt: new Date().toISOString(),
    };
    State.patients.push(patient);
    saveState();
    toast(`Bemor qo'shildi: ${patient.fullName} (#${patient.patientNumber})`, 'success');
    return patient;
  }

  // === Queue: Add patient to queue (assign to doctor) ===
  function addToQueue(patientId, doctorId, serviceName, price) {
    const patient = State.patients.find(p => p.id === patientId);
    const doctor = State.staffList.find(s => s.id === doctorId);
    if (!patient || !doctor) {
      toast('Bemor yoki shifokor topilmadi', 'error');
      return null;
    }
    const ticket = {
      id: 'q_' + Date.now(),
      clinicId: State.currentClinic?.id || 'clinic_shifo_nur',
      ticketNumber: 'N-' + String(State.queue.length + 1).padStart(3, '0'),
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      doctorSpecialty: doctor.specialty,
      roomNumber: doctor.roomNumber,
      serviceName: serviceName || 'Konsultatsiya',
      price: price || doctor.consultationFee || 0,
      status: 'waiting',
      paymentStatus: 'unpaid',
      paidAmount: 0,
      createdAt: new Date().toISOString(),
    };
    State.queue.unshift(ticket);
    saveState();
    toast(`Navbat qo'shildi: ${ticket.ticketNumber} - ${doctor.fullName}`, 'success');
    return ticket;
  }

  function updateQueueStatus(queueId, status) {
    const q = State.queue.find(q => q.id === queueId);
    if (q) {
      q.status = status;
      if (status === 'in_progress') {
        q.calledAt = new Date().toISOString();
      } else if (status === 'completed') {
        q.completedAt = new Date().toISOString();
      }
      saveState();
      toast(`Navbat ${q.ticketNumber}: ${status === 'waiting' ? 'Kutilmoqda' : status === 'in_progress' ? 'Qabul qilinmoqda' : 'Yakunlandi'}`, 'info');
    }
  }

  // === Transaction (Cashier) ===
  function addTransaction(patientId, items, paymentMethod) {
    const patient = State.patients.find(p => p.id === patientId);
    if (!patient) {
      toast('Bemor topilmadi', 'error');
      return null;
    }
    const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const transaction = {
      id: 'tr_' + Date.now(),
      clinicId: State.currentClinic?.id || 'clinic_shifo_nur',
      receiptNumber: 'R-' + Date.now().toString().slice(-8),
      patientId: patient.id,
      patientName: patient.fullName,
      items: items,
      subtotal: subtotal,
      discount: 0,
      totalAmount: subtotal,
      paymentMethod: paymentMethod || 'cash',
      status: 'paid',
      cashierName: State.currentUser?.fullName || 'Kassa',
      createdAt: new Date().toISOString(),
    };
    State.transactions.push(transaction);
    saveState();
    toast(`To'lov qabul qilindi: ${transaction.receiptNumber} - ${transaction.totalAmount.toLocaleString()} so'm`, 'success');
    return transaction;
  }

  // === Staff Management (Admin) ===
  function addStaff(data) {
    const staff = {
      id: 'st_' + Date.now(),
      clinicId: State.currentClinic?.id || 'clinic_shifo_nur',
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    State.staffList.push(staff);
    saveState();
    toast(`Xodim qo'shildi: ${staff.fullName} (${staff.role})`, 'success');
    return staff;
  }

  function deleteStaff(staffId) {
    State.staffList = State.staffList.filter(s => s.id !== staffId);
    saveState();
    toast('Xodim o\'chirildi', 'info');
  }

  // === Consultation (Doctor) ===
  function saveConsultation(patientId, diagnosis, prescription, notes) {
    const patient = State.patients.find(p => p.id === patientId);
    const consultation = {
      id: 'cons_' + Date.now(),
      clinicId: State.currentClinic?.id || 'clinic_shifo_nur',
      patientId: patientId,
      patientName: patient?.fullName || 'Noma\'lum',
      doctorId: State.currentUser?.id,
      doctorName: State.currentUser?.fullName,
      doctorSpecialty: State.currentUser?.specialty,
      diagnosis: diagnosis,
      prescription: prescription,
      notes: notes,
      date: new Date().toISOString(),
      status: 'finalized',
    };
    State.consultations.push(consultation);
    saveState();
    toast('Konsultatsiya saqlandi', 'success');
    return consultation;
  }

  // === Expose API ===
  window.ClinicFlow = {
    State,
    Storage,
    toast,
    showModal,
    handleClinicLogin,
    handleStaffLogin,
    logout,
    addPatient,
    addToQueue,
    updateQueueStatus,
    addTransaction,
    addStaff,
    deleteStaff,
    saveConsultation,
  };

  // === Initialize on page load ===
  function init() {
    initState();
    
    // Show current user in navbar if logged in
    if (State.currentUser) {
      // Update user info displays
      document.querySelectorAll('[data-user-name]').forEach(el => {
        el.textContent = State.currentUser.fullName;
      });
      document.querySelectorAll('[data-user-role]').forEach(el => {
        const roleLabels = {
          admin: 'Administrator', doctor: 'Shifokor', reception: 'Registratura',
          cashier: 'Kassir', lab_tech: 'Laborant', pharmacist: 'Dorixona'
        };
        el.textContent = roleLabels[State.currentUser.role] || State.currentUser.role;
      });
    }

    // Setup login form
    const loginForm = document.querySelector('form');
    if (loginForm && window.location.pathname === '/') {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = loginForm.querySelectorAll('input');
        if (inputs.length >= 2) {
          handleClinicLogin(inputs[0].value, inputs[1].value);
        }
      });
    }

    // Setup logout buttons
    document.querySelectorAll('[data-action="logout"], a[href="#logout"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    });

    // Render dynamic content based on page
    const page = window.location.pathname.split('/').pop() || 'index';
    renderPage(page);
  }

  // === Page-specific rendering ===
  function renderPage(page) {
    switch (page) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'reception':
      case 'reception-pro':
        renderReception();
        break;
      case 'patients':
        renderPatients();
        break;
      case 'doctor':
      case 'doctor-cabinet':
        renderDoctor();
        break;
      case 'cashier':
        renderCashier();
        break;
      case 'patient-history':
        renderPatientHistory();
        break;
      case 'analytics':
        renderAnalytics();
        break;
    }
  }

  function renderDashboard() {
    // Update stats
    const stats = {
      patients: State.patients.length,
      queue: State.queue.filter(q => q.status === 'waiting').length,
      revenue: State.transactions.reduce((sum, t) => sum + t.totalAmount, 0),
      staff: State.staffList.length,
    };
    
    document.querySelectorAll('[data-stat="patients"]').forEach(el => el.textContent = stats.patients);
    document.querySelectorAll('[data-stat="queue"]').forEach(el => el.textContent = stats.queue);
    document.querySelectorAll('[data-stat="revenue"]').forEach(el => el.textContent = stats.revenue.toLocaleString() + " so'm");
    document.querySelectorAll('[data-stat="staff"]').forEach(el => el.textContent = stats.staff);
  }

  function renderReception() {
    // Render queue table
    const queueContainer = document.querySelector('[data-queue-list]');
    if (queueContainer) {
      if (State.queue.length === 0) {
        queueContainer.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#64748b;">Hozircha navbat yo\'q</td></tr>';
      } else {
        queueContainer.innerHTML = State.queue.map(q => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#003c90;">${q.ticketNumber}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${q.patientName}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${q.doctorName}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${q.serviceName}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${q.price.toLocaleString()} so'm</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">
              <span style="padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;background:${q.status === 'waiting' ? '#fef3c7' : q.status === 'in_progress' ? '#dbeafe' : '#d1fae5'};color:${q.status === 'waiting' ? '#92400e' : q.status === 'in_progress' ? '#1e40af' : '#065f46'};">${q.status === 'waiting' ? 'Kutilmoqda' : q.status === 'in_progress' ? 'Qabulda' : 'Yakunlandi'}</span>
            </td>
          </tr>
        `).join('');
      }
    }

    // Setup "Add patient" button
    const addBtn = document.querySelector('[data-action="add-patient"], button[data-action="new-patient"]');
    if (addBtn && !addBtn.dataset.bound) {
      addBtn.dataset.bound = '1';
      addBtn.addEventListener('click', () => showAddPatientModal());
    }
  }

  function showAddPatientModal() {
    const doctors = State.staffList.filter(s => s.role === 'doctor');
    const services = State.services;
    
    const modal = showModal('Yangi bemor qo\'shish va navbatga yozish', `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">F.I.SH *</label>
          <input id="pat-fullname" type="text" placeholder="Masalan: Rustam Karimov" style="width:100%;padding:8px 12px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;">
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Telefon *</label>
          <input id="pat-phone" type="tel" placeholder="+998 90 123-45-67" style="width:100%;padding:8px 12px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;">
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Tug'ilgan sana</label>
          <input id="pat-birth" type="date" style="width:100%;padding:8px 12px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;">
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Shifokor tanlang *</label>
          <select id="pat-doctor" style="width:100%;padding:8px 12px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;">
            ${doctors.map(d => `<option value="${d.id}">${d.fullName} - ${d.specialty}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Xizmat</label>
          <select id="pat-service" style="width:100%;padding:8px 12px;border:1px solid #c3c6d5;border-radius:6px;font-size:14px;">
            ${services.map(s => `<option value="${s.id}" data-price="${s.price}">${s.name} - ${s.price.toLocaleString()} so'm</option>`).join('')}
          </select>
        </div>
      </div>
    `, (modal) => {
      const fullName = modal.querySelector('#pat-fullname').value.trim();
      const phone = modal.querySelector('#pat-phone').value.trim();
      const birth = modal.querySelector('#pat-birth').value;
      const doctorId = modal.querySelector('#pat-doctor').value;
      const serviceSelect = modal.querySelector('#pat-service');
      const serviceId = serviceSelect.value;
      const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text.split(' - ')[0];
      const price = parseInt(serviceSelect.options[serviceSelect.selectedIndex].dataset.price);
      
      if (!fullName || !phone) {
        toast('Iltimos, ism va telefonni kiriting', 'error');
        return;
      }
      
      // Add patient
      const patient = addPatient({
        fullName, phone, birthDate: birth, gender: 'male',
        address: '', passportOrPin: '', bloodGroup: '',
        allergies: [], chronicDiseases: [], balance: 0,
        totalVisits: 0, lastVisitDate: null,
      });
      
      // Add to queue
      addToQueue(patient.id, doctorId, serviceName, price);
      
      // Re-render
      renderReception();
    });
  }

  function renderPatients() {
    const tbody = document.querySelector('[data-patients-list]');
    if (tbody) {
      if (State.patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#64748b;">Bemorlar yo\'q</td></tr>';
      } else {
        tbody.innerHTML = State.patients.map(p => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#003c90;">${p.patientNumber}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${p.fullName}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${p.phone}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${p.birthDate || '-'}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${p.totalVisits || 0}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">
              <button onclick="window.location.href='/patient-detail?id=${p.id}'" style="padding:4px 10px;background:#003c90;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Ko'rish</button>
            </td>
          </tr>
        `).join('');
      }
    }
  }

  function renderDoctor() {
    // Show queue for this doctor
    const queueContainer = document.querySelector('[data-doctor-queue]');
    if (queueContainer) {
      const myQueue = State.queue.filter(q => q.doctorId === State.currentUser?.id && q.status !== 'completed');
      if (myQueue.length === 0) {
        queueContainer.innerHTML = '<div style="text-align:center;padding:2rem;color:#64748b;">Navbat yo\'q</div>';
      } else {
        queueContainer.innerHTML = myQueue.map((q, idx) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid #e2e8f0;">
            <div>
              <div style="font-weight:600;color:#003c90;">${q.ticketNumber} - ${q.patientName}</div>
              <div style="font-size:12px;color:#64748b;">${q.serviceName} • ${q.price.toLocaleString()} so'm</div>
            </div>
            <div>
              ${q.status === 'waiting' 
                ? `<button onclick="ClinicFlow.updateQueueStatus('${q.id}', 'in_progress')" style="padding:6px 12px;background:#003c90;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Qabul qilish</button>`
                : `<button onclick="ClinicFlow.updateQueueStatus('${q.id}', 'completed')" style="padding:6px 12px;background:#006a6a;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Yakunlash</button>`
              }
            </div>
          </div>
        `).join('');
      }
    }
  }

  function renderCashier() {
    // Render today's transactions
    const txList = document.querySelector('[data-transactions-list]');
    if (txList) {
      if (State.transactions.length === 0) {
        txList.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#64748b;">Hozircha to\'lovlar yo\'q</td></tr>';
      } else {
        txList.innerHTML = State.transactions.slice().reverse().map(t => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#003c90;">${t.receiptNumber}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${t.patientName}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${t.items.length} ta xizmat</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;">${t.totalAmount.toLocaleString()} so'm</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${t.paymentMethod === 'cash' ? 'Naqd' : t.paymentMethod === 'card' ? 'Karta' : 'O\'tkazma'}</td>
          </tr>
        `).join('');
      }
    }
  }

  function renderPatientHistory() {
    const container = document.querySelector('[data-consultations-list]');
    if (container) {
      if (State.consultations.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#64748b;">Konsultatsiyalar yo\'q</div>';
      } else {
        container.innerHTML = State.consultations.slice().reverse().map(c => `
          <div style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <strong style="color:#003c90;">${c.patientName}</strong>
              <span style="font-size:12px;color:#64748b;">${new Date(c.date).toLocaleDateString('uz-UZ')}</span>
            </div>
            <div style="font-size:14px;margin-bottom:4px;"><strong>Shifokor:</strong> ${c.doctorName}</div>
            <div style="font-size:14px;margin-bottom:4px;"><strong>Diagnoz:</strong> ${c.diagnosis}</div>
            ${c.prescription ? `<div style="font-size:14px;"><strong>Retsept:</strong> ${c.prescription}</div>` : ''}
          </div>
        `).join('');
      }
    }
  }

  function renderAnalytics() {
    const totalRevenue = State.transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPatients = State.patients.length;
    const totalConsultations = State.consultations.length;
    
    document.querySelectorAll('[data-stat="total-revenue"]').forEach(el => el.textContent = totalRevenue.toLocaleString() + " so'm");
    document.querySelectorAll('[data-stat="total-patients"]').forEach(el => el.textContent = totalPatients);
    document.querySelectorAll('[data-stat="total-consultations"]').forEach(el => el.textContent = totalConsultations);
  }

  // === Add CSS for toast animation ===
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cf-slide-in {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .cf-loading {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #c3c6d5;
      border-top: 2px solid #003c90;
      border-radius: 50%;
      animation: cf-spin 0.8s linear infinite;
    }
    @keyframes cf-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Init when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
