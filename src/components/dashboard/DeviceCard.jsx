import React from "react";
import Image from "next/image";
import slot from "../../../public/images/slot.png";

export default function DeviceCard({ device, onClick }) {
	return (
		<div
			className="relative rounded-3xl bg-white/30 dark:bg-zinc-900/30 backdrop-blur-[40px] border border-white/40 shadow-2xl flex flex-col items-center p-6 min-h-[320px] group hover:scale-[1.03] transition-transform cursor-pointer"
			onClick={onClick}
		>
			{/* Three Dots Menu */}
			<div className="absolute top-4 right-4 z-10">
				<button
					className="p-2 rounded-full bg-white/40 hover:bg-white/70 transition-colors shadow-lg border border-white/30 focus:outline-none"
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					{/* Inline SVG for vertical ellipsis */}
					<svg width="22" height="22" fill="none" viewBox="0 0 24 24">
						<circle cx="12" cy="5" r="1.5" fill="#6366f1" />
						<circle cx="12" cy="12" r="1.5" fill="#6366f1" />
						<circle cx="12" cy="19" r="1.5" fill="#6366f1" />
					</svg>
				</button>
				{/* TODO: Dropdown menu for Edit/Delete actions */}
			</div>
			{/* Device Image */}
			<div className="overflow-hidden mb-4 w-full h-full">
				<Image
					src={slot}
					alt="Device Slot"
					className="object-cover w-full h-full rounded-2xl"
					draggable={false}
				/>
			</div>
			{/* Device Info */}
			<div className="flex flex-col items-center gap-1 w-full">
				<span className="font-bold text-xl text-gray-800 dark:text-white text-center">
					{device.name}
				</span>
				<span className="text-xs text-gray-500">Rack ID: {device.rackId}</span>
				<span className="text-xs text-gray-500">
					Location: {device.location || "-"}
				</span>
				<span className="text-xs text-gray-400">
					Created: {new Date(device.createdAt).toLocaleString()}
				</span>
			</div>
			<button className="mt-4 w-fit rounded-full px-6 py-2 text-sm font-semibold shadow bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none hover:shadow-xl transition-all">
				Device Settings
			</button>
		</div>
	);
}
