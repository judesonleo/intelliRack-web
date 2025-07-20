import React, { useState, useEffect } from "react";
import Image from "next/image";
import slot from "../../../public/images/slot.png";

const DeviceSheet = ({ device, isOpen, onClose, socket }) => {
	const [activeTab, setActiveTab] = useState("overview");
	const [config, setConfig] = useState({
		weightThresholds: {
			min: 5.0,
			low: 100.0,
			moderate: 200.0,
			good: 500.0,
			max: 5000.0,
		},
		settings: {
			ledEnabled: true,
			soundEnabled: false,
			autoTare: false,
			mqttPublishInterval: 5000,
		},
		calibrationFactor: 204.99,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (device && device.weightThresholds) {
			setConfig({
				weightThresholds: device.weightThresholds,
				settings: device.settings || {
					ledEnabled: true,
					soundEnabled: false,
					autoTare: false,
					mqttPublishInterval: 5000,
				},
				calibrationFactor: device.calibrationFactor || 204.99,
			});
		}
	}, [device]);

	const sendCommand = async (command, data = {}) => {
		if (!socket || !device) return;

		setIsLoading(true);
		setMessage("");

		try {
			const commandData = {
				deviceId: device.rackId,
				command,
				...data,
			};

			socket.emit("sendCommand", commandData);
			setMessage(`Command sent: ${command}`);
		} catch (error) {
			setMessage(`Error: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const updateConfig = async () => {
		await sendCommand("set_config", {
			weightThresholds: config.weightThresholds,
			settings: config.settings,
		});
	};

	const updateThresholds = async () => {
		await sendCommand("set_thresholds", {
			weightThresholds: config.weightThresholds,
		});
	};

	const updateDevice = async () => {
		await sendCommand("set_device", {
			calibrationFactor: config.calibrationFactor,
		});
	};

	const handleTare = () => sendCommand("tare");
	const handleCalibrate = () => sendCommand("calibrate");
	const handleRestart = () => sendCommand("restart");
	const handleResetWiFi = () => sendCommand("resetwifi");

	if (!isOpen || !device) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-lg"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-4xl h-[90vh] bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
				{/* Header */}
				<div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/10">
					<div className="flex items-center gap-4">
						<div className="relative w-12 h-12">
							<Image
								src={slot}
								alt="Device"
								width={48}
								height={48}
								className="object-contain"
							/>
						</div>
						<div>
							<h2 className="text-2xl font-bold text-white">{device.name}</h2>
							<p className="text-gray-300">Rack ID: {device.rackId}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-full hover:bg-white/10 transition-colors"
					>
						<svg
							className="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Tabs */}
				<div className="flex-shrink-0 flex border-b border-white/10">
					{["overview", "configuration", "actions", "status"].map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-6 py-3 text-sm font-medium transition-colors ${
								activeTab === tab
									? "text-white border-b-2 border-indigo-500"
									: "text-gray-400 hover:text-white"
							}`}
						>
							{tab.charAt(0).toUpperCase() + tab.slice(1)}
						</button>
					))}
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 min-h-0">
					{activeTab === "overview" && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="bg-white/5 rounded-xl p-6">
									<h3 className="text-lg font-semibold text-white mb-4">
										Current Status
									</h3>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-300">Status:</span>
											<span
												className={`font-medium ${
													device.isOnline ? "text-green-400" : "text-red-400"
												}`}
											>
												{device.isOnline ? "Online" : "Offline"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-300">Weight:</span>
											<span className="text-white font-medium">
												{device.lastWeight
													? `${device.lastWeight.toFixed(1)}g`
													: "--"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-300">Stock Level:</span>
											<span className="text-white font-medium">
												{device.lastStatus || "UNKNOWN"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-300">Last Seen:</span>
											<span className="text-white font-medium">
												{device.lastSeen
													? new Date(device.lastSeen).toLocaleString()
													: "Never"}
											</span>
										</div>
									</div>
								</div>

								<div className="bg-white/5 rounded-xl p-6">
									<h3 className="text-lg font-semibold text-white mb-4">
										Device Info
									</h3>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-300">Location:</span>
											<span className="text-white">
												{device.location || "Not set"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-300">IP Address:</span>
											<span className="text-white">
												{device.ipAddress || "Unknown"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-300">Firmware:</span>
											<span className="text-white">
												{device.firmwareVersion || "v2.0"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-300">Created:</span>
											<span className="text-white">
												{new Date(device.createdAt).toLocaleDateString()}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{activeTab === "configuration" && (
						<div className="space-y-6">
							{/* Weight Thresholds */}
							<div className="bg-white/5 rounded-xl p-6">
								<h3 className="text-lg font-semibold text-white mb-4">
									Weight Thresholds (g)
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
									{Object.entries(config.weightThresholds).map(
										([key, value]) => (
											<div key={key}>
												<label className="block text-sm text-gray-300 mb-2 capitalize">
													{key.replace(/([A-Z])/g, " $1").trim()}
												</label>
												<input
													type="number"
													value={value}
													onChange={(e) =>
														setConfig((prev) => ({
															...prev,
															weightThresholds: {
																...prev.weightThresholds,
																[key]: parseFloat(e.target.value),
															},
														}))
													}
													className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
												/>
											</div>
										)
									)}
								</div>
								<button
									onClick={updateThresholds}
									disabled={isLoading}
									className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
								>
									{isLoading ? "Updating..." : "Update Thresholds"}
								</button>
							</div>

							{/* Device Settings */}
							<div className="bg-white/5 rounded-xl p-6">
								<h3 className="text-lg font-semibold text-white mb-4">
									Device Settings
								</h3>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-gray-300">LED Strip</span>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={config.settings.ledEnabled}
												onChange={(e) =>
													setConfig((prev) => ({
														...prev,
														settings: {
															...prev.settings,
															ledEnabled: e.target.checked,
														},
													}))
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
										</label>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-gray-300">Sound Alerts</span>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={config.settings.soundEnabled}
												onChange={(e) =>
													setConfig((prev) => ({
														...prev,
														settings: {
															...prev.settings,
															soundEnabled: e.target.checked,
														},
													}))
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
										</label>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-gray-300">Auto Tare</span>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={config.settings.autoTare}
												onChange={(e) =>
													setConfig((prev) => ({
														...prev,
														settings: {
															...prev.settings,
															autoTare: e.target.checked,
														},
													}))
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
										</label>
									</div>

									<div>
										<label className="block text-sm text-gray-300 mb-2">
											MQTT Publish Interval (ms)
										</label>
										<input
											type="number"
											value={config.settings.mqttPublishInterval}
											onChange={(e) =>
												setConfig((prev) => ({
													...prev,
													settings: {
														...prev.settings,
														mqttPublishInterval: parseInt(e.target.value),
													},
												}))
											}
											className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
										/>
									</div>
								</div>
								<button
									onClick={updateConfig}
									disabled={isLoading}
									className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
								>
									{isLoading ? "Updating..." : "Update Settings"}
								</button>
							</div>

							{/* Calibration */}
							<div className="bg-white/5 rounded-xl p-6">
								<h3 className="text-lg font-semibold text-white mb-4">
									Calibration
								</h3>
								<div>
									<label className="block text-sm text-gray-300 mb-2">
										Calibration Factor
									</label>
									<input
										type="number"
										step="0.01"
										value={config.calibrationFactor}
										onChange={(e) =>
											setConfig((prev) => ({
												...prev,
												calibrationFactor: parseFloat(e.target.value),
											}))
										}
										className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
									/>
								</div>
								<button
									onClick={updateDevice}
									disabled={isLoading}
									className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
								>
									{isLoading ? "Updating..." : "Update Calibration"}
								</button>
							</div>
						</div>
					)}

					{activeTab === "actions" && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="bg-white/5 rounded-xl p-6">
									<h3 className="text-lg font-semibold text-white mb-4">
										Scale Actions
									</h3>
									<div className="space-y-3">
										<button
											onClick={handleTare}
											disabled={isLoading}
											className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
										>
											Tare Scale
										</button>
										<button
											onClick={handleCalibrate}
											disabled={isLoading}
											className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
										>
											Start Calibration
										</button>
									</div>
								</div>

								<div className="bg-white/5 rounded-xl p-6">
									<h3 className="text-lg font-semibold text-white mb-4">
										System Actions
									</h3>
									<div className="space-y-3">
										<button
											onClick={handleRestart}
											disabled={isLoading}
											className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
										>
											Restart Device
										</button>
										<button
											onClick={handleResetWiFi}
											disabled={isLoading}
											className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
										>
											Reset WiFi
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					{activeTab === "status" && (
						<div className="space-y-6">
							<div className="bg-white/5 rounded-xl p-6">
								<h3 className="text-lg font-semibold text-white mb-4">
									Connection Status
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-gray-300">WiFi Status:</span>
										<span
											className={`font-medium ${
												device.isOnline ? "text-green-400" : "text-red-400"
											}`}
										>
											{device.isOnline ? "Connected" : "Disconnected"}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-300">MQTT Status:</span>
										<span
											className={`font-medium ${
												device.mqttConnected ? "text-green-400" : "text-red-400"
											}`}
										>
											{device.mqttConnected ? "Connected" : "Disconnected"}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-300">IP Address:</span>
										<span className="text-white">
											{device.ipAddress || "Unknown"}
										</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Message */}
				{message && (
					<div className="flex-shrink-0 p-4 bg-white/10 border-t border-white/10">
						<p className="text-white text-center">{message}</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default DeviceSheet;
