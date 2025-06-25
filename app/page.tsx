'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Users, Clock, Star, CheckCircle, User, MessageSquare } from 'lucide-react'
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

export default function LandingPage() {
        return (
                <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
                        <header className='sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200'>
                                <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                                        <Link
                                                href='/'
                                                className='flex items-center space-x-2'
                                        >
                                                <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                                                        <Image
                                                                src='/favicon.svg'
                                                                alt='logo'
                                                                width={20}
                                                                height={20}
                                                        />
                                                </div>
                                                <span className='text-xl font-bold text-gray-900'>Assignee</span>
                                        </Link>
                                        <div className='flex items-center space-x-3'>
                                                <Button
                                                        variant='ghost'
                                                        asChild
                                                >
                                                        <Link href='/signin'>Sign In</Link>
                                                </Button>
                                                <Button asChild>
                                                        <Link href='/signup'>Get Started</Link>
                                                </Button>
                                        </div>
                                </div>
                        </header>

                        <section className='relative py-20 overflow-hidden'>
                                <div className='absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10' />
                                <motion.div
                                        className='absolute top-20 right-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl'
                                        animate={{
                                                x: [0, 100, 0],
                                                y: [0, -100, 0],
                                        }}
                                        transition={{
                                                duration: 20,
                                                repeat: Infinity,
                                                ease: 'linear',
                                        }}
                                />
                                <motion.div
                                        className='absolute bottom-20 left-10 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl'
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

                                <div className='container mx-auto px-4 text-center relative z-10'>
                                        <motion.div {...fadeInUp}>
                                                <Badge
                                                        variant='secondary'
                                                        className='mb-4'
                                                >
                                                        AI-Powered Assignment Management
                                                </Badge>
                                                <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
                                                        Streamline Your
                                                        <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'> Assignment </span>
                                                        Workflow
                                                </h1>
                                                <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
                                                        Smart grading, seamless communication, and intelligent insights for teachers and students.
                                                </p>
                                                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                                                        <Button
                                                                size='lg'
                                                                asChild
                                                        >
                                                                <Link
                                                                        href='/signup'
                                                                        className='flex items-center'
                                                                >
                                                                        Get Started Free <ArrowRight className='ml-2 w-4 h-4' />
                                                                </Link>
                                                        </Button>
                                                        <Button
                                                                size='lg'
                                                                variant='outline'
                                                        >
                                                                Watch Demo
                                                        </Button>
                                                </div>
                                        </motion.div>
                                </div>
                        </section>

                        <section
                                id='advantages'
                                className='py-20 bg-white'
                        >
                                <div className='container mx-auto px-4'>
                                        <motion.div
                                                className='text-center mb-16'
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                        >
                                                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Why Choose Assignee?</h2>
                                                <p className='text-xl text-gray-600 max-w-2xl mx-auto'>Transform your teaching and learning experience with our comprehensive platform</p>
                                        </motion.div>

                                        <motion.div
                                                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'
                                                variants={staggerContainer}
                                                initial='initial'
                                                whileInView='animate'
                                                viewport={{ once: true }}
                                        >
                                                {[
                                                        {
                                                                icon: CheckCircle,
                                                                title: 'AI-Powered Grading',
                                                                description: 'Intelligent assignment evaluation with consistent, fair grading standards',
                                                        },
                                                        {
                                                                icon: Clock,
                                                                title: 'Time Management',
                                                                description: 'Track deadlines, submissions, and progress with intuitive dashboards',
                                                        },
                                                        {
                                                                icon: MessageSquare,
                                                                title: 'Seamless Communication',
                                                                description: 'Built-in chat system for instant teacher-student collaboration',
                                                        },
                                                        {
                                                                icon: Users,
                                                                title: 'Role-Based Access',
                                                                description: 'Tailored experiences for teachers and students with secure access controls',
                                                        },
                                                ].map((advantage, index) => (
                                                        <motion.div
                                                                key={index}
                                                                variants={fadeInUp}
                                                        >
                                                                <Card className='h-full hover:shadow-lg transition-shadow duration-300'>
                                                                        <CardHeader>
                                                                                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
                                                                                        <advantage.icon className='w-6 h-6 text-blue-600' />
                                                                                </div>
                                                                                <CardTitle className='text-xl'>{advantage.title}</CardTitle>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                                <CardDescription className='text-base'>{advantage.description}</CardDescription>
                                                                        </CardContent>
                                                                </Card>
                                                        </motion.div>
                                                ))}
                                        </motion.div>
                                </div>
                        </section>

                        <section
                                id='testimonials'
                                className='py-20 bg-gray-50'
                        >
                                <div className='container mx-auto px-4'>
                                        <motion.div
                                                className='text-center mb-16'
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                        >
                                                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>What Our Users Say</h2>
                                                <p className='text-xl text-gray-600'>Trusted by thousands of educators and students worldwide</p>
                                        </motion.div>

                                        <motion.div
                                                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                                                variants={staggerContainer}
                                                initial='initial'
                                                whileInView='animate'
                                                viewport={{ once: true }}
                                        >
                                                {[
                                                        {
                                                                name: 'Sarah Johnson',
                                                                role: 'High School Teacher',
                                                                content: 'Assignee has revolutionized how I grade assignments. The AI suggestions are incredibly accurate and save me hours each week.',
                                                                rating: 5,
                                                        },
                                                        {
                                                                name: 'Mike Chen',
                                                                role: 'College Student',
                                                                content: 'The deadline tracking and instant feedback features have helped me stay organized and improve my grades significantly.',
                                                                rating: 5,
                                                        },
                                                        {
                                                                name: 'Dr. Emily Rodriguez',
                                                                role: 'University Professor',
                                                                content: 'The communication tools make it so easy to provide personalized feedback to each student. Highly recommended!',
                                                                rating: 5,
                                                        },
                                                ].map((testimonial, index) => (
                                                        <motion.div
                                                                key={index}
                                                                variants={fadeInUp}
                                                        >
                                                                <Card className='h-full'>
                                                                        <CardHeader>
                                                                                <div className='flex items-center space-x-1 mb-2'>
                                                                                        {[...Array(testimonial.rating)].map((_, i) => (
                                                                                                <Star
                                                                                                        key={i}
                                                                                                        className='w-4 h-4 fill-yellow-400 text-yellow-400'
                                                                                                />
                                                                                        ))}
                                                                                </div>
                                                                                <CardDescription className='text-base italic'>&quot;{testimonial.content}&qout;</CardDescription>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                                <div className='flex items-center space-x-3'>
                                                                                        <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                                                                                                <User className='w-5 h-5 text-gray-600' />
                                                                                        </div>
                                                                                        <div>
                                                                                                <p className='font-semibold text-gray-900'>{testimonial.name}</p>
                                                                                                <p className='text-sm text-gray-600'>{testimonial.role}</p>
                                                                                        </div>
                                                                                </div>
                                                                        </CardContent>
                                                                </Card>
                                                        </motion.div>
                                                ))}
                                        </motion.div>
                                </div>
                        </section>

                        <section
                                id='about'
                                className='py-20 bg-white'
                        >
                                <div className='container mx-auto px-4'>
                                        <motion.div
                                                className='text-center mb-16'
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                        >
                                                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>How It Works</h2>
                                                <p className='text-xl text-gray-600'>Get started in minutes with our simple three-step process</p>
                                        </motion.div>

                                        <motion.div
                                                className='max-w-4xl mx-auto'
                                                variants={staggerContainer}
                                                initial='initial'
                                                whileInView='animate'
                                                viewport={{ once: true }}
                                        >
                                                {[
                                                        {
                                                                step: '01',
                                                                title: 'Sign Up & Choose Your Role',
                                                                description: 'Create your account as a teacher or student and set up your profile in seconds.',
                                                        },
                                                        {
                                                                step: '02',
                                                                title: 'Create or Join Assignments',
                                                                description: 'Teachers create assignments with AI-powered grading criteria. Students join using teacher IDs.',
                                                        },
                                                        {
                                                                step: '03',
                                                                title: 'Submit, Grade & Communicate',
                                                                description: 'Students submit work, teachers review AI suggestions, and everyone stays connected through chat.',
                                                        },
                                                ].map((step, index) => (
                                                        <motion.div
                                                                key={index}
                                                                className='flex flex-col md:flex-row items-center mb-12 last:mb-0'
                                                                variants={fadeInUp}
                                                        >
                                                                <div className='w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-8 flex-shrink-0'>
                                                                        {step.step}
                                                                </div>
                                                                <div className='text-center md:text-left'>
                                                                        <h3 className='text-2xl font-bold text-gray-900 mb-2'>{step.title}</h3>
                                                                        <p className='text-lg text-gray-600'>{step.description}</p>
                                                                </div>
                                                        </motion.div>
                                                ))}
                                        </motion.div>
                                </div>
                        </section>

                        <footer className='bg-gray-900 text-white py-12'>
                                <div className='container mx-auto px-4 text-center'>
                                        <Link href='/'>
                                                <div className='flex items-center justify-center space-x-2 mb-8'>
                                                        <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                                                                <Image
                                                                        src='/favicon.svg'
                                                                        alt='logo'
                                                                        width={20}
                                                                        height={20}
                                                                />
                                                        </div>
                                                        <span className='text-xl font-bold'>Assignee</span>
                                                </div>
                                        </Link>
                                        <nav className='flex justify-center space-x-8 mb-8'>
                                                <a
                                                        href='#advantages'
                                                        className='hover:text-blue-400 transition-colors'
                                                >
                                                        Advantages
                                                </a>
                                                <a
                                                        href='#testimonials'
                                                        className='hover:text-blue-400 transition-colors'
                                                >
                                                        Testimonials
                                                </a>
                                                <a
                                                        href='#about'
                                                        className='hover:text-blue-400 transition-colors'
                                                >
                                                        How It Works
                                                </a>
                                        </nav>
                                        <p className='text-gray-400'>© 2025 Assignee. All rights reserved.</p>
                                </div>
                        </footer>
                </div>
        )
}
