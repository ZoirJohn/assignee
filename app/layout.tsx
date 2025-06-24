import { createClient } from '@/utils/supabase/server'
import './globals.css'
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'

const inter = Open_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
        title: 'Assignee - Smart Assignment Management',
        description: 'Streamline your assignment workflow with AI-powered grading and seamless communication',
        icons: {
                icon: '/favicon.svg',
        },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
        const supabase = await createClient()
        const userId = (await supabase.auth.getUser()).data.user?.id
        const { error } = await supabase.from('profiles').insert({
                id: userId,
                full_name: 'Bul Bul',
                role: 'student',
                teacher_id: null,
        })
        return (
                <html
                        lang='en'
                        className='select-none'
                >
                        <body
                                className={inter.className}
                                suppressHydrationWarning
                        >
                                {children}
                        </body>
                </html>
        )
}
