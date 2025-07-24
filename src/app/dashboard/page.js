"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components";
import { useRouter } from "next/navigation";
import { getUser, logout, refreshUser } from "@/lib/auth";
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
import Image from "next/image";
import slot from "../../../public/images/slot.png";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DeviceList from "@/components/dashboard/DeviceList";
import DeviceSheet from "@/components/dashboard/DeviceSheet";
import AddDeviceCard from "@/components/dashboard/AddDeviceCard";
import StatsOverview from "@/components/dashboard/StatsOverview";
import LiveStatusWidget from "@/components/dashboard/LiveStatusWidget";
import AlertsWidget from "@/components/dashboard/AlertsWidget";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import ProfileWidget from "@/components/dashboard/ProfileWidget";
import SettingsWidget from "@/components/dashboard/SettingsWidget";
import LogsList from "@/components/dashboard/LogsList";
import AlertsList from "@/components/dashboard/AlertsList";
import ChartsWidget from "@/components/dashboard/ChartsWidget";
import GradientCard from "@/components/GradientCard";
import StatusDot from "@/components/StatusDot";
import CloseButton from "@/components/CloseButton";
import { AreaChart, Area } from "recharts";
import IngredientsTab from "@/components/dashboard/IngredientsTab";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
const API_BASE =
	process.env.NEXT_PUBLIC_API_URL ||
	"https://intellibackend.judesonleo.dev/api";

const TABS = ["Dashboard", "Devices", "Ingredients", "Alerts", "Settings"];

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
	const [selectedDevice, setSelectedDevice] = useState(null);
	const router = useRouter();
	const socketRef = useRef(null);
	const [ingredients, setIngredients] = useState([]); // [{ name, status, weight, lastUpdated, daysLeft, usageData, ... }]
	const [ingredientDetails, setIngredientDetails] = useState(null); // { name, logs, prediction, usage, anomalies, substitutions, recommendations }
	const [ingredientModalOpen, setIngredientModalOpen] = useState(false);

	const fetchDevices = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`${API_BASE}/devices/my`, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});
			if (response.ok) {
				const devicesData = await response.json();
				setDevices(devicesData);
			}
		} catch (error) {
			console.error("Error fetching devices:", error);
		}
	};

	useEffect(() => {
		async function fetchAll() {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					router.replace("/login");
					return;
				}

				// Refresh user data to ensure we have the latest information
				const refreshedUser = await refreshUser();
				if (refreshedUser) {
					setUser(refreshedUser);
				} else {
					// Fallback to local user data
					const localUser = getUser();
					if (localUser) {
						setUser(localUser);
					} else {
						router.replace("/login");
						return;
					}
				}

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

		console.log("User object for socket auth:", user);
		console.log("User ID:", user.id || user._id);

		const socket = io(API_BASE.replace("/api", ""), {
			transports: ["websocket"],
			auth: {
				token: localStorage.getItem("token"),
			},
		});
		socketRef.current = socket;

		socket.on("connect", () => {
			console.log("Connected to server");
			// Authenticate socket with user ID
			const userId = user.id || user._id;
			if (userId) {
				socket.emit("authenticate", { userId });
			} else {
				console.error("No user ID found in user object:", user);
				console.error("Available user fields:", Object.keys(user));
			}
		});

		socket.on("authenticated", (data) => {
			console.log("Socket authenticated:", data);
		});

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

		socket.on("deviceStatus", (data) => {
			setDevices((prev) =>
				prev.map((device) =>
					device.rackId === data.deviceId
						? { ...device, isOnline: data.isOnline, lastSeen: data.lastSeen }
						: device
				)
			);
		});

		socket.on("alert", (data) => {
			setAlerts((prev) => [
				{ ...data, createdAt: new Date(), acknowledged: false },
				...prev,
			]);
		});

		socket.on("deviceRegistered", (response) => {
			if (response.success) {
				fetchDevices(); // Refresh devices list
			}
		});

		socket.on("commandResponse", (data) => {
			console.log("Command response received:", data);
			// You can show a notification or update UI here
			// For now, just log it
		});

		// Utility function to send broadcast commands
		window.sendBroadcastCommand = (command, data = {}) => {
			if (socketRef.current) {
				socketRef.current.emit("sendCommand", {
					deviceId: "broadcast",
					command: "broadcast",
					broadcastCommand: command,
					...data,
				});
			}
		};

		// Utility function to send device-specific commands
		window.sendDeviceCommand = (deviceId, command, data = {}) => {
			if (socketRef.current) {
				socketRef.current.emit("sendCommand", {
					deviceId,
					command,
					...data,
				});
			}
		};

		socket.on("deviceAdded", (data) => {
			console.log("New device added:", data);
			fetchDevices(); // Refresh devices list
		});

		return () => socket.disconnect();
	}, [user]);

	// Fetch unique ingredients and their summaries
	useEffect(() => {
		if (tab !== "Ingredients") return;
		const fetchIngredients = async () => {
			const token = localStorage.getItem("token");
			const uniqueRes = await fetch(`${API_BASE}/ingredients/unique`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!uniqueRes.ok) return;
			const uniqueIngredients = await uniqueRes.json();
			const ingredientCards = await Promise.all(
				uniqueIngredients.map(async (name) => {
					// Fetch latest log
					const logRes = await fetch(
						`${API_BASE}/ingredients/logs/${encodeURIComponent(name)}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					const logs = logRes.ok ? await logRes.json() : [];
					const latest = logs[0] || {};
					// Fetch prediction
					const predRes = await fetch(
						`${API_BASE}/ingredients/prediction/${encodeURIComponent(name)}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					const prediction = predRes.ok ? await predRes.json() : {};
					// Fetch usage
					const usageRes = await fetch(
						`${API_BASE}/ingredients/usage/${encodeURIComponent(name)}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					const usage = usageRes.ok ? await usageRes.json() : [];
					return {
						name,
						status: latest.status,
						weight: latest.weight,
						lastUpdated: latest.timestamp,
						daysLeft: prediction.prediction,
						usageData: usage,
						logs,
						prediction,
					};
				})
			);
			setIngredients(ingredientCards);
		};
		fetchIngredients();
	}, [tab]);

	const openIngredientDetails = async (ingredient) => {
		const token = localStorage.getItem("token");
		const [
			logsRes,
			predRes,
			usageRes,
			anomaliesRes,
			subsRes,
			recsRes,
			patternRes,
		] = await Promise.all([
			fetch(
				`${API_BASE}/ingredients/logs/${encodeURIComponent(ingredient.name)}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			),
			fetch(
				`${API_BASE}/ingredients/prediction/${encodeURIComponent(
					ingredient.name
				)}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			),
			fetch(
				`${API_BASE}/ingredients/usage/${encodeURIComponent(ingredient.name)}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			),
			fetch(
				`${API_BASE}/ingredients/anomalies/${encodeURIComponent(
					ingredient.name
				)}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			),
			fetch(
				`${API_BASE}/ingredients/substitutions/${encodeURIComponent(
					ingredient.name
				)}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			),
			fetch(`${API_BASE}/ingredients/recommendations`, {
				headers: { Authorization: `Bearer ${token}` },
			}),
			fetch(
				`${API_BASE}/ingredients/usage-pattern/${encodeURIComponent(
					ingredient.name
				)}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			),
		]);
		const [
			logs,
			prediction,
			usage,
			anomalies,
			substitutions,
			recommendations,
			usagePattern,
		] = await Promise.all([
			logsRes.ok ? logsRes.json() : [],
			predRes.ok ? predRes.json() : {},
			usageRes.ok ? usageRes.json() : [],
			anomaliesRes.ok ? anomaliesRes.json() : [],
			subsRes.ok ? subsRes.json() : [],
			recsRes.ok ? recsRes.json() : [],
			patternRes.ok ? patternRes.json() : {},
		]);
		setIngredientDetails({
			name: ingredient.name,
			logs,
			prediction,
			usage,
			anomalies,
			substitutions,
			recommendations,
			usagePattern,
		});
		setIngredientModalOpen(true);
	};

	function handleSignOut() {
		logout();
		router.replace("/login");
	}

	const handleAddDevice = () => {
		fetchDevices(); // Refresh devices after adding
		setTab("Devices");
	};
	const handleAddIngredient = () => {
		alert("Add Ingredient modal coming soon!");
	};

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
		<DashboardLayout>
			<div className="w-full max-w-6xl mx-auto flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="rounded-2xl bg-white/50 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-2">
						<span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
							IntelliRack
						</span>
					</div>
					<GlassTabs tabs={TABS} currentTab={tab} onTabChange={setTab} glassy />
				</div>
				<div className="flex items-center gap-4">
					<div className="rounded-full bg-white/20 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl px-4 py-2 flex flex-col items-center">
						<span className="font-semibold text-gray-700">
							{typeof user.name === "string" ? user.name : "User"}
						</span>
						<span className="text-xs text-gray-500">
							{typeof user.email === "string" ? user.email : "user@example.com"}
						</span>
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
				{/* {tab === "Dashboard" && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadein">
						<div className="col-span-1 md:col-span-2">
							<StatsOverview
								devices={devices}
								alerts={alerts}
								logs={logs}
								liveStatus={liveStatus}
							/>
						</div>
						<div className="col-span-1">
							<LiveStatusWidget liveStatus={liveStatus} />
						</div>
						<div className="col-span-1">
							<AlertsWidget alerts={alerts} />
						</div>
						<div className="col-span-1 md:col-span-2">
							<ActivityTimeline
								timeline={activityTimeline}
								logs={logs}
								devices={devices}
							/>
						</div>
						<div className="col-span-1">
							<ProfileWidget user={user} />
						</div>
						<div className="col-span-1">
							<SettingsWidget user={user} />
						</div>
					</div>
				)} */}
				{tab === "Dashboard" && (
					<DashboardOverview
						onAddDevice={handleAddDevice}
						onAddIngredient={handleAddIngredient}
					/>
				)}

				{tab === "Devices" && (
					<DeviceList
						devices={devices}
						onDeviceClick={setSelectedDevice}
						onAddDevice={handleAddDevice}
						socket={socketRef.current}
						liveStatus={liveStatus}
						ingredientDetails={ingredientDetails}
					/>
				)}
				{tab === "Ingredients" && <IngredientsTab />}
				{tab === "Logs" && (
					<div className="text-center text-gray-500">
						Logs are now shown in the Ingredients tab.
					</div>
				)}
				{tab === "Alerts" && <AlertsList alerts={alerts} />}
				{tab === "Charts" && null}
				{tab === "Profile" && null}
				{tab === "Settings" && <SettingsWidget user={user} />}
			</div>
			{/* Ingredient Details Modal/Sheet */}
			{ingredientModalOpen && ingredientDetails && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-lg border-2 border-white/30 shadow-2xl"
					onClick={() => setIngredientModalOpen(false)}
				>
					<div
						className="relative bg-white/30 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-2xl border-2 border-white/30 shadow-2xl w-full max-w-4xl p-8 overflow-y-auto max-h-[90vh] animate-fadein"
						onClick={(e) => e.stopPropagation()}
					>
						<CloseButton onClick={() => setIngredientModalOpen(false)} />
						<div className="flex items-center gap-2 mb-4">
							<StatusDot status={ingredientDetails.logs[0]?.status} />
							<h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
								{ingredientDetails.name} Details
							</h2>
						</div>
						<div className="mb-4 grid grid-cols-2 gap-4">
							<div>
								<div className="text-gray-700 mb-1">
									<span className="font-semibold">
										{ingredientDetails.logs[0]?.status || "-"}
									</span>
									<span className="text-xs text-gray-400 ml-2">Status</span>
								</div>
								<div className="text-gray-700 mb-1">
									<span className="font-semibold">
										{ingredientDetails.logs[0]?.weight || "-"}g
									</span>
									<span className="text-xs text-gray-400 ml-2">Weight</span>
								</div>
								<div className="text-gray-700 mb-1">
									<span className="font-semibold">
										{ingredientDetails.prediction?.prediction ?? "-"}
									</span>
									<span className="text-xs text-gray-400 ml-2">Days Left</span>
								</div>
							</div>
							<div className="text-xs text-gray-500 text-right">
								Last updated:{" "}
								{ingredientDetails.logs[0]?.timestamp
									? new Date(
											ingredientDetails.logs[0]?.timestamp
									  ).toLocaleString()
									: "-"}
							</div>
						</div>
						<div className="mb-6">
							<h3 className="font-semibold mb-2 flex items-center gap-2">
								<svg
									className="w-5 h-5 text-indigo-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3"
									/>
								</svg>
								Log History
							</h3>
							<div className="max-h-48 overflow-y-auto px-2">
								<ul className="relative border-l-2 border-indigo-200">
									{ingredientDetails.logs.map((log, idx) => (
										<li key={log._id} className="mb-6 ml-4 relative">
											<div className="absolute -left-2 top-1.5">
												<StatusDot status={log.status} />
											</div>
											<div className="bg-white/60 dark:bg-zinc-900/40 rounded-xl shadow p-3 flex flex-col md:flex-row md:items-center gap-2">
												<div className="flex-1">
													<div className="font-semibold text-sm text-indigo-700">
														{log.timestamp
															? new Date(log.timestamp).toLocaleString()
															: "-"}
													</div>
													<div className="text-xs text-gray-500">
														{log.device?.name || log.device?.rackId || "-"}
													</div>
												</div>
												<div className="flex items-center gap-3">
													<span className="text-sm font-bold text-gray-700 flex items-center gap-1">
														<svg
															className="w-4 h-4 text-blue-400"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6"
															/>
														</svg>
														{log.weight}g
													</span>
													<span className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 text-indigo-700">
														{log.status}
													</span>
												</div>
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>
						<div className="mb-6">
							<h3 className="font-semibold mb-2 flex items-center gap-2">
								<svg
									className="w-5 h-5 text-pink-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 17v-2a4 4 0 018 0v2"
									/>
								</svg>
								Usage Patterns
							</h3>
							{ingredientDetails.usagePattern && (
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="bg-white/60 dark:bg-zinc-900/40 rounded-xl shadow p-4 flex flex-col items-center">
										<span className="text-xs text-gray-500 mb-1">
											Avg Daily Usage
										</span>
										<span className="text-2xl font-bold text-indigo-600">
											{ingredientDetails.usagePattern.avgDaily?.toFixed(1) || 0}
											g
										</span>
									</div>
									<div className="bg-white/60 dark:bg-zinc-900/40 rounded-xl shadow p-4">
										<span className="text-xs text-gray-500 mb-1 block">
											Per Day (7d)
										</span>
										<div className="flex flex-wrap gap-2">
											{ingredientDetails.usagePattern.perDay?.map((d) => (
												<span
													key={d.date}
													className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
												>
													{d.date}: {d.used}g
												</span>
											))}
										</div>
									</div>
									<div className="bg-white/60 dark:bg-zinc-900/40 rounded-xl shadow p-4">
										<span className="text-xs text-gray-500 mb-1 block">
											Per Week (4w)
										</span>
										<div className="flex flex-wrap gap-2">
											{ingredientDetails.usagePattern.perWeek?.map((w) => (
												<span
													key={w.week}
													className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"
												>
													{w.week}: {w.used}g
												</span>
											))}
										</div>
									</div>
									<div className="bg-white/60 dark:bg-zinc-900/40 rounded-xl shadow p-4 col-span-1 md:col-span-3">
										<span className="text-xs text-gray-500 mb-1 block">
											Per Month (12m)
										</span>
										<div className="flex flex-wrap gap-2">
											{ingredientDetails.usagePattern.perMonth?.map((m) => (
												<span
													key={m.month}
													className="px-2 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium"
												>
													{m.month}: {m.used}g
												</span>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
						<div className="mb-6">
							<h3 className="font-semibold mb-2">Anomalies</h3>
							{ingredientDetails.anomalies &&
							ingredientDetails.anomalies.length > 0 ? (
								<ul className="list-disc pl-5 text-xs">
									{ingredientDetails.anomalies.map((a) => (
										<li key={a._id}>
											{a.timestamp
												? new Date(a.timestamp).toLocaleString()
												: "-"}{" "}
											- <StatusDot status={a.status} />
											{a.status} ({a.weight}g)
										</li>
									))}
								</ul>
							) : (
								<div className="text-gray-400">No anomalies detected</div>
							)}
						</div>
						<div className="mb-6">
							<h3 className="font-semibold mb-2">Substitutions</h3>
							{ingredientDetails.substitutions &&
							ingredientDetails.substitutions.length > 0 ? (
								<ul className="list-disc pl-5 text-xs">
									{ingredientDetails.substitutions.map((s, i) => (
										<li key={i}>{s}</li>
									))}
								</ul>
							) : (
								<div className="text-gray-400">No substitutions found</div>
							)}
						</div>
						<div className="mb-6">
							<h3 className="font-semibold mb-2">Recommendations</h3>
							{ingredientDetails.recommendations &&
							ingredientDetails.recommendations.length > 0 ? (
								<ul className="list-disc pl-5 text-xs">
									{ingredientDetails.recommendations.map((r, i) => (
										<li key={i}>{r}</li>
									))}
								</ul>
							) : (
								<div className="text-gray-400">No recommendations</div>
							)}
						</div>
					</div>
				</div>
			)}
			<DeviceSheet
				device={selectedDevice}
				isOpen={!!selectedDevice}
				onClose={() => setSelectedDevice(null)}
				socket={socketRef.current}
			/>
		</DashboardLayout>
	);
}
