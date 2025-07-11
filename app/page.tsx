'use client'

import { ArrowRight, Users, Clock, Star, CheckCircle, User, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ComponentType } from 'react'

export default function LandingPage() {
        const streamline = 'Streamline Your'
        const assignment = 'Assignment'
        const workflow = 'Workflow'
        const customDelay = [0.8, 0.4, 0.4, 0.8]

        const AnimatedText = ({ text, className, delayOffset = 0 }: { text: string; className: string; delayOffset?: number }) => (
                <>
                        {text.split('').map((char, idx) => (
                                <motion.span
                                        key={idx}
                                        className={className}
                                        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        transition={{
                                                delay: (delayOffset + idx) * 0.08,
                                                duration: 0.4,
                                                ease: 'easeOut',
                                        }}
                                >
                                        {char}
                                </motion.span>
                        ))}
                </>
        )
        const AnimatedFeedback = ({ name, role, content, rating, index, delay = 0.4 }: { name: string; role: string; content: string; rating: number; index: number; delay?: number }) => (
                <>
                        <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{
                                        delay: delay * index,
                                        duration: 0.5,
                                        ease: 'easeOut',
                                }}
                                viewport={{ once: true }}
                        >
                                <Card className='h-full'>
                                        <CardHeader>
                                                <div className='flex items-center space-x-1 mb-2'>
                                                        {[...Array(rating)].map((_, i) => (
                                                                <Star
                                                                        key={i}
                                                                        className='w-4 h-4 fill-yellow-400 text-yellow-400'
                                                                />
                                                        ))}
                                                </div>
                                                <CardDescription className='text-base italic'>&quot;{content}&quot;</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                                <div className='flex items-center space-x-3'>
                                                        <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                                                                <User className='w-5 h-5 text-gray-600' />
                                                        </div>
                                                        <div>
                                                                <p className='font-semibold text-gray-900'>{name}</p>
                                                                <p className='text-sm text-gray-600'>{role}</p>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>
                        </motion.div>
                </>
        )
        const AnimatedShowcase = ({ Icon, title, description, delay }: { Icon: ComponentType<{ className: string }>; title: string; description: string; delay: number }) => (
                <>
                        <motion.div
                                initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{
                                        delay: delay,
                                        duration: 0.5,
                                        ease: 'easeOut',
                                }}
                                viewport={{ once: true }}
                        >
                                <Card className='h-full hover:shadow-lg transition-shadow duration-300'>
                                        <CardHeader>
                                                <div className='w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4'>
                                                        <Icon className='w-6 h-6 text-gray-600' />
                                                </div>
                                                <CardTitle className='text-xl'>{title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                                <CardDescription className='text-base'>{description}</CardDescription>
                                        </CardContent>
                                </Card>
                        </motion.div>
                </>
        )

        return (
                <>
                        <Link
                                href='https://bolt.new'
                                className='absolute top-25 sm:left-1/5 left-0 z-10 '
                                target='_blank'
                        >
                                <Image
                                        src={'/bolt.png'}
                                        alt='Bolt'
                                        className='rounded-full'
                                        width={80}
                                        height={80}
                                />
                        </Link>
                        <div className='min-h-screen bg-gray-50'>
                                <header className='sticky top-0 z-10 bg-dark-background backdrop-blur-3xl border-b border-gray-100 py-4'>
                                        <div className='container flex items-center justify-between'>
                                                <Link
                                                        href='/'
                                                        className='flex items-center space-x-2'
                                                >
                                                        <div className='w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center'>
                                                                <Image
                                                                        src='/favicon.svg'
                                                                        alt='logo'
                                                                        width={28}
                                                                        height={28}
                                                                />
                                                        </div>
                                                        <span className='text-2xl font-bold text-gray-900 max-sm:hidden'>Assignee</span>
                                                </Link>
                                                <div className='flex gap-2'>
                                                        <Button
                                                                variant={'secondary'}
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
                                <section className='relative overflow-hidden flex items-center py-20'>
                                        <div className='absolute inset-0 bg-gradient-to-r from-gray-600/10 to-gray-600/20' />
                                        <div className='container px-4 text-center relative z-0'>
                                                <Badge variant='secondary'>AI-Powered Assignment Management</Badge>
                                                <h1 className='text-4xl md:text-6xl font-bold text-gray-900 text-wrap sm:my-4 flex gap-x-4 justify-center items-center flex-wrap'>
                                                        <div>
                                                                <AnimatedText
                                                                        text={streamline}
                                                                        className='inline-block'
                                                                />
                                                        </div>
                                                        <div>
                                                                <AnimatedText
                                                                        text={assignment}
                                                                        className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-800 inline-block leading-[1.5]'
                                                                        delayOffset={streamline.length}
                                                                />
                                                        </div>
                                                        <div>
                                                                <AnimatedText
                                                                        text={workflow}
                                                                        className='inline-block'
                                                                        delayOffset={streamline.length + assignment.length}
                                                                />
                                                        </div>
                                                </h1>
                                                <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto max-sm:text-xs'>
                                                        Smart grading, seamless communication, and intelligent insights for teachers and students.
                                                </p>
                                                <div className='flex max-[375px]:flex-col gap-4 justify-center'>
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
                                                                variant='secondary'
                                                        >
                                                                Watch Demo
                                                        </Button>
                                                </div>
                                        </div>
                                </section>
                                <section
                                        id='advantages'
                                        className='py-20 bg-gray-50'
                                >
                                        <div className='container px-4'>
                                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                                                        {[
                                                                {
                                                                        Icon: CheckCircle,
                                                                        title: 'AI-Powered Grading',
                                                                        description: 'Intelligent assignment evaluation with consistent, fair grading standards',
                                                                },
                                                                {
                                                                        Icon: Clock,
                                                                        title: 'Time Management',
                                                                        description: 'Track deadlines, submissions, and progress with intuitive dashboards',
                                                                },
                                                                {
                                                                        Icon: MessageSquare,
                                                                        title: 'Seamless Communication',
                                                                        description: 'Built-in chat system for instant teacher-student collaboration',
                                                                },
                                                                {
                                                                        Icon: Users,
                                                                        title: 'Role-Based Access',
                                                                        description: 'Tailored experiences for teachers and students with secure access controls',
                                                                },
                                                        ].map((advantage, index) => (
                                                                <AnimatedShowcase
                                                                        {...advantage}
                                                                        delay={customDelay[index]}
                                                                        key={index}
                                                                ></AnimatedShowcase>
                                                        ))}
                                                </div>
                                        </div>
                                </section>
                                <section
                                        id='testimonials'
                                        className='py-10 bg-gray-50'
                                >
                                        <div className='container px-4'>
                                                <div className='text-center mb-16'>
                                                        <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>What Our Users Say</h2>
                                                        <p className='text-xl text-gray-600'>Trusted by thousands of educators and students worldwide</p>
                                                </div>
                                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
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
                                                                <AnimatedFeedback
                                                                        {...testimonial}
                                                                        index={index}
                                                                        key={index}
                                                                />
                                                        ))}
                                                </div>
                                        </div>
                                </section>
                                <section
                                        id='about'
                                        className='py-10 bg-gray-50'
                                >
                                        <div className='container px-4'>
                                                <div className='text-center mb-16'>
                                                        <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>How It Works</h2>
                                                        <p className='text-xl text-gray-600'>Get started in minutes with our simple three-step process</p>
                                                </div>

                                                <div className='max-w-4xl mx-auto'>
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
                                                                <div
                                                                        key={index}
                                                                        className='flex flex-col md:flex-row items-center mb-12 last:mb-0'
                                                                >
                                                                        <div className='w-20 h-20 bg-gray-700 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-8 flex-shrink-0'>
                                                                                {step.step}
                                                                        </div>
                                                                        <div className='text-center md:text-left'>
                                                                                <h3 className='text-2xl font-bold text-gray-900 mb-2'>{step.title}</h3>
                                                                                <p className='text-lg text-gray-600 max-sm:text-sm'>{step.description}</p>
                                                                        </div>
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>
                                </section>
                                <footer className='bg-gray-900 text-white py-12'>
                                        <div className='container px-4 text-center'>
                                                <Link href='/'>
                                                        <div className='flex items-center justify-center space-x-2 mb-8'>
                                                                <div className='w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center'>
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
                                                <nav className='flex justify-center sm:gap-4 gap-8 mb-8 flex-wrap'>
                                                        <a
                                                                href='#advantages'
                                                                className='hover:text-gray-400 transition-colors'
                                                        >
                                                                Advantages
                                                        </a>
                                                        <a
                                                                href='#testimonials'
                                                                className='hover:text-gray-400 transition-colors'
                                                        >
                                                                Testimonials
                                                        </a>
                                                        <a
                                                                href='#about'
                                                                className='hover:text-gray-400 transition-colors'
                                                        >
                                                                How It Works
                                                        </a>
                                                </nav>
                                                <p className='text-gray-400'>© 2025 Assignee. All rights reserved.</p>
                                        </div>
                                </footer>
                        </div>
                </>
        )
}
