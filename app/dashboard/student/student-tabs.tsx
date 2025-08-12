'use client';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Clock, Send, Eye, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TabsContent } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { responseState, TAnswer, TAssignment, TMessage, TTabs } from '@/definitions';
import { submitAssignment } from '@/lib/space/submitAssignment';
import Image from 'next/image';

export function StudentTabs({ value }: { value: TTabs }) {
    const supabase = createClient();
    
    // State
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
    const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});
    const [selectedAnswer, setSelectedAnswer] = useState<(TAnswer & { title: string }) | null>(null);
    const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const [disabled, setDisabled] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Fetched Data
    const [{ data: messages, error: msgError, loading: msgLoading }, setMessages] = useState<responseState<TMessage[]>>({ data: [], error: '', loading: true });
    const [{ data: assignments, error: asgError, loading: asgLoading }, setAssignments] = useState<responseState<TAssignment[]>>({ data: [], error: '', loading: true });
    const [{ data: answers, error: aswError, loading: aswLoading }, setAnswers] = useState<responseState<TAnswer[]>>({ data: [], error: '', loading: true });
    const [userId, setUserId] = useState<string>('');
    const [teacherId, setTeacherId] = useState<string>('');

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, assignmentId: string) => {
        const file = event.target.files?.[0];
        if (file) {
            const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
            if (!validImageTypes.includes(file.type)) {
                alert('Please select an image file (JPEG, PNG, WebP, GIF, or BMP)');
                event.target.value = '';
                return;
            }

            const previewUrl = URL.createObjectURL(file);

            setSelectedFiles((prev) => ({
                ...prev,
                [assignmentId]: file,
            }));

            setPreviewUrls((prev) => ({
                ...prev,
                [assignmentId]: previewUrl,
            }));
        }
    }, []);

    const handleSubmitAnswer = useCallback(async (assignment_id: string) => {
        const selectedFile = selectedFiles[assignment_id];
        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }

        const assignment = assignments.find(a => a.id === assignment_id);
        if (!assignment) return;

        setSubmittingAssignmentId(assignment_id);
        
        try {
            await submitAssignment({
                file: selectedFile,
                assignment_id,
                created_by: userId,
                assignmentName: assignment.title,
                question: assignment.description,
                subject: assignment.subject,
            });

            // Clean up file states
            setSelectedFiles((prev) => {
                const newFiles = { ...prev };
                delete newFiles[assignment_id];
                return newFiles;
            });
            
            setPreviewUrls((prev) => {
                const newUrls = { ...prev };
                if (newUrls[assignment_id]) {
                    URL.revokeObjectURL(newUrls[assignment_id]);
                    delete newUrls[assignment_id];
                }
                return newUrls;
            });

            const fileInput = document.getElementById(`file-${assignment_id}`) as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            // Refresh answers
            await fetchAnswers();
        } catch (error) {
            console.error('Submission failed:', error);
        } finally {
            setSubmittingAssignmentId(null);
        }
    }, [selectedFiles, assignments, userId]);

    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim()) return;
        
        setDisabled(true);
        try {
            await supabase.from('messages').insert({
                sender_id: userId,
                receiver_id: teacherId,
                content: newMessage,
            });
            setNewMessage('');
        } catch (error) {
            console.error('Message send failed:', error);
        } finally {
            setDisabled(false);
        }
    }, [userId, teacherId, newMessage]);

    const openSubmissionView = useCallback(
        (answer: TAnswer) => {
            const assignment = assignments.find(a => a.id === answer.assignment_id);
            if (assignment) {
                const answerWithTitle = { ...answer, title: assignment.title };
                setSelectedAnswer(selectedAnswer?.id === answer.id ? null : answerWithTitle);
            }
        },
        [selectedAnswer, assignments]
    );

    const getAnswerStatus = useCallback((assignmentId: string) => {
        return answers.find(answer => answer.assignment_id === assignmentId);
    }, [answers]);

    const fetchAnswers = useCallback(async () => {
        if (!userId) return;
        
        const state: responseState<TAnswer[]> = { loading: false, data: [], error: '' };
        
        try {
            const { data, error } = await supabase.from('answers').select('*').eq('created_by', userId);
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
                    setTeacherId(claims.user_metadata.teacherId);
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
            .channel('realtime-chat:student-teacher')
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
            if (!userId || !teacherId) return;

            const fetchMessages = async () => {
                const state: responseState<TMessage[]> = { loading: false, data: [], error: '' };

                try {
                    const { data, error } = await supabase
                        .from('messages')
                        .select('*')
                        .or(`and(sender_id.eq.${userId},receiver_id.eq.${teacherId}),and(sender_id.eq.${teacherId},receiver_id.eq.${userId})`)
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

            const fetchAssignments = async () => {
                const state: responseState<TAssignment[]> = { loading: false, data: [], error: '' };

                try {
                    const { data, error } = await supabase.from('assignments').select('*').eq('created_by', teacherId);
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

            await Promise.all([fetchMessages(), fetchAssignments(), fetchAnswers()]);
        };

        fetchData();
    }, [userId, teacherId, fetchAnswers]);

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
                        assignments.map((assignment) => {
                            const answer = getAnswerStatus(assignment.id);
                            const isDeadlinePassed = new Date() > new Date(assignment.deadline);
                            const canSubmit = !isDeadlinePassed && (!answer || (answer.status !== 'submitted' && answer.status !== 'graded'));

                            return (
                                <Fragment key={assignment.id}>
                                    <Card className="gap-0 max-[425px]:py-4 border">
                                        <CardHeader className="max-[425px]:px-4">
                                            <div className="flex flex-col gap-1">
                                                <CardTitle className="text-2xl font-bold leading-tight text-blue-900">{assignment.title}</CardTitle>
                                                <div className="text-sm text-gray-400 mt-0.5 mb-0.5">{assignment.subject}</div>
                                                <div className="text-lg font-medium text-gray-800 mb-1">{assignment.description}</div>
                                                
                                                {answer && (
                                                    <div className="flex items-center flex-wrap gap-1 mt-1">
                                                        <Badge variant={answer.status === 'graded' ? 'default' : 'secondary'} 
                                                               className={`text-sm rounded-full px-2 py-1 ${
                                                                   answer.status === 'graded' 
                                                                       ? 'bg-green-50 text-green-700' 
                                                                       : 'bg-blue-50 text-blue-700'
                                                               }`}>
                                                            Status: {answer.status === 'graded' ? 'Graded' : 'Submitted'}
                                                        </Badge>
                                                        {answer.teacher_grade && (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 text-sm rounded-full px-2 py-1">
                                                                Grade: {answer.teacher_grade}/5
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
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
                                                    {isDeadlinePassed && (
                                                        <div className="text-sm text-red-600 font-medium">Deadline passed</div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {answer && (
                                                        <Button variant="outline" size="sm" onClick={() => openSubmissionView(answer)}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Submission
                                                        </Button>
                                                    )}
                                                    
                                                    {canSubmit && (
                                                        <>
                                                            <Input 
                                                                type="file" 
                                                                onChange={(e) => handleFileChange(e, assignment.id)} 
                                                                className="hidden" 
                                                                id={`file-${assignment.id}`} 
                                                                accept="image/*" 
                                                            />
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                onClick={() => document.getElementById(`file-${assignment.id}`)?.click()}
                                                            >
                                                                <Upload className="w-4 h-4 mr-2" />
                                                                Upload Image
                                                            </Button>
                                                            
                                                            {selectedFiles[assignment.id] && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleSubmitAnswer(assignment.id)}
                                                                    disabled={submittingAssignmentId === assignment.id}
                                                                >
                                                                    {submittingAssignmentId === assignment.id ? 'Submitting...' : 'Submit'}
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {selectedFiles[assignment.id] && (
                                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600 mb-2">Selected file: {selectedFiles[assignment.id].name}</p>
                                                    <div className="w-full max-w-2xl h-96 flex items-center justify-center bg-white rounded-lg">
                                                        <Image
                                                            src={previewUrls[assignment.id]}
                                                            alt="Preview"
                                                            className="rounded shadow"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'contain',
                                                            }}
                                                            width={800}
                                                            height={400}
                                                            unoptimized
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {selectedAnswer && selectedAnswer.assignment_id === assignment.id && (
                                        <Card className="mt-4 border-2 border-blue-200 bg-blue-50/30 rounded-lg overflow-hidden">
                                            <CardHeader>
                                                <CardTitle>Submission: {selectedAnswer.title}</CardTitle>
                                                <CardDescription>Your submitted work and feedback</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {selectedAnswer.image_url ? (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Uploaded Image:</h4>
                                                        <div className="w-full max-w-2xl h-96 flex items-center justify-center bg-white rounded-lg">
                                                            <Image
                                                                src={selectedAnswer.image_url}
                                                                alt="Assignment submission"
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

                                                {selectedAnswer.answer_text && (
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Extracted Text:</h4>
                                                        <div className="bg-white p-4 rounded-lg max-h-32 overflow-y-auto">
                                                            <p className="text-lg">{selectedAnswer.answer_text}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedAnswer.ai_grade && (
                                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                        <h4 className="font-semibold text-blue-800 mb-2">AI Grade</h4>
                                                        <p className="text-blue-700">Grade: {selectedAnswer.ai_grade}/5</p>
                                                        {selectedAnswer.status === 'submitted' && (
                                                            <p className="text-sm text-blue-600 mt-1">Waiting for teacher review</p>
                                                        )}
                                                    </div>
                                                )}

                                                {selectedAnswer.teacher_grade && selectedAnswer.status === 'graded' && (
                                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                        <h4 className="font-semibold text-green-800 mb-2">Teacher Grade</h4>
                                                        <p className="text-green-700">Grade: {selectedAnswer.teacher_grade}/5</p>
                                                        {selectedAnswer.feedback && (
                                                            <div className="mt-2">
                                                                <p className="text-sm font-medium text-green-700">Feedback:</p>
                                                                <p className="text-green-600 mt-1">{selectedAnswer.feedback}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" onClick={() => setSelectedAnswer(null)}>
                                                        Close
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </Fragment>
                            );
                        })
                    ) : (
                        <h1 className="text-gray-600">No assignments found</h1>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
                <Card className="lg:h-170 sm:h-120 h-110">
                    <CardHeader className="max-[400px]:!pb-0 flex">
                        <div>
                            <CardTitle className="text-2xl">Chat with Teacher</CardTitle>
                            <CardDescription className="text-xs">Get help and feedback from your instructor</CardDescription>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col">
                        <ScrollArea className="flex-1 mb-5">
                            <div className="space-y-4 lg:h-145 sm:h-95 h-85 pl-1">
                                {msgLoading ? (
                                    <div className="flex h-full items-center justify-center">
                                        <Loader className="text-black animate-spin [animation-duration:1.5s]" width={80} height={80} />
                                    </div>
                                ) : messages.length ? (
                                    messages.map(({ id, sender_id, sent_at, content }) => (
                                        <div key={id} className={`flex ${sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex items-start space-x-2 sm:max-w-sm max-w-64 ${sender_id === userId ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>{sender_id === userId ? 'S' : 'T'}</AvatarFallback>
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

                        <div className="flex items-center space-x-2 pb-5">
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
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
                {aswLoading ? (
                    <Loader className="text-black animate-spin [animation-duration:1.5s]" width={80} height={80} />
                ) : answers?.length === 0 ? (
                    <h1 className="text-gray-600">No feedback found</h1>
                ) : (
                    <Card className="max-[425px]:py-4">
                        <CardHeader className="max-[425px]:px-4">
                            <CardTitle>Recent Feedback</CardTitle>
                            <CardDescription>Track feedback received from your teacher</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="max-[425px]:px-4">
                            <div className="space-y-4">
                                {answers
                                    .filter(answer => answer.status === 'graded' && answer.feedback)
                                    .map((answer) => {
                                        const assignment = assignments.find(a => a.id === answer.assignment_id);
                                        return (
                                            <div key={answer.id} className="p-4 rounded-lg w-full border grid grid-cols-2 max-[425px]:grid-cols-3">
                                                <div className="max-[425px]:col-span-2">
                                                    <h4 className="font-semibold text-xl">{assignment?.title || 'Unknown Assignment'}</h4>
                                                    <p className="text-sm text-gray-600">{assignment?.subject}</p>
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