'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Sidebar({ onClose, userSession, onLogout, selectedSubject, onSubjectChange }) {
       const [isVisible, setIsVisible] = useState(false);

       // Animation effect when component mounts
       useEffect(() => {
              // Small delay to ensure CSS transition works
              const timer = setTimeout(() => {
                     setIsVisible(true);
              }, 10);

              return () => clearTimeout(timer);
       }, []);

       const handleClose = () => {
              setIsVisible(false);
              // Delay the actual close to allow animation to complete
              setTimeout(() => {
                     onClose();
              }, 300);
       };

       const handleOverlayClick = (e) => {
              if (e.target === e.currentTarget) {
                     handleClose();
              }
       };
       const subjects = [
              { id: 'bio', name: 'ชีวะวิทยา' },
              { id: 'thai', name: 'ไทย' },
              { id: 'math', name: 'คณิต' },
              { id: 'physics', name: 'ฟิสิกส์' },
              { id: 'chemistry', name: 'เคมี' },
              { id: 'english', name: 'อังกฤษ' },
              { id: 'social', name: 'สังคม' },
              { id: 'history', name: 'ประวัติศาสตร์' }
              , { id: 'com', name: 'คอมพิวเตอร์' }
       ];

       const handleSubjectChange = (e) => {
              const newSubject = e.target.value;
              if (onSubjectChange) {
                     onSubjectChange(newSubject);
              }
       };
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
              <>
                     {/* Overlay for dimming background */}
                     <div
                            className={`sidebar-overlay ${isVisible ? 'show' : ''}`}
                            onClick={handleOverlayClick}
                     />

                     {/* Sidebar with sliding animation */}
                     <div className={`sidebar z-[99999] ${isVisible ? 'show' : ''}`}>
                            <button onClick={handleClose}>✖</button>
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

                            <div className="subject-selection">
                                   <h3 className="text-lg mb-2">เลือกวิชา</h3>
                                   <select
                                          value={selectedSubject}
                                          onChange={handleSubjectChange}
                                          className="subject-dropdown"
                                   >
                                          {subjects.map((subject) => (
                                                 <option key={subject.id} value={subject.id}>
                                                        {subject.name}
                                                 </option>
                                          ))}
                                   </select>
                            </div>

                            {/* link to /quizz page */}
                            <div className="mt-4">
                                   {window.location.pathname !== '/quizz' ? <Link href="/quizz" className="quizz-link">
                                          ไปยังหน้าทดสอบ
                                   </Link> : <Link href="/" className="quizz-link">
                                          ไปยังหน้าหลัก
                                   </Link>}
                            </div>
                            <button
                                   onClick={handleLogout}
                                   className="logout-btn"
                            >
                                   ออกจากระบบ
                            </button>
                     </div>
              </>
       );
}
