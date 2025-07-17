import React from "react";
import Image from "next/image";
import slot from "../../../public/images/slot.png";

export default function DeviceSheet({ device, onClose }) {
	if (!device) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] transition-all">
			<div className="relative rounded-t-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-[40px] border border-white/40 shadow-2xl p-8 pt-16 animate-slideup flex flex-col w-[90vw] h-[90vh] max-w-3xl mx-auto justify-center">
				{/* X Button */}
				<button
					className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/60 hover:bg-white/90 shadow border border-white/30 text-2xl font-bold text-gray-700 hover:text-indigo-600 transition-all"
					onClick={onClose}
					aria-label="Close"
				>
					&times;
				</button>
				{/* Device Details */}
				<div className="flex flex-col items-center gap-4 h-full overflow-y-auto">
					<div className="w-28 h-28 rounded-2xl overflow-hidden shadow-xl border-2 border-white/40 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
						<Image
							src={slot}
							alt="Device Slot"
							className="object-cover w-full h-full rounded-2xl"
							draggable={false}
						/>
					</div>
					<span className="font-bold text-2xl text-gray-800 dark:text-white text-center">
						{device.name}
					</span>
					<span className="text-sm text-gray-500">
						Rack ID: {device.rackId}
					</span>
					<span className="text-sm text-gray-500">
						Location: {device.location || "-"}
					</span>
					<span className="text-xs text-gray-400">
						Created: {new Date(device.createdAt).toLocaleString()}
					</span>
					{/* TODO: Add tare, calibrate, NFC write, live weight reading, chart features here */}
					<div className="mt-8 text-center text-gray-400">
						[Device actions and features coming soon]
					</div>
				</div>
			</div>
		</div>
	);
}
