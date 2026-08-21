import { connect } from '@tidbcloud/serverless'

const DB_URL = 'mysql://2PS5aujUXSKBu38.root:j42agDdHIrQLJhwo@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/klinika_db'
let conn
function getConn() { if (!conn) conn = connect({ url: DB_URL }); return conn }

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors() })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors() })
    }

    // API routes
    if (url.pathname.startsWith('/api/')) {
      // Clinic API routes
      if (url.pathname.startsWith('/api/clinic/')) {
        const path = url.pathname.replace('/api/clinic/', '').split('/')

        if (request.method === 'GET') {
          if (path[0] === 'load' && path[1]) {
            try {
              const c = getConn()
              const clinicRes = await c.execute('SELECT * FROM Clinic WHERE id = ?', [path[1]])
              const clinics = clinicRes.rows || clinicRes
              if (!clinics || clinics.length === 0) return jsonResponse({ error: 'Not found' }, 404)
              const clinic = clinics[0]
              const [staffRes, patientsRes, queueRes, servicesRes, wardsRes] = await Promise.all([
                c.execute('SELECT * FROM Staff WHERE clinicId = ?', [path[1]]),
                c.execute('SELECT * FROM Patient WHERE clinicId = ?', [path[1]]),
                c.execute('SELECT * FROM QueueTicket WHERE clinicId = ? ORDER BY createdAt DESC', [path[1]]),
                c.execute('SELECT * FROM MedicalService WHERE clinicId = ?', [path[1]]),
                c.execute('SELECT * FROM WardRoom WHERE clinicId = ?', [path[1]]),
              ])
              return jsonResponse({
                currentClinic: clinic,
                staffList: staffRes.rows || staffRes,
                patients: patientsRes.rows || patientsRes,
                queue: queueRes.rows || queueRes,
                services: servicesRes.rows || servicesRes,
                wards: wardsRes.rows || wardsRes,
                consultations: [], labOrders: [], pharmacy: [], transactions: [],
              })
            } catch (e) { return jsonResponse({ error: e.message }, 500) }
          }

          if (path[0] === 'clinics') {
            try {
              const c = getConn()
              const res = await c.execute('SELECT * FROM Clinic')
              return jsonResponse(res.rows || res)
            } catch (e) { return jsonResponse({ error: e.message }, 500) }
          }
        }

        if (request.method === 'POST') {
          let body
          try { body = await request.json() }
          catch { return jsonResponse({ error: 'Invalid JSON' }, 400) }

          if (path[0] === 'save' && path[1]) {
            try {
              const c = getConn()
              const clinicId = path[1]
              const clinic = body.currentClinic

              if (clinic) {
                await c.execute(
                  `INSERT INTO Clinic (id, name, shortName, loginUsername, password, licenseNumber, inn, address, city, phone, email, directorName, currency, currencySymbol, workingHours, createdAt, updatedAt)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                   ON DUPLICATE KEY UPDATE name=VALUES(name), shortName=VALUES(shortName), password=VALUES(password), address=VALUES(address), phone=VALUES(phone), email=VALUES(email), directorName=VALUES(directorName), updatedAt=NOW()`,
                  [clinic.id, clinic.name, clinic.shortName || '', clinic.loginUsername, clinic.password, clinic.licenseNumber, clinic.inn, clinic.address, clinic.city, clinic.phone, clinic.email, clinic.directorName, clinic.currency || 'UZS', clinic.currencySymbol || "so'm", clinic.workingHours]
                )
              }
              if (body.staffList) for (const s of body.staffList) await c.execute(`INSERT INTO Staff (id, clinicId, fullName, role, specialty, roomNumber, phone, email, username, password, pinCode, consultationFee, commissionPercent, status, workSchedule, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), role=VALUES(role), phone=VALUES(phone), status=VALUES(status), updatedAt=NOW()`, [s.id, clinicId, s.fullName, s.role, s.specialty, s.roomNumber, s.phone, s.email, s.username, s.password, s.pinCode, s.consultationFee || 0, s.commissionPercent || 0, s.status || 'active', s.workSchedule, s.createdAt])
              if (body.patients) for (const p of body.patients) await c.execute(`INSERT INTO Patient (id, clinicId, patientNumber, fullName, birthDate, gender, phone, address, passportOrPin, bloodGroup, allergies, chronicDiseases, balance, totalVisits, lastVisitDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), phone=VALUES(phone), balance=VALUES(balance), updatedAt=NOW()`, [p.id, clinicId, p.patientNumber, p.fullName, p.birthDate, p.gender, p.phone, p.address, p.passportOrPin, p.bloodGroup, (p.allergies||[]).join(','), (p.chronicDiseases||[]).join(','), p.balance || 0, p.totalVisits || 0, p.lastVisitDate, p.createdAt])
              if (body.queue) for (const q of body.queue) await c.execute(`INSERT INTO QueueTicket (id, clinicId, ticketNumber, patientId, patientName, patientPhone, doctorId, doctorName, doctorSpecialty, roomNumber, serviceName, price, status, paymentStatus, paidAmount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE status=VALUES(status), updatedAt=NOW()`, [q.id, clinicId, q.ticketNumber, q.patientId, q.patientName, q.patientPhone, q.doctorId, q.doctorName, q.doctorSpecialty, q.roomNumber, q.serviceName, q.price, q.status, q.paymentStatus, q.paidAmount, q.createdAt])
              if (body.services) for (const s of body.services) await c.execute(`INSERT INTO MedicalService (id, clinicId, name, category, price, doctorSharePercent, durationMinutes, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), isActive=VALUES(isActive), updatedAt=NOW()`, [s.id, clinicId, s.name, s.category, s.price, s.doctorSharePercent || 0, s.durationMinutes || 30, s.isActive ? 1 : 0, s.createdAt])
              if (body.transactions) for (const t of body.transactions) await c.execute(`INSERT INTO PaymentTransaction (id, clinicId, receiptNumber, patientId, patientName, items, subtotal, discount, totalAmount, paymentMethod, status, cashierName, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE status=VALUES(status), updatedAt=NOW()`, [t.id, clinicId, t.receiptNumber, t.patientId, t.patientName, JSON.stringify(t.items), t.subtotal || 0, t.discount || 0, t.totalAmount || 0, t.paymentMethod, t.status, t.cashierName, t.createdAt])

              return jsonResponse({ success: true })
            } catch (e) { return jsonResponse({ error: e.message }, 500) }
          }

          if (path[0] === 'register') {
            try {
              const c = getConn()
              const clinic = body.clinic
              await c.execute(`INSERT INTO Clinic (id, name, shortName, loginUsername, password, licenseNumber, inn, address, city, phone, email, directorName, currency, currencySymbol, workingHours, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [clinic.id, clinic.name, clinic.shortName, clinic.loginUsername, clinic.password, clinic.licenseNumber, clinic.inn, clinic.address, clinic.city, clinic.phone, clinic.email, clinic.directorName, 'UZS', "so'm", '08:00 - 20:00'])
              return jsonResponse({ success: true, clinicId: clinic.id })
            } catch (e) { return jsonResponse({ error: e.message }, 500) }
          }
        }
        return jsonResponse({ error: 'Not found' }, 404)
      }
      return jsonResponse({ error: 'API endpoint not found' }, 404)
    }

    // Static assets - HTML no-cache, JS/CSS long-cache
    const assetRes = await env.ASSETS.fetch(request)
    const isHtmlPath = url.pathname === '/' || url.pathname.endsWith('.html') || !url.pathname.includes('.')
    const contentType = assetRes.headers.get('content-type') || ''
    const isHtmlContent = contentType.includes('text/html')

    if (isHtmlPath || isHtmlContent) {
      const newHeaders = new Headers(assetRes.headers)
      newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      newHeaders.set('Pragma', 'no-cache')
      newHeaders.set('Expires', '0')
      return new Response(assetRes.body, {
        status: assetRes.status,
        statusText: assetRes.statusText,
        headers: newHeaders,
      })
    }
    return assetRes
  }
}
