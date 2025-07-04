import { ComponentType } from 'react'

export type AnimatedTextProps = {
        text: string
        className?: string
        delayOffset?: number
}

export type AnimatedFeedbackProps = {
        name: string
        role: string
        content: string
        rating: number
        index: number
        delay?: number
}

export type AnimatedShowcaseProps = {
        Icon: ComponentType<{ className?: string }>
        title: string
        description: string
        delay: number
}

export type TMessage = {
        id: string
        sender_id: string
        receiver_id: string
        content: string
        created_at: string
}

export type TAssignment = {
        id: string
        title: string
        student_id: string
        subject?: string
        status: 'pending' | 'submitted' | 'graded'
        ai_grade: number
        graded_at?: string
        submitted_at?: string
        created_at: string
        feedback?: 'excellent' | 'good' | 'okay' | 'poor' | 'not-graded' | string
        extracted_text?: string
}

export type TStudent = {
        id: string
        full_name: string
}
