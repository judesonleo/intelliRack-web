import React, { useState, useMemo } from "react";

export default function AlertsList({ alerts }) {
	const [filter, setFilter] = useState("all");
	const [sortBy, setSortBy] = useState("newest");

	const filteredAlerts = useMemo(() => {
		let filtered = alerts;

		// Filter by status
		if (filter === "active") {
			filtered = filtered.filter((alert) => !alert.acknowledged);
		} else if (filter === "acknowledged") {
			filtered = filtered.filter((alert) => alert.acknowledged);
		}

		// Sort alerts
		filtered.sort((a, b) => {
			const dateA = new Date(a.createdAt);
			const dateB = new Date(b.createdAt);

			if (sortBy === "newest") {
				return dateB - dateA;
			} else if (sortBy === "oldest") {
				return dateA - dateB;
			} else if (sortBy === "priority") {
				// Sort by alert type priority
				const priorityOrder = { EMPTY: 1, LOW_STOCK: 2, OVERWEIGHT: 3 };
				const priorityA = priorityOrder[a.type] || 4;
				const priorityB = priorityOrder[b.type] || 4;
				return priorityA - priorityB;
			}
			return 0;
		});

		return filtered;
	}, [alerts, filter, sortBy]);

	const getAlertIcon = (type) => {
		switch (type) {
			case "EMPTY":
				return "🔴";
			case "LOW_STOCK":
				return "🟠";
			case "OVERWEIGHT":
				return "🟡";
			default:
				return "ℹ️";
		}
	};

	const getAlertColor = (type) => {
		switch (type) {
			case "EMPTY":
				return "border-red-400 bg-red-100/40";
			case "LOW_STOCK":
				return "border-yellow-400 bg-yellow-100/40";
			case "OVERWEIGHT":
				return "border-orange-400 bg-orange-100/40";
			default:
				return "border-blue-400 bg-blue-100/40";
		}
	};

	const getAlertPriority = (type) => {
		switch (type) {
			case "EMPTY":
				return "High";
			case "LOW_STOCK":
				return "Medium";
			case "OVERWEIGHT":
				return "Low";
			default:
				return "Info";
		}
	};

	const acknowledgeAlert = async (alertId) => {
		// TODO: Implement API call to acknowledge alert
		console.log("Acknowledging alert:", alertId);
	};

	const formatTime = (timestamp) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now - date;
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (minutes < 1) return "Just now";
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		return date.toLocaleDateString();
	};

	return (
		<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-[var(--primary)]">
					Alerts & Notifications
				</h3>
				<div className="flex gap-2">
					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm"
					>
						<option value="all">All Alerts</option>
						<option value="active">Active Only</option>
						<option value="acknowledged">Acknowledged</option>
					</select>
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value)}
						className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm"
					>
						<option value="newest">Newest First</option>
						<option value="oldest">Oldest First</option>
						<option value="priority">By Priority</option>
					</select>
				</div>
			</div>

			{/* Alert Statistics */}
			<div className="grid grid-cols-4 gap-4 mb-6">
				<div className="bg-white/10 rounded-lg p-3 text-center">
					<div className="text-2xl font-bold text-red-500">
						{filteredAlerts.filter((a) => a.type === "EMPTY").length}
					</div>
					<div className="text-xs text-gray-400">Empty Slots</div>
				</div>
				<div className="bg-white/10 rounded-lg p-3 text-center">
					<div className="text-2xl font-bold text-yellow-500">
						{filteredAlerts.filter((a) => a.type === "LOW_STOCK").length}
					</div>
					<div className="text-xs text-gray-400">Low Stock</div>
				</div>
				<div className="bg-white/10 rounded-lg p-3 text-center">
					<div className="text-2xl font-bold text-orange-500">
						{filteredAlerts.filter((a) => a.type === "OVERWEIGHT").length}
					</div>
					<div className="text-xs text-gray-400">Overweight</div>
				</div>
				<div className="bg-white/10 rounded-lg p-3 text-center">
					<div className="text-2xl font-bold text-green-500">
						{filteredAlerts.filter((a) => a.acknowledged).length}
					</div>
					<div className="text-xs text-gray-400">Acknowledged</div>
				</div>
			</div>

			{/* Alerts List */}
			<div className="space-y-3 max-h-96 overflow-y-auto">
				{filteredAlerts.length === 0 ? (
					<div className="text-center py-8 text-gray-400">
						<div className="text-4xl mb-2">🔔</div>
						<p>No alerts to show</p>
						<p className="text-sm">
							Alerts will appear here when devices detect issues
						</p>
					</div>
				) : (
					filteredAlerts.map((alert, index) => (
						<div
							key={alert._id || index}
							className={`rounded-xl p-4 border shadow flex items-start gap-4 transition-all ${getAlertColor(
								alert.type
							)} ${alert.acknowledged ? "opacity-60" : ""}`}
						>
							<div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">
								{getAlertIcon(alert.type)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<h4 className="font-semibold text-white">
											{alert.ingredient || "Unknown Ingredient"}
										</h4>
										<span
											className={`px-2 py-1 rounded-full text-xs ${
												getAlertPriority(alert.type) === "High"
													? "bg-red-500/20 text-red-400"
													: getAlertPriority(alert.type) === "Medium"
													? "bg-yellow-500/20 text-yellow-400"
													: "bg-orange-500/20 text-orange-400"
											}`}
										>
											{getAlertPriority(alert.type)} Priority
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-xs text-gray-400">
											{formatTime(alert.createdAt)}
										</span>
										{alert.acknowledged && (
											<span className="text-xs text-green-400">
												✓ Acknowledged
											</span>
										)}
									</div>
								</div>
								<div className="text-sm text-gray-300 mb-2">
									{alert.type === "EMPTY" && "Slot is completely empty"}
									{alert.type === "LOW_STOCK" &&
										"Stock level is below threshold"}
									{alert.type === "OVERWEIGHT" &&
										"Weight exceeds maximum limit"}
								</div>
								<div className="flex items-center gap-4 text-xs text-gray-400">
									<span>
										Device:{" "}
										{typeof alert.device === "string"
											? alert.device
											: alert.device && typeof alert.device === "object"
											? alert.device.name || alert.device.rackId || "Unknown"
											: "Unknown"}
									</span>
									<span>Slot: {alert.slotId || "Unknown"}</span>
									{alert.weight && <span>Weight: {alert.weight}g</span>}
								</div>
							</div>
							{!alert.acknowledged && (
								<button
									onClick={() => acknowledgeAlert(alert._id)}
									className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
								>
									Acknowledge
								</button>
							)}
						</div>
					))
				)}
			</div>

			{/* Quick Actions */}
			<div className="mt-6 flex gap-4 pt-6 border-t border-white/10">
				<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
					View All Alerts
				</button>
				<button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
					Acknowledge All
				</button>
				<button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
					Export Alerts
				</button>
			</div>
		</div>
	);
}
