import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "とるんと",
	description: "Created with v0",
	generator: "v0.dev",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body>{children}</body>
		</html>
	);
}
