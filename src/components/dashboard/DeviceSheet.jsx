import React, { useState, useEffect } from "react";
import Image from "next/image";
import slot from "../../../public/images/slot.png";
import {
	Tag,
	Smartphone,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Edit,
	Trash2,
	Plus,
	Search,
	Settings,
} from "lucide-react";

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
	const [messageTimeout, setMessageTimeout] = useState(null);
	const [nfcTags, setNfcTags] = useState([]);
	const [nfcStatus, setNfcStatus] = useState({
		tagPresent: false,
		tagUID: "",
		ingredient: "",
		nfcEnabled: true,
	});
	const [showNfcWriteDialog, setShowNfcWriteDialog] = useState(false);
	const [nfcWriteIngredient, setNfcWriteIngredient] = useState("");
	const [nfcSearchQuery, setNfcSearchQuery] = useState("");

	useEffect(() => {
		if (device && device.weightThresholds) {
			setConfig({
				weightThresholds: device.weightThresholds,
				ingredient: device.ingredient,
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

	// Fetch NFC tags for this device
	useEffect(() => {
		if (device && device._id) {
			fetchNfcTags();
		}
	}, [device]);

	// Listen for NFC events and command responses from socket
	useEffect(() => {
		if (!socket) return;

		const handleNfcEvent = (data) => {
			if (data.deviceId === device?.rackId) {
				switch (data.type) {
					case "read":
						setNfcStatus({
							tagPresent: true,
							tagUID: data.tagUID,
							ingredient: data.ingredient,
							nfcEnabled: true,
						});
						setMessageWithTimeout(
							`NFC Tag Read: ${data.ingredient || "Unknown"} (UID: ${
								data.tagUID
							})`
						);
						break;
					case "removed":
						setNfcStatus({
							tagPresent: false,
							tagUID: "",
							ingredient: "",
							nfcEnabled: true,
						});
						setMessageWithTimeout("NFC Tag Removed");
						break;
					case "write":
						setMessageWithTimeout(`NFC Write: ${data.response || "Success"}`);
						// Refresh NFC tags after write operation
						fetchNfcTags();
						break;
					case "clear":
						setMessageWithTimeout(`NFC Clear: ${data.response || "Success"}`);
						// Refresh NFC tags after clear operation
						fetchNfcTags();
						break;
					case "format":
						setMessageWithTimeout(`NFC Format: ${data.response || "Success"}`);
						break;
				}
			}
		};

		const handleCommandSent = (data) => {
			if (data.deviceId === device?.rackId) {
				if (data.success) {
					setMessageWithTimeout(`Command sent successfully: ${data.command}`);
				} else {
					setMessageWithTimeout(
						`Command failed: ${data.command} - ${data.error || "Unknown error"}`
					);
				}
			}
		};

		const handleCommandResponse = (data) => {
			if (data.deviceId === device?.rackId) {
				setMessageWithTimeout(
					`Response: ${data.response || data.message || "Command completed"}`
				);
			}
		};

		socket.on("nfcEvent", handleNfcEvent);
		socket.on("commandSent", handleCommandSent);
		socket.on("commandResponse", handleCommandResponse);

		return () => {
			socket.off("nfcEvent", handleNfcEvent);
			socket.off("commandSent", handleCommandSent);
			socket.off("commandResponse", handleCommandResponse);
		};
	}, [socket, device]);

	// Cleanup message timeout on unmount
	useEffect(() => {
		return () => {
			if (messageTimeout) {
				clearTimeout(messageTimeout);
			}
		};
	}, [messageTimeout]);

	const setMessageWithTimeout = (msg, timeout = 5000) => {
		// Clear existing timeout
		if (messageTimeout) {
			clearTimeout(messageTimeout);
		}

		setMessage(msg);

		// Set new timeout to clear message
		const newTimeout = setTimeout(() => {
			setMessage("");
		}, timeout);

		setMessageTimeout(newTimeout);
	};

	// Refactor sendCommand to treat all commands as simple strings
	const sendCommand = async (command) => {
		if (!socket || !device) return;
		setIsLoading(true);
		setMessageWithTimeout("");

		try {
			const commandData = {
				deviceId: device.rackId,
				command,
			};
			socket.emit("sendCommand", commandData);
			setMessageWithTimeout(`Command sent: ${command}`);
		} catch (error) {
			setMessageWithTimeout(`Error: ${error.message}`);
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

	// NFC Functions
	const fetchNfcTags = async () => {
		try {
			const response = await fetch(`/api/nfc?deviceId=${device._id}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setNfcTags(data);
			}
		} catch (error) {
			console.error("Error fetching NFC tags:", error);
		}
	};

	const handleNfcRead = () => sendCommand("nfc_read");
	// Replace handleNfcWrite to send a plain string command
	const handleNfcWrite = () => {
		if (nfcWriteIngredient.trim()) {
			sendCommand(`write:${nfcWriteIngredient.trim()}`);
			setShowNfcWriteDialog(false);
			setNfcWriteIngredient("");
			setMessageWithTimeout(
				"Attempting to write to NFC tag... Make sure a tag is present on the reader."
			);
		}
	};
	const handleNfcClear = () => sendCommand("nfc_clear");
	const handleNfcFormat = () => sendCommand("nfc_format");

	const createNfcTag = async (tagData) => {
		try {
			const response = await fetch("/api/nfc", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					...tagData,
					deviceId: device._id,
				}),
			});

			if (response.ok) {
				fetchNfcTags();
				setMessageWithTimeout("NFC tag created successfully");
			}
		} catch (error) {
			setMessageWithTimeout(`Error creating NFC tag: ${error.message}`);
		}
	};

	const deleteNfcTag = async (tagId) => {
		try {
			const response = await fetch(`/api/nfc/${tagId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (response.ok) {
				fetchNfcTags();
				setMessageWithTimeout("NFC tag deleted successfully");
			}
		} catch (error) {
			setMessageWithTimeout(`Error deleting NFC tag: ${error.message}`);
		}
	};

	const filteredNfcTags = nfcTags.filter(
		(tag) =>
			tag.ingredient.toLowerCase().includes(nfcSearchQuery.toLowerCase()) ||
			tag.uid.toLowerCase().includes(nfcSearchQuery.toLowerCase()) ||
			tag.slotId.toLowerCase().includes(nfcSearchQuery.toLowerCase())
	);

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
							<h2 className="text-2xl font-bold text-white">
								{typeof device.name === "string"
									? device.name
									: device.rackId || "Unknown Device"}
							</h2>
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
					{["overview", "configuration", "actions", "nfc", "status"].map(
						(tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`px-6 py-3 text-sm font-medium transition-colors ${
									activeTab === tab
										? "text-white border-b-2 border-indigo-500"
										: "text-gray-400 hover:text-white"
								}`}
							>
								{tab === "nfc"
									? "NFC"
									: tab.charAt(0).toUpperCase() + tab.slice(1)}
							</button>
						)
					)}
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

								<div className="bg-white/5 rounded-xl p-6">
									<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
										<Tag className="w-5 h-5" />
										NFC Status
									</h3>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-300">NFC Enabled:</span>
											<span className="text-green-400 font-medium">Yes</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-300">Tag Present:</span>
											<span
												className={`font-medium ${
													nfcStatus.tagPresent
														? "text-green-400"
														: "text-red-400"
												}`}
											>
												{nfcStatus.tagPresent ? "Yes" : "No"}
											</span>
										</div>
										{nfcStatus.tagPresent && (
											<>
												<div className="flex justify-between">
													<span className="text-gray-300">Ingredient:</span>
													<span className="text-white font-medium">
														{nfcStatus.ingredient || "Unknown"}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-300">
														Registered Tags:
													</span>
													<span className="text-white font-medium">
														{nfcTags.length}
													</span>
												</div>
											</>
										)}
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

					{activeTab === "nfc" && (
						<div className="space-y-6">
							{/* NFC Status */}
							<div className="bg-white/5 rounded-xl p-6">
								<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<Tag className="w-5 h-5" />
									NFC Status
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-gray-300">NFC Enabled:</span>
										<span className="text-green-400 font-medium">Yes</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-300">Tag Present:</span>
										<span
											className={`font-medium ${
												nfcStatus.tagPresent ? "text-green-400" : "text-red-400"
											}`}
										>
											{nfcStatus.tagPresent ? "Yes" : "No"}
										</span>
									</div>
									{nfcStatus.tagPresent && (
										<>
											<div className="flex justify-between">
												<span className="text-gray-300">Tag UID:</span>
												<span className="text-white font-mono text-sm">
													{nfcStatus.tagUID}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-300">Ingredient:</span>
												<span className="text-white font-medium">
													{nfcStatus.ingredient || "Unknown"}
												</span>
											</div>
										</>
									)}
								</div>
							</div>

							{/* NFC Actions */}
							<div className="bg-white/5 rounded-xl p-6">
								<h3 className="text-lg font-semibold text-white mb-4">
									NFC Actions
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<button
										onClick={handleNfcRead}
										disabled={isLoading}
										className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
									>
										<Smartphone className="w-4 h-4" />
										Read Tag
									</button>
									<button
										onClick={() => setShowNfcWriteDialog(true)}
										disabled={isLoading}
										className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
									>
										<Edit className="w-4 h-4" />
										Write Tag
									</button>
									<button
										onClick={handleNfcClear}
										disabled={isLoading}
										className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
									>
										<Trash2 className="w-4 h-4" />
										Clear Tag
									</button>
									<button
										onClick={handleNfcFormat}
										disabled={isLoading}
										className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
									>
										<Settings className="w-4 h-4" />
										Format Tag
									</button>
								</div>
							</div>

							{/* NFC Tags Management */}
							<div className="bg-white/5 rounded-xl p-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-white">
										Registered NFC Tags
									</h3>
									<div className="flex gap-2">
										<div className="relative">
											<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
											<input
												type="text"
												placeholder="Search tags..."
												value={nfcSearchQuery}
												onChange={(e) => setNfcSearchQuery(e.target.value)}
												className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
											/>
										</div>
										<button
											onClick={() => {
												// Simple tag creation with prompt
												const uid = prompt("Enter NFC Tag UID:");
												const ingredient = prompt("Enter ingredient name:");
												const slotId = prompt("Enter slot ID:");

												if (uid && ingredient && slotId) {
													createNfcTag({ uid, ingredient, slotId });
												}
											}}
											className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
										>
											<Plus className="w-4 h-4" />
											Add Tag
										</button>
									</div>
								</div>

								<div className="space-y-2 max-h-64 overflow-y-auto">
									{filteredNfcTags.length === 0 ? (
										<div className="text-center py-8 text-gray-400">
											<Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
											<p>No NFC tags found</p>
											<p className="text-sm">
												Add NFC tags to track ingredients
											</p>
										</div>
									) : (
										filteredNfcTags.map((tag) => (
											<div
												key={tag._id}
												className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
											>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<span className="font-medium text-white">
															{tag.ingredient}
														</span>
														<span
															className={`px-2 py-1 rounded-full text-xs ${
																tag.status === "active"
																	? "bg-green-500/20 text-green-400"
																	: tag.status === "inactive"
																	? "bg-gray-500/20 text-gray-400"
																	: "bg-red-500/20 text-red-400"
															}`}
														>
															{tag.status}
														</span>
													</div>
													<div className="text-sm text-gray-400">
														UID: {tag.uid} | Slot: {tag.slotId}
													</div>
													<div className="text-xs text-gray-500 mt-1">
														Reads: {tag.readCount} | Writes: {tag.writeCount}
													</div>
												</div>
												<div className="flex gap-1">
													<button
														onClick={() => {
															const newIngredient = prompt(
																"Enter new ingredient name:",
																tag.ingredient
															);
															if (
																newIngredient &&
																newIngredient !== tag.ingredient
															) {
																// Update tag logic would go here
																setMessageWithTimeout(
																	"Tag update functionality coming soon"
																);
															}
														}}
														className="p-1 text-gray-400 hover:text-white"
													>
														<Edit className="w-4 h-4" />
													</button>
													<button
														onClick={() => {
															if (
																confirm(
																	`Delete NFC tag for "${tag.ingredient}"?`
																)
															) {
																deleteNfcTag(tag._id);
															}
														}}
														className="p-1 text-red-400 hover:text-red-300"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</div>
										))
									)}
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

			{/* NFC Write Dialog */}
			{showNfcWriteDialog && (
				<div className="fixed inset-0 z-60 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-lg"
						onClick={() => setShowNfcWriteDialog(false)}
					/>
					<div className="relative bg-zinc-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
						<h3 className="text-lg font-semibold text-white mb-4">
							Write to NFC Tag
						</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm text-gray-300 mb-2">
									Ingredient Name
								</label>
								<input
									type="text"
									value={nfcWriteIngredient}
									onChange={(e) => setNfcWriteIngredient(e.target.value)}
									placeholder="Enter ingredient name"
									className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
									autoFocus
								/>
								<p className="text-xs text-gray-400 mt-1">
									<strong>Note:</strong> The write will happen immediately if a
									tag is present. No tap required after clicking 'Write Tag'.
								</p>
							</div>
							<div className="flex gap-2">
								<button
									onClick={handleNfcWrite}
									disabled={!nfcWriteIngredient.trim()}
									className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
								>
									Write Tag
								</button>
								<button
									onClick={() => {
										setShowNfcWriteDialog(false);
										setNfcWriteIngredient("");
									}}
									className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DeviceSheet;
