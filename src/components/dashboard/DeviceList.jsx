import React, { useEffect, useState } from "react";
import DeviceCard from "./DeviceCard";
import AddDeviceCard from "./AddDeviceCard";

const DeviceList = ({ devices, onDeviceClick, onAddDevice, socket }) => {
	const [deviceStatus, setDeviceStatus] = useState(new Map());

	useEffect(() => {
		if (!socket) return;

		// Listen for device status updates
		const handleDeviceStatus = (data) => {
			setDeviceStatus(
				(prev) =>
					new Map(
						prev.set(data.deviceId, {
							isOnline: data.isOnline,
							lastSeen: data.lastSeen,
							weight: data.weight,
							status: data.status,
						})
					)
			);
		};

		// Listen for general updates
		const handleUpdate = (data) => {
			setDeviceStatus(
				(prev) =>
					new Map(
						prev.set(data.deviceId, {
							isOnline: data.isOnline || true,
							lastSeen: data.lastSeen || new Date(),
							weight: data.weight,
							status: data.status,
						})
					)
			);
		};

		socket.on("deviceStatus", handleDeviceStatus);
		socket.on("update", handleUpdate);

		return () => {
			socket.off("deviceStatus", handleDeviceStatus);
			socket.off("update", handleUpdate);
		};
	}, [socket]);

	// Merge device data with real-time status
	const devicesWithStatus = devices.map((device) => {
		const status = deviceStatus.get(device.rackId);
		return {
			...device,
			isOnline: status?.isOnline ?? device.isOnline,
			lastSeen: status?.lastSeen ?? device.lastSeen,
			lastWeight: status?.weight ?? device.lastWeight,
			lastStatus: status?.status ?? device.lastStatus,
		};
	});

	return (
		<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein flex flex-col gap-6">
			<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
				Your Devices
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
				{/* Add Device Card - Always First */}

				{/* Device Cards */}
				{devicesWithStatus.map((device) => (
					<DeviceCard
						key={device._id}
						device={device}
						onDeviceClick={onDeviceClick}
					/>
				))}
				<AddDeviceCard onClick={onAddDevice} socket={socket} />

				{/* No Devices Message */}
				{devicesWithStatus.length === 0 && (
					<div className="col-span-full text-center py-12">
						<div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
							<div className="text-gray-400 mb-4">
								<svg
									className="w-16 h-16 mx-auto"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								No devices registered
							</h3>
							<p className="text-gray-400 mb-6">
								Click the "+" button above to add your first IntelliRack device
							</p>
							<button
								onClick={onAddDevice}
								className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium"
							>
								Add Your First Device
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default DeviceList;
