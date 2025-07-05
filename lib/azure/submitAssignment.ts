import { extractTextFromImage } from '@/lib/azure/azureOcr'
import { createClient } from '@/lib/supabase/server'

export async function submitAssignment({ file, assignmentId, studentId }: { file: File; assignmentId: string; studentId: string }) {
        const supabase = await createClient()

        const filePath = `${studentId}/${Date.now()}-${file.name}`

        const uploadRes = await supabase.storage.from('submissions').upload(filePath, file)
        if (uploadRes.error) throw uploadRes.error

        const publicUrl = supabase.storage.from('submissions').getPublicUrl(filePath).data.publicUrl

        const extractedText = await extractTextFromImage(publicUrl)

        await supabase
                .from('assignments')
                .update({
                        image_url: publicUrl,
                        submitted_at: new Date().toISOString(),
                        extracted_text: extractedText,
                        status: 'submitted',
                })
                .eq('id', assignmentId)
                .eq('created_by', studentId)
}
