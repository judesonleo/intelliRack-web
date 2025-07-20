import React, { useState, useEffect } from "react";

export default function SettingsWidget({ user }) {
	const [activeTab, setActiveTab] = useState("profile");
	const [settings, setSettings] = useState({
		notifications: {
			email: true,
			push: true,
			lowStock: true,
			emptySlot: true,
			deviceOffline: true,
		},
		display: {
			theme: "auto",
			language: "en",
			timezone: "UTC",
		},
		data: {
			autoBackup: true,
			backupFrequency: "daily",
			retentionDays: 30,
		},
		alerts: {
			lowStockThreshold: 20,
			emptyThreshold: 5,
			checkInterval: 5,
		},
	});
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		// Load user settings from localStorage or API
		const savedSettings = localStorage.getItem("userSettings");
		if (savedSettings) {
			setSettings(JSON.parse(savedSettings));
		}
	}, []);

	const saveSettings = async () => {
		setIsLoading(true);
		try {
			localStorage.setItem("userSettings", JSON.stringify(settings));
			setMessage("Settings saved successfully!");
			setTimeout(() => setMessage(""), 3000);
		} catch (error) {
			setMessage("Error saving settings");
		} finally {
			setIsLoading(false);
		}
	};

	const exportData = async () => {
		setIsLoading(true);
		try {
			// Simulate data export
			const data = {
				user: user,
				settings: settings,
				exportDate: new Date().toISOString(),
			};

			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `intellirack-export-${
				new Date().toISOString().split("T")[0]
			}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			setMessage("Data exported successfully!");
			setTimeout(() => setMessage(""), 3000);
		} catch (error) {
			setMessage("Error exporting data");
		} finally {
			setIsLoading(false);
		}
	};

	const resetSettings = () => {
		if (confirm("Are you sure you want to reset all settings to default?")) {
			setSettings({
				notifications: {
					email: true,
					push: true,
					lowStock: true,
					emptySlot: true,
					deviceOffline: true,
				},
				display: {
					theme: "auto",
					language: "en",
					timezone: "UTC",
				},
				data: {
					autoBackup: true,
					backupFrequency: "daily",
					retentionDays: 30,
				},
				alerts: {
					lowStockThreshold: 20,
					emptyThreshold: 5,
					checkInterval: 5,
				},
			});
			setMessage("Settings reset to default");
			setTimeout(() => setMessage(""), 3000);
		}
	};

	return (
		<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-[var(--primary)]">
					Settings & Preferences
				</h3>
				{message && (
					<div className="text-sm text-green-400 bg-green-100/20 px-3 py-1 rounded-lg">
						{message}
					</div>
				)}
			</div>

			{/* Tab Navigation */}
			<div className="flex gap-4 mb-6 border-b border-white/10">
				{["profile", "notifications", "display", "data", "alerts"].map(
					(tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-4 py-2 text-sm font-medium transition-colors ${
								activeTab === tab
									? "text-white border-b-2 border-indigo-500"
									: "text-gray-400 hover:text-white"
							}`}
						>
							{tab.charAt(0).toUpperCase() + tab.slice(1)}
						</button>
					)
				)}
			</div>

			{/* Settings Content */}
			<div className="space-y-6">
				{activeTab === "profile" && (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Name
							</label>
							<input
								type="text"
								value={user?.name || ""}
								readOnly
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Email
							</label>
							<input
								type="email"
								value={user?.email || ""}
								readOnly
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Account Created
							</label>
							<input
								type="text"
								value={
									user?.createdAt
										? new Date(user.createdAt).toLocaleDateString()
										: "Unknown"
								}
								readOnly
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							/>
						</div>
					</div>
				)}

				{activeTab === "notifications" && (
					<div className="space-y-4">
						<h4 className="text-md font-semibold text-white mb-4">
							Notification Preferences
						</h4>
						{Object.entries(settings.notifications).map(([key, value]) => (
							<div key={key} className="flex items-center justify-between">
								<label className="text-sm text-gray-300 capitalize">
									{key.replace(/([A-Z])/g, " $1").trim()}
								</label>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={value}
										onChange={(e) =>
											setSettings((prev) => ({
												...prev,
												notifications: {
													...prev.notifications,
													[key]: e.target.checked,
												},
											}))
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
								</label>
							</div>
						))}
					</div>
				)}

				{activeTab === "display" && (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Theme
							</label>
							<select
								value={settings.display.theme}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										display: { ...prev.display, theme: e.target.value },
									}))
								}
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							>
								<option value="auto">Auto</option>
								<option value="light">Light</option>
								<option value="dark">Dark</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Language
							</label>
							<select
								value={settings.display.language}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										display: { ...prev.display, language: e.target.value },
									}))
								}
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							>
								<option value="en">English</option>
								<option value="es">Spanish</option>
								<option value="fr">French</option>
								<option value="de">German</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Timezone
							</label>
							<select
								value={settings.display.timezone}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										display: { ...prev.display, timezone: e.target.value },
									}))
								}
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							>
								<option value="UTC">UTC</option>
								<option value="EST">Eastern Time</option>
								<option value="PST">Pacific Time</option>
								<option value="GMT">GMT</option>
							</select>
						</div>
					</div>
				)}

				{activeTab === "data" && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<label className="text-sm text-gray-300">Auto Backup</label>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={settings.data.autoBackup}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											data: { ...prev.data, autoBackup: e.target.checked },
										}))
									}
									className="sr-only peer"
								/>
								<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
							</label>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Backup Frequency
							</label>
							<select
								value={settings.data.backupFrequency}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										data: { ...prev.data, backupFrequency: e.target.value },
									}))
								}
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							>
								<option value="daily">Daily</option>
								<option value="weekly">Weekly</option>
								<option value="monthly">Monthly</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Data Retention (days)
							</label>
							<input
								type="number"
								value={settings.data.retentionDays}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										data: {
											...prev.data,
											retentionDays: parseInt(e.target.value),
										},
									}))
								}
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							/>
						</div>
						<button
							onClick={exportData}
							disabled={isLoading}
							className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
						>
							{isLoading ? "Exporting..." : "Export Data"}
						</button>
					</div>
				)}

				{activeTab === "alerts" && (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Low Stock Threshold (%)
							</label>
							<input
								type="number"
								value={settings.alerts.lowStockThreshold}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										alerts: {
											...prev.alerts,
											lowStockThreshold: parseInt(e.target.value),
										},
									}))
								}
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Empty Threshold (g)
							</label>
							<input
								type="number"
								value={settings.alerts.emptyThreshold}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										alerts: {
											...prev.alerts,
											emptyThreshold: parseInt(e.target.value),
										},
									}))
								}
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Check Interval (minutes)
							</label>
							<input
								type="number"
								value={settings.alerts.checkInterval}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										alerts: {
											...prev.alerts,
											checkInterval: parseInt(e.target.value),
										},
									}))
								}
								className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
							/>
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex gap-4 pt-6 border-t border-white/10">
					<button
						onClick={saveSettings}
						disabled={isLoading}
						className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
					>
						{isLoading ? "Saving..." : "Save Settings"}
					</button>
					<button
						onClick={resetSettings}
						className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
					>
						Reset
					</button>
				</div>
			</div>
		</div>
	);
}
