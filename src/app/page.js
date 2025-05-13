import Image from "next/image";

export default function Home() {
	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
			{/* Colored gradient background, always visible */}
			<div className="landing-bg" />
			{/* Animated background shapes */}
			{/* <div className="absolute inset-0 -z-10">
				<div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary opacity-30 blur-3xl animate-float1" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-secondary opacity-30 blur-2xl animate-float2" />
				<div className="absolute top-[30%] right-[10%] w-[200px] h-[200px] rounded-full bg-accent opacity-20 blur-2xl animate-float3" />
			</div> */}

			{/* Navigation Bar */}
			<nav className="w-full max-w-7xl mx-auto flex justify-between items-center px-8 py-6 rounded-2xl shadow-sm backdrop-blur-[var(--nav-blur)] bg-[var(--nav-bg)]/50 border border-white/50 mb-12 mt-3">
				<span
					className="font-bold text-xl tracking-tight"
					style={{ letterSpacing: "-0.02em" }}
				>
					<Link href="/">IntelliRack</Link>
				</span>
				<ul className="flex gap-8 text-base font-medium text-[var(--foreground)]">
					<li>
						<Link
							href="#features"
							className="hover:underline underline-offset-4 transition-all cursor-pointer"
						>
							Features
						</Link>
					</li>
					<li>
						<Link
							href="#how"
							className="hover:underline underline-offset-4 transition-all cursor-pointer"
						>
							How it Works
						</Link>
					</li>
					<li>
						<Link
							href="#tech"
							className="hover:underline underline-offset-4 transition-all cursor-pointer"
						>
							Tech Stack
						</Link>
					</li>
					<li>
						<Link
							href="#contact"
							className="hover:underline underline-offset-4 transition-all cursor-pointer"
						>
							Contact
						</Link>
					</li>
				</ul>
			</nav>

			{/* Hero Section */}
			<main className="w-full max-w-7xl rounded-[var(--card-radius)] bg-[var(--glass-bg)]/50 shadow-xl backdrop-blur-[var(--glass-blur)] border border-white/30 p-10 md:p-16 flex flex-col items-start gap-8 animate-fadein mb-12">
				<h1
					className="text-4xl md:text-5xl font-extrabold leading-tight mb-2"
					style={{ color: "var(--foreground)" }}
				>
					Smart Shelf, Real-Time Tracking.
					<br />
					<span className="text-[var(--primary)]">IntelliRack</span>
				</h1>
				<h2 className="text-xl md:text-2xl font-medium text-[var(--accent)] mb-4">
					Effortless Inventory for Homes, Businesses, and Warehouses
				</h2>
				<p className="text-base md:text-lg text-[var(--foreground)]/80 max-w-2xl mb-6">
					IntelliRack is an IoT-based system that intelligently manages
					ingredients and inventory using load cells and RFID/NFC tags. Monitor
					your shelf contents in real time, get low-stock alerts, and visualize
					your inventory with a beautiful web interface. Perfect for minimizing
					waste, optimizing stock, and making smarter decisions.
				</p>
				<button className="px-8 py-3 rounded-full bg-[var(--button-bg)] text-[var(--button-fg)] font-semibold text-lg shadow transition-all hover:bg-[var(--button-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] animate-bouncein">
					Get Started
				</button>
			</main>

			{/* Features Section */}
			<section
				className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4 "
				id="features"
			>
				<div className="rounded-3xl bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-white/20 shadow p-10 flex flex-col items-center text-center animate-fadein">
					{/* <div className="text-4xl mb-2">📦</div> */}
					<h3 className="font-bold text-lg mb-1">Real-Time Inventory</h3>
					<p className="text-[var(--foreground)]/80 text-sm">
						Track every item and its weight instantly, from kitchen to
						warehouse.
					</p>
				</div>
				<div
					className="rounded-3xl bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-white/20 shadow p-10 flex flex-col items-center text-center animate-fadein"
					style={{ animationDelay: "0.1s" }}
				>
					{/* <div className="text-4xl mb-2">🔔</div> */}
					<h3 className="font-bold text-lg mb-1">Smart Alerts</h3>
					<p className="text-[var(--foreground)]/80 text-sm">
						Get notified when stocks run low or items need your attention.
					</p>
				</div>
				<div
					className="rounded-3xl bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-white/20 shadow p-10 flex flex-col items-center text-center animate-fadein"
					style={{ animationDelay: "0.2s" }}
				>
					{/* <div className="text-4xl mb-2">📊</div> */}
					<h3 className="font-bold text-lg mb-1">Usage Insights</h3>
					<p className="text-[var(--foreground)]/80 text-sm">
						See consumption patterns and optimize your inventory with data.
					</p>
				</div>
			</section>

			{/* How It Works Section */}
			<section
				id="how"
				className="w-full max-w-7xl mx-auto rounded-[var(--card-radius)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-white/30 shadow p-8 md:p-12 mb-16 flex flex-col gap-6 animate-fadein"
			>
				<h2 className="text-2xl font-bold mb-2 text-[var(--primary)]">
					How It Works
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="flex flex-col items-center text-center animate-fadein  backdrop-blur-[var(--glass-blur)]/20 border border-white/50 shadow  p-10 rounded-3xl">
						{/* <div className="text-3xl mb-2">⚖️</div> */}
						<p className="font-semibold mb-1">Load Cells Measure Weight</p>
						<p className="text-[var(--foreground)]/80 text-sm">
							Each shelf uses precise sensors to track item weight in real time.
						</p>
					</div>
					<div className="flex flex-col items-center text-center animate-fadein  backdrop-blur-[var(--glass-blur)]/20 border border-white/50 shadow  p-10 rounded-3xl">
						{/* <div className="text-3xl mb-2">📡</div> */}
						<p className="font-semibold mb-1">RFID/NFC Tagging</p>
						<p className="text-[var(--foreground)]/80 text-sm">
							Identify every ingredient or product with a simple scan.
						</p>
					</div>
					<div className="flex flex-col items-center text-center animate-fadein  backdrop-blur-[var(--glass-blur)]/20 border border-white/50 shadow  p-10 rounded-3xl">
						{/* <div className="text-3xl mb-2">🌐</div> */}
						<p className="font-semibold mb-1">Cloud Sync & Visualization</p>
						<p className="text-[var(--foreground)]/80 text-sm">
							Data is sent to your dashboard for instant access and 3D shelf
							views.
						</p>
					</div>
				</div>
			</section>

			{/* Tech Stack Section */}
			<section
				id="tech"
				className="w-full max-w-7xl mx-auto rounded-[var(--card-radius)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-white/30 shadow p-8 md:p-12 mb-16 flex flex-col gap-4 items-center animate-fadein"
			>
				<h2 className="text-2xl font-bold mb-4 text-[var(--accent)]">
					Tech Stack
				</h2>
				<div className="flex flex-wrap gap-6 justify-center text-lg">
					<span className="px-4 py-2 rounded-full bg-[var(--secondary)]/60 text-[var(--foreground)] font-semibold shadow">
						ESP32
					</span>
					<span className="px-4 py-2 rounded-full bg-[var(--primary)]/60 text-[var(--foreground)] font-semibold shadow">
						HX711
					</span>
					<span className="px-4 py-2 rounded-full bg-[var(--secondary)]/60 text-[var(--foreground)] font-semibold shadow">
						RFID/NFC
					</span>
					<span className="px-4 py-2 rounded-full bg-[var(--primary)]/60 text-[var(--foreground)] font-semibold shadow">
						Node.js
					</span>
					<span className="px-4 py-2 rounded-full bg-[var(--secondary)]/60 text-[var(--foreground)] font-semibold shadow">
						MongoDB
					</span>
					<span className="px-4 py-2 rounded-full bg-[var(--primary)]/60 text-[var(--foreground)] font-semibold shadow">
						Next.js
					</span>
					<span className="px-4 py-2 rounded-full bg-[var(--secondary)]/60 text-[var(--foreground)] font-semibold shadow">
						Three.js
					</span>
					<span className="px-4 py-2 rounded-full bg-[var(--primary)]/60 text-[var(--foreground)] font-semibold shadow">
						React Native
					</span>
				</div>
			</section>

			{/* Call to Action Footer */}
			<footer
				id="contact"
				className="w-full max-w-7xl mx-auto rounded-[var(--card-radius)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-white/30 shadow p-8 flex flex-col items-center gap-4 mb-8 animate-fadein"
			>
				<h2 className="text-xl font-bold mb-2 text-[var(--primary)]">
					Ready to get started?
				</h2>
				<p className="text-center text-[var(--foreground)]/80 mb-4   p-10 rounded-2xl w-1/2">
					Experience the future of smart inventory management with IntelliRack.
					Join now and transform the way you track, manage, and optimize your
					stock!
				</p>
				<button className="px-8 py-3 rounded-full bg-[var(--button-bg)] text-[var(--button-fg)] font-semibold text-lg shadow transition-all hover:bg-[var(--button-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] animate-bouncein">
					Get Started
				</button>
			</footer>
		</div>
	);
}

// Animations (add to globals.css):
/*
@keyframes float1 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}
@keyframes float2 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(30px) scale(1.08); }
}
@keyframes float3 {
  0%, 100% { transform: translateX(0) scale(1); }
  50% { transform: translateX(30px) scale(1.04); }
}
@keyframes fadein {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: none; }
}
@keyframes bouncein {
  0% { transform: scale(0.9); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
*/
