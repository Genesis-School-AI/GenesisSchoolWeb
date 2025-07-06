export default function InfoPopup({ onClose }) {
  return (
    <div className="popup">
      <div className="popup-inner">
        <button onClick={onClose}>✖</button>
        <h3>วิธีใช้งาน</h3>
        <p>พิมพ์คำถามหรือข้อความในกล่องด้านล่าง แล้วกดส่งเพื่อพูดคุยกับ AI</p>
      </div>
    </div>
  );
}
