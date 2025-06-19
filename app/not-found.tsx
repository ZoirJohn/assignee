'use client'

import { motion } from 'framer-motion'
import { BookOpen, Home, ArrowLeft, Search, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

export default function NotFound() {
        return (
                <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4'>
                        <motion.div
                                className='absolute top-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-xl'
                                animate={{
                                        x: [0, -150, 0],
                                        y: [0, -100, 0],
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
                                        x: [0, -100, 0],
                                        y: [0, 100, 0],
                                }}
                                transition={{
                                        duration: 15,
                                        repeat: Infinity,
                                        ease: 'linear',
                                }}
                        />

                        <div className='max-w-3xl mx-auto text-center relative z-10'>
                                <motion.div
                                        variants={staggerContainer}
                                        initial='initial'
                                        animate='animate'
                                >
                                        <motion.div
                                                variants={fadeInUp}
                                                className='flex items-center justify-center space-x-2 mb-8'
                                        >
                                                <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center'>
                                                        <BookOpen className='w-7 h-7 text-white' />
                                                </div>
                                                <span className='text-2xl font-bold text-gray-900'>Assignee</span>
                                        </motion.div>

                                        <motion.div
                                                variants={fadeInUp}
                                                className='mb-8'
                                        >
                                                <h1 className='text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4'>404</h1>
                                                <div className='w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full'></div>
                                        </motion.div>

                                        <motion.div
                                                variants={fadeInUp}
                                                className='mb-8'
                                        >
                                                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Page Not Found</h2>
                                                <p className='text-xl text-gray-600 mb-6 max-w-lg mx-auto'>
                                                        Oops! The page you're looking for seems to have gone missing. Don't worry, even the best students sometimes lose their assignments.
                                                </p>
                                        </motion.div>

                                        <motion.div
                                                variants={fadeInUp}
                                                className='flex flex-col sm:flex-row gap-4 justify-center mb-12'
                                        >
                                                <Button
                                                        size='lg'
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
                                                <Button
                                                        size='lg'
                                                        variant='outline'
                                                        onClick={() => window.history.back()}
                                                >
                                                        <ArrowLeft className='mr-2 w-5 h-5' />
                                                        Go Back
                                                </Button>
                                        </motion.div>

                                        <motion.div variants={fadeInUp}>
                                                <Card className='bg-white/80 backdrop-blur-sm border-gray-200'>
                                                        <CardHeader>
                                                                <CardTitle className='text-xl'>Need Help?</CardTitle>
                                                                <CardDescription>Here are some helpful links to get you back on track</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                                                        <Link
                                                                                href='/signin'
                                                                                className='flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors group'
                                                                        >
                                                                                <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors'>
                                                                                        <BookOpen className='w-5 h-5 text-blue-600' />
                                                                                </div>
                                                                                <div className='text-left'>
                                                                                        <p className='font-semibold text-gray-900'>Sign In</p>
                                                                                        <p className='text-sm text-gray-600'>Access your account</p>
                                                                                </div>
                                                                        </Link>

                                                                        <Link
                                                                                href='/signup'
                                                                                className='flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors group'
                                                                        >
                                                                                <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors'>
                                                                                        <Search className='w-5 h-5 text-green-600' />
                                                                                </div>
                                                                                <div className='text-left'>
                                                                                        <p className='font-semibold text-gray-900'>Sign Up</p>
                                                                                        <p className='text-sm text-gray-600'>Create new account</p>
                                                                                </div>
                                                                        </Link>

                                                                        <div className='flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer'>
                                                                                <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors'>
                                                                                        <MessageCircle className='w-5 h-5 text-purple-600' />
                                                                                </div>
                                                                                <div className='text-left'>
                                                                                        <p className='font-semibold text-gray-900'>Support</p>
                                                                                        <p className='text-sm text-gray-600'>Get help</p>
                                                                                </div>
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
