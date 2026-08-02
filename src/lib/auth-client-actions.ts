'use server'

import { createUser } from '@/lib/auth-server'

export async function createUserAction(input: {
  email: string
  password: string
  name?: string
}) {
  return createUser(input)
}
