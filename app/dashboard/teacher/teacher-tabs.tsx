'use client';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Clock, Send, Eye,  Pen, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { TabsContent } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { TAssignment, TMessage, TStudent } from '@/definitions';
import { Label } from '../../../components/ui/label';
import Image from 'next/image';

export function TeacherTabs() {
    const supabase = createClient();
    const [selectedAssignment, setSelectedAssignment] = useState<TAssignment | null>(null);
    const [gradeOverride, setGradeOverride] = useState<number>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [assignments, setAssignments] = useState<TAssignment[]>([]);
    const [students, setStudents] = useState<TStudent[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [{ id: currentUserId, full_name: currentUsername, avatar_url }, setCurrentUser] = useState<TStudent>({
        id: '',
        full_name: '',
        avatar_url: '',
    });
    const [userId, setUserId] = useState<string>();
    const [disabled, setDisabled] = useState<boolean>();
    const [isListOfUsersOpen, openListOfUsers] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleGradeSubmission = async () => {
        setIsSubmitting(true);
        if (!selectedAssignment) {
            setIsSubmitting(false);
            return;
        }
        try {
            await supabase
                .from('assignments')
                .update({
                    teacher_grade: gradeOverride || selectedAssignment.ai_grade,
                    status: 'graded',
                    feedback: selectedAssignment.feedback,
                })
                .eq('id', selectedAssignment.id)
                .select();
        } catch {
        } finally {
            setGradeOverride(undefined);
            setSelectedAssignment(null);
            setIsSubmitting(false);
        }
    };
    // const openSubmissionReview = (submission: TAssignment) => {
    //     if (selectedAssignment) {
    //         setSelectedAssignment(null);
    //     } else {
    //         setSelectedAssignment(submission);
    //     }
    // };
    const handleSendMessage = async () => {
        setDisabled(true);
        await supabase.from('messages').insert({
            sender_id: userId,
            receiver_id: currentUserId,
            content: newMessage,
        });
        setNewMessage('');
        setDisabled(false);
    };

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const { claims } = (await supabase.auth.getClaims()).data || {};
                if (claims) setUserId(claims.sub);
            } catch (error) {
                console.error(error);
                return;
            }
        };
        fetchUserId();
    }, []);

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
                    const { eventType, new: newMessage, old: oldMessage } = payload;
                    if (eventType === 'INSERT') {
                        setMessages((prev) => [...prev, newMessage] as TMessage[]);
                    }

                    if (eventType === 'DELETE') {
                        setMessages((prev) => prev.filter((msg) => msg.id !== oldMessage.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        const channel = supabase
            .channel('realtime-assignment-update')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'assignments',
                },
                (payload) => {
                    const { eventType, new: newAssignment, old: oldAssignment } = payload;
                    if (eventType === 'INSERT') {
                        setAssignments((prev) => [...prev, newAssignment] as TAssignment[]);
                    }

                    if (eventType === 'DELETE') {
                        setAssignments((prev) => prev.filter((asg) => asg.id !== oldAssignment.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!userId) return;
            try {
                const { data: students, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .eq('teacher_id', userId);

                if (error) {
                    console.error(error);
                    return;
                }

                setStudents(students as TStudent[]);
            } catch (error) {
                console.error(error);
                return;
            }
        };

        fetchStudents();
    }, [userId]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentUserId || !userId) return;
            try {
                const { data: messages, error } = await supabase
                    .from('messages')
                    .select('*')
                    .or(
                        `and(sender_id.eq.${userId}, receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},receiver_id.eq.${userId})`
                    )
                    .order('sent_at', { ascending: true });
                if (error) {
                    console.error(error);
                    return;
                }
                setMessages(messages as TMessage[]);
            } catch (error) {
                console.error(error);
                return;
            }
        };
        fetchMessages();
        setDisabled(students.length == 0);
    }, [currentUserId, userId, students.length]);

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!userId) return;
            try {
                const { data: assignments, error } = await supabase.from('assignments').select('*').eq('created_by', userId);
                if (error) {
                    console.error(error);
                    return;
                }
                console.log(assignments);
                setAssignments(assignments as TAssignment[]);
            } catch (error) {
                console.error(error);
                return;
            }
            setAssignments((prev) => [...prev, ...(assignments as TAssignment[])]);
        };
        fetchAssignments();
    }, [userId]);

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        return () => {
            cancelAnimationFrame(id);
        };
    }, [messages]);
    return (
        <>
            <TabsContent
                value="assignments"
                className="space-y-4">
                <div className="grid gap-3 overflow-hidden">
                    {assignments.length ? (
                        assignments.map((assignment) => (
                            <Fragment key={assignment.id}>
                                <Card className="gap-0 max-[425px]:py-4 border">
                                    <CardHeader className="max-[425px]:px-4">
                                        <div className="flex flex-col gap-1">
                                            <CardTitle className="text-2xl font-bold leading-tight text-blue-900">
                                                {assignment.title}
                                            </CardTitle>
                                            <div className="text-sm text-gray-400 mt-0.5 mb-0.5">{assignment.subject}</div>
                                            <div className="text-lg font-medium text-gray-800 mb-1">{assignment.description}</div>
                                            <div className="flex items-center flex-wrap gap-1 mt-1">
                                                {/* <Badge
                                                    className={cn(
                                                        assignment.status === 'graded' && 'bg-green-100 text-green-800',
                                                        assignment.status === 'submitted' && 'bg-blue-100 text-blue-800',
                                                        assignment.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                                                        assignment.status === 'missed' && 'bg-red-100 text-red-800',
                                                        'text-sm rounded-full'
                                                    )}
                                                    variant="secondary">
                                                    {assignment.status === 'graded' ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Graded
                                                        </>
                                                    ) : assignment.status === 'submitted' ? (
                                                        <>
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            Submitted
                                                        </>
                                                    ) : assignment.status === 'pending' ? (
                                                        <>
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            Pending
                                                        </>
                                                    ) : assignment.status === 'missed' ? (
                                                        <>
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Missed
                                                        </>
                                                    ) : null}
                                                </Badge> */}
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-50 text-blue-700 text-sm rounded-full">
                                                    {assignment.ai_grade !== undefined && assignment.teacher_grade !== null
                                                        ? `Score: ${assignment.teacher_grade}`
                                                        : assignment.ai_grade
                                                        ? `AI Score: ${assignment.ai_grade}`
                                                        : 'AI Score: Not scored'}
                                                </Badge>
                                                {assignment.teacher_grade && (
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        Graded:
                                                        {new Date().toLocaleDateString([], {
                                                            day: 'numeric',
                                                            month: 'long',
                                                        })}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="max-[425px]:px-4">
                                        <div className="flex items-center justify-between flex-wrap gap-4 border-t pt-3 mt-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center text-base font-medium text-gray-700">
                                                    <Clock className="w-5 h-5 mr-2" />
                                                    Due:{' '}
                                                    {new Date(assignment.deadline).toLocaleDateString('en-UZ', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => console.log('REVIEW')}>
                                                    {/* onClick={() => openSubmissionReview(assignment)}> */}
                                                    {assignment.status == 'graded' ? (
                                                        <Pen />
                                                    ) : (
                                                        <>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Review
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                {selectedAssignment && selectedAssignment.id === assignment.id && (
                                    <Card className="border-2 border-blue-200 bg-blue-50/30">
                                        <CardHeader>
                                            <CardTitle>Review: {selectedAssignment.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold mb-2">Extracted Text:</h4>
                                                <div className="bg-gray-50 p-4 rounded-lg max-h-32 overflow-y-auto">
                                                    <p className="text-lg">{selectedAssignment.extracted_text}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="block text-sm font-medium mb-2">AI Grade</Label>
                                                    <Input
                                                        type="number"
                                                        value={selectedAssignment.ai_grade ?? ''}
                                                        readOnly
                                                        className="bg-gray-100 cursor-not-allowed"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">This is the AI-predicted grade (out of 5)</p>
                                                </div>
                                                <div>
                                                    <Label className="block text-sm font-medium mb-2">Grade</Label>
                                                    <Input
                                                        type="number"
                                                        max={5}
                                                        min={2}
                                                        step={1}
                                                        value={gradeOverride === undefined ? '' : gradeOverride}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === '' || ['2', '3', '4', '5'].includes(value)) {
                                                                setGradeOverride(value === '' ? undefined : parseInt(value, 10));
                                                            }
                                                        }}
                                                        placeholder="Enter grade (2-5)"
                                                        readOnly={selectedAssignment.ai_grade == undefined}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Your grade for this assignment (out of 5)</p>
                                                </div>
                                                <div>
                                                    <Label
                                                        className="block text-sm font-medium mb-2"
                                                        htmlFor="feedback">
                                                        Feedback
                                                    </Label>
                                                    <Textarea
                                                        id="feedback"
                                                        placeholder="Enter feedback for the student..."
                                                        className="min-h-20 max-h-40"
                                                        value={selectedAssignment.feedback || ''}
                                                        onChange={(e) =>
                                                            setSelectedAssignment(
                                                                selectedAssignment
                                                                    ? {
                                                                          ...selectedAssignment,
                                                                          feedback: e.target.value,
                                                                      }
                                                                    : selectedAssignment
                                                            )
                                                        }
                                                        readOnly={selectedAssignment.ai_grade == undefined}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    onClick={handleGradeSubmission}
                                                    disabled={selectedAssignment.ai_grade == undefined || isSubmitting}>
                                                    {isSubmitting ? 'Submitting...' : 'Confirm Grade'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setSelectedAssignment(null)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <h1 className="text-gray-600">No assignments found</h1>
                    )}
                </div>
            </TabsContent>
            <TabsContent
                value="chat"
                className="space-y-4">
                <Card className="lg:h-170 sm:h-120 h-110">
                    <CardHeader className="max-[400px]:!pb-0 flex">
                        <div>
                            {students.length ? (
                                <>
                                    <div className={`md:block ${!isListOfUsersOpen ? 'hidden' : 'block'}`}>
                                        <CardTitle className="text-2xl">Student Messages</CardTitle>
                                        <CardDescription className="text-xs">Communicate with your students</CardDescription>
                                    </div>
                                    <div className={`items-center gap-4 md:hidden py-1 ${isListOfUsersOpen ? 'hidden' : 'flex'}`}>
                                        <ArrowLeft
                                            onClick={() => {
                                                setCurrentUser({ id: '', full_name: '', avatar_url: '' });
                                                openListOfUsers(true);
                                            }}
                                        />

                                        <Avatar className="h-10 w-10 bg-gray-400">
                                            <AvatarFallback className="bg-gray-400">
                                                {avatar_url ? (
                                                    <Image
                                                        src={avatar_url}
                                                        alt="avatar"
                                                        width={40}
                                                        height={40}
                                                    />
                                                ) : (
                                                    currentUsername
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <CardTitle className="text-2xl">Please wait until your students arrive</CardTitle>
                                    <CardDescription className="text-xs">Let them register here</CardDescription>
                                </>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="md:grid xl:grid-cols-4 md:grid-cols-3">
                        <ScrollArea className={`flex-1 mb-5 ${isListOfUsersOpen ? '' : 'max-md:hidden'}`}>
                            <div className="lg:h-145 sm:h-95 h-85">
                                {students.length ? (
                                    students.map((student) => (
                                        <button
                                            key={student.id}
                                            onClick={() => {
                                                setCurrentUser({
                                                    id: student.id,
                                                    full_name: student.full_name,
                                                    avatar_url: student.avatar_url,
                                                });
                                                openListOfUsers(false);
                                            }}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors duration-200 cursor-pointer
                        ${currentUserId === student.id ? 'bg-gray-100' : 'bg-white'}
                        hover:bg-gray-50 border-b last:border-b-0 text-left`}>
                                            <Avatar className="h-10 w-10 bg-gray-400">
                                                <AvatarFallback className="bg-gray-400">
                                                    {student.avatar_url ? (
                                                        <Image
                                                            src={student.avatar_url}
                                                            alt="avatar"
                                                            width={40}
                                                            height={40}
                                                        />
                                                    ) : (
                                                        student.full_name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{student.full_name}</p>
                                                {/* <p className="text-xs text-gray-500">{student.lastSeen}</p> */}
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <></>
                                )}
                                <div
                                    ref={messagesEndRef}
                                    className="h-0"
                                />
                            </div>
                        </ScrollArea>
                        <ScrollArea
                            className={`xl:col-start-2 xl:col-end-5 md:col-start-2 md:col-end-4 flex-1 mb-5 ${
                                isListOfUsersOpen ? 'max-md:hidden' : ''
                            }`}>
                            <div className="space-y-4 lg:h-145 sm:h-95 h-85 pl-1">
                                {messages.length ? (
                                    messages.map(({ id, sender_id, sent_at, content }) => (
                                        <div
                                            key={id}
                                            className={`flex ${sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`flex items-start space-x-2 sm:max-w-sm max-w-64 ${
                                                    sender_id === userId ? 'flex-row-reverse space-x-reverse' : ''
                                                }`}>
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>{sender_id === userId ? 'T' : 'S'}</AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={`p-2 rounded-lg ${
                                                        sender_id === userId ? 'bg-blue-600 text-white' : 'bg-gray-100'
                                                    }`}>
                                                    <p className="sm:text-lg text-sm font-medium leading-6">{content}</p>
                                                    <p
                                                        className={`text-xs sm:mt-2 mt-1 ${
                                                            sender_id === userId ? 'text-blue-100 text-right' : 'text-gray-500 text-left'
                                                        }`}>
                                                        {new Date(sent_at).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <></>
                                )}
                                <div
                                    ref={messagesEndRef}
                                    className="h-0"
                                />
                            </div>
                        </ScrollArea>

                        <div className="col-start-1 col-end-5 flex items-center space-x-2 pb-5">
                            <label
                                htmlFor="chat-message-input"
                                className="sr-only">
                                Type your message
                            </label>
                            <Input
                                id="chat-message-input"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                disabled={disabled}
                            />
                            <Button
                                size="sm"
                                onClick={handleSendMessage}
                                disabled={disabled}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent
                value="feedback"
                className="space-y-4">
                {assignments.length ? (
                    <Card className="max-[425px]:py-4">
                        <CardHeader className="max-[425px]:px-4">
                            <CardTitle>Recent Feedback Given</CardTitle>
                            <CardDescription>Track the feedback you&apos;ve provided to students</CardDescription>
                        </CardHeader>
                        {assignments.map(({ id, title, teacher_grade, feedback }, idx) => (
                            <CardContent
                                className="max-[425px]:px-4"
                                key={idx}>
                                <div className="space-y-4">
                                    <div
                                        key={id}
                                        className="p-4 rounded-lg w-full border grid grid-cols-2 max-[425px]:grid-cols-3">
                                        <div className="max-[425px]:col-span-2">
                                            <h4 className="font-semibold text-xl">Student </h4>
                                            <p className="text-sm text-gray-600">{title}</p>
                                        </div>
                                        <div className="flex items-start justify-end">
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                {teacher_grade}/{5}
                                            </Badge>
                                        </div>
                                        <div className="[425px]:col-span-2 col-span-3 mt-4">
                                            <p className="text-sm">
                                                <b>Feedback: </b>
                                                {feedback || 'No feedback yet'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        ))}
                    </Card>
                ) : (
                    <h1 className="text-gray-600">No feedback found</h1>
                )}
            </TabsContent>
        </>
    );
}
