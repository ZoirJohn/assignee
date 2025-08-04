import './globals.css';
import { Manrope } from 'next/font/google';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { createClient } from '@/lib/supabase/server';

const manrope = Manrope({
        subsets: ['latin'],
});

export const metadata: Metadata = {
        title: 'Assignee - Smart Assignment Management',
        description: 'Streamline your assignment workflow with AI-powered grading and seamless communication',
        icons: {},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
        return (
                <html
                        lang="en"
                        className="select-none">
                        <body className={`${manrope.className} font-sans text-base bg-gray-50`}>
                                {children} <Analytics />
                        </body>
                </html>
        );
}
