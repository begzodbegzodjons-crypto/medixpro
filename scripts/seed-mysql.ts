/**
 * UstozPro - Database seed script (MySQL/TiDB version)
 * Uses mysql2 directly for compatibility with TiDB Cloud SSL.
 *
 * Run: bun run scripts/seed-mysql.ts
 */
import bcrypt from 'bcryptjs'
import { pool, query, execute, generateId } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding TiDB Cloud database...')

  // Clean up
  console.log('🧹 Cleaning existing data...')
  await execute('DELETE FROM Favorite')
  await execute('DELETE FROM Library')
  await execute('DELETE FROM Purchase')
  await execute('DELETE FROM Transaction')
  await execute('DELETE FROM TestResult')
  await execute('DELETE FROM LessonPlan')
  await execute('DELETE FROM LessonMaterial')
  await execute('DELETE FROM Topic')
  await execute('DELETE FROM AdminCode')
  await execute('DELETE FROM CoinPackage')
  await execute('DELETE FROM Advertisement')
  await execute('DELETE FROM Material')
  await execute('DELETE FROM Test')
  await execute('DELETE FROM Subject')
  await execute('DELETE FROM Session')
  await execute('DELETE FROM Account')
  // Don't delete users - they have hashed passwords

  // Demo admin user
  const adminEmail = 'admin@ustozpro.uz'
  const adminRows: any = await query('SELECT id, isAdmin FROM User WHERE email = ?', [adminEmail]) as any
  let adminId: string

  if (adminRows.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    adminId = generateId()
    await execute(
      `INSERT INTO User (id, email, name, password, coinBalance, isAdmin, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [adminId, adminEmail, 'Admin User', hashedPassword, 1000]
    )
    console.log('👤 Created demo admin')
  } else {
    adminId = adminRows[0].id
    if (!adminRows[0].isAdmin) {
      await execute('UPDATE User SET isAdmin = 1 WHERE id = ?', [adminId])
    }
    console.log('👤 Demo admin already exists')
  }

  // Demo user
  const userEmail = 'user@ustozpro.uz'
  const userRows: any = await query('SELECT id FROM User WHERE email = ?', [userEmail]) as any
  if (userRows.length === 0) {
    const hashedPassword = await bcrypt.hash('user123', 10)
    const userId = generateId()
    await execute(
      `INSERT INTO User (id, email, name, password, coinBalance, isAdmin, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [userId, userEmail, 'Test Foydalanuvchi', hashedPassword, 100]
    )
  }

  // ==================== SUBJECTS ====================
  console.log('📚 Creating subjects...')
  const subjectsData = [
    { name: 'Matematika', icon: '🔢', order: 1 },
    { name: 'Fizika', icon: '⚛️', order: 2 },
    { name: 'Kimyo', icon: '🧪', order: 3 },
    { name: 'Biologiya', icon: '🧬', order: 4 },
    { name: 'Tarix', icon: '📜', order: 5 },
    { name: 'Geografiya', icon: '🌍', order: 6 },
    { name: 'Adabiyot', icon: '📖', order: 7 },
    { name: "San'at", icon: '🎨', order: 8 },
    { name: 'Musiqa', icon: '🎵', order: 9 },
    { name: 'Informatika', icon: '💻', order: 10 },
    { name: 'Jismoniy tarbiya', icon: '⚽', order: 11 },
  ]

  const subjectIds: Record<string, string> = {}
  for (const s of subjectsData) {
    const id = generateId()
    await execute(
      `INSERT INTO Subject (id, name, icon, \`order\`, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [id, s.name, s.icon, s.order]
    )
    subjectIds[s.name] = id
  }
  console.log(`✅ Created ${subjectsData.length} subjects`)

  // ==================== TOPICS ====================
  console.log('🔖 Creating topics...')
  const topicIdsBySubject: Record<string, string[]> = {}
  const topicsData: Record<string, string[]> = {
    'Matematika': ['Natural sonlar', 'Kasrlar', 'Tenglamalar va tengsizliklar', 'Funksiyalar', 'Geometriya asoslari', 'Trigonometriya'],
    'Fizika': ['Mexanika', 'Elektr va magnitmaydon', 'Termodinamika', 'Optika', 'Atom fizikasi'],
    'Kimyo': ['Atom tuzilishi', 'Davriy sistem', "Kimyoviy bog'lar", 'Kislota va ishqorlar', 'Organik kimyo'],
    'Biologiya': ['Hujayra', 'Genetika', 'Evolyutsiya', 'Ekologiya', 'Odam anatomiyasi'],
    'Tarix': ['Qadimgi davlatlar', "O'rta asrlar", "O'zbekiston mustaqilligi", 'Jahon tarixi'],
    'Geografiya': ['Tabiiy geografiya', 'Iqtisodiy geografiya', "O'zbekiston geografiyasi", 'Demografiya'],
    'Adabiyot': ["Xalq og'zaki ijodi", 'Klassik adabiyot', 'Zamonaviy adabiyot', 'Adabiyot nazariyasi'],
    'Informatika': ['Algoritm', 'Dasturlash', "Ma'lumotlar bazasi", 'Kompyuter tarmoqlari', 'Web texnologiyalar'],
  }

  for (const subjectName of Object.keys(topicsData)) {
    const subjectId = subjectIds[subjectName]
    if (!subjectId) continue
    const topicIds: string[] = []
    const topicNames = topicsData[subjectName]
    for (let i = 0; i < topicNames.length; i++) {
      const id = generateId()
      await execute(
        `INSERT INTO Topic (id, subjectId, name, \`order\`, createdAt) VALUES (?, ?, ?, ?, NOW())`,
        [id, subjectId, topicNames[i], i]
      )
      topicIds.push(id)
    }
    topicIdsBySubject[subjectName] = topicIds
  }
  console.log('✅ Created topics')

  // ==================== TESTS ====================
  console.log('📝 Creating tests...')
  const buildTest = (
    subjectId: string,
    title: string,
    description: string,
    questions: { text: string; options: string[]; correctIdx: number }[]
  ) => {
    const q = questions.map((item, idx) => ({ id: idx + 1, text: item.text, options: item.options }))
    const a = questions.map((item) => item.options[item.correctIdx])
    return [
      subjectId,
      title,
      description,
      JSON.stringify(q),
      JSON.stringify(a),
      60,
      30,
    ]
  }

  const testsData: any[] = [
    buildTest(subjectIds['Matematika'], 'Matematika - Asosiy test', 'Algebra va geometriya asoslari',
      [
        { text: '2 + 2 ning qiymati nechaga teng?', options: ['3', '4', '5', '6'], correctIdx: 1 },
        { text: '12 × 12 ning qiymati?', options: ['124', '144', '154', '164'], correctIdx: 1 },
        { text: 'Pifagor teoremasi qaysi tenglama bilan ifodalanadi?', options: ['a² + b² = c²', 'a + b = c', 'a² - b² = c²', 'a × b = c'], correctIdx: 0 },
        { text: 'x² = 25 tenglamaning yechimi?', options: ['x = 5', 'x = -5', 'x = ±5', 'x = 25'], correctIdx: 2 },
        { text: 'Doiraning yuzi formulasi?', options: ['πr', 'πr²', '2πr', 'r²'], correctIdx: 1 },
      ]
    ),
    buildTest(subjectIds['Fizika'], 'Fizika - Mexanika', 'Nyuton qonunlari va kinematika',
      [
        { text: "Nyutonning birinchi qonuni nima haqida?", options: ['Tezlanish', 'Inertsiya', 'Energiya', 'Impuls'], correctIdx: 1 },
        { text: 'Tezlanishning birligi?', options: ['m/s', 'm/s²', 'kg·m/s', 'N'], correctIdx: 1 },
        { text: 'F = m × a formulasi nima?', options: ['Energiya', 'Tezlik', 'Kuch', 'Ish'], correctIdx: 2 },
        { text: 'Erkin tushish tezlanishi qancha?', options: ['8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '9.5 m/s²'], correctIdx: 1 },
        { text: 'Impuls formulasi?', options: ['p = mv', 'p = m/v', 'p = m + v', 'p = m·a'], correctIdx: 0 },
      ]
    ),
    buildTest(subjectIds['Kimyo'], 'Kimyo - Davriy sistem', 'Elementlar va birikmalar',
      [
        { text: 'H2O nima?', options: ['Vodorod', 'Suv', 'Kislota', 'Kislorod'], correctIdx: 1 },
        { text: 'Oltinning kimyoviy belgisi?', options: ['Au', 'Ag', 'Fe', 'Cu'], correctIdx: 0 },
        { text: 'Neytronning zaryadi?', options: ['+', '-', '0', '±1'], correctIdx: 2 },
        { text: 'PH 7 qandagi muhitni bildiradi?', options: ['Kislotali', 'Ishqoriy', 'Neytral', 'Zaif kislotali'], correctIdx: 2 },
        { text: 'CO2 nima gaz?', options: ['Kislorod', 'Vodorod', 'Uglerod dioksid', 'Azot'], correctIdx: 2 },
      ]
    ),
    buildTest(subjectIds['Biologiya'], 'Biologiya - Hujayra', 'Hujayra tuzilishi va funksiyalari',
      [
        { text: "Hujayraning energetik stansiyasi?", options: ['Yadro', 'Ribosoma', 'Mitoxondriya', 'Lizosoma'], correctIdx: 2 },
        { text: 'DNK qaysi birikma?', options: ['Oqsil', 'Nuklein kislota', 'Uglevod', 'Lipid'], correctIdx: 1 },
        { text: "Fotosintez qaysi organelaida sodir bo'ladi?", options: ['Mitoxondriya', 'Xloroplast', 'Yadro', 'Ribosoma'], correctIdx: 1 },
        { text: "Odam tanasidagi eng katta organ?", options: ["Jigar", "O'pka", 'Teri', 'Miya'], correctIdx: 2 },
        { text: "Qon guruhlaridan nechtasi bor?", options: ['2', '3', '4', '5'], correctIdx: 2 },
      ]
    ),
    buildTest(subjectIds['Tarix'], "Tarix - O'zbekiston tarixi", 'Mustaqillik davri tarixi',
      [
        { text: "O'zbekiston mustaqillikka erishgan yil?", options: ['1989', '1990', '1991', '1992'], correctIdx: 2 },
        { text: "O'zbekiston Respublikasining birinchi prezidenti?", options: ['Sh. Mirziyoyev', 'I. Karimov', 'A. Rashidov', 'R. Abdullayev'], correctIdx: 1 },
        { text: 'Konstitutsiya qabul qilingan sana?', options: ['1991-yil 1-sentabr', '1992-yil 8-dekabr', '1993-yil 1-yanvar', '1995-yil 8-dekabr'], correctIdx: 1 },
        { text: "O'zbekiston poytaxti?", options: ['Samarqand', 'Buxoro', 'Toshkent', 'Andijon'], correctIdx: 2 },
        { text: "Mustaqillik bayrami qachon nishonlanadi?", options: ['1-yanvar', '8-dekabr', '1-sentabr', '21-mart'], correctIdx: 2 },
      ]
    ),
    buildTest(subjectIds['Informatika'], 'Informatika - Asoslar', 'Algoritm va dasturlash asoslari',
      [
        { text: '1 bayt necha bitdan iborat?', options: ['4', '8', '16', '32'], correctIdx: 1 },
        { text: 'HTML nima?', options: ["Dasturlash tili", "Markap tili", "Ma'lumotlar bazasi", 'Brauzer'], correctIdx: 1 },
        { text: 'Python qaysi paradigmadagi til?', options: ['Faqat procedural', "Faqat obyektga yo'naltirilgan", "Ko'p paradigmali", 'Faqat funksional'], correctIdx: 2 },
        { text: 'CPU nima?', options: ['Markaziy protsessor', 'Operativ xotira', 'Qattiq disk', 'Video karta'], correctIdx: 0 },
        { text: 'Binary sistemada 1010 = ? (decimal)', options: ['8', '10', '12', '14'], correctIdx: 1 },
      ]
    ),
  ]

  for (const t of testsData) {
    const id = generateId()
    await execute(
      `INSERT INTO Test (id, subjectId, title, description, questions, correctAnswers, passingScore, timeLimit, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, ...t]
    )
  }
  console.log(`✅ Created ${testsData.length} tests`)

  // ==================== MATERIALS ====================
  console.log('📦 Creating materials...')
  const materialsData = [
    { subject: 'Matematika', title: "Matematika - To'liq darslik (PDF)", desc: "5-11 sinflar uchun matematika darsligi", url: 'https://example.com/math-textbook.pdf', type: 'pdf', price: 100, isFree: 0 },
    { subject: 'Matematika', title: "Algebra - Video darslar to'plami", desc: "Tenglamalar va tengsizliklar mavzusidagi video darslar", url: 'https://example.com/algebra-videos', type: 'video', price: 150, isFree: 0 },
    { subject: 'Fizika', title: 'Fizika - Mexanika (PDF)', desc: "Mexanika bo'limi bo'yicha to'liq qo'llanma", url: 'https://example.com/physics-mechanics.pdf', type: 'pdf', price: 80, isFree: 0 },
    { subject: 'Kimyo', title: 'Kimyo - Davriy sistem (PDF)', desc: "Davriy sistem va elementlar haqida to'liq ma'lumot", url: 'https://example.com/chemistry-periodic.pdf', type: 'pdf', price: 60, isFree: 0 },
    { subject: 'Biologiya', title: 'Biologiya - Hujayra (Video)', desc: "Hujayra tuzilishi haqida video dars", url: 'https://example.com/biology-cell-video', type: 'video', price: 90, isFree: 0 },
    { subject: 'Informatika', title: 'Python dasturlash asoslari (PDF)', desc: "Python tilini noldan o'rganish uchun qo'llanma", url: 'https://example.com/python-basics.pdf', type: 'pdf', price: 120, isFree: 0 },
    { subject: 'Matematika', title: 'Matematika formulalari to\'plami (Bepul)', desc: "Asosiy matematika formulalari", url: 'https://example.com/math-formulas.pdf', type: 'pdf', price: 0, isFree: 1 },
    { subject: 'Fizika', title: 'Fizika formulalari (Bepul)', desc: "Barcha asosiy fizika formulalari bir joyda", url: 'https://example.com/physics-formulas.pdf', type: 'pdf', price: 0, isFree: 1 },
  ]

  for (const m of materialsData) {
    const id = generateId()
    await execute(
      `INSERT INTO Material (id, subjectId, title, description, fileUrl, type, price, isFree, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, subjectIds[m.subject], m.title, m.desc, m.url, m.type, m.price, m.isFree]
    )
  }
  console.log(`✅ Created ${materialsData.length} materials`)

  // ==================== LESSON PLANS ====================
  console.log('📋 Creating lesson plans...')

  const buildLessonPlanContent = (
    objectives: string[], materials: string[],
    stages: { name: string; duration: number; description: string }[],
    homework: string, assessment: string, notes?: string
  ) => JSON.stringify({ objectives, materials, stages, homework, assessment, notes: notes || '' })

  const lessonPlansData = [
    {
      subject: 'Matematika',
      topicIdx: 2, // Tenglamalar
      title: 'Tenglamalar va ularning yechimlari - 7-sinf',
      description: "Chiziqli tenglamalarni yechish metodikasi bo'yicha to'liq dars rejasi",
      classLevel: 7, duration: 45,
      content: buildLessonPlanContent(
        ["O'quvchilar chiziqli tenglama tushunchasini tushunishlari", 'Tenglamani yechish qoidalarini bilib olish', 'Amaliy misollarni mustaqil yecha olish'],
        ['Darslik', 'Doska', "Ko'rgazma materiallar", 'Test savollari'],
        [
          { name: "Tashkiliy qism", duration: 5, description: "O'quvchilarni ro'yxatga olish, darsga tayyorgarlik" },
          { name: 'Yangi mavzu bayoni', duration: 15, description: 'Tenglama tushunchasi, uning yechimi va qoidalari' },
          { name: 'Mustahkamlash', duration: 15, description: "Darslikdagi misollarni yechish, mustaqil ish" },
          { name: 'Xulosa va baholash', duration: 10, description: "Darsni xulosalash, o'quvchilarni baholash, uy vazifasi" },
        ],
        "Darslikning 45-betidagi 1-10 misollarni yechish",
        "Amaliy ish va og'zaki javoblar asosida baholash",
        "Iqtidorli o'quvchilar uchun qo'shimcha murakkab misollar tayyorlang"
      ),
    },
    {
      subject: 'Matematika',
      topicIdx: 4, // Geometriya
      title: 'Uchburchaklar geometriyasi - 8-sinf',
      description: "Uchburchak turlari va ularning xossalari haqida dars",
      classLevel: 8, duration: 45,
      content: buildLessonPlanContent(
        ['Uchburchak turlarini farqlash', "Uchburchak xossalarini bilib olish", "Pifagor teoremasini qo'llay olish"],
        ['Geometriya darsligi', 'Doska', "Chizg'ich va transportir", 'Uchburchaklar shakllari'],
        [
          { name: "Tashkiliy qism", duration: 5, description: "Salomlashish, davomatni aniqlash" },
          { name: "Takroriy mashg'ot", duration: 10, description: "Oldingi darsni takrorlash" },
          { name: 'Yangi mavzu', duration: 15, description: "Uchburchak turlari: teng yonli, teng tomonli, to'g'ri burchakli" },
          { name: 'Mustahkamlash', duration: 15, description: "Amaliy mashqlar va Pifagor teoremasini qo'llash" },
        ],
        '45-bet 5-8 masalalar', 'Mustaqil ish asosida',
      ),
    },
    {
      subject: 'Fizika',
      topicIdx: 0, // Mexanika
      title: 'Nyuton qonunlari - 9-sinf',
      description: "Mexanikaning asosiy qonunlari va ularning qo'llanilishi",
      classLevel: 9, duration: 45,
      content: buildLessonPlanContent(
        ["Nyutonning 3 qonunini bilib olish", "Harakat qonunlarini tahlil qila olish", "Hayotiy misollar keltira olish"],
        ['Fizika darsligi', 'Laboratoriya jihozlari', 'Video materiallar'],
        [
          { name: 'Kirish', duration: 5, description: "Mavzuga oid savollar berish" },
          { name: 'Mavzu bayoni', duration: 20, description: "Nyutonning har bir qonunini tushuntirish va misol keltirish" },
          { name: 'Laboratoriya ishi', duration: 15, description: "Tajriba orqali qonunlarni ko'rsatish" },
          { name: 'Xulosa', duration: 5, description: 'Savol-javob va baholash' },
        ],
        '78-bet 1-6 masalalar', 'Laboratoriya ishi va og\'zaki javoblar',
      ),
    },
    {
      subject: 'Kimyo',
      topicIdx: 1, // Davriy sistem
      title: 'Davriy sistem - 8-sinf',
      description: "Mendeleyev davriy sistemasi haqida tushuncha",
      classLevel: 8, duration: 45,
      content: buildLessonPlanContent(
        ["Davriy sistem tuzilishini tushunish", "Elementlarni joylashini bilib olish", "Davrlar va guruhlar farqini bilish"],
        ['Kimyo darsligi', 'Davriy sistem jadvali', 'Doska'],
        [
          { name: "Tashkiliy qism", duration: 5, description: "Davomatni aniqlash" },
          { name: 'Yangi mavzu', duration: 20, description: "Davriy sistem tarixi va tuzilishi" },
          { name: "Amaliy mashg'ot", duration: 15, description: "Elementlarni jadvalda topish mashqi" },
          { name: 'Xulosa', duration: 5, description: 'Takroriy savollar' },
        ],
        '34-bet 2-5 mashqlar', "Og'zaki javoblar va amaliy mashg'ot",
      ),
    },
    {
      subject: 'Biologiya',
      topicIdx: 0, // Hujayra
      title: 'Hujayra - Hayotning asosiy birligi (9-sinf)',
      description: "Hujayra tuzilishi, organellari va funksiyalari haqida to'liq dars",
      classLevel: 9, duration: 45,
      content: buildLessonPlanContent(
        ["Hujayra nazariyasini bilib olish", "Hujayra organellari va funksiyalarini farqlash", "Mikroskopda hujayrani kuzata olish"],
        ['Biologiya darsligi', 'Mikroskop', 'Hujayra modeli', 'Preparatlar'],
        [
          { name: 'Tashkiliy qism', duration: 5, description: 'Salomlashish' },
          { name: 'Nazariy qism', duration: 20, description: 'Hujayra turlari va organellari' },
          { name: 'Laboratoriya ishi', duration: 15, description: 'Mikroskopda hujayrani kuzatish' },
          { name: 'Xulosa', duration: 5, description: 'Savol-javob' },
        ],
        '56-bet 1-4 savollar', 'Laboratoriya ishi',
      ),
    },
    {
      subject: 'Informatika',
      topicIdx: 1, // Dasturlash
      title: "Python - O'zgaruvchilar va ma'lumot turlari",
      description: "Python dasturlash tilining asoslarini o'rgatish",
      classLevel: 10, duration: 45,
      content: buildLessonPlanContent(
        ["Python sintaksisini bilib olish", "O'zgaruvchi e'lon qila olish", "Asosiy ma'lumot turlarini farqlash"],
        ['Kompyuter', "Python o'rnatilgan", 'Prezentatsiya'],
        [
          { name: 'Kirish', duration: 5, description: 'Python haqida umumiy ma\'lumot' },
          { name: "Amaliy dars", duration: 25, description: "print(), input(), o'zgaruvchilar bilan ishlash" },
          { name: 'Mustaqil ish', duration: 10, description: 'Oddiy dastur yozish' },
          { name: 'Xulosa', duration: 5, description: 'Savol-javob' },
        ],
        'Oddiy kalkulyator dasturini yozish', 'Amaliy dasturlar asosida',
      ),
    },
    {
      subject: 'Matematika',
      topicIdx: 1, // Kasrlar
      title: 'Kasrlar bilan amallar - 5-sinf',
      description: "Oddiy va o'nli kasrlar ustida amallar",
      classLevel: 5, duration: 45,
      content: buildLessonPlanContent(
        ['Kasr tushunchasini tushunish', "Oddiy kasrlarni qo'shish va ayirish", "O'nli kasrga o'tkazish"],
        ['Darslik', 'Doska', 'Kalkulyator'],
        [
          { name: 'Tashkiliy qism', duration: 5, description: 'Salomlashish' },
          { name: 'Mavzu bayoni', duration: 15, description: 'Kasrlar bilan amallar qoidalari' },
          { name: 'Mustahkamlash', duration: 20, description: 'Misollar yechish' },
          { name: 'Xulosa', duration: 5, description: 'Takrorlash' },
        ],
        '23-bet 1-8 misollar', 'Mustaqil ish',
      ),
    },
    {
      subject: 'Tarix',
      topicIdx: 2, // Mustaqillik
      title: 'Mustaqillik - Tarix darsi',
      description: "O'zbekiston mustaqillikka erishishi haqida dars",
      classLevel: 9, duration: 45,
      content: buildLessonPlanContent(
        ['Mustaqillik tushunchasini tushunish', "O'zbekiston mustaqillik tarixini bilish", 'Konstitutsiya ahamiyatini anglash'],
        ['Tarix darsligi', 'Xarita', 'Tarixiy fotosuratlar'],
        [
          { name: 'Kirish', duration: 5, description: 'Oldingi darsni takrorlash' },
          { name: 'Mavzu', duration: 20, description: "1991-yil voqealari, mustaqillik e'lon qilinishi" },
          { name: 'Munozara', duration: 15, description: 'Mustaqillik ahamiyati haqida muhokama' },
          { name: 'Xulosa', duration: 5, description: 'Savol-javob' },
        ],
        "Konstitutsiyani o'qib chiqish", "Og'zaki javoblar va insho",
      ),
    },
  ]

  for (const p of lessonPlansData) {
    const id = generateId()
    const subjectId = subjectIds[p.subject]
    const topicId = topicIdsBySubject[p.subject]?.[p.topicIdx] || null
    await execute(
      `INSERT INTO LessonPlan (id, subjectId, topicId, title, description, content, classLevel, duration, authorId, isPublic, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [id, subjectId, topicId, p.title, p.description, p.content, p.classLevel, p.duration, adminId]
    )
  }
  console.log(`✅ Created ${lessonPlansData.length} lesson plans`)

  // ==================== LESSON MATERIALS ====================
  console.log('📎 Creating lesson materials...')

  const lessonMaterialsData = [
    { subject: 'Matematika', topicIdx: 2, title: 'Tenglamalar - Prezentatsiya', desc: 'Chiziqli tenglamalar mavzusidagi dars uchun PowerPoint prezentatsiya', fileUrls: ['https://example.com/presentations/equations.pptx'], type: 'presentation', classLevel: 7 },
    { subject: 'Matematika', topicIdx: 2, title: 'Tenglamalar - Ish varaqi', desc: "O'quvchilar uchun mustaqil ish varaqi", fileUrls: ['https://example.com/worksheets/equations.pdf'], type: 'worksheet', classLevel: 7 },
    { subject: 'Fizika', topicIdx: 0, title: 'Nyuton qonunlari - Video dars', desc: 'Nyuton qonunlari mavzusidagi video dars (15 daqiqa)', fileUrls: ['https://example.com/videos/newton-laws.mp4'], type: 'video', classLevel: 9 },
    { subject: 'Kimyo', topicIdx: 1, title: 'Davriy sistem - Prezentatsiya', desc: "Davriy sistem tuzilishi haqida vizual material", fileUrls: ['https://example.com/presentations/periodic-table.pptx'], type: 'presentation', classLevel: 8 },
    { subject: 'Biologiya', topicIdx: 0, title: 'Hujayra - Laboratoriya ishi', desc: "Mikroskopda hujayrani kuzatish bo'yicha yo'riqnoma", fileUrls: ['https://example.com/labs/cell-lab.pdf'], type: 'document', classLevel: 9 },
    { subject: 'Informatika', topicIdx: 1, title: 'Python - Amaliy mashqlar', desc: "Python dasturlash bo'yicha amaliy mashqlar to'plami", fileUrls: ['https://example.com/exercises/python-exercises.pdf'], type: 'worksheet', classLevel: 10 },
    { subject: 'Informatika', topicIdx: 1, title: "Python - O'zgaruvchilar video dars", desc: "O'zgaruvchilar va ma'lumot turlari haqida video", fileUrls: ['https://example.com/videos/python-variables.mp4'], type: 'video', classLevel: 10 },
    { subject: 'Tarix', topicIdx: 2, title: 'Mustaqillik - Test savollari', desc: 'Mustaqillik mavzusi bo\'yicha test savollari to\'plami', fileUrls: ['https://example.com/tests/independence-test.pdf'], type: 'test', classLevel: 9 },
  ]

  for (const m of lessonMaterialsData) {
    const id = generateId()
    const subjectId = subjectIds[m.subject]
    const topicId = topicIdsBySubject[m.subject]?.[m.topicIdx] || null
    await execute(
      `INSERT INTO LessonMaterial (id, subjectId, topicId, title, description, fileUrls, type, classLevel, authorId, isPublic, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [id, subjectId, topicId, m.title, m.desc, JSON.stringify(m.fileUrls), m.type, m.classLevel, adminId]
    )
  }
  console.log(`✅ Created ${lessonMaterialsData.length} lesson materials`)

  // ==================== COIN PACKAGES ====================
  console.log('💰 Creating COIN packages...')
  const packages = [
    { name: "Boshlang'ich paket", coins: 100, code: 'COIN-START100' },
    { name: 'Standart paket', coins: 500, code: 'COIN-STD500' },
    { name: 'Premium paket', coins: 1000, code: 'COIN-PREM1000' },
    { name: 'Maksimal paket', coins: 5000, code: 'COIN-MAX5000' },
  ]

  for (const p of packages) {
    const id = generateId()
    await execute(
      `INSERT INTO CoinPackage (id, name, coins, code, isActive, createdAt) VALUES (?, ?, ?, ?, 1, NOW())`,
      [id, p.name, p.coins, p.code]
    )
  }

  // ==================== ADMIN CODES ====================
  const adminCodeId = generateId()
  await execute(
    `INSERT INTO AdminCode (id, code, type, isUsed, createdAt, createdById) VALUES (?, ?, 'admin', 0, NOW(), ?)`,
    [adminCodeId, 'USTOZ-ADMIN2024', adminId]
  )

  // ==================== ADVERTISEMENTS ====================
  const adId = generateId()
  await execute(
    `INSERT INTO Advertisement (id, title, description, position, isActive, link, createdAt, updatedAt)
     VALUES (?, ?, ?, 'sidebar', 1, '#', NOW(), NOW())`,
    [adId, 'Yangi matematika darsligi chiqdi!', "Endi marketplace'da mavjud. 100 COIN ga sotib oling."]
  )

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 Demo accounts:')
  console.log('   Admin:   admin@ustozpro.uz / admin123')
  console.log('   User:    user@ustozpro.uz / user123')
  console.log('\n🔑 Admin codes:')
  console.log('   Admin code:  USTOZ-ADMIN2024')
  console.log('   Admin panel password: Balandtoglar1')
  console.log('\n💰 COIN packages:')
  packages.forEach((p) => console.log(`   ${p.code} → ${p.coins} COIN`))
}

main()
  .then(async () => {
    await new Promise(r => setTimeout(r, 100))
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await new Promise(r => setTimeout(r, 100))
    process.exit(1)
  })
