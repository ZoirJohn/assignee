'use client'
import { useEffect, useRef, useState } from 'react'
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
import { createClient } from '@/lib/supabase/client'
import { TAssignment, TMessage, TStudent } from '@/definitions'
import { cn } from '@/lib/utils'

export function TeacherTabs() {
        const supabase = createClient()

        const [selectedSubmission, setSelectedSubmission] = useState<TAssignment | null>(null)
        const [gradeOverride, setGradeOverride] = useState<number>(0)
        const [additionalComments, setAdditionalComments] = useState('')

        const [messages, setMessages] = useState<TMessage[]>([])
        const [assigments, setAssignments] = useState<TAssignment[]>([])
        const [students, setStudents] = useState<TStudent[]>([])
        const [newMessage, setNewMessage] = useState<string>('')
        const [currentUserId, setCurrentUserId] = useState<string>('')
        const [userId, setUserId] = useState<string>()
        const [disabled, setDisabled] = useState<boolean>()
        const messagesEndRef = useRef<HTMLDivElement>(null)

        const handleGradeSubmission = () => {
                setSelectedSubmission(null)
                setGradeOverride(0)
                setAdditionalComments('')
        }
        const openSubmissionReview = (submission: TAssignment) => {
                if (selectedSubmission) {
                        setSelectedSubmission(null)
                } else {
                        setSelectedSubmission(submission)
                }
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
                        if (user) {
                                setUserId(user.id)
                        }
                }
                fetchUser()
        }, [supabase.auth])
        useEffect(() => {
                const channel = supabase
                        .channel('realtime-chat:teacher-student')
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
                                                setMessages((prev) => prev.filter((messages) => messages.id !== oldRow.id))
                                        }
                                }
                        )
                        .subscribe()
                return () => {
                        supabase.removeChannel(channel)
                }
        }, [supabase])
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
        }, [userId, supabase])
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
        }, [currentUserId, userId, students.length, supabase])
        useEffect(() => {
                const fetchAssignments = async () => {
                        const { data } = await supabase.from('assignments').select('*').eq('teacher_id', userId)
                        setAssignments((prev) => [...prev, ...(data as TAssignment[])])
                }
                if (userId) fetchAssignments()
        }, [userId, supabase])
        useEffect(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, [messages])
        return (
                <>
                        <TabsContent
                                value='assignments'
                                className='space-y-4'
                        >
                                <div className='grid gap-4'>
                                        {assigments.length ? (
                                                assigments.map(({ title, id, student_id, subject, status, ai_grade, graded_at, submitted_at, created_at, ...others }) => (
                                                        <Card key={id}>
                                                                <CardHeader className='!pb-0'>
                                                                        <div className='flex items-start justify-between max-sm:flex-col-reverse max-sm:gap-y-2'>
                                                                                <div>
                                                                                        <CardTitle className='text-xl'>{title}</CardTitle>
                                                                                        <CardDescription className='text-base'>
                                                                                                by Student {student_id} • {subject || 'No Subject'}
                                                                                        </CardDescription>
                                                                                </div>
                                                                                <div className='flex items-center space-x-2'>
                                                                                        <Badge
                                                                                                className='hover:bg-black'
                                                                                                variant={status === 'graded' ? 'default' : 'secondary'}
                                                                                        >
                                                                                                {status === 'graded' ? (
                                                                                                        <>
                                                                                                                <CheckCircle className='w-3 h-3 mr-1' />
                                                                                                                Graded
                                                                                                        </>
                                                                                                ) : (
                                                                                                        <>
                                                                                                                <Clock className='w-3 h-3 mr-1' />
                                                                                                                {status === 'submitted' ? 'Submitted' : 'Pending'}
                                                                                                        </>
                                                                                                )}
                                                                                        </Badge>
                                                                                        <Badge
                                                                                                variant='outline'
                                                                                                className='bg-blue-50 text-blue-700'
                                                                                        >
                                                                                                AI Score: {ai_grade}/{others.max_grade}
                                                                                        </Badge>
                                                                                        {graded_at && (
                                                                                                <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                                                                                                        Graded: {new Date(graded_at).toLocaleDateString()}
                                                                                                </Badge>
                                                                                        )}
                                                                                </div>
                                                                        </div>
                                                                </CardHeader>
                                                                <CardContent>
                                                                        <div className='flex items-center justify-between flex-wrap gap-4'>
                                                                                <div className='flex items-center text-sm text-gray-500'>
                                                                                        <Clock className='w-4 h-4 mr-1' />
                                                                                        {submitted_at
                                                                                                ? `Submitted: ${new Date(submitted_at).toLocaleDateString()}`
                                                                                                : `Created: ${new Date(created_at).toLocaleDateString()}`}
                                                                                </div>
                                                                                <div className='flex items-center space-x-2'>
                                                                                        <Button
                                                                                                variant='outline'
                                                                                                size='sm'
                                                                                                onClick={() =>
                                                                                                        openSubmissionReview({
                                                                                                                title,
                                                                                                                id,
                                                                                                                student_id,
                                                                                                                subject,
                                                                                                                status,
                                                                                                                ai_grade,
                                                                                                                graded_at,
                                                                                                                submitted_at,
                                                                                                                created_at,
                                                                                                                ...others,
                                                                                                        })
                                                                                                }
                                                                                        >
                                                                                                <Eye className='w-4 h-4 mr-2' />
                                                                                                Review
                                                                                        </Button>
                                                                                        {status === 'pending' && (
                                                                                                <Button
                                                                                                        size='sm'
                                                                                                        onClick={() =>
                                                                                                                openSubmissionReview({
                                                                                                                        title,
                                                                                                                        id,
                                                                                                                        student_id,
                                                                                                                        subject,
                                                                                                                        status,
                                                                                                                        ai_grade,
                                                                                                                        graded_at,
                                                                                                                        submitted_at,
                                                                                                                        created_at,
                                                                                                                        ...others,
                                                                                                                })
                                                                                                        }
                                                                                                >
                                                                                                        Grade Now
                                                                                                </Button>
                                                                                        )}
                                                                                </div>
                                                                        </div>
                                                                </CardContent>
                                                        </Card>
                                                ))
                                        ) : (
                                                <h1 className='text-gray-600'>No assignments found</h1>
                                        )}
                                </div>

                                {selectedSubmission && (
                                        <Card className='border-2 border-blue-200 bg-blue-50/30'>
                                                <CardHeader>
                                                        <CardTitle>Review: {selectedSubmission.title}</CardTitle>
                                                        <CardDescription>Student ID: {selectedSubmission.student_id}</CardDescription>
                                                </CardHeader>
                                                <CardContent className='space-y-4'>
                                                        <div>
                                                                <h4 className='font-semibold mb-2'>Extracted Text:</h4>
                                                                <div className='bg-gray-50 p-4 rounded-lg max-h-32 overflow-y-auto'>
                                                                        <p className='text-sm'>{selectedSubmission.extracted_text}</p>
                                                                </div>
                                                        </div>

                                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                                <div>
                                                                        <label className='block text-sm font-medium mb-2'>Grade</label>
                                                                        <Input
                                                                                type='number'
                                                                                min={selectedSubmission.min_grade}
                                                                                max={selectedSubmission.max_grade}
                                                                                value={gradeOverride}
                                                                                onChange={(e) => setGradeOverride(parseInt(e.target.value, 10))}
                                                                                placeholder='Enter grade (0-100)'
                                                                        />
                                                                        <p className='text-xs text-gray-500 mt-1'>
                                                                                AI Score: {selectedSubmission.ai_grade}/{selectedSubmission.max_grade}
                                                                        </p>
                                                                </div>

                                                                <div>
                                                                        <label className='block text-sm font-medium mb-2'>Feedback Level</label>
                                                                        <Select
                                                                                value={selectedSubmission.feedback}
                                                                                onValueChange={(value) => {
                                                                                        if (selectedSubmission) {
                                                                                                setSelectedSubmission({ ...selectedSubmission, feedback: value as TAssignment['feedback'] })
                                                                                        }
                                                                                }}
                                                                                disabled={selectedSubmission.graded_at == undefined}
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
                                                                        readOnly={selectedSubmission.graded_at == undefined}
                                                                        value={additionalComments}
                                                                        onChange={(e) => setAdditionalComments(e.target.value)}
                                                                />
                                                        </div>

                                                        <div className='flex items-center space-x-2'>
                                                                <Button
                                                                        onClick={() => handleGradeSubmission()}
                                                                        disabled={selectedSubmission.graded_at == undefined}
                                                                >
                                                                        Confirm Grade
                                                                </Button>
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
                                <Card className='h-120'>
                                        <CardHeader className='max-[400px]:!pb-0 grid-cols-2'>
                                                <div>
                                                        {students.length ? (
                                                                <>
                                                                        <CardTitle className='text-2xl'>Student Messages</CardTitle>
                                                                        <CardDescription className='text-xs'>Communicate with your students</CardDescription>
                                                                </>
                                                        ) : (
                                                                <>
                                                                        <CardTitle className='text-2xl'>Please wait until your students arrive</CardTitle>
                                                                        <CardDescription className='text-xs'>Let them register here</CardDescription>
                                                                </>
                                                        )}
                                                </div>
                                                <div className='flex gap-4 justify-end'>
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
                                                <ScrollArea className='flex-1 mb-5 max-[400px]:mb-3 h-10 max-[332px]:mb-8'>
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
                                                                <div
                                                                        ref={messagesEndRef}
                                                                        className='h-0'
                                                                />
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
                                {assigments.length ? (
                                        assigments.map(({ id, student_id, title, ai_grade, feedback, max_grade }, idx) => (
                                                <Card key={idx}>
                                                        <CardHeader>
                                                                <CardTitle>Recent Feedback Given</CardTitle>
                                                                <CardDescription>Track the feedback you&apos;ve provided to students</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                                <div className='space-y-4'>
                                                                        <div
                                                                                key={id}
                                                                                className='flex items-center justify-between p-4 border rounded-lg'
                                                                        >
                                                                                <div>
                                                                                        <h4 className='font-semibold'>Student {student_id}</h4>
                                                                                        <p className='text-sm text-gray-600'>{title}</p>
                                                                                </div>
                                                                                <div className='text-right'>
                                                                                        <div className='flex items-center space-x-2'>
                                                                                                <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                                                                                                        {ai_grade}/{max_grade}
                                                                                                </Badge>
                                                                                                <Badge
                                                                                                        variant='outline'
                                                                                                        className='capitalize'
                                                                                                >
                                                                                                        {feedback || 'No feedback yet'}
                                                                                                </Badge>
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        ))
                                ) : (
                                        <h1 className='text-gray-600'>No assignments found</h1>
                                )}
                        </TabsContent>
                </>
        )
}
