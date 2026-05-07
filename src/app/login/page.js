"use client";
import keycloak from "@/lib/keycloak";

export default function LoginPage() {
  const handleLogin = () => {
    keycloak.login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 relative overflow-hidden">

      {/* BACKGROUND SHAPE */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full blur-3xl opacity-20 -top-20 -left-20"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-400 rounded-full blur-3xl opacity-20 bottom-0 right-0"></div>

      {/* CARD */}
      <div className="relative z-10 bg-white border border-blue-100 shadow-2xl rounded-3xl p-10 w-full max-w-md text-center">

        {/* LOGO */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
          V
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome to VHC
        </h1>

        <p className="text-gray-500 mb-8">
          Secure login to your dashboard
        </p>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 active:scale-95"
        >
            Sign in to Continue
        </button>

        {/* FOOTER */}
        <p className="text-xs text-gray-400 mt-6">
          Protected by Keycloak
        </p>

      </div>
    </div>
  );
}