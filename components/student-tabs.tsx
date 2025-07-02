'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock, Upload, Send, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TabsContent } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { TMessage } from '@/definitions'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { ScrollAreaViewport } from '@radix-ui/react-scroll-area'

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

const grades = [
        { subject: 'Environmental Science', assignment: 'Essay: Renewable Energy', grade: 'A', date: '2025-01-10' },
        { subject: 'Calculus', assignment: 'Problem Set #4', grade: 'B+', date: '2025-01-08' },
        { subject: 'World History', assignment: 'WWII Timeline', grade: 'A-', date: '2025-01-05' },
        { subject: 'Chemistry', assignment: 'Molecular Structures', grade: 'A', date: '2025-01-03' },
]

export default function StudentTabs() {
        const supabase = createClient()
        const [selectedFile, setSelectedFile] = useState<File | null>(null)
        const [messages, setMessages] = useState<TMessage[]>([])
        const [newMessage, setNewMessage] = useState<string>('')
        const [userId, setUserId] = useState<string>('')
        const [currentUserId, setCurrentUserId] = useState<string>('')
        const [disabled, setDisabled] = useState<boolean>(false)
        const [status, setStatus] = useState(false)

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0]
                if (file) {
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
                        setCurrentUserId(user?.user_metadata.teacherId)
                        setUserId(user?.id!)
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
                        .subscribe((status) => console.log(status))

                return () => {
                        supabase.removeChannel(channel)
                }
        }, [])
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
                </>
        )
}
