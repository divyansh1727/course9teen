// src/Components/Dashboard.jsx
import { useUser } from "@clerk/clerk-react";

const Dashboard = () => {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>You are not signed in.</div>;

  return (
    <div className="p-6 text-xl">
      <h1 className="font-bold">Welcome, {user.fullName} 👋</h1>
      <p>Email: {user.primaryEmailAddress.emailAddress}</p>
      <img
        src={user.imageUrl}
        alt="User"
        className="w-20 h-20 rounded-full mt-4 border"
      />
    </div>
  );
};

export default Dashboard;
