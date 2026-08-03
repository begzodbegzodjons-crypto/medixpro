import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-server'
import Dashboard from '@/components/dashboard'

export const metadata = {
  title: 'Bosh sahifa - UstozPro',
}

export default async function Home() {
  const user = await getCurrentUser()
  if (!user?.id) redirect('/sign-in')

  return <Dashboard userId={user.id} />
}
