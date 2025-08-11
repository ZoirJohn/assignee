'use client';
import { Calendar, MessageSquare, FileText, LaptopMinimalCheck } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentTabs } from '@/app/dashboard/student/student-tabs';
import { TTabs } from '@/definitions';
import { useState } from 'react';

export default async function StudentDashboard() {
    const [value, setValue] = useState<TTabs>('assignments');
    const changeValue = (value: string) => {
        setValue(value as TTabs);
    };
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-600">Track your assignments, communicate with teachers, and view your progress</p>
            </div>

            <Tabs defaultValue="deadlines" className="space-y-4">
                <TabsList className="max-[375px]:w-full">
                    <TabsTrigger value="deadlines" className="flex items-center gap-2 max-[400px]:px-2">
                        <Calendar className="w-4 h-4" />
                        <span className="max-[375px]:hidden">Deadlines</span>
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="flex items-center gap-2 max-[400px]:px-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="max-[375px]:hidden">Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="transcript" className="flex items-center gap-2 max-[400px]:px-2">
                        <FileText className="w-4 h-4" />
                        <span className="max-[375px]:hidden">Transcript</span>
                    </TabsTrigger>
                    <TabsTrigger value="answers" className="flex items-center gap-2 max-[400px]:px-2">
                        <LaptopMinimalCheck className="w-4 h-4" />
                        <span className="max-sm:hidden">Answers</span>
                    </TabsTrigger>
                </TabsList>
                <StudentTabs value={value} />
            </Tabs>
        </div>
    );
}
