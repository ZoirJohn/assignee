import { extractTextFromImage } from '@/lib/azure/azureOcr'
import { createClient } from '@/lib/supabase/client'

export async function submitAssignment({ file, assignmentId, teacherId }: { file: File; assignmentId: string; teacherId: string }) {
        const supabase = createClient()

        const filePath = `${teacherId}/${Date.now()}-${file.name}`

        const uploadRes = await supabase.storage.from('assignments').upload(filePath, file)
        if (uploadRes.error) throw uploadRes.error

        const publicUrl = supabase.storage.from('assignments').getPublicUrl(filePath).data.publicUrl
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
                .eq('created_by', teacherId)
}
