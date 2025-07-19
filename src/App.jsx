import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import SignInPage from "./Components/SignInpage";
import SignUpPage from "./Components/SignUppage";
import Home from "./Components/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSignIn from "./pages/AdminSignIn";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import StudentDashboard from "./pages/Studentdashboard";
import AdminCreateCourse from "./pages/AdminCreateCourse";
import CourseView from "./pages/CourseView";
import RegisterForm from "./Components/Registration";
import BrowseCourses from "./pages/BrowseCourses";
import Dashboard from "./Components/Dashboard";
import AdminLayout from "./pages/AdminLayout"; 
import ManageCourses from "./pages/ManageCourses"; 
import EditCourse from "./pages/EditCourse"; 
import AdminTestPage from "./pages/AdminTestPage"; 
import StudentQuizPage from "./pages/StudentQuizPage";
import AdminTestProgressPage from "./pages/AdminTestProgressPage";




function App() {
  const location = useLocation();

  const hiddenRoutes = ["/sign-in", "/sign-up", "/admin-signin"];
  const shouldHideLayout = hiddenRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/admin-signin" element={<AdminSignIn />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/course/:id" element={<CourseView />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/browse-courses" element={<BrowseCourses />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="test/:courseId/:moduleIndex" element={<StudentQuizPage />} />


        {/* ✅ Admin Routes Nested */}
        <Route path="/admin" element={<AdminLayout />}>
  <Route index element={<Navigate to="create-course" />} />
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="create-course" element={<AdminCreateCourse />} />
  <Route path="manage-courses" element={<ManageCourses />} /> 
  <Route path="edit-course/:id" element={<EditCourse />} /> 
  <Route path="test/:courseId/:moduleIndex" element={<AdminTestPage />} />
  <Route path="courses/:courseId/module/:moduleIndex/progress" element={<AdminTestProgressPage />} />

  </Route>

        
      </Routes>

      {!shouldHideLayout && <Footer />}
      </>
  );
}
    

export default App;



