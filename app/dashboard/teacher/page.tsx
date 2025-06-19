'use client'

import { useState } from 'react'
import { FileText, MessageSquare, Star, Clock, User, Send, Eye, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import DashboardLayout from '@/components/dashboard-layout'

const submissions = [
        {
                id: 1,
                studentName: 'Alice Johnson',
                assignment: 'Climate Change Essay',
                subject: 'Environmental Science',
                submittedAt: '2025-01-15 14:30',
                aiGrade: 'B+',
                extractedText: 'Climate change represents one of the most pressing challenges of our time...',
                status: 'pending',
        },
        {
                id: 2,
                studentName: 'Bob Chen',
                assignment: 'Math Problem Set #5',
                subject: 'Calculus',
                submittedAt: '2025-01-14 16:45',
                aiGrade: 'A-',
                extractedText: 'Problem 1: Find the derivative of f(x) = 3x² + 2x - 1...',
                status: 'graded',
                finalGrade: 'A',
                feedback: 'excellent',
        },
        {
                id: 3,
                studentName: 'Carol Davis',
                assignment: 'History Research Paper',
                subject: 'World History',
                submittedAt: '2025-01-13 10:20',
                aiGrade: 'B',
                extractedText: 'The causes of World War II can be traced back to several key factors...',
                status: 'pending',
        },
]

const chatMessages = [
        {
                id: 1,
                sender: 'student',
                name: 'Alice Johnson',
                message: 'Hi Dr. Smith, I have a question about the upcoming assignment.',
                timestamp: '2:30 PM',
        },
        {
                id: 2,
                sender: 'teacher',
                name: 'You',
                message: 'Hi Alice! What would you like to know?',
                timestamp: '2:32 PM',
        },
        {
                id: 3,
                sender: 'student',
                name: 'Alice Johnson',
                message: 'Is there a specific format you prefer for citations?',
                timestamp: '2:33 PM',
        },
]

export default function TeacherDashboard() {
        const [message, setMessage] = useState('')
        const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
        const [gradeOverride, setGradeOverride] = useState('')
        const [feedback, setFeedback] = useState('')

        const handleSendMessage = () => {
                if (message.trim()) {
                        console.log('Sending message:', message)
                        setMessage('')
                }
        }

        const handleGradeSubmission = (submissionId: number) => {
                console.log('Grading submission:', submissionId, gradeOverride, feedback)
                setSelectedSubmission(null)
                setGradeOverride('')
                setFeedback('')
        }

        const openSubmissionReview = (submission: any) => {
                setSelectedSubmission(submission)
                setGradeOverride(submission.aiGrade)
        }

        return (
                <DashboardLayout
                        userType='teacher'
                        userName='Dr. Smith'
                >
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
                                                        className='flex items-center gap-2'
                                                >
                                                        <FileText className='w-4 h-4' />
                                                        Assignments
                                                </TabsTrigger>
                                                <TabsTrigger
                                                        value='chat'
                                                        className='flex items-center gap-2'
                                                >
                                                        <MessageSquare className='w-4 h-4' />
                                                        Chat
                                                </TabsTrigger>
                                                <TabsTrigger
                                                        value='feedback'
                                                        className='flex items-center gap-2'
                                                >
                                                        <Star className='w-4 h-4' />
                                                        Feedback
                                                </TabsTrigger>
                                        </TabsList>

                                        <TabsContent
                                                value='assignments'
                                                className='space-y-4'
                                        >
                                                <div className='grid gap-4'>
                                                        {submissions.map((submission) => (
                                                                <Card key={submission.id}>
                                                                        <CardHeader>
                                                                                <div className='flex items-start justify-between'>
                                                                                        <div>
                                                                                                <CardTitle className='text-xl'>{submission.assignment}</CardTitle>
                                                                                                <CardDescription className='text-base'>
                                                                                                        by {submission.studentName} • {submission.subject}
                                                                                                </CardDescription>
                                                                                        </div>
                                                                                        <div className='flex items-center space-x-2'>
                                                                                                <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                                                                                                        {submission.status === 'graded' ? (
                                                                                                                <>
                                                                                                                        <CheckCircle className='w-3 h-3 mr-1' />
                                                                                                                        Graded
                                                                                                                </>
                                                                                                        ) : (
                                                                                                                <>
                                                                                                                        <Clock className='w-3 h-3 mr-1' />
                                                                                                                        Pending
                                                                                                                </>
                                                                                                        )}
                                                                                                </Badge>
                                                                                                <Badge
                                                                                                        variant='outline'
                                                                                                        className='bg-blue-50 text-blue-700'
                                                                                                >
                                                                                                        AI: {submission.aiGrade}
                                                                                                </Badge>
                                                                                                {submission.finalGrade && (
                                                                                                        <Badge className='bg-green-100 text-green-800'>Final: {submission.finalGrade}</Badge>
                                                                                                )}
                                                                                        </div>
                                                                                </div>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                                <div className='flex items-center justify-between'>
                                                                                        <div className='flex items-center text-sm text-gray-500'>
                                                                                                <Clock className='w-4 h-4 mr-1' />
                                                                                                Submitted: {submission.submittedAt}
                                                                                        </div>
                                                                                        <div className='flex items-center space-x-2'>
                                                                                                <Button
                                                                                                        variant='outline'
                                                                                                        size='sm'
                                                                                                        onClick={() => openSubmissionReview(submission)}
                                                                                                >
                                                                                                        <Eye className='w-4 h-4 mr-2' />
                                                                                                        Review
                                                                                                </Button>
                                                                                                {submission.status === 'pending' && (
                                                                                                        <Button
                                                                                                                size='sm'
                                                                                                                onClick={() => openSubmissionReview(submission)}
                                                                                                        >
                                                                                                                Grade Now
                                                                                                        </Button>
                                                                                                )}
                                                                                        </div>
                                                                                </div>
                                                                        </CardContent>
                                                                </Card>
                                                        ))}
                                                </div>

                                                {selectedSubmission && (
                                                        <Card className='border-2 border-blue-200 bg-blue-50/30'>
                                                                <CardHeader>
                                                                        <CardTitle>Review: {selectedSubmission.assignment}</CardTitle>
                                                                        <CardDescription>Student: {selectedSubmission.studentName}</CardDescription>
                                                                </CardHeader>
                                                                <CardContent className='space-y-4'>
                                                                        <div>
                                                                                <h4 className='font-semibold mb-2'>Extracted Text:</h4>
                                                                                <div className='bg-gray-50 p-4 rounded-lg max-h-32 overflow-y-auto'>
                                                                                        <p className='text-sm'>{selectedSubmission.extractedText}</p>
                                                                                </div>
                                                                        </div>

                                                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                                                <div>
                                                                                        <label className='block text-sm font-medium mb-2'>Grade</label>
                                                                                        <Input
                                                                                                value={gradeOverride}
                                                                                                onChange={(e) => setGradeOverride(e.target.value)}
                                                                                                placeholder='Enter grade (e.g., A, B+, 85)'
                                                                                        />
                                                                                        <p className='text-xs text-gray-500 mt-1'>AI suggested: {selectedSubmission.aiGrade}</p>
                                                                                </div>

                                                                                <div>
                                                                                        <label className='block text-sm font-medium mb-2'>Feedback Level</label>
                                                                                        <Select
                                                                                                value={feedback}
                                                                                                onValueChange={setFeedback}
                                                                                        >
                                                                                                <SelectTrigger>
                                                                                                        <SelectValue placeholder='Select feedback' />
                                                                                                </SelectTrigger>
                                                                                                <SelectContent>
                                                                                                        <SelectItem value='excellent'>Excellent</SelectItem>
                                                                                                        <SelectItem value='good'>Good</SelectItem>
                                                                                                        <SelectItem value='okay'>Okay</SelectItem>
                                                                                                        <SelectItem value='poor'>Poor</SelectItem>
                                                                                                </SelectContent>
                                                                                        </Select>
                                                                                </div>
                                                                        </div>

                                                                        <div>
                                                                                <label className='block text-sm font-medium mb-2'>Additional Comments</label>
                                                                                <Textarea
                                                                                        placeholder='Add specific feedback for the student...'
                                                                                        className='min-h-20'
                                                                                />
                                                                        </div>

                                                                        <div className='flex items-center space-x-2'>
                                                                                <Button onClick={() => handleGradeSubmission(selectedSubmission.id)}>Confirm Grade</Button>
                                                                                <Button
                                                                                        variant='outline'
                                                                                        onClick={() => setSelectedSubmission(null)}
                                                                                >
                                                                                        Cancel
                                                                                </Button>
                                                                        </div>
                                                                </CardContent>
                                                        </Card>
                                                )}
                                        </TabsContent>

                                        <TabsContent
                                                value='chat'
                                                className='space-y-4'
                                        >
                                                <Card className='h-96'>
                                                        <CardHeader>
                                                                <CardTitle>Student Messages</CardTitle>
                                                                <CardDescription>Communicate with your students</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className='flex flex-col h-full'>
                                                                <ScrollArea className='flex-1 mb-4'>
                                                                        <div className='space-y-4'>
                                                                                {chatMessages.map((msg) => (
                                                                                        <div
                                                                                                key={msg.id}
                                                                                                className={`flex ${msg.sender === 'teacher' ? 'justify-end' : 'justify-start'}`}
                                                                                        >
                                                                                                <div
                                                                                                        className={`flex items-start space-x-2 max-w-xs ${
                                                                                                                msg.sender === 'teacher' ? 'flex-row-reverse space-x-reverse' : ''
                                                                                                        }`}
                                                                                                >
                                                                                                        <Avatar className='w-8 h-8'>
                                                                                                                <AvatarFallback>{msg.sender === 'teacher' ? 'T' : 'S'}</AvatarFallback>
                                                                                                        </Avatar>
                                                                                                        <div
                                                                                                                className={`p-3 rounded-lg ${
                                                                                                                        msg.sender === 'teacher' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                                                                                                                }`}
                                                                                                        >
                                                                                                                <p className='text-sm'>{msg.message}</p>
                                                                                                                <p
                                                                                                                        className={`text-xs mt-1 ${
                                                                                                                                msg.sender === 'teacher' ? 'text-blue-100' : 'text-gray-500'
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
                                                value='feedback'
                                                className='space-y-4'
                                        >
                                                <Card>
                                                        <CardHeader>
                                                                <CardTitle>Recent Feedback Given</CardTitle>
                                                                <CardDescription>Track the feedback you've provided to students</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                                <div className='space-y-4'>
                                                                        {submissions
                                                                                .filter((s) => s.status === 'graded')
                                                                                .map((submission) => (
                                                                                        <div
                                                                                                key={submission.id}
                                                                                                className='flex items-center justify-between p-4 border rounded-lg'
                                                                                        >
                                                                                                <div>
                                                                                                        <h4 className='font-semibold'>{submission.studentName}</h4>
                                                                                                        <p className='text-sm text-gray-600'>{submission.assignment}</p>
                                                                                                </div>
                                                                                                <div className='text-right'>
                                                                                                        <div className='flex items-center space-x-2'>
                                                                                                                <Badge className='bg-green-100 text-green-800'>{submission.finalGrade}</Badge>
                                                                                                                <Badge
                                                                                                                        variant='outline'
                                                                                                                        className='capitalize'
                                                                                                                >
                                                                                                                        {submission.feedback}
                                                                                                                </Badge>
                                                                                                        </div>
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
