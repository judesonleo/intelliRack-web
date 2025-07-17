import React from "react";

export default function AlertsWidget({ alerts }) {
	return (
		<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-6 flex flex-col gap-4">
			<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
				Active Alerts
			</h3>
			<ul className="space-y-2 max-h-56 overflow-y-auto">
				{alerts.length === 0 && <li className="text-gray-500">No alerts.</li>}
				{alerts.slice(0, 5).map((a, i) => (
					<li
						key={i}
						className={`rounded-xl p-3 border shadow flex flex-col ${
							a.type === "EMPTY"
								? "border-red-400 bg-red-100/40"
								: a.type === "LOW_STOCK"
								? "border-yellow-400 bg-yellow-100/40"
								: "border-blue-400 bg-blue-100/40"
						}`}
					>
						<span className="font-semibold">
							{a.ingredient} ({a.type})
						</span>
						<span className="text-xs">
							Device: {a.device || "-"} | Slot: {a.slotId || "-"}
						</span>
						<span className="text-xs text-gray-600">
							{new Date(a.createdAt).toLocaleString()}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
