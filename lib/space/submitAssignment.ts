import { extractTextFromImage } from '@/lib/space/spaceOcr';
import { createClient } from '@/lib/supabase/client';
import { gradeAnswerWithGroq } from '../groq/gradeAnswerWithGroq';

export async function submitAssignment({ file, assignment_id, created_by, question, assignmentName, subject }: { file: File; assignment_id: string; created_by: string; question: string | undefined; assignmentName: string | undefined; subject: string | undefined }) {
    const supabase = createClient();

    const filePath = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage.from('answers').upload(filePath, file);
    if (error) throw error;

    const publicUrl = supabase.storage.from('answers').getPublicUrl(filePath).data.publicUrl;
    const extractedText = (await extractTextFromImage(publicUrl)) || '';
    const { feedback, score } = await gradeAnswerWithGroq(extractedText, question!, assignmentName!, subject!);

    await supabase.from('answers').insert({
        image_url: publicUrl,
        submitted_at: new Date(),
        answer_text: extractedText,
        status: 'submitted',
        feedback,
        ai_grade: score,
        assignment_id,
        created_by,
    });
}
