import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import Sidebar from './dashboard-layout';
import Image from 'next/image';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
        const supabase = await createClient();
        const { data } = await supabase.auth.getClaims();
        const { fullName, role }: { fullName: string; role: string } = data?.claims?.user_metadata || {};
        return (
                <div className="md:h-screen flex">
                        <Sidebar
                                userName={fullName}
                                userType={role}
                        />
                        <div className="flex-1 flex flex-col">
                                <div className="lg:hidden bg-white border-b border-gray-200 p-4 pl-16 sticky top-0">
                                        <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                                                                <Image
                                                                        src="/favicon.svg"
                                                                        alt="logo"
                                                                        width={16}
                                                                        height={16}
                                                                />
                                                        </div>
                                                        <span className="font-bold text-gray-900">Assignee</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                        <Avatar className="w-8 h-8">
                                                                <AvatarFallback className="text-xs">
                                                                        {fullName
                                                                                .split(' ')
                                                                                .map((n) => n[0])
                                                                                .join('')}
                                                                </AvatarFallback>
                                                        </Avatar>
                                                </div>
                                        </div>
                                </div>

                                <main className="p-6 lg:p-8 max-[425px]:p-1 h-screen overflow-auto max-[425px]:height-full">
                                        {children}
                                </main>
                        </div>
                </div>
        );
}
