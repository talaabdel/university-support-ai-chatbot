import { NextResponse } from 'next/server';

const HUGGINGFACE_API_TOKEN = process.env.HF_API_KEY; // ✅ Using environment variable

export async function GET() {
    try {
        console.log('Testing Hugging Face API...');
        
        // Check if API token is configured
        if (!HUGGINGFACE_API_TOKEN || HUGGINGFACE_API_TOKEN === 'hf_xxx') {
            return new NextResponse('Hugging Face API token not configured. Get a free token at https://huggingface.co/settings/tokens', {
                status: 400,
                headers: { 'Content-Type': 'text/plain' }
            });
        }
        
        console.log('Sending test request to Hugging Face...');
        const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-small", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HUGGINGFACE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: "User: Say hello in one sentence.\nAssistant:",
                parameters: {
                    max_length: 50,
                    temperature: 0.7,
                }
            }),
        });

        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API Error:', response.status, errorText);
            return new NextResponse(`Hugging Face API Error: ${response.status} ${response.statusText} - ${errorText}`, { 
                status: 500,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        const responseData = await response.json();
        console.log('Hugging Face response:', responseData);

        if (responseData && responseData[0] && responseData[0].generated_text) {
            const messageContent = responseData[0].generated_text;
            return new NextResponse(`Hugging Face API is working! Response: ${messageContent}`, {
                headers: { 'Content-Type': 'text/plain' }
            });
        } else {
            return new NextResponse('Hugging Face API returned invalid response format', {
                status: 500,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

    } catch (error) {
        console.error('Test failed:', error);
        return new NextResponse(`Test failed: ${error.message}`, { 
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}
