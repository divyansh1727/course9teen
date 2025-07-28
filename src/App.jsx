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
import FreeCourses from "./pages/FreeCourses";
import CourseDetail from "./pages/CourseDetail";
import InstructorPage from "./pages/InstructorPage";
import InstructorDetail from "./pages/InstructorDetail";
import EditInstructor from "./pages/EditInstructor";
import ManageInstructors from "./pages/ManageInstructors";
import AddInstructor from "./pages/AdminAddInstructor";
import NotAuthorized from "./pages/NotAuthorized";
import TestimonialsSection from "./Components/TestimonialsSection";
import ManageTestimonials from "./pages/ManageTestimonials";
import EditTestimonial from "./pages/EditTestimonial";
import AddTestimonial from "./pages/AddTestimonial";
import './index.css';

function App() {
  const location = useLocation();

  const hiddenRoutes = ["/sign-in", "/sign-up", "/admin-signin"];
  const shouldHideLayout = hiddenRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideLayout && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/admin-signin" element={<AdminSignIn />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/course/:id" element={<CourseView />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/browse-courses" element={<BrowseCourses />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/test/:courseId/:moduleIndex" element={<StudentQuizPage />} />
        <Route path="/free-courses" element={<FreeCourses />} />
        <Route path="/course-detail/:courseId" element={<CourseDetail />} />
        <Route path="/instructor/:instructorId" element={<InstructorDetail />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="instructor/:instructorId" element={<InstructorPage />} />
        <Route path="/testimonials" element={<TestimonialsSection />} />


        {/* Admin Routes Nested under AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="create-course" element={<AdminCreateCourse />} />
          <Route path="manage-courses" element={<ManageCourses />} />
          <Route path="edit-course/:id" element={<EditCourse />} />
          <Route path="courses/:courseId/module/:moduleIndex/test" element={<AdminTestPage />} />
          <Route path="courses/:courseId/module/:moduleIndex/progress" element={<AdminTestProgressPage />} />
          <Route path="add-instructor" element={<AddInstructor />} />
          <Route path="edit-instructor/:id" element={<EditInstructor />} />
          <Route path="instructors" element={<ManageInstructors />} />
          <Route path="manage-testimonials" element={<ManageTestimonials />} />
          <Route path="edit-testimonial/:testimonialId" element={<EditTestimonial />} />
          <Route path="add-testimonial" element={<AddTestimonial />} />

        </Route>
      </Routes>

      {!shouldHideLayout && <Footer />}
    </>
  );
}

export default App;




