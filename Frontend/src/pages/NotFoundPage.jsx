import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3">
    <h2 className="text-3xl font-semibold">404</h2>
    <p className="text-slate-600">Page not found</p>
    <Link to="/dashboard" className="btn btn-primary">
      Go to Dashboard
    </Link>
  </div>
);

export default NotFoundPage;
