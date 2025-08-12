export async function extractTextFromImage(imageUrl: string): Promise<string> {
    const endpoint = process.env.NEXT_PUBLIC_SPACE_VISION_ENDPOINT!;
    const apiKey = process.env.NEXT_PUBLIC_SPACE_VISION_KEY!;

    const formData = new FormData();
    formData.append('apikey', apiKey);
    formData.append('url', imageUrl);
    formData.append('language', 'eng');

    const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    const data = await res.json();

    if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage?.[0] || 'OCR processing failed');
    }

    return data.ParsedResults?.[0]?.ParsedText || '';
}
