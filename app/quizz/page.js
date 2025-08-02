'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '../components/Sidebar';
import InfoPopup from '../components/InfoPopup';

import '../quizz.css';

const apiKey = process.env.GEMINI_API_KEY;


export default function QuizPage() {
       const [userSession, setUserSession] = useState(null);
       const [questions, setQuestions] = useState([]); // Store all 5 questions
       const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
       const [userAnswers, setUserAnswers] = useState({}); // Store user's answers
       const [selectedAnswer, setSelectedAnswer] = useState(null);
       const [loading, setLoading] = useState(false);
       const [initialLoading, setInitialLoading] = useState(true); // For the popup
       const [questionNumber, setQuestionNumber] = useState(1);
       const [totalQuestions] = useState(5);
       const [showSidebar, setShowSidebar] = useState(false);
       const [selectedSubject, setSelectedSubject] = useState('bio');
       const [quizCompleted, setQuizCompleted] = useState(false);
       const [score, setScore] = useState(0);
       const [questionResults, setQuestionResults] = useState([]); // Store detailed results for each question
       const [retryCount, setRetryCount] = useState(0); // Track retry attempts
       const [errorMessage, setErrorMessage] = useState(''); // Store error messages
       const [showInfo, setShowInfo] = useState(false);

       // Function to show custom modal for errors
       const showErrorModal = (message) => {
              if (typeof window !== 'undefined') {
                     // Use a custom modal for better UX
                     const modal = document.createElement('div');
                     modal.style.position = 'fixed';
                     modal.style.top = '0';
                     modal.style.left = '0';
                     modal.style.width = '100vw';
                     modal.style.height = '100vh';
                     modal.style.background = 'rgba(0,0,0,0.5)';
                     modal.style.display = 'flex';
                     modal.style.alignItems = 'center';
                     modal.style.justifyContent = 'center';
                     modal.style.zIndex = '9999';

                     const box = document.createElement('div');
                     box.style.background = '#fff';
                     box.style.padding = '32px 24px';
                     box.style.borderRadius = '12px';
                     box.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
                     box.style.textAlign = 'center';
                     box.style.maxWidth = '90vw';
                     box.style.minWidth = '300px';

                     const msg = document.createElement('div');
                     msg.textContent = message;
                     msg.style.marginBottom = '24px';
                     msg.style.fontSize = '1.1rem';

                     const btn = document.createElement('button');
                     btn.textContent = 'กลับหน้าหลัก';
                     btn.style.background = '#0070f3';
                     btn.style.color = '#fff';
                     btn.style.border = 'none';
                     btn.style.padding = '10px 24px';
                     btn.style.borderRadius = '6px';
                     btn.style.fontSize = '1rem';
                     btn.style.cursor = 'pointer';
                     btn.onclick = () => {
                            window.location.href = '/';
                     };

                     box.appendChild(msg);
                     box.appendChild(btn);
                     modal.appendChild(box);
                     document.body.appendChild(modal);
              }
              setQuestions([]); // Prevent undefined access
              setInitialLoading(false);
       };

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
                            } else {
                                   console.error('No user session found');
                                   setInitialLoading(false);
                            }
                     } catch (error) {
                            console.error('Error fetching user session:', error);
                            setInitialLoading(false);
                     }
              };

              fetchUserSession();
       }, []);

       // Fetch questions when both user session and selected subject are available
       useEffect(() => {
              if (userSession && selectedSubject) {
                     fetchAllQuestions(userSession);
              }
       }, [userSession, selectedSubject]);

       // Update selected answer when current question changes
       useEffect(() => {
              setSelectedAnswer(userAnswers[currentQuestionIndex] || null);
       }, [currentQuestionIndex, userAnswers]);

       const fetchAllQuestions = async (session = userSession, retryAttempt = 0) => {
              if (!session) return;

              setInitialLoading(true);
              setErrorMessage('');

              try {
                     const response = await fetch('/api/fetch-response', {
                            method: 'POST',
                            headers: {
                                   'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                   k: 10,
                                   room_id: session.uroom_id,
                                   year_id: session.uyear_id,
                                   subject_id: selectedSubject,
                                   prompt: `กรุณาปฎิบัติตามข้อความต่อไปนี้อย่างเคร่งครัดและห้ามทำนอกเหนือจากนี้ --> 1.ห้ามถามกลับ 2.ทำตามคำสั่ง 3.สร้างคำถามปรนัยเกี่ยวกับวิชา${getSubjectName(selectedSubject)}ให้เป็นคำถามที่มีเนื้อหาถูกต้องและมีความหมาย 

กรุณาส่งผลลัพธ์ในรูปแบบ JSON array ที่มีรูปแบบดังนี้:
[
  {
    "question": "คำถามที่มีความหมายและเกี่ยวกับ${getSubjectName(selectedSubject)}",
    "choices": {
      "a": "ตัวเลือกที่ 1",
      "b": "ตัวเลือกที่ 2", 
      "c": "ตัวเลือกที่ 3",
      "d": "ตัวเลือกที่ 4"
    },
    "correct": "หนึ่งในตัวเลือก a, b, c, หรือ d"
  }
]

ข้อกำหนด:
1. ต้องมีคำถาม 5 ข้อเท่านั้น
2. คำถามต้องเกี่ยวกับ${getSubjectName(selectedSubject)} และไม่คลุมเคลือ
3. แต่ละข้อต้องมี 4 ตัวเลือก (a, b, c, d) ไม่ซ้ำกัน
4. ต้องระบุคำตอบที่ถูกต้องในฟิลด์ "correct"
5. ส่งเฉพาะ JSON array ไม่ต้องมีข้อความอื่น`
                            })
                     });

                     if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                     }

                     const data = await response.json();

                     // Check if data contains error details
                     if (data && data.error && data.details) {
                            showErrorModal(data.details);
                            return;
                     }

                     // Check for nested error in data.data.content
                     if (data && data.data && data.data.content && 
                         typeof data.data.content === 'object' && 
                         data.data.content.error && data.data.content.details) {
                            showErrorModal(data.data.content.details);
                            return;
                     }

                     // Parse the AI response to extract JSON array
                     let questionsData;
                     try {
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
                            }

                            console.log('AI Response:', aiResponse, '- subject', getSubjectName(selectedSubject)); // Debug log

                            // Clean the response - remove markdown formatting and extra text
                            aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

                            // Log cleaned response
                            console.log('Cleaned AI Response:', aiResponse);

                            // Try to extract JSON array from the response
                            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
                            if (jsonMatch) {
                                   const parsedData = JSON.parse(jsonMatch[0]);

                                   // Validate the parsed data
                                   if (Array.isArray(parsedData) && parsedData.length >= 5) {
                                          // Validate each question structure and content quality
                                          const validQuestions = parsedData.slice(0, 5).filter(q => {
                                                 // Basic structure validation
                                                 if (!q.question || !q.choices || !q.correct || typeof q.choices !== 'object') {
                                                        return false;
                                                 }

                                                 // Ensure we have exactly 4 choices labeled a, b, c, d
                                                 const choiceKeys = Object.keys(q.choices);
                                                 if (choiceKeys.length !== 4 || !['a', 'b', 'c', 'd'].every(key => key in q.choices)) {
                                                        return false;
                                                 }

                                                 // Validate correct answer
                                                 if (!['a', 'b', 'c', 'd'].includes(q.correct)) {
                                                        return false;
                                                 }

                                                 // Content quality validation
                                                 const question = q.question.trim();
                                                 if (question.length < 10 || question.length > 500) {
                                                        return false;
                                                 }

                                                 // Validate each choice
                                                 const choices = Object.values(q.choices);
                                                 if (choices.some(choice => !choice || choice.trim().length < 2 || choice.trim().length > 200)) {
                                                        return false;
                                                 }

                                                 // Check for nonsense or repetitive content
                                                 const allText = [question, ...choices].join(' ').toLowerCase();

                                                 // Avoid questions with excessive repetition
                                                 const words = allText.split(/\s+/);
                                                 const uniqueWords = new Set(words);
                                                 if (words.length > 5 && uniqueWords.size / words.length < 0.5) {
                                                        return false;
                                                 }

                                                 // Check for common nonsense patterns
                                                 const nonsensePatterns = [
                                                        /[a-z]{20,}/, // Very long strings without spaces
                                                        /(.)\1{10,}/, // Repeated characters
                                                        /^\s*[a-z]\s*$/i, // Single letter answers
                                                        /^\s*\d+\s*$/, // Pure number questions/answers without context
                                                 ];

                                                 if (nonsensePatterns.some(pattern => pattern.test(allText))) {
                                                        return false;
                                                 }

                                                 return true;
                                          });

                                          if (validQuestions.length >= 5) {
                                                 // Sanitize the questions before setting them
                                                 questionsData = validQuestions.slice(0, 5).map(q => ({
                                                        question: sanitizeText(q.question),
                                                        choices: {
                                                               a: sanitizeText(q.choices.a),
                                                               b: sanitizeText(q.choices.b),
                                                               c: sanitizeText(q.choices.c),
                                                               d: sanitizeText(q.choices.d)
                                                        },
                                                        correct: q.correct
                                                 }));
                                          } else {
                                                 console.warn(`Only ${validQuestions.length} valid questions found, need 5`);
                                                 throw new Error('Not enough valid questions in response');
                                          }
                                   } else {
                                          throw new Error('Invalid data structure or not enough questions');
                                   }
                            } else {
                                   throw new Error('No JSON array found in response');
                            }
                     } catch (parseError) {
                            console.error('Error parsing questions data:', parseError);
                            console.log('Raw response:', data); // Debug log

                            // Retry once if parsing fails and we haven't retried yet
                            if (retryAttempt < 1) {
                                   console.log('Retrying question fetch...');
                                   setRetryCount(retryAttempt + 1);
                                   await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                                   return fetchAllQuestions(session, retryAttempt + 1);
                            }

                            // Show error modal instead of banner
                            if (data && data.details) {
                                   showErrorModal(data.details);
                                   return;
                            } else {
                                   showErrorModal('ไม่สามารถสร้างคำถามได้ กรุณาลองใหม่ภายหลังหรือติดต่อฝ่ายผู้ดูแลระบบ');
                                   return;
                            }
                     }

                     setQuestions(questionsData);

              } catch (error) {
                     console.error('Error fetching questions:', error);

                     // Retry once if network error and we haven't retried yet
                     if (retryAttempt < 1) {
                            console.log('Retrying due to network error...');
                            setRetryCount(retryAttempt + 1);
                            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                            return fetchAllQuestions(session, retryAttempt + 1);
                     }

                     // Show error modal instead of banner
                     showErrorModal('ระบบอยู่ระหว่างการปรับปรุง กรุณาลองใหม่ภายหลังหรือติดต่อฝ่ายผู้ดูแลระบบ');
                     return;
              } finally {
                     setInitialLoading(false);
              }
       };

       const handleAnswerSelect = (choice) => {
              setSelectedAnswer(choice);
              // Store the answer for this question
              setUserAnswers(prev => ({
                     ...prev,
                     [currentQuestionIndex]: choice
              }));
       };

       const handleNextQuestion = () => {
              if (currentQuestionIndex < questions.length - 1) {
                     setCurrentQuestionIndex(prev => prev + 1);
                     setQuestionNumber(prev => prev + 1);
              } else {
                     // Last question - calculate score and show results
                     calculateScoreAndFinish();
              }
       };

       const handlePreviousQuestion = () => {
              if (currentQuestionIndex > 0) {
                     setCurrentQuestionIndex(prev => prev - 1);
                     setQuestionNumber(prev => prev - 1);
              }
       };

       const calculateScoreAndFinish = () => {
              let correctAnswers = 0;
              const results = [];

              questions.forEach((question, index) => {
                     const userAnswer = userAnswers[index];
                     const isCorrect = userAnswer === question.correct;

                     if (isCorrect) {
                            correctAnswers++;
                     }

                     results.push({
                            questionNumber: index + 1,
                            question: question.question,
                            userAnswer: userAnswer,
                            correctAnswer: question.correct,
                            choices: question.choices,
                            isCorrect: isCorrect
                     });
              });

              setScore(correctAnswers);
              setQuestionResults(results);
              setQuizCompleted(true);
       };

       const restartQuiz = () => {
              setCurrentQuestionIndex(0);
              setQuestionNumber(1);
              setUserAnswers({});
              setSelectedAnswer(null);
              setQuizCompleted(false);
              setScore(0);
              setQuestionResults([]);
              setRetryCount(0);
              setErrorMessage('');
              // Fetch new questions
              fetchAllQuestions();
       };

       const handleLogout = () => {
              // Clear user session state
              setUserSession(null);
              setQuestions([]);
              setSelectedAnswer(null);
              setQuestionNumber(1);
              setCurrentQuestionIndex(0);
              setUserAnswers({});
              setQuizCompleted(false);
              setScore(0);
       };

       const handleSubjectChange = (newSubject) => {
              setSelectedSubject(newSubject);
              // Save to localStorage for persistence
              if (typeof window !== 'undefined') {
                     localStorage.setItem('selectedSubject', newSubject);
              }
              // Reset quiz when subject changes
              setQuestionNumber(1);
              setCurrentQuestionIndex(0);
              setUserAnswers({});
              setQuizCompleted(false);
              setScore(0);
              setRetryCount(0);
              setErrorMessage('');
              // fetchAllQuestions will be called automatically by the useEffect
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

       const getFallbackQuestions = (subject) => {
              const questionSets = {
                     'bio': [
                            {
                                   question: "ATP ย่อมาจากอะไร?",
                                   choices: {
                                          a: "Adenosine Diphosphate",
                                          b: "Adenosine Triphosphate",
                                          c: "Adenosine Monophosphate",
                                          d: "Adenosine Tetraphosphate"
                                   },
                                   correct: "b"
                            },
                            {
                                   question: "เซลล์พืชมีออร์แกเนลล์ใดที่เซลล์สัตว์ไม่มี?",
                                   choices: {
                                          a: "ไมโตคอนเดรีย",
                                          b: "ไรโบโซม",
                                          c: "คลอโรพลาสต์",
                                          d: "นิวเคลียส"
                                   },
                                   correct: "c"
                            },
                            {
                                   question: "DNA ประกอบด้วยเบสใดบ้าง?",
                                   choices: {
                                          a: "A, T, G, C",
                                          b: "A, U, G, C",
                                          c: "A, T, G, U",
                                          d: "T, U, G, C"
                                   },
                                   correct: "a"
                            },
                            {
                                   question: "กระบวนการหายใจของพืชเกิดขึ้นที่ใด?",
                                   choices: {
                                          a: "ใบเท่านั้น",
                                          b: "รากเท่านั้น",
                                          c: "ทุกส่วนของพืช",
                                          d: "ลำต้นเท่านั้น"
                                   },
                                   correct: "c"
                            },
                            {
                                   question: "ฮอร์โมนใดควบคุมระดับน้ำตาลในเลือด?",
                                   choices: {
                                          a: "อะดรีนาลิน",
                                          b: "อินซูลิน",
                                          c: "ไทรอยด์",
                                          d: "เอสโตรเจน"
                                   },
                                   correct: "b"
                            }
                     ],
                     'math': [
                            {
                                   question: "ผลคูณของ (x + 2)(x - 3) คือ",
                                   choices: {
                                          a: "x² - x - 6",
                                          b: "x² + x - 6",
                                          c: "x² - x + 6",
                                          d: "x² + x + 6"
                                   },
                                   correct: "a"
                            },
                            {
                                   question: "ค่า sin 30° เท่ากับ",
                                   choices: {
                                          a: "1/2",
                                          b: "√3/2",
                                          c: "√2/2",
                                          d: "1"
                                   },
                                   correct: "a"
                            },
                            {
                                   question: "สมการ 2x + 5 = 13 มีผลลัพธ์ x เท่ากับ",
                                   choices: {
                                          a: "3",
                                          b: "4",
                                          c: "5",
                                          d: "6"
                                   },
                                   correct: "b"
                            },
                            {
                                   question: "ถ้า a = 3 และ b = 4 แล้ว a² + b² เท่ากับ",
                                   choices: {
                                          a: "24",
                                          b: "25",
                                          c: "26",
                                          d: "49"
                                   },
                                   correct: "b"
                            },
                            {
                                   question: "พื้นที่ของสามเหลี่ยมที่มีฐาน 8 ซม. และสูง 6 ซม. เท่ากับ",
                                   choices: {
                                          a: "24 ตร.ซม.",
                                          b: "48 ตร.ซม.",
                                          c: "14 ตร.ซม.",
                                          d: "28 ตร.ซม."
                                   },
                                   correct: "a"
                            }
                     ],
                     'physics': [
                            {
                                   question: "หน่วยของแรงในระบบ SI คือ",
                                   choices: {
                                          a: "จูล",
                                          b: "นิวตัน",
                                          c: "วัตต์",
                                          d: "ปาสคาล"
                                   },
                                   correct: "b"
                            },
                            {
                                   question: "ความเร่งโน้มถ่วงของโลกประมาณ",
                                   choices: {
                                          a: "9.8 m/s²",
                                          b: "10.8 m/s²",
                                          c: "8.9 m/s²",
                                          d: "11.2 m/s²"
                                   },
                                   correct: "a"
                            },
                            {
                                   question: "แสงเดินทางในสุญญากาศด้วยความเร็ว",
                                   choices: {
                                          a: "3 × 10⁸ m/s",
                                          b: "3 × 10⁷ m/s",
                                          c: "3 × 10⁹ m/s",
                                          d: "3 × 10⁶ m/s"
                                   },
                                   correct: "a"
                            },
                            {
                                   question: "กฎข้อใดของนิวตันกล่าวถึงความเฉื่อย?",
                                   choices: {
                                          a: "กฎข้อที่ 1",
                                          b: "กฎข้อที่ 2",
                                          c: "กฎข้อที่ 3",
                                          d: "กฎข้อที่ 4"
                                   },
                                   correct: "a"
                            },
                            {
                                   question: "หน่วยของพลังงานคือ",
                                   choices: {
                                          a: "นิวตัน",
                                          b: "จูล",
                                          c: "วัตต์",
                                          d: "แอมแปร์"
                                   },
                                   correct: "b"
                            }
                     ],
                     'chemistry': [
                            {
                                   question: "สัญลักษณ์ของธาตุทองคำคือ",
                                   choices: {
                                          a: "Go",
                                          b: "Au",
                                          c: "Ag",
                                          d: "Al"
                                   },
                                   correct: "b"
                            },
                            {
                                   question: "สูตรเคมีของน้ำคือ",
                                   choices: {
                                          a: "H₂O",
                                          b: "HO",
                                          c: "H₃O",
                                          d: "H₂O₂"
                                   },
                                   correct: "a"
                            },
                            {
                                   question: "ธาตุที่มีเลขอะตอม 6 คือ",
                                   choices: {
                                          a: "ออกซิเจน",
                                          b: "ไนโตรเจน",
                                          c: "คาร์บอน",
                                          d: "ไฮโดรเจน"
                                   },
                                   correct: "c"
                            },
                            {
                                   question: "ค่า pH ของน้ำบริสุทธิ์ที่อุณหภูมิห้องคือ",
                                   choices: {
                                          a: "6",
                                          b: "7",
                                          c: "8",
                                          d: "9"
                                   },
                                   correct: "b"
                            },
                            {
                                   question: "สารที่ใช้เป็นตัวทำละลายสากลคือ",
                                   choices: {
                                          a: "แอลกอฮอล์",
                                          b: "น้ำ",
                                          c: "น้ำมัน",
                                          d: "เบนซิน"
                                   },
                                   correct: "b"
                            }
                     ]
              };

              return questionSets[subject] || questionSets['chemistry']; // Default to biology if subject not found
       };

       const sanitizeText = (text) => {
              if (!text) return '';
              return text
                     .trim()
                     .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                     .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s\.,\?\!\(\)\-\+\=\×\÷\%\°\²\³\€\$\[\]]/g, '') // Allow Thai, English, numbers, and common symbols
                     .substring(0, 500); // Limit length
       };

       const progressPercentage = (questionNumber / totalQuestions) * 100;
       const currentQuestion = questions[currentQuestionIndex];

       return (
              <div className="quiz-container">
                     {/* Loading Popup */}
                     {initialLoading && (
                            <div className="loading-popup">
                                   <div className="loading-popup-content">
                                          <div className="loading-spinner"></div>
                                          <h3>กำลังโหลดคำถาม...</h3>
                                          <p>กรุณารอสักครู่ ระบบกำลังสร้างคำถาม 5 ข้อให้คุณ</p>
                                          {retryCount > 0 && (
                                                 <p className="retry-message">กำลังลองใหม่... (ครั้งที่ {retryCount + 1})</p>
                                          )}
                                   </div>
                            </div>
                     )}

                     {/* Error messages are now shown as modal popups */}

                     {/* Quiz Completed - Score Board */}
                     {quizCompleted && (
                            <div className="score-popup ">
                                   <div className="score-popup-content ">
                                          <h2>🎉 ผลการทำแบบทดสอบ</h2>
                                          <div className="score-display">
                                                 <div className="score-number">{score}</div>
                                                 <div className="score-total">/ {totalQuestions}</div>
                                          </div>
                                          {/* <div className="score-percentage">
                                                 {Math.round((score / totalQuestions) * 100)}%
                                          </div> */}
                                          <div className="score-message">
                                                 {score === totalQuestions ? "🌟 ยอดเยี่ยม! คุณได้คะแนนเต็ม!" :
                                                        score >= totalQuestions * 0.8 ? "👏 เก่งมาก! คุณมีความเข้าใจดี" :
                                                               score >= totalQuestions * 0.6 ? "👍 ดี! ยังมีโอกาสพัฒนาอีก" :
                                                                      "💪 อย่าท้อ! ลองทบทวนและเริ่มใหม่นะ"}
                                          </div>

                                          {/* Question Results Summary */}
                                          <div className="question-results">
                                                 <h3>สรุปผลการตอบ</h3>
                                                 <div className="results-list">
                                                        {questionResults.map((result, index) => (
                                                               <div
                                                                      key={index}
                                                                      className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                                                               >
                                                                      <div className="result-header">
                                                                             <span className="question-num">ข้อ {result.questionNumber}</span>
                                                                             <span className={`result-status ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                                                                                    {result.isCorrect ? '✓ ถูก' : '✗ ผิด'}
                                                                             </span>
                                                                      </div>
                                                                      <div className="result-question">
                                                                             {result.question}
                                                                      </div>
                                                                      <div className="result-answers">
                                                                             <div className="answer-row">
                                                                                    <span className="answer-label">คำตอบของคุณ:</span>
                                                                                    <span className={`answer-choice ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                                                                                           ({result.userAnswer?.toUpperCase()}) {result.choices[result.userAnswer]}
                                                                                    </span>
                                                                             </div>
                                                                             {!result.isCorrect && (
                                                                                    <div className="answer-row">
                                                                                           <span className="answer-label">คำตอบที่ถูก:</span>
                                                                                           <span className="answer-choice correct">
                                                                                                  ({result.correctAnswer?.toUpperCase()}) {result.choices[result.correctAnswer]}
                                                                                           </span>
                                                                                    </div>
                                                                             )}
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>
                                          <div className="score-actions">
                                                 <button className="restart-btn" onClick={restartQuiz}>
                                                        ทำใหม่อีกครั้ง
                                                 </button>
                                                 <button className="back-btn" onClick={() => window.location.href = '/'}>
                                                        กลับหน้าหลัก
                                                 </button>
                                          </div>
                                   </div>
                            </div>
                     )}
                     {/* Sidebar */}
                     {showSidebar && <Sidebar
                            onClose={() => setShowSidebar(false)}
                            userSession={userSession}
                            onLogout={handleLogout}
                            selectedSubject={selectedSubject}
                            onSubjectChange={handleSubjectChange}
                     />}

                     {/* info */}
                     {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}

                     {/* Header */}
                     <div className="quiz-header">
                            <button className="quiz-menu-btn z-[9999]"  onClick={() => setShowSidebar(true)}>
                                   <Image src="/icon/bars-solid.svg" alt="Menu" width={24} height={24} />
                            </button>
                            <h1 className="quiz-title">Thoth</h1>
                            <button className="quiz-info-btn" onClick={() => setShowInfo(true)}>
                                   <Image src="/icon/circle-info-solid.svg" alt="Info" width={24} height={24} />
                            </button>
                     </div>

                     {/* Question Number */}
                     <div className="question-counter">
                            คำถามที่ {questionNumber} จาก {totalQuestions}
                     </div>

                     {/* Progress Bar */}
                     <div className="progress-container">
                            <div className="progress-bar">
                                   <div
                                          className="progress-fill"
                                          style={{ width: `${progressPercentage}%` }}
                                   ></div>
                            </div>
                     </div>

                     {/* Question Content */}
                     <div className="question-content">
                            {questions.length === 0 && !initialLoading ? (
                                   <div className="no-question hidden">
                                          <p>ไม่สามารถโหลดคำถามได้</p>
                                          <button
                                                 onClick={() => {
                                                        window.location.href = '/';
                                                 }}
                                                 className="retry-btn"
                                          >
                                                 กลับหน้าหลัก
                                          </button>
                                   </div>
                            ) : currentQuestion ? (
                                   <>
                                          <h2 className="question-text">{currentQuestion.question}</h2>

                                          <div className="choices-container">
                                                 {Object.entries(currentQuestion.choices || {}).map(([key, value]) => (
                                                        <button
                                                               key={key}
                                                               className={`choice-button ${selectedAnswer === key ? 'selected' : ''}`}
                                                               onClick={() => handleAnswerSelect(key)}
                                                        >
                                                               <span className="choice-number">({key.toUpperCase()})</span>
                                                               <span className="choice-text">{value}</span>
                                                        </button>
                                                 ))}
                                          </div>
                                   </>
                            ) : null}
                     </div>

                     {/* Navigation Buttons */}
                     {!quizCompleted && questions.length > 0 && (
                            <div className="quiz-navigation">
                                   <button
                                          className="nav-button prev-button"
                                          onClick={handlePreviousQuestion}
                                          disabled={currentQuestionIndex === 0}
                                   >
                                          ย้อน
                                   </button>
                                   <button
                                          className="nav-button next-button"
                                          onClick={handleNextQuestion}
                                          disabled={!selectedAnswer}
                                   >
                                          {currentQuestionIndex === questions.length - 1 ? 'ส่งคำตอบ' : 'ต่อไป'}
                                   </button>
                            </div>
                     )}
              </div>
       );
}
