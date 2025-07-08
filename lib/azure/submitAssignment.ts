import { extractTextFromImage } from '@/lib/azure/azureOcr'
import { createClient } from '@/lib/supabase/client'
import { gradeAnswerWithGroq } from '../groq/gradeAnswerWithGroq'

export async function submitAssignment({
        file,
        assignmentId,
        teacherId,
        question,
        assignmentName,
        subject,
}: {
        file: File
        assignmentId: string
        teacherId: string
        question: string | undefined
        assignmentName: string | undefined
        subject: string | undefined
}) {
        const supabase = createClient()

        const filePath = `${teacherId}/${Date.now()}-${file.name}`

        const uploadRes = await supabase.storage.from('assignments').upload(filePath, file)
        if (uploadRes.error) throw uploadRes.error

        const publicUrl = supabase.storage.from('assignments').getPublicUrl(filePath).data.publicUrl
        const extractedText = await extractTextFromImage(publicUrl)

        const { feedback, score } = await gradeAnswerWithGroq(extractedText, question!, assignmentName!, subject!)

        await supabase
                .from('assignments')
                .update({
                        image_url: publicUrl,
                        submitted_at: new Date().toISOString(),
                        extracted_text: extractedText,
                        status: 'submitted',
                        feedback,
                        ai_grade: score,
                })
                .eq('id', assignmentId)
                .eq('created_by', teacherId)
}
