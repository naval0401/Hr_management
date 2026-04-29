import "./globals.css"; // Import our global CSS file so Tailwind works on every page
import Providers from "./provider";
import Layout from "./components/Layout";

export const metadata = { // Define metadata for SEO (Search Engine Optimization)
  title: "VHC LEAVE", // Set the title that appears in the browser tab
  description: "LEAVE APP", // Set the meta description for search engines
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"><body className="antialiased">
      <Providers>
        <Layout>
        {children}
        </Layout>
        </Providers>
        </body></html>
  );
}
