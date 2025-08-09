'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

// Local types for sign-in page
type SignInFormData = {
  emailOrPhone: string
}

type SignInStep = 'input' | 'verification'

type ValidationStrategy = {
  validateEmailOrPhone: (value: string) => boolean
  getInputType: (value: string) => 'email' | 'phone'
}

type SubmissionStrategy = {
  handleSignIn: (data: SignInFormData) => Promise<{ success: boolean; error?: string }>
}

// Validation schema
const signInSchema = z.object({
  emailOrPhone: z.string()
    .min(1, 'Email or phone number is required')
    .refine((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
      return emailRegex.test(value) || phoneRegex.test(value)
    }, 'Please enter a valid email address or phone number'),
})

// Injectable validation strategy
const createValidationStrategy = (): ValidationStrategy => ({
  validateEmailOrPhone: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return emailRegex.test(value) || phoneRegex.test(value)
  },
  getInputType: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? 'email' : 'phone'
  },
})

// Injectable submission strategy
const createSubmissionStrategy = (): SubmissionStrategy => ({
  handleSignIn: async (data: SignInFormData) => {
    try {
      const result = await signIn('resend', {
        email: data.emailOrPhone,
        redirect: false,
      })
      
      if (result?.error) {
        return { success: false, error: result.error }
      }
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    }
  },
})

// Inline LoginForm component
function LoginForm() {
  const [step, setStep] = useState<SignInStep>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const validationStrategy = createValidationStrategy()
  const submissionStrategy = createSubmissionStrategy()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    setError(null)
    
    const result = await submissionStrategy.handleSignIn(data)
    
    if (result.success) {
      setStep('verification')
    } else {
      setError(result.error || 'Sign in failed')
    }
    
    setIsLoading(false)
  }

  if (step === 'verification') {
    const inputValue = getValues('emailOrPhone')
    const inputType = validationStrategy.getInputType(inputValue)
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Check your {inputType}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We sent a verification link to{' '}
              <span className="font-medium text-indigo-600">{inputValue}</span>
            </p>
          </div>
          
          <div className="rounded-md bg-blue-50 p-4">
            <div className="text-sm text-blue-700">
              <p>Click the link in your {inputType} to sign in to your account.</p>
              <p className="mt-2">
                Didn't receive the {inputType}? Check your spam folder or{' '}
                <button
                  onClick={() => setStep('input')}
                  className="font-medium underline hover:no-underline"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/sign-up"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="emailOrPhone" className="sr-only">
              Email address or phone number
            </label>
            <input
              {...register('emailOrPhone')}
              type="text"
              autoComplete="email"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address or phone number"
            />
            {errors.emailOrPhone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.emailOrPhone.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send verification link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return <LoginForm />
}
