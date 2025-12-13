import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
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
                            Terms of Service
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 lg:p-12 space-y-8">

                            {/* Agreement to Terms */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">1. Agreement to Terms</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    By accessing or using Mathwiz Arena, you agree to be bound by these Terms of Service and all applicable
                                    laws and regulations. If you do not agree with any of these terms, you are prohibited from using or
                                    accessing this site. The materials contained in this website are protected by applicable copyright and
                                    trademark law.
                                </p>
                            </section>

                            {/* Use License */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">2. Use License</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    Permission is granted to temporarily access the materials (information or software) on Mathwiz Arena
                                    for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                                    <li>Modify or copy the materials</li>
                                    <li>Use the materials for any commercial purpose</li>
                                    <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                                    <li>Remove any copyright or other proprietary notations from the materials</li>
                                    <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                                </ul>
                            </section>

                            {/* User Accounts */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">3. User Accounts</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    When you create an account with us, you must provide accurate, complete, and current information.
                                    You are responsible for:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                                    <li>Safeguarding your account credentials</li>
                                    <li>All activities that occur under your account</li>
                                    <li>Notifying us immediately of any unauthorized use of your account</li>
                                    <li>Ensuring your account information remains accurate and up-to-date</li>
                                </ul>
                            </section>

                            {/* Competition Rules */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">4. Competition Rules</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    By participating in any competition on Mathwiz Arena, you agree to:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                                    <li>Compete fairly and honestly without using unauthorized aids or assistance</li>
                                    <li>Not share competition problems or answers during active competitions</li>
                                    <li>Accept the decisions of competition organizers regarding results and disputes</li>
                                    <li>Not create multiple accounts to gain unfair advantages</li>
                                    <li>Respect fellow participants and maintain appropriate conduct</li>
                                </ul>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                                    <strong className="text-slate-800 dark:text-slate-200">Violation of these rules may result in disqualification,
                                        account suspension, or permanent ban from the platform.</strong>
                                </p>
                            </section>

                            {/* Organizer Responsibilities */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">5. Organizer Responsibilities</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    If you are an organizer on Mathwiz Arena, you agree to:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                                    <li>Create original problems or have proper rights to use submitted content</li>
                                    <li>Ensure competitions are fair and accessible to all participants</li>
                                    <li>Maintain the confidentiality of competition problems before the event</li>
                                    <li>Handle participant data responsibly and in accordance with our Privacy Policy</li>
                                    <li>Respond to participant inquiries and disputes in a timely manner</li>
                                </ul>
                            </section>

                            {/* Intellectual Property */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">6. Intellectual Property</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    The Mathwiz Arena platform, including its logo, design, and software, is owned by Mathwiz and is
                                    protected by intellectual property laws. Problems created by organizers remain their intellectual
                                    property, but by uploading them to the platform, organizers grant Mathwiz a license to use, display,
                                    and distribute them within the platform's services.
                                </p>
                            </section>

                            {/* Disclaimer */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">7. Disclaimer</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    The materials on Mathwiz Arena are provided on an 'as is' basis. Mathwiz makes no warranties,
                                    expressed or implied, and hereby disclaims and negates all other warranties including, without
                                    limitation, implied warranties or conditions of merchantability, fitness for a particular purpose,
                                    or non-infringement of intellectual property or other violation of rights.
                                </p>
                            </section>

                            {/* Limitations */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">8. Limitations</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    In no event shall Mathwiz or its suppliers be liable for any damages (including, without limitation,
                                    damages for loss of data or profit, or due to business interruption) arising out of the use or
                                    inability to use the materials on Mathwiz Arena, even if Mathwiz or a Mathwiz authorized representative
                                    has been notified orally or in writing of the possibility of such damage.
                                </p>
                            </section>

                            {/* Termination */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">9. Termination</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    We may terminate or suspend your account immediately, without prior notice or liability, for any
                                    reason whatsoever, including without limitation if you breach the Terms. Upon termination, your
                                    right to use the Service will immediately cease. If you wish to terminate your account, you may
                                    simply discontinue using the Service or contact us to request account deletion.
                                </p>
                            </section>

                            {/* Changes to Terms */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">10. Changes to Terms</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                                    If a revision is material, we will try to provide at least 30 days' notice prior to any new
                                    terms taking effect. What constitutes a material change will be determined at our sole discretion.
                                    By continuing to access or use our Service after those revisions become effective, you agree to
                                    be bound by the revised terms.
                                </p>
                            </section>

                            {/* Contact Us */}
                            <section>
                                <h2 className="text-2xl font-bold text-[#1B2559] dark:text-white mb-4">11. Contact Us</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    If you have any questions about these Terms of Service, please contact us at:{" "}
                                    <a href="mailto:legal@mathwiz.com" className="text-[#F49700] hover:text-orange-600 transition-colors font-medium">
                                        legal@mathwiz.com
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
                        <Link href="/privacy" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-[#1B2559] dark:text-white font-medium">Terms</Link>
                        <Link href="/contact" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
