import React from "react";
import {
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const ingredientPieData = [
	{ name: "Protein", value: 400 },
	{ name: "Carbs", value: 300 },
	{ name: "Fats", value: 300 },
];
const COLORS = ["#6366f1", "#a21caf", "#f472b6"];
const usageBarData = [
	{ name: "Jan", usage: 1200 },
	{ name: "Feb", usage: 2100 },
	{ name: "Mar", usage: 800 },
	{ name: "Apr", usage: 1600 },
	{ name: "May", usage: 900 },
	{ name: "Jun", usage: 1700 },
	{ name: "Jul", usage: 1400 },
	{ name: "Aug", usage: 1100 },
	{ name: "Sep", usage: 1300 },
	{ name: "Oct", usage: 1500 },
	{ name: "Nov", usage: 1000 },
	{ name: "Dec", usage: 1800 },
];

export default function StatsOverview({ devices, alerts, logs, liveStatus }) {
	return (
		<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-6 flex flex-col gap-4">
			<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
				Inventory Overview
			</h3>
			<div className="flex flex-wrap gap-6">
				<div className="flex flex-col items-center">
					<span className="text-2xl font-bold">{devices.length}</span>
					<span className="text-gray-600">Devices</span>
				</div>
				<div className="flex flex-col items-center">
					<span className="text-2xl font-bold">{alerts.length}</span>
					<span className="text-gray-600">Active Alerts</span>
				</div>
				<div className="flex flex-col items-center">
					<span className="text-2xl font-bold">{logs.length}</span>
					<span className="text-gray-600">Recent Logs</span>
				</div>
				<div className="flex flex-col items-center">
					<span className="text-2xl font-bold">
						{Object.keys(liveStatus).length}
					</span>
					<span className="text-gray-600">Live Devices</span>
				</div>
			</div>
			<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="rounded-2xl bg-white/20 p-4 border border-white/30 shadow flex flex-col items-center">
					<span className="font-semibold mb-2">Ingredient Breakdown</span>
					<ResponsiveContainer width="100%" height={180}>
						<PieChart>
							<Pie
								data={ingredientPieData}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="50%"
								outerRadius={60}
								label
							>
								{ingredientPieData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				</div>
				<div className="rounded-2xl bg-white/20 p-4 border border-white/30 shadow flex flex-col items-center">
					<span className="font-semibold mb-2">Usage (Monthly)</span>
					<ResponsiveContainer width="100%" height={180}>
						<BarChart
							data={usageBarData}
							margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
						>
							<XAxis dataKey="name" stroke="#888" fontSize={12} />
							<YAxis stroke="#888" fontSize={12} />
							<Tooltip />
							<Bar dataKey="usage" fill="#6366f1" radius={[8, 8, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
