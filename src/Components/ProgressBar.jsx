// src/Components/ProgressBar.jsx
import { useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import jsPDF from "jspdf";
import signature from "../assets/signature.png";
import certBg from "../assets/certificate-bg.png";
import logo from "../assets/logo.png";

export default function ProgressBar({ courseId, totalModules, completedModules }) {
  const [percent, setPercent] = useState(0);
  const [eligible, setEligible] = useState(false);
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currUser) => {
      if (currUser) setUser(currUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCourseData = async () => {
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) setCourse(courseSnap.data());
    };
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (totalModules > 0) {
      const completedCount = completedModules?.length || 0;
      const calculated = Math.floor((completedCount / totalModules) * 100);
      setPercent(calculated);
      if (calculated === 100) setEligible(true);
    }
  }, [completedModules, totalModules]);

  const downloadCertificate = async () => {
    if (!user || !course) return;

    const fullName = user.displayName || "Student";
    const courseTitle = course.title || "Course";
    const dateStr = new Date().toLocaleDateString();

    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });

    try {
      const [bgImg, logoImg, signatureImg] = await Promise.all([
        loadImage(certBg),
        loadImage(logo),
        loadImage(signature),
      ]);

      const docPdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [600, 400],
      });

      docPdf.addImage(
        bgImg,
        "PNG",
        0,
        0,
        docPdf.internal.pageSize.getWidth(),
        docPdf.internal.pageSize.getHeight()
      );

      docPdf.addImage(logoImg, "PNG", 40, 30, 80, 80);

      docPdf.setFont("helvetica", "bold");
      docPdf.setFontSize(20);
      docPdf.text("Certificate of Completion", 300, 110, { align: "center" });

      docPdf.setFont("helvetica", "normal");
      docPdf.setFontSize(14);
      docPdf.text("This certifies that", 300, 140, { align: "center" });

      docPdf.setFont("helvetica", "bold");
      docPdf.setFontSize(18);
      docPdf.text(fullName, 300, 170, { align: "center" });

      docPdf.setFont("helvetica", "normal");
      docPdf.setFontSize(14);
      docPdf.text("has successfully completed the course", 300, 200, { align: "center" });

      docPdf.setFont("helvetica", "bold");
      docPdf.setFontSize(16);
      docPdf.text(courseTitle, 300, 230, { align: "center" });

      docPdf.setFont("helvetica", "normal");
      docPdf.setFontSize(12);
      docPdf.text(`on ${dateStr}`, 300, 260, { align: "center" });

      docPdf.addImage(signatureImg, "PNG", 420, 275, 100, 40);
      docPdf.setFontSize(12);
      docPdf.text("Divyansh Singh", 470, 325, { align: "center" });
      docPdf.line(420, 330, 540, 330);
      docPdf.text("Instructor Signature", 480, 345, { align: "center" });

      docPdf.save(`${courseTitle}_certificate.pdf`);

      await setDoc(doc(db, "certificates", `${user.uid}_${courseId}`), {
        userId: user.uid,
        courseId,
        courseTitle,
        studentName: fullName,
        issuedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Certificate generation failed:", err);
    }
  };

  return (
    <div className="w-full mt-4 p-4 border rounded-xl shadow bg-white text-black">
      <h2 className="text-lg font-semibold mb-2">Course Progress</h2>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <p className="text-sm mt-1 text-center">{percent}% completed</p>

      {eligible ? (
        <div className="mt-4 flex justify-center">
          <button
            onClick={downloadCertificate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            🎓 Download Certificate
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600 text-center">
          Complete all modules to unlock your certificate.
        </p>
      )}
    </div>
  );
}
