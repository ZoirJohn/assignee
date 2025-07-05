'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock, Upload, Send, AlertCircle, CheckCircle, XCircle, Eye, Image as ImageIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TabsContent } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { TMessage } from '@/definitions'

const assignments = [
        {
                id: 1,
                title: 'Essay: Climate Change Impact',
                subject: 'Environmental Science',
                dueDate: '2025-01-25',
                status: 'pending',
                description: 'Write a 1000-word essay on climate change impacts',
                imageUrl: null,
        },
        {
                id: 2,
                title: 'Math Problem Set #5',
                subject: 'Calculus',
                dueDate: '2025-01-20',
                status: 'graded',
                grade: 4,
                description: 'Solve problems 1-15 from chapter 8',
                imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
        },
        {
                id: 3,
                title: 'History Research Paper',
                subject: 'World History',
                dueDate: '2025-01-15',
                status: 'missed',
                description: 'Research paper on World War II causes',
                imageUrl: null,
        },
        {
                id: 4,
                title: 'Chemistry Lab Report',
                subject: 'Chemistry',
                dueDate: '2025-01-30',
                status: 'pending',
                description: 'Submit lab report for acid-base titration experiment',
                imageUrl: null,
        },
]

const grades = [
        { subject: 'Environmental Science', assignment: 'Essay: Renewable Energy', grade: 5, date: '2025-01-10' },
        { subject: 'Calculus', assignment: 'Problem Set #4', grade: 4, date: '2025-01-08' },
        { subject: 'World History', assignment: 'WWII Timeline', grade: 4, date: '2025-01-05' },
        { subject: 'Chemistry', assignment: 'Molecular Structures', grade: 5, date: '2025-01-03' },
]

export default function StudentTabs() {
        const supabase = createClient()
        const [selectedFile, setSelectedFile] = useState<File | null>(null)
        const [selectedAssignment, setSelectedAssignment] = useState<(typeof assignments)[0] | null>(null)
        const [messages, setMessages] = useState<TMessage[]>([])
        const [newMessage, setNewMessage] = useState<string>('')
        const [userId, setUserId] = useState<string>('')
        const [currentUserId, setCurrentUserId] = useState<string>('')
        const [disabled, setDisabled] = useState<boolean>(false)

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0]
                if (file) {
                        // Check if file is an image
                        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
                        if (!validImageTypes.includes(file.type)) {
                                alert('Please select an image file (JPEG, PNG, WebP, GIF, or BMP)')
                                event.target.value = ''
                                return
                        }
                        setSelectedFile(file)
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

        const openSubmissionView = (assignment: (typeof assignments)[0]) => {
                if (selectedAssignment && selectedAssignment.id === assignment.id) {
                        setSelectedAssignment(null)
                } else {
                        setSelectedAssignment(assignment)
                }
        }

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

        useEffect(() => {
                async function fetchUser() {
                        const {
                                data: { user },
                        } = await supabase.auth.getUser()
                        if (user) {
                                setCurrentUserId(user.user_metadata.teacherId as string)
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
                                .or(`and(sender_id.eq.${userId},receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},receiver_id.eq.${userId})`)
                                .order('created_at', { ascending: true })
                        setMessages(messages as TMessage[])
                }

                if (currentUserId) fetchMessages()
        }, [currentUserId, userId])

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
                                                        <div key={assignment.id}>
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
                                                                                                {assignment.grade && (
                                                                                                        <Badge
                                                                                                                variant='outline'
                                                                                                                className='bg-blue-50 text-blue-700'
                                                                                                        >
                                                                                                                Grade: {assignment.grade}
                                                                                                        </Badge>
                                                                                                )}
                                                                                        </div>
                                                                                </div>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                                <div className='flex items-center justify-between flex-wrap gap-4 border-t pt-3 mt-2'>
                                                                                        <div className='flex items-center text-xs text-gray-400'>
                                                                                                <Clock className='w-4 h-4 mr-1' />
                                                                                                Due: {assignment.dueDate}
                                                                                        </div>
                                                                                        <div className='flex items-center space-x-2'>
                                                                                                {assignment.status === 'pending' && (
                                                                                                        <>
                                                                                                                <Input
                                                                                                                        type='file'
                                                                                                                        onChange={handleFileChange}
                                                                                                                        className='hidden'
                                                                                                                        id={`file-${assignment.id}`}
                                                                                                                        accept='image/*'
                                                                                                                />
                                                                                                                <Button
                                                                                                                        variant='outline'
                                                                                                                        size='sm'
                                                                                                                        onClick={() => document.getElementById(`file-${assignment.id}`)?.click()}
                                                                                                                >
                                                                                                                        <Upload className='w-4 h-4 mr-2' />
                                                                                                                        Upload Image
                                                                                                                </Button>
                                                                                                                <Button size='sm'>Submit</Button>
                                                                                                        </>
                                                                                                )}
                                                                                                {assignment.imageUrl && (
                                                                                                        <Button
                                                                                                                variant='outline'
                                                                                                                size='sm'
                                                                                                                onClick={() => openSubmissionView(assignment)}
                                                                                                        >
                                                                                                                <Eye className='w-4 h-4 mr-2' />
                                                                                                                View Submission
                                                                                                        </Button>
                                                                                                )}
                                                                                        </div>
                                                                                </div>
                                                                                {selectedFile && (
                                                                                        <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                                                                                                <p className='text-sm text-gray-600'>Selected file: {selectedFile.name}</p>
                                                                                        </div>
                                                                                )}
                                                                        </CardContent>
                                                                </Card>
                                                                {selectedAssignment && selectedAssignment.id === assignment.id && (
                                                                        <Card className='border-2 border-blue-200 bg-blue-50/30'>
                                                                                <CardHeader>
                                                                                        <CardTitle>Submission: {selectedAssignment.title}</CardTitle>
                                                                                        <CardDescription>Your submitted work</CardDescription>
                                                                                </CardHeader>
                                                                                <CardContent className='space-y-4'>
                                                                                        {selectedAssignment.imageUrl ? (
                                                                                                <div>
                                                                                                        <h4 className='font-semibold mb-2'>Uploaded Image:</h4>
                                                                                                        <div className='bg-white p-4 rounded-lg border'>
                                                                                                                <img
                                                                                                                        src={selectedAssignment.imageUrl}
                                                                                                                        alt='Assignment submission'
                                                                                                                        className='max-w-full h-auto rounded-lg shadow-sm'
                                                                                                                        style={{ maxHeight: '400px' }}
                                                                                                                />
                                                                                                        </div>
                                                                                                </div>
                                                                                        ) : (
                                                                                                <div className='text-center py-8 text-gray-500'>
                                                                                                        <ImageIcon className='w-12 h-12 mx-auto mb-2 text-gray-300' />
                                                                                                        <p>No image uploaded for this assignment</p>
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
                                                        </div>
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
                                <Card className='h-120 '>
                                        <CardHeader className='max-[400px]:!pb-0'>
                                                <CardTitle className='text-2xl'>Chat with Teachers</CardTitle>
                                                <CardDescription className='text-xs'>Get help and feedback from your instructors</CardDescription>
                                        </CardHeader>
                                        <CardContent className='flex flex-col h-full'>
                                                <ScrollArea className='flex-1 mb-2 max-[400px]:mb-3 h-40 max-[332px]:mb-4'>
                                                        <div className='space-y-4'>
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
                </>
        )
}
