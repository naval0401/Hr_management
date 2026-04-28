import Layout from "../components/Layout";

export default function LeaveLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Layout>
      {children}
    </Layout>
          
    </div>
  );
}