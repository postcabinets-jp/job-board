import { Briefcase } from 'lucide-react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = { title: 'ログイン — Job Board' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-neutral-900">Job Board</span>
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">ログイン</h1>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
