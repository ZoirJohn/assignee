import { FileText, MessageSquare, Star } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TeacherTabs } from '@/components/teacher-tabs'

export default async function TeacherDashboard({ pathname }: { pathname: string }) {
        return (
                <div className='space-y-6'>
                        <div>
                                <h1 className='text-3xl font-bold text-gray-900'>Teacher Dashboard</h1>
                                <p className='text-gray-600'>Review assignments, provide feedback, and communicate with students</p>
                        </div>

                        <Tabs
                                defaultValue='assignments'
                                className='space-y-4'
                        >
                                <TabsList>
                                        <TabsTrigger
                                                value='assignments'
                                                className='flex items-center gap-2 max-[400px]:px-2'
                                        >
                                                <FileText className='w-4 h-4' />
                                                Assignments
                                        </TabsTrigger>
                                        <TabsTrigger
                                                value='chat'
                                                className='flex items-center gap-2 max-[400px]:px-2'
                                        >
                                                <MessageSquare className='w-4 h-4' />
                                                Chat
                                        </TabsTrigger>
                                        <TabsTrigger
                                                value='feedback'
                                                className='flex items-center gap-2 max-[400px]:px-2'
                                        >
                                                <Star className='w-4 h-4' />
                                                Feedback
                                        </TabsTrigger>
                                </TabsList>

                                <TeacherTabs />
                        </Tabs>
                </div>
        )
}
