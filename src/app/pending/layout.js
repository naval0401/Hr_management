import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="ml-[250px]">

        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-4">
          {children}
        </main>

      </div>
    </div>
  );
}