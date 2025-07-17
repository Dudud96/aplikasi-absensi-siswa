import React, { useState, useEffect, useRef } from 'react';

// Main App component
const App = () => {
    // State to store the list of students
    const [students, setStudents] = useState([
        'ALI ZULFIKAR', 'AL-MADIRA NAZLA ELYSSA', 'AMIRAH MAIMUN SYA\'BANIAH', 'ANDINI APRILIA',
        'DZAKIRA TALITA ZAHRA', 'FIKANA SAZKIA PUTRI', 'FIONA KAMALIA AZ-ZALFA', 'GEOVANI HERLANGGA',
        'HERA LUTVIA RAMADHANI', 'IRFAN SANUSI', 'JHONATAN TANDUKLANGI\'', 'KENZIE PRAWARA PUTRA SISNANTO',
        'KHANZA AYLA FATIHAH', 'MUHAMMAD AZZAM KAYIZ BAYHAQI', 'MUHAMMAD AKBAR AMIRUDDIN', 'MUHAMMAD NAUFAL',
        'MUHAMMAD RIFQY', 'MUHAMMAD RIZKY PRATAMA', 'NUR SYAQILA', 'SAFIRAH',
        'SHIENA KHANZA NADZIFA', 'SHOFA NUR AISYAH', 'SITI AMANI SYAFIQA HASRI', 'ZAHIRA NUR AQILAH',
        'VIRZA NUR MAULITA', 'MUHAMMAD RIAN SULTAN'
    ]);

    // State to store attendance records by date
    const [attendance, setAttendance] = useState({});
    // State for the currently selected date
    const [selectedDate, setSelectedDate] = useState('');
    // State for new student name input
    const [newStudentName, setNewStudentName] = useState('');
    // State for managing the delete confirmation dialog
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    // New states for Wali Kelas name and NIP
    const [waliKelasName, setWaliKelasName] = useState('Widya Hanastya, S.Pd');
    const [waliKelasNIP, setWaliKelasNIP] = useState('-');


    // Ref for the attendance table to be printed (not directly used for printing anymore, but kept for consistency)
    const attendanceTableRef = useRef(null);

    // Effect to set the initial date to today
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        // Initialize attendance for today if not already present
        if (!attendance[today]) {
            const initialAttendance = students.reduce((acc, student) => {
                acc[student] = 'Hadir'; // Default to 'Hadir'
                return acc;
            }, {});
            setAttendance(prev => ({ ...prev, [today]: initialAttendance }));
        }
    }, [students]); // Re-run if students list changes

    // Function to handle attendance change for a student on a specific date
    const handleAttendanceChange = (studentName, status) => {
        setAttendance(prev => ({
            ...prev,
            [selectedDate]: {
                ...prev[selectedDate],
                [studentName]: status
            }
        }));
    };

    // Function to handle adding a new student
    const handleAddStudent = () => {
        if (newStudentName.trim() !== '' && !students.includes(newStudentName.trim())) {
            setStudents(prev => [...prev, newStudentName.trim()]);
            // Also initialize attendance for the new student for all existing dates
            setAttendance(prev => {
                const updatedAttendance = { ...prev };
                for (const date in updatedAttendance) {
                    updatedAttendance[date] = {
                        ...updatedAttendance[date],
                        [newStudentName.trim()]: 'Hadir' // Default new student to 'Hadir'
                    };
                }
                return updatedAttendance;
            });
            setNewStudentName('');
        }
    };

    // Function to initiate delete confirmation
    const confirmDeleteStudent = (studentName) => {
        setStudentToDelete(studentName);
        setShowConfirmDelete(true);
    };

    // Function to handle actual deletion after confirmation
    const executeDeleteStudent = () => {
        if (studentToDelete) {
            // Filter out the student from the students list
            setStudents(prevStudents => prevStudents.filter(student => student !== studentToDelete));

            // Remove the student's attendance records from all dates
            setAttendance(prevAttendance => {
                const updatedAttendance = { ...prevAttendance };
                for (const date in updatedAttendance) {
                    if (updatedAttendance[date][studentToDelete]) {
                        const { [studentToDelete]: _, ...rest } = updatedAttendance[date];
                        updatedAttendance[date] = rest;
                    }
                }
                return updatedAttendance;
            });
            setStudentToDelete(null); // Clear student to delete
            setShowConfirmDelete(false); // Hide confirmation dialog
        }
    };

    // Function to cancel deletion
    const cancelDeleteStudent = () => {
        setStudentToDelete(null); // Clear student to delete
        setShowConfirmDelete(false); // Hide confirmation dialog
    };

    // Function to handle date change
    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        // Initialize attendance for the new date if not already present
        if (!attendance[date]) {
            const initialAttendance = students.reduce((acc, student) => {
                acc[student] = 'Hadir'; // Default to 'Hadir'
                return acc;
            }, {});
            setAttendance(prev => ({ ...prev, [date]: initialAttendance }));
        }
    };

    // Function to calculate monthly summary for a student
    const getMonthlySummary = (studentName, yearMonth) => {
        let hadir = 0;
        let sakit = 0;
        let izin = 0;
        let alpha = 0;

        // Iterate through all recorded dates
        for (const date in attendance) {
            if (date.startsWith(yearMonth)) { // Check if date is in the current month/year
                const status = attendance[date]?.[studentName];
                switch (status) {
                    case 'Hadir':
                        hadir++;
                        break;
                    case 'Sakit':
                        sakit++;
                        break;
                    case 'Izin':
                        izin++;
                        break;
                    case 'Alpha':
                        alpha++;
                        break;
                    default:
                        break;
                }
            }
        }
        return { hadir, sakit, izin, alpha };
    };

    // Function to generate and download PDF (using browser print)
    const handleDownloadPdf = () => {
        const [year, month] = selectedDate.split('-');
        const currentYearMonth = `${year}-${month}`;

        const monthlyDates = Object.keys(attendance)
            .filter(date => date.startsWith(currentYearMonth))
            .sort();

        const lastDayOfMonth = new Date(year, month, 0).getDate();
        const formattedDateForSignature = `${lastDayOfMonth} ${new Date(selectedDate).toLocaleString('id-ID', { month: 'long' })} ${year}`;

        let htmlContent = `
            <html>
            <head>
                <title>Rekap Absensi Siswa Bulanan</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { font-family: 'Inter', sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .summary-cell { font-weight: bold; }
                    .signature-block { text-align: right; margin-top: 40px; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 5px; margin-bottom: 20px;">
                    <h1 class="text-2xl font-bold mb-1">Rekap Absensi Siswa Bulan ${month}/${year}</h1>
                    <p class="text-lg">Kelas 6B</p>
                    <p class="text-lg">SD Negeri 003 Gunung Tabur</p>
                </div>
                <table class="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr>
                            <th class="py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-tl-lg">Nama Siswa</th>
        `;

        monthlyDates.forEach(date => {
            htmlContent += `<th class="py-3 px-4 bg-gray-200 text-gray-700 font-semibold">${date.split('-')[2]}</th>`;
        });

        htmlContent += `
                            <th class="py-3 px-4 bg-blue-200 text-blue-800 font-semibold summary-cell">Hadir</th>
                            <th class="py-3 px-4 bg-yellow-200 text-yellow-800 font-semibold summary-cell">Sakit</th>
                            <th class="py-3 px-4 bg-purple-200 text-purple-800 font-semibold summary-cell">Izin</th>
                            <th class="py-3 px-4 bg-red-200 text-red-800 font-semibold summary-cell rounded-tr-lg">Alpha</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        students.forEach(student => {
            htmlContent += `<tr><td class="py-2 px-4 border-b border-gray-200 text-gray-800 font-medium">${student}</td>`;
            monthlyDates.forEach(date => {
                const status = attendance[date]?.[student] || '-';
                htmlContent += `<td class="py-2 px-4 border-b border-gray-200 text-center">${status.charAt(0)}</td>`;
            });
            const summary = getMonthlySummary(student, currentYearMonth);
            htmlContent += `
                <td class="py-2 px-4 border-b border-blue-200 summary-cell">${summary.hadir}</td>
                <td class="py-2 px-4 border-b border-yellow-200 text-yellow-800 font-bold text-center">${summary.sakit}</td>
                <td class="py-2 px-4 border-b border-purple-200 text-purple-800 font-bold text-center">${summary.izin}</td>
                <td class="py-2 px-4 border-b border-red-200 text-red-800 font-bold text-center">${summary.alpha}</td>
            </tr>`;
        });

        htmlContent += `
                    </tbody>
                </table>
                <div class="signature-block">
                    <p>Gunung Tabur, ${formattedDateForSignature}</p>
                    <p>Wali Kelas</p>
                    <br><br><br>
                    <p>${waliKelasName}</p>
                    <p>NIP. ${waliKelasNIP}</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        } else {
            console.error("Gagal membuka jendela cetak. Mungkin diblokir oleh pop-up blocker.");
        }
    };

    // Get current year and month for monthly summary display
    const [currentYear, currentMonth] = selectedDate.split('-');
    const currentYearMonth = `${currentYear}-${currentMonth}`;
    const monthlyDates = Object.keys(attendance)
        .filter(date => date.startsWith(currentYearMonth))
        .sort((a, b) => new Date(a) - new Date(b)); // Sort dates chronologically

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6 font-sans antialiased">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="flex flex-col items-center justify-center gap-2 mb-8"> {/* Adjusted for no icon */}
                    <h1 className="text-4xl font-extrabold text-gray-800">Daftar Hadir Siswa</h1>
                    <p className="text-xl text-gray-700 mt-2">Kelas 6B</p>
                    <p className="text-xl text-gray-700">SD Negeri 003 Gunung Tabur</p>
                </div>

                {/* Wali Kelas Name and NIP Input */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col gap-3 w-full">
                        <label htmlFor="wali-kelas-name" className="text-gray-700 font-medium text-lg">Nama Wali Kelas:</label>
                        <input
                            type="text"
                            id="wali-kelas-name"
                            value={waliKelasName}
                            onChange={(e) => setWaliKelasName(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-base"
                        />
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                        <label htmlFor="wali-kelas-nip" className="text-gray-700 font-medium text-lg">NIP Wali Kelas:</label>
                        <input
                            type="text"
                            id="wali-kelas-nip"
                            value={waliKelasNIP}
                            onChange={(e) => setWaliKelasNIP(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-base"
                        />
                    </div>
                </div>

                {/* Date Selection and Add Student */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <label htmlFor="attendance-date" className="text-gray-700 font-medium text-lg">Tanggal:</label>
                        <input
                            type="date"
                            id="attendance-date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-base"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Nama siswa baru"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out flex-grow text-base w-full"
                        />
                        <button
                            onClick={handleAddStudent}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
                        >
                            Tambah Siswa
                        </button>
                    </div>
                </div>

                {/* Daily Attendance Table */}
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Kehadiran Harian ({selectedDate})</h2>
                <div className="overflow-x-auto mb-8 rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">Nama Siswa</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status Kehadiran</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="py-3 px-4 border-b border-gray-200 text-gray-800 font-medium">{student}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">
                                        <div className="flex flex-wrap gap-2">
                                            {['Hadir', 'Sakit', 'Izin', 'Alpha'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleAttendanceChange(student, status)}
                                                    className={`py-2 px-4 rounded-full text-sm font-semibold transition duration-200 ease-in-out
                                                        ${attendance[selectedDate]?.[student] === status
                                                            ? (status === 'Hadir' ? 'bg-blue-600 text-white shadow-md' :
                                                               status === 'Sakit' ? 'bg-yellow-500 text-white shadow-md' :
                                                               status === 'Izin' ? 'bg-purple-500 text-white shadow-md' :
                                                               'bg-red-600 text-white shadow-md')
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200">
                                        <button
                                            onClick={() => confirmDeleteStudent(student)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Monthly Attendance Summary Table */}
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Rekap Absensi Bulanan ({currentMonth}/{currentYear})</h2>
                <div className="overflow-x-auto mb-8 rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">Nama Siswa</th>
                                {monthlyDates.map(date => (
                                    <th key={date} className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        {date.split('-')[2]}
                                    </th>
                                ))}
                                <th className="py-3 px-4 bg-blue-100 text-blue-700 font-semibold uppercase tracking-wider">Hadir</th>
                                <th className="py-3 px-4 bg-yellow-100 text-yellow-700 font-semibold uppercase tracking-wider">Sakit</th>
                                <th className="py-3 px-4 bg-purple-100 text-purple-700 font-semibold uppercase tracking-wider">Izin</th>
                                <th className="py-3 px-4 bg-red-100 text-red-700 font-semibold uppercase tracking-wider rounded-tr-lg">Alpha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="py-3 px-4 border-b border-gray-200 text-gray-800 font-medium">{student}</td>
                                    {monthlyDates.map(date => (
                                        <td key={`${student}-${date}`} className="py-3 px-4 border-b border-gray-200 text-center">
                                            {attendance[date]?.[student]?.charAt(0) || '-'}
                                        </td>
                                    ))}
                                    {(() => {
                                        const summary = getMonthlySummary(student, currentYearMonth);
                                        return (
                                            <>
                                                <td className="py-3 px-4 border-b border-blue-200 text-blue-800 font-bold text-center">{summary.hadir}</td>
                                                <td className="py-3 px-4 border-b border-yellow-200 text-yellow-800 font-bold text-center">{summary.sakit}</td>
                                                <td className="py-3 px-4 border-b border-purple-200 text-purple-800 font-bold text-center">{summary.izin}</td>
                                                <td className="py-3 px-4 border-b border-red-200 text-red-800 font-bold text-center">{summary.alpha}</td>
                                            </>
                                        );
                                    })()}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Download PDF Button */}
                <div className="text-center">
                    <button
                        onClick={handleDownloadPdf}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                    >
                        Download Rekap Absen Bulanan (PDF)
                    </button>
                </div>

                {/* Note for PDF Download */}
                <p className="text-center text-gray-600 text-sm mt-6">
                    *Tombol "Download Rekap Absen Bulanan (PDF)" akan membuka dialog cetak browser Anda. Pilih "Simpan sebagai PDF" untuk mengunduh rekap.
                </p>
            </div>

            {/* Delete Confirmation Modal */}
            {showConfirmDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Konfirmasi Penghapusan</h3>
                        <p className="mb-6 text-gray-700">
                            Apakah Anda yakin ingin menghapus siswa <span className="font-semibold text-red-600">"{studentToDelete}"</span>?
                            Semua data kehadirannya akan dihapus secara permanen.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={executeDeleteStudent}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                Ya, Hapus
                            </button>
                            <button
                                onClick={cancelDeleteStudent}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                Tidak
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;