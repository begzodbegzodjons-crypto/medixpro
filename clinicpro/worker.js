import { connect } from '@tidbcloud/serverless'

const DB_URL = 'mysql://2PS5aujUXSKBu38.root:j42agDdHIrQLJhwo@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/klinika_db'
let conn
function getConn() { if (!conn) conn = connect({ url: DB_URL }); return conn }

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors() })
}

function parseBody(body) {
  // Handle arrays stored as comma-separated strings (TiDB doesn't have ARRAY type)
  const result = { ...body }
  if (result.allergies && Array.isArray(result.allergies)) result.allergies = result.allergies.join(',')
  if (result.chronicDiseases && Array.isArray(result.chronicDiseases)) result.chronicDiseases = result.chronicDiseases.join(',')
  if (result.facilities && Array.isArray(result.facilities)) result.facilities = result.facilities.join(',')
  if (result.beds && typeof result.beds === 'object') result.beds = JSON.stringify(result.beds)
  if (result.items && Array.isArray(result.items)) result.items = JSON.stringify(result.items)
  if (result.prescriptions && Array.isArray(result.prescriptions)) result.prescriptions = JSON.stringify(result.prescriptions)
  if (result.orderedLabTests && Array.isArray(result.orderedLabTests)) result.orderedLabTests = result.orderedLabTests.join(',')
  if (result.parameters && Array.isArray(result.parameters)) result.parameters = JSON.stringify(result.parameters)
  if (result.objectiveExam && typeof result.objectiveExam === 'object') result.objectiveExam = JSON.stringify(result.objectiveExam)
  return result
}

function parseRow(row) {
  // Parse comma-separated arrays and JSON strings back to objects
  if (!row) return row
  const result = { ...row }
  if (typeof result.allergies === 'string' && result.allergies) result.allergies = result.allergies.split(',').filter(Boolean)
  else result.allergies = result.allergies || []
  if (typeof result.chronicDiseases === 'string' && result.chronicDiseases) result.chronicDiseases = result.chronicDiseases.split(',').filter(Boolean)
  else result.chronicDiseases = result.chronicDiseases || []
  if (typeof result.facilities === 'string' && result.facilities) result.facilities = result.facilities.split(',').filter(Boolean)
  else result.facilities = result.facilities || []
  if (typeof result.beds === 'string' && result.beds) { try { result.beds = JSON.parse(result.beds) } catch { result.beds = [] } }
  else result.beds = result.beds || []
  if (typeof result.items === 'string' && result.items) { try { result.items = JSON.parse(result.items) } catch { result.items = [] } }
  else result.items = result.items || []
  if (typeof result.prescriptions === 'string' && result.prescriptions) { try { result.prescriptions = JSON.parse(result.prescriptions) } catch {} }
  if (typeof result.orderedLabTests === 'string' && result.orderedLabTests) result.orderedLabTests = result.orderedLabTests.split(',').filter(Boolean)
  else result.orderedLabTests = result.orderedLabTests || []
  if (typeof result.parameters === 'string' && result.parameters) { try { result.parameters = JSON.parse(result.parameters) } catch { result.parameters = [] } }
  else result.parameters = result.parameters || []
  if (typeof result.objectiveExam === 'string' && result.objectiveExam) { try { result.objectiveExam = JSON.parse(result.objectiveExam) } catch {} }
  return result
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors() })
    }

    // === API Routes ===
    if (!url.pathname.startsWith('/api/')) {
      // Static files
      const assetRes = await env.ASSETS.fetch(request)
      const isHtmlPath = url.pathname === '/' || url.pathname.endsWith('.html') || !url.pathname.includes('.')
      const contentType = assetRes.headers.get('content-type') || ''
      if (isHtmlPath || contentType.includes('text/html')) {
        const newHeaders = new Headers(assetRes.headers)
        newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate')
        newHeaders.set('Pragma', 'no-cache')
        newHeaders.set('Expires', '0')
        return new Response(assetRes.body, { status: assetRes.status, statusText: assetRes.statusText, headers: newHeaders })
      }
      return assetRes
    }

    const path = url.pathname.replace('/api/', '').split('/')
    const c = getConn()

    try {
      // === CLINIC ENDPOINTS ===
      
      // GET /api/clinic/clinics - List all clinics
      if (path[0] === 'clinic' && path[1] === 'clinics' && request.method === 'GET') {
        const res = await c.execute('SELECT id, name, shortName, loginUsername, password, city, phone, email, directorName, currency, currencySymbol, workingHours, address, licenseNumber, inn, createdAt, updatedAt FROM Clinic ORDER BY createdAt DESC')
        return jsonResponse(res.rows || res)
      }

      // GET /api/clinic/load/:id - Load ALL clinic data
      if (path[0] === 'clinic' && path[1] === 'load' && path[2] && request.method === 'GET') {
        const clinicId = path[2]
        const clinicRes = await c.execute('SELECT * FROM Clinic WHERE id = ?', [clinicId])
        const clinics = clinicRes.rows || clinicRes
        if (!clinics || clinics.length === 0) return jsonResponse({ error: 'Not found' }, 404)
        
        const [staffRes, patientsRes, queueRes, servicesRes, wardsRes, consultRes, txRes, labRes, pharmRes] = await Promise.all([
          c.execute('SELECT * FROM Staff WHERE clinicId = ?', [clinicId]),
          c.execute('SELECT * FROM Patient WHERE clinicId = ? ORDER BY createdAt DESC', [clinicId]),
          c.execute('SELECT * FROM QueueTicket WHERE clinicId = ? ORDER BY createdAt DESC', [clinicId]),
          c.execute('SELECT * FROM MedicalService WHERE clinicId = ?', [clinicId]),
          c.execute('SELECT * FROM WardRoom WHERE clinicId = ?', [clinicId]),
          c.execute('SELECT * FROM ConsultationRecord WHERE clinicId = ? ORDER BY date DESC', [clinicId]).catch(() => ({ rows: [] })),
          c.execute('SELECT * FROM PaymentTransaction WHERE clinicId = ? ORDER BY createdAt DESC', [clinicId]).catch(() => ({ rows: [] })),
          c.execute('SELECT * FROM LabTestOrder WHERE clinicId = ? ORDER BY createdAt DESC', [clinicId]).catch(() => ({ rows: [] })),
          c.execute('SELECT * FROM PharmacyItem WHERE clinicId = ?', [clinicId]).catch(() => ({ rows: [] })),
        ])
        
        return jsonResponse({
          currentClinic: clinics[0],
          staffList: (staffRes.rows || staffRes).map(parseRow),
          patients: (patientsRes.rows || patientsRes).map(parseRow),
          queue: (queueRes.rows || queueRes).map(parseRow),
          services: (servicesRes.rows || servicesRes).map(parseRow),
          wards: (wardsRes.rows || wardsRes).map(parseRow),
          consultations: (consultRes.rows || consultRes).map(parseRow),
          transactions: (txRes.rows || txRes).map(parseRow),
          labOrders: (labRes.rows || labRes).map(parseRow),
          pharmacy: (pharmRes.rows || pharmRes).map(parseRow),
        })
      }

      // POST /api/clinic/register - Register new clinic
      if (path[0] === 'clinic' && path[1] === 'register' && request.method === 'POST') {
        const body = await request.json()
        const clinic = body.clinic || body
        await c.execute(
          `INSERT INTO Clinic (id, name, shortName, loginUsername, password, licenseNumber, inn, address, city, phone, email, directorName, currency, currencySymbol, workingHours, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE name=VALUES(name), shortName=VALUES(shortName), password=VALUES(password), address=VALUES(address), phone=VALUES(phone), email=VALUES(email), directorName=VALUES(directorName), updatedAt=NOW()`,
          [clinic.id, clinic.name, clinic.shortName || '', clinic.loginUsername, clinic.password, clinic.licenseNumber || '', clinic.inn || '', clinic.address || '', clinic.city || 'Toshkent', clinic.phone || '', clinic.email || '', clinic.directorName || '', clinic.currency || 'UZS', clinic.currencySymbol || "so'm", clinic.workingHours || '08:00 - 20:00']
        )
        return jsonResponse({ success: true, clinicId: clinic.id })
      }

      // POST /api/clinic/save/:id - Save all clinic data (bulk, backward compat)
      if (path[0] === 'clinic' && path[1] === 'save' && path[2] && request.method === 'POST') {
        const body = await request.json()
        const clinicId = path[2]
        
        // Save clinic info
        if (body.currentClinic) {
          const cl = body.currentClinic
          await c.execute(
            `INSERT INTO Clinic (id, name, shortName, loginUsername, password, licenseNumber, inn, address, city, phone, email, directorName, currency, currencySymbol, workingHours, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE name=VALUES(name), shortName=VALUES(shortName), password=VALUES(password), address=VALUES(address), phone=VALUES(phone), email=VALUES(email), directorName=VALUES(directorName), updatedAt=NOW()`,
            [cl.id, cl.name, cl.shortName || '', cl.loginUsername, cl.password, cl.licenseNumber || '', cl.inn || '', cl.address || '', cl.city || '', cl.phone || '', cl.email || '', cl.directorName || '', cl.currency || 'UZS', cl.currencySymbol || "so'm", cl.workingHours || '']
          )
        }
        
        // Save staff
        if (body.staffList) {
          for (const s of body.staffList) {
            await c.execute(
              `INSERT INTO Staff (id, clinicId, fullName, role, specialty, roomNumber, phone, email, username, password, pinCode, consultationFee, commissionPercent, status, workSchedule, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
               ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), role=VALUES(role), specialty=VALUES(specialty), phone=VALUES(phone), status=VALUES(status), updatedAt=NOW()`,
              [s.id, clinicId, s.fullName, s.role, s.specialty || '', s.roomNumber || '', s.phone || '', s.email || '', s.username || '', s.password || '', s.pinCode || '1234', s.consultationFee || 0, s.commissionPercent || 0, s.status || 'active', s.workSchedule || '', s.createdAt || new Date().toISOString()]
            )
          }
        }
        
        // Save patients
        if (body.patients) {
          for (const p of body.patients) {
            const parsed = parseBody(p)
            await c.execute(
              `INSERT INTO Patient (id, clinicId, patientNumber, fullName, birthDate, gender, phone, address, passportOrPin, bloodGroup, allergies, chronicDiseases, balance, totalVisits, lastVisitDate, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
               ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), phone=VALUES(phone), balance=VALUES(balance), totalVisits=VALUES(totalVisits), lastVisitDate=VALUES(lastVisitDate), updatedAt=NOW()`,
              [parsed.id, clinicId, parsed.patientNumber, parsed.fullName, parsed.birthDate || '', parsed.gender || 'male', parsed.phone || '', parsed.address || '', parsed.passportOrPin || '', parsed.bloodGroup || '', parsed.allergies || '', parsed.chronicDiseases || '', parsed.balance || 0, parsed.totalVisits || 0, parsed.lastVisitDate, parsed.createdAt || new Date().toISOString()]
            )
          }
        }
        
        // Save queue
        if (body.queue) {
          for (const q of body.queue) {
            await c.execute(
              `INSERT INTO QueueTicket (id, clinicId, ticketNumber, patientId, patientName, patientPhone, doctorId, doctorName, doctorSpecialty, roomNumber, serviceName, price, status, paymentStatus, paidAmount, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
               ON DUPLICATE KEY UPDATE status=VALUES(status), paymentStatus=VALUES(paymentStatus), paidAmount=VALUES(paidAmount), updatedAt=NOW()`,
              [q.id, clinicId, q.ticketNumber, q.patientId, q.patientName, q.patientPhone || '', q.doctorId, q.doctorName, q.doctorSpecialty || '', q.roomNumber || '', q.serviceName || '', q.price || 0, q.status || 'waiting', q.paymentStatus || 'unpaid', q.paidAmount || 0, q.createdAt || new Date().toISOString()]
            )
          }
        }
        
        // Save services
        if (body.services) {
          for (const s of body.services) {
            await c.execute(
              `INSERT INTO MedicalService (id, clinicId, name, category, price, doctorSharePercent, durationMinutes, isActive, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
               ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), isActive=VALUES(isActive), updatedAt=NOW()`,
              [s.id, clinicId, s.name, s.category || 'consultation', s.price, s.doctorSharePercent || 0, s.durationMinutes || 30, s.isActive ? 1 : 0, s.createdAt || new Date().toISOString()]
            )
          }
        }
        
        // Save transactions
        if (body.transactions) {
          for (const t of body.transactions) {
            const parsed = parseBody(t)
            await c.execute(
              `INSERT INTO PaymentTransaction (id, clinicId, receiptNumber, patientId, patientName, items, subtotal, discount, totalAmount, paymentMethod, status, cashierName, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
               ON DUPLICATE KEY UPDATE status=VALUES(status), updatedAt=NOW()`,
              [parsed.id, clinicId, parsed.receiptNumber, parsed.patientId, parsed.patientName, parsed.items || '[]', parsed.subtotal || 0, parsed.discount || 0, parsed.totalAmount || 0, parsed.paymentMethod || 'cash', parsed.status || 'paid', parsed.cashierName || '', parsed.createdAt || new Date().toISOString()]
            )
          }
        }
        
        return jsonResponse({ success: true })
      }

      // === STAFF ENDPOINTS ===
      
      // GET /api/staff/:clinicId
      if (path[0] === 'staff' && path[1] && request.method === 'GET') {
        const res = await c.execute('SELECT * FROM Staff WHERE clinicId = ?', [path[1]])
        return jsonResponse((res.rows || res).map(parseRow))
      }

      // POST /api/staff/save - Add or update staff
      if (path[0] === 'staff' && path[1] === 'save' && request.method === 'POST') {
        const body = parseBody(await request.json())
        await c.execute(
          `INSERT INTO Staff (id, clinicId, fullName, role, specialty, roomNumber, phone, email, username, password, pinCode, consultationFee, commissionPercent, status, workSchedule, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), role=VALUES(role), specialty=VALUES(specialty), roomNumber=VALUES(roomNumber), phone=VALUES(phone), email=VALUES(email), username=VALUES(username), password=VALUES(password), pinCode=VALUES(pinCode), consultationFee=VALUES(consultationFee), commissionPercent=VALUES(commissionPercent), status=VALUES(status), workSchedule=VALUES(workSchedule), updatedAt=NOW()`,
          [body.id, body.clinicId, body.fullName, body.role, body.specialty || '', body.roomNumber || '', body.phone || '', body.email || '', body.username || '', body.password || '1234', body.pinCode || '1234', body.consultationFee || 0, body.commissionPercent || 0, body.status || 'active', body.workSchedule || '', body.createdAt || new Date().toISOString()]
        )
        return jsonResponse({ success: true, id: body.id })
      }

      // DELETE /api/staff/:id
      if (path[0] === 'staff' && path[1] === 'delete' && path[2] && request.method === 'DELETE') {
        await c.execute('DELETE FROM Staff WHERE id = ?', [path[2]])
        return jsonResponse({ success: true })
      }

      // === PATIENT ENDPOINTS ===
      
      // GET /api/patients/:clinicId
      if (path[0] === 'patients' && path[1] && request.method === 'GET') {
        const res = await c.execute('SELECT * FROM Patient WHERE clinicId = ? ORDER BY createdAt DESC', [path[1]])
        return jsonResponse((res.rows || res).map(parseRow))
      }

      // POST /api/patient/save - Add or update patient
      if (path[0] === 'patient' && path[1] === 'save' && request.method === 'POST') {
        const body = parseBody(await request.json())
        await c.execute(
          `INSERT INTO Patient (id, clinicId, patientNumber, fullName, birthDate, gender, phone, address, passportOrPin, bloodGroup, allergies, chronicDiseases, balance, totalVisits, lastVisitDate, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), birthDate=VALUES(birthDate), gender=VALUES(gender), phone=VALUES(phone), address=VALUES(address), passportOrPin=VALUES(passportOrPin), bloodGroup=VALUES(bloodGroup), allergies=VALUES(allergies), chronicDiseases=VALUES(chronicDiseases), balance=VALUES(balance), totalVisits=VALUES(totalVisits), lastVisitDate=VALUES(lastVisitDate), updatedAt=NOW()`,
          [body.id, body.clinicId, body.patientNumber, body.fullName, body.birthDate || '', body.gender || 'male', body.phone || '', body.address || '', body.passportOrPin || '', body.bloodGroup || '', body.allergies || '', body.chronicDiseases || '', body.balance || 0, body.totalVisits || 0, body.lastVisitDate, body.createdAt || new Date().toISOString()]
        )
        return jsonResponse({ success: true, id: body.id, patientNumber: body.patientNumber })
      }

      // === QUEUE ENDPOINTS ===
      
      // GET /api/queue/:clinicId
      if (path[0] === 'queue' && path[1] && request.method === 'GET') {
        const res = await c.execute('SELECT * FROM QueueTicket WHERE clinicId = ? ORDER BY createdAt DESC', [path[1]])
        return jsonResponse((res.rows || res).map(parseRow))
      }

      // POST /api/queue/save - Add or update queue ticket
      if (path[0] === 'queue' && path[1] === 'save' && request.method === 'POST') {
        const body = await request.json()
        await c.execute(
          `INSERT INTO QueueTicket (id, clinicId, ticketNumber, patientId, patientName, patientPhone, doctorId, doctorName, doctorSpecialty, roomNumber, serviceName, price, status, paymentStatus, paidAmount, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE status=VALUES(status), paymentStatus=VALUES(paymentStatus), paidAmount=VALUES(paidAmount), doctorId=VALUES(doctorId), doctorName=VALUES(doctorName), doctorSpecialty=VALUES(doctorSpecialty), serviceName=VALUES(serviceName), price=VALUES(price), updatedAt=NOW()`,
          [body.id, body.clinicId, body.ticketNumber, body.patientId, body.patientName, body.patientPhone || '', body.doctorId, body.doctorName, body.doctorSpecialty || '', body.roomNumber || '', body.serviceName || '', body.price || 0, body.status || 'waiting', body.paymentStatus || 'unpaid', body.paidAmount || 0, body.createdAt || new Date().toISOString()]
        )
        return jsonResponse({ success: true, id: body.id, ticketNumber: body.ticketNumber })
      }

      // POST /api/queue/update-status - Update queue status only (fast)
      if (path[0] === 'queue' && path[1] === 'update-status' && request.method === 'POST') {
        const body = await request.json()
        await c.execute(
          `UPDATE QueueTicket SET status = ?, updatedAt = NOW() WHERE id = ?`,
          [body.status, body.id]
        )
        return jsonResponse({ success: true })
      }

      // === CONSULTATION (PATIENT HISTORY) ENDPOINTS ===
      
      // GET /api/consultations/:clinicId - All consultations for a clinic
      if (path[0] === 'consultations' && path[1] && request.method === 'GET') {
        const res = await c.execute('SELECT * FROM ConsultationRecord WHERE clinicId = ? ORDER BY date DESC', [path[1]])
        return jsonResponse((res.rows || res).map(parseRow))
      }

      // GET /api/consultations/patient/:patientId - Patient's full medical history
      if (path[0] === 'consultations' && path[1] === 'patient' && path[2] && request.method === 'GET') {
        const res = await c.execute('SELECT * FROM ConsultationRecord WHERE patientId = ? ORDER BY date DESC', [path[2]])
        return jsonResponse((res.rows || res).map(parseRow))
      }

      // POST /api/consultation/save - Save consultation (diagnosis, treatment, prescriptions)
      if (path[0] === 'consultation' && path[1] === 'save' && request.method === 'POST') {
        const body = parseBody(await request.json())
        await c.execute(
          `INSERT INTO ConsultationRecord (id, clinicId, patientId, patientName, doctorId, doctorName, doctorSpecialty, date, complaints, anamnesis, objectiveExam, icdCode, diagnosis, treatmentPlan, prescriptions, orderedLabTests, followUpDate, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE complaints=VALUES(complaints), anamnesis=VALUES(anamnesis), objectiveExam=VALUES(objectiveExam), diagnosis=VALUES(diagnosis), treatmentPlan=VALUES(treatmentPlan), prescriptions=VALUES(prescriptions), orderedLabTests=VALUES(orderedLabTests), followUpDate=VALUES(followUpDate), status=VALUES(status), updatedAt=NOW()`,
          [body.id, body.clinicId, body.patientId, body.patientName || '', body.doctorId, body.doctorName || '', body.doctorSpecialty || '', body.date || new Date().toISOString(), body.complaints || '', body.anamnesis || '', body.objectiveExam || '{}', body.icdCode || '', body.diagnosis || '', body.treatmentPlan || '', body.prescriptions || '[]', body.orderedLabTests || '', body.followUpDate || '', body.status || 'finalized', body.createdAt || new Date().toISOString()]
        )
        // Also update patient's lastVisitDate and totalVisits
        if (body.patientId) {
          await c.execute(
            `UPDATE Patient SET lastVisitDate = ?, totalVisits = totalVisits + 1, updatedAt = NOW() WHERE id = ?`,
            [body.date || new Date().toISOString(), body.patientId]
          )
        }
        return jsonResponse({ success: true, id: body.id })
      }

      // === TRANSACTION (PAYMENT) ENDPOINTS ===
      
      // GET /api/transactions/:clinicId
      if (path[0] === 'transactions' && path[1] && request.method === 'GET') {
        const res = await c.execute('SELECT * FROM PaymentTransaction WHERE clinicId = ? ORDER BY createdAt DESC', [path[1]])
        return jsonResponse((res.rows || res).map(parseRow))
      }

      // POST /api/transaction/save - Save payment transaction
      if (path[0] === 'transaction' && path[1] === 'save' && request.method === 'POST') {
        const body = parseBody(await request.json())
        await c.execute(
          `INSERT INTO PaymentTransaction (id, clinicId, receiptNumber, patientId, patientName, items, subtotal, discount, totalAmount, paymentMethod, status, cashierName, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE status=VALUES(status), updatedAt=NOW()`,
          [body.id, body.clinicId, body.receiptNumber, body.patientId, body.patientName || '', body.items || '[]', body.subtotal || 0, body.discount || 0, body.totalAmount || 0, body.paymentMethod || 'cash', body.status || 'paid', body.cashierName || '', body.createdAt || new Date().toISOString()]
        )
        // If linked to a queue ticket, update its payment status
        if (body.queueId) {
          await c.execute(
            `UPDATE QueueTicket SET paymentStatus = 'paid', paidAmount = ? WHERE id = ?`,
            [body.totalAmount || 0, body.queueId]
          )
        }
        return jsonResponse({ success: true, id: body.id, receiptNumber: body.receiptNumber })
      }

      // === SERVICES ENDPOINTS ===
      
      // GET /api/services/:clinicId
      if (path[0] === 'services' && path[1] && request.method === 'GET') {
        const res = await c.execute('SELECT * FROM MedicalService WHERE clinicId = ?', [path[1]])
        return jsonResponse((res.rows || res).map(parseRow))
      }

      // POST /api/service/save
      if (path[0] === 'service' && path[1] === 'save' && request.method === 'POST') {
        const body = await request.json()
        await c.execute(
          `INSERT INTO MedicalService (id, clinicId, name, category, price, doctorSharePercent, durationMinutes, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), price=VALUES(price), doctorSharePercent=VALUES(doctorSharePercent), durationMinutes=VALUES(durationMinutes), isActive=VALUES(isActive), updatedAt=NOW()`,
          [body.id, body.clinicId, body.name, body.category || 'consultation', body.price, body.doctorSharePercent || 0, body.durationMinutes || 30, body.isActive ? 1 : 0, body.createdAt || new Date().toISOString()]
        )
        return jsonResponse({ success: true, id: body.id })
      }

      // === DEBUG: Get table schema ===
      if (path[0] === 'debug' && path[1] === 'schema' && path[2]) {
        try {
          const res = await c.execute('DESCRIBE ' + path[2])
          return jsonResponse(res.rows || res)
        } catch (e) {
          return jsonResponse({ error: e.message }, 500)
        }
      }

      // === DEBUG: Create ConsultationRecord table if not exists ===
      if (path[0] === 'debug' && path[1] === 'create-consultations') {
        try {
          await c.execute(`CREATE TABLE IF NOT EXISTS ConsultationRecord (
            id VARCHAR(255) PRIMARY KEY,
            clinicId VARCHAR(255) NOT NULL,
            patientId VARCHAR(255) NOT NULL,
            patientName VARCHAR(500) DEFAULT '',
            doctorId VARCHAR(255),
            doctorName VARCHAR(500) DEFAULT '',
            doctorSpecialty VARCHAR(500) DEFAULT '',
            date DATETIME,
            complaints TEXT,
            anamnesis TEXT,
            objectiveExam TEXT,
            icdCode VARCHAR(50),
            diagnosis TEXT,
            treatmentPlan TEXT,
            prescriptions TEXT,
            orderedLabTests TEXT,
            followUpDate VARCHAR(100),
            status VARCHAR(50) DEFAULT 'finalized',
            createdAt DATETIME,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )`)
          return jsonResponse({ success: true, message: 'ConsultationRecord table ready' })
        } catch (e) {
          return jsonResponse({ error: e.message }, 500)
        }
      }


      // === DEBUG: ALTER ConsultationRecord to add patientName ===
      if (path[0] === 'debug' && path[1] === 'alter-consultations') {
        try {
          await c.execute('ALTER TABLE ConsultationRecord ADD COLUMN IF NOT EXISTS patientName VARCHAR(500) DEFAULT "" AFTER patientId')
          await c.execute('ALTER TABLE ConsultationRecord MODIFY COLUMN updatedAt datetime(3) DEFAULT CURRENT_TIMESTAMP(3)')
          return jsonResponse({ success: true, message: 'ConsultationRecord altered' })
        } catch (e) {
          return jsonResponse({ error: e.message }, 500)
        }
      }

      // === ANALYTICS ENDPOINTS ===
      
      // GET /api/analytics/:clinicId - Get summary stats
      if (path[0] === 'analytics' && path[1] && request.method === 'GET') {
        const clinicId = path[1]
        const [txRes, patRes, queueRes, consultRes, staffRes] = await Promise.all([
          c.execute('SELECT COUNT(*) as count, COALESCE(SUM(totalAmount), 0) as total FROM PaymentTransaction WHERE clinicId = ?', [clinicId]),
          c.execute('SELECT COUNT(*) as count FROM Patient WHERE clinicId = ?', [clinicId]),
          c.execute('SELECT status, COUNT(*) as count FROM QueueTicket WHERE clinicId = ? GROUP BY status', [clinicId]),
          c.execute('SELECT COUNT(*) as count FROM ConsultationRecord WHERE clinicId = ?', [clinicId]),
          c.execute('SELECT role, COUNT(*) as count FROM Staff WHERE clinicId = ? GROUP BY role', [clinicId]),
        ])
        
        const txData = (txRes.rows || txRes)[0] || { count: 0, total: 0 }
        const patData = (patRes.rows || patRes)[0] || { count: 0 }
        const consultData = (consultRes.rows || consultRes)[0] || { count: 0 }
        const queueRows = queueRes.rows || queueRes
        const staffRows = staffRes.rows || staffRes
        
        const queueStats = {}
        queueRows.forEach(r => { queueStats[r.status] = r.count })
        
        const staffStats = {}
        staffRows.forEach(r => { staffStats[r.role] = r.count })
        
        return jsonResponse({
          totalRevenue: Number(txData.total) || 0,
          transactionCount: Number(txData.count) || 0,
          patientCount: Number(patData.count) || 0,
          consultationCount: Number(consultData.count) || 0,
          queueStats,
          staffStats,
        })
      }

      // === LAB ORDER ENDPOINTS ===
      
      // GET /api/lab-orders/:clinicId
      if (path[0] === 'lab-orders' && path[1] && request.method === 'GET') {
        const res = await c.execute('SELECT * FROM LabTestOrder WHERE clinicId = ? ORDER BY createdAt DESC', [path[1]])
        return jsonResponse((res.rows || res).map(parseRow))
      }

      // POST /api/lab-order/save
      if (path[0] === 'lab-order' && path[1] === 'save' && request.method === 'POST') {
        const body = parseBody(await request.json())
        await c.execute(
          `INSERT INTO LabTestOrder (id, clinicId, orderNumber, patientId, patientName, doctorId, doctorName, testType, price, paymentStatus, status, performedBy, completedAt, createdAt, updatedAt, parameters, conclusion)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
           ON DUPLICATE KEY UPDATE status=VALUES(status), performedBy=VALUES(performedBy), completedAt=VALUES(completedAt), parameters=VALUES(parameters), conclusion=VALUES(conclusion), updatedAt=NOW()`,
          [body.id, body.clinicId, body.orderNumber, body.patientId, body.patientName || '', body.doctorId, body.doctorName || '', body.testType || '', body.price || 0, body.paymentStatus || 'unpaid', body.status || 'pending', body.performedBy || '', body.completedAt, body.createdAt || new Date().toISOString(), body.parameters || '[]', body.conclusion || '']
        )
        return jsonResponse({ success: true, id: body.id })
      }

      return jsonResponse({ error: 'Endpoint not found: ' + url.pathname }, 404)

    } catch (e) {
      return jsonResponse({ error: e.message, stack: e.stack?.substring(0, 500) }, 500)
    }
  }
}
