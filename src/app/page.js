"use client";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
			{/* <div className="landing-bg" /> */}
			<Navbar />
			<Navbar />
			{/* Hero Section */}
			<main className=" w-full max-w-7xl rounded-b-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg   md:p-16 flex flex-col items-start gap-8 animate-fadein mb-12">
				<h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent p-10">
					Smart Shelf, Real-Time Tracking.
					<br />
					IntelliRack
				</h1>
				<h2 className="text-xl md:text-2xl font-medium text-gray-600 mb-4">
					Effortless Inventory for Homes, Businesses, and Warehouses
				</h2>
				<p className="text-base md:text-lg text-gray-600 max-w-2xl mb-6">
					IntelliRack is an IoT-based system that intelligently manages
					ingredients and inventory using load cells and RFID/NFC tags. Monitor
					your shelf contents in real time, get low-stock alerts, and visualize
					your inventory with a beautiful web interface. Perfect for minimizing
					waste, optimizing stock, and making smarter decisions.
				</p>
				<Link
					href="/register"
					className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-3 text-lg font-semibold text-white shadow-md hover:shadow-lg transition-shadow animate-bouncein"
				>
					Get Started
				</Link>
			</main>

			{/* Features Section */}
			<section
				className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4"
				id="features"
			>
				{[
					{
						title: "Real-Time Inventory",
						description:
							"Track every item and its weight instantly, from kitchen to warehouse.",
					},
					{
						title: "Smart Alerts",
						description:
							"Get notified when stocks run low or items need your attention.",
					},
					{
						title: "Usage Insights",
						description:
							"See consumption patterns and optimize your inventory with data.",
					},
				].map((feature, i) => (
					<div
						key={feature.title}
						className="rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-10 flex flex-col items-center text-center animate-fadein"
						style={{ animationDelay: `${i * 0.1}s` }}
					>
						<h3 className="font-bold text-lg mb-1 text-gray-800">
							{feature.title}
						</h3>
						<p className="text-gray-600 text-sm">{feature.description}</p>
					</div>
				))}
			</section>

			{/* How It Works Section */}
			<section
				id="how"
				className="w-full max-w-7xl mx-auto rounded-b-4xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-8 md:p-12 mb-16 animate-fadein"
			>
				<h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
					How It Works
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{[
						{
							title: "Load Cells Measure Weight",
							description:
								"Each shelf uses precise sensors to track item weight in real time.",
						},
						{
							title: "RFID/NFC Tagging",
							description:
								"Identify every ingredient or product with a simple scan.",
						},
						{
							title: "Cloud Sync & Visualization",
							description:
								"Data is sent to your dashboard for instant access and 3D shelf views.",
						},
					].map((step) => (
						<div
							key={step.title}
							className="rounded-full bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg p-10 text-center"
						>
							<p className="font-semibold mb-1 text-gray-800">{step.title}</p>
							<p className="text-gray-600 text-sm">{step.description}</p>
						</div>
					))}
				</div>
			</section>

			{/* Tech Stack Section */}
			<section
				id="tech"
				className="w-full max-w-7xl mx-auto rounded-b-4xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-8 md:p-12 mb-16 animate-fadein"
			>
				<h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
					Tech Stack
				</h2>
				<div className="flex flex-wrap gap-6 justify-center">
					{[
						"ESP32",
						"HX711",
						"RFID/NFC",
						"Node.js",
						"MongoDB",
						"Next.js",
						"Three.js",
						"React Native",
					].map((tech) => (
						<span
							key={tech}
							className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 text-gray-700 font-semibold shadow-lg"
						>
							{tech}
						</span>
					))}
				</div>
			</section>

			{/* Call to Action Footer */}
			<footer
				id="contact"
				className="w-full max-w-7xl mx-auto rounded-4xl bg-white/60 backdrop-blur-lg border border-white/60 shadow-lg p-8 flex flex-col items-center gap-4 mb-8 animate-fadein"
			>
				<h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
					Ready to get started?
				</h2>
				<p className="text-center text-gray-600 mb-4 w-full md:w-1/2">
					Experience the future of smart inventory management with IntelliRack.
					Join now and transform the way you track, manage, and optimize your
					stock!
				</p>
				<Link
					href="/register"
					className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-3 text-lg font-semibold text-white shadow-md hover:shadow-lg transition-shadow animate-bouncein"
				>
					Get Started
				</Link>
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
