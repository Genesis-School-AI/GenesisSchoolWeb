import { getUserSession } from '../../../utils/auth';

export async function GET() {
    try {
        const userSession = await getUserSession();
        
        if (!userSession) {
            return Response.json({ error: 'No user session found' }, { status: 401 });
        }
        
        return Response.json(userSession);
    } catch (error) {
        console.error('Error fetching user session:', error);
        return Response.json({ error: 'Failed to fetch user session' }, { status: 500 });
    }
}
