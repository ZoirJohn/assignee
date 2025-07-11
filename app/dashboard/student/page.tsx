import StudentTabs from '@/app/dashboard/student/student-tabs'
import { Calendar, MessageSquare, FileText } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function StudentDashboard() {
        return (
                <div className='space-y-6'>
                        <div>
                                <h1 className='text-3xl font-bold text-gray-900'>Student Dashboard</h1>
                                <p className='text-gray-600'>Track your assignments, communicate with teachers, and view your progress</p>
                        </div>

                        <Tabs
                                defaultValue='deadlines'
                                className='space-y-4'
                        >
                                <TabsList>
                                        <TabsTrigger
                                                value='deadlines'
                                                className='flex items-center gap-2'
                                        >
                                                <Calendar className='w-4 h-4' />
                                                Deadlines
                                        </TabsTrigger>
                                        <TabsTrigger
                                                value='chat'
                                                className='flex items-center gap-2'
                                        >
                                                <MessageSquare className='w-4 h-4' />
                                                Chat
                                        </TabsTrigger>
                                        <TabsTrigger
                                                value='transcript'
                                                className='flex items-center gap-2'
                                        >
                                                <FileText className='w-4 h-4' />
                                                Transcript
                                        </TabsTrigger>
                                </TabsList>
                                <StudentTabs />
                        </Tabs>
                </div>
        )
}
