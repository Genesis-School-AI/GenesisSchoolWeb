export default function InfoPopup({ onClose }) {

       if (window.location.pathname === '/quizz') {
              return (
                     <div className="popup ">
                            <div className="popup-inner">
                                   <button onClick={onClose}>✖</button>
                                   <h3 className="text-[20px]">วิธีใช้งาน</h3>
                                   <p>Quizz มีคำถาม 5 ข้อจงเลือกคำตอบที่ถูกต้องเพียง 1 ตัวเลือกแล้วจึงกดทำข้อถัดไป</p>
                            </div>
                     </div>
              );
       }else if (window.location.pathname === '/') {
              return (
                     <div className="popup ">
                            <div className="popup-inner">
                                   <button onClick={onClose}>✖</button>
                                   <h3 className="text-[20px]">วิธีใช้งาน</h3>
                                   <p>พิมพ์คำถามหรือข้อความในกล่องด้านล่าง แล้วกดส่งเพื่อพูดคุยกับ AI</p>
                            </div>
                     </div>
              );
       }

}
