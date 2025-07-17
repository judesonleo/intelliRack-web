import React from "react";

export default function AddDeviceCard({ onClick }) {
	return (
		<div
			className="rounded-3xl bg-white/30 dark:bg-zinc-900/30 backdrop-blur-[40px] border-2 border-dashed border-indigo-400 shadow-2xl flex flex-col items-center justify-center p-8 min-h-[320px] cursor-pointer hover:scale-105 transition-transform relative group"
			onClick={onClick}
		>
			<div className="flex flex-col items-center gap-2">
				<div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-xl mb-4">
					<span className="text-5xl text-white font-bold">+</span>
				</div>
				<span className="text-lg font-semibold text-indigo-600">
					Add Device
				</span>
				<span className="text-xs text-gray-500 text-center">
					Discover and register new devices
				</span>
			</div>
		</div>
	);
}
