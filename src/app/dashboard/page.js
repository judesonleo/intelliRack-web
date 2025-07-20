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

const API_BASE =
	process.env.NEXT_PUBLIC_API_URL || "https://intellibackend.judesonleo.me/api";

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
	const [selectedDevice, setSelectedDevice] = useState(null);
	const router = useRouter();
	const socketRef = useRef(null);

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

	function handleSignOut() {
		logout();
		router.replace("/login");
	}

	const handleAddDevice = () => {
		fetchDevices(); // Refresh devices after adding
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
				)}
				{tab === "Devices" && (
					<DeviceList
						devices={devices}
						onDeviceClick={setSelectedDevice}
						onAddDevice={handleAddDevice}
						socket={socketRef.current}
					/>
				)}
				{tab === "Logs" && <LogsList logs={logs} />}
				{tab === "Alerts" && <AlertsList alerts={alerts} />}
				{tab === "Charts" && (
					<ChartsWidget devices={devices} logs={logs} liveStatus={liveStatus} />
				)}
				{tab === "Profile" && <ProfileWidget user={user} />}
				{tab === "Settings" && <SettingsWidget user={user} />}
			</div>
			<DeviceSheet
				device={selectedDevice}
				isOpen={!!selectedDevice}
				onClose={() => setSelectedDevice(null)}
				socket={socketRef.current}
			/>
		</DashboardLayout>
	);
}
