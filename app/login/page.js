import Image from "next/image";

export default function Home() {
  return (
    <div className="login-bg">
      <div className="login-container">
          <p>เข้าสู่ระบบ</p>

          <div className="mb-3">
            <input type="text" placeholder="ชื่อผู้ใช้" className="input-field" />
          </div>
      </div>
    </div>
  );
}
