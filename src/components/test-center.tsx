'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, ArrowLeft, FileCode } from 'lucide-react'

interface Subject { id: string; name: string; icon?: string }
interface TestListItem { id: string; title: string; description?: string; passingScore: number; timeLimit?: number | null; testType?: string; createdAt: string; _count?: { testResults: number } }
interface TestFull { id: string; title: string; description?: string; testType?: string; questions: { id: number; text: string; options: string[] }[]; correctAnswers: string[]; passingScore: number; timeLimit?: number | null; subject?: { name: string } }
interface TestResult { score: number; passed: boolean; coinReward: number }

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
    fetch('/api/subjects').then(r => r.json()).then(setSubjects).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSubjectSelect = async (subjectId: string) => {
    setSelectedSubject(subjectId); setLoadingTests(true); setError(null)
    try { const res = await fetch(`/api/subjects/${subjectId}/tests`); if (res.ok) setTests(await res.json()) } catch (e) { console.error(e) } finally { setLoadingTests(false) }
  }

  const handleStartTest = async (testId: string, testType?: string) => {
    setError(null)
    if (testType === 'html') { setSelectedTest({ id: testId, title: 'HTML Test', testType: 'html', questions: [], correctAnswers: [], passingScore: 60 } as TestFull); setTestInProgress(true); setTestResult(null); return }
    try {
      const res = await fetch(`/api/tests/${testId}`); if (!res.ok) { setError('Test yuklashda xato'); return }
      const test = await res.json(); setSelectedTest(test); setTestInProgress(true); setCurrentQuestion(0); setAnswers(new Array(test.questions?.length || 0).fill('')); setTestResult(null)
    } catch (e) { console.error(e); setError('Test yuklashda xato') }
  }

  const handleSubmitTest = async () => {
    if (!selectedTest) return; setSubmitting(true); setError(null)
    try {
      let correct = 0; const ca = selectedTest.correctAnswers || []
      answers.forEach((a, i) => { if (a === ca[i]) correct++ })
      const score = (correct / answers.length) * 100
      const res = await fetch('/api/tests/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId: selectedTest.id, answers, score, timeTaken: 0 }) })
      if (!res.ok) { setError('Testni yuborishda xato'); setSubmitting(false); return }
      const result = await res.json()
      setTestResult({ score: Math.round(score), passed: result.passed, coinReward: result.coinReward }); setTestInProgress(false); setSubmitting(false)
    } catch (e) { console.error(e); setError('Testni yuborishda xato'); setSubmitting(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div>
  if (error) return <div className="max-w-md mx-auto p-8 text-center"><XCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" /><p className="text-base text-neutral-600 mb-4">{error}</p><button onClick={() => { setError(null); setSelectedSubject(null); setSelectedTest(null); setTestInProgress(false); setTestResult(null) }} className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50">Qayt urinish</button></div>

  if (testInProgress && selectedTest?.testType === 'html') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="bg-neutral-900 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><FileCode className="w-5 h-5" /><span className="font-medium text-sm">Interaktiv test</span></div>
            <button onClick={() => { setTestInProgress(false); setSelectedTest(null); setTestResult(null) }} className="text-sm text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">Yopish</button>
          </div>
          <iframe src={`/api/tests/${selectedTest.id}/render`} className="w-full" style={{ height: '70vh', border: 'none' }} sandbox="allow-scripts allow-same-origin allow-forms" title="Test" />
        </div>
      </div>
    )
  }

  if (testInProgress && selectedTest) {
    const question = selectedTest.questions[currentQuestion]; const selectedAnswer = answers[currentQuestion]; const isLast = currentQuestion === selectedTest.questions.length - 1
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border border-neutral-200 rounded-lg p-6 md:p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2"><h2 className="text-base font-medium text-neutral-900">{selectedTest.title}</h2><span className="text-sm text-neutral-500">{currentQuestion + 1} / {selectedTest.questions.length}</span></div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5"><div className="bg-neutral-900 h-1.5 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / selectedTest.questions.length) * 100}%` }}></div></div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-medium text-neutral-900 mb-6">{question.text}</h3>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <button key={index} onClick={() => { const a = [...answers]; a[currentQuestion] = option; setAnswers(a) }} className={`w-full p-4 text-left border rounded-lg transition-all ${selectedAnswer === option ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${selectedAnswer === option ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'}`}>{selectedAnswer === option && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[3px]"></div>}</div>
                    <span className="text-sm">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setCurrentQuestion(currentQuestion - 1)} disabled={currentQuestion === 0} className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 disabled:opacity-50">Orqaga</button>
            {isLast ? <button onClick={handleSubmitTest} disabled={!selectedAnswer || submitting} className="px-6 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">{submitting ? '...' : 'Yakunlash'}</button> : <button onClick={() => setCurrentQuestion(currentQuestion + 1)} disabled={!selectedAnswer} className="px-6 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">Keyingi</button>}
          </div>
        </div>
      </div>
    )
  }

  if (testResult) {
    return (
      <div className="max-w-md mx-auto">
        <div className="border border-neutral-200 rounded-lg p-8 text-center">
          {testResult.passed ? <CheckCircle className="w-16 h-16 text-neutral-900 mx-auto mb-4" /> : <XCircle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />}
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">{testResult.passed ? 'Muvaffaqiyatli!' : 'Yana urinib ko\'ring'}</h2>
          <p className="text-neutral-500 mb-6">Siz {testResult.score}% ball oldingiz</p>
          {testResult.passed && <div className="bg-neutral-100 rounded-lg p-4 mb-6"><p className="text-base font-medium text-neutral-900">+{testResult.coinReward} COIN</p></div>}
          <button onClick={() => { setTestInProgress(false); setTestResult(null); setSelectedTest(null); setSelectedSubject(null); setTests([]) }} className="w-full px-4 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800">Bosh sahifaga qayt</button>
        </div>
      </div>
    )
  }

  if (!selectedSubject) {
    return (
      <div>
        <h2 className="text-xl font-medium text-neutral-900 mb-4">Fanni tanlang</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {subjects.map((subject) => (
            <button key={subject.id} onClick={() => handleSubjectSelect(subject.id)} className="p-5 border border-neutral-200 rounded-lg text-left hover:border-neutral-400 transition-colors">
              {subject.icon && <div className="text-3xl mb-2">{subject.icon}</div>}
              <h3 className="font-medium text-sm text-neutral-900">{subject.name}</h3>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => setSelectedSubject(null)} className="mb-4 flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Orqaga</button>
      <h2 className="text-xl font-medium text-neutral-900 mb-4">Testni tanlang</h2>
      {loadingTests ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div></div> : tests.length === 0 ? <div className="border border-neutral-200 rounded-lg p-12 text-center"><p className="text-neutral-500">Bu fanga hozircha testlar qo'shilmagan</p></div> : (
        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test.id} className="border border-neutral-200 rounded-lg p-5 hover:border-neutral-400 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><h3 className="font-medium text-neutral-900">{test.title}</h3>{test.testType === 'html' && <span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">HTML</span>}</div>
                  {test.description && <p className="text-sm text-neutral-500">{test.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400"><span>{test.timeLimit || 30} daqiqa</span><span>O'tish: {test.passingScore}%</span></div>
                </div>
                <button onClick={() => handleStartTest(test.id, test.testType)} className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800">Boshlash</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
