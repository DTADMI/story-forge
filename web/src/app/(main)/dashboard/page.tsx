"use client";
import {signOut} from "next-auth/react";

export default function DashboardPage() {
    return (
        <div style={{maxWidth: 720, margin: "48px auto", padding: 24}}>
            <h1 style={{fontSize: 28, fontWeight: 700}}>Dashboard</h1>
            <p style={{color: "#6b7280", marginTop: 8}}>
                This is a protected page. You reached it because you are signed in.
            </p>
            <div style={{marginTop: 16}}>
                <button
                    onClick={() => signOut({callbackUrl: "/signin"})}
                    style={{
                        background: "#b4371e",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: 0,
                        cursor: "pointer",
                    }}
                >
                    Sign out
                </button>
            </div>
        </div>
    );
}
