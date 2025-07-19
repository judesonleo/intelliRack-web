import React, { useState, useEffect } from "react";

const AddDeviceCard = ({ onClick, socket }) => {
	const [showDiscovery, setShowDiscovery] = useState(false);
	const [isDiscovering, setIsDiscovering] = useState(false);
	const [discoveredDevices, setDiscoveredDevices] = useState([]);
	const [registrationForm, setRegistrationForm] = useState({
		name: "",
		rackId: "",
		location: "",
	});
	const [selectedDevice, setSelectedDevice] = useState(null);

	// Log socket connection status
	useEffect(() => {
		console.log("AddDeviceCard: Socket available:", !!socket);
		if (socket) {
			console.log("AddDeviceCard: Socket connected:", socket.connected);
			console.log("AddDeviceCard: Socket ID:", socket.id);

			// Listen for connection events
			socket.on("connect", () => {
				console.log("AddDeviceCard: Socket connected with ID:", socket.id);
			});

			socket.on("disconnect", () => {
				console.log("AddDeviceCard: Socket disconnected");
			});

			socket.on("connect_error", (error) => {
				console.error("AddDeviceCard: Socket connection error:", error);
			});
		}
	}, [socket]);

	const scanNetwork = async () => {
		setIsDiscovering(true);
		setDiscoveredDevices([]);

		try {
			// Method 1: Try mDNS discovery first
			console.log("Starting mDNS discovery...");
			const mDNSDevices = await scanMDNS();
			console.log("mDNS devices found:", mDNSDevices);

			// Method 2: Scan common local network ranges
			console.log("Starting network scan...");
			const discovered = [...mDNSDevices];
			const networkRanges = ["192.168.1", "192.168.0", "10.0.0", "172.16.0"];

			// Get current network info
			const currentIP = await getCurrentIP();
			if (currentIP) {
				const baseIP = currentIP.split(".").slice(0, 3).join(".");
				if (!networkRanges.includes(baseIP)) {
					networkRanges.unshift(baseIP);
				}
			}

			// Scan each network range
			for (const baseIP of networkRanges) {
				console.log(`Scanning network range: ${baseIP}.0/24`);
				const devices = await scanNetworkRange(baseIP);
				discovered.push(...devices);
			}

			// Remove duplicates based on deviceId
			const uniqueDevices = discovered.filter(
				(device, index, self) =>
					index === self.findIndex((d) => d.deviceId === device.deviceId)
			);

			console.log("Total unique devices found:", uniqueDevices);
			setDiscoveredDevices(uniqueDevices);
		} catch (error) {
			console.error("Discovery error:", error);
			// Show a test device for development
			setDiscoveredDevices([
				{
					deviceId: "rack_001",
					slotId: 1,
					name: "IntelliRack rack_001",
					type: "IntelliRack",
					firmwareVersion: "v2.0",
					ipAddress: "192.168.1.100",
					macAddress: "AA:BB:CC:DD:EE:FF",
					ssid: "TestNetwork",
					rssi: -45,
					mqttConnected: true,
					currentWeight: 250.5,
					currentStatus: "OK",
					tagPresent: false,
					currentIngredient: "",
					discoveryTime: Date.now(),
				},
			]);
		} finally {
			setIsDiscovering(false);
		}
	};

	const getCurrentIP = async () => {
		try {
			// Try to get current IP through a service
			const response = await fetch("https://api.ipify.org?format=json");
			const data = await response.json();
			return data.ip;
		} catch (error) {
			console.log("Could not get current IP");
			return null;
		}
	};

	const scanNetworkRange = async (baseIP) => {
		const devices = [];
		const promises = [];

		// Scan only common device IPs and a smaller range
		const commonIPs = [];

		// Add common device IPs
		for (let i = 100; i <= 120; i++) {
			commonIPs.push(`${baseIP}.${i}`);
		}

		// Add router IPs
		commonIPs.push(`${baseIP}.1`);
		commonIPs.push(`${baseIP}.254`);

		// Check for IntelliRack devices on common ports
		const ports = [80]; // Focus on port 80 for ESP32 devices

		for (const ip of commonIPs) {
			for (const port of ports) {
				promises.push(
					checkDevice(ip, port)
						.then((device) => {
							if (device) {
								console.log(`Found device at ${ip}:${port}:`, device);
								devices.push(device);
							}
						})
						.catch(() => {})
				);
			}
		}

		// Wait for all checks to complete (with timeout)
		await Promise.allSettled(promises);
		return devices;
	};

	const checkDevice = async (ip, port) => {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

			const response = await fetch(`http://${ip}:${port}/api/discovery`, {
				signal: controller.signal,
				mode: "cors",
			});

			clearTimeout(timeoutId);

			if (response.ok) {
				const deviceData = await response.json();
				return {
					...deviceData,
					ipAddress: ip,
					port: port,
				};
			}
		} catch (error) {
			// Device not found or not responding
		}
		return null;
	};

	const scanMDNS = async () => {
		try {
			// Try to use mDNS discovery if available
			if (navigator.serviceWorker) {
				// Register a service worker for mDNS discovery
				const registration = await navigator.serviceWorker.register("/sw.js");
				console.log("Service worker registered for mDNS");

				// Try to discover IntelliRack devices via mDNS
				const devices = await discoverIntelliRackDevices();
				return devices;
			}
		} catch (error) {
			console.log("mDNS not supported, using HTTP discovery only");
		}

		// Fallback: Try to discover via common mDNS patterns
		return await discoverViaHTTP();
	};

	const discoverIntelliRackDevices = async () => {
		const devices = [];

		// Try common IntelliRack device names
		const deviceNames = [
			"intellirack_rack_001",
			"intellirack_rack_002",
			"intellirack_rack_003",
			"intellirack.local",
		];

		for (const deviceName of deviceNames) {
			try {
				const response = await fetch(`http://${deviceName}/api/discovery`, {
					mode: "cors",
					signal: AbortSignal.timeout(3000),
				});

				if (response.ok) {
					const deviceData = await response.json();
					devices.push({
						...deviceData,
						ipAddress: deviceName,
						discoveredVia: "mDNS",
					});
				}
			} catch (error) {
				// Device not found
			}
		}

		return devices;
	};

	const discoverViaHTTP = async () => {
		// Try to discover devices by scanning common ESP32 IPs
		const commonIPs = [
			"192.168.1.100",
			"192.168.1.101",
			"192.168.1.102",
			"192.168.0.100",
			"192.168.0.101",
			"192.168.0.102",
			"192.168.0.105", // From the logs, this one responded with 500
			"10.0.0.100",
			"10.0.0.101",
			"10.0.0.102",
		];

		const devices = [];

		for (const ip of commonIPs) {
			try {
				console.log(`Trying ${ip}/api/discovery...`);
				const response = await fetch(`http://${ip}/api/discovery`, {
					mode: "cors",
					signal: AbortSignal.timeout(3000),
				});

				if (response.ok) {
					const deviceData = await response.json();
					console.log(`Found device at ${ip}:`, deviceData);
					devices.push({
						...deviceData,
						ipAddress: ip,
						discoveredVia: "HTTP",
					});
				} else {
					console.log(`${ip} responded with status: ${response.status}`);
				}
			} catch (error) {
				console.log(`${ip} connection failed:`, error.message);
			}
		}

		return devices;
	};

	const startDiscovery = async () => {
		await scanNetwork();
	};

	const registerDevice = async (device) => {
		console.log("Register device called with:", device);
		console.log("Socket available:", !!socket);
		console.log("Registration form:", registrationForm);

		if (!socket) {
			alert(
				"Socket connection not available. Please refresh the page and try again."
			);
			return;
		}

		// Check server health first
		try {
			const healthResponse = await fetch(
				"https://intellibackend.judesonleo.me/health"
			);
			if (healthResponse.ok) {
				const healthData = await healthResponse.json();
				console.log("Server health check:", healthData);
			} else {
				console.error("Server health check failed:", healthResponse.status);
			}
		} catch (error) {
			console.error("Server health check error:", error);
		}

		try {
			const deviceData = {
				...registrationForm,
				rackId: device.deviceId || registrationForm.rackId,
				firmwareVersion: device.firmwareVersion || "v2.0",
				ipAddress: device.ipAddress,
				macAddress: device.macAddress,
			};

			console.log("Sending device data:", deviceData);
			console.log("Socket connected:", socket.connected);
			console.log("Socket ID:", socket.id);

			// Add a timeout for the registration response
			const registrationPromise = new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error("Registration timeout - no response from server"));
				}, 10000); // 10 second timeout

				socket.once("deviceRegistered", (response) => {
					clearTimeout(timeout);
					console.log("Registration response received:", response);
					resolve(response);
				});

				console.log("Emitting registerDevice event...");
				socket.emit("registerDevice", deviceData);
				console.log("registerDevice event emitted");
			});

			const response = await registrationPromise;

			if (response.success) {
				console.log("Device registered successfully");
				setShowDiscovery(false);
				setRegistrationForm({ name: "", rackId: "", location: "" });
				setSelectedDevice(null);
				// Optionally refresh the device list
				if (onClick) onClick();
			} else {
				console.error("Registration failed:", response.error);
				alert("Registration failed: " + response.error);
			}
		} catch (error) {
			console.error("Registration error:", error);
			alert("Registration failed: " + error.message);
		}
	};

	const handleManualAdd = () => {
		setShowDiscovery(true);
		setDiscoveredDevices([]);
		setSelectedDevice(null);
	};

	const selectDevice = (device) => {
		setSelectedDevice(device);
		setRegistrationForm((prev) => ({
			...prev,
			rackId: device.deviceId,
			name: device.name || `IntelliRack ${device.deviceId}`,
		}));
	};

	return (
		<>
			{/* Add Device Card */}
			<div
				className="relative group cursor-pointer transition-all duration-300 hover:scale-105"
				onClick={handleManualAdd}
			>
				<div className="relative overflow-hidden rounded-2xl bg-white/10  border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
					<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

					<div className="relative p-6 flex flex-col items-center justify-center min-h-[280px]">
						{/* Plus Icon */}
						<div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
							<svg
								className="w-8 h-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
						</div>

						{/* Text */}
						<h3 className="text-lg font-semibold text-white mb-2">
							Add Device
						</h3>
						<p className="text-sm text-gray-300 text-center">
							Discover and register new IntelliRack devices on your network
						</p>
					</div>
				</div>
			</div>

			{/* Discovery Modal */}
			{showDiscovery && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-white/20 backdrop-blur-lg"
						onClick={() => setShowDiscovery(false)}
					/>

					<div className="relative w-full max-w-4xl bg-black/50  border border-white/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-lg">
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-white/10">
							<h2 className="text-2xl font-bold text-white">Add New Device</h2>
							<button
								onClick={() => setShowDiscovery(false)}
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

						{/* Content */}
						<div className="p-6 max-h-[70vh] overflow-y-auto">
							{/* Discovery Section */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold text-white mb-4">
									Device Discovery
								</h3>

								{!isDiscovering && discoveredDevices.length === 0 && (
									<div className="text-center py-8">
										<button
											onClick={startDiscovery}
											className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium"
										>
											Start Discovery
										</button>
										<p className="text-sm text-gray-400 mt-2">
											Scan your local network for IntelliRack devices
										</p>
									</div>
								)}

								{isDiscovering && (
									<div className="text-center py-8">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
										<p className="text-white">
											Scanning network for devices...
										</p>
										<p className="text-sm text-gray-400 mt-2">
											This may take a few moments
										</p>
									</div>
								)}

								{discoveredDevices.length > 0 && (
									<div className="space-y-3">
										<h4 className="text-white font-medium">
											Discovered Devices:
										</h4>
										{discoveredDevices.map((device, index) => (
											<div
												key={index}
												className={`bg-white/5 rounded-lg p-4 border cursor-pointer transition-colors ${
													selectedDevice?.deviceId === device.deviceId
														? "border-indigo-500 bg-indigo-500/10"
														: "border-white/10 hover:border-white/20"
												}`}
												onClick={() => selectDevice(device)}
											>
												<div className="flex justify-between items-start">
													<div className="flex-1">
														<div className="flex items-center gap-3 mb-2">
															<h5 className="text-white font-medium">
																{device.name}
															</h5>
															<span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
																{device.currentStatus}
															</span>
														</div>
														<div className="grid grid-cols-2 gap-2 text-sm">
															<div>
																<span className="text-gray-400">Rack ID:</span>
																<span className="text-white ml-2">
																	{device.deviceId}
																</span>
															</div>
															<div>
																<span className="text-gray-400">IP:</span>
																<span className="text-white ml-2">
																	{device.ipAddress}
																</span>
															</div>
															<div>
																<span className="text-gray-400">Weight:</span>
																<span className="text-white ml-2">
																	{device.currentWeight}g
																</span>
															</div>
															<div>
																<span className="text-gray-400">Firmware:</span>
																<span className="text-white ml-2">
																	{device.firmwareVersion}
																</span>
															</div>
														</div>
													</div>
													<div className="text-right">
														<div
															className={`w-3 h-3 rounded-full ${
																device.mqttConnected
																	? "bg-green-400"
																	: "bg-red-400"
															}`}
														></div>
														<p className="text-xs text-gray-400 mt-1">
															{device.mqttConnected ? "MQTT" : "No MQTT"}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Registration Form */}
							{selectedDevice && (
								<div className="bg-white/5 rounded-xl p-6">
									<h3 className="text-lg font-semibold text-white mb-4">
										Register Device
									</h3>

									<div className="space-y-4">
										<div>
											<label className="block text-sm text-gray-300 mb-2">
												Device Name
											</label>
											<input
												type="text"
												value={registrationForm.name}
												onChange={(e) =>
													setRegistrationForm((prev) => ({
														...prev,
														name: e.target.value,
													}))
												}
												placeholder="e.g., Kitchen Rack 1"
												className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
											/>
										</div>

										<div>
											<label className="block text-sm text-gray-300 mb-2">
												Rack ID
											</label>
											<input
												type="text"
												value={registrationForm.rackId}
												onChange={(e) =>
													setRegistrationForm((prev) => ({
														...prev,
														rackId: e.target.value,
													}))
												}
												placeholder="e.g., rack_001"
												className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
												readOnly
											/>
											<p className="text-xs text-gray-400 mt-1">
												Auto-filled from discovered device
											</p>
										</div>

										<div>
											<label className="block text-sm text-gray-300 mb-2">
												Location
											</label>
											<input
												type="text"
												value={registrationForm.location}
												onChange={(e) =>
													setRegistrationForm((prev) => ({
														...prev,
														location: e.target.value,
													}))
												}
												placeholder="e.g., Kitchen, Pantry"
												className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
											/>
										</div>

										{/* Device Info Summary */}
										<div className="bg-white/5 rounded-lg p-4 mt-4">
											<h4 className="text-white font-medium mb-2">
												Device Information
											</h4>
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="text-gray-400">IP Address:</span>{" "}
													<span className="text-white">
														{selectedDevice.ipAddress}
													</span>
												</div>
												<div>
													<span className="text-gray-400">MAC Address:</span>{" "}
													<span className="text-white">
														{selectedDevice.macAddress}
													</span>
												</div>
												<div>
													<span className="text-gray-400">Current Weight:</span>{" "}
													<span className="text-white">
														{selectedDevice.currentWeight}g
													</span>
												</div>
												<div>
													<span className="text-gray-400">Status:</span>{" "}
													<span className="text-white">
														{selectedDevice.currentStatus}
													</span>
												</div>
											</div>
										</div>
									</div>

									<div className="flex gap-3 mt-6">
										<button
											onClick={() => registerDevice(selectedDevice)}
											className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
										>
											Register Device
										</button>
										<button
											onClick={() => setShowDiscovery(false)}
											className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
										>
											Cancel
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default AddDeviceCard;
