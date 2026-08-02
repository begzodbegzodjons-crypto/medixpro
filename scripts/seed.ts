/**
 * UstozPro - Database seed script
 * Creates: 11 subjects, sample tests for each subject, sample materials
 * Usage: bun run db:seed
 */
import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up (order matters due to FK constraints)
  console.log('🧹 Cleaning existing data...')
  await db.library.deleteMany()
  await db.purchase.deleteMany()
  await db.transaction.deleteMany()
  await db.testResult.deleteMany()
  await db.adminCode.deleteMany()
  await db.coinPackage.deleteMany()
  await db.advertisement.deleteMany()
  await db.material.deleteMany()
  await db.test.deleteMany()
  await db.subject.deleteMany()
  // Don't delete users - they have hashed passwords

  // Create demo admin user (if not exists)
  const adminEmail = 'admin@ustozpro.uz'
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await db.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
        coinBalance: 1000,
      },
    })
    console.log('👤 Created demo admin: admin@ustozpro.uz / admin123')
  } else {
    if (!existingAdmin.isAdmin) {
      await db.user.update({
        where: { id: existingAdmin.id },
        data: { isAdmin: true },
      })
    }
    console.log('👤 Demo admin already exists')
  }

  // Create demo regular user
  const userEmail = 'user@ustozpro.uz'
  const existingUser = await db.user.findUnique({ where: { email: userEmail } })
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('user123', 10)
    await db.user.create({
      data: {
        email: userEmail,
        name: 'Test Foydalanuvchi',
        password: hashedPassword,
        coinBalance: 100,
      },
    })
    console.log('👤 Created demo user: user@ustozpro.uz / user123')
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

  console.log('✅ Created sample tests for 6 subjects')

  // ==================== MATERIALS ====================
  console.log('📦 Creating sample materials...')

  const materialsData = [
    {
      subjectId: createdSubjects[0].id,
      title: "Matematika - To'liq darslik (PDF)",
      description: "5-11 sinflar uchun matematika darsligining elektron versiyasi",
      fileUrl: 'https://example.com/math-textbook.pdf',
      type: 'pdf' as const,
      price: 100,
    },
    {
      subjectId: createdSubjects[0].id,
      title: "Algebra - Video darslar to'plami",
      description: "Tenglamalar va tengsizliklar mavzusidagi video darslar",
      fileUrl: 'https://example.com/algebra-videos',
      type: 'video' as const,
      price: 150,
    },
    {
      subjectId: createdSubjects[1].id,
      title: 'Fizika - Mexanika (PDF)',
      description: "Mexanika bo'limi bo'yicha to'liq qo'llanma",
      fileUrl: 'https://example.com/physics-mechanics.pdf',
      type: 'pdf' as const,
      price: 80,
    },
    {
      subjectId: createdSubjects[2].id,
      title: 'Kimyo - Davriy sistem (PDF)',
      description: "Davriy sistem va elementlar haqida to'liq ma'lumot",
      fileUrl: 'https://example.com/chemistry-periodic.pdf',
      type: 'pdf' as const,
      price: 60,
    },
    {
      subjectId: createdSubjects[3].id,
      title: 'Biologiya - Hujayra (Video)',
      description: "Hujayra tuzilishi haqida video dars",
      fileUrl: 'https://example.com/biology-cell-video',
      type: 'video' as const,
      price: 90,
    },
    {
      subjectId: createdSubjects[9].id,
      title: 'Python dasturlash asoslari (PDF)',
      description: "Python tilini noldan o'rganish uchun qo'llanma",
      fileUrl: 'https://example.com/python-basics.pdf',
      type: 'pdf' as const,
      price: 120,
    },
  ]

  for (const m of materialsData) {
    await db.material.create({ data: m })
  }
  console.log(`✅ Created ${materialsData.length} materials`)

  // ==================== COIN PACKAGES ====================
  console.log('💰 Creating sample COIN packages...')
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
  console.log(`✅ Created ${packages.length} COIN packages`)

  // ==================== ADMIN CODES ====================
  console.log('🔑 Creating admin codes...')
  const admin = await db.user.findUnique({ where: { email: adminEmail } })
  if (admin) {
    await db.adminCode.create({
      data: {
        code: 'USTOZ-ADMIN2024',
        type: 'admin',
        createdById: admin.id,
      },
    })
    console.log('✅ Created admin code: USTOZ-ADMIN2024')
  }

  // ==================== ADVERTISEMENTS ====================
  console.log('📢 Creating sample ads...')
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
  console.log('   Admin code:  USTOZ-ADMIN2024 (use in "Admin" tab)')
  console.log('   Admin panel password: Balandtoglar1')
  console.log('\n💰 COIN packages (test codes):')
  packages.forEach((p) => {
    console.log(`   ${p.code} → ${p.coins} COIN`)
  })
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
