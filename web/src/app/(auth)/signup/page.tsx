"use client";
import {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {signIn} from "next-auth/react";

export default function SignUpPage() {
    const router = useRouter();
    const params = useSearchParams();
    const callbackUrl = params.get("callbackUrl") || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password, name}),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data?.error || "Could not create account.");
                return;
            }
            // Auto sign-in after successful sign-up
            const signInRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            if (signInRes && !signInRes.error) {
                router.push(callbackUrl);
            } else {
                router.push("/signin?from=signup");
            }
        } catch (err) {
            setError("Sign up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{maxWidth: 420, margin: "64px auto", padding: 24}}>
            <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 8}}>Create your account</h1>
            <p style={{color: "#6b7280", marginBottom: 16}}>Use a valid email and a strong password (min 8 chars).</p>
            <form onSubmit={onSubmit} style={{display: "grid", gap: 12}}>
                <label style={{display: "grid", gap: 6}}>
                    <span style={{fontWeight: 600}}>Name (optional)</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{padding: 10, border: "1px solid #d1d5db", borderRadius: 8}}
                    />
                </label>
                <label style={{display: "grid", gap: 6}}>
                    <span style={{fontWeight: 600}}>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{padding: 10, border: "1px solid #d1d5db", borderRadius: 8}}
                    />
                </label>
                <label style={{display: "grid", gap: 6}}>
                    <span style={{fontWeight: 600}}>Password</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        style={{padding: 10, border: "1px solid #d1d5db", borderRadius: 8}}
                    />
                </label>
                {error && (
                    <div role="alert" style={{color: "#b91c1c"}}>
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: "#0e3fa9",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: 0,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Creating account..." : "Sign up"}
                </button>
            </form>
        </div>
    );
}
