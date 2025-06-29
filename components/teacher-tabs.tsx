'use client'
import { useEffect, useState } from 'react'
import { Clock, Send, Eye, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TabsContent } from '@/components/ui/tabs'
import { createClient } from '@/utils/supabase/client'
import { TMessage, TStudent } from '@/definitions'
import { cn } from '@/lib/utils'

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

export function TeacherTabs() {
        const supabase = createClient()

        const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
        const [gradeOverride, setGradeOverride] = useState('')
        const [feedback, setFeedback] = useState('')

        const [messages, setMessages] = useState<TMessage[]>([])
        const [students, setStudents] = useState<TStudent[]>([])
        const [newMessage, setNewMessage] = useState<string>('')
        const [currentUserId, setCurrentUserId] = useState<string>('')
        const [userId, setUserId] = useState<string>('')
        const [disabled, setDisabled] = useState<boolean>()
        const handleGradeSubmission = (submissionId: number) => {
                setSelectedSubmission(null)
                setGradeOverride('')
                setFeedback('')
        }
        const openSubmissionReview = (submission: any) => {
                setSelectedSubmission(submission)
                setGradeOverride(submission.aiGrade)
        }
        const handleSendMessage = async () => {
                setDisabled(true)
                await supabase.from('messages').insert({
                        sender_id: userId,
                        receiver_id: currentUserId,
                        content: newMessage,
                })
                setNewMessage('')
                setDisabled(false)
        }
        useEffect(() => {
                async function fetchUser() {
                        const {
                                data: { user },
                        } = await supabase.auth.getUser()
                        setUserId(user?.id!)
                }
                fetchUser()
        }, [])
        useEffect(() => {
                const channel = supabase
                        .channel('messages')
                        .on(
                                'postgres_changes',
                                {
                                        event: '*',
                                        schema: 'public',
                                        table: 'messages',
                                },
                                (payload) => {
                                        const { eventType, new: newRow, old: oldRow } = payload

                                        if (eventType === 'INSERT') {
                                                setMessages((prev) => [...prev, newRow] as TMessage[])
                                        }

                                        if (eventType === 'DELETE') {
                                                console.log(newRow, oldRow)
                                                setMessages((prev) => prev.filter((messages) => messages.id !== oldRow.id))
                                        }
                                }
                        )
                        .subscribe()
                return () => {
                        supabase.removeChannel(channel)
                }
        }, [])
        useEffect(() => {
                async function fetchStudents() {
                        const { data: students } = await supabase.from('profiles').select('id, full_name').eq('teacher_id', userId)
                        if (students?.length) {
                                setStudents(students)
                                setCurrentUserId(students[0].id)
                        }
                }
                if (userId) {
                        fetchStudents()
                }
        }, [userId])
        useEffect(() => {
                const fetchMessages = async () => {
                        const { data: messages } = await supabase
                                .from('messages')
                                .select('*')
                                .or(`and(sender_id.eq.${userId},receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},receiver_id.eq.${userId})`)
                                .order('created_at', { ascending: true })

                        setMessages(messages as TMessage[])
                }

                if (currentUserId) fetchMessages()
                setDisabled(students.length == 0)
        }, [currentUserId, userId])
        return (
                <>
                        <TabsContent
                                value='assignments'
                                className='space-y-4'
                        >
                                <div className='grid gap-4'>
                                        {submissions.map((submission) => (
                                                <Card key={submission.id}>
                                                        <CardHeader className='!pb-0'>
                                                                <div className='flex items-start justify-between max-sm:flex-col-reverse max-sm:gap-y-2'>
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
                                                                                {submission.finalGrade && <Badge className='bg-green-100 text-green-800'>Final: {submission.finalGrade}</Badge>}
                                                                        </div>
                                                                </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                                <div className='flex items-center justify-between flex-wrap gap-4'>
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
                                        <CardHeader className='max-[400px]:!pb-0 flex-row justify-between items-center'>
                                                <div>
                                                        <CardTitle>Student Messages</CardTitle>
                                                        <CardDescription>Communicate with your students</CardDescription>
                                                </div>
                                                <div className='flex gap-4'>
                                                        {students.map((student, id) => (
                                                                <Avatar key={id}>
                                                                        <AvatarFallback className={cn({ 'bg-slate-500': student.id == currentUserId })}>
                                                                                {student.full_name
                                                                                        .split(' ')
                                                                                        .map((n) => n[0])
                                                                                        .join('')}
                                                                        </AvatarFallback>
                                                                </Avatar>
                                                        ))}
                                                </div>
                                        </CardHeader>
                                        <CardContent className='flex flex-col h-full'>
                                                <ScrollArea className='flex-1 mb-9 max-[400px]:mb-3 !h-20'>
                                                        <div className='space-y-4'>
                                                                {messages.map(({ id, sender_id, created_at, content }) => (
                                                                        <div
                                                                                key={id}
                                                                                className={`flex ${sender_id === userId ? 'justify-end' : 'justify-start'}`}
                                                                        >
                                                                                <div
                                                                                        className={`flex items-start space-x-2 max-w-xs ${
                                                                                                sender_id === userId ? 'flex-row-reverse space-x-reverse' : ''
                                                                                        }`}
                                                                                >
                                                                                        <Avatar className='w-8 h-8'>
                                                                                                <AvatarFallback>{sender_id === userId ? 'T' : 'S'}</AvatarFallback>
                                                                                        </Avatar>
                                                                                        <div className={`p-3 rounded-lg ${sender_id === userId ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                                                                                                <p className='text-sm'>{content}</p>
                                                                                                <p className={`text-xs mt-1 ${sender_id === userId ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                                                        {new Date(created_at).toLocaleTimeString([], {
                                                                                                                hour: '2-digit',
                                                                                                                minute: '2-digit',
                                                                                                                hour12: true,
                                                                                                        })}
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
                                                                value={newMessage}
                                                                onChange={(e) => setNewMessage(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                                disabled={disabled}
                                                        />
                                                        <Button
                                                                size='sm'
                                                                onClick={handleSendMessage}
                                                                disabled={disabled}
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
                                                <CardDescription>Track the feedback you&apos;ve provided to students</CardDescription>
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
                </>
        )
}
