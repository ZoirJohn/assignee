'use client';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Clock, Send, Eye, ArrowLeft, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { TabsContent } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { responseState, TAnswer, TAssignment, TMessage, TStudent, TTeacherTabs } from '@/definitions';
import { Label } from '../../../components/ui/label';
import Image from 'next/image';

export function TeacherTabs({ value }: { value: TTeacherTabs }) {
    const supabase = createClient();
    // State
    const [selectedAssignment, setSelectedAssignment] = useState<(TAnswer & { title: string }) | null>(null);
    const [gradeOverride, setGradeOverride] = useState<number>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isListOfUsersOpen, openListOfUsers] = useState<boolean>(true);
    const [disabled, setDisabled] = useState<boolean>();
    const [newMessage, setNewMessage] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Fetched Data
    const [{ data: messages, error: msgError, loading: msgLoading }, setMessages] = useState<responseState<TMessage[]>>({ data: [], error: '', loading: true });
    const [{ data: assignments, error: asgError, loading: asgLoading }, setAssignments] = useState<responseState<TAssignment[]>>({ data: [], error: '', loading: true });
    const [{ data: answers, error: aswError, loading: aswLoading }, setAnswers] = useState<responseState<TAnswer[]>>({ data: [], error: '', loading: true });
    const [{ id: currentUserId, full_name: currentUsername, avatar_url }, setCurrentUser] = useState<TStudent>({ id: '', full_name: '', avatar_url: '' });
    const [students, setStudents] = useState<TStudent[]>([]);
    const [userId, setUserId] = useState<string>();

    const handleGradeSubmission = useCallback(async () => {
        setIsSubmitting(true);
        if (!selectedAssignment) {
            setIsSubmitting(false);
            return;
        }
        try {
            await supabase
                .from('answers')
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
    }, [selectedAssignment, gradeOverride]);

    const openSubmissionReview = useCallback(
        (submission: TAnswer & { title: string }) => {
            if (selectedAssignment) {
                setSelectedAssignment(null);
            } else {
                setSelectedAssignment(submission);
            }
        },
        [selectedAssignment]
    );

    const handleSendMessage = useCallback(async () => {
        setDisabled(true);
        await supabase.from('messages').insert({
            sender_id: userId,
            receiver_id: currentUserId,
            content: newMessage,
        });
        setNewMessage('');
        setDisabled(false);
    }, [userId, currentUserId, newMessage]);

    const handleAssignmentData = useCallback(
        (id: string) => {
            let data = { title: '', subject: '' };
            if (!assignments) return data;
            for (let i = 0; i < assignments.length; i++) {
                if (assignments[i].id == id) {
                    data = { title: assignments[i].title, subject: assignments[i].subject };
                    break;
                }
            }
            return data;
        },
        [assignments]
    );

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

        const assignmentChannel = supabase
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

                    switch (eventType) {
                        case 'INSERT':
                            setAssignments((prev) => ({
                                ...prev,
                                data: [...(prev.data ?? []), newAssignment as TAssignment],
                            }));
                            break;

                        case 'UPDATE':
                            setAssignments((prev) => ({
                                ...prev,
                                data: (prev.data ?? []).map((asg) => (asg.id === newAssignment.id ? (newAssignment as TAssignment) : asg)),
                            }));
                            break;

                        case 'DELETE':
                            setAssignments((prev) => ({
                                ...prev,
                                data: (prev.data ?? []).filter((asg) => asg.id !== oldAssignment.id),
                            }));
                            break;
                    }
                }
            )
            .subscribe();

        const messagesChannel = supabase
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

                    switch (eventType) {
                        case 'INSERT':
                            setMessages((prev) => ({
                                ...prev,
                                data: [...(prev.data ?? []), newMessage as TMessage],
                            }));
                            break;

                        case 'UPDATE':
                            setMessages((prev) => ({
                                ...prev,
                                data: (prev.data ?? []).map((msg) => (msg.id === newMessage.id ? (newMessage as TMessage) : msg)),
                            }));
                            break;

                        case 'DELETE':
                            setMessages((prev) => ({
                                ...prev,
                                data: (prev.data ?? []).filter((msg) => msg.id !== oldMessage.id),
                            }));
                            break;
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(assignmentChannel);
            supabase.removeChannel(messagesChannel);
        };
    }, []);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!userId) return;
            try {
                const { data: students, error } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('teacher_id', userId);
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
        const fetchAssignments = async () => {
            if (!userId) return;
            const state: {
                data: TAssignment[];
                error: string;
                loading: boolean;
            } = { loading: false, data: [], error: '' };
            try {
                const { data, error } = await supabase.from('assignments').select('*').eq('created_by', userId);
                if (error) {
                    state.error = error.message;
                } else {
                    state.data = data;
                }
            } catch (error) {
                console.error(error);
                state.error = String(error);
            }
            setAssignments((prev) => ({ ...prev, ...state }));
        };
        const fetchAnswers = async () => {
            if (!userId) return;
            const state: {
                data: TAnswer[];
                error: string;
                loading: boolean;
            } = { loading: false, data: [], error: '' };
            try {
                const { data, error } = await supabase.from('answers').select('*, creator:profiles!inner(full_name)').eq('creator.teacher_id', userId);
                if (error) {
                    state.error = error.message;
                } else {
                    state.data = data;
                }
            } catch (error) {
                console.error(error);
                state.error = String(error);
            }
            setAnswers((prev) => ({ ...prev, ...state }));
        };
        fetchStudents();
        fetchAssignments();
        fetchAnswers();
    }, [userId]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentUserId || !userId) return;

            const state: {
                data: TMessage[];
                error: string;
                loading: boolean;
            } = { loading: false, data: [], error: '' };

            try {
                const { data, error } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${userId},receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},receiver_id.eq.${userId})`).order('sent_at', { ascending: true });

                if (error) {
                    state.error = error.message;
                } else {
                    state.data = data;
                }
            } catch (error) {
                console.error(error);
                state.error = String(error);
            }

            setMessages((prev) => ({ ...prev, ...state }));
        };

        fetchMessages();
        setDisabled(students.length == 0);
    }, [currentUserId, userId, students.length]);

    useEffect(() => {
        if (value == 'chat') {
            const id = requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
            return () => {
                cancelAnimationFrame(id);
            };
        }
    }, [messages, value]);
    if (asgError ?? msgError ?? aswError) {
        return <></>;
    }
    return (
        <>
            <TabsContent value="assignments" className="space-y-4">
                <div className="grid gap-3 overflow-hidden">
                    {asgLoading ? (
                        <Loader className="text-black animate-spin [animation-duration:1.5s]" width={80} height={80} />
                    ) : assignments.length ? (
                        assignments.map((assignment, idx) => (
                            <Card className="gap-0 max-[425px]:py-4 border" key={idx}>
                                <CardHeader className="max-[425px]:px-4">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle className="text-2xl font-bold leading-tight text-blue-900">{assignment.title}</CardTitle>
                                        <div className="text-sm text-gray-400 mt-0.5 mb-0.5">{assignment.subject}</div>
                                        <div className="text-lg font-medium text-gray-800 mb-1">{assignment.description}</div>
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
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <h1 className="text-gray-600">No assignments found</h1>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="chat" className="space-y-4">
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
                                                    <Image src={avatar_url} alt="avatar" width={40} height={40} />
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
                                                        <Image src={student.avatar_url} alt="avatar" width={40} height={40} />
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
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <></>
                                )}
                                <div ref={messagesEndRef} className="h-0" />
                            </div>
                        </ScrollArea>
                        <ScrollArea className={`xl:col-start-2 xl:col-end-5 md:col-start-2 md:col-end-4 flex-1 mb-5 ${isListOfUsersOpen ? 'max-md:hidden' : ''}`}>
                            <div className="space-y-4 lg:h-145 sm:h-95 h-85 pl-1">
                                {!currentUserId ? (
                                    <></>
                                ) : msgLoading ? (
                                    <div className="flex h-full items-center justify-center">
                                        <Loader className="text-black animate-spin [animation-duration:1.5s]" width={80} height={80} />
                                    </div>
                                ) : messages ? (
                                    messages.map(({ id, sender_id, sent_at, content }) => (
                                        <div key={id} className={`flex ${sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex items-start space-x-2 sm:max-w-sm max-w-64 ${sender_id === userId ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>{sender_id === userId ? 'T' : 'S'}</AvatarFallback>
                                                </Avatar>
                                                <div className={`p-2 rounded-lg ${sender_id === userId ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                                                    <p className="sm:text-lg text-sm font-medium leading-6">{content}</p>
                                                    <p className={`text-xs sm:mt-2 mt-1 ${sender_id === userId ? 'text-blue-100 text-right' : 'text-gray-500 text-left'}`}>
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
                                    <h1 className="text-gray-600">No messages found</h1>
                                )}
                                <div ref={messagesEndRef} className="h-0" />
                            </div>
                        </ScrollArea>

                        {currentUserId ? (
                            <div className="col-start-1 col-end-5 flex items-center space-x-2 pb-5">
                                <label htmlFor="chat-message-input" className="sr-only">
                                    Type your message
                                </label>
                                <Input id="chat-message-input" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} disabled={disabled} />
                                <Button size="sm" onClick={handleSendMessage} disabled={disabled}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <></>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="answers" className="space-y-4">
                {aswLoading ? (
                    <Loader className="text-black animate-spin [animation-duration:1.5s]" width={80} height={80} />
                ) : answers?.length == 0 ? (
                    <h1 className="text-gray-600">No answers found</h1>
                ) : (
                    <div>
                        {answers.map((answer, idx) => {
                            const { title, subject } = handleAssignmentData(answer.assignment_id);
                            return (
                                <Fragment key={idx}>
                                    <Card className="gap-0 max-[425px]:py-4 border" key={idx}>
                                        <CardHeader className="max-[425px]:px-4">
                                            <div className="flex flex-col gap-1">
                                                <CardTitle className="text-2xl font-bold leading-tight text-blue-900">{title}</CardTitle>

                                                <div className="text-sm text-gray-400 mt-0.5 mb-0.5">{subject}</div>

                                                <div className="text-lg font-medium text-gray-800 mb-1">
                                                    By <span className="font-semibold text-gray-900">{answer.creator.full_name}</span>
                                                </div>

                                                <div className="flex items-center flex-wrap gap-1 mt-1">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 text-sm rounded-full px-2 py-1">
                                                        AI Score: {answer.ai_grade ? `${answer.ai_grade}/5` : 'Not scored'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="max-[425px]:px-4">
                                            <div className="flex items-center justify-between flex-wrap gap-4 border-t pt-3 mt-2">
                                                <div>
                                                    <Button variant="outline" onClick={() => openSubmissionReview({ ...answer, title })}>
                                                        <Eye className="w-4 h-4" />
                                                        Check
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {selectedAssignment && selectedAssignment.id === answer.id && (
                                        <Card className="mt-4 border-2 border-blue-200 bg-blue-50/30 rounded-lg overflow-hidden">
                                            <CardHeader>
                                                <CardTitle>Review: {selectedAssignment.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2">Extracted Text:</h4>
                                                    <div className="bg-white p-4 rounded-lg max-h-32 overflow-y-auto">
                                                        <p className="text-lg">{selectedAssignment.answer_text || 'No text extracted.'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="block text-sm font-medium mb-2">AI Grade</Label>
                                                        <Input type="number" value={selectedAssignment.ai_grade ?? ''} readOnly className="bg-gray-100 cursor-not-allowed" />
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
                                                            readOnly={selectedAssignment.ai_grade == null}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">Your grade for this assignment (out of 5)</p>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <Label className="block text-sm font-medium mb-2" htmlFor="feedback">
                                                            Feedback
                                                        </Label>
                                                        <Textarea id="feedback" placeholder="Enter feedback for the student..." className="min-h-20 max-h-40" value={selectedAssignment.feedback || ''} onChange={(e) => setSelectedAssignment(selectedAssignment ? { ...selectedAssignment, feedback: e.target.value } : null)} readOnly={selectedAssignment.ai_grade == null} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Button onClick={handleGradeSubmission} disabled={selectedAssignment.ai_grade == null || isSubmitting}>
                                                        {isSubmitting ? 'Submitting...' : 'Confirm Grade'}
                                                    </Button>
                                                    <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </Fragment>
                            );
                        })}
                    </div>
                )}
            </TabsContent>
            <TabsContent value="feedback" className="space-y-4">
                {answers.length ? (
                    <Card className="max-[425px]:py-4">
                        <CardHeader className="max-[425px]:px-4">
                            <CardTitle>Recent Feedback Given</CardTitle>
                            <CardDescription>Track the feedback you&apos;ve provided to students</CardDescription>
                        </CardHeader>
                        {answers.map(({ id, feedback }, idx) => (
                            <CardContent className="max-[425px]:px-4" key={idx}>
                                <div className="space-y-4">
                                    <div key={id} className="p-4 rounded-lg w-full border grid grid-cols-2 max-[425px]:grid-cols-3">
                                        <div className="max-[425px]:col-span-2">
                                            <h4 className="font-semibold text-xl">Student </h4>
                                            <p className="text-sm text-gray-600"></p>
                                        </div>
                                        <div className="flex items-start justify-end">
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{/* {teacher_grade}/{5} */}</Badge>
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
