import './globals.css'
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'

const inter = Open_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
        title: 'Assignee - Smart Assignment Management',
        description: 'Streamline your assignment workflow with AI-powered grading and seamless communication',
        icons: {
                icon: '/favicon.svg',
        },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
        return (
                <html
                        lang='en'
                        className='select-none'
                >
                        <body
                                className={inter.className}
                                suppressHydrationWarning
                        >
                                <Link
                                        href='https://bolt.new'
                                        target='_blank'
                                        className='absolute bg-black z-[100] text-white w-32 h-32 rounded-full flex justify-center top-72 left-72'
                                >
                                        <Image
                                                src='https://mintlify.s3.us-west-1.amazonaws.com/stackblitz/logo/light.svg'
                                                alt='Bolt.dev Logo'
                                                width={60}
                                                height={60}
                                                className='absolute top-[45%]'
                                        />
                                        <p className='absolute top-1/3 text-[10px]'>Built with</p>
                                </Link>

                                {children}
                        </body>
                </html>
        )
}
