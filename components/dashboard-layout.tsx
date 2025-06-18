'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, MessageSquare, FileText, Star, LogOut, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'student' | 'teacher';
  userName: string;
}

const studentLinks = [
  { href: '/dashboard/student', label: 'Deadlines', icon: Calendar },
  { href: '/dashboard/student', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/student', label: 'Transcript', icon: FileText },
];

const teacherLinks = [
  { href: '/dashboard/teacher', label: 'Assignments', icon: FileText },
  { href: '/dashboard/teacher', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/teacher', label: 'Feedback', icon: Star },
];

export default function DashboardLayout({ children, userType, userName }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const links = userType === 'student' ? studentLinks : teacherLinks;

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? 'w-full' : 'w-64'} bg-white border-r border-gray-200 flex flex-col`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Assignee</span>
        </div>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">{userName}</p>
            <p className="text-sm text-gray-600 capitalize">{userType}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => mobile && setIsMobileMenuOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
          asChild
        >
          <Link href="/">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 pl-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">Assignee</span>
            </div>
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <main className="flex-1 p-1 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}