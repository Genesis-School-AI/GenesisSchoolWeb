// pages/index.js
'use client';
import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import InfoPopup from './components/InfoPopup';
import ChatMessage from './components/ChatMessage';

export default function Home() {
       const [showSidebar, setShowSidebar] = useState(false);
       const [showInfo, setShowInfo] = useState(false);
       const [messages, setMessages] = useState([]);
       const [input, setInput] = useState('');
       const [loading, setLoading] = useState(false);
       const [userSession, setUserSession] = useState(null);
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
                                   subject_id: "bio",
                                   prompt: userPrompt
                            })
                     });

                     if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                     }

                     const data = await response.json();
                     
                     setMessages((prev) => [
                            ...prev.slice(0, -1),
                            { type: 'ai', text: data.data || 'No response data received' },
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

       return (
              <div className="page-container">
                     <button className="menuBtn" onClick={() => setShowSidebar(true)}>☰</button>
                     <h1 className="header">Thoth</h1>
                     <button className="infoBtn" onClick={() => setShowInfo(true)}>i</button>

                     {showSidebar && <Sidebar onClose={() => setShowSidebar(false)} userSession={userSession} onLogout={handleLogout} />}
                     {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}

                     <div className="chatBox" ref={chatBoxRef}>
                            {messages.map((msg, i) => (
                                   <ChatMessage key={i} type={msg.type} text={msg.text} />
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
                                          {loading ? '⏳' : '↥'}
                                   </button>
                            </div>
                     </div>
              </div>
       );
}