import React from "react";

export default function LogsList({ logs }) {
	return (
		<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein">
			<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
				Recent Logs
			</h3>
			<ul className="space-y-2 max-h-96 overflow-y-auto">
				{logs.length === 0 && <li className="text-gray-500">No logs.</li>}
				{logs.map((log, i) => (
					<li
						key={i}
						className="rounded-lg bg-white/20 p-2 border border-white/30 flex flex-col"
					>
						<span className="font-medium">{log.ingredient}</span>
						<span className="text-xs">
							Device: {log.device?.name || log.device?.rackId || "-"} | Slot:{" "}
							{log.slotId || "-"}
						</span>
						<span className="text-xs">
							Weight: {log.weight ?? "-"}g | Status: {log.status || "-"}
						</span>
						<span className="text-xs text-gray-600">
							{new Date(log.timestamp).toLocaleString()}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
