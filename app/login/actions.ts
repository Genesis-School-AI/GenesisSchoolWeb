'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();

    const studentId = formData.get('student_id') as string;
    const password = formData.get('password') as string;

    if (!studentId || !password) {
      return { error: 'กรุณากรอกรหัสนักเรียนและรหัสผ่าน' };
    }

    // Query the user table directly
    const { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('ustudent_id', studentId)
      .eq('password', password)
      .single();

    if (error || !user) {
      return { error: 'รหัสนักเรียนหรือรหัสผ่านไม่ถูกต้อง' };
    }

    // Set session cookie
    cookieStore.set('user_session', JSON.stringify({
      id: user.id,
      ufname: user.ufname,
      ulname: user.ulname,
      ustudent_id: user.ustudent_id,
      uroom_id: user.uroom_id,
      uyear_id: user.uyear_id
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Success - revalidate and redirect
    revalidatePath('/', 'layout');
    
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
  }
  
  // Redirect outside try-catch to avoid Promise issues
  redirect('/');
}
