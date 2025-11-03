import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800">
      <Sidebar className="w-[10%]" />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="p-6 bg-gray-50 dark:bg-gray-800 w-[100%] text-gray-900 dark:text-gray-100">{children}</main>
      </div>
    </div>
  );
}
