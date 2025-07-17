import React from "react";

export default function DashboardLayout({ children }) {
	return (
		<div className="min-h-screen flex flex-col items-center justify-start bg-black/5 backdrop-blur-2xl py-8 px-2">
			{children}
		</div>
	);
}
