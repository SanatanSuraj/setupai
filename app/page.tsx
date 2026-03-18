import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .glass-morphism {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .status-dot { height: 8px; width: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
        .dot-green { background-color: #10b981; }
        .dot-amber { background-color: #f59e0b; }
        
        /* Custom animations for the visual section */
        @keyframes float-slow {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
            100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-fast {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(-3deg); }
            100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
      `}} />

      <div className="bg-slate-50 text-slate-900 font-sans">
        {/* Navigation */}
        <nav className="fixed w-full z-50 glass-morphism border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <i className="fas fa-microscope text-white text-xl"></i>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-blue-900">SetupAI</span>
                    </div>
                    <div className="hidden md:flex space-x-8 text-sm font-semibold text-slate-600">
                        <a href="#compare" className="hover:text-blue-600 transition">Why SetupAI</a>
                        <a href="#roadmap" className="hover:text-blue-600 transition">Setup Roadmap</a>
                        <a href="#features" className="hover:text-blue-600 transition">Features</a>
                        <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
                        <Link href="/contact" className="hover:text-blue-600 transition">Contact</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-semibold text-slate-700 px-4 py-2 hover:text-blue-600 transition">Log In</Link>
                        <Link href="/register" className="bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 transition">Get Started</Link>
                    </div>
                </div>
            </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6 text-blue-700 text-sm font-bold">
                    Helping 100+ labs across India
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-slate-900 mb-6">
                    Start your lab or clinic <br/>
                    <span className="text-blue-600">the right way.</span>
                </h1>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
                    Stop worrying about paperwork. We help you get your licenses, pick the right equipment, and follow the law—all in one simple app.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                    <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-200">
                        See your setup plan <i className="fas fa-arrow-right text-sm"></i>
                    </Link>
                    <Link href="/contact" className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:border-blue-600 transition">
                        Talk to an expert
                    </Link>
                </div>
                <div className="flex justify-center items-center gap-8 md:gap-16 border-t border-slate-200 pt-8 w-full max-w-2xl">
                    <div>
                        <p className="text-2xl font-bold text-slate-900">All</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase">States in India</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">Fast</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase">License Approval</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">Save</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase">On Equipment</p>
                    </div>
                </div>
            </div>
        </section>

        {/* The Problem vs Solution (Visual Side-by-Side) */}
        <section id="compare" className="py-24 bg-white border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold mb-4">From chaos to clarity.</h2>
                    <p className="text-slate-600 text-lg">Stop guessing what to do next. Let the platform guide you.</p>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                    {/* Left: The Confused User (Before) */}
                    <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200 relative overflow-hidden min-h-[450px] flex flex-col items-center justify-center">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2 z-10 text-center">Doing it alone</h3>
                        <p className="text-slate-500 mb-12 z-10 text-center">Lost in medical acronyms and endless paperwork.</p>
                        
                        {/* Chaotic floating elements */}
                        <div className="absolute top-32 left-8 bg-white px-4 py-2 rounded-lg shadow-lg border border-red-100 text-sm font-bold text-red-600 rotate-[-10deg] animate-float-slow">
                            NABL Compliance?
                        </div>
                        <div className="absolute top-24 right-10 bg-white px-4 py-2 rounded-lg shadow-lg border border-amber-100 text-sm font-bold text-amber-600 rotate-[12deg] animate-float-fast">
                            Fire NOC Pending!
                        </div>
                        <div className="absolute bottom-32 left-12 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-200 text-sm font-bold text-slate-700 rotate-[8deg] animate-float-fast">
                            Which Analyzer to buy?
                        </div>
                        <div className="absolute bottom-24 right-8 bg-white px-4 py-2 rounded-lg shadow-lg border border-red-100 text-sm font-bold text-red-600 rotate-[-15deg] animate-float-slow">
                            BMW License Rejected
                        </div>
                        {/* Confused Avatar */}
                        <div className="relative z-10 mt-4">
                            <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center shadow-inner border-4 border-white">
                                <i className="fas fa-user-injured text-5xl text-slate-400"></i>
                            </div>
                            <div className="absolute -top-4 -right-4 text-3xl font-black text-slate-400 animate-bounce">
                                ?
                            </div>
                            <div className="absolute -top-2 -left-4 text-2xl font-black text-slate-400 animate-bounce" style={{ animationDelay: "0.5s" }}>
                                ?
                            </div>
                        </div>
                    </div>

                    {/* Right: The Structured User (After) */}
                    <div className="bg-blue-600 rounded-3xl p-8 border border-blue-700 relative overflow-hidden min-h-[450px] flex flex-col items-center justify-center shadow-2xl shadow-blue-200">
                        <h3 className="text-2xl font-bold text-white mb-2 z-10 text-center">Using SetupAI</h3>
                        <p className="text-blue-200 mb-8 z-10 text-center">A clear, step-by-step path to your opening day.</p>
                        
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-800 to-transparent opacity-50"></div>

                        {/* Structured UI Mockup */}
                        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10 flex flex-col gap-4 transform transition hover:scale-105 duration-300">
                            {/* Task 1 */}
                            <div className="flex items-start gap-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <i className="fas fa-check text-sm"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">1. Regulatory Licenses</p>
                                    <p className="text-xs text-emerald-600 font-semibold mt-1">All 4 documents approved.</p>
                                </div>
                            </div>
                            {/* Task 2 */}
                            <div className="flex items-start gap-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <i className="fas fa-check text-sm"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">2. Equipment Planner</p>
                                    <p className="text-xs text-emerald-600 font-semibold mt-1">Vendors selected. CAPEX saved.</p>
                                </div>
                            </div>
                            {/* Task 3 (Active) */}
                            <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-xl border border-blue-200 shadow-inner relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <i className="fas fa-spinner animate-spin"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-blue-900">3. NABL SOP Creation</p>
                                    <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                                        <div className="bg-blue-600 h-1.5 rounded-full w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* The Setup Roadmap Section */}
        <section id="roadmap" className="py-24 bg-slate-900 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
            
            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <span className="text-blue-400 font-bold tracking-widest text-sm uppercase mb-2 block">The Master Plan</span>
                    <h2 className="text-3xl lg:text-5xl font-bold mb-4">Your Setup Roadmap</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">We've turned a 6-month headache into a simple 5-step process. Just follow the timeline.</p>
                </div>

                <div className="relative">
                    {/* Vertical Center Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-slate-800 rounded-full"></div>

                    <div className="space-y-12">
                        
                        {/* Step 1 */}
                        <div className="flex flex-col md:flex-row items-center justify-between w-full group">
                            <div className="md:w-5/12 text-left md:text-right md:pr-8 mb-6 md:mb-0 w-full pl-12 md:pl-0 relative">
                                {/* Mobile Node */}
                                <div className="md:hidden absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-800 border-2 border-blue-500 flex items-center justify-center font-bold text-blue-400 text-sm">1</div>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition">Plan & Budget</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Choose your lab type (Basic, Medium, or Advanced clinic setup) and target city. Our AI instantly generates a personalized timeline and accurate cost estimate.</p>
                            </div>
                            {/* Desktop Node */}
                            <div className="hidden md:flex w-2/12 justify-center relative">
                                <div className="w-12 h-12 rounded-full bg-slate-900 border-4 border-blue-500 flex items-center justify-center z-10 text-xl font-black text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]">1</div>
                            </div>
                            <div className="md:w-5/12 w-full hidden md:block"></div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col md:flex-row items-center justify-between w-full group">
                            <div className="md:w-5/12 w-full hidden md:block"></div>
                            {/* Desktop Node */}
                            <div className="hidden md:flex w-2/12 justify-center relative">
                                <div className="w-12 h-12 rounded-full bg-slate-900 border-4 border-emerald-500 flex items-center justify-center z-10 text-xl font-black text-emerald-400">2</div>
                            </div>
                            <div className="md:w-5/12 text-left md:pl-8 mb-6 md:mb-0 w-full pl-12 md:pl-0 relative">
                                 {/* Mobile Node */}
                                 <div className="md:hidden absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-400 text-sm">2</div>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition">Licenses & Compliance</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Use our state-based tracker to apply for Clinical Establishment Registration, Biomedical Waste (BMW), Fire NOC, and Pollution Control without hiring costly agents.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col md:flex-row items-center justify-between w-full group">
                            <div className="md:w-5/12 text-left md:text-right md:pr-8 mb-6 md:mb-0 w-full pl-12 md:pl-0 relative">
                                {/* Mobile Node */}
                                <div className="md:hidden absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center font-bold text-amber-400 text-sm">3</div>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition">Infrastructure & Equipment</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Input your test menu. Our system recommends the exact Hematology and Biochemistry analyzers you need, compares vendors, and calculates your Break-Even ROI.</p>
                            </div>
                            {/* Desktop Node */}
                            <div className="hidden md:flex w-2/12 justify-center relative">
                                <div className="w-12 h-12 rounded-full bg-slate-900 border-4 border-amber-500 flex items-center justify-center z-10 text-xl font-black text-amber-400">3</div>
                            </div>
                            <div className="md:w-5/12 w-full hidden md:block"></div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col md:flex-row items-center justify-between w-full group">
                            <div className="md:w-5/12 text-left md:text-right md:pr-8 mb-6 md:mb-0 w-full pl-12 md:pl-0 relative">
                                {/* Mobile Node */}
                                <div className="md:hidden absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-800 border-2 border-pink-500 flex items-center justify-center font-bold text-pink-400 text-sm">4</div>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-400 transition">Launch & Operations</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Hire Pathologists and Technicians using our salary benchmarks. Integrate your LIS/Billing software, run trial samples, and open your doors to patients.</p>
                            </div>
                            {/* Desktop Node */}
                            <div className="hidden md:flex w-2/12 justify-center relative">
                                <div className="w-12 h-12 rounded-full bg-slate-900 border-4 border-pink-500 flex items-center justify-center z-10 text-xl font-black text-pink-400">4</div>
                            </div>
                            <div className="md:w-5/12 w-full hidden md:block"></div>
                        </div>

                    </div>
                </div>
                
                <div className="text-center mt-20">
                    <Link href="/register" className="inline-block bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-xl">
                        Generate Your Roadmap Now
                    </Link>
                </div>
            </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-blue-600 font-bold tracking-widest text-sm uppercase mb-2 block">Core Features</span>
                    <h2 className="text-3xl lg:text-5xl font-bold mb-4">Everything you need to go live.</h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">One platform for setup, compliance, equipment planning, and operations.</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-24">
                    
                    {/* 1. License Tracker */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                            <i className="fas fa-file-contract text-2xl text-blue-600"></i>
                        </div>
                        <h5 className="text-blue-600 font-bold mb-3 uppercase tracking-wider text-xs">License Tracker</h5>
                        <h2 className="text-2xl font-bold mb-4">Get licenses faster.</h2>
                        <p className="text-slate-600 mb-6 text-sm leading-relaxed">We give you a list of every document you need for your state. Track Fire Safety, BMW, and Clinical Establishment approvals in one place.</p>
                        <ul className="space-y-3 text-slate-700 font-medium text-sm mt-auto">
                            <li><i className="fas fa-check-circle text-blue-500 mr-2"></i> State-wise license list</li>
                            <li><i className="fas fa-check-circle text-blue-500 mr-2"></i> Document checklists</li>
                            <li><i className="fas fa-check-circle text-blue-500 mr-2"></i> Reminders for renewals</li>
                        </ul>
                    </div>

                    {/* 2. Cost Calculator */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                            <i className="fas fa-calculator text-2xl text-emerald-600"></i>
                        </div>
                        <h5 className="text-emerald-600 font-bold mb-3 uppercase tracking-wider text-xs">Cost Calculator</h5>
                        <h2 className="text-2xl font-bold mb-4">Plan your budget.</h2>
                        <p className="text-slate-600 mb-6 text-sm leading-relaxed">Know exactly how much you will spend on machines, rent, and staff. See when you will start making a profit based on your local area.</p>
                        <ul className="space-y-3 text-slate-700 font-medium text-sm mt-auto">
                            <li><i className="fas fa-check-circle text-emerald-500 mr-2"></i> Profit/Loss calculator</li>
                            <li><i className="fas fa-check-circle text-emerald-500 mr-2"></i> Break-even analysis</li>
                            <li><i className="fas fa-check-circle text-emerald-500 mr-2"></i> Monthly cost tracker</li>
                        </ul>
                    </div>

                    {/* 3. Equipment Planner */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                            <i className="fas fa-microscope text-2xl text-purple-600"></i>
                        </div>
                        <h5 className="text-purple-600 font-bold mb-3 uppercase tracking-wider text-xs">Equipment Planner</h5>
                        <h2 className="text-2xl font-bold mb-4">Buy the right machines.</h2>
                        <p className="text-slate-600 mb-6 text-sm leading-relaxed">Input the tests you want to run, and our system recommends the exact analyzers you need while comparing vendor prices to save you money.</p>
                        <ul className="space-y-3 text-slate-700 font-medium text-sm mt-auto">
                            <li><i className="fas fa-check-circle text-purple-500 mr-2"></i> Test-menu based suggestions</li>
                            <li><i className="fas fa-check-circle text-purple-500 mr-2"></i> Vendor price comparisons</li>
                            <li><i className="fas fa-check-circle text-purple-500 mr-2"></i> Machine ROI tracking</li>
                        </ul>
                    </div>

                    {/* 4. Staffing & HR */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center mb-6">
                            <i className="fas fa-user-nurse text-2xl text-pink-600"></i>
                        </div>
                        <h5 className="text-pink-600 font-bold mb-3 uppercase tracking-wider text-xs">Staffing & HR</h5>
                        <h2 className="text-2xl font-bold mb-4">Hire the right team.</h2>
                        <p className="text-slate-600 mb-6 text-sm leading-relaxed">Don't guess what to pay your pathologists and technicians. Use our local salary benchmarks and verified hiring templates to build your team.</p>
                        <ul className="space-y-3 text-slate-700 font-medium text-sm mt-auto">
                            <li><i className="fas fa-check-circle text-pink-500 mr-2"></i> City-wise salary benchmarks</li>
                            <li><i className="fas fa-check-circle text-pink-500 mr-2"></i> Qualification checklists</li>
                            <li><i className="fas fa-check-circle text-pink-500 mr-2"></i> Offer letter templates</li>
                        </ul>
                    </div>

                    {/* 6. LIS Integration */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                            <i className="fas fa-laptop-medical text-2xl text-indigo-600"></i>
                        </div>
                        <h5 className="text-indigo-600 font-bold mb-3 uppercase tracking-wider text-xs">LIS & Software</h5>
                        <h2 className="text-2xl font-bold mb-4">Automate lab work.</h2>
                        <p className="text-slate-600 mb-6 text-sm leading-relaxed">Find the best Laboratory Information System (LIS) for your needs. We help you map your workflow from sample collection to automated report delivery.</p>
                        <ul className="space-y-3 text-slate-700 font-medium text-sm mt-auto">
                            <li><i className="fas fa-check-circle text-indigo-500 mr-2"></i> LIS vendor selection</li>
                            <li><i className="fas fa-check-circle text-indigo-500 mr-2"></i> Sample tracking setup</li>
                            <li><i className="fas fa-check-circle text-indigo-500 mr-2"></i> Automated reporting</li>
                        </ul>
                    </div>

                </div>
            </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Choose a plan</h2>
                    <p className="text-slate-600">Pick the best plan for your new lab or clinic.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-lg mb-2">Free Plan</h3>
                        <div className="text-3xl font-bold mb-4">₹0</div>
                        <p className="text-sm text-slate-500 mb-8">Basic plan to see your roadmap.</p>
                        <Link href="/register" className="block w-full border-2 border-slate-200 py-3 rounded-lg font-bold hover:border-blue-600 transition text-center">Try for Free</Link>
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl border-2 border-blue-600 shadow-xl">
                        <h3 className="font-bold text-lg mb-2">Setup Pro</h3>
                        <div className="text-3xl font-bold mb-4">Subscription</div>
                        <p className="text-sm text-slate-500 mb-8 font-semibold">Best for single lab owners.</p>
                        <Link href="/register" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-center">Get Pro</Link>
                    </div>
                    
                    <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800">
                        <h3 className="font-bold text-lg mb-2">Enterprise</h3>
                        <div className="text-3xl font-bold mb-4">Custom</div>
                        <p className="text-sm text-slate-400 mb-8">For multiple labs or franchises.</p>
                        <Link href="/contact" className="block w-full bg-white text-slate-900 py-3 rounded-lg font-bold hover:bg-slate-200 transition text-center">Talk to Sales</Link>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 pt-16 pb-10">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
                        <i className="fas fa-microscope text-sm"></i>
                    </div>
                    <span className="text-xl font-bold text-blue-900">SetupAI</span>
                </div>
                <div className="flex justify-center gap-6 text-sm text-slate-500 mb-8 font-medium">
                    <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
                    <Link href="/contact" className="hover:text-blue-600 transition">Contact</Link>
                    <Link href="/login" className="hover:text-blue-600 transition">Login</Link>
                </div>
                <p className="text-sm text-slate-500 mb-8">Helping India start better diagnostic labs.</p>
                <p className="text-xs text-slate-400">© 2026 SetupAI Platform. All information verified for Indian states.</p>
            </div>
        </footer>
      </div>
    </>
  );
}