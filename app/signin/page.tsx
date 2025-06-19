'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { BookOpen, Mail, Lock, Chrome, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const signInSchema = z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
})

export default function SignInPage() {
        const form = useForm<z.infer<typeof signInSchema>>({
                resolver: zodResolver(signInSchema),
                defaultValues: {
                        email: '',
                        password: '',
                },
        })

        const onSubmit = (values: z.infer<typeof signInSchema>) => {
                console.log('Sign in:', values)
                // Here you would typically handle authentication
                // For demo purposes, redirect based on email domain
                if (values.email.includes('teacher')) {
                        window.location.href = '/dashboard/teacher'
                } else {
                        window.location.href = '/dashboard/student'
                }
        }

        return (
                <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4'>
                        <Card className='w-full max-w-md'>
                                <CardHeader className='text-center'>
                                        <div className='flex items-center justify-center space-x-2 mb-4'>
                                                <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                                                        <BookOpen className='w-5 h-5 text-white' />
                                                </div>
                                                <span className='text-xl font-bold text-gray-900'>Assignee</span>
                                        </div>
                                        <CardTitle className='text-2xl'>Welcome Back</CardTitle>
                                        <CardDescription>Sign in to your account to continue</CardDescription>
                                </CardHeader>
                                <CardContent>
                                        <Form {...form}>
                                                <form
                                                        onSubmit={form.handleSubmit(onSubmit)}
                                                        className='space-y-4'
                                                        name='signin'
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
                                                                                                        type='password'
                                                                                                        placeholder='Enter your password'
                                                                                                        className='pl-10'
                                                                                                        {...field}
                                                                                                        id='password'
                                                                                                />
                                                                                        </div>
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                        </FormItem>
                                                                )}
                                                        />

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
                                                        >
                                                                Sign In
                                                        </Button>
                                                </form>
                                        </Form>

                                        <div className='relative mt-6'>
                                                <div className='absolute inset-0 flex items-center'>
                                                        <Separator className='w-full' />
                                                </div>
                                                <div className='relative flex justify-center text-xs uppercase'>
                                                        <span className='bg-white px-2 text-muted-foreground'>Or continue with</span>
                                                </div>
                                        </div>

                                        <div className='grid grid-cols-2 gap-3 mt-6'>
                                                <Button
                                                        variant='outline'
                                                        className='w-full'
                                                >
                                                        <Chrome className='mr-2 h-4 w-4' />
                                                        Google
                                                </Button>
                                                <Button
                                                        variant='outline'
                                                        className='w-full'
                                                >
                                                        <Instagram className='mr-2 h-4 w-4' />
                                                        Instagram
                                                </Button>
                                        </div>

                                        <div className='text-center text-sm text-gray-600 mt-6'>
                                                Don't have an account?
                                                <Link
                                                        href='/signup'
                                                        className='text-blue-600 hover:underline'
                                                >
                                                        Sign up
                                                </Link>
                                        </div>
                                </CardContent>
                        </Card>
                </div>
        )
}
