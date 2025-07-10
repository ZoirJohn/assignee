'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { signin } from '../actions/auth'
import Image from 'next/image'

const signInSchema = z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
})

export default function SignInPage() {
        const [isLoading, setIsLoading] = useState(false)
        const [authError, setAuthError] = useState<string | null>(null)
        const [showPassword, setShowPassword] = useState(false)

        const form = useForm<z.infer<typeof signInSchema>>({
                resolver: zodResolver(signInSchema),
                defaultValues: {
                        email: '',
                        password: '',
                },
        })

        const onSubmit = async (data: z.infer<typeof signInSchema>) => {
                setIsLoading(true)
                setAuthError(null)

                try {
                        const formData = new FormData()
                        formData.append('email', data.email)
                        formData.append('password', data.password)

                        const result = await signin(formData)
                        if (result.error) {
                                setAuthError(result.error)
                                setIsLoading(false)
                        }
                } catch (error) {
                        console.error(error)
                        setIsLoading(false)
                }
        }

        return (
                <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center sm:p-4 p-1'>
                        <Card className='w-full max-w-md'>
                                <CardHeader className='text-center'>
                                        <div className='flex items-center justify-center space-x-2 mb-4'>
                                                <Link
                                                        href='/'
                                                        className='flex items-center'
                                                >
                                                        <div className='w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center'>
                                                                <Image
                                                                        src='/favicon.svg'
                                                                        alt='logo'
                                                                        width={20}
                                                                        height={20}
                                                                />
                                                        </div>
                                                        <span className='text-xl font-bold text-gray-900 ml-2'>Assignee</span>
                                                </Link>
                                        </div>
                                        <CardTitle className='text-2xl'>Welcome Back</CardTitle>
                                        <CardDescription>Sign in to your account to continue</CardDescription>
                                </CardHeader>
                                <CardContent className='max-sm:px-6'>
                                        <Form {...form}>
                                                <form
                                                        className='space-y-4'
                                                        onSubmit={form.handleSubmit(onSubmit)}
                                                >
                                                        <FormField
                                                                control={form.control}
                                                                name='email'
                                                                render={({ field }) => (
                                                                        <FormItem>
                                                                                <FormLabel htmlFor='email'>Email</FormLabel>
                                                                                <FormControl>
                                                                                        <div className='relative'>
                                                                                                <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                                                                                                <Input
                                                                                                        placeholder='Enter your email'
                                                                                                        className='pl-10'
                                                                                                        {...field}
                                                                                                        id='email'
                                                                                                        autoComplete='email'
                                                                                                        disabled={isLoading}
                                                                                                />
                                                                                        </div>
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                        </FormItem>
                                                                )}
                                                        />

                                                        <FormField
                                                                control={form.control}
                                                                name='password'
                                                                render={({ field }) => (
                                                                        <FormItem>
                                                                                <FormLabel htmlFor='password'>Password</FormLabel>
                                                                                <FormControl>
                                                                                        <div className='relative'>
                                                                                                <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                                                                                                <Input
                                                                                                        type={showPassword ? 'text' : 'password'}
                                                                                                        placeholder='Enter your password'
                                                                                                        className='pl-10 pr-10'
                                                                                                        {...field}
                                                                                                        id='password'
                                                                                                        autoComplete='current-password'
                                                                                                        disabled={isLoading}
                                                                                                />
                                                                                                <button
                                                                                                        type='button'
                                                                                                        tabIndex={-1}
                                                                                                        className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200'
                                                                                                        onClick={() => setShowPassword((v) => !v)}
                                                                                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                                                                >
                                                                                                        {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                                                                                                </button>
                                                                                        </div>
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                        </FormItem>
                                                                )}
                                                        />

                                                        {authError && <div className='h-10 flex items-center px-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>{authError}</div>}

                                                        <div className='flex items-center justify-between'>
                                                                <div className='text-sm'>
                                                                        <a
                                                                                href='#'
                                                                                className='text-blue-600 hover:underline'
                                                                        >
                                                                                Forgot password?
                                                                        </a>
                                                                </div>
                                                        </div>

                                                        <Button
                                                                type='submit'
                                                                className='w-full'
                                                                disabled={isLoading}
                                                        >
                                                                {isLoading ? 'Signing In...' : 'Sign In'}
                                                        </Button>
                                                </form>
                                        </Form>

                                        <div className='text-center text-sm text-gray-600 mt-6'>
                                                Don&apos;t have an account?
                                                <Link
                                                        href='/signup'
                                                        className='text-blue-600 hover:underline ml-1'
                                                >
                                                        Sign up
                                                </Link>
                                        </div>
                                </CardContent>
                        </Card>
                </div>
        )
}
