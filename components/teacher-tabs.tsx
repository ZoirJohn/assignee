'use client'
import { Fragment, useEffect, useRef, useState } from 'react'
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
import { Label } from './ui/label'

export function TeacherTabs() {
        const supabase = createClient()

        const [selectedAssignment, setSelectedAssignment] = useState<TAssignment | null>(null)
        const [gradeOverride, setGradeOverride] = useState<number>()
        const [additionalComments, setAdditionalComments] = useState('')

        const [messages, setMessages] = useState<TMessage[]>([])
        const [assignments, setAssignments] = useState<TAssignment[]>([])
        const [students, setStudents] = useState<TStudent[]>([])
        const [newMessage, setNewMessage] = useState<string>('')
        const [currentUserId, setCurrentUserId] = useState<string>('')
        const [userId, setUserId] = useState<string>()
        const [disabled, setDisabled] = useState<boolean>()
        const messagesEndRef = useRef<HTMLDivElement>(null)

        const handleGradeSubmission = () => {
                setSelectedAssignment(null)
                setGradeOverride(undefined)
                setAdditionalComments('')
        }
        const openSubmissionReview = (submission: TAssignment) => {
                if (selectedAssignment) {
                        setSelectedAssignment(null)
                } else {
                        setSelectedAssignment(submission)
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
        }, [])
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
        }, [currentUserId, userId, students.length])
        useEffect(() => {
                const fetchAssignments = async () => {
                        const { data: assignments } = await supabase.from('assignments').select('*').eq('created_by', userId)
                        setAssignments((prev) => [...prev, ...(assignments as TAssignment[])])
                }
                if (userId) fetchAssignments()
        }, [userId])
        useEffect(() => {
                const scrollTimeout = setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                }, 0)

                return () => {
                        clearTimeout(scrollTimeout)
                }
        }, [messages])
        console.log(selectedAssignment)
        return (
                <>
                        <TabsContent
                                value='assignments'
                                className='space-y-4'
                        >
                                <div className='grid gap-3'>
                                        {assignments.length ? (
                                                assignments.map((assignment) => (
                                                        <Fragment key={assignment.id}>
                                                                <Card className='gap-0'>
                                                                        <CardHeader className='!pb-0 mb-0'>
                                                                                <div className='flex flex-col gap-1'>
                                                                                        <CardTitle className='text-2xl font-bold leading-tight text-blue-900'>{assignment.title}</CardTitle>
                                                                                        <div className='text-sm text-gray-400 mt-0.5 mb-0.5'>{assignment.subject}</div>
                                                                                        <div className='text-lg font-medium text-gray-800 mb-1'>{assignment.description}</div>
                                                                                        <div className='flex items-center flex-wrap gap-1 mt-1'>
                                                                                                <Badge
                                                                                                        className={assignment.status === 'graded' ? 'hover:bg-black' : ''}
                                                                                                        variant={assignment.status === 'graded' ? 'default' : 'secondary'}
                                                                                                >
                                                                                                        {assignment.status === 'graded' ? (
                                                                                                                <>
                                                                                                                        <CheckCircle className='w-3 h-3 mr-1' />
                                                                                                                        Graded
                                                                                                                </>
                                                                                                        ) : (
                                                                                                                <>
                                                                                                                        <Clock className='w-3 h-3 mr-1' />
                                                                                                                        {assignment.status === 'submitted' ? 'Submitted' : 'Pending'}
                                                                                                                </>
                                                                                                        )}
                                                                                                </Badge>
                                                                                                <Badge
                                                                                                        variant='outline'
                                                                                                        className='bg-blue-50 text-blue-700'
                                                                                                >
                                                                                                        AI Score: {assignment.ai_grade}/{5}
                                                                                                </Badge>
                                                                                                {assignment.teacher_grade && (
                                                                                                        <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                                                                                                                Graded: {new Date(assignment.teacher_grade).toLocaleDateString()}
                                                                                                        </Badge>
                                                                                                )}
                                                                                        </div>
                                                                                        <div className='flex justify-end w-full mt-1'>
                                                                                                <span className='text-xs text-gray-400 italic'>by Student: {assignment.created_by}</span>
                                                                                        </div>
                                                                                </div>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                                <div className='flex items-center justify-between flex-wrap gap-4 border-t pt-3 mt-2'>
                                                                                        <div className='flex flex-col gap-2'>
                                                                                                <div className='flex items-center text-base font-medium text-gray-700'>
                                                                                                        <Clock className='w-5 h-5 mr-2' />
                                                                                                        Due: {new Date(assignment.deadline).toLocaleDateString('en-UZ')}
                                                                                                </div>
                                                                                                <div className='flex items-center text-xs text-gray-400'>
                                                                                                        <Clock className='w-4 h-4 mr-1' />
                                                                                                        {assignment.submitted_at
                                                                                                                ? `Submitted: ${new Date(assignment.submitted_at).toLocaleDateString()}`
                                                                                                                : `Created: ${new Date(assignment.created_at).toLocaleDateString('en-UZ', {
                                                                                                                          day: 'numeric',
                                                                                                                          month: 'long',
                                                                                                                          year: 'numeric',
                                                                                                                  })}`}
                                                                                                </div>
                                                                                        </div>
                                                                                        <div className='flex items-center space-x-2'>
                                                                                                <Button
                                                                                                        variant='outline'
                                                                                                        size='sm'
                                                                                                        onClick={() => openSubmissionReview(assignment)}
                                                                                                >
                                                                                                        <Eye className='w-4 h-4 mr-2' />
                                                                                                        Review
                                                                                                </Button>
                                                                                                {assignment.status === 'pending' && (
                                                                                                        <Button
                                                                                                                size='sm'
                                                                                                                onClick={() => openSubmissionReview(assignment)}
                                                                                                        >
                                                                                                                Grade Now
                                                                                                        </Button>
                                                                                                )}
                                                                                        </div>
                                                                                </div>
                                                                        </CardContent>
                                                                </Card>
                                                                {selectedAssignment && selectedAssignment.id === assignment.id && (
                                                                        <Card className='border-2 border-blue-200 bg-blue-50/30'>
                                                                                <CardHeader>
                                                                                        <CardTitle>Review: {selectedAssignment.title}</CardTitle>
                                                                                        <CardDescription>Student ID: {selectedAssignment.created_by}</CardDescription>
                                                                                </CardHeader>
                                                                                <CardContent className='space-y-4'>
                                                                                        <div>
                                                                                                <h4 className='font-semibold mb-2'>Extracted Text:</h4>
                                                                                                {selectedAssignment.extracted_text}
                                                                                                <div className='bg-gray-50 p-4 rounded-lg max-h-32 overflow-y-auto'>
                                                                                                        <p className='text-sm'>{selectedAssignment.extracted_text}</p>
                                                                                                </div>
                                                                                        </div>
                                                                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                                                                <div>
                                                                                                        <Label className='block text-sm font-medium mb-2'>AI Grade</Label>
                                                                                                        <Input
                                                                                                                type='number'
                                                                                                                value={selectedAssignment.ai_grade ?? ''}
                                                                                                                readOnly
                                                                                                                disabled
                                                                                                                className='bg-gray-100 cursor-not-allowed'
                                                                                                        />
                                                                                                        <p className='text-xs text-gray-500 mt-1'>This is the AI-predicted grade (out of 5)</p>
                                                                                                </div>
                                                                                                <div>
                                                                                                        <Label className='block text-sm font-medium mb-2'>Grade</Label>
                                                                                                        <Input
                                                                                                                type='number'
                                                                                                                max={5}
                                                                                                                min={2}
                                                                                                                value={gradeOverride}
                                                                                                                onChange={(e) => setGradeOverride(parseInt(e.target.value, 10))}
                                                                                                                placeholder='Enter grade (2-5)'
                                                                                                                disabled={selectedAssignment.ai_grade == undefined}
                                                                                                        />
                                                                                                        <p className='text-xs text-gray-500 mt-1'>Your grade for this assignment (out of 5)</p>
                                                                                                </div>
                                                                                                <div>
                                                                                                        <Label
                                                                                                                className='block text-sm font-medium mb-2'
                                                                                                                htmlFor='feedback-level'
                                                                                                        >
                                                                                                                Feedback Level
                                                                                                        </Label>

                                                                                                        <Select
                                                                                                                value={selectedAssignment.feedback}
                                                                                                                onValueChange={(value) => {
                                                                                                                        if (selectedAssignment) {
                                                                                                                                setSelectedAssignment({
                                                                                                                                        ...selectedAssignment,
                                                                                                                                        feedback: value as TAssignment['feedback'],
                                                                                                                                })
                                                                                                                        }
                                                                                                                }}
                                                                                                                disabled={selectedAssignment.teacher_grade == undefined}
                                                                                                        >
                                                                                                                <SelectTrigger
                                                                                                                        id='feedback-level'
                                                                                                                        className='w-full'
                                                                                                                >
                                                                                                                        <SelectValue placeholder='Select feedback' />
                                                                                                                </SelectTrigger>
                                                                                                                <SelectContent>
                                                                                                                        <SelectItem value='excellent'>Excellent</SelectItem>
                                                                                                                        <SelectItem value='good'>Good</SelectItem>
                                                                                                                        <SelectItem value='okay'>Okay</SelectItem>
                                                                                                                        <SelectItem value='poor'>Poor</SelectItem>
                                                                                                                        <SelectItem value='not-graded'>Not Graded</SelectItem>
                                                                                                                </SelectContent>
                                                                                                        </Select>
                                                                                                </div>
                                                                                        </div>

                                                                                        <div>
                                                                                                <Label
                                                                                                        className='block text-sm font-medium mb-2'
                                                                                                        htmlFor='additional-comments'
                                                                                                >
                                                                                                        Additional Comments
                                                                                                </Label>
                                                                                                <Textarea
                                                                                                        id='additional-comments'
                                                                                                        placeholder='Add specific feedback for the student...'
                                                                                                        className='min-h-20'
                                                                                                        readOnly={selectedAssignment.teacher_grade == undefined}
                                                                                                        value={additionalComments}
                                                                                                        onChange={(e) => setAdditionalComments(e.target.value)}
                                                                                                />
                                                                                        </div>

                                                                                        <div className='flex items-center space-x-2'>
                                                                                                <Button
                                                                                                        onClick={() => handleGradeSubmission()}
                                                                                                        disabled={selectedAssignment.teacher_grade == undefined}
                                                                                                >
                                                                                                        Confirm Grade
                                                                                                </Button>
                                                                                                <Button
                                                                                                        variant='outline'
                                                                                                        onClick={() => setSelectedAssignment(null)}
                                                                                                >
                                                                                                        Cancel
                                                                                                </Button>
                                                                                        </div>
                                                                                </CardContent>
                                                                        </Card>
                                                                )}
                                                        </Fragment>
                                                ))
                                        ) : (
                                                <h1 className='text-gray-600'>No assignments found</h1>
                                        )}
                                </div>
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
                                                        <label
                                                                htmlFor='chat-message-input'
                                                                className='sr-only'
                                                        >
                                                                Type your message
                                                        </label>
                                                        <Input
                                                                id='chat-message-input'
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
                                {assignments.length ? (
                                        assignments.map(({ id, created_by, title, ai_grade, feedback }, idx) => (
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
                                                                                        <h4 className='font-semibold'>Student {created_by}</h4>
                                                                                        <p className='text-sm text-gray-600'>{title}</p>
                                                                                </div>
                                                                                <div className='text-right'>
                                                                                        <div className='flex items-center space-x-2'>
                                                                                                <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                                                                                                        {ai_grade}/{5}
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
