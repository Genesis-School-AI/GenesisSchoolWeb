// pages/index.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import InfoPopup from './components/InfoPopup';
import ChatMessage from './components/ChatMessage';
import Image from 'next/image';

export default function Home() {
       const router = useRouter();
       const [showSidebar, setShowSidebar] = useState(false);
       const [showInfo, setShowInfo] = useState(false);
       const [messages, setMessages] = useState([]);
       const [chatHistory, setChatHistory] = useState([]);
       const [input, setInput] = useState('');
       const [loading, setLoading] = useState(false);
       const [userSession, setUserSession] = useState(null);
       const [selectedSubject, setSelectedSubject] = useState('bio'); // Default to biology
       const chatBoxRef = useRef(null);
       const HISTORY_COUNT = 3; // Default history count

       // Load saved subject from localStorage on mount
       useEffect(() => {
              if (typeof window !== 'undefined') {
                     const savedSubject = localStorage.getItem('selectedSubject');
                     if (savedSubject) {
                            setSelectedSubject(savedSubject);
                     }
              }
       }, []);

       // Fetch user session on component mount
       useEffect(() => {
              const fetchUserSession = async () => {
                     try {
                            const response = await fetch('/api/user-session');
                            if (response.ok) {
                                   const userData = await response.json();
                                   setUserSession(userData);
                                   // Load chat history after getting user session
                                   loadChatHistory();
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

       // Load chat history from the database
       const loadChatHistory = async () => {
              try {
                     const response = await fetch('/api/chat-history');
                     if (response.ok) {
                            const data = await response.json();
                            if (data.success && data.messages) {
                                   // Process messages to create chat history (prompt/respond in one row)
                                   const processedHistory = data.messages.map(msg => ({
                                          user: msg.mtext,
                                          ai: msg.mrespond
                                   }));
                                   setChatHistory(processedHistory);
                                   // Display last 10 messages in the chat interface
                                   displayRecentMessages(data.messages);
                            }
                     }
              } catch (error) {
                     console.error('Error loading chat history:', error);
              }
       };

       // Display recent messages in the chat interface
       const displayRecentMessages = (dbMessages) => {
              // Show both prompt and respond from each row
              const displayMessages = [];
              for (let i = 0; i < dbMessages.length; i++) {
                     const msg = dbMessages[i];
                     if (msg.mtext) {
                            displayMessages.push({ type: 'user', text: msg.mtext });
                     }
                     if (msg.mrespond) {
                            displayMessages.push({ type: 'ai', text: msg.mrespond });
                     }
              }
              setMessages(displayMessages);
       };

       // Prepare chat history for API request (last N conversations)
       const prepareChatHistoryForAPI = () => {
              const historyForAPI = {};
              const availableHistory = Math.min(chatHistory.length, HISTORY_COUNT);
              
              // Use only the history we have if it's less than the requirement
              const startIndex = Math.max(0, chatHistory.length - availableHistory);
              const recentHistory = chatHistory.slice(startIndex);
              
              recentHistory.forEach((conversation, index) => {
                     historyForAPI[conversation.user] = conversation.ai;
              });
              
              return historyForAPI;
       };

       // Save new conversation to database
       const saveChatHistory = async (userPrompt, aiResponse) => {
              try {
                     const response = await fetch('/api/chat-history', {
                            method: 'POST',
                            headers: {
                                   'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                   userPrompt,
                                   aiResponse
                            })
                     });
                     
                     if (response.ok) {
                            // Update local chat history
                            setChatHistory(prev => [...prev, { user: userPrompt, ai: aiResponse }]);
                     }
              } catch (error) {
                     console.error('Error saving chat history:', error);
              }
       };

       // Clear all chat history
       const clearChatHistory = async () => {
              try {
                     const response = await fetch('/api/chat-history', {
                            method: 'DELETE'
                     });
                     
                     if (response.ok) {
                            setChatHistory([]);
                            setMessages([]);
                     }
              } catch (error) {
                     console.error('Error clearing chat history:', error);
              }
       };

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
                     // Prepare last 3 recent chat history (prompt+respond)
                     const historyForAPI = {};
                     const availableHistory = Math.min(chatHistory.length, 3);
                     const startIndex = Math.max(0, chatHistory.length - availableHistory);
                     const recentHistory = chatHistory.slice(startIndex);
                     recentHistory.forEach((conversation, idx) => {
                            if (conversation.user && conversation.ai) {
                                   historyForAPI[conversation.user] = conversation.ai;
                            }
                     });

                     // Debugger: log the last 3 chat pairs
                     console.debug('Last 3 chat history (prompt/respond):', recentHistory);

                     // Add history into the prompt string
                     let promptWithHistory = '';
                     if (Object.keys(historyForAPI).length > 0) {
                            Object.entries(historyForAPI).forEach(([user, ai], idx) => {
                                   promptWithHistory += `ประวัติแชทล่าสุด ${idx + 1}:\nผู้ใช้: ${user}\nตอบกลับ: ${ai}\n`;
                            });
                            promptWithHistory += `\n`; // Separate from new prompt
                     }
                     promptWithHistory += "|| Currentprompt : " + userPrompt;

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
                                   prompt: promptWithHistory // Add history into prompt
                            })
                     });

                     if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} - Fetch data {room_id : ${userSession.uroom_id}, room_id : ${userSession.uyear_id}, subject_id : ${selectedSubject}, prompt : ${promptWithHistory}}`);
                     }

                     const data = await response.json();
                     
                     // Handle different response structures
                     let aiResponse = '';
                     if (data.data && data.data.content) {
                            // New structure with data.data.content
                            aiResponse = data.data.content;
                     } else if (data.message && data.message.content) {
                            // Ollama-style structure with message object
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
                     
                     // Save conversation to database
                     if (aiResponse) {
                            await saveChatHistory(userPrompt, aiResponse);
                     }
                     
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
              setChatHistory([]);
              setInput('');
       };

       const handleSubjectChange = (newSubject) => {
              setSelectedSubject(newSubject);
              // Save to localStorage for persistence
              if (typeof window !== 'undefined') {
                     localStorage.setItem('selectedSubject', newSubject);
              }
              // Don't add system message - just silently update the subject
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
                     'history': 'ประวัติศาสตร์',
                     'com': 'คอมพิวเตอร์',

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