export type TMessage = {
        attachments: null | JSON
        content: string
        conversation_id: string
        created_at: string
        id: string
        is_edited: boolean
        receiver_id: string
        sender_id: string
        status: string
        updated_at: string
}
export type TStudent = {
        id: string
        full_name: string
}
export type TAssignment = {
        id: string
        teacher_id: string
        student_id: string
        title: string
        description: string
        image_url: string
        extracted_text: string
        ai_grade: number
        feedback: 'excellent' | 'good' | 'okay' | 'poor' | ''
        status: 'pending' | 'submitted' | 'graded' | 'returned'
        deadline: Date
        created_at: Date
        updated_at: Date
        submitted_at: Date
        graded_at: Date | undefined
        max_grade: number
        subject: string
        assignment_type: 'homework' | 'quiz' | 'exam' | 'project' | 'lab' | 'essay'
        is_active: boolean
        teacher_grade?: string
        min_grade: number
        additional_comments?: string
}
