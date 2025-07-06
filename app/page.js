// pages/index.js
'use client';
import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import InfoPopup from './components/InfoPopup';
import ChatMessage from './components/ChatMessage';
import Image from 'next/image';

export default function Home() {
       const [showSidebar, setShowSidebar] = useState(false);
       const [showInfo, setShowInfo] = useState(false);
       const [messages, setMessages] = useState([]);
       const [input, setInput] = useState('');
       const [loading, setLoading] = useState(false);
       const [userSession, setUserSession] = useState(null);
       const [selectedSubject, setSelectedSubject] = useState('bio'); // Default to biology
       const chatBoxRef = useRef(null);

       // Fetch user session on component mount
       useEffect(() => {
              const fetchUserSession = async () => {
                     try {
                            const response = await fetch('/api/user-session');
                            if (response.ok) {
                                   const userData = await response.json();
                                   setUserSession(userData);
                            } else {
                                   console.error('No user session found');
                                   // Optionally redirect to login page
                                   // window.location.href = '/login';
                            }
                     } catch (error) {
                            console.error('Error fetching user session:', error);
                     }
              };
              
              fetchUserSession();
       }, []);

       // Auto-scroll to bottom when new messages are added
       useEffect(() => {
              if (chatBoxRef.current) {
                     chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
              }
       }, [messages]);

       // Prevent body scroll when sidebar is open
       useEffect(() => {
              if (showSidebar) {
                     document.body.style.overflow = 'hidden';
              } else {
                     document.body.style.overflow = 'unset';
              }
              
              // Cleanup on unmount
              return () => {
                     document.body.style.overflow = 'unset';
              };
       }, [showSidebar]);

       const handleSend = async () => {
              if (!input.trim()) return;
              
              // Check if user session is available
              if (!userSession) {
                     setMessages((prev) => [...prev, { 
                            type: 'system', 
                            text: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' 
                     }]);
                     return;
              }
              
              const userMessage = { type: 'user', text: input };
              setMessages((prev) => [...prev, userMessage]);
              const userPrompt = input;
              setInput('');
              setMessages((prev) => [...prev, { type: 'system', text: 'Sending API...' }]);
              setLoading(true);

              try {
                     // API call through Next.js proxy route to avoid CORS issues
                     const response = await fetch('/api/fetch-response', {
                            method: 'POST',
                            headers: {
                                   'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                   k: 10,
                                   room_id: userSession.uroom_id,
                                   year_id: userSession.uyear_id,
                                   subject_id: selectedSubject,
                                   prompt: userPrompt
                            })
                     });

                     if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                     }

                     const data = await response.json();
                     
                     // Handle different response structures
                     let aiResponse = '';
                     if (data.message && data.message.content) {
                            // New Ollama-style structure with message object
                            aiResponse = data.message.content;
                     } else if (data.data) {
                            // Original expected structure
                            aiResponse = data.data;
                     } else if (data.message && typeof data.message === 'string') {
                            // Simple message field
                            aiResponse = data.message;
                     } else if (typeof data === 'string') {
                            // Direct string response
                            aiResponse = data;
                     } else {
                            // Fallback - try to stringify the response for debugging
                            aiResponse = 'Received unexpected response format. Please check the API.';
                            console.log('Full API response:', data);
                     }
                     
                     setMessages((prev) => [
                            ...prev.slice(0, -1),
                            { type: 'ai', text: aiResponse || 'No response content received' },
                     ]);
                     
              } catch (error) {
                     console.error('Error fetching response:', error);
                     setMessages((prev) => [
                            ...prev.slice(0, -1),
                            { type: 'system', text: `Error: ${error.message}. Please check if the API server is running.` },
                     ]);
              } finally {
                     setLoading(false);
              }
       };

       const handleLogout = () => {
              // Clear user session state
              setUserSession(null);
              setMessages([]);
              setInput('');
       };

       const handleSubjectChange = (newSubject) => {
              setSelectedSubject(newSubject);
              // Add a system message to indicate subject change
              setMessages((prev) => [...prev, { 
                     type: 'system', 
                     text: `เปลี่ยนวิชาเป็น: ${getSubjectName(newSubject)}` 
              }]);
       };

       const getSubjectName = (subjectId) => {
              const subjects = {
                     'bio': 'ชีวะวิทยา',
                     'thai': 'ไทย',
                     'math': 'คณิต',
                     'physics': 'ฟิสิกส์',
                     'chemistry': 'เคมี',
                     'english': 'อังกฤษ',
                     'social': 'สังคม',
                     'history': 'ประวัติศาสตร์'
              };
              return subjects[subjectId] || subjectId;
       };

       return (
              <div className="page-container">
                     <button className="menuBtn ml-[4px]" onClick={() => setShowSidebar(true)}>
                            <Image src="/icon/bars-solid.svg" alt="Menu" width={24} height={24} />
                     </button>
                     <div className="header-content">
                            <h1 className="header">Thoth</h1>
                            <p className="current-subject">วิชา: {getSubjectName(selectedSubject)}</p>
                     </div>
                     <button className="infoBtn mr-[4px]" onClick={() => setShowInfo(true)}>
                            <Image src="\icon\circle-info-solid.svg" alt="Menu" width={24} height={24} />
                     </button>

                     {showSidebar && <Sidebar 
                            onClose={() => setShowSidebar(false)} 
                            userSession={userSession} 
                            onLogout={handleLogout}
                            selectedSubject={selectedSubject}
                            onSubjectChange={handleSubjectChange}
                     />}
                     {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}

                     <div className="chatBox" ref={chatBoxRef}>
                            {messages.map((msg, i) => (
                                   <ChatMessage 
                                          key={i} 
                                          type={msg.type} 
                                          text={typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)} 
                                   />
                            ))}
                     </div>

                     <div className="inputSection">
                            <div className="inputContainer">
                                   <input
                                          value={input}
                                          onChange={(e) => setInput(e.target.value)}
                                          onKeyPress={(e) => {
                                                 if (e.key === 'Enter' && !loading) {
                                                        handleSend();
                                                 }
                                          }}
                                          placeholder="พิมพ์ข้อความของคุณที่นี่"
                                          disabled={loading}
                                   />
                                   <button 
                                          onClick={handleSend} 
                                          className={`sendBtn ${loading ? 'loading' : ''}`}
                                          disabled={loading || !input.trim()}
                                   >
                                          {loading ? <Image src="\icon\hourglass-half-solid.svg" alt="Send" width={14} height={14} /> : <Image src="\icon\circle-up-solid.svg" alt="Send" width={24} height={24} />}
                                   </button>
                            </div>
                     </div>
              </div>
       );
}