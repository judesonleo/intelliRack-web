import Link from "next/link";

export default function Navbar() {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-7xl px-6 py-4">
			<div className="flex items-center justify-between rounded-full bg-white/10 px-8 py-4 backdrop-blur-lg border border-white/20 shadow-lg">
				<Link href="/" className="flex items-center gap-2">
					<span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
						IntelliRack
					</span>
				</Link>

				<div className="hidden md:flex items-center gap-8">
					<ul className="flex gap-6 text-sm font-medium text-gray-600">
						<li>
							<Link
								href="#features"
								className="hover:text-gray-900 transition-colors"
							>
								Features
							</Link>
						</li>
						<li>
							<Link
								href="#how"
								className="hover:text-gray-900 transition-colors"
							>
								How it Works
							</Link>
						</li>
						<li>
							<Link
								href="#tech"
								className="hover:text-gray-900 transition-colors"
							>
								Tech Stack
							</Link>
						</li>
						<li>
							<Link
								href="#contact"
								className="hover:text-gray-900 transition-colors"
							>
								Contact
							</Link>
						</li>
					</ul>
					<Link
						href="/login"
						className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-shadow"
					>
						Sign In
					</Link>
				</div>
			</div>
		</nav>
	);
}
