import type { Metadata } from "next";
import { AuthPanels } from "@/components/auth/AuthPanels";

export const metadata: Metadata = {
	title: "회원가입",
};

export default function SignUpPage() {
	return <AuthPanels initial="signup" />;
}
