import React from "react";

export default function ActivityTimeline({ timeline }) {
	return (
		<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-6 flex flex-col gap-4">
			<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
				Recent Activity
			</h3>
			<ul className="space-y-2 flex flex-col md:flex-row md:gap-6 md:space-y-0">
				{timeline.map((a, i) => (
					<li
						key={i}
						className="rounded-xl bg-white/20 p-3 border border-white/30 shadow flex flex-col items-center min-w-[120px]"
					>
						<span className="font-semibold text-indigo-600">{a.time}</span>
						<span className="text-xs text-gray-700">{a.event}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
