'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { Mail, Lock, User, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
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
        return (
                <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4'>
                        <Card className='w-full max-w-md'>
                                <CardHeader className='text-center'>
                                        <div className='flex items-center justify-center space-x-2 mb-4'>
                                                <Link
                                                        href='/'
                                                        className='flex items-center'
                                                >
                                                        <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
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
                                                                <form className='space-y-4'>
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
                                                                                                                />
                                                                                                        </div>
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                        </FormItem>
                                                                                )}
                                                                        />

                                                                        <FormField
                                                                                control={teacherForm.control}
                                                                                name='role'
                                                                                render={({ field }) => (
                                                                                        <FormControl>
                                                                                                <Input
                                                                                                        type='hidden'
                                                                                                        value='student'
                                                                                                        name='role'
                                                                                                ></Input>
                                                                                        </FormControl>
                                                                                )}
                                                                        ></FormField>

                                                                        <Button
                                                                                type='submit'
                                                                                className='w-full'
                                                                                formAction={signup}
                                                                        >
                                                                                Create Student Account
                                                                        </Button>
                                                                </form>
                                                        </Form>
                                                </TabsContent>

                                                <TabsContent
                                                        value='teacher'
                                                        className='space-y-4'
                                                >
                                                        <Form {...teacherForm}>
                                                                <form className='space-y-4'>
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
                                                                                                                />
                                                                                                        </div>
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                        </FormItem>
                                                                                )}
                                                                        />
                                                                        <FormField
                                                                                control={teacherForm.control}
                                                                                name='role'
                                                                                render={({ field }) => (
                                                                                        <FormControl>
                                                                                                <Input
                                                                                                        type='hidden'
                                                                                                        value='teacher'
                                                                                                        name='role'
                                                                                                ></Input>
                                                                                        </FormControl>
                                                                                )}
                                                                        ></FormField>
                                                                        <Button
                                                                                type='submit'
                                                                                className='w-full'
                                                                                formAction={signup}
                                                                        >
                                                                                Create Teacher Account
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
