import React from "react";

export default function ChartsWidget() {
	return (
		<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein flex flex-col gap-6">
			<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
				Charts & Analytics
			</h3>
			<div className="h-80 flex items-center justify-center text-gray-400">
				[Charts Coming Soon]
			</div>
		</div>
	);
}
