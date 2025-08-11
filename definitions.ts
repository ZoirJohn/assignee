import { ComponentType } from 'react';

export type AnimatedTextProps = {
    text: string;
    className?: string;
    delayOffset?: number;
};

export type AnimatedFeedbackProps = {
    name: string;
    role: string;
    content: string;
    rating: number;
    index: number;
    delay?: number;
};

export type AnimatedShowcaseProps = {
    Icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
    delay: number;
};

export type TMessage = {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    sent_at: string;
};

export type Ass = {
    id: string;
    title: string;
    description: string;
    subject: string;
    deadline: string;
    created_by: string;
    submitted_at?: string;
    image_url?: string;
    extracted_text?: string;
    ai_grade?: number;
    teacher_grade?: number;
    feedback?: string;
    status: 'pending' | 'submitted' | 'graded' | 'missed';
    created_at: string;
};

export type TAssignment = {
    id: string;
    title: string;
    description: string;
    subject: string;
    deadline: string;
    created_by: string;
    created_at: string;
};

export type TStudent = {
    id: string;
    full_name: string;
    avatar_url: string | null;
};

export type TAnswer = {
    id: string;
    assignment_id: string;
    student_id: string;
    answer_text: string;
    teacher_grade: number | null;
    ai_grade: number;
    status: 'submitted' | 'graded';
    submitted_at: string;
    created_by: string;
    image_url: string;
    feedback: string | null;
    creator:{
        full_name:string
    }
};

export type TTeacherTabs = 'assignments' | 'chat' | 'answers' | 'feedback';

export type responseState<dataType> = { data: dataType; error: string; loading: boolean };
