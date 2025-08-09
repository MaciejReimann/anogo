'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

// Local types for sign-up page
type SignUpFormData = {
  name: string
  emailOrPhone: string
  acceptTerms: boolean
}

type SignUpStep = 'input' | 'verification'

type ValidationStrategy = {
  validateEmailOrPhone: (value: string) => boolean
  validateName: (value: string) => boolean
  getInputType: (value: string) => 'email' | 'phone'
}

type SubmissionStrategy = {
  handleSignUp: (data: SignUpFormData) => Promise<{ success: boolean; error?: string }>
}

// Validation schema
const signUpSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  emailOrPhone: z.string()
    .min(1, 'Email or phone number is required')
    .refine((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
      return emailRegex.test(value) || phoneRegex.test(value)
    }, 'Please enter a valid email address or phone number'),
  acceptTerms: z.boolean()
    .refine((value) => value === true, 'You must accept the terms and conditions'),
})

// Injectable validation strategy
const createValidationStrategy = (): ValidationStrategy => ({
  validateEmailOrPhone: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return emailRegex.test(value) || phoneRegex.test(value)
  },
  validateName: (value: string) => {
    return value.length >= 2 && value.length <= 50 && /^[a-zA-Z\s]+$/.test(value)
  },
  getInputType: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? 'email' : 'phone'
  },
})

// Injectable submission strategy
const createSubmissionStrategy = (): SubmissionStrategy => ({
  handleSignUp: async (data: SignUpFormData) => {
    try {
      // For new user registration, we still use the same sign-in flow
      // The user creation will be handled by NextAuth when they verify their email
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
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }
    }
  },
})

// Inline SignupForm component
function SignupForm() {
  const [step, setStep] = useState<SignUpStep>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const validationStrategy = createValidationStrategy()
  const submissionStrategy = createSubmissionStrategy()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError(null)
    
    const result = await submissionStrategy.handleSignUp(data)
    
    if (result.success) {
      setStep('verification')
    } else {
      setError(result.error || 'Sign up failed')
    }
    
    setIsLoading(false)
  }

  if (step === 'verification') {
    const inputValue = getValues('emailOrPhone')
    const inputType = validationStrategy.getInputType(inputValue)
    const userName = getValues('name')
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome, {userName}!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We sent a verification link to{' '}
              <span className="font-medium text-indigo-600">{inputValue}</span>
            </p>
          </div>
          
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">
              <p>Click the link in your {inputType} to complete your account setup.</p>
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
          
          <div className="text-center">
            <Link
              href="/sign-in"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Already have an account? Sign in
            </Link>
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/sign-in"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

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
          </div>

          <div className="flex items-center">
            <input
              {...register('acceptTerms')}
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-500">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-500">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">
              {errors.acceptTerms.message}
            </p>
          )}

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
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return <SignupForm />
}
