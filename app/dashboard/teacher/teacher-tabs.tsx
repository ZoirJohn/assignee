'use client';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Clock, Send, Eye, ArrowLeft, Loader, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { TabsContent } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { responseState, TAnswer, TAssignment, TMessage, TStudent, TTabs } from '@/definitions';
import { Label } from '../../../components/ui/label';
import Image from 'next/image';

export function TeacherTabs({ value }: { value: TTabs }) {
    const supabase = createClient();
    
    // State
    const [selectedAssignment, setSelectedAssignment] = useState<(TAnswer & { title: string }) | null>(null);
    const [gradeOverride, setGradeOverride] = useState<number>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isListOfUsersOpen, openListOfUsers] = useState<boolean>(true);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [newMessage, setNewMessage] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Fetched Data
    const [{ data: messages, error: msgError, loading: msgLoading }, setMessages] = useState<responseState<TMessage[]>>({ data: [], error: '', loading: true });
    const [{ data: assignments, error: asgError, loading: asgLoading }, setAssignments] = useState<responseState<TAssignment[]>>({ data: [], error: '', loading: true });
    const [{ data: answers, error: aswError, loading: aswLoading }, setAnswers] = useState<responseState<TAnswer[]>>({ data: [], error: '', loading: true });
    const [{ id: currentUserId, full_name: currentUsername, avatar_url }, setCurrentUser] = useState<TStudent>({ id: '', full_name: '', avatar_url: '' });
    const [students, setStudents] = useState<TStudent[]>([]);
    const [userId, setUserId] = useState<string>('');

    const handleGradeSubmission = useCallback(async () => {
        if (!selectedAssignment) return;
        
        setIsSubmitting(true);
        try {
            await supabase
                .from('answers')
                .update({
                    teacher_grade: gradeOverride || selectedAssignment.ai_grade,
                    status: 'graded',
                    feedback: selectedAssignment.feedback,
                })
                .eq('id', selectedAssignment.id);
            
            // Refresh answers after successful submission
            await fetchAnswers();
        } catch (error) {
            console.error('Grade submission failed:', error);
        } finally {
            setGradeOverride(undefined);
            setSelectedAssignment(null);
            setIsSubmitting(false);
        }
    }, [selectedAssignment, gradeOverride]);

    const openSubmissionReview = useCallback(
        (submission: TAnswer & { title: string }) => {
            setSelectedAssignment(selectedAssignment?.id === submission.id ? null : submission);
        },
        [selectedAssignment]
    );

    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim()) return;
        
        setDisabled(true);
        try {
            await supabase.from('messages').insert({
                sender_id: userId,
                receiver_id: currentUserId,
                content: newMessage,
            });
            setNewMessage('');
        } catch (error) {
            console.error('Message send failed:', error);
        } finally {
            setDisabled(false);
        }
    }, [userId, currentUserId, newMessage]);

    const getAssignmentData = useCallback(
        (id: string) => {
            const assignment = assignments.find(asg => asg.id === id);
            return assignment ? { title: assignment.title, subject: assignment.subject } : { title: 'Unknown Assignment', subject: '' };
        },
        [assignments]
    );

    const fetchAnswers = useCallback(async () => {
        if (!userId) return;
        
        const state: responseState<TAnswer[]> = { loading: false, data: [], error: '' };
        
        try {
            const { data, error } = await supabase
                .from('answers')
                .select('*, creator:profiles!inner(full_name)')
                .eq('creator.teacher_id', userId);
                
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
    }, [userId]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const { claims } = (await supabase.auth.getClaims()).data || {};
                if (claims) {
                    setUserId(claims.sub);
                }
            } catch (error) {
                console.error(error);
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

        const answersChannel = supabase
            .channel('realtime-answers-update')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'answers',
                },
                (payload) => {
                    const { eventType, new: newAnswer, old: oldAnswer } = payload;

                    switch (eventType) {
                        case 'INSERT':
                            setAnswers((prev) => ({
                                ...prev,
                                data: [...(prev.data ?? []), newAnswer as TAnswer],
                            }));
                            break;

                        case 'UPDATE':
                            setAnswers((prev) => ({
                                ...prev,
                                data: (prev.data ?? []).map((ans) => (ans.id === newAnswer.id ? (newAnswer as TAnswer) : ans)),
                            }));
                            break;

                        case 'DELETE':
                            setAnswers((prev) => ({
                                ...prev,
                                data: (prev.data ?? []).filter((ans) => ans.id !== oldAnswer.id),
                            }));
                            break;
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(assignmentChannel);
            supabase.removeChannel(messagesChannel);
            supabase.removeChannel(answersChannel);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            const fetchStudents = async () => {
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
                }
            };

            const fetchAssignments = async () => {
                const state: responseState<TAssignment[]> = { loading: false, data: [], error: '' };
                
                try {
                    const { data, error } = await supabase
                        .from('assignments')
                        .select('*')
                        .eq('created_by', userId);
                        
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

            await Promise.all([fetchStudents(), fetchAssignments(), fetchAnswers()]);
        };

        fetchData();
    }, [userId, fetchAnswers]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentUserId || !userId) return;

            const state: responseState<TMessage[]> = { loading: false, data: [], error: '' };

            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`and(sender_id.eq.${userId},receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},receiver_id.eq.${userId})`)
                    .order('sent_at', { ascending: true });

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
        setDisabled(students.length === 0);
    }, [currentUserId, userId, students.length]);

    useEffect(() => {
        if (value === 'chat') {
            const id = requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
            return () => {
                cancelAnimationFrame(id);
            };
        }
    }, [messages, value]);

    if (asgError || msgError || aswError) {
        return <></>;
    }

    return (
        <>
            <TabsContent value="assignments" className="space-y-4">
                <div className="grid gap-3 overflow-hidden">
                    {asgLoading ? (
                        <Loader className="text-black animate-spin [animation-duration:1.5s]" width={80} height={80} />
                    ) : assignments.length ? (
                        assignments.map((assignment) => (
                            <Card className="gap-0 max-[425px]:py-4 border" key={assignment.id}>
                                <CardHeader className="max-[425px]:px-4">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle className="text-2xl font-bold leading-tight text-blue-900">
                                            {assignment.title}
                                        </CardTitle>
                                        <div className="text-sm text-gray-400 mt-0.5 mb-0.5">
                                            {assignment.subject}
                                        </div>
                                        <div className="text-lg font-medium text-gray-800 mb-1">
                                            {assignment.description}
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
                                            {new Date() > new Date(assignment.deadline) && (
                                                <div className="text-sm text-red-600 font-medium">
                                                    Deadline passed
                                                </div>
                                            )}
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
                                        <CardDescription className="text-xs">
                                            Communicate with your students
                                        </CardDescription>
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
                                                hover:bg-gray-50 border-b last:border-b-0 text-left`}
                                        >
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
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {student.full_name}
                                                </p>
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
                                ) : messages.length ? (
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
                                <Input 
                                    id="chat-message-input" 
                                    placeholder="Type your message..." 
                                    value={newMessage} 
                                    onChange={(e) => setNewMessage(e.target.value)} 
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                                    disabled={disabled} 
                                />
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
                <div className="grid gap-3 overflow-hidden">
                    {aswLoading ? (
                        <Loader className="text-black animate-spin [animation-duration:1.5s]" width={80} height={80} />
                    ) : answers?.length === 0 ? (
                        <h1 className="text-gray-600">No answers found</h1>
                    ) : (
                        answers.map((answer) => {
                            const { title, subject } = getAssignmentData(answer.assignment_id);
                            return (
                                <Fragment key={answer.id}>
                                    <Card className="gap-0 max-[425px]:py-4 border">
                                        <CardHeader className="max-[425px]:px-4">
                                            <div className="flex flex-col gap-1">
                                                <CardTitle className="text-2xl font-bold leading-tight text-blue-900">
                                                    {title}
                                                </CardTitle>
                                                <div className="text-sm text-gray-400 mt-0.5 mb-0.5">
                                                    {subject}
                                                </div>
                                                <div className="text-lg font-medium text-gray-800 mb-1">
                                                    By <span className="font-semibold text-gray-900">{answer.creator.full_name}</span>
                                                </div>
                                                
                                                <div className="flex items-center flex-wrap gap-1 mt-1">
                                                    <Badge 
                                                        variant={answer.status === 'graded' ? 'default' : 'secondary'} 
                                                        className={`text-sm rounded-full px-2 py-1 ${
                                                            answer.status === 'graded' 
                                                                ? 'bg-green-50 text-green-700' 
                                                                : 'bg-blue-50 text-blue-700'
                                                        }`}
                                                    >
                                                        Status: {answer.status === 'graded' ? 'Graded' : 'Submitted'}
                                                    </Badge>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 text-sm rounded-full px-2 py-1">
                                                        AI Score: {answer.ai_grade ? `${answer.ai_grade}/5` : 'Not scored'}
                                                    </Badge>
                                                    {answer.teacher_grade && (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 text-sm rounded-full px-2 py-1">
                                                            Grade: {answer.teacher_grade}/5
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="max-[425px]:px-4">
                                            <div className="flex items-center justify-between flex-wrap gap-4 border-t pt-3 mt-2">
                                                <div className="flex items-center text-base font-medium text-gray-700">
                                                    Submitted: {new Date(answer.submitted_at).toLocaleDateString('en-UZ', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openSubmissionReview({ ...answer, title })}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Review Submission
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {selectedAssignment && selectedAssignment.id === answer.id && (
                                        <Card className="mt-4 border-2 border-blue-200 bg-blue-50/30 rounded-lg overflow-hidden">
                                            <CardHeader>
                                                <CardTitle>Review: {selectedAssignment.title}</CardTitle>
                                                <CardDescription>Grade and provide feedback for this submission</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {selectedAssignment.image_url ? (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Submitted Image:</h4>
                                                        <div className="w-full max-w-2xl h-96 flex items-center justify-center bg-white rounded-lg">
                                                            <Image
                                                                src={selectedAssignment.image_url}
                                                                alt="Student submission"
                                                                className="rounded-lg shadow-sm"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'contain',
                                                                }}
                                                                width={800}
                                                                height={400}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                        <p>No image uploaded for this assignment</p>
                                                    </div>
                                                )}

                                                {selectedAssignment.answer_text && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Extracted Text:</h4>
                                                        <div className="bg-white p-4 rounded-lg max-h-32 overflow-y-auto">
                                                            <p className="text-lg">{selectedAssignment.answer_text}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedAssignment.ai_grade && (
                                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                        <h4 className="font-semibold text-blue-800 mb-2">AI Assessment</h4>
                                                        <p className="text-blue-700">AI Grade: {selectedAssignment.ai_grade}/5</p>
                                                        <p className="text-sm text-blue-600 mt-1">Use this as a reference for your final grade</p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="block text-sm font-medium mb-2">Your Grade (2-5)</Label>
                                                        <Input
                                                            type="number"
                                                            max={5}
                                                            min={2}
                                                            step={1}
                                                            value={gradeOverride === undefined ? selectedAssignment.teacher_grade || '' : gradeOverride}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '' || ['2', '3', '4', '5'].includes(value)) {
                                                                    setGradeOverride(value === '' ? undefined : parseInt(value, 10));
                                                                }
                                                            }}
                                                            placeholder={`Enter grade (2-5) or use AI grade: ${selectedAssignment.ai_grade || 'N/A'}`}
                                                            readOnly={selectedAssignment.status=='graded'}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">Your final grade for this assignment</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="block text-sm font-medium mb-2" htmlFor="feedback">
                                                        Feedback
                                                    </Label>
                                                    <Textarea 
                                                        id="feedback" 
                                                        placeholder="Provide constructive feedback to help the student improve..." 
                                                        className="min-h-20 max-h-40" 
                                                        value={selectedAssignment.feedback || ''} 
                                                        onChange={(e) => setSelectedAssignment(selectedAssignment ? { ...selectedAssignment, feedback: e.target.value } : null)} 
                                                        readOnly={selectedAssignment.status=='graded'}
                                                    />
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                  {selectedAssignment.status !== 'graded' && (
                                                        <Button 
                                                            onClick={handleGradeSubmission} 
                                                            disabled={!selectedAssignment.ai_grade || isSubmitting}
                                                        >
                                                            {isSubmitting ? 'Submitting...' : 'Submit Grade & Feedback'}
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                                                        Close
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </Fragment>
                            );
                        })
                    )}
                </div>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
                {aswLoading ? (
                    <Loader className="text-black animate-spin [animation-duration:1.5s]" width={80} height={80} />
                ) : answers?.length === 0 ? (
                    <h1 className="text-gray-600">No feedback found</h1>
                ) : (
                    <Card className="max-[425px]:py-4">
                        <CardHeader className="max-[425px]:px-4">
                            <CardTitle>Recent Feedback Given</CardTitle>
                            <CardDescription>Track the feedback you&apos;ve provided to students</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="max-[425px]:px-4">
                            <div className="space-y-4">
                                {answers
                                    .filter(answer => answer.status === 'graded' && answer.feedback)
                                    .map((answer) => {
                                        const { title, subject } = getAssignmentData(answer.assignment_id);
                                        return (
                                            <div key={answer.id} className="p-4 rounded-lg w-full border grid grid-cols-2 max-[425px]:grid-cols-3">
                                                <div className="max-[425px]:col-span-2">
                                                    <h4 className="font-semibold text-xl">{title}</h4>
                                                    <p className="text-sm text-gray-600">{subject}</p>
                                                    <p className="text-sm text-gray-700 mt-1">
                                                        Student: <span className="font-medium">{answer.creator.full_name}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-start justify-end">
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        {answer.teacher_grade}/5
                                                    </Badge>
                                                </div>
                                                <div className="max-[425px]:col-span-3 col-span-2 mt-4">
                                                    <p className="text-sm">
                                                        <b>Feedback: </b>
                                                        {answer.feedback || 'No feedback provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
        </>
    );
}