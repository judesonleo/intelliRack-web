"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components";
import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";

export default function DashboardPage() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const u = getUser();
		if (!u) {
			router.replace("/login");
		} else {
			setUser(u);
			setLoading(false);
		}
	}, [router]);

	function handleSignOut() {
		logout();
		router.replace("/login");
	}

	if (loading) return null;
	if (!user) return null;

	return (
		<div className="min-h-screen flex items-center justify-center bg-transparent">
			<div className="w-full max-w-md mx-auto rounded-xl bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--primary)]/20 shadow p-8 flex flex-col gap-6 animate-fadein items-center">
				<h1 className="text-2xl font-bold text-[var(--primary)] mb-2 text-center">
					Welcome to IntelliRack!
				</h1>
				<p className="text-[var(--foreground)]/80 text-center mb-4">
					You are signed in as{" "}
					<span className="font-semibold">{user.name}</span>.
				</p>
				<Button variant="outline" onClick={handleSignOut} fullWidth>
					Sign Out
				</Button>
			</div>
		</div>
	);
}
