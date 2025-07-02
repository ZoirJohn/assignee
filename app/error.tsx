'use client'

import { motion } from 'motion/react'
import { BookOpen, Home, AlertTriangle, Bug } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

interface ErrorProps {
        error: Error & { digest?: string }
        reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
        return (
                <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4'>
                        <motion.div
                                className='absolute top-20 right-10 w-72 h-72 bg-red-400/10 rounded-full mix-blend-multiply filter blur-xl'
                                animate={{
                                        x: [0, 0, 0],
                                        y: [0, -100, 0],
                                }}
                                transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: 'linear',
                                }}
                        />
                        <motion.div
                                className='absolute bottom-20 left-10 w-72 h-72 bg-orange-400/10 rounded-full mix-blend-multiply filter blur-xl'
                                animate={{
                                        x: [0, -100, 0],
                                        y: [0, 100, 0],
                                }}
                                transition={{
                                        duration: 15,
                                        repeat: Infinity,
                                        ease: 'linear',
                                }}
                        />

                        <div className='max-w-2xl mx-auto text-center relative z-10'>
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
                                                        className='flex items-center gap-2'
                                                >
                                                        <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center'>
                                                                <BookOpen className='w-7 h-7 text-white' />
                                                        </div>
                                                        <span className='text-2xl font-bold text-gray-900'>Assignee</span>
                                                </Link>
                                        </motion.div>

                                        <motion.div
                                                variants={fadeInUp}
                                                className='mb-8'
                                        >
                                                <div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                                                        <AlertTriangle className='w-12 h-12 text-red-600' />
                                                </div>
                                                <div className='w-24 h-1 bg-gradient-to-r from-red-600 to-orange-600 mx-auto rounded-full'></div>
                                        </motion.div>

                                        <motion.div
                                                variants={fadeInUp}
                                                className='mb-8'
                                        >
                                                <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Something Went Wrong</h1>
                                                <p className='text-xl text-gray-600 mb-6 max-w-lg mx-auto'>
                                                        We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re working to fix this issue.
                                                </p>

                                                <div className='flex justify-center mb-6'>
                                                        <Badge
                                                                variant='destructive'
                                                                className='flex items-center space-x-2'
                                                        >
                                                                <Bug className='w-4 h-4' />
                                                                <span>Error Code: {error.digest || 'UNKNOWN'}</span>
                                                        </Badge>
                                                </div>
                                        </motion.div>

                                        <motion.div
                                                variants={fadeInUp}
                                                className='flex flex-col sm:flex-row gap-4 justify-center mb-12'
                                        >
                                                <Button
                                                        size='lg'
                                                        onClick={reset}
                                                >
                                                        Try Again
                                                </Button>
                                                <Button
                                                        size='lg'
                                                        variant='outline'
                                                        asChild
                                                >
                                                        <Link
                                                                href='/'
                                                                className='flex items-center'
                                                        >
                                                                <Home className='mr-2 w-5 h-5' />
                                                                Go Home
                                                        </Link>
                                                </Button>
                                        </motion.div>

                                        <motion.div variants={fadeInUp}>
                                                <Card className='bg-white/80 backdrop-blur-sm border-gray-200'>
                                                        <CardHeader>
                                                                <CardTitle className='text-xl flex items-center justify-center space-x-2'>
                                                                        <AlertTriangle className='w-5 h-5 text-red-600' />
                                                                        <span>Error Details</span>
                                                                </CardTitle>
                                                                <CardDescription>Technical information about what happened</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                                <div className='space-y-4'>
                                                                        <div className='bg-gray-50 p-4 rounded-lg text-left'>
                                                                                <h4 className='font-semibold text-gray-900 mb-2'>Error Message:</h4>
                                                                                <p className='text-sm text-gray-700 font-mono break-all'>{error.message || 'An unexpected error occurred'}</p>
                                                                        </div>

                                                                        {error.digest && (
                                                                                <div className='bg-gray-50 p-4 rounded-lg text-left'>
                                                                                        <h4 className='font-semibold text-gray-900 mb-2'>Error ID:</h4>
                                                                                        <p className='text-sm text-gray-700 font-mono'>{error.digest}</p>
                                                                                </div>
                                                                        )}

                                                                        <div className='bg-blue-50 p-4 rounded-lg text-left'>
                                                                                <h4 className='font-semibold text-blue-900 mb-2'>What you can do:</h4>
                                                                                <ul className='text-sm text-blue-800 space-y-1'>
                                                                                        <li>• Try refreshing the page</li>
                                                                                        <li>• Check your internet connection</li>
                                                                                        <li>• Clear your browser cache</li>
                                                                                        <li>• Contact support if the problem persists</li>
                                                                                </ul>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        </motion.div>
                                </motion.div>
                        </div>
                </div>
        )
}
