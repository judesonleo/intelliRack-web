"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components";
import { useRouter } from "next/navigation";
import { getUser, logout } from "@/lib/auth";
import io from "socket.io-client";
import GlassTabs from "@/components/GlassTabs";
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
	LineChart,
	Line,
	Legend,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const TABS = [
	"Dashboard",
	"Devices",
	"Logs",
	"Alerts",
	"Charts",
	"Profile",
	"Settings",
];

// Placeholder data for charts
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
const activityTimeline = [
	{ time: "09:00", event: "Device A: Added Rice" },
	{ time: "10:30", event: "Device B: Low Stock Alert" },
	{ time: "12:00", event: "Device A: Removed Flour" },
	{ time: "13:45", event: "Device C: Added Sugar" },
	{ time: "15:00", event: "Device B: Empty Slot" },
];

export default function DashboardPage() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [devices, setDevices] = useState([]);
	const [logs, setLogs] = useState([]);
	const [alerts, setAlerts] = useState([]);
	const [liveStatus, setLiveStatus] = useState({});
	const [error, setError] = useState("");
	const [tab, setTab] = useState(TABS[0]);
	const router = useRouter();
	const socketRef = useRef(null);

	useEffect(() => {
		async function fetchAll() {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					router.replace("/login");
					return;
				}
				const u = getUser();
				setUser(u);
				const fetchOptions = {
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				};
				const [devicesRes, logsRes, alertsRes] = await Promise.all([
					fetch(`${API_BASE}/devices/my`, fetchOptions),
					fetch(`${API_BASE}/logs/`, fetchOptions),
					fetch(`${API_BASE}/alerts/`, fetchOptions),
				]);
				if (!devicesRes.ok || !logsRes.ok || !alertsRes.ok)
					throw new Error("Failed to fetch data");
				setDevices(await devicesRes.json());
				setLogs(await logsRes.json());
				setAlerts(await alertsRes.json());
				setLoading(false);
			} catch (err) {
				setError(err.message);
				setLoading(false);
			}
		}
		fetchAll();
	}, [router]);

	useEffect(() => {
		if (!user) return;
		const socket = io(API_BASE.replace("/api", ""), {
			transports: ["websocket"],
		});
		socketRef.current = socket;
		socket.on("update", (data) => {
			setLiveStatus((prev) => {
				const { deviceId, slotId, ...rest } = data;
				return {
					...prev,
					[deviceId]: {
						...(prev[deviceId] || {}),
						[slotId]: rest,
					},
				};
			});
		});
		socket.on("alert", (data) => {
			setAlerts((prev) => [
				{ ...data, createdAt: new Date(), acknowledged: false },
				...prev,
			]);
		});
		return () => socket.disconnect();
	}, [user]);

	function handleSignOut() {
		logout();
		router.replace("/login");
	}

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center">
				Loading...
			</div>
		);
	if (error)
		return (
			<div className="min-h-screen flex items-center justify-center text-red-500">
				{error}
			</div>
		);
	if (!user) return null;

	return (
		<div className="min-h-screen flex flex-col items-center justify-start bg-black/5 backdrop-blur-2xl py-8 px-2">
			<div className="w-full max-w-6xl mx-auto flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="rounded-2xl bg-white/50 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-2">
						<span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
							IntelliRack
						</span>
					</div>
					{/* <span className="text-xl font-bold text-gray-700">Dashboard</span> */}
					<GlassTabs tabs={TABS} currentTab={tab} onTabChange={setTab} glassy />
				</div>
				<div className="flex items-center gap-4">
					<div className="rounded-full bg-white/20 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl px-4 py-2 flex flex-col items- ">
						<span className="font-semibold text-gray-700">{user.name}</span>
						<span className="text-xs text-gray-500">{user.email}</span>
					</div>
					<Button
						onClick={handleSignOut}
						className="rounded-full px-6 py-2 text-sm font-semibold shadow-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none hover:shadow-2xl transition-all"
					>
						Sign Out
					</Button>
				</div>
			</div>
			<div className="w-full max-w-6xl mx-auto">
				{tab === "Dashboard" && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadein">
						{/* Inventory Overview */}
						<div className="col-span-1 md:col-span-2 rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-6 flex flex-col gap-4">
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
								{/* Ingredient Breakdown Pie Chart */}
								<div className="rounded-2xl bg-white/20 p-4 border border-white/30 shadow flex flex-col items-center">
									<span className="font-semibold mb-2">
										Ingredient Breakdown
									</span>
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
								{/* Usage/Stock Bar Chart */}
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
											<Bar
												dataKey="usage"
												fill="#6366f1"
												radius={[8, 8, 0, 0]}
											/>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>
						{/* Live Device Status */}
						<div className="col-span-1 rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-6 flex flex-col gap-4">
							<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
								Live Device Status
							</h3>
							{Object.keys(liveStatus).length === 0 && (
								<div className="text-gray-500">No live data yet.</div>
							)}
							<ul className="space-y-2 max-h-56 overflow-y-auto">
								{Object.entries(liveStatus).map(([deviceId, slots]) => (
									<li
										key={deviceId}
										className="rounded-xl bg-white/20 p-3 border border-white/30 shadow flex flex-col"
									>
										<span className="font-semibold">Device: {deviceId}</span>
										{Object.entries(slots).map(([slotId, s]) => (
											<div key={slotId} className="text-xs mb-1">
												<span className="font-medium">Slot {slotId}:</span>{" "}
												{s.ingredient || "-"} | {s.weight ?? "-"}g |{" "}
												{s.status || "-"}
											</div>
										))}
									</li>
								))}
							</ul>
						</div>
						{/* Alerts Widget */}
						<div className="col-span-1 rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-6 flex flex-col gap-4">
							<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
								Active Alerts
							</h3>
							<ul className="space-y-2 max-h-56 overflow-y-auto">
								{alerts.length === 0 && (
									<li className="text-gray-500">No alerts.</li>
								)}
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
						{/* Recent Activity Timeline */}
						<div className="col-span-1 md:col-span-2 rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-6 flex flex-col gap-4">
							<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
								Recent Activity
							</h3>
							<ul className="space-y-2 flex flex-col md:flex-row md:gap-6 md:space-y-0">
								{activityTimeline.map((a, i) => (
									<li
										key={i}
										className="rounded-xl bg-white/20 p-3 border border-white/30 shadow flex flex-col items-center min-w-[120px]"
									>
										<span className="font-semibold text-indigo-600">
											{a.time}
										</span>
										<span className="text-xs text-gray-700">{a.event}</span>
									</li>
								))}
							</ul>
						</div>
						{/* Profile Widget */}
						<div className="col-span-1 rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-6 flex flex-col gap-4 items-center">
							<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
								Profile
							</h3>
							<div className="flex flex-col gap-1 items-center">
								<span className="font-bold text-lg">{user.name}</span>
								<span className="text-xs text-gray-500">{user.email}</span>
							</div>
							<Button className="w-fit rounded-full px-6 py-2 text-sm font-semibold shadow bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none hover:shadow-xl transition-all">
								Edit Profile
							</Button>
						</div>
						{/* Settings Widget */}
						<div className="col-span-1 rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-6 flex flex-col gap-4 items-center">
							<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
								Settings
							</h3>
							<div className="text-gray-500">[Settings Coming Soon]</div>
						</div>
					</div>
				)}
				{/* Other tabs remain as before, with glassmorphic cards and placeholders */}
				{tab === "Devices" && (
					<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein flex flex-col gap-6">
						<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
							Your Devices
						</h3>
						<ul className="space-y-4">
							{devices.length === 0 && (
								<li className="text-gray-500">No devices registered.</li>
							)}
							{devices.map((d) => (
								<li
									key={d._id}
									className="rounded-xl bg-white/20 p-4 border border-white/30 shadow flex flex-col gap-2"
								>
									<span className="font-semibold text-lg">{d.name}</span>
									<span className="text-xs text-gray-600">
										Rack ID: {d.rackId}
									</span>
									<span className="text-xs text-gray-600">
										Location: {d.location || "-"}
									</span>
									<span className="text-xs text-gray-600">
										Created: {new Date(d.createdAt).toLocaleString()}
									</span>
									<Button className="mt-2 w-fit rounded-full px-6 py-2 text-sm font-semibold shadow bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none hover:shadow-xl transition-all">
										Device Settings
									</Button>
								</li>
							))}
						</ul>
					</div>
				)}
				{tab === "Logs" && (
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
										Device: {log.device?.name || log.device?.rackId || "-"} |
										Slot: {log.slotId || "-"}
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
				)}
				{tab === "Alerts" && (
					<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein">
						<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
							Alerts
						</h3>
						<ul className="space-y-3 max-h-96 overflow-y-auto">
							{alerts.length === 0 && (
								<li className="text-gray-500">No alerts.</li>
							)}
							{alerts.map((a, i) => (
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
				)}
				{tab === "Charts" && (
					<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein flex flex-col gap-6">
						<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
							Charts & Analytics
						</h3>
						<div className="h-80 flex items-center justify-center text-gray-400">
							[Charts Coming Soon]
						</div>
					</div>
				)}
				{tab === "Profile" && (
					<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein flex flex-col gap-6">
						<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
							Profile
						</h3>
						<div className="flex flex-col gap-2">
							<span>
								<b>Name:</b> {user.name}
							</span>
							<span>
								<b>Email:</b> {user.email}
							</span>
						</div>
						<Button className="w-fit rounded-full px-6 py-2 text-sm font-semibold shadow bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none hover:shadow-xl transition-all">
							Edit Profile
						</Button>
					</div>
				)}
				{tab === "Settings" && (
					<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein flex flex-col gap-6">
						<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
							Settings
						</h3>
						<div className="text-gray-500">[Settings Coming Son]</div>
					</div>
				)}
			</div>
		</div>
	);
}
