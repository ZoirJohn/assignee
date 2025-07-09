import './globals.css'
import { Manrope } from 'next/font/google'
import type { Metadata } from 'next'

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
                        <body className={`${manrope.className} font-sans text-base bg-gray-50`}>{children}</body>
                </html>
        )
}
