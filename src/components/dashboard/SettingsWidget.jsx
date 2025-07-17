import React from "react";

export default function SettingsWidget() {
	return (
		<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-6 flex flex-col gap-4 items-center">
			<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
				Settings
			</h3>
			<div className="text-gray-500">[Settings Coming Soon]</div>
		</div>
	);
}
