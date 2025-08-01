export async function gradeAnswerWithGroq(studentAnswer: string, question: string, assignmentName: string, subject: string) {
        const model = 'qwen/qwen3-32b'

        const context = question ? `Question: "${question}"` : `Assignment Title: "${assignmentName ?? 'Unnamed'}"\nSubject: "${subject ?? 'Unknown'}"`

        const safeStudentAnswer = studentAnswer.replace(/["]/g, "'").slice(0, 2000)

        const gradingScale = `Grade from 2 (lowest) to 5 (highest):
                                - 2 = off-topic or confusing
                                - 3 = somewhat relevant but unclear or incomplete
                                - 4 = good effort, relevant and understandable
                                - 5 = excellent, creative or well-developed`

        const messages = [
                {
                        role: 'system',
                        content: `You are a fair, supportive, and focused teacher. You evaluate student answers based ONLY on whether they correctly and clearly respond to the given question or task.

                        Ignore irrelevant parts such as links, watermarks, emojis, or unrelated background content unless they change the meaning of the answer.

                        If the student gives the correct answer — even if it's short, from an image, or has formatting issues — grade it fairly and focus on the correctness and effort.`,
                },
                {
                        role: 'user',
                        content: `${context}

                        Here is the student's answer. It may come from an image, screenshot, or reused content. Judge the answer ONLY by how well it responds to the actual question, not by unrelated things like links or presentation quirks.

                        """${safeStudentAnswer}"""

                        ${gradingScale}

                        Return ONLY valid JSON in the format:
                        {
                        "score": number,
                        "feedback": string
                        }`,
                },
        ]

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_KEY}`,
                        'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.4,
                        max_tokens: 300,
                }),
        })

        const data = await response.json()

        if (!response.ok) {
                console.error('Groq API error:', data)
                throw new Error(`Groq API error: ${data?.error?.message || 'Unknown error'}`)
        }

        const content = data.choices?.[0]?.message?.content

        try {
                const result = JSON.parse(content)
                return result
        } catch {
                throw new Error('Invalid JSON returned from Groq: ' + content)
        }
}
