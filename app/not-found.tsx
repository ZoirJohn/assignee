'use client'

import { motion } from 'motion/react'
import { Home, ArrowLeft, Search, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
                                                        <Image
                                                                src='/favicon.svg'
                                                                alt='logo'
                                                                width={28}
                                                                height={28}
                                                        />
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
                                                        Oops! The page you&apos;re looking for seems to have gone missing. Don&apos;t worry, even the best students sometimes lose their assignments.
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
                                                                                        <svg
                                                                                                fill='#2563eb'
                                                                                                height='20px'
                                                                                                width='20px'
                                                                                                version='1.1'
                                                                                                id='Layer_1'
                                                                                                xmlns='http://www.w3.org/2000/svg'
                                                                                                xmlnsXlink='http://www.w3.org/1999/xlink'
                                                                                                viewBox='0 0 297.001 297.001'
                                                                                                xmlSpace='preserve'
                                                                                        >
                                                                                                <g
                                                                                                        id='SVGRepo_bgCarrier'
                                                                                                        strokeWidth='0'
                                                                                                ></g>
                                                                                                <g
                                                                                                        id='SVGRepo_tracerCarrier'
                                                                                                        strokeLinecap='round'
                                                                                                        strokeLinejoin='round'
                                                                                                ></g>
                                                                                                <g id='SVGRepo_iconCarrier'>
                                                                                                        <g>
                                                                                                                <g>
                                                                                                                        <path d='M287.034,60.873l-20.819-0.001V39.321c0-4.934-3.61-9.126-8.49-9.856c-0.852-0.128-21.134-3.074-45.557,1.37 c-27.227,4.954-48.941,17.171-63.668,35.64c-14.728-18.469-36.442-30.686-63.668-35.64c-24.424-4.443-44.706-1.498-45.557-1.37 c-4.88,0.731-8.49,4.923-8.49,9.856v21.551H9.966C4.463,60.872,0,65.335,0,70.839v187.805c0,3.227,1.562,6.254,4.193,8.124 s6.004,2.35,9.051,1.288c0.748-0.259,75.431-25.747,131.12-0.345c2.628,1.199,5.645,1.199,8.273,0 c55.533-25.33,130.376,0.088,131.12,0.345c1.068,0.372,2.174,0.555,3.276,0.555c2.043,0,4.065-0.628,5.775-1.842 c2.631-1.87,4.193-4.897,4.193-8.124V70.84C297,65.336,292.538,60.873,287.034,60.873z M19.933,245.309V80.805h10.852v132.726 c0,2.896,1.267,5.646,3.458,7.539c2.191,1.893,5.105,2.742,7.969,2.319c0.55-0.08,43.846-6.024,75.478,15.679 C78.725,232.405,39.727,240.112,19.933,245.309z M138.534,230.08c-13.932-12.588-32.079-21.1-53.702-25.034 c-10.406-1.894-20.06-2.446-27.78-2.446c-2.292,0-4.414,0.049-6.333,0.126V48.473h-0.001c19.155-0.864,65.752,1.184,87.816,38.587 V230.08z M158.466,87.061c21.985-37.243,68.655-39.384,87.816-38.563v154.228c-8.383-0.338-20.62-0.136-34.114,2.32 c-21.623,3.934-39.77,12.445-53.702,25.034V87.061z M179.277,239.074c31.636-21.716,74.955-15.766,75.495-15.686 c2.871,0.431,5.783-0.413,7.981-2.305c2.198-1.894,3.462-4.65,3.462-7.552V80.806h10.852v164.503 C257.267,240.11,218.253,232.4,179.277,239.074z'></path>{' '}
                                                                                                                </g>
                                                                                                        </g>
                                                                                                </g>
                                                                                        </svg>
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
