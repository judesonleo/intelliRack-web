import React from "react";

export default function DashboardLayout({ children }) {
	return (
		<div className="min-h-screen flex flex-col items-center justify-start bg-white dark:bg-zinc-900 py-8 px-2">
			{children}
		</div>
	);
}
