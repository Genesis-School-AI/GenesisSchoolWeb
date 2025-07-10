import { createClient } from '../../../utils/supabase/server';
import { getUserSession } from '../../../utils/auth';

// Get recent chat history for the user
export async function GET(request) {
    try {
        const userSession = await getUserSession();
        
        if (!userSession) {
            return Response.json({ error: 'No user session found' }, { status: 401 });
        }

        const supabase = await createClient();
        
        // Get the last 10 messages for the user, ordered by creation time (most recent first)
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('muid', userSession.uid)
            .order('mcreated_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Database error:', error);
            return Response.json({ error: 'Failed to fetch chat history' }, { status: 500 });
        }

        // Reverse to get chronological order (oldest first)
        const chronologicalMessages = messages.reverse();
        
        return Response.json({ 
            success: true, 
            messages: chronologicalMessages || []
        });
        
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return Response.json({ error: 'Failed to fetch chat history' }, { status: 500 });
    }
}

// Save new message to chat history
export async function POST(request) {
    try {
        const userSession = await getUserSession();
        
        if (!userSession) {
            return Response.json({ error: 'No user session found' }, { status: 401 });
        }


        const { userPrompt, aiResponse } = await request.json();

        if (!userPrompt || !aiResponse) {
            return Response.json({ error: 'Missing userPrompt or aiResponse' }, { status: 400 });
        }

        const supabase = await createClient();

        // Insert user message and AI response in a single row
        const { error: saveError } = await supabase
            .from('messages')
            .insert({
                muid: userSession.uid, // user id from user table (from cookies)
                mtext: userPrompt,     // user prompt
                mrespond: aiResponse,  // ai response
                mcreated_at: new Date().toISOString()
            });

        if (saveError) {
            console.error('Error saving message:', saveError);
            return Response.json({ error: 'Failed to save message' }, { status: 500 });
        }

        return Response.json({ success: true });
        
    } catch (error) {
        console.error('Error saving chat history:', error);
        return Response.json({ error: 'Failed to save chat history' }, { status: 500 });
    }
}

// Clear chat history for the user
export async function DELETE(request) {
    try {
        const userSession = await getUserSession();
        
        if (!userSession) {
            return Response.json({ error: 'No user session found' }, { status: 401 });
        }

        const supabase = await createClient();
        
        // Delete all messages for the user
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('muid', userSession.uid);

        if (error) {
            console.error('Database error:', error);
            return Response.json({ error: 'Failed to clear chat history' }, { status: 500 });
        }

        return Response.json({ success: true });
        
    } catch (error) {
        console.error('Error clearing chat history:', error);
        return Response.json({ error: 'Failed to clear chat history' }, { status: 500 });
    }
}
