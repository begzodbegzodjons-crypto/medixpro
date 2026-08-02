'use client'

import { useEffect, useState } from 'react'
import { getSubjects, getTestsBySubject, getTestById, submitTestResult } from '@/app/actions'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

interface Question {
  id: number
  text: string
  options: string[]
}

interface TestResult {
  score: number
  passed: boolean
  coinReward: number
}

export default function TestCenter() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [tests, setTests] = useState<any[]>([])
  const [selectedTest, setSelectedTest] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [testInProgress, setTestInProgress] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getSubjects()
        setSubjects(data)
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
    try {
      const testsData = await getTestsBySubject(subjectId)
      setTests(testsData)
    } catch (error) {
      console.error('Failed to load tests', error)
    }
  }

  const handleStartTest = async (testId: string) => {
    try {
      const test = await getTestById(testId)
      setSelectedTest(test)
      setTestInProgress(true)
      setCurrentQuestion(0)
      setAnswers(new Array(test.questions?.length || 0).fill(''))
      setTestResult(null)
    } catch (error) {
      console.error('Failed to start test', error)
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

    try {
      // Calculate score
      let correctCount = 0
      const correctAnswers = selectedTest.correctAnswers || []
      answers.forEach((answer, index) => {
        if (answer === correctAnswers[index]) {
          correctCount++
        }
      })

      const score = (correctCount / answers.length) * 100

      // Submit result
      const result = await submitTestResult(
        selectedTest.id,
        answers,
        score,
        0
      )

      setTestResult({
        score: Math.round(score),
        passed: result.passed,
        coinReward: result.coinReward,
      })

      setTestInProgress(false)
    } catch (error) {
      console.error('Failed to submit test', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Test In Progress
  if (testInProgress && selectedTest) {
    const question: Question = selectedTest.questions[currentQuestion]
    const selectedAnswer = answers[currentQuestion]
    const isLastQuestion = currentQuestion === selectedTest.questions.length - 1

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">{selectedTest.title}</h2>
              <span className="text-sm text-gray-600">
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
            <h3 className="text-xl font-bold text-gray-900 mb-6">{question.text}</h3>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
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
                    <span className="font-medium">{option}</span>
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
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Orqaga
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitTest}
                disabled={!selectedAnswer}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Testni tugallang
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
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
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {testResult.passed ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-600 mb-2">Muvaffaqiyatli!</h2>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-red-600 mb-2">Mudda tugadi</h2>
            </>
          )}

          <p className="text-gray-600 mb-6">Siz {testResult.score}% qullali yaxshilik oldingiz</p>

          {testResult.passed && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 font-semibold">+{testResult.coinReward} COIN qajakonlab oldingiz</p>
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
            Orqaga qayt
          </button>
        </div>
      </div>
    )
  }

  // Subject Selection
  if (!selectedSubject) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fanni tanlang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectSelect(subject.id)}
              className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all text-left"
            >
              <h3 className="font-bold text-gray-900">{subject.name}</h3>
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
        className="mb-6 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        ← Orqaga
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Testni tanlang</h2>
      <div className="grid gap-4">
        {tests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-blue-600">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">{test.title}</h3>
                <p className="text-gray-600 text-sm">{test.description}</p>
              </div>
              <button
                onClick={() => handleStartTest(test.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Boshlash
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
