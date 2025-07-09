'use client'

import { ChangeEvent, Fragment, useEffect, useRef, useState } from 'react'
import { Clock, Upload, Send, AlertCircle, CheckCircle, XCircle, Eye, Image as ImageIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TabsContent } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { TAssignment, TMessage } from '@/definitions'
import Image from 'next/image'
import { submitAssignment } from '@/lib/azure/submitAssignment'

export default function StudentTabs() {
        const supabase = createClient()
        const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({})
        const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({})
        const [selectedAssignment, setSelectedAssignment] = useState<TAssignment | null>(null)
        const [assignments, setAssignments] = useState<TAssignment[]>([])
        const [messages, setMessages] = useState<TMessage[]>([])
        const [newMessage, setNewMessage] = useState<string>('')
        const [userId, setUserId] = useState<string>('')
        const [teacherId, setTeacherId] = useState<string>('')
        const [disabled, setDisabled] = useState<boolean>(false)
        const [grades, setGrades] = useState<{ subject: string; assignment: string; grade: number | undefined; date: string }[]>([])
        const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null)

        const handleFileChange = (event: ChangeEvent<HTMLInputElement>, assignmentId: string) => {
                const file = event.target.files?.[0]
                if (file) {
                        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
                        if (!validImageTypes.includes(file.type)) {
                                alert('Please select an image file (JPEG, PNG, WebP, GIF, or BMP)')
                                event.target.value = ''
                                return
                        }

                        const previewUrl = URL.createObjectURL(file)

                        setSelectedFiles((prev) => ({
                                ...prev,
                                [assignmentId]: file,
                        }))

                        setPreviewUrls((prev) => ({
                                ...prev,
                                [assignmentId]: previewUrl,
                        }))
                }
        }

        const handleSubmitAssignment = async (assignmentId: string) => {
                const selectedFile = selectedFiles[assignmentId]
                if (!selectedFile) {
                        alert('Please select a file first')
                        return
                }

                try {
                        await submitAssignment({
                                file: selectedFile,
                                assignmentId,
                                teacherId,
                                assignmentName: selectedAssignment?.title,
                                question: selectedAssignment?.description,
                                subject: selectedAssignment?.subject,
                        })
                        console.log('Submitted')
                        setAssignments((prev) =>
                                prev.map((assignment: TAssignment) =>
                                        assignment.id === assignmentId ? { ...assignment, status: 'submitted', image_url: URL.createObjectURL(selectedFile) } : assignment
                                )
                        )
                        setSelectedFiles((prev) => {
                                const newFiles = { ...prev }
                                delete newFiles[assignmentId]
                                return newFiles
                        })
                        setPreviewUrls((prev) => {
                                const newUrls = { ...prev }
                                if (newUrls[assignmentId]) {
                                        URL.revokeObjectURL(newUrls[assignmentId])
                                        delete newUrls[assignmentId]
                                }
                                return newUrls
                        })
                        const fileInput = document.getElementById(`file-${assignmentId}`) as HTMLInputElement
                        if (fileInput) fileInput.value = ''
                } catch {}
        }

        const handleSendMessage = async () => {
                setDisabled(true)
                await supabase.from('messages').insert({
                        sender_id: userId,
                        receiver_id: teacherId,
                        content: newMessage,
                })
                setNewMessage('')
                setDisabled(false)
        }

        const openSubmissionView = (assignment: TAssignment) => {
                if (assignment.status === 'graded') {
                        setSelectedAssignment(assignment)
                } else {
                        setSelectedAssignment(assignment)
                }
        }

        const getStatusIcon = (status: string) => {
                switch (status) {
                        case 'graded':
                                return <CheckCircle className='w-4 h-4' />
                        case 'submitted':
                                return <CheckCircle className='w-4 h-4' />
                        case 'pending':
                                return <Clock className='w-4 h-4' />
                        case 'missed':
                                return <XCircle className='w-4 h-4' />
                        default:
                                return <AlertCircle className='w-4 h-4' />
                }
        }

        const getStatusText = (status: string) => {
                switch (status) {
                        case 'graded':
                                return 'Graded'
                        case 'submitted':
                                return 'Submitted'
                        case 'pending':
                                return 'Pending'
                        case 'missed':
                                return 'Missed'
                        default:
                                return 'Unknown'
                }
        }

        const isAssignmentMissed = (assignment: TAssignment) => {
                const deadline = new Date(assignment.deadline)
                const now = new Date()
                return now > deadline && assignment.status === 'pending'
        }

        useEffect(() => {
                async function fetchUser() {
                        const {
                                data: { user },
                        } = await supabase.auth.getUser()
                        if (user) {
                                setTeacherId(user.user_metadata.teacherId as string)
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
                                        const { eventType: event, new: newRow, old: oldRow } = payload
                                        if (event == 'INSERT') {
                                                setMessages((prev) => [...prev, newRow] as TMessage[])
                                        }
                                        if (event == 'DELETE') {
                                                setMessages((prev) => prev.filter((messages) => messages.id !== oldRow.id))
                                        }
                                }
                        )
                        .subscribe()

                return () => {
                        supabase.removeChannel(channel)
                }
        }, [supabase.auth, supabase])

        useEffect(() => {
                const fetchMessages = async () => {
                        const { data: messages } = await supabase
                                .from('messages')
                                .select('*')
                                .or(`and(sender_id.eq.${userId},receiver_id.eq.${teacherId}),and(sender_id.eq.${teacherId},receiver_id.eq.${userId})`)
                                .order('created_at', { ascending: true })
                        setMessages(messages as TMessage[])
                }

                if (teacherId) fetchMessages()
        }, [teacherId, userId])
        useEffect(() => {
                const fetchAssignments = async () => {
                        const { data: assignments } = await supabase.from('assignments').select('*').eq('created_by', teacherId)
                        if (assignments) {
                                const updatedAssignments = assignments.map((assignment: TAssignment) => {
                                        if (isAssignmentMissed(assignment)) {
                                                return { ...assignment, status: 'missed' as const }
                                        }
                                        return assignment
                                })
                                setGrades(
                                        updatedAssignments
                                                .filter((assignment) => assignment.teacher_grade)
                                                .map((assignment) => ({ subject: assignment.subject, grade: assignment.teacher_grade, date: assignment.deadline, assignment: assignment.title }))
                                )
                                setAssignments(updatedAssignments as TAssignment[])
                        }
                }

                if (teacherId) fetchAssignments()
        }, [teacherId])
        const messagesEndRef = useRef<HTMLDivElement>(null)
        useEffect(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, [messages])

        return (
                <>
                        <TabsContent
                                value='deadlines'
                                className='space-y-4'
                        >
                                <div className='grid gap-3'>
                                        {assignments.length ? (
                                                assignments.map((assignment) => (
                                                        <Fragment key={assignment.id}>
                                                                <Card className='gap-0 max-[425px]:py-4'>
                                                                        <CardHeader className='!pb-0 mb-0 max-[425px]:px-4'>
                                                                                <div className='flex flex-col gap-1'>
                                                                                        <CardTitle className='text-2xl font-bold leading-tight text-blue-900'>{assignment.title}</CardTitle>
                                                                                        <div className='text-sm text-gray-400 mt-0.5 mb-0.5'>{assignment.subject}</div>
                                                                                        <div className='text-lg font-medium text-gray-800 mb-1'>{assignment.description}</div>
                                                                                        <div className='flex items-center flex-wrap gap-1 mt-1'>
                                                                                                <Badge
                                                                                                        className={
                                                                                                                assignment.status === 'graded'
                                                                                                                        ? 'bg-green-100 text-green-800'
                                                                                                                        : assignment.status === 'submitted'
                                                                                                                        ? 'bg-blue-100 text-blue-800'
                                                                                                                        : assignment.status === 'pending'
                                                                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                                                                        : assignment.status === 'missed'
                                                                                                                        ? 'bg-red-100 text-red-800'
                                                                                                                        : ''
                                                                                                        }
                                                                                                        variant='secondary'
                                                                                                >
                                                                                                        {getStatusIcon(assignment.status)}
                                                                                                        <span className='ml-1'>{getStatusText(assignment.status)}</span>
                                                                                                </Badge>
                                                                                                {assignment.ai_grade && assignment.status !== 'graded' && (
                                                                                                        <Badge
                                                                                                                variant='outline'
                                                                                                                className='bg-blue-50 text-blue-700'
                                                                                                        >
                                                                                                                {assignment.ai_grade !== undefined && assignment.ai_grade !== null
                                                                                                                        ? `AI Score: ${assignment.ai_grade}`
                                                                                                                        : 'AI Score: Not scored'}
                                                                                                        </Badge>
                                                                                                )}
                                                                                                {assignment.teacher_grade && assignment.status === 'graded' && (
                                                                                                        <Badge
                                                                                                                variant='outline'
                                                                                                                className='bg-green-50 text-green-700'
                                                                                                        >
                                                                                                                Teacher Grade: {assignment.teacher_grade}
                                                                                                        </Badge>
                                                                                                )}
                                                                                        </div>
                                                                                </div>
                                                                        </CardHeader>
                                                                        <CardContent className='max-[425px]:px-4'>
                                                                                <div className='flex items-center justify-between flex-wrap gap-4 border-t pt-3 mt-2'>
                                                                                        <div className='flex items-center text-base font-medium text-gray-700'>
                                                                                                <Clock className='w-5 h-5 mr-2' />
                                                                                                Due:{' '}
                                                                                                {new Date(assignment.deadline).toLocaleDateString('en-UZ', {
                                                                                                        day: 'numeric',
                                                                                                        month: 'long',
                                                                                                        year: 'numeric',
                                                                                                })}
                                                                                        </div>
                                                                                        <div className='flex items-center space-x-2'>
                                                                                                {assignment.status === 'pending' && (
                                                                                                        <>
                                                                                                                <Input
                                                                                                                        type='file'
                                                                                                                        onChange={(e) => handleFileChange(e, assignment.id.toString())}
                                                                                                                        className='hidden'
                                                                                                                        id={`file-${assignment.id}`}
                                                                                                                        accept='image/*'
                                                                                                                        disabled={submittingAssignmentId === assignment.id.toString()}
                                                                                                                />
                                                                                                                <Button
                                                                                                                        variant='outline'
                                                                                                                        size='sm'
                                                                                                                        onClick={() => document.getElementById(`file-${assignment.id}`)?.click()}
                                                                                                                        disabled={submittingAssignmentId === assignment.id.toString()}
                                                                                                                >
                                                                                                                        <Upload className='w-4 h-4 mr-2' />
                                                                                                                        Upload Image
                                                                                                                </Button>
                                                                                                                <Button
                                                                                                                        size='sm'
                                                                                                                        onClick={async () => {
                                                                                                                                setSubmittingAssignmentId(assignment.id.toString())
                                                                                                                                await handleSubmitAssignment(assignment.id.toString())
                                                                                                                                setSubmittingAssignmentId(null)
                                                                                                                        }}
                                                                                                                        disabled={submittingAssignmentId === assignment.id.toString()}
                                                                                                                >
                                                                                                                        {submittingAssignmentId === assignment.id.toString() ? (
                                                                                                                                <span className='flex items-center'>
                                                                                                                                        <svg
                                                                                                                                                className='animate-spin h-4 w-4 mr-2 text-gray-500'
                                                                                                                                                xmlns='http://www.w3.org/2000/svg'
                                                                                                                                                fill='none'
                                                                                                                                                viewBox='0 0 24 24'
                                                                                                                                        >
                                                                                                                                                <circle
                                                                                                                                                        className='opacity-25'
                                                                                                                                                        cx='12'
                                                                                                                                                        cy='12'
                                                                                                                                                        r='10'
                                                                                                                                                        stroke='currentColor'
                                                                                                                                                        strokeWidth='4'
                                                                                                                                                ></circle>
                                                                                                                                                <path
                                                                                                                                                        className='opacity-75'
                                                                                                                                                        fill='currentColor'
                                                                                                                                                        d='M4 12a8 8 0 018-8v8z'
                                                                                                                                                ></path>
                                                                                                                                        </svg>
                                                                                                                                        Submitting...
                                                                                                                                </span>
                                                                                                                        ) : (
                                                                                                                                'Submit'
                                                                                                                        )}
                                                                                                                </Button>
                                                                                                        </>
                                                                                                )}
                                                                                                {assignment.status === 'submitted' && (
                                                                                                        <Button
                                                                                                                variant='outline'
                                                                                                                size='sm'
                                                                                                                onClick={() => openSubmissionView(assignment)}
                                                                                                        >
                                                                                                                <Eye className='w-4 h-4 mr-2' />
                                                                                                                Review
                                                                                                        </Button>
                                                                                                )}
                                                                                                {assignment.status === 'graded' && assignment.image_url && (
                                                                                                        <Button
                                                                                                                variant='outline'
                                                                                                                size='sm'
                                                                                                                onClick={() => openSubmissionView(assignment)}
                                                                                                        >
                                                                                                                <Eye className='w-4 h-4 mr-2' />
                                                                                                                View Submission
                                                                                                        </Button>
                                                                                                )}
                                                                                                {assignment.status === 'missed' && (
                                                                                                        <div className='text-sm text-red-600 font-medium'>Deadline passed</div>
                                                                                                )}
                                                                                        </div>
                                                                                </div>
                                                                                {selectedFiles[assignment.id] && (
                                                                                        <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                                                                                                <p className='text-sm text-gray-600 mb-2'>Selected file: {selectedFiles[assignment.id].name}</p>
                                                                                                <div
                                                                                                        className='p-4 rounded'
                                                                                                        style={{
                                                                                                                width: '100%',
                                                                                                                maxWidth: '800px',
                                                                                                                height: '400px',
                                                                                                                display: 'flex',
                                                                                                                alignItems: 'center',
                                                                                                                justifyContent: 'center',
                                                                                                                background: 'none',
                                                                                                        }}
                                                                                                >
                                                                                                        <Image
                                                                                                                src={previewUrls[assignment.id]}
                                                                                                                alt='Preview'
                                                                                                                className='rounded shadow'
                                                                                                                style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'none' }}
                                                                                                                width={800}
                                                                                                                height={400}
                                                                                                                unoptimized
                                                                                                        />
                                                                                                </div>
                                                                                        </div>
                                                                                )}
                                                                        </CardContent>
                                                                </Card>
                                                                {selectedAssignment && selectedAssignment.id === assignment.id && (
                                                                        <Card className='border-2 border-blue-200 bg-blue-50/30 max-[425px]:py-4'>
                                                                                <CardHeader className='max-[425px]:px-4'>
                                                                                        <CardTitle>Submission: {selectedAssignment.title}</CardTitle>
                                                                                        <CardDescription>Your submitted work</CardDescription>
                                                                                </CardHeader>
                                                                                <CardContent className='space-y-4 max-[425px]:px-4'>
                                                                                        {selectedAssignment.image_url ? (
                                                                                                <div>
                                                                                                        <h4 className='font-semibold mb-2'>Uploaded Image:</h4>
                                                                                                        <div
                                                                                                                className='p-4 rounded-lg'
                                                                                                                style={{
                                                                                                                        width: '100%',
                                                                                                                        maxWidth: '800px',
                                                                                                                        height: '400px',
                                                                                                                        display: 'flex',
                                                                                                                        alignItems: 'center',
                                                                                                                        justifyContent: 'center',
                                                                                                                        background: 'none',
                                                                                                                }}
                                                                                                        >
                                                                                                                <Image
                                                                                                                        src={selectedAssignment.image_url}
                                                                                                                        alt='Assignment submission'
                                                                                                                        className='rounded-lg shadow-sm'
                                                                                                                        style={{
                                                                                                                                width: '100%',
                                                                                                                                height: '100%',
                                                                                                                                objectFit: 'contain',
                                                                                                                                background: 'none',
                                                                                                                        }}
                                                                                                                        width={800}
                                                                                                                        height={400}
                                                                                                                />
                                                                                                        </div>
                                                                                                </div>
                                                                                        ) : (
                                                                                                <div className='text-center py-8 text-gray-500'>
                                                                                                        <ImageIcon className='w-12 h-12 mx-auto mb-2 text-gray-300' />
                                                                                                        <p>No image uploaded for this assignment</p>
                                                                                                </div>
                                                                                        )}

                                                                                        {selectedAssignment.ai_grade && selectedAssignment.status === 'submitted' && (
                                                                                                <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                                                                                                        <h4 className='font-semibold text-blue-800 mb-2'>AI Grade</h4>
                                                                                                        <p className='text-blue-700'>Grade: {selectedAssignment.ai_grade}/5</p>
                                                                                                        <p className='text-sm text-blue-600 mt-1'>Waiting for teacher review</p>
                                                                                                </div>
                                                                                        )}

                                                                                        {selectedAssignment.teacher_grade && selectedAssignment.status === 'graded' && (
                                                                                                <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                                                                                                        <h4 className='font-semibold text-green-800 mb-2'>Teacher Grade</h4>
                                                                                                        <p className='text-green-700'>Grade: {selectedAssignment.teacher_grade}/5</p>
                                                                                                        {selectedAssignment.feedback && (
                                                                                                                <div className='mt-2'>
                                                                                                                        <p className='text-sm font-medium text-green-700'>Feedback:</p>
                                                                                                                        <p className='text-green-600 mt-1'>{selectedAssignment.feedback}</p>
                                                                                                                </div>
                                                                                                        )}
                                                                                                </div>
                                                                                        )}

                                                                                        <div className='flex items-center space-x-2'>
                                                                                                <Button
                                                                                                        variant='outline'
                                                                                                        onClick={() => setSelectedAssignment(null)}
                                                                                                >
                                                                                                        Close
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
                                <Card className='h-120 max-[425px]:py-4'>
                                        <CardHeader className='max-[400px]:!pb-0 max-[425px]:px-4'>
                                                <CardTitle className='text-2xl'>Chat with Teachers</CardTitle>
                                                <CardDescription className='text-xs'>Get help and feedback from your instructors</CardDescription>
                                        </CardHeader>
                                        <CardContent className='flex flex-col h-full max-[425px]:px-3'>
                                                <ScrollArea className='flex-1 mb-5 max-[400px]:mb-3 max-[332px]:mb-8'>
                                                        <div className='space-y-4 h-93'>
                                                                {messages.map(({ id, sender_id, content, created_at }) => (
                                                                        <div
                                                                                key={id}
                                                                                className={`flex ${sender_id === userId ? 'justify-end' : 'justify-start'}`}
                                                                        >
                                                                                <div
                                                                                        className={`flex items-start space-x-2 max-w-xs ${
                                                                                                sender_id === 'student' ? 'flex-row-reverse space-x-reverse' : ''
                                                                                        }`}
                                                                                >
                                                                                        <Avatar className='w-8 h-8'>
                                                                                                <AvatarFallback>{sender_id !== userId ? 'T' : 'S'}</AvatarFallback>
                                                                                        </Avatar>
                                                                                        <div className={`p-3 rounded-lg ${sender_id === userId ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                                                                                                <p className='text-sm'>{content}</p>
                                                                                                <p className={`text-xs mt-1 ${sender_id === userId ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                                                        {new Date(created_at).toLocaleTimeString([], {
                                                                                                                hour: '2-digit',
                                                                                                                minute: '2-digit',
                                                                                                                second: undefined,
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
                                                <div className='flex items-center space-x-2 pb-5'>
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
                                value='transcript'
                                className='space-y-4'
                        >
                                <Card className='max-[425px]:py-4'>
                                        <CardHeader className='max-[425px]:px-4'>
                                                <CardTitle>Academic Transcript</CardTitle>
                                                <CardDescription>Your complete grades history</CardDescription>
                                        </CardHeader>
                                        <CardContent className='max-[425px]:px-4'>
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
                                                                                <p className='text-sm text-gray-500'>
                                                                                        {new Date(grade.date).toLocaleDateString('en-UZ', {
                                                                                                day: 'numeric',
                                                                                                month: 'long',
                                                                                                year: 'numeric',
                                                                                        })}
                                                                                </p>
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
