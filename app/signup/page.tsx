'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Mail, Lock, User, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { signup } from '../actions/auth'
import Image from 'next/image'

const baseSchema = z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        role: z.enum(['student', 'teacher']),
})

const studentSchema = baseSchema.extend({
        role: z.literal('student'),
        teacherId: z.string().min(1, 'Teacher ID is required'),
})

const teacherSchema = baseSchema.extend({
        role: z.literal('teacher'),
})

export default function SignUpPage() {
        const [userType, setUserType] = useState<'student' | 'teacher'>('student')
        const [isLoading, setIsLoading] = useState(false)
        const [authError, setAuthError] = useState<string | null>(null)

        const studentForm = useForm<z.infer<typeof studentSchema>>({
                resolver: zodResolver(studentSchema),
                defaultValues: {
                        fullName: '',
                        email: '',
                        password: '',
                        teacherId: '',
                        role: 'student',
                },
        })

        const teacherForm = useForm<z.infer<typeof teacherSchema>>({
                resolver: zodResolver(teacherSchema),
                defaultValues: {
                        fullName: '',
                        email: '',
                        password: '',
                        role: 'teacher',
                },
        })

        const onSubmitStudent = async (data: z.infer<typeof studentSchema>) => {
                setIsLoading(true)
                setAuthError(null)

                try {
                        const formData = new FormData()
                        formData.append('email', data.email)
                        formData.append('password', data.password)
                        formData.append('fullName', data.fullName)
                        formData.append('role', data.role)
                        formData.append('teacherId', data.teacherId)

                        const result = await signup(formData)

                        if (result?.error) {
                                setAuthError(result.error)
                        } else {
                                redirect('/dashboard/student')
                        }
                } catch {
                        setAuthError('An unexpected error occurred. Please try again.')
                } finally {
                        setIsLoading(false)
                }
        }

        const onSubmitTeacher = async (data: z.infer<typeof teacherSchema>) => {
                setIsLoading(true)
                setAuthError(null)

                try {
                        const formData = new FormData()
                        formData.append('email', data.email)
                        formData.append('password', data.password)
                        formData.append('fullName', data.fullName)
                        formData.append('role', data.role)

                        const result = await signup(formData)

                        if (result.error) {
                                setAuthError(result.error)
                        } else {
                                redirect('/dashboard/teacher')
                        }
                } finally {
                        setIsLoading(false)
                }
        }

        return (
                <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4'>
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
                                        <CardTitle className='text-2xl'>Create Your Account</CardTitle>
                                        <CardDescription>Join thousands of educators and students using Assignee</CardDescription>
                                </CardHeader>
                                <CardContent>
                                        <Tabs
                                                value={userType}
                                                onValueChange={(value) => setUserType(value as 'student' | 'teacher')}
                                        >
                                                <TabsList className='grid w-full grid-cols-2'>
                                                        <TabsTrigger value='student'>Student</TabsTrigger>
                                                        <TabsTrigger value='teacher'>Teacher</TabsTrigger>
                                                </TabsList>

                                                <TabsContent
                                                        value='student'
                                                        className='space-y-4'
                                                >
                                                        <Form {...studentForm}>
                                                                <form
                                                                        className='space-y-4'
                                                                        onSubmit={studentForm.handleSubmit(onSubmitStudent)}
                                                                >
                                                                        <FormField
                                                                                control={studentForm.control}
                                                                                name='fullName'
                                                                                render={({ field }) => (
                                                                                        <FormItem>
                                                                                                <FormLabel htmlFor='fullName'>Full Name</FormLabel>
                                                                                                <FormControl>
                                                                                                        <div className='relative'>
                                                                                                                <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                                                                                                                <Input
                                                                                                                        placeholder='Enter your full name'
                                                                                                                        className='pl-10'
                                                                                                                        {...field}
                                                                                                                        id='fullName'
                                                                                                                        autoComplete='name'
                                                                                                                        disabled={isLoading}
                                                                                                                />
                                                                                                        </div>
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                        </FormItem>
                                                                                )}
                                                                        />

                                                                        <FormField
                                                                                control={studentForm.control}
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
                                                                                control={studentForm.control}
                                                                                name='password'
                                                                                render={({ field }) => (
                                                                                        <FormItem>
                                                                                                <FormLabel htmlFor='password'>Password</FormLabel>
                                                                                                <FormControl>
                                                                                                        <div className='relative'>
                                                                                                                <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                                                                                                                <Input
                                                                                                                        type='password'
                                                                                                                        placeholder='Create a password'
                                                                                                                        className='pl-10'
                                                                                                                        {...field}
                                                                                                                        id='password'
                                                                                                                        autoComplete='current-password'
                                                                                                                        disabled={isLoading}
                                                                                                                />
                                                                                                        </div>
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                        </FormItem>
                                                                                )}
                                                                        />

                                                                        <FormField
                                                                                control={studentForm.control}
                                                                                name='teacherId'
                                                                                render={({ field }) => (
                                                                                        <FormItem>
                                                                                                <FormLabel htmlFor='teacherId'>Teacher ID</FormLabel>
                                                                                                <FormControl>
                                                                                                        <div className='relative'>
                                                                                                                <Hash className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                                                                                                                <Input
                                                                                                                        placeholder="Enter your teacher's ID"
                                                                                                                        className='pl-10'
                                                                                                                        {...field}
                                                                                                                        id='teacherId'
                                                                                                                        disabled={isLoading}
                                                                                                                />
                                                                                                        </div>
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                        </FormItem>
                                                                                )}
                                                                        />

                                                                        {authError && (
                                                                                <div className='h-10 flex items-center px-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
                                                                                        {authError}
                                                                                </div>
                                                                        )}

                                                                        <Button
                                                                                type='submit'
                                                                                className='w-full'
                                                                                disabled={isLoading}
                                                                        >
                                                                                {isLoading ? 'Creating Account...' : 'Create Student Account'}
                                                                        </Button>
                                                                </form>
                                                        </Form>
                                                </TabsContent>

                                                <TabsContent
                                                        value='teacher'
                                                        className='space-y-4'
                                                >
                                                        <Form {...teacherForm}>
                                                                <form
                                                                        className='space-y-4'
                                                                        onSubmit={teacherForm.handleSubmit(onSubmitTeacher)}
                                                                >
                                                                        <FormField
                                                                                control={teacherForm.control}
                                                                                name='fullName'
                                                                                render={({ field }) => (
                                                                                        <FormItem>
                                                                                                <FormLabel htmlFor='fullName'>Full Name</FormLabel>
                                                                                                <FormControl>
                                                                                                        <div className='relative'>
                                                                                                                <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                                                                                                                <Input
                                                                                                                        placeholder='Enter your full name'
                                                                                                                        className='pl-10'
                                                                                                                        {...field}
                                                                                                                        autoComplete='name'
                                                                                                                        id='fullName'
                                                                                                                        disabled={isLoading}
                                                                                                                />
                                                                                                        </div>
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                        </FormItem>
                                                                                )}
                                                                        />

                                                                        <FormField
                                                                                control={teacherForm.control}
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
                                                                                                                        autoComplete='email'
                                                                                                                        id='email'
                                                                                                                        disabled={isLoading}
                                                                                                                />
                                                                                                        </div>
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                        </FormItem>
                                                                                )}
                                                                        />

                                                                        <FormField
                                                                                control={teacherForm.control}
                                                                                name='password'
                                                                                render={({ field }) => (
                                                                                        <FormItem>
                                                                                                <FormLabel htmlFor='password'>Password</FormLabel>
                                                                                                <FormControl>
                                                                                                        <div className='relative'>
                                                                                                                <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                                                                                                                <Input
                                                                                                                        type='password'
                                                                                                                        placeholder='Create a password'
                                                                                                                        className='pl-10'
                                                                                                                        {...field}
                                                                                                                        autoComplete='current-password'
                                                                                                                        id='password'
                                                                                                                        disabled={isLoading}
                                                                                                                />
                                                                                                        </div>
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                        </FormItem>
                                                                                )}
                                                                        />

                                                                        {authError && (
                                                                                <div className='h-10 flex items-center px-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
                                                                                        {authError}
                                                                                </div>
                                                                        )}

                                                                        <Button
                                                                                type='submit'
                                                                                className='w-full'
                                                                                disabled={isLoading}
                                                                        >
                                                                                {isLoading ? 'Creating Account...' : 'Create Teacher Account'}
                                                                        </Button>
                                                                </form>
                                                        </Form>
                                                </TabsContent>
                                        </Tabs>

                                        <div className='text-center text-sm text-gray-600 mt-6'>
                                                Already have an account?
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
