export async function extractTextFromImage(imageUrl: string): Promise<string> {
        const endpoint = process.env.NEXT_PUBLIC_AZURE_VISION_ENDPOINT!
        const apiKey = process.env.NEXT_PUBLIC_AZURE_VISION_KEY!

        const res = await fetch(`${endpoint}/computervision/imageanalysis:analyze?api-version=2023-10-01&features=read&language=en`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Ocp-Apim-Subscription-Key': apiKey,
                },
                body: JSON.stringify({ url: imageUrl }),
        })
        const data = await res.json()
        const length = data.readResult.blocks[0].lines.length
        let text = ''
        for (let i = 0; i < length; i++) {
                text += data.readResult.blocks[0].lines[i].text + '\n'
        }
        return text
}
