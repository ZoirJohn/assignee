'use client'

import { useState } from 'react'
import { Calendar, Clock, MessageSquare, FileText, Upload, CheckCircle, AlertCircle, XCircle, User, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import DashboardLayout from '@/components/dashboard-layout'

const assignments = [
        {
                id: 1,
                title: 'Essay: Climate Change Impact',
                subject: 'Environmental Science',
                dueDate: '2025-01-25',
                status: 'pending',
                description: 'Write a 1000-word essay on climate change impacts',
        },
        {
                id: 2,
                title: 'Math Problem Set #5',
                subject: 'Calculus',
                dueDate: '2025-01-20',
                status: 'graded',
                grade: 'A-',
                description: 'Solve problems 1-15 from chapter 8',
        },
        {
                id: 3,
                title: 'History Research Paper',
                subject: 'World History',
                dueDate: '2025-01-15',
                status: 'missed',
                description: 'Research paper on World War II causes',
        },
        {
                id: 4,
                title: 'Chemistry Lab Report',
                subject: 'Chemistry',
                dueDate: '2025-01-30',
                status: 'pending',
                description: 'Submit lab report for acid-base titration experiment',
        },
]

const chatMessages = [
        {
                id: 1,
                sender: 'teacher',
                name: 'Dr. Smith',
                message: 'Good work on your last assignment! I have some feedback for you.',
                timestamp: '10:30 AM',
        },
        {
                id: 2,
                sender: 'student',
                name: 'You',
                message: 'Thank you! I would love to hear your feedback.',
                timestamp: '10:32 AM',
        },
        {
                id: 3,
                sender: 'teacher',
                name: 'Dr. Smith',
                message: 'Your analysis was thorough, but try to include more recent sources next time.',
                timestamp: '10:35 AM',
        },
]

const grades = [
        { subject: 'Environmental Science', assignment: 'Essay: Renewable Energy', grade: 'A', date: '2025-01-10' },
        { subject: 'Calculus', assignment: 'Problem Set #4', grade: 'B+', date: '2025-01-08' },
        { subject: 'World History', assignment: 'WWII Timeline', grade: 'A-', date: '2025-01-05' },
        { subject: 'Chemistry', assignment: 'Molecular Structures', grade: 'A', date: '2025-01-03' },
]

export default function StudentDashboard() {
        const [selectedFile, setSelectedFile] = useState<File | null>(null)
        const [message, setMessage] = useState('')

        const getStatusColor = (status: string) => {
                switch (status) {
                        case 'graded':
                                return 'bg-green-100 text-green-800'
                        case 'pending':
                                return 'bg-yellow-100 text-yellow-800'
                        case 'missed':
                                return 'bg-red-100 text-red-800'
                        default:
                                return 'bg-gray-100 text-gray-800'
                }
        }

        const getStatusIcon = (status: string) => {
                switch (status) {
                        case 'graded':
                                return <CheckCircle className='w-4 h-4' />
                        case 'pending':
                                return <Clock className='w-4 h-4' />
                        case 'missed':
                                return <XCircle className='w-4 h-4' />
                        default:
                                return <AlertCircle className='w-4 h-4' />
                }
        }

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0]
                if (file) {
                        setSelectedFile(file)
                }
        }

        const handleSendMessage = () => {
                if (message.trim()) {
                        console.log('Sending message:', message)
                        setMessage('')
                }
        }

        return (
                <DashboardLayout
                        userType='student'
                        userName='John Doe'
                >
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

                                        <TabsContent
                                                value='deadlines'
                                                className='space-y-4'
                                        >
                                                <div className='grid gap-4'>
                                                        {assignments.map((assignment) => (
                                                                <Card key={assignment.id}>
                                                                        <CardHeader className='!pb-0'>
                                                                                <div className='flex items-start justify-between max-[400px]:flex-col-reverse max-[400px]:gap-2'>
                                                                                        <div>
                                                                                                <CardTitle className='text-xl'>{assignment.title}</CardTitle>
                                                                                                <CardDescription className='text-base'>{assignment.subject}</CardDescription>
                                                                                        </div>
                                                                                        <div className='flex items-center space-x-2'>
                                                                                                <Badge className={getStatusColor(assignment.status)}>
                                                                                                        {getStatusIcon(assignment.status)}
                                                                                                        <span className='ml-1 capitalize'>{assignment.status}</span>
                                                                                                </Badge>
                                                                                                {assignment.grade && (
                                                                                                        <Badge
                                                                                                                variant='outline'
                                                                                                                className='bg-blue-50 text-blue-700'
                                                                                                        >
                                                                                                                {assignment.grade}
                                                                                                        </Badge>
                                                                                                )}
                                                                                        </div>
                                                                                </div>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                                <p className='text-gray-600 mb-4'>{assignment.description}</p>
                                                                                <div className='flex items-center justify-between flex-wrap gap-4'>
                                                                                        <div className='flex items-center text-sm text-gray-500'>
                                                                                                <Clock className='w-4 h-4 mr-1' />
                                                                                                Due: {assignment.dueDate}
                                                                                        </div>
                                                                                        {assignment.status === 'pending' && (
                                                                                                <div className='flex items-center gap-2'>
                                                                                                        <Input
                                                                                                                type='file'
                                                                                                                onChange={handleFileChange}
                                                                                                                className='hidden'
                                                                                                                id={`file-${assignment.id}`}
                                                                                                        />
                                                                                                        <Button
                                                                                                                variant='outline'
                                                                                                                size='sm'
                                                                                                                onClick={() => document.getElementById(`file-${assignment.id}`)?.click()}
                                                                                                        >
                                                                                                                <Upload className='w-4 h-4 mr-2' />
                                                                                                                Upload
                                                                                                        </Button>
                                                                                                        <Button size='sm'>Submit</Button>
                                                                                                </div>
                                                                                        )}
                                                                                </div>
                                                                                {selectedFile && (
                                                                                        <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                                                                                                <p className='text-sm text-gray-600'>Selected file: {selectedFile.name}</p>
                                                                                        </div>
                                                                                )}
                                                                        </CardContent>
                                                                </Card>
                                                        ))}
                                                </div>
                                        </TabsContent>

                                        <TabsContent
                                                value='chat'
                                                className='space-y-4'
                                        >
                                                <Card className='h-96 '>
                                                        <CardHeader className='max-[400px]:!pb-0'>
                                                                <CardTitle>Chat with Teachers</CardTitle>
                                                                <CardDescription>Get help and feedback from your instructors</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className='flex flex-col h-full'>
                                                                <ScrollArea className='flex-1 mb-9 max-[400px]:mb-3 !h-20 max-[332px]:mb-8'>
                                                                        <div className='space-y-4'>
                                                                                {chatMessages.map((msg) => (
                                                                                        <div
                                                                                                key={msg.id}
                                                                                                className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                                                                                        >
                                                                                                <div
                                                                                                        className={`flex items-start space-x-2 max-w-xs ${
                                                                                                                msg.sender === 'student' ? 'flex-row-reverse space-x-reverse' : ''
                                                                                                        }`}
                                                                                                >
                                                                                                        <Avatar className='w-8 h-8'>
                                                                                                                <AvatarFallback>{msg.sender === 'teacher' ? 'T' : 'S'}</AvatarFallback>
                                                                                                        </Avatar>
                                                                                                        <div
                                                                                                                className={`p-3 rounded-lg ${
                                                                                                                        msg.sender === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                                                                                                                }`}
                                                                                                        >
                                                                                                                <p className='text-sm'>{msg.message}</p>
                                                                                                                <p
                                                                                                                        className={`text-xs mt-1 ${
                                                                                                                                msg.sender === 'student' ? 'text-blue-100' : 'text-gray-500'
                                                                                                                        }`}
                                                                                                                >
                                                                                                                        {msg.timestamp}
                                                                                                                </p>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                </ScrollArea>
                                                                <div className='flex items-center space-x-2'>
                                                                        <Input
                                                                                placeholder='Type your message...'
                                                                                value={message}
                                                                                onChange={(e) => setMessage(e.target.value)}
                                                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                                        />
                                                                        <Button
                                                                                size='sm'
                                                                                onClick={handleSendMessage}
                                                                        >
                                                                                <Send className='w-4 h-4' />
                                                                        </Button>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        </TabsContent>

                                        <TabsContent
                                                value='transcript'
                                                className='space-y-4'
                                        >
                                                <Card>
                                                        <CardHeader>
                                                                <CardTitle>Academic Transcript</CardTitle>
                                                                <CardDescription>Your complete grades history</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                                <div className='space-y-4'>
                                                                        {grades.map((grade, index) => (
                                                                                <div
                                                                                        key={index}
                                                                                        className='flex items-center justify-between p-4 border rounded-lg max-[400px]:flex-col max-[400px]:items-start'
                                                                                >
                                                                                        <div>
                                                                                                <h4 className='font-semibold'>{grade.assignment}</h4>
                                                                                                <p className='text-sm text-gray-600'>{grade.subject}</p>
                                                                                        </div>
                                                                                        <div className='text-right self-end'>
                                                                                                <div className='text-2xl font-bold text-blue-600'>{grade.grade}</div>
                                                                                                <p className='text-sm text-gray-500'>{grade.date}</p>
                                                                                        </div>
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        </TabsContent>
                                </Tabs>
                        </div>
                </DashboardLayout>
        )
}
