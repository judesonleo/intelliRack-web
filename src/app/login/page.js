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
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center justify-center text-lg font-medium"></div>
				<div className="relative z-20 flex items-center text-lg font-medium">
					IntelliRack
				</div>
				<div className="relative z-20 flex items-center text-lg font-medium">
					<h1 className="text-4xl font-bold">3D RACK</h1>
				</div>
				<div className="relative z-20 mt-auto"></div>
			</div>
			<div className="lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<Card>
						<CardHeader className="space-y-1">
							<CardTitle className="text-2xl text-center">
								Welcome back
							</CardTitle>
							<CardDescription className="text-center">
								Enter your email to sign in to your account
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
										/>
									</div>
									{error && (
										<div className="text-red-500 text-sm text-center">
											{error}
										</div>
									)}
									<Button disabled={isLoading}>
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
									className="text-primary underline-offset-4 hover:underline"
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
