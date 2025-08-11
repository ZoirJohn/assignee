'use client';
import { FileText, LaptopMinimalCheck, MessageSquare, Star } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeacherTabs } from '@/app/dashboard/teacher/teacher-tabs';
import { TTabs } from '@/definitions';
import { useState } from 'react';

export default function TeacherDashboard() {
    const [value, setValue] = useState<TTabs>('assignments');
    const changeValue = (value: string) => {
        setValue(value as TTabs);
    };
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600">Review assignments, provide feedback, and communicate with students</p>
            </div>

            <Tabs defaultValue="assignments" className="space-y-4" onValueChange={changeValue} value={value}>
                <TabsList className="max-sm:w-full">
                    <TabsTrigger value="assignments" className="flex items-center gap-2 max-[400px]:px-2">
                        <FileText className="w-4 h-4" />
                        <span className="max-sm:hidden">Assignments</span>
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="flex items-center gap-2 max-[400px]:px-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="max-sm:hidden">Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="flex items-center gap-2 max-[400px]:px-2">
                        <Star className="w-4 h-4" />
                        <span className="max-sm:hidden">Feedback</span>
                    </TabsTrigger>
                    <TabsTrigger value="answers" className="flex items-center gap-2 max-[400px]:px-2">
                        <LaptopMinimalCheck className="w-4 h-4" />
                        <span className="max-sm:hidden">Answers</span>
                    </TabsTrigger>
                </TabsList>
                <TeacherTabs value={value} />
            </Tabs>
        </div>
    );
}
