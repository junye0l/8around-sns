import type { Metadata } from "next";
import { AuthPanels } from "@/components/auth/AuthPanels";

export const metadata: Metadata = {
	title: "로그인",
};

export default function SignInPage() {
	return <AuthPanels initial="signin" />;
}
