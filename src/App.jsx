import { Routes, Route } from "react-router-dom";
import SignInPage from "./Components/SignInpage";
import SignUpPage from "./Components/SignUppage";
import Home from "./Components/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSignIn from "./pages/AdminSignIn";

function App() {
  return (
    <Routes>
      {/* Always show Home on root */}
      <Route path="/" element={<Home />} />

      {/* Firebase-based sign-in and sign-up */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin-signin" element={<AdminSignIn />} />
    </Routes>
  );
}

export default App;


