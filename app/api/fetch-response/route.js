export async function POST(request) {
    try {
        const body = await request.json();
        
        // Extract chat history and new prompt from the body
        const { chatHistory, newPrompt, ...otherParams } = body;
        
        // Prepare the request body with chat history
        const requestBody = {
            ...otherParams,
            chathistory: chatHistory || {},
            newprompt: newPrompt || body.prompt
        };
        
        const response = await fetch('https://genesis.ongor.fun/fetch-gemini', {
       //  const response = await fetch('http://127.0.0.1:8690/fetch-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        return Response.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return Response.json(
            { error: 'Failed to fetch from API server' }, 
            { status: 500 }
        );
    }
}
