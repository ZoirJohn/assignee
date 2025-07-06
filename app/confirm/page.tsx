'use client'

import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
}

const staggerContainer = {
        initial: {},
        animate: {
                transition: {
                        staggerChildren: 0.1,
                },
        },
}

export default function ConfirmEmailPage() {
        return (
                <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4'>
                        <motion.div
                                className='absolute top-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-xl'
                                animate={{
                                        x: [0, -50, 0],
                                        y: [0, 100, 0],
                                }}
                                transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: 'linear',
                                }}
                        />
                        <motion.div
                                className='absolute bottom-20 left-10 w-72 h-72 bg-indigo-400/10 rounded-full mix-blend-multiply filter blur-xl'
                                animate={{
                                        x: [0, 50, 0],
                                        y: [0, 75, 0],
                                }}
                                transition={{
                                        duration: 15,
                                        repeat: Infinity,
                                        ease: 'linear',
                                }}
                        />

                        <div className='max-w-md mx-auto text-center relative z-10'>
                                <motion.div
                                        variants={staggerContainer}
                                        initial='initial'
                                        animate='animate'
                                >
                                        <motion.div
                                                variants={fadeInUp}
                                                className='flex items-center justify-center space-x-2 mb-8'
                                        >
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
                                                        <span className='text-2xl font-bold text-gray-900 ml-2'>Assignee</span>
                                                </Link>
                                        </motion.div>

                                        <motion.div variants={fadeInUp}>
                                                <Card className='bg-white/80 backdrop-blur-sm border-gray-200'>
                                                        <CardHeader className='text-center'>
                                                                <Badge
                                                                        variant='secondary'
                                                                        className='mx-auto mb-4 w-fit'
                                                                >
                                                                        Email Verification Required
                                                                </Badge>
                                                                <CardTitle className='text-2xl md:text-3xl font-bold text-gray-900'>Check Your Email</CardTitle>
                                                                <CardDescription className='text-base italic'>&quot;Check your email and confirm it to continue.&quot;</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className='space-y-6'>
                                                                <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                                                                        <h4 className='font-semibold text-blue-900 mb-2'>What&apos;s next?</h4>
                                                                        <ol className='text-sm text-blue-800 space-y-1'>
                                                                                <li>1. Check your email inbox (and spam folder)</li>
                                                                                <li>2. Click the verification link in the email</li>
                                                                                <li>3. Return here to sign in to your account</li>
                                                                        </ol>
                                                                </div>

                                                                <div className='text-center'>
                                                                        <p className='text-gray-600 mb-6'>
                                                                                Please confirm your email and{' '}
                                                                                <Link
                                                                                        href='/signin'
                                                                                        className='text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors'
                                                                                >
                                                                                        Sign In
                                                                                </Link>
                                                                        </p>
                                                                </div>

                                                                <div className='flex flex-col space-y-3'>
                                                                        <Button
                                                                                asChild
                                                                                className='w-full'
                                                                        >
                                                                                <Link
                                                                                        href='/signin'
                                                                                        className='flex items-center justify-center'
                                                                                >
                                                                                        Continue to Sign In
                                                                                        <ArrowRight className='w-4 h-4 ml-2' />
                                                                                </Link>
                                                                        </Button>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        </motion.div>
                                </motion.div>
                        </div>
                </div>
        )
}
