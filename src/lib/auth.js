const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "https://intellibackend.judesonleo.me/api";

export async function login(email, password) {
	const res = await fetch(`${API_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
	if (!res.ok) throw new Error((await res.json()).error || "Login failed");
	const data = await res.json();
	localStorage.setItem("token", data.token);
	localStorage.setItem("user", JSON.stringify(data.user));
	localStorage.setItem("email", email);
	return data.user;
}

export async function register(name, email, password) {
	const res = await fetch(`${API_URL}/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	});
	if (!res.ok) throw new Error((await res.json()).error || "Register failed");
	return await res.json();
}

export function logout() {
	localStorage.removeItem("token");
	localStorage.removeItem("user");
	localStorage.removeItem("email");
}

export function getToken() {
	return localStorage.getItem("token");
}

export function getUser() {
	const user = localStorage.getItem("user");
	const email = localStorage.getItem("email");
	return user ? { ...JSON.parse(user), email } : null;
}

export function getEmail() {
	return localStorage.getItem("email");
}

export async function fetchWithAuth(url, options = {}) {
	const token = getToken();
	return fetch(url, {
		...options,
		headers: {
			...(options.headers || {}),
			Authorization: token ? `Bearer ${token}` : undefined,
		},
	});
}
