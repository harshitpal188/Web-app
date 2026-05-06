import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/tasks", label: "Tasks" },
  { to: "/profile", label: "Profile" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="min-h-screen w-56 border-r bg-white p-4">
      <p className="mb-4 text-xs uppercase tracking-wide text-slate-400">Menu</p>
      <nav className="space-y-2">
        {links.map((link) => {
          const active = location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`block rounded-lg px-3 py-2 text-sm ${
                active ? "bg-indigo-100 text-indigo-700" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
