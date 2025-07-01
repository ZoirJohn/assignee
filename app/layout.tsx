import './globals.css'
import Image from 'next/image'
import Link from 'next/link'
import localFont from 'next/font/local'
import type { Metadata } from 'next'

const satoshi = localFont({
        src: [
                { path: '../public/fonts/Satoshi-Regular.otf', style: 'normal', weight: '400' },
                { path: '../public/fonts/Satoshi-Medium.otf', style: 'normal', weight: '500' },
                { path: '../public/fonts/Satoshi-Bold.otf', style: 'normal', weight: '700' },
                { path: '../public/fonts/Satoshi-Black.otf', style: 'normal', weight: '900' },
        ],
        display: 'swap',
})

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
                                className={`${satoshi.className} font-sans text-base`}
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
