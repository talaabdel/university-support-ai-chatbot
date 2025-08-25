
import { NextResponse } from 'next/server';

// Replace with your Hugging Face API token (free)
const HUGGINGFACE_API_TOKEN = process.env.HF_API_KEY; // ✅ Using environment variable
const YOUR_SITE_URL = 'your_site_url';
const YOUR_SITE_NAME = 'your_site_name';

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
    Act as an AI assistant with expert knowledge about university. Whenever you provide information, reference details from the website https://www.ouinfo.ca/ 
    Answer user questions with accurate and helpful information about ontario universities, including details about prices, courses, schools, majors and other related topics, as if you are drawing knowledge from this website. if you believe the question does not have anything to do with university and college knowledge or is not related to the website, appologized and explain that you can only answer questions about ontario universities and secondary education.`

// POST function to handle incoming requests
export async function POST(req) {
    try {
        console.log('=== API Route Started ===');
        
        const data = await req.json();
        console.log('Data received:', data);

        // Validate that data is iterable
        const messagesArray = Array.isArray(data.messages) ? data.messages : [];
        if (messagesArray.length === 0) {
            throw new Error('No messages provided');
        }
        
        console.log('message:', messagesArray);

        // Check for specific questions first and provide detailed responses
        if (messagesArray[0].content.toLowerCase().includes('hi') || messagesArray[0].content.toLowerCase().includes('hello')) {
            console.log('Sending test response for hi/hello');
            return new NextResponse("Hello! I'm UniGuide, your AI assistant for Ontario university information. How can I help you today?", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        if (messagesArray[0].content.toLowerCase().includes('uoft') || messagesArray[0].content.toLowerCase().includes('university of toronto')) {
            console.log('Sending detailed response for UofT question');
            return new NextResponse("The University of Toronto (UofT) is one of Canada's top universities, located in Toronto, Ontario. It offers a wide range of undergraduate and graduate programs across three campuses: St. George (downtown), Mississauga, and Scarborough. UofT is known for its research excellence and diverse academic offerings. Popular programs include Computer Science, Engineering, Business, Medicine, and Arts & Science.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        if (messagesArray[0].content.toLowerCase().includes('waterloo')) {
            console.log('Sending detailed response for Waterloo question');
            return new NextResponse("The University of Waterloo is located in Waterloo, Ontario, and is renowned for its co-operative education programs and strong focus on technology and engineering. It's particularly famous for its Computer Science, Engineering, and Mathematics programs. Waterloo has one of the largest co-op programs in the world, giving students valuable work experience during their studies.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        if (messagesArray[0].content.toLowerCase().includes('mcmaster')) {
            console.log('Sending detailed response for McMaster question');
            return new NextResponse("McMaster University is located in Hamilton, Ontario, and is known for its innovative approach to learning and research. It's particularly strong in Health Sciences, Engineering, and Business. McMaster is famous for its problem-based learning approach and has a beautiful campus with strong research facilities.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        if (messagesArray[0].content.toLowerCase().includes('queen') || messagesArray[0].content.toLowerCase().includes('queens')) {
            console.log('Sending detailed response for Queen\'s question');
            return new NextResponse("Queen's University is located in Kingston, Ontario, and is known for its beautiful campus and strong academic reputation. It's particularly famous for its Business School, Engineering programs, and Arts & Science. Queen's has a strong sense of community and tradition, with many students living on campus.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        if (messagesArray[0].content.toLowerCase().includes('western')) {
            console.log('Sending detailed response for Western question');
            return new NextResponse("Western University (formerly University of Western Ontario) is located in London, Ontario. It's known for its strong Business School (Ivey), Engineering programs, and Health Sciences. Western has a beautiful campus and is particularly famous for its Business and Medical programs.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        if (messagesArray[0].content.toLowerCase().includes('york')) {
            console.log('Sending detailed response for York question');
            return new NextResponse("York University is located in Toronto, Ontario, and is known for its diverse student body and strong programs in Arts, Business, and Law. York has multiple campuses including the main Keele campus and Glendon (bilingual French/English). It's particularly strong in Liberal Arts and Social Sciences.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        if (messagesArray[0].content.toLowerCase().includes('ontario') && messagesArray[0].content.toLowerCase().includes('university')) {
            console.log('Sending detailed response for Ontario universities question');
            return new NextResponse("Ontario has many excellent universities including University of Toronto, University of Waterloo, McMaster University, Queen's University, Western University, York University, and more. Each offers unique programs and opportunities for students. The province is known for high-quality education and diverse campus environments.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // For questions not covered by fallbacks, use Hugging Face API (free)
        console.log('Using Hugging Face API for this question...');
        
        // Check if API token is configured
        if (!HUGGINGFACE_API_TOKEN || HUGGINGFACE_API_TOKEN === 'hf_xxx') {
            console.log('Hugging Face API token not configured, using fallback response');
            return new NextResponse("I can answer basic questions about Ontario universities from my built-in knowledge. For more detailed information, I'll need to connect to my AI service. You can get a free Hugging Face API token at https://huggingface.co/settings/tokens to enable full AI responses!", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }
        
        // Send a POST request to Hugging Face Inference API
        console.log('Sending request to Hugging Face...');
        
        try {
            const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-small", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HUGGINGFACE_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: `System: ${systemPrompt}\nUser: ${messagesArray[0].content}\nAssistant:`,
                    parameters: {
                        max_length: 200,
                        temperature: 0.7,
                    }
                }),
            });

            console.log('Hugging Face response status:', response.status);
            console.log('Hugging Face response statusText:', response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Hugging Face API Error:', response.status, errorText);
                throw new Error(`Hugging Face API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            // Parse the response
            const responseData = await response.json();
            console.log('Hugging Face response data:', responseData);

            if (responseData && responseData[0] && responseData[0].generated_text) {
                const messageContent = responseData[0].generated_text;
                console.log('Message content:', messageContent);
                
                return new NextResponse(messageContent, {
                    headers: { 'Content-Type': 'text/plain' }
                });
            } else {
                console.error('Invalid response format:', responseData);
                throw new Error('Invalid response format from Hugging Face');
            }
            
        } catch (apiError) {
            console.error('Hugging Face API call failed:', apiError);
            
            // Fallback response if Hugging Face fails
            return new NextResponse("I'm having trouble connecting to my AI service right now, but I can tell you about Ontario universities from my built-in knowledge. Try asking about specific universities like UofT, Waterloo, McMaster, Queen's, or Western!", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

    } catch (err) {
        console.error('=== API Error ===');
        console.error('Error type:', err.constructor.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        
        return new NextResponse(`Error: ${err.message}`, { 
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}
