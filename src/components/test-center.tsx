'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react'

interface Subject {
  id: string
  name: string
  icon?: string
}

interface TestListItem {
  id: string
  title: string
  description?: string
  passingScore: number
  timeLimit?: number | null
  createdAt: string
  _count?: { testResults: number }
}

interface TestFull {
  id: string
  title: string
  description?: string
  questions: { id: number; text: string; options: string[] }[]
  correctAnswers: string[]
  passingScore: number
  timeLimit?: number | null
  subject?: { name: string }
}

interface TestResult {
  score: number
  passed: boolean
  coinReward: number
}

export default function TestCenter() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [tests, setTests] = useState<TestListItem[]>([])
  const [selectedTest, setSelectedTest] = useState<TestFull | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [testInProgress, setTestInProgress] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingTests, setLoadingTests] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await fetch('/api/subjects')
        if (res.ok) {
          const data = await res.json()
          setSubjects(data)
        }
      } catch (error) {
        console.error('Failed to load subjects', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubjects()
  }, [])

  const handleSubjectSelect = async (subjectId: string) => {
    setSelectedSubject(subjectId)
    setLoadingTests(true)
    setError(null)
    try {
      const res = await fetch(`/api/subjects/${subjectId}/tests`)
      if (res.ok) {
        const data = await res.json()
        setTests(data)
      }
    } catch (error) {
      console.error('Failed to load tests', error)
      setError('Testlarni yuklashda xato')
    } finally {
      setLoadingTests(false)
    }
  }

  const handleStartTest = async (testId: string) => {
    setError(null)
    try {
      const res = await fetch(`/api/tests/${testId}`)
      if (!res.ok) {
        const err = await res.json()
        setError(err.message || 'Test yuklashda xato')
        return
      }
      const test = await res.json()
      setSelectedTest(test)
      setTestInProgress(true)
      setCurrentQuestion(0)
      setAnswers(new Array(test.questions?.length || 0).fill(''))
      setTestResult(null)
    } catch (error) {
      console.error('Failed to start test', error)
      setError('Test yuklashda xato')
    }
  }

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < (selectedTest?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitTest = async () => {
    if (!selectedTest) return
    setSubmitting(true)
    setError(null)

    try {
      // Calculate score on client
      let correctCount = 0
      const correctAnswers = selectedTest.correctAnswers || []
      answers.forEach((answer, index) => {
        if (answer === correctAnswers[index]) {
          correctCount++
        }
      })

      const score = (correctCount / answers.length) * 100

      // Submit to API
      const res = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: selectedTest.id,
          answers,
          score,
          timeTaken: 0,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.message || 'Testni yuborishda xato')
        setSubmitting(false)
        return
      }

      const result = await res.json()

      setTestResult({
        score: Math.round(score),
        passed: result.passed,
        coinReward: result.coinReward,
      })

      setTestInProgress(false)
      setSubmitting(false)
    } catch (error) {
      console.error('Failed to submit test', error)
      setError('Testni yuborishda xato')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setSelectedSubject(null)
              setSelectedTest(null)
              setTestInProgress(false)
              setTestResult(null)
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Qayt urinish
          </button>
        </div>
      </div>
    )
  }

  // Test In Progress
  if (testInProgress && selectedTest) {
    const question = selectedTest.questions[currentQuestion]
    const selectedAnswer = answers[currentQuestion]
    const isLastQuestion = currentQuestion === selectedTest.questions.length - 1

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">{selectedTest.title}</h2>
              <span className="text-xs md:text-sm text-gray-600">
                {currentQuestion + 1} / {selectedTest.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / selectedTest.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6">{question.text}</h3>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-3 md:p-4 text-left border-2 rounded-lg transition-all ${
                    selectedAnswer === option
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedAnswer === option
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedAnswer === option && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="font-medium text-sm md:text-base">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="px-4 md:px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              Orqaga
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitTest}
                disabled={!selectedAnswer || submitting}
                className="px-4 md:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm md:text-base"
              >
                {submitting ? 'Yuborilmoqda...' : 'Testni tugallang'}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm md:text-base"
              >
                Keyingi
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Test Result
  if (testResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center">
          {testResult.passed ? (
            <>
              <CheckCircle className="w-14 h-14 md:w-16 md:h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-2">Muvaffaqiyatli!</h2>
            </>
          ) : (
            <>
              <XCircle className="w-14 h-14 md:w-16 md:h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-2">Mudda tugadi</h2>
            </>
          )}

          <p className="text-gray-600 mb-6 text-sm md:text-base">
            Siz {testResult.score}% ball oldingiz
          </p>

          {testResult.passed && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 font-semibold">+{testResult.coinReward} COIN oldingiz 🎉</p>
            </div>
          )}

          <button
            onClick={() => {
              setTestInProgress(false)
              setTestResult(null)
              setSelectedTest(null)
              setSelectedSubject(null)
              setTests([])
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Bosh sahifaga qayt
          </button>
        </div>
      </div>
    )
  }

  // Subject Selection
  if (!selectedSubject) {
    return (
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Fanni tanlang</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectSelect(subject.id)}
              className="p-4 md:p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all text-left"
            >
              {subject.icon && <div className="text-3xl mb-2">{subject.icon}</div>}
              <h3 className="font-bold text-gray-900 text-sm md:text-base">{subject.name}</h3>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Test Selection
  return (
    <div>
      <button
        onClick={() => setSelectedSubject(null)}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Orqaga
      </button>

      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Testni tanlang</h2>

      {loadingTests ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white rounded-lg p-8 md:p-12 text-center">
          <p className="text-gray-600">Bu fanga hozircha testlar qo&apos;shilmagan</p>
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4">
          {tests.map((test) => (
            <div key={test.id} className="bg-white rounded-lg p-4 md:p-6 border-2 border-gray-200 hover:border-blue-600 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 md:mb-2">{test.title}</h3>
                  {test.description && (
                    <p className="text-gray-600 text-xs md:text-sm mb-2">{test.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {test.timeLimit || 30} daqiqa
                    </span>
                    <span>O&apos;tish: {test.passingScore}%</span>
                    {test._count && (
                      <span>{test._count.testResults} marta yechilgan</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleStartTest(test.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
                >
                  Boshlash
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
