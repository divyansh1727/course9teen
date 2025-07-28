import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import jsPDF from "jspdf";
import logo from "../assets/logo.png";
import signature from "../assets/signature.png";
import certBg from "../assets/certificate-bg.png";

export default function ProgressBar({ courseId, totalModules }) {
  const [percent, setPercent] = useState(0);
  const [eligible, setEligible] = useState(false);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const courseSnap = await getDoc(doc(db, "courses", courseId));
      const progressSnap = await getDoc(doc(db, "studentProgress", `${user.uid}_${courseId}`));
      const enrollmentSnap = await getDoc(doc(db, "enrollments", `${user.uid}_${courseId}`));

      if (courseSnap.exists()) setCourse(courseSnap.data());
      if (progressSnap.exists()) setProgress(progressSnap.data());

      if (enrollmentSnap.exists()) {
        const data = enrollmentSnap.data();
        const completedCount = completedModules.length;
        const completedModules =Data.completedModules || [];

        const calculated = totalModules === 0 ? 0 : Math.floor((completedCount / totalModules)) * 100;
        setPercent(calculated);
      }
    };

    fetchProgress();
  }, [courseId, totalModules]);

  useEffect(() => {
    const checkEligibility = () => {
      if (!progress || !course) return;

      const allCompleted = course.modules.every((mod, index) => {
        const prog = progress.moduleProgress?.[index];
        if (!prog) return false;

        const videosDone = prog.videosWatched?.length === mod.videos.length &&
          prog.videosWatched.every((v) => v === true);

        return videosDone && prog.testPassed === true;
      });

      setEligible(allCompleted);
    };

    checkEligibility();
  }, [progress, course]);

  useEffect(() => {
    if (!progress && percent === 100) {
      setEligible(true);
    }
  }, [percent, progress]);

  const downloadCertificate = async () => {
    const user = auth.currentUser;
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
    <div className="w-full mt-4 p-4 border rounded-xl shadow bg-white">
      <h2 className="text-lg font-semibold mb-2">Course Progress</h2>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <p className="text-sm mt-1 text-center">{Math.round(percent)}% completed</p>

      {eligible ? (
        <button
          onClick={downloadCertificate}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          🎓 Download Certificate
        </button>
      ) : (
        <p className="mt-4 text-sm text-gray-600">
          Complete all videos & tests in all modules to unlock your certificate.
        </p>
      )}
    </div>
  );
}

