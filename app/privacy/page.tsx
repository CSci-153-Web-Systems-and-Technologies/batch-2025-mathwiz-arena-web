import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen relative overflow-hidden bg-white dark:bg-slate-950">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50/30 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Header */}
            <header className="w-full fixed top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
                <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} />
                        <span className="text-xl font-extrabold tracking-tight text-[#1B2559] dark:text-white">
                            Mathwiz
                        </span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <Link href="/" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">
                            Back to Home
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Content */}
            <div className="pt-24 pb-16">
                <div className="mx-auto max-w-4xl px-6">
                    {/* Page Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1B2559] dark:text-white mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 lg:p-12 space-y-8">

                            {/* Introduction */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">Introduction</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Welcome to Mathwiz Arena. We respect your privacy and are committed to protecting your personal data.
                                    This privacy policy will inform you about how we look after your personal data when you visit our website
                                    and tell you about your privacy rights and how the law protects you.
                                </p>
                            </section>

                            {/* Information We Collect */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">Information We Collect</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                                    <li><strong className="text-slate-800 dark:text-slate-200">Identity Data:</strong> includes first name, last name, username, and profile picture.</li>
                                    <li><strong className="text-slate-800 dark:text-slate-200">Contact Data:</strong> includes email address.</li>
                                    <li><strong className="text-slate-800 dark:text-slate-200">Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting, and location.</li>
                                    <li><strong className="text-slate-800 dark:text-slate-200">Usage Data:</strong> includes information about how you use our website, products, and services.</li>
                                    <li><strong className="text-slate-800 dark:text-slate-200">Competition Data:</strong> includes your participation history, scores, and rankings.</li>
                                </ul>
                            </section>

                            {/* How We Use Your Information */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">How We Use Your Information</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    We use your personal data for the following purposes:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                                    <li>To register you as a new user and manage your account</li>
                                    <li>To provide and manage competition services</li>
                                    <li>To display leaderboards and competition results</li>
                                    <li>To communicate with you about competitions and updates</li>
                                    <li>To improve our website, products, and services</li>
                                    <li>To ensure the security of our platform</li>
                                </ul>
                            </section>

                            {/* Data Security */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">Data Security</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost,
                                    used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal
                                    data to those employees, agents, contractors, and other third parties who have a business need to know.
                                </p>
                            </section>

                            {/* Your Rights */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">Your Rights</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    Under certain circumstances, you have rights under data protection laws in relation to your personal data:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                                    <li>Request access to your personal data</li>
                                    <li>Request correction of your personal data</li>
                                    <li>Request erasure of your personal data</li>
                                    <li>Object to processing of your personal data</li>
                                    <li>Request restriction of processing your personal data</li>
                                    <li>Request transfer of your personal data</li>
                                </ul>
                            </section>

                            {/* Cookies */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">Cookies</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Our website uses cookies to distinguish you from other users. This helps us to provide you with a good
                                    experience when you browse our website and also allows us to improve our site. By continuing to browse
                                    the site, you are agreeing to our use of cookies.
                                </p>
                            </section>

                            {/* Contact Us */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">Contact Us</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    If you have any questions about this privacy policy or our privacy practices, please contact us at:{" "}
                                    <a href="mailto:privacy@mathwiz.com" className="text-[#F49700] hover:text-orange-600 transition-colors font-medium">
                                        privacy@mathwiz.com
                                    </a>
                                </p>
                            </section>

                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-12">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B2559] text-white font-semibold rounded-xl hover:bg-[#2a3d7a] transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto">
                <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Image src="/icon.svg" alt="Mathwiz Logo" width={20} height={20} className="opacity-80" />
                        <span className="font-semibold">© {new Date().getFullYear()} Mathwiz</span>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-[#1B2559] dark:text-white font-medium">Privacy</Link>
                        <Link href="/terms" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
