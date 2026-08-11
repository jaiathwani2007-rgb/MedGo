'use client'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export function SubmitButton({ children, className }: { children: React.ReactNode, className?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center justify-center ${className} ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {children}
    </button>
  )
}
