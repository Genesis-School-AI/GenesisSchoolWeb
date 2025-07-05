'use client';

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { login } from './actions';

export default function  Home() {
       const [showPassword, setShowPassword] = useState(false);
       const [error, setError] = useState('');
       const [isPending, startTransition] = useTransition();
       const [isAgreed, setIsAgreed] = useState(false);

       const togglePassword = () => {
              setShowPassword((prev) => !prev);
       };

       const handleSubmit = (formData) => {
              startTransition(async () => {
                     setError('');
                     const result = await login(formData);
                     if (result?.error) {
                            setError(result.error);
                     }
              });
       };

       return (
              <div className="login-bg">
                     <div className="login-container relative pb-[50px]">
                            <p className="mt-[40px] mb-[70px] text-[36px] font-bold">เข้าสู่ระบบ</p>

                            <form action={handleSubmit} className="w-[100%] m-auto flex flex-col justify-center items-center">
                                   <div className="mb-[60px] relative form-group">
                                          <input type="text" id="student_id" name="student_id" required placeholder=" " />
                                          <label htmlFor="student_id">รหัสนักเรียน</label>
                                   </div>

                                   <div className="mb-[40px] relative form-group">
                                          <input type={showPassword ? 'text' : 'password'} id="password" name="password" required placeholder=" " />
                                          <label htmlFor="password">รหัสผ่าน</label>

                                          <span className="toggleIcon absolute right-3 top-1/2 transform-translate-y-1/2 cursor-pointer text-white" onClick={togglePassword}>
                                                 <Image 
                                                        src={showPassword ? '/icon/eye-slash-solid.svg' : '/icon/eye-solid.svg'}
                                                        alt={showPassword ? 'Hide password' : 'Show password'}
                                                        width={20}
                                                        height={20}
                                                        onError={(e) => {
                                                               e.target.style.display = 'none';
                                                               e.target.nextSibling.style.display = 'inline';
                                                        }}
                                                 />
                                          </span>
                                   </div>

                                   <div className="terms-container">
                                          <label className="checkbox-label">
                                                 <input
                                                        type="checkbox"
                                                        className="checkbox-input"
                                                        name="terms"
                                                        checked={isAgreed}
                                                        onChange={(e) => setIsAgreed(e.target.checked)}
                                                        required
                                                 />
                                                 <span className="checkbox-custom "></span>
                                                 ยอมรับ&nbsp;<Link href="/" className=" underline">ข้อตกลงและเงื่อนไขการใช้งาน</Link>
                                          </label>
                                   </div>

                                   {error && (
                                          <div className="error-message text-red-500 text-sm mb-4">
                                                 {error}
                                          </div>
                                   )}

                                   <div className="summit-conatianer">
                                          <button type="submit" disabled={isPending}>
                                                 <p className="m-0 p-0">
                                                        {isPending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                                                 </p>
                                          </button>
                                   </div>
                            </form>

                            <p className="text-[13px] underline pb-[50] mt-4">ไม่สามารถเข้าสู่ระบบ? โปรดติดต่อผู้ดูแลระบบของคุณ</p>
                     </div>
              </div>
       );
}
