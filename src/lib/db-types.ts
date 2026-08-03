// Database row types (mirror Prisma schema for mysql2 queries)

export interface UserRow {
  id: string
  email: string
  name: string | null
  emailVerified: Date | null
  image: string | null
  password: string | null
  coinBalance: number
  phone: string | null
  phoneVerified: number | boolean // SQLite tinyint or MySQL boolean
  testsCompletedToday: number
  lastTestDate: string | null
  isAdmin: number | boolean
  isBlocked: number | boolean
  subject: string | null
  school: string | null
  district: string | null
  bio: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SubjectRow {
  id: string
  name: string
  icon: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface TopicRow {
  id: string
  subjectId: string
  name: string
  description: string | null
  order: number
  createdAt: Date
}

export interface TestRow {
  id: string
  subjectId: string
  title: string
  description: string | null
  questions: string // JSON
  correctAnswers: string // JSON
  passingScore: number
  timeLimit: number | null
  createdAt: Date
  updatedAt: Date
}

export interface TestResultRow {
  id: string
  userId: string
  testId: string
  score: number
  passed: number | boolean
  answers: string | null
  timeTaken: number | null
  createdAt: Date
}

export interface MaterialRow {
  id: string
  subjectId: string
  title: string
  description: string | null
  fileUrl: string
  type: string
  price: number
  isFree: number | boolean
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseRow {
  id: string
  userId: string
  materialId: string
  price: number | null
  createdAt: Date
}

export interface LibraryRow {
  id: string
  userId: string
  materialId: string
  createdAt: Date
}

export interface FavoriteRow {
  id: string
  userId: string
  materialId: string
  createdAt: Date
}

export interface TransactionRow {
  id: string
  userId: string
  type: string
  amount: number
  description: string | null
  balanceBefore: number | null
  balanceAfter: number | null
  createdAt: Date
}

export interface LessonPlanRow {
  id: string
  subjectId: string
  topicId: string | null
  title: string
  description: string | null
  content: string // JSON
  classLevel: number | null
  duration: number
  authorId: string | null
  isPublic: number | boolean
  createdAt: Date
  updatedAt: Date
}

export interface LessonMaterialRow {
  id: string
  subjectId: string
  topicId: string | null
  title: string
  description: string | null
  fileUrls: string // JSON
  type: string
  classLevel: number | null
  authorId: string | null
  isPublic: number | boolean
  createdAt: Date
  updatedAt: Date
}

export interface AdminCodeRow {
  id: string
  code: string
  type: string
  isUsed: number | boolean
  usedById: string | null
  usedAt: Date | null
  createdAt: Date
  createdById: string
}

export interface CoinPackageRow {
  id: string
  name: string
  coins: number
  code: string
  isActive: number | boolean
  createdAt: Date
}

export interface AdvertisementRow {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  fileType: string | null
  position: string
  isActive: number | boolean
  link: string | null
  createdAt: Date
  updatedAt: Date
}

export interface NotificationRow {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: number | boolean
  link: string | null
  createdAt: Date
}

// Helper to convert MySQL tinyint(1) to boolean
export function toBool(v: any): boolean {
  return v === 1 || v === true || v === '1' || v === 1n
}
