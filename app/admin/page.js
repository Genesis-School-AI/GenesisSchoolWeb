'use client';

import { useState, useEffect } from 'react';
import './admin.css';

export default function AdminPage() {
    // State management
    const [activeTab, setActiveTab] = useState('system');
    const [systemStatus, setSystemStatus] = useState(true);
    
    // Teachers state
    const [teachers, setTeachers] = useState([
        { id: 1, name: 'อาจารย์สมชาย', email: 'somchai@school.com', subject: 'คณิตศาสตร์' },
        { id: 2, name: 'อาจารย์สมหญิง', email: 'somying@school.com', subject: 'ภาษาไทย' },
    ]);
    const [teacherForm, setTeacherForm] = useState({ name: '', email: '', subject: '' });
    const [editingTeacher, setEditingTeacher] = useState(null);

    // Students state
    const [students, setStudents] = useState([
        { id: 1, name: 'นายสมศักดิ์', studentId: 'S001', class: 'ม.1/1', email: 'somsak@student.com' },
        { id: 2, name: 'นางสาวมาลี', studentId: 'S002', class: 'ม.1/2', email: 'malee@student.com' },
    ]);
    const [studentForm, setStudentForm] = useState({ name: '', studentId: '', class: '', email: '' });
    const [editingStudent, setEditingStudent] = useState(null);

    // Rooms state
    const [rooms, setRooms] = useState([
        { id: 1, name: 'ห้อง 101', capacity: 30, floor: 1 },
        { id: 2, name: 'ห้อง 102', capacity: 25, floor: 1 },
        { id: 3, name: 'ห้อง 201', capacity: 35, floor: 2 },
    ]);
    const [roomForm, setRoomForm] = useState({ name: '', capacity: '', floor: '' });
    const [editingRoom, setEditingRoom] = useState(null);

    // Years state
    const [years, setYears] = useState([
        { id: 1, name: 'ปีการศึกษา 2567', level: 'มัธยมศึกษาปีที่ 1', active: true },
        { id: 2, name: 'ปีการศึกษา 2568', level: 'มัธยมศึกษาปีที่ 2', active: false },
    ]);
    const [yearForm, setYearForm] = useState({ name: '', level: '', active: false });
    const [editingYear, setEditingYear] = useState(null);

    // System control functions
    const toggleSystem = () => {
        setSystemStatus(!systemStatus);
        showSuccessMessage(`ระบบ${!systemStatus ? 'เปิด' : 'ปิด'}การใช้งานแล้ว`);
    };

    // Teacher CRUD operations
    const handleTeacherSubmit = (e) => {
        e.preventDefault();
        try {
            if (editingTeacher) {
                const updatedTeachers = teachers.map(t => 
                    t.id === editingTeacher.id ? { ...editingTeacher, ...teacherForm } : t
                );
                setTeachers(updatedTeachers);
                setEditingTeacher(null);
                showSuccessMessage('อัพเดทข้อมูลครูสำเร็จ');
            } else {
                const newTeacher = { id: Date.now(), ...teacherForm };
                setTeachers([...teachers, newTeacher]);
                showSuccessMessage('เพิ่มครูใหม่สำเร็จ');
            }
            setTeacherForm({ name: '', email: '', subject: '' });
        } catch (error) {
            console.error('Error saving teacher:', error);
            showErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูลครู');
        }
    };

    const editTeacher = (teacher) => {
        setEditingTeacher(teacher);
        setTeacherForm({ name: teacher.name, email: teacher.email, subject: teacher.subject });
    };

    const deleteTeacher = (id) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบครูท่านนี้?')) {
            setTeachers(teachers.filter(t => t.id !== id));
            showSuccessMessage('ลบครูสำเร็จ');
        }
    };

    // Student CRUD operations
    const handleStudentSubmit = (e) => {
        e.preventDefault();
        try {
            if (editingStudent) {
                const updatedStudents = students.map(s => 
                    s.id === editingStudent.id ? { ...editingStudent, ...studentForm } : s
                );
                setStudents(updatedStudents);
                setEditingStudent(null);
                showSuccessMessage('อัพเดทข้อมูลนักเรียนสำเร็จ');
            } else {
                const newStudent = { id: Date.now(), ...studentForm };
                setStudents([...students, newStudent]);
                showSuccessMessage('เพิ่มนักเรียนใหม่สำเร็จ');
            }
            setStudentForm({ name: '', studentId: '', class: '', email: '' });
        } catch (error) {
            console.error('Error saving student:', error);
            showErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูลนักเรียน');
        }
    };

    const editStudent = (student) => {
        setEditingStudent(student);
        setStudentForm({ name: student.name, studentId: student.studentId, class: student.class, email: student.email });
    };

    const deleteStudent = (id) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบนักเรียนคนนี้?')) {
            setStudents(students.filter(s => s.id !== id));
            showSuccessMessage('ลบนักเรียนสำเร็จ');
        }
    };

    // Room CRUD operations
    const handleRoomSubmit = (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                const updatedRooms = rooms.map(r => 
                    r.id === editingRoom.id ? { ...editingRoom, ...roomForm } : r
                );
                setRooms(updatedRooms);
                setEditingRoom(null);
                showSuccessMessage('อัพเดทข้อมูลห้องสำเร็จ');
            } else {
                const newRoom = { id: Date.now(), ...roomForm };
                setRooms([...rooms, newRoom]);
                showSuccessMessage('เพิ่มห้องใหม่สำเร็จ');
            }
            setRoomForm({ name: '', capacity: '', floor: '' });
        } catch (error) {
            console.error('Error saving room:', error);
            showErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูลห้อง');
        }
    };

    const editRoom = (room) => {
        setEditingRoom(room);
        setRoomForm({ name: room.name, capacity: room.capacity, floor: room.floor });
    };

    const deleteRoom = (id) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบห้องนี้?')) {
            setRooms(rooms.filter(r => r.id !== id));
            showSuccessMessage('ลบห้องสำเร็จ');
        }
    };

    // Year CRUD operations
    const handleYearSubmit = (e) => {
        e.preventDefault();
        try {
            if (editingYear) {
                const updatedYears = years.map(y => 
                    y.id === editingYear.id ? { ...editingYear, ...yearForm } : y
                );
                setYears(updatedYears);
                setEditingYear(null);
                showSuccessMessage('อัพเดทข้อมูลปีการศึกษาสำเร็จ');
            } else {
                const newYear = { id: Date.now(), ...yearForm };
                setYears([...years, newYear]);
                showSuccessMessage('เพิ่มปีการศึกษาใหม่สำเร็จ');
            }
            setYearForm({ name: '', level: '', active: false });
        } catch (error) {
            console.error('Error saving year:', error);
            showErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูลปีการศึกษา');
        }
    };

    const editYear = (year) => {
        setEditingYear(year);
        setYearForm({ name: year.name, level: year.level, active: year.active });
    };

    const deleteYear = (id) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบปีการศึกษานี้?')) {
            setYears(years.filter(y => y.id !== id));
            showSuccessMessage('ลบปีการศึกษาสำเร็จ');
        }
    };

    // Utility functions
    const showSuccessMessage = (message) => {
        alert(`✅ ${message}`);
    };

    const showErrorMessage = (message) => {
        alert(`❌ ${message}`);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>🎓 ระบบจัดการโรงเรียน</h1>
                <p>หน้าควบคุมระบบสำหรับผู้ดูแล</p>
            </div>

            {/* Navigation Tabs */}
            <nav className="admin-nav">
                <button 
                    className={`nav-btn ${activeTab === 'system' ? 'active' : ''}`}
                    onClick={() => setActiveTab('system')}
                >
                    🏠 ควบคุมระบบ
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'teachers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teachers')}
                >
                    👨‍🏫 จัดการครู
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                >
                    👨‍🎓 จัดการนักเรียน
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'rooms' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rooms')}
                >
                    🏫 จัดการห้องเรียน
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'years' ? 'active' : ''}`}
                    onClick={() => setActiveTab('years')}
                >
                    📅 จัดการปีการศึกษา
                </button>
            </nav>

            <div className="admin-content">
                {/* System Control Tab */}
                {activeTab === 'system' && (
                    <div className="tab-content">
                        <h2>🏠 ควบคุมระบบ</h2>
                        <div className="system-control">
                            <div className="system-status">
                                <h3>สถานะระบบ</h3>
                                <div className={`status-indicator ${systemStatus ? 'online' : 'offline'}`}>
                                    <span className="status-dot"></span>
                                    <span className="status-text">
                                        ระบบ{systemStatus ? 'เปิด' : 'ปิด'}การใช้งาน
                                    </span>
                                </div>
                                <button 
                                    className={`toggle-btn ${systemStatus ? 'turn-off' : 'turn-on'}`}
                                    onClick={toggleSystem}
                                >
                                    {systemStatus ? '🔴 ปิดระบบ' : '🟢 เปิดระบบ'}
                                </button>
                            </div>
                            
                            <div className="system-stats">
                                <div className="stat-card">
                                    <h4>👨‍🏫 จำนวนครู</h4>
                                    <p className="stat-number">{teachers.length}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>👨‍🎓 จำนวนนักเรียน</h4>
                                    <p className="stat-number">{students.length}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>🏫 จำนวนห้องเรียน</h4>
                                    <p className="stat-number">{rooms.length}</p>
                                </div>
                                <div className="stat-card">
                                    <h4>📅 จำนวนปีการศึกษา</h4>
                                    <p className="stat-number">{years.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Teachers Management Tab */}
                {activeTab === 'teachers' && (
                    <div className="tab-content">
                        <h2>👨‍🏫 จัดการครู</h2>
                        
                        {/* Teacher Form */}
                        <div className="form-section">
                            <h3>{editingTeacher ? 'แก้ไขข้อมูลครู' : 'เพิ่มครูใหม่'}</h3>
                            <form onSubmit={handleTeacherSubmit} className="admin-form">
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="ชื่อ-นามสกุล"
                                        value={teacherForm.name}
                                        onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="อีเมล"
                                        value={teacherForm.email}
                                        onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="วิชาที่สอน"
                                        value={teacherForm.subject}
                                        onChange={(e) => setTeacherForm({...teacherForm, subject: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        {editingTeacher ? '💾 อัพเดท' : '➕ เพิ่มครู'}
                                    </button>
                                    {editingTeacher && (
                                        <button 
                                            type="button" 
                                            className="cancel-btn"
                                            onClick={() => {
                                                setEditingTeacher(null);
                                                setTeacherForm({ name: '', email: '', subject: '' });
                                            }}
                                        >
                                            ❌ ยกเลิก
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Teachers List */}
                        <div className="list-section">
                            <h3>รายชื่อครู ({teachers.length} คน)</h3>
                            <div className="data-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ชื่อ-นามสกุล</th>
                                            <th>อีเมล</th>
                                            <th>วิชาที่สอน</th>
                                            <th>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teachers.map(teacher => (
                                            <tr key={teacher.id}>
                                                <td>{teacher.name}</td>
                                                <td>{teacher.email}</td>
                                                <td>{teacher.subject}</td>
                                                <td>
                                                    <button 
                                                        className="edit-btn"
                                                        onClick={() => editTeacher(teacher)}
                                                    >
                                                        ✏️ แก้ไข
                                                    </button>
                                                    <button 
                                                        className="delete-btn"
                                                        onClick={() => deleteTeacher(teacher.id)}
                                                    >
                                                        🗑️ ลบ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Students Management Tab */}
                {activeTab === 'students' && (
                    <div className="tab-content">
                        <h2>👨‍🎓 จัดการนักเรียน</h2>
                        
                        {/* Student Form */}
                        <div className="form-section">
                            <h3>{editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}</h3>
                            <form onSubmit={handleStudentSubmit} className="admin-form">
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="ชื่อ-นามสกุล"
                                        value={studentForm.name}
                                        onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="รหัสนักเรียน"
                                        value={studentForm.studentId}
                                        onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="ชั้นเรียน"
                                        value={studentForm.class}
                                        onChange={(e) => setStudentForm({...studentForm, class: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="อีเมล"
                                        value={studentForm.email}
                                        onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        {editingStudent ? '💾 อัพเดท' : '➕ เพิ่มนักเรียน'}
                                    </button>
                                    {editingStudent && (
                                        <button 
                                            type="button" 
                                            className="cancel-btn"
                                            onClick={() => {
                                                setEditingStudent(null);
                                                setStudentForm({ name: '', studentId: '', class: '', email: '' });
                                            }}
                                        >
                                            ❌ ยกเลิก
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Students List */}
                        <div className="list-section">
                            <h3>รายชื่อนักเรียน ({students.length} คน)</h3>
                            <div className="data-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ชื่อ-นามสกุล</th>
                                            <th>รหัสนักเรียน</th>
                                            <th>ชั้นเรียน</th>
                                            <th>อีเมล</th>
                                            <th>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(student => (
                                            <tr key={student.id}>
                                                <td>{student.name}</td>
                                                <td>{student.studentId}</td>
                                                <td>{student.class}</td>
                                                <td>{student.email}</td>
                                                <td>
                                                    <button 
                                                        className="edit-btn"
                                                        onClick={() => editStudent(student)}
                                                    >
                                                        ✏️ แก้ไข
                                                    </button>
                                                    <button 
                                                        className="delete-btn"
                                                        onClick={() => deleteStudent(student.id)}
                                                    >
                                                        🗑️ ลบ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rooms Management Tab */}
                {activeTab === 'rooms' && (
                    <div className="tab-content">
                        <h2>🏫 จัดการห้องเรียน</h2>
                        
                        {/* Room Form */}
                        <div className="form-section">
                            <h3>{editingRoom ? 'แก้ไขข้อมูลห้อง' : 'เพิ่มห้องใหม่'}</h3>
                            <form onSubmit={handleRoomSubmit} className="admin-form">
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="ชื่อห้อง"
                                        value={roomForm.name}
                                        onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="ความจุ (คน)"
                                        value={roomForm.capacity}
                                        onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})}
                                        required
                                        min="1"
                                    />
                                    <input
                                        type="number"
                                        placeholder="ชั้น"
                                        value={roomForm.floor}
                                        onChange={(e) => setRoomForm({...roomForm, floor: e.target.value})}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        {editingRoom ? '💾 อัพเดท' : '➕ เพิ่มห้อง'}
                                    </button>
                                    {editingRoom && (
                                        <button 
                                            type="button" 
                                            className="cancel-btn"
                                            onClick={() => {
                                                setEditingRoom(null);
                                                setRoomForm({ name: '', capacity: '', floor: '' });
                                            }}
                                        >
                                            ❌ ยกเลิก
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Rooms List */}
                        <div className="list-section">
                            <h3>รายการห้องเรียน ({rooms.length} ห้อง)</h3>
                            <div className="data-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ชื่อห้อง</th>
                                            <th>ความจุ</th>
                                            <th>ชั้น</th>
                                            <th>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map(room => (
                                            <tr key={room.id}>
                                                <td>{room.name}</td>
                                                <td>{room.capacity} คน</td>
                                                <td>ชั้น {room.floor}</td>
                                                <td>
                                                    <button 
                                                        className="edit-btn"
                                                        onClick={() => editRoom(room)}
                                                    >
                                                        ✏️ แก้ไข
                                                    </button>
                                                    <button 
                                                        className="delete-btn"
                                                        onClick={() => deleteRoom(room.id)}
                                                    >
                                                        🗑️ ลบ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Years Management Tab */}
                {activeTab === 'years' && (
                    <div className="tab-content">
                        <h2>📅 จัดการปีการศึกษา</h2>
                        
                        {/* Year Form */}
                        <div className="form-section">
                            <h3>{editingYear ? 'แก้ไขข้อมูลปีการศึกษา' : 'เพิ่มปีการศึกษาใหม่'}</h3>
                            <form onSubmit={handleYearSubmit} className="admin-form">
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="ชื่อปีการศึกษา"
                                        value={yearForm.name}
                                        onChange={(e) => setYearForm({...yearForm, name: e.target.value})}
                                        required
                                    />
                                    <select
                                        value={yearForm.level}
                                        onChange={(e) => setYearForm({...yearForm, level: e.target.value})}
                                        required
                                    >
                                        <option value="">เลือกระดับชั้น</option>
                                        <option value="มัธยมศึกษาปีที่ 1">มัธยมศึกษาปีที่ 1</option>
                                        <option value="มัธยมศึกษาปีที่ 2">มัธยมศึกษาปีที่ 2</option>
                                        <option value="มัธยมศึกษาปีที่ 3">มัธยมศึกษาปีที่ 3</option>
                                        <option value="มัธยมศึกษาปีที่ 4">มัธยมศึกษาปีที่ 4</option>
                                        <option value="มัธยมศึกษาปีที่ 5">มัธยมศึกษาปีที่ 5</option>
                                        <option value="มัธยมศึกษาปีที่ 6">มัธยมศึกษาปีที่ 6</option>
                                    </select>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={yearForm.active}
                                            onChange={(e) => setYearForm({...yearForm, active: e.target.checked})}
                                        />
                                        <span>ใช้งานอยู่</span>
                                    </label>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        {editingYear ? '💾 อัพเดท' : '➕ เพิ่มปีการศึกษา'}
                                    </button>
                                    {editingYear && (
                                        <button 
                                            type="button" 
                                            className="cancel-btn"
                                            onClick={() => {
                                                setEditingYear(null);
                                                setYearForm({ name: '', level: '', active: false });
                                            }}
                                        >
                                            ❌ ยกเลิก
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Years List */}
                        <div className="list-section">
                            <h3>รายการปีการศึกษา ({years.length} ปี)</h3>
                            <div className="data-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ชื่อปีการศึกษา</th>
                                            <th>ระดับชั้น</th>
                                            <th>สถานะ</th>
                                            <th>จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {years.map(year => (
                                            <tr key={year.id}>
                                                <td>{year.name}</td>
                                                <td>{year.level}</td>
                                                <td>
                                                    <span className={`status-badge ${year.active ? 'active' : 'inactive'}`}>
                                                        {year.active ? '🟢 ใช้งาน' : '🔴 ไม่ใช้งาน'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="edit-btn"
                                                        onClick={() => editYear(year)}
                                                    >
                                                        ✏️ แก้ไข
                                                    </button>
                                                    <button 
                                                        className="delete-btn"
                                                        onClick={() => deleteYear(year.id)}
                                                    >
                                                        🗑️ ลบ
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
