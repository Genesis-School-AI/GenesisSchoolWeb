import { cookies } from 'next/headers';

export async function getUserSession() {
  try {
    const cookieStore = await cookies();
    const userSessionCookie = cookieStore.get('user_session');
    
    if (!userSessionCookie) {
      return null;
    }
    
    return JSON.parse(userSessionCookie.value);
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}

// Client-side version for use in components
export function getUserSessionClient() {
  if (typeof window === 'undefined') return null;
  
  try {
    const cookies = document.cookie.split(';');
    const userSessionCookie = cookies.find(cookie => 
      cookie.trim().startsWith('user_session=')
    );
    
    if (!userSessionCookie) return null;
    
    const cookieValue = userSessionCookie.split('=')[1];
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch (error) {
    console.error('Error getting user session on client:', error);
    return null;
  }
}
