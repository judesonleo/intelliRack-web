"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components";
import { useRouter } from "next/navigation";

function getAuthCookie() {
	if (typeof document === "undefined") return false;
	return document.cookie
		.split(";")
		.some((c) => c.trim().startsWith("isLoggedIn=true"));
}

export default function DashboardPage() {
	const [authenticated, setAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Demo: check localStorage for 'auth' (simulate login)
	useEffect(() => {
		const isAuth = getAuthCookie();
		setAuthenticated(isAuth);
		setLoading(false);
		if (!isAuth) {
			router.replace("/login");
		}
	}, [router]);

	function handleSignOut() {
		document.cookie = "isLoggedIn=; path=/; max-age=0";
		router.replace("/login");
	}

	if (loading) return null;
	if (!authenticated) return null;

	return (
		<div className="min-h-screen flex items-center justify-center bg-transparent">
			<div className="w-full max-w-md mx-auto rounded-xl bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--primary)]/20 shadow p-8 flex flex-col gap-6 animate-fadein items-center">
				<h1 className="text-2xl font-bold text-[var(--primary)] mb-2 text-center">
					Welcome to IntelliRack!
				</h1>
				<p className="text-[var(--foreground)]/80 text-center mb-4">
					You are signed in. This is your dashboard.
				</p>
				<Button variant="outline" onClick={handleSignOut} fullWidth>
					Sign Out
				</Button>
			</div>
		</div>
	);
}
