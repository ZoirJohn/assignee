'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Home, User, FileText, LogOut, Menu, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import Image from 'next/image'
import { signout } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
        children: React.ReactNode
        userType: 'student' | 'teacher' | ''
        userName: string
}

const studentLinks = [
        { href: '/dashboard/student', label: 'Dashboard', icon: Home },
        { href: '/dashboard/student/profile', label: 'Profile', icon: User },
        { href: '/dashboard/student/transcript', label: 'Transcript', icon: FileText },
]

const teacherLinks = [
        { href: '/dashboard/teacher', label: 'Dashboard', icon: Home },
        { href: '/dashboard/teacher/profile', label: 'Profile', icon: User },
        { href: '/dashboard/teacher/transcript', label: 'Transcript', icon: FileText },
]

export default function DashboardLayout({ children, userType, userName }: DashboardLayoutProps) {
        const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
        const links = userType === 'student' ? studentLinks : userType === 'teacher' ? teacherLinks : []
        const pathname = usePathname()
        const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
                <div className={`${mobile ? 'w-full' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-screen `}>
                        <div className='p-6 border-b border-gray-200'>
                                <Link
                                        href='/'
                                        className='flex items-center space-x-2 mb-4'
                                >
                                        <div className='w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center'>
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
                                        <Avatar>
                                                <AvatarFallback>
                                                        {userName
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')}
                                                </AvatarFallback>
                                        </Avatar>
                                        <div>
                                                <p className='font-semibold text-gray-900'>{userName}</p>
                                                <p className='text-sm text-gray-600 capitalize'>{userType}</p>
                                        </div>
                                </div>
                        </div>

                        <nav className={cn({ 'flex-1': userType == 'student' }, 'p-4')}>
                                <ul className='space-y-2'>
                                        {links.map((link) => (
                                                <li key={link.label}>
                                                        <Link
                                                                href={link.href}
                                                                className={cn(
                                                                        { 'bg-gray-100': link.href == pathname },
                                                                        'flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors'
                                                                )}
                                                                onClick={() => mobile && setIsMobileMenuOpen(false)}
                                                        >
                                                                <link.icon className='w-5 h-5' />
                                                                <span>{link.label}</span>
                                                        </Link>
                                                </li>
                                        ))}
                                </ul>
                        </nav>
                        {userType == 'teacher' ? (
                                <div className='flex-1 flex justify-center'>
                                        <Button
                                                variant='outline'
                                                className='text-gray-700 hover:bg-red-50 w-10 h-10 justify-start rounded-full'
                                                asChild
                                        >
                                                <Link href='/dashboard/teacher/create'>
                                                        <Plus className='w-5 h-5 mr-3' />
                                                </Link>
                                        </Button>
                                </div>
                        ) : (
                                <></>
                        )}

                        <div className='p-4 border-t border-gray-200'>
                                <Button
                                        variant='ghost'
                                        className='w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50'
                                        asChild
                                >
                                        <button onClick={signout}>
                                                <LogOut className='w-5 h-5 mr-3' />
                                                Sign Out
                                        </button>
                                </Button>
                        </div>
                </div>
        )

        return (
                <div className='md:h-screen flex'>
                        <div className='hidden lg:block'>
                                <Sidebar />
                        </div>

                        <Sheet
                                open={isMobileMenuOpen}
                                onOpenChange={setIsMobileMenuOpen}
                        >
                                <SheetTitle />
                                <SheetTrigger asChild>
                                        <Button
                                                variant='secondary'
                                                size='icon'
                                                className='lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md'
                                        >
                                                <Menu className='w-5 h-5' />
                                        </Button>
                                </SheetTrigger>
                                <SheetContent
                                        side='left'
                                        className='p-0 w-64'
                                >
                                        <Sidebar mobile />
                                </SheetContent>
                        </Sheet>

                        <div className='flex-1 flex flex-col'>
                                <div className='lg:hidden bg-white border-b border-gray-200 p-4 pl-16 sticky top-0'>
                                        <div className='flex items-center justify-between'>
                                                <div className='flex items-center space-x-2'>
                                                        <div className='w-6 h-6 bg-gray-800 rounded flex items-center justify-center'>
                                                                <Image
                                                                        src='/favicon.svg'
                                                                        alt='logo'
                                                                        width={16}
                                                                        height={16}
                                                                />
                                                        </div>
                                                        <span className='font-bold text-gray-900'>Assignee</span>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                        <Avatar className='w-8 h-8'>
                                                                <AvatarFallback className='text-xs'>
                                                                        {userName
                                                                                .split(' ')
                                                                                .map((n) => n[0])
                                                                                .join('')}
                                                                </AvatarFallback>
                                                        </Avatar>
                                                </div>
                                        </div>
                                </div>

                                <main className='p-6 lg:p-8 max-[425px]:p-1'>{children}</main>
                        </div>
                </div>
        )
}
