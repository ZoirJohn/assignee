'use client';

import {  Fragment,  useEffect, useRef, useState } from 'react';
import { Clock,  Send,  Image as ImageIcon, Loader } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { responseState, TAnswer, TAssignment, TMessage } from '@/definitions';
// import { submitAssignment } from '@/lib/azure/submitAssignment';
import Image from 'next/image';

// assignments
// messages
// feedback
// answers

export default function StudentTabs({ value }: { value: string }) {
    const supabase = createClient();
    // State
    const [selectedFiles] = useState<{ [key: string]: File }>({});
    const [previewUrls] = useState<{ [key: string]: string }>({});
    const [selectedAssignment, setSelectedAssignment] = useState<(TAnswer & { title: string }) | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const [disabled, setDisabled] = useState<boolean>(false);
    const [grades, ] = useState<{ subject: string; assignment: string; grade: number | undefined; date: string }[]>([]);
    // const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Fetched data
    const [userId, setUserId] = useState<string>('');
    const [teacherId, setTeacherId] = useState<string>('');
    const [{ data: messages, error: msgError, loading: msgLoading }, setMessages] = useState<responseState<TMessage[]>>({ data: [], error: '', loading: true });
    const [{ data: assignments, error: asgError, loading: asgLoading }, setAssignments] = useState<responseState<TAssignment[]>>({ data: [], error: '', loading: true });
    const [{ data: answers, error: aswError, loading: aswLoading }] = useState<responseState<TAnswer[]>>({ data: [], error: '', loading: true });

    // const handleAssignmentData = useCallback(
    //     (id: string) => {
    //         let data = { title: '', subject: '', description: ''};
    //         if (!assignments) return data;
    //         for (let i = 0; i < assignments.length; i++) {
    //             if (assignments[i].id == id) {
    //                 data = { title: assignments[i].title, subject: assignments[i].subject, description: assignments[i].description };
    //                 break;
    //             }
    //         }
    //         return data;
    //     },
    //     [assignments]
    // );
    
    // const handleAnwerData=useCallback((id:string)=>{
    //     let data = { status:''};
    //         if (!answers) return data;
    //         for (let i = 0; i < answers.length; i++) {
    //             if (answers[i].id == id) {
    //                 data = { status:answers[i].status };
    //                 break;
    //             }
    //         }
    //         return data;
    // },[answers])

    // const handleFileChange = (event: ChangeEvent<HTMLInputElement>, assignmentId: string) => {
    //     const file = event.target.files?.[0];
    //     if (file) {
    //         const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    //         if (!validImageTypes.includes(file.type)) {
    //             alert('Please select an image file (JPEG, PNG, WebP, GIF, or BMP)');
    //             event.target.value = '';
    //             return;
    //         }

    //         const previewUrl = URL.createObjectURL(file);

    //         setSelectedFiles((prev) => ({
    //             ...prev,
    //             [assignmentId]: file,
    //         }));

    //         setPreviewUrls((prev) => ({
    //             ...prev,
    //             [assignmentId]: previewUrl,
    //         }));
    //     }
    // };

    // const handleSubmitAnswer = async (assignmentId: string) => {
    //     const selectedFile = selectedFiles[assignmentId];
    //     if (!selectedFile) {
    //         alert('Please select a file first');
    //         return;
    //     }
    //     const { title, subject, description } = handleAssignmentData(assignmentId);

    //     try {
    //         await submitAssignment({
    //             file: selectedFile,
    //             assignmentId,
    //             teacherId,
    //             assignmentName: title,
    //             question: description,
    //             subject: subject,
    //         });
    //         setAnswers((prev) => ({ ...prev, data: prev.data.map((answer: TAnswer) => (answer.assignment_id === assignmentId ? { ...answer, status: 'submitted', image_url: URL.createObjectURL(selectedFile) } : answer)) }));
    //         setSelectedFiles((prev) => {
    //             const newFiles = { ...prev };
    //             delete newFiles[assignmentId];
    //             return newFiles;
    //         });
    //         setPreviewUrls((prev) => {
    //             const newUrls = { ...prev };
    //             if (newUrls[assignmentId]) {
    //                 URL.revokeObjectURL(newUrls[assignmentId]);
    //                 delete newUrls[assignmentId];
    //             }
    //             return newUrls;
    //         });
    //         const fileInput = document.getElementById(`file-${assignmentId}`) as HTMLInputElement;
    //         if (fileInput) fileInput.value = '';
    //     } catch {}
    // };

    const handleSendMessage = async () => {
        setDisabled(true);
        await supabase.from('messages').insert({
            sender_id: userId,
            receiver_id: teacherId,
            content: newMessage,
        });
        setNewMessage('');
        setDisabled(false);
    };

    // const openSubmissionView = useCallback((submission: TAnswer & { title: string }) => {
    //     if (submission.status === 'graded') {
    //         setSelectedAssignment(submission);
    //     } else {
    //         setSelectedAssignment(submission);
    //     }
    // }, []);

    // const isAssignmentMissed = ({ deadline: time ,id}: { deadline: string ,id:string}) => {
    //     const {status}=handleAnwerData(id)
    //     const deadline = new Date(time);
    //     const now = new Date();
    //     return now > deadline && status === 'submitted';
    // };

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const { claims } = (await supabase.auth.getClaims()).data || {};
                if (claims) {
                    setUserId(claims.sub);
                    setTeacherId(claims.user_metadata.teacher_id);
                }
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
                                data: prev.data.map((asg) => (asg.id === newAssignment.id ? (newAssignment as TAssignment) : asg)),
                            }));
                            break;

                        case 'DELETE':
                            setAssignments((prev) => ({
                                ...prev,
                                data: prev.data.filter((asg) => asg.id !== oldAssignment.id),
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

        return () => {
            supabase.removeChannel(assignmentChannel);
            supabase.removeChannel(messagesChannel);
        };
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!teacherId || !userId) return;

            const state: {
                data: TMessage[];
                error: string;
                loading: boolean;
            } = { loading: false, data: [], error: '' };

            try {
                const { data, error } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${userId},receiver_id.eq.${teacherId}),and(sender_id.eq.${teacherId},receiver_id.eq.${userId})`).order('sent_at', { ascending: true });

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
            if (!userId) return;
            const state: {
                data: TAssignment[];
                error: string;
                loading: boolean;
            } = { loading: false, data: [], error: '' };
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
        fetchAssignments();
        fetchMessages();
    }, [teacherId, userId]);

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

    return (
        <>
            <TabsContent value="deadlines" className="space-y-4">
                <div className="grid gap-3">
                    {asgLoading ? (
                        <Loader className="text-black animate-spin [animation-duration:1.5s]" width={80} height={80} />
                    ) : assignments.length ? (
                        assignments.map((assignment) => (
                            <Fragment key={assignment.id}>
                                <Card className="gap-0 max-[425px]:py-4">
                                    <CardHeader className="!pb-0 mb-0 max-[425px]:px-4">
                                        <div className="flex flex-col gap-1">
                                            <CardTitle className="text-2xl font-bold leading-tight text-blue-900">{assignment.title}</CardTitle>
                                            <div className="text-sm text-gray-400 mt-0.5 mb-0.5">{assignment.subject}</div>
                                            <div className="text-lg font-medium text-gray-800 mb-1">{assignment.description}</div>
                                            {/* <div className="flex items-center flex-wrap gap-1 mt-1">
                                                {assignment.ai_grade && assignment.status !== 'graded' && (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                        {assignment.ai_grade !== undefined && assignment.ai_grade !== null ? `AI Score: ${assignment.ai_grade}` : 'AI Score: Not scored'}
                                                    </Badge>
                                                )}
                                                {assignment.teacher_grade && assignment.status === 'graded' && (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                                        Teacher Grade: {assignment.teacher_grade}
                                                    </Badge>
                                                )}
                                            </div> */}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="max-[425px]:px-4">
                                        <div className="flex items-center justify-between flex-wrap gap-4 border-t pt-3 mt-2">
                                            <div className="flex items-center text-base font-medium text-gray-700">
                                                <Clock className="w-5 h-5 mr-2" />
                                                Due:{' '}
                                                {new Date(assignment.deadline).toLocaleDateString('en-UZ', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                            {/* <div className="flex items-center space-x-2">
                                                {assignment.status === 'pending' && (
                                                    <>
                                                        <Input type="file" onChange={(e) => handleFileChange(e, assignment.id.toString())} className="hidden" id={`file-${assignment.id}`} accept="image/*" disabled={submittingAssignmentId === assignment.id.toString()} />
                                                        <Button variant="outline" size="sm" onClick={() => document.getElementById(`file-${assignment.id}`)?.click()} disabled={submittingAssignmentId === assignment.id.toString()}>
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Upload Image
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={async () => {
                                                                setSubmittingAssignmentId(assignment.id.toString());
                                                                await handleSubmitAssignment(assignment.id.toString());
                                                                setSubmittingAssignmentId(null);
                                                            }}
                                                            disabled={submittingAssignmentId === assignment.id.toString()}>
                                                            {submittingAssignmentId === assignment.id.toString() ? <span className="flex items-center">Submitting...</span> : 'Submit'}
                                                        </Button>
                                                    </>
                                                )}
                                                {assignment.status === 'submitted' && (
                                                    <Button variant="outline" size="sm" onClick={() => openSubmissionView(assignment)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Review
                                                    </Button>
                                                )}
                                                {assignment.status === 'graded' && assignment.image_url && (
                                                    <Button variant="outline" size="sm" onClick={() => openSubmissionView(assignment)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Submission
                                                    </Button>
                                                )}
                                                {assignment.status === 'missed' && <div className="text-sm text-red-600 font-medium">Deadline passed</div>}
                                            </div> */}
                                        </div>
                                        {selectedFiles[assignment.id] && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600 mb-2">Selected file: {selectedFiles[assignment.id].name}</p>
                                                <div
                                                    className="p-4 rounded"
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '800px',
                                                        height: '400px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'none',
                                                    }}>
                                                    <Image
                                                        src={previewUrls[assignment.id]}
                                                        alt="Preview"
                                                        className="rounded shadow"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            background: 'none',
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
                                {selectedAssignment && selectedAssignment.id === assignment.id && (
                                    <Card className="border-2 border-blue-200 bg-blue-50/30 max-[425px]:py-4">
                                        <CardHeader className="max-[425px]:px-4">
                                            <CardTitle>Submission: {selectedAssignment.title}</CardTitle>
                                            <CardDescription>Your submitted work</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4 max-[425px]:px-4">
                                            {selectedAssignment.image_url ? (
                                                <div>
                                                    <h4 className="font-semibold mb-2">Uploaded Image:</h4>
                                                    <div
                                                        className="p-4 rounded-lg"
                                                        style={{
                                                            width: '100%',
                                                            maxWidth: '800px',
                                                            height: '400px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'none',
                                                        }}>
                                                        <Image
                                                            src={selectedAssignment.image_url}
                                                            alt="Assignment submission"
                                                            className="rounded-lg shadow-sm"
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
                                                <div className="text-center py-8 text-gray-500">
                                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                    <p>No image uploaded for this assignment</p>
                                                </div>
                                            )}

                                            {selectedAssignment.ai_grade && selectedAssignment.status === 'submitted' && (
                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                    <h4 className="font-semibold text-blue-800 mb-2">AI Grade</h4>
                                                    <p className="text-blue-700">
                                                        Grade: {selectedAssignment.ai_grade}
                                                        /5
                                                    </p>
                                                    <p className="text-sm text-blue-600 mt-1">Waiting for teacher review</p>
                                                </div>
                                            )}

                                            {selectedAssignment.teacher_grade && selectedAssignment.status === 'graded' && (
                                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                    <h4 className="font-semibold text-green-800 mb-2">Teacher Grade</h4>
                                                    <p className="text-green-700">
                                                        Grade: {selectedAssignment.teacher_grade}
                                                        /5
                                                    </p>
                                                    {selectedAssignment.feedback && (
                                                        <div className="mt-2">
                                                            <p className="text-sm font-medium text-green-700">Feedback:</p>
                                                            <p className="text-green-600 mt-1">{selectedAssignment.feedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-2">
                                                <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                                                    Close
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

            <TabsContent value="chat" className="space-y-4">
                <Card className="lg:h-170 sm:h-120 h-110">
                    <CardHeader className="max-[400px]:!pb-0 max-[425px]:px-4">
                        <CardTitle className="text-2xl">Chat with Teachers</CardTitle>
                        <CardDescription className="text-xs">Get help and feedback from your instructors</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col">
                        <ScrollArea className="flex-1 mb-5">
                            <div className="lg:h-143 sm:h-93 h-83 space-y-4">
                                {messages.length ? (
                                    messages.map(({ id, sender_id, content, sent_at }) => (
                                        <div key={id} className={`flex ${sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex items-start space-x-2 max-w-xs ${sender_id === 'student' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback>{sender_id !== userId ? 'T' : 'S'}</AvatarFallback>
                                                </Avatar>
                                                <div className={`p-3 rounded-lg ${sender_id === userId ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                                                    <p className="sm:text-lg text-sm font-medium leading-6">{content}</p>
                                                    <p className={`text-xs sm:mt-2 mt-1 ${sender_id === userId ? 'text-blue-100 text-right' : 'text-gray-500 text-left'}`}>
                                                        {new Date(sent_at).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: undefined,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <></>
                                )}
                                <div ref={messagesEndRef} className="h-0" />
                            </div>
                        </ScrollArea>
                        <div className="flex items-center space-x-2 pb-5">
                            <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} disabled={disabled} />
                            <Button size="sm" onClick={handleSendMessage} disabled={disabled}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="transcript" className="space-y-4">
                <Card className="max-[425px]:py-4">
                    <CardHeader className="max-[425px]:px-4">
                        <CardTitle>Academic Transcript</CardTitle>
                        <CardDescription>Your complete grades history</CardDescription>
                    </CardHeader>
                    <CardContent className="max-[425px]:px-4">
                        <div className="space-y-4">
                            {grades.map((grade, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg max-[400px]:flex-col max-[400px]:items-start">
                                    <div>
                                        <h4 className="font-semibold">{grade.assignment}</h4>
                                        <p className="text-sm text-gray-600">{grade.subject}</p>
                                    </div>
                                    <div className="text-right self-end">
                                        <div className="text-2xl font-bold text-blue-600">{grade.grade}</div>
                                        <p className="text-sm text-gray-500">
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
