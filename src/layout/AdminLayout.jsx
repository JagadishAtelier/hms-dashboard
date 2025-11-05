import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Fixed Sidebar */}
      <div className="w-[230px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="p-6 bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
