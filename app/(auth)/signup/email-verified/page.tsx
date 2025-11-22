import Link from "next/link"; 
 
export default function EmailVerifiedPage() { 
  return ( 
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4"> 
      <div className="w-full max-w-md"> 
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 text-center"> 
          {/* Success Icon */} 
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"> 
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
            > 
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              /> 
            </svg> 
          </div> 
 
          <h1 className="text-2xl font-bold text-slate-800 mb-3"> 
            Email Verified Successfully! ✅ 
          </h1> 
 
          <p className="text-slate-600 mb-6"> 
            Your email has been confirmed. You can now log in to complete your profile and start using Mathwiz. 
          </p> 
 
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"> 
            <p className="text-sm font-semibold text-slate-700 mb-2"> 
              Next Steps: 
            </p> 
            <ol className="text-sm text-slate-600 space-y-2 text-left list-decimal list-inside"> 
              <li>Click "Go to Login" below</li> 
              <li>Sign in with your email and password</li> 
              <li>Complete your profile information</li> 
              <li>Start exploring Mathwiz! 🎉</li> 
            </ol> 
          </div> 
 
          <div className="space-y-3"> 
            <Link 
              href="/login" 
              className="block w-full bg-[#25346A] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1a2650] transition-colors" 
            > 
              Go to Login 
            </Link> 
 
            <p className="text-xs text-slate-500"> 
              Make sure to log in on the same browser where you started the signup process 
            </p> 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
} 
