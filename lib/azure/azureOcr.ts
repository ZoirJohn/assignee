export async function extractTextFromImage(imageUrl: string): Promise<string> {
        const endpoint = process.env.NEXT_PUBLIC_AZURE_VISION_ENDPOINT!
        const apiKey = process.env.NEXT_PUBLIC_AZURE_VISION_KEY!

        const res = await fetch(`${endpoint}/computervision/imageanalysis:analyze?api-version=2023-10-01`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Ocp-Apim-Subscription-Key': apiKey,
                },
                body: JSON.stringify({
                        url: imageUrl,
                        features: ['read'],
                        language: 'en',
                }),
        })

        const data = await res.json()
        return data.readResult?.content ?? ''
}
