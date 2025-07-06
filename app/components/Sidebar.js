'use client';

export default function Sidebar({ onClose, userSession, onLogout }) {
  const handleLogout = async () => {
    try {
      // Show loading state
      const button = document.querySelector('.logout-btn');
      const originalText = button.textContent;
      button.textContent = 'กำลังออกจากระบบ...';
      button.disabled = true;

      // Call logout callback to clear parent state
      if (onLogout) {
        onLogout();
      }

      // Call logout API
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear any client-side storage as well
        localStorage.clear();
        sessionStorage.clear();
        
        // Force reload to ensure all state is cleared
        window.location.replace('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('เกิดข้อผิดพลาดในการออกจากระบบ กรุณาลองใหม่อีกครั้ง');
      
      // Reset button state
      const button = document.querySelector('.logout-btn');
      if (button) {
        button.textContent = 'ออกจากระบบ';
        button.disabled = false;
      }
    }
  };

  return (
    <div className="sidebar">
      <button onClick={onClose}>✖</button>
      <h2 className="mt-3 text-xl">ข้อมูลผู้ใช้</h2>
      
      {userSession ? (
        <div className="user-info">
          <p><strong>ชื่อ:</strong> {userSession.ufname} {userSession.ulname}</p>
          <p><strong>รหัสนักเรียน:</strong> {userSession.ustudent_id}</p>
          <p><strong>ห้อง:</strong> {userSession.uroom_id}</p>
          <p><strong>ปีการศึกษา:</strong> {userSession.uyear_id}</p>
        </div>
      ) : (
        <p>กำลังโหลดข้อมูลผู้ใช้...</p>
      )}
      
      <button 
        onClick={handleLogout}
        className="logout-btn"
      >
        ออกจากระบบ
      </button>
    </div>
  );
}
