import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function Home() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get('user_session');

  if (!userSession) {
    redirect('/login');
  }

  let user;
  try {
    user = JSON.parse(userSession.value);
  } catch {
    redirect('/login');
  }

  const handleLogout = async () => {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('user_session');
    redirect('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-gray-300 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">ข้อมูลผู้ใช้</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
            <p className="mt-1 text-lg">{user.ufname} {user.ulname}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสนักเรียน</label>
            <p className="mt-1 text-lg">{user.ustudent_id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">ห้อง</label>
            <p className="mt-1 text-lg">ห้อง {user.uroom_id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">ชั้นปี</label>
            <p className="mt-1 text-lg">ปี {user.uyear_id}</p>
          </div>
        </div>

        <Image
          src="/icon/eye-solid.svg"
               alt="User Icon"
               width={100}
                     height={100}
               className="mx-auto mt-6 mb-4"
              />

        <form action={handleLogout} className="mt-6">
          <button 
            type="submit"
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
