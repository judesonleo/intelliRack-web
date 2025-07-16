"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { login } from "@/lib/auth";
import Image from "next/image";
// import rack from "@/public/rack.png";
export default function LoginPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [form, setForm] = useState({ email: "", password: "" });

	async function onSubmit(event) {
		event.preventDefault();
		setIsLoading(true);
		setError("");
		try {
			await login(form.email, form.password);
			router.replace("/dashboard");
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}

	function handleChange(e) {
		setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
	}

	return (
		<div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="relative hidden h-full flex-col bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-10 text-white lg:flex">
				<div className="relative z-20 flex items-center text-3xl font-bold">
					<span className="bg-white bg-clip-text text-transparent">
						<Link href="/">IntelliRack</Link>
					</span>
				</div>
				<div
					style={{
						position: "relative",
						width: "100%",
						height: "300px",
						marginTop: "2rem",
						marginBottom: "2rem",
					}}
				>
					<Image
						src="/rack.svg"
						alt="IntelliRack"
						fill
						style={{ objectFit: "contain" }}
					/>
				</div>

				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">
							&quot;Smart inventory management for the modern world. Track,
							analyze, and optimize your stock with ease.&quot;
						</p>
						<footer className="text-sm">Powered by IoT & AI</footer>
					</blockquote>
				</div>
			</div>
			<div className="lg:p-8 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 w-full h-full">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[600px] sm:h-[750px] animate-fadein bg-white/90 p-6 rounded-2xl shadow-2xl border border-white/50 backdrop-blur-3xl bg-opacity-70 dark:bg-zinc-900/40">
					<Card className=" border border-gray/60 shadow-lg backdrop-blur-lg bg-white/10 m-13 animate-fadein ">
						<CardHeader className="space-y-3">
							<CardTitle className="text-2xl text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
								Welcome back
							</CardTitle>
							<CardDescription className="text-center">
								Sign in to your IntelliRack account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={onSubmit}>
								<div className="grid gap-4">
									<div className="grid gap-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											name="email"
											placeholder="name@example.com"
											type="email"
											autoCapitalize="none"
											autoComplete="email"
											autoCorrect="off"
											disabled={isLoading}
											required
											value={form.email}
											onChange={handleChange}
											className="bg-white/5 border-white/20"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="password">Password</Label>
										<Input
											id="password"
											name="password"
											type="password"
											autoComplete="current-password"
											disabled={isLoading}
											required
											value={form.password}
											onChange={handleChange}
											className="bg-white/5 border-white/20"
										/>
									</div>
									{error && (
										<div className="text-red-500 text-sm text-center">
											{error}
										</div>
									)}
									<Button
										disabled={isLoading}
										className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg transition-shadow"
									>
										{isLoading && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Sign In
									</Button>
								</div>
							</form>
						</CardContent>
						<CardFooter className="flex flex-col space-y-4">
							<div className="text-sm text-muted-foreground text-center">
								Don&apos;t have an account?{" "}
								<Link
									href="/register"
									className="text-primary underline-offset-4 hover:underline font-medium"
								>
									Sign up
								</Link>
							</div>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}
