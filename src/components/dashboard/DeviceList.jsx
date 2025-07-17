import React from "react";
import DeviceCard from "./DeviceCard";

export default function DeviceList({ devices, onDeviceClick, AddDeviceCard }) {
	return (
		<div className="rounded-3xl bg-white/15 dark:bg-zinc-900/25 backdrop-blur-[30px] border border-white/30 shadow-2xl p-8 animate-fadein flex flex-col gap-6">
			<h3 className="text-lg font-semibold mb-2 text-[var(--primary)]">
				Your Devices
			</h3>
			<ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
				{/* Always show Add Device Card as the first card */}
				<li>
					<AddDeviceCard />
				</li>
				{/* Device Cards */}
				{devices.length === 0 ? (
					<li className="col-span-full flex items-center justify-center text-gray-500 min-h-[120px] text-lg">
						No devices registered.
					</li>
				) : (
					devices.map((d) => (
						<li key={d._id}>
							<DeviceCard device={d} onClick={() => onDeviceClick(d)} />
						</li>
					))
				)}
			</ul>
		</div>
	);
}
