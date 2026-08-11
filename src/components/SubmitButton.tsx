'use client'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export function SubmitButton({ children, className, formAction, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      formAction={formAction}
      className={`flex items-center justify-center ${className} ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
      {...props}
    >
      {pending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {children}
    </button>
  )
}
