import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3">
      <h1 className="text-lg font-semibold text-indigo-700">Project Manager</h1>
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-600">
          {user?.name} ({user?.role})
        </p>
        <button className="btn btn-danger text-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
