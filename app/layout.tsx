import './globals.css'
import { Manrope } from 'next/font/google'
import type { Metadata } from 'next'
import Link from 'next/link'
import bolt from '@/public/bolt.png'
import Image from 'next/image'

const manrope = Manrope({
        subsets: ['latin'],
})

export const metadata: Metadata = {
        title: 'Assignee - Smart Assignment Management',
        description: 'Streamline your assignment workflow with AI-powered grading and seamless communication',
        icons: {},
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
        return (
                <html
                        lang='en'
                        className='select-none'
                >
                        <body className={`${manrope.className} font-sans text-base`}>
                                <Link href='https://bolt.new' className='absolute top-80 left-80 z-10'>
                                        <Image
                                                src={bolt}
                                                alt='Bolt'
                                                width={80}
                                                height={80}
                                        />
                                </Link>
                                {children}
                        </body>
                </html>
        )
}
