import { brandIconImage } from "@/components/ui/BrandIconImage";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
	return brandIconImage(size.width, { rounded: false });
}
