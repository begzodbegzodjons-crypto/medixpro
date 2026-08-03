/**
 * UstozPro - Database seed script (extended)
 * Creates: 11 subjects, topics, tests, materials, lesson plans, lesson materials, COIN packages
 */
import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding database (extended)...')

  // Clean up
  console.log('🧹 Cleaning existing data...')
  await db.favorite.deleteMany()
  await db.library.deleteMany()
  await db.purchase.deleteMany()
  await db.transaction.deleteMany()
  await db.testResult.deleteMany()
  await db.lessonPlan.deleteMany()
  await db.lessonMaterial.deleteMany()
  await db.topic.deleteMany()
  await db.adminCode.deleteMany()
  await db.coinPackage.deleteMany()
  await db.advertisement.deleteMany()
  await db.material.deleteMany()
  await db.test.deleteMany()
  await db.subject.deleteMany()

  // Demo admin user
  const adminEmail = 'admin@ustozpro.uz'
  let admin = await db.user.findUnique({ where: { email: adminEmail } })
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    admin = await db.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
        coinBalance: 1000,
      },
    })
    console.log('👤 Created demo admin')
  } else if (!admin.isAdmin) {
    admin = await db.user.update({
      where: { id: admin.id },
      data: { isAdmin: true },
    })
  }

  // Demo user
  const userEmail = 'user@ustozpro.uz'
  let user = await db.user.findUnique({ where: { email: userEmail } })
  if (!user) {
    const hashedPassword = await bcrypt.hash('user123', 10)
    user = await db.user.create({
      data: {
        email: userEmail,
        name: 'Test Foydalanuvchi',
        password: hashedPassword,
        coinBalance: 100,
      },
    })
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

  const createdSubjects = []
  for (const s of subjectsData) {
    const subject = await db.subject.create({ data: s })
    createdSubjects.push(subject)
  }
  console.log(`✅ Created ${createdSubjects.length} subjects`)

  // ==================== TOPICS ====================
  console.log('🔖 Creating topics...')
  const topicsBySubject: Record<string, any[]> = {}

  const topicsData: Record<string, string[]> = {
    'Matematika': ['Natural sonlar', 'Kasrlar', 'Tenglamalar va tengsizliklar', 'Funksiyalar', 'Geometriya asoslari', 'Trigonometriya'],
    'Fizika': ['Mexanika', 'Elektr va magnitmaydon', 'Termodinamika', 'Optika', 'Atom fizikasi'],
    'Kimyo': ['Atom tuzilishi', 'Davriy sistem', 'Kimyoviy bog\'lar', 'Kislota va ishqorlar', 'Organik kimyo'],
    'Biologiya': ['Hujayra', 'Genetika', 'Evolyutsiya', 'Ekologiya', 'Odam anatomiyasi'],
    'Tarix': ['Qadimgi davlatlar', 'O\'rta asrlar', "O'zbekiston mustaqilligi", 'Jahon tarixi'],
    'Geografiya': ['Tabiiy geografiya', 'Iqtisodiy geografiya', "O'zbekiston geografiyasi", 'Demografiya'],
    'Adabiyot': ['Xalq og\'zaki ijodi', 'Klassik adabiyot', 'Zamonaviy adabiyot', 'Adabiyot nazariyasi'],
    'Informatika': ['Algoritm', 'Dasturlash', 'Ma\'lumotlar bazasi', 'Kompyuter tarmoqlari', 'Web texnologiyalar'],
  }

  for (const subject of createdSubjects) {
    const topicNames = topicsData[subject.name] || []
    const created = []
    for (let i = 0; i < topicNames.length; i++) {
      const t = await db.topic.create({
        data: {
          subjectId: subject.id,
          name: topicNames[i],
          order: i,
        },
      })
      created.push(t)
    }
    topicsBySubject[subject.id] = created
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
    const q = questions.map((item, idx) => ({
      id: idx + 1,
      text: item.text,
      options: item.options,
    }))
    const a = questions.map((item) => item.options[item.correctIdx])
    return {
      subjectId,
      title,
      description,
      questions: JSON.stringify(q),
      correctAnswers: JSON.stringify(a),
      passingScore: 60,
      timeLimit: 30,
    }
  }

  await db.test.create({
    data: buildTest(
      createdSubjects[0].id,
      'Matematika - Asosiy test',
      'Algebra va geometriya asoslari',
      [
        { text: '2 + 2 ning qiymati nechaga teng?', options: ['3', '4', '5', '6'], correctIdx: 1 },
        { text: '12 × 12 ning qiymati?', options: ['124', '144', '154', '164'], correctIdx: 1 },
        { text: 'Pifagor teoremasi qaysi tenglama bilan ifodalanadi?', options: ['a² + b² = c²', 'a + b = c', 'a² - b² = c²', 'a × b = c'], correctIdx: 0 },
        { text: 'x² = 25 tenglamaning yechimi?', options: ['x = 5', 'x = -5', 'x = ±5', 'x = 25'], correctIdx: 2 },
        { text: 'Doiraning yuzi formulasi?', options: ['πr', 'πr²', '2πr', 'r²'], correctIdx: 1 },
      ]
    ),
  })

  await db.test.create({
    data: buildTest(
      createdSubjects[1].id,
      'Fizika - Mexanika',
      'Nyuton qonunlari va kinematika',
      [
        { text: "Nyutonning birinchi qonuni nima haqida?", options: ['Tezlanish', 'Inertsiya', 'Energiya', 'Impuls'], correctIdx: 1 },
        { text: 'Tezlanishning birligi?', options: ['m/s', 'm/s²', 'kg·m/s', 'N'], correctIdx: 1 },
        { text: 'F = m × a formulasi nima?', options: ['Energiya', 'Tezlik', 'Kuch', 'Ish'], correctIdx: 2 },
        { text: 'Erkin tushish tezlanishi qancha?', options: ['8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '9.5 m/s²'], correctIdx: 1 },
        { text: 'Impuls formulasi?', options: ['p = mv', 'p = m/v', 'p = m + v', 'p = m·a'], correctIdx: 0 },
      ]
    ),
  })

  await db.test.create({
    data: buildTest(
      createdSubjects[2].id,
      'Kimyo - Davriy sistem',
      'Elementlar va birikmalar',
      [
        { text: 'H2O nima?', options: ['Vodorod', 'Suv', 'Kislota', 'Kislorod'], correctIdx: 1 },
        { text: 'Oltinning kimyoviy belgisi?', options: ['Au', 'Ag', 'Fe', 'Cu'], correctIdx: 0 },
        { text: 'Neytronning zaryadi?', options: ['+', '-', '0', '±1'], correctIdx: 2 },
        { text: 'PH 7 qandagi muhitni bildiradi?', options: ['Kislotali', 'Ishqoriy', 'Neytral', 'Zaif kislotali'], correctIdx: 2 },
        { text: 'CO2 nima gaz?', options: ['Kislorod', 'Vodorod', 'Uglerod dioksid', 'Azot'], correctIdx: 2 },
      ]
    ),
  })

  await db.test.create({
    data: buildTest(
      createdSubjects[3].id,
      'Biologiya - Hujayra',
      'Hujayra tuzilishi va funksiyalari',
      [
        { text: "Hujayraning energetik stansiyasi?", options: ['Yadro', 'Ribosoma', 'Mitoxondriya', 'Lizosoma'], correctIdx: 2 },
        { text: 'DNK qaysi birikma?', options: ['Oqsil', 'Nuklein kislota', 'Uglevod', 'Lipid'], correctIdx: 1 },
        { text: "Fotosintez qaysi organelaida sodir bo'ladi?", options: ['Mitoxondriya', 'Xloroplast', 'Yadro', 'Ribosoma'], correctIdx: 1 },
        { text: "Odam tanasidagi eng katta organ?", options: ["Jigar", "O'pka", 'Teri', 'Miya'], correctIdx: 2 },
        { text: "Qon guruhlaridan nechtasi bor?", options: ['2', '3', '4', '5'], correctIdx: 2 },
      ]
    ),
  })

  await db.test.create({
    data: buildTest(
      createdSubjects[4].id,
      "Tarix - O'zbekiston tarixi",
      'Mustaqillik davri tarixi',
      [
        { text: "O'zbekiston mustaqillikka erishgan yil?", options: ['1989', '1990', '1991', '1992'], correctIdx: 2 },
        { text: "O'zbekiston Respublikasining birinchi prezidenti?", options: ['Sh. Mirziyoyev', 'I. Karimov', 'A. Rashidov', 'R. Abdullayev'], correctIdx: 1 },
        { text: 'Konstitutsiya qabul qilingan sana?', options: ['1991-yil 1-sentabr', '1992-yil 8-dekabr', '1993-yil 1-yanvar', '1995-yil 8-dekabr'], correctIdx: 1 },
        { text: "O'zbekiston poytaxti?", options: ['Samarqand', 'Buxoro', 'Toshkent', 'Andijon'], correctIdx: 2 },
        { text: "Mustaqillik bayrami qachon nishonlanadi?", options: ['1-yanvar', '8-dekabr', '1-sentabr', '21-mart'], correctIdx: 2 },
      ]
    ),
  })

  await db.test.create({
    data: buildTest(
      createdSubjects[9].id,
      'Informatika - Asoslar',
      'Algoritm va dasturlash asoslari',
      [
        { text: '1 bayt necha bitdan iborat?', options: ['4', '8', '16', '32'], correctIdx: 1 },
        { text: 'HTML nima?', options: ["Dasturlash tili", "Markap tili", "Ma'lumotlar bazasi", 'Brauzer'], correctIdx: 1 },
        { text: 'Python qaysi paradigmadagi til?', options: ['Faqat procedural', "Faqat obyektga yo'naltirilgan", "Ko'p paradigmali", 'Faqat funksional'], correctIdx: 2 },
        { text: 'CPU nima?', options: ['Markaziy protsessor', 'Operativ xotira', 'Qattiq disk', 'Video karta'], correctIdx: 0 },
        { text: 'Binary sistemada 1010 = ? (decimal)', options: ['8', '10', '12', '14'], correctIdx: 1 },
      ]
    ),
  })

  console.log('✅ Created sample tests')

  // ==================== MATERIALS ====================
  console.log('📦 Creating materials...')
  const materialsData = [
    {
      subjectId: createdSubjects[0].id,
      title: "Matematika - To'liq darslik (PDF)",
      description: "5-11 sinflar uchun matematika darsligining elektron versiyasi",
      fileUrl: 'https://example.com/math-textbook.pdf',
      type: 'pdf',
      price: 100,
      isFree: false,
    },
    {
      subjectId: createdSubjects[0].id,
      title: 'Algebra - Video darslar to\'plami',
      description: "Tenglamalar va tengsizliklar mavzusidagi video darslar",
      fileUrl: 'https://example.com/algebra-videos',
      type: 'video',
      price: 150,
      isFree: false,
    },
    {
      subjectId: createdSubjects[1].id,
      title: 'Fizika - Mexanika (PDF)',
      description: "Mexanika bo'limi bo'yicha to'liq qo'llanma",
      fileUrl: 'https://example.com/physics-mechanics.pdf',
      type: 'pdf',
      price: 80,
      isFree: false,
    },
    {
      subjectId: createdSubjects[2].id,
      title: 'Kimyo - Davriy sistem (PDF)',
      description: "Davriy sistem va elementlar haqida to'liq ma'lumot",
      fileUrl: 'https://example.com/chemistry-periodic.pdf',
      type: 'pdf',
      price: 60,
      isFree: false,
    },
    {
      subjectId: createdSubjects[3].id,
      title: 'Biologiya - Hujayra (Video)',
      description: "Hujayra tuzilishi haqida video dars",
      fileUrl: 'https://example.com/biology-cell-video',
      type: 'video',
      price: 90,
      isFree: false,
    },
    {
      subjectId: createdSubjects[9].id,
      title: 'Python dasturlash asoslari (PDF)',
      description: "Python tilini noldan o'rganish uchun qo'llanma",
      fileUrl: 'https://example.com/python-basics.pdf',
      type: 'pdf',
      price: 120,
      isFree: false,
    },
    // Free materials
    {
      subjectId: createdSubjects[0].id,
      title: 'Matematika formulalari to\'plami (Bepul)',
      description: "Asosiy matematika formulalari, har bir o'quvchiga kerak",
      fileUrl: 'https://example.com/math-formulas.pdf',
      type: 'pdf',
      price: 0,
      isFree: true,
    },
    {
      subjectId: createdSubjects[1].id,
      title: 'Fizika formulalari (Bepul)',
      description: "Barcha asosiy fizika formulalari bir joyda",
      fileUrl: 'https://example.com/physics-formulas.pdf',
      type: 'pdf',
      price: 0,
      isFree: true,
    },
  ]

  for (const m of materialsData) {
    await db.material.create({ data: m })
  }
  console.log(`✅ Created ${materialsData.length} materials`)

  // ==================== LESSON PLANS ====================
  console.log('📋 Creating lesson plans...')

  const buildLessonPlanContent = (
    objectives: string[],
    materials: string[],
    stages: { name: string; duration: number; description: string }[],
    homework: string,
    assessment: string,
    notes?: string
  ) => {
    return JSON.stringify({
      objectives,
      materials,
      stages,
      homework,
      assessment,
      notes: notes || '',
    })
  }

  const lessonPlansData = [
    {
      subjectId: createdSubjects[0].id,
      topicId: topicsBySubject[createdSubjects[0].id]?.[2]?.id, // Tenglamalar
      title: 'Tenglamalar va ularning yechimlari - 7-sinf',
      description: 'Chiziqli tenglamalarni yechish metodikasi bo\'yicha to\'liq dars rejasi',
      classLevel: 7,
      duration: 45,
      authorId: admin.id,
      isPublic: true,
      content: buildLessonPlanContent(
        ['O\'quvchilar chiziqli tenglama tushunchasini tushunishlari', 'Tenglamani yechish qoidalarini bilib olish', 'Amaliy misollarni mustaqil yecha olish'],
        ['Darslik', 'Doska', 'Ko\'rgazma materiallar', 'Test savollari'],
        [
          { name: 'Tashkiliy qism', duration: 5, description: 'O\'quvchilarni ro\'yxatga olish, darsga tayyorgarlik' },
          { name: 'Yangi mavzu bayoni', duration: 15, description: 'Tenglama tushunchasi, uning yechimi va qoidalari' },
          { name: 'Mustahkamlash', duration: 15, description: 'Darslikdagi misollarni yechish, mustaqil ish' },
          { name: 'Xulosa va baholash', duration: 10, description: 'Darsni xulosalash, o\'quvchilarni baholash, uy vazifasi' },
        ],
        'Darslikning 45-betidagi 1-10 misollarni yechish',
        'Amaliy ish va og\'zaki javoblar asosida baholash',
        'Iqtidorli o\'quvchilar uchun qo\'shimcha murakkab misollar tayyorlang'
      ),
    },
    {
      subjectId: createdSubjects[0].id,
      topicId: topicsBySubject[createdSubjects[0].id]?.[4]?.id,
      title: 'Uchburchaklar geometriyasi - 8-sinf',
      description: 'Uchburchak turlari va ularning xossalari haqida dars',
      classLevel: 8,
      duration: 45,
      authorId: admin.id,
      isPublic: true,
      content: buildLessonPlanContent(
        ['Uchburchak turlarini farqlash', 'Uchburchak xossalarini bilib olish', 'Pifagor teoremasini qo\'llay olish'],
        ['Geometriya darsligi', 'Doska', 'Chizg\'ich va transportir', 'Uchburchaklar shakllari'],
        [
          { name: 'Tashkiliy qism', duration: 5, description: 'Salomlashish, davomatni aniqlash' },
          { name: 'Takroriy mashg\'ot', duration: 10, description: 'Oldingi darsni takrorlash' },
          { name: 'Yangi mavzu', duration: 15, description: 'Uchburchak turlari: teng yonli, teng tomonli, to\'g\'ri burchakli' },
          { name: 'Mustahkamlash', duration: 15, description: 'Amaliy mashqlar va Pifagor teoremasini qo\'llash' },
        ],
        '45-bet 5-8 masalalar',
        'Mustaqil ish asosida',
      ),
    },
    {
      subjectId: createdSubjects[1].id,
      topicId: topicsBySubject[createdSubjects[1].id]?.[0]?.id,
      title: 'Nyuton qonunlari - 9-sinf',
      description: 'Mexanikaning asosiy qonunlari va ularning qo\'llanilishi',
      classLevel: 9,
      duration: 45,
      authorId: admin.id,
      isPublic: true,
      content: buildLessonPlanContent(
        ['Nyutonning 3 qonunini bilib olish', 'Harakat qonunlarini tahlil qila olish', 'Hayotiy misollar keltira olish'],
        ['Fizika darsligi', 'Laboratoriya jihozlari', 'Video materiallar'],
        [
          { name: 'Kirish', duration: 5, description: 'Mavzuga oid savollar berish' },
          { name: 'Mavzu bayoni', duration: 20, description: 'Nyutonning har bir qonunini tushuntirish va misol keltirish' },
          { name: 'Laboratoriya ishi', duration: 15, description: 'Tajriba orqali qonunlarni ko\'rsatish' },
          { name: 'Xulosa', duration: 5, description: 'Savol-javob va baholash' },
        ],
        '78-bet 1-6 masalalar',
        'Laboratoriya ishi va og\'zaki javoblar',
      ),
    },
    {
      subjectId: createdSubjects[2].id,
      topicId: topicsBySubject[createdSubjects[2].id]?.[1]?.id,
      title: 'Davriy sistem - 8-sinf',
      description: 'Mendeleyev davriy sistemasi haqida tushuncha',
      classLevel: 8,
      duration: 45,
      authorId: admin.id,
      isPublic: true,
      content: buildLessonPlanContent(
        ['Davriy sistem tuzilishini tushunish', 'Elementlarni joylashini bilib olish', 'Davrlar va guruhlar farqini bilish'],
        ['Kimyo darsligi', 'Davriy sistem jadvali', 'Doska'],
        [
          { name: 'Tashkiliy qism', duration: 5, description: 'Davomatni aniqlash' },
          { name: 'Yangi mavzu', duration: 20, description: 'Davriy sistem tarixi va tuzilishi' },
          { name: 'Amaliy mashg\'ot', duration: 15, description: 'Elementlarni jadvalda topish mashqi' },
          { name: 'Xulosa', duration: 5, description: 'Takroriy savollar' },
        ],
        '34-bet 2-5 mashqlar',
        'Og\'zaki javoblar va amaliy mashg\'ot',
      ),
    },
    {
      subjectId: createdSubjects[3].id,
      topicId: topicsBySubject[createdSubjects[3].id]?.[0]?.id,
      title: 'Hujayra - Hayotning asosiy birligi (9-sinf)',
      description: 'Hujayra tuzilishi, organellari va funksiyalari haqida to\'liq dars',
      classLevel: 9,
      duration: 45,
      authorId: admin.id,
      isPublic: true,
      content: buildLessonPlanContent(
        ['Hujayra nazariyasini bilib olish', 'Hujayra organellari va funksiyalarini farqlash', 'Mikroskopda hujayrani kuzata olish'],
        ['Biologiya darsligi', 'Mikroskop', 'Hujayra modeli', 'Preparatlar'],
        [
          { name: 'Tashkiliy qism', duration: 5, description: 'Salomlashish' },
          { name: 'Nazariy qism', duration: 20, description: 'Hujayra turlari va organellari' },
          { name: 'Laboratoriya ishi', duration: 15, description: 'Mikroskopda hujayrani kuzatish' },
          { name: 'Xulosa', duration: 5, description: 'Savol-javob' },
        ],
        '56-bet 1-4 savollar',
        'Laboratoriya ishi',
      ),
    },
    {
      subjectId: createdSubjects[9].id,
      topicId: topicsBySubject[createdSubjects[9].id]?.[1]?.id,
      title: 'Python - O\'zgaruvchilar va ma\'lumot turlari',
      description: 'Python dasturlash tilining asoslarini o\'rgatish',
      classLevel: 10,
      duration: 45,
      authorId: admin.id,
      isPublic: true,
      content: buildLessonPlanContent(
        ['Python sintaksisini bilib olish', 'O\'zgaruvchi e\'lon qila olish', 'Asosiy ma\'lumot turlarini farqlash'],
        ['Kompyuter', 'Python o\'rnatilgan', 'Prezentatsiya'],
        [
          { name: 'Kirish', duration: 5, description: 'Python haqida umumiy ma\'lumot' },
          { name: 'Amaliy dars', duration: 25, description: 'print(), input(), o\'zgaruvchilar bilan ishlash' },
          { name: 'Mustaqil ish', duration: 10, description: 'Oddiy dastur yozish' },
          { name: 'Xulosa', duration: 5, description: 'Savol-javob' },
        ],
        'Oddiy kalkulyator dasturini yozish',
        'Amaliy dasturlar asosida',
      ),
    },
    {
      subjectId: createdSubjects[0].id,
      topicId: topicsBySubject[createdSubjects[0].id]?.[1]?.id,
      title: 'Kasrlar bilan amallar - 5-sinf',
      description: 'Oddiy va o\'nli kasrlar ustida amallar',
      classLevel: 5,
      duration: 45,
      authorId: admin.id,
      isPublic: true,
      content: buildLessonPlanContent(
        ['Kasr tushunchasini tushunish', 'Oddiy kasrlarni qo\'shish va ayirish', 'O\'nli kasrga o\'tkazish'],
        ['Darslik', 'Doska', 'Kalkulyator'],
        [
          { name: 'Tashkiliy qism', duration: 5, description: 'Salomlashish' },
          { name: 'Mavzu bayoni', duration: 15, description: 'Kasrlar bilan amallar qoidalari' },
          { name: 'Mustahkamlash', duration: 20, description: 'Misollar yechish' },
          { name: 'Xulosa', duration: 5, description: 'Takrorlash' },
        ],
        '23-bet 1-8 misollar',
        'Mustaqil ish',
      ),
    },
    {
      subjectId: createdSubjects[4].id,
      topicId: topicsBySubject[createdSubjects[4].id]?.[2]?.id,
      title: 'Mustaqillik - Tarix darsi',
      description: 'O\'zbekiston mustaqillikka erishishi haqida dars',
      classLevel: 9,
      duration: 45,
      authorId: admin.id,
      isPublic: true,
      content: buildLessonPlanContent(
        ['Mustaqillik tushunchasini tushunish', 'O\'zbekiston mustaqillik tarixini bilish', 'Konstitutsiya ahamiyatini anglash'],
        ['Tarix darsligi', 'Xarita', 'Tarixiy fotosuratlar'],
        [
          { name: 'Kirish', duration: 5, description: 'Oldingi darsni takrorlash' },
          { name: 'Mavzu', duration: 20, description: '1991-yil voqealari, mustaqillik e\'lon qilinishi' },
          { name: 'Munozara', duration: 15, description: 'Mustaqillik ahamiyati haqida muhokama' },
          { name: 'Xulosa', duration: 5, description: 'Savol-javob' },
        ],
        'Konstitutsiyani o\'qib chiqish',
        'Og\'zaki javoblar va insho',
      ),
    },
  ]

  for (const p of lessonPlansData) {
    await db.lessonPlan.create({ data: p as any })
  }
  console.log(`✅ Created ${lessonPlansData.length} lesson plans`)

  // ==================== LESSON MATERIALS ====================
  console.log('📎 Creating lesson materials...')

  const lessonMaterialsData = [
    {
      subjectId: createdSubjects[0].id,
      topicId: topicsBySubject[createdSubjects[0].id]?.[2]?.id,
      title: 'Tenglamalar - Prezentatsiya',
      description: 'Chiziqli tenglamalar mavzusidagi dars uchun PowerPoint prezentatsiya',
      fileUrls: JSON.stringify(['https://example.com/presentations/equations.pptx']),
      type: 'presentation',
      classLevel: 7,
      authorId: admin.id,
      isPublic: true,
    },
    {
      subjectId: createdSubjects[0].id,
      topicId: topicsBySubject[createdSubjects[0].id]?.[2]?.id,
      title: 'Tenglamalar - Ish varaqi',
      description: 'O\'quvchilar uchun mustaqil ish varaqi',
      fileUrls: JSON.stringify(['https://example.com/worksheets/equations.pdf']),
      type: 'worksheet',
      classLevel: 7,
      authorId: admin.id,
      isPublic: true,
    },
    {
      subjectId: createdSubjects[1].id,
      topicId: topicsBySubject[createdSubjects[1].id]?.[0]?.id,
      title: 'Nyuton qonunlari - Video dars',
      description: 'Nyuton qonunlari mavzusidagi video dars (15 daqiqa)',
      fileUrls: JSON.stringify(['https://example.com/videos/newton-laws.mp4']),
      type: 'video',
      classLevel: 9,
      authorId: admin.id,
      isPublic: true,
    },
    {
      subjectId: createdSubjects[2].id,
      topicId: topicsBySubject[createdSubjects[2].id]?.[1]?.id,
      title: 'Davriy sistem - Prezentatsiya',
      description: 'Davriy sistem tuzilishi haqida vizual material',
      fileUrls: JSON.stringify(['https://example.com/presentations/periodic-table.pptx']),
      type: 'presentation',
      classLevel: 8,
      authorId: admin.id,
      isPublic: true,
    },
    {
      subjectId: createdSubjects[3].id,
      topicId: topicsBySubject[createdSubjects[3].id]?.[0]?.id,
      title: 'Hujayra - Laboratoriya ishi',
      description: 'Mikroskopda hujayrani kuzatish bo\'yicha yo\'riqnoma',
      fileUrls: JSON.stringify(['https://example.com/labs/cell-lab.pdf']),
      type: 'document',
      classLevel: 9,
      authorId: admin.id,
      isPublic: true,
    },
    {
      subjectId: createdSubjects[9].id,
      topicId: topicsBySubject[createdSubjects[9].id]?.[1]?.id,
      title: 'Python - Amaliy mashqlar',
      description: 'Python dasturlash bo\'yicha amaliy mashqlar to\'plami',
      fileUrls: JSON.stringify(['https://example.com/exercises/python-exercises.pdf']),
      type: 'worksheet',
      classLevel: 10,
      authorId: admin.id,
      isPublic: true,
    },
    {
      subjectId: createdSubjects[9].id,
      topicId: topicsBySubject[createdSubjects[9].id]?.[1]?.id,
      title: 'Python - O\'zgaruvchilar video dars',
      description: 'O\'zgaruvchilar va ma\'lumot turlari haqida video',
      fileUrls: JSON.stringify(['https://example.com/videos/python-variables.mp4']),
      type: 'video',
      classLevel: 10,
      authorId: admin.id,
      isPublic: true,
    },
    {
      subjectId: createdSubjects[4].id,
      topicId: topicsBySubject[createdSubjects[4].id]?.[2]?.id,
      title: 'Mustaqillik - Test savollari',
      description: 'Mustaqillik mavzusi bo\'yicha test savollari to\'plami',
      fileUrls: JSON.stringify(['https://example.com/tests/independence-test.pdf']),
      type: 'test',
      classLevel: 9,
      authorId: admin.id,
      isPublic: true,
    },
  ]

  for (const m of lessonMaterialsData) {
    await db.lessonMaterial.create({ data: m as any })
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
    await db.coinPackage.create({
      data: {
        name: p.name,
        coins: p.coins,
        code: p.code,
        isActive: true,
      },
    })
  }

  // ==================== ADMIN CODES ====================
  await db.adminCode.create({
    data: {
      code: 'USTOZ-ADMIN2024',
      type: 'admin',
      createdById: admin.id,
    },
  })

  // ==================== ADVERTISEMENTS ====================
  await db.advertisement.create({
    data: {
      title: 'Yangi matematika darsligi chiqdi!',
      description: "Endi marketplace'da mavjud. 100 COIN ga sotib oling.",
      imageUrl: null,
      position: 'sidebar',
      isActive: true,
      link: '#',
    },
  })

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 Demo accounts:')
  console.log('   Admin:   admin@ustozpro.uz / admin123')
  console.log('   User:    user@ustozpro.uz / user123')
  console.log('\n🔑 Admin codes:')
  console.log('   Admin code:  USTOZ-ADMIN2024')
  console.log('   Admin panel password: Balandtoglar1')
  console.log('\n💰 COIN packages:')
  packages.forEach((p) => console.log(`   ${p.code} → ${p.coins} COIN`))
  console.log(`\n📊 Totals: ${createdSubjects.length} subjects, ${lessonPlansData.length} lesson plans, ${lessonMaterialsData.length} lesson materials`)
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await db.$disconnect()
    process.exit(1)
  })
