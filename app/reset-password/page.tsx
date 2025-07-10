'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { reset } from '../actions/auth'
import Image from 'next/image'

// Removed metadata export for SEO as requested

const resetSchema = z.object({
        email: z.string().email('Invalid email address'),
})

export default function ResetPasswordPage() {
        const [isLoading, setIsLoading] = useState(false)
        const [serverMessage, setServerMessage] = useState<string | null>(null)
        const [serverError, setServerError] = useState<string | null>(null)

        const form = useForm<z.infer<typeof resetSchema>>({
                resolver: zodResolver(resetSchema),
                defaultValues: { email: '' },
        })

        const onSubmit = async (data: z.infer<typeof resetSchema>) => {
                setIsLoading(true)
                setServerMessage(null)
                setServerError(null)
                try {
                        const formData = new FormData()
                        formData.append('email', data.email)
                        const result = await reset(formData)
                        if (result?.error) {
                                setServerError(result.error)
                        } else {
                                setServerMessage('If your email is registered, you will receive a password reset link.')
                        }
                } catch (error) {
                        console.error(error)
                } finally {
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
                                        <CardTitle className='text-2xl'>Reset Password</CardTitle>
                                        <CardDescription>Enter your email to receive a password reset link</CardDescription>
                                </CardHeader>
                                <CardContent className='max-sm:px-6'>
                                        <Form {...form}>
                                                <form
                                                        className='space-y-4'
                                                        onSubmit={form.handleSubmit(onSubmit)}
                                                        autoComplete='on'
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
                                                                                                        type='email'
                                                                                                        autoComplete='email'
                                                                                                        required
                                                                                                        disabled={isLoading}
                                                                                                />
                                                                                        </div>
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                        </FormItem>
                                                                )}
                                                        />
                                                        {serverError && (
                                                                <div className='h-10 flex items-center px-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>{serverError}</div>
                                                        )}
                                                        {serverMessage && (
                                                                <div className='h-10 flex items-center px-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md'>{serverMessage}</div>
                                                        )}
                                                        <Button
                                                                type='submit'
                                                                className='w-full'
                                                                disabled={isLoading}
                                                        >
                                                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                                                        </Button>
                                                </form>
                                        </Form>
                                        <div className='text-center text-sm text-gray-600 mt-6'>
                                                Remembered your password?
                                                <Link
                                                        href='/signin'
                                                        className='text-blue-600 hover:underline ml-1'
                                                >
                                                        Sign in
                                                </Link>
                                        </div>
                                </CardContent>
                        </Card>
                </div>
        )
}
