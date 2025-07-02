'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";



export default function Home() {

    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="login-bg">
            <div className="login-container relative py-[50px]">
                <p className="mt-[40px] mb-[70px] text-[36px] font-bold">เข้าสู่ระบบ</p>

                <div className="w-[100%] m-auto flex flex-col justify-center items-center">
                    <div className="mb-[60px] relative form-group">

                        <input type="text" id="name" required placeholder=" " />
                        <label
                            htmlFor="name"
                            className=""
                        >
                            ชื่อผู้ใช้
                        </label>
                    </div>

                    <div className="mb-[40px] relative form-group">

                        <input type={showPassword ? 'text' : 'password'} id="pass" required placeholder=" " />
                        <label
                            htmlFor="pass"
                            className=""
                        >
                            รหัสผ่าน
                        </label>

                        <span className="toggleIcon " onClick={togglePassword}>
                            <Image
                                src={showPassword ? '/icon/eye-slash-solid.svg' : '/icon/eye-solid.svg'}
                                alt={showPassword ? 'Hide password' : 'Show password'}
                                width={18}
                                height={18}
                            />
                        </span>
                    </div>

                    <div className="terms-container">
                        <label className="checkbox-label">
                            <input type="checkbox" className="checkbox-input" />
                            <span className="checkbox-custom"></span>
                            ยอมรับ&nbsp;<Link href="/" className=" underline">ข้อตกลงและเงื่อนไขการใช้งาน</Link>
                        </label>
                    </div>
                </div>



                <div className="summit-conatianer">
                    <button type="summit">
                        <p className="m-0 p-0">ลงชื่อเข้าใช้</p>
                    </button>

                </div>
                <p className="text-[13px] underline pb-[50] mt-4">ไม่สามารถเข้าสู่ระบบ? โปรดติดต่อผู้ดูแลระบบของคุณ</p>

            </div>
        </div>
    );
}
