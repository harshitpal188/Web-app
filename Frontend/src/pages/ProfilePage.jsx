import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-lg rounded-xl border bg-white p-6">
      <h2 className="mb-4 text-2xl font-semibold">Profile</h2>
      <div className="space-y-2 text-slate-700">
        <p>
          <span className="font-medium">Name:</span> {user?.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {user?.email}
        </p>
        <p>
          <span className="font-medium">Role:</span> {user?.role}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
