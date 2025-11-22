import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 text-center">
          {/* Email Icon */}
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#25346A]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-3">
            Check Your Email
          </h1>
          
          <p className="text-slate-600 mb-6">
            We've sent you a confirmation email. Please click the link in the email to verify your account and complete your registration.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-700">
              <strong>Didn't receive the email?</strong>
            </p>
            <ul className="text-sm text-slate-600 mt-2 space-y-1 text-left">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes and refresh your inbox</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-[#25346A] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1a2650] transition-colors"
            >
              Back to Login
            </Link>
            
            <Link
              href="/signup"
              className="block w-full text-slate-600 hover:text-slate-800 text-sm"
            >
              Try signing up again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
