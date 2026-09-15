import { brandIconImage } from "@/components/ui/BrandIconImage";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return brandIconImage(size.width, { rounded: true });
}
