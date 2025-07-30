// CourseView.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import ProgressBar from "../Components/ProgressBar";

function getYouTubeEmbedUrl(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
  const videoId = match ? match[1] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [completedModules, setCompletedModules] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }

      setUser(currentUser);

      try {
        const courseRef = doc(db, "courses", id);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
          alert("Course not found.");
          navigate("/dashboard");
          return;
        }

        const data = courseSnap.data();
        setCourse({ id: courseSnap.id, ...data });
        await fetchCourseReviews(currentUser.uid);

        const enrollmentRef = doc(db, "enrollments", `${currentUser.uid}_${id}`);
        const enrollmentSnap = await getDoc(enrollmentRef);

        if (enrollmentSnap.exists()) {
          setIsEnrolled(true);
          setCompletedModules(enrollmentSnap.data().completedModules || []);
        }
      } catch (err) {
        console.error("Course load error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleEnroll = async () => {
    if (!user) return alert("Login required");

    setEnrolling(true);
    try {
      const enrollmentRef = doc(db, "enrollments", `${user.uid}_${id}`);
      const enrollmentSnap = await getDoc(enrollmentRef);

      if (enrollmentSnap.exists()) {
        alert("Already enrolled!");
        setIsEnrolled(true);
        return;
      }

      await setDoc(enrollmentRef, {
        userId: user.uid,
        courseId: id,
        enrolledAt: serverTimestamp(),
        completedModules: [],
      });

      setIsEnrolled(true);
      alert("Enrollment successful!");
      setTimeout(() => navigate("/student-dashboard", { state: { justEnrolled: true } }), 1000);
    } catch (err) {
      console.error("Enroll error:", err);
      alert("Enrollment failed.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleMarkComplete = async (index) => {
    if (!user) return;
    const enrollmentRef = doc(db, "enrollments", `${user.uid}_${id}`);
    const newCompleted = [...new Set([...completedModules, index])];
    await updateDoc(enrollmentRef, { completedModules: newCompleted });
    setCompletedModules(newCompleted);
  };

  const fetchCourseReviews = async (uid) => {
    const q = query(collection(db, "courseReviews"), where("courseId", "==", id));
    const snapshot = await getDocs(q);
    const fetched = snapshot.docs.map((doc) => doc.data());
    setReviews(fetched);

    const alreadyReviewed = snapshot.docs.find((doc) => doc.data().userId === uid);
    setHasSubmittedReview(!!alreadyReviewed);

    if (fetched.length > 0) {
      const avg = fetched.reduce((sum, r) => sum + r.rating, 0) / fetched.length;
      setAverageRating(avg.toFixed(1));
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) return alert("Login required");

    const reviewId = `${user.uid}_${id}`;
    const reviewRef = doc(db, "courseReviews", reviewId);

    await setDoc(reviewRef, {
      courseId: id,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      rating: newReview.rating,
      reviewText: newReview.text,
      createdAt: serverTimestamp(),
    });

    const q = query(collection(db, "courseReviews"), where("courseId", "==", id));
    const snapshot = await getDocs(q);
    const allRatings = snapshot.docs.map((doc) => doc.data().rating);
    const total = allRatings.reduce((a, b) => a + b, 0);
    const avg = (total / allRatings.length).toFixed(1);

    const courseRef = doc(db, "courses", id);
    await updateDoc(courseRef, {
      avgRating: Number(avg),
      ratingCount: allRatings.length,
    });

    setNewReview({ rating: 0, text: "" });
    alert("Review submitted!");
    fetchCourseReviews(user.uid);
  };

  if (loading) return <div className="text-white text-center mt-20">Loading course...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl p-6 shadow-lg">
        {isEnrolled && course?.modules?.length > 0 && (
          <aside className="bg-gray-900 p-4 rounded-lg md:sticky md:top-6 h-fit col-span-1 hidden md:block">
            <h2 className="text-lg font-semibold mb-3 text-green-300">Course Modules</h2>
            <ul className="space-y-2">
              {course.modules.map((mod, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    const moduleEl = document.getElementById(`module-${idx}`);
                    if (moduleEl) moduleEl.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`cursor-pointer p-2 rounded-lg ${
                    completedModules.includes(idx)
                      ? "bg-green-700 text-white"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  ✅ {mod.title}
                </li>
              ))}
            </ul>
          </aside>
        )}

        <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
        <p className="text-gray-300 mb-6">{course?.description}</p>

        {isEnrolled ? (
          <div className="flex flex-col items-start space-y-3 mb-6">
            <span className="inline-block px-4 py-1 text-sm bg-green-700 text-white rounded-full">
              ✅ You are enrolled
            </span>
            <button
              onClick={() => navigate("/student-dashboard")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className={`mt-4 px-6 py-2 rounded-lg font-semibold ${
              enrolling ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {enrolling ? "Enrolling..." : "Enroll Now"}
          </button>
        )}

        {isEnrolled && course.modules?.length > 0 && (
          <>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Your Progress:</h3>
              <ProgressBar
                courseId={id}
                totalModules={course.modules.length}
                completedModules={completedModules}
                courseTitle={course.title}

              />
            </div>

            {course.modules.map((module, index) => {
              const resources = Array.isArray(module.resources)
                ? module.resources
                : typeof module.resources === "string"
                ? JSON.parse(module.resources || "[]")
                : [];

              return (
                <div key={index} id={`module-${index}`} className="mb-10 bg-gray-700 p-4 rounded-lg mt-6">
                  <h2 className="text-xl font-semibold mb-2">{module.title}</h2>

                  {module.videoUrl ? (
                    <iframe
                      className="w-full h-64 rounded-lg mb-4"
                      src={getYouTubeEmbedUrl(module.videoUrl)}
                      title={module.title}
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <p className="text-red-400">No video available for this module.</p>
                  )}

                  {resources.length > 0 ? (
                    <div>
                      <h4 className="font-semibold mb-1 text-blue-300">Resources:</h4>
                      <ul className="list-disc list-inside text-blue-400">
                        {resources.map((res, idx) => (
                          <li key={idx}>
                            <a
                              href={res.url?.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {res.label?.trim() || `Resource ${idx + 1}`}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-400">No resources available for this module.</p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-4">
                    <button
                      onClick={() => handleMarkComplete(index)}
                      disabled={completedModules.includes(index)}
                      className={`px-4 py-2 rounded-lg text-white font-semibold ${
                        completedModules.includes(index)
                          ? "bg-green-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {completedModules.includes(index)
                        ? "✅ Module Completed"
                        : "Mark as Complete"}
                    </button>

                    <button
                      onClick={() => navigate(`/test/${id}/${index}`)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold"
                    >
                      Start Test for this Module
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
