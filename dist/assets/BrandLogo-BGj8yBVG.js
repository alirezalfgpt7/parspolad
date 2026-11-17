import { l as require_react, m as __toESM, n as cn, o as useAppStore, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { a as DEFAULT_BRAND_LOGOS, t as ZeroBrokenImage, u as isVideoMediaUrl } from "./ZeroBrokenImage-CvCIOfg-.js";
// src/components/common/BrandLogo.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/**
* Unified brand emblem renderer supporting PNG, JPG, WEBP, SVG, animated GIF, and looping MP4/WEBM videos.
* Resolves live preview overrides -> bootstrap.logos -> company legacy logo URLs -> built-in fallbacks.
*/
var BrandLogo = ({ placement = "navbar", overrideUrl, alt = "", className, imgClassName, hueHover = false }) => {
	const previewLogos = useAppStore((s) => s.previewLogos);
	const logos = useAppStore((s) => s.bootstrap?.logos);
	const company = useAppStore((s) => s.bootstrap?.company);
	const [videoFailed, setVideoFailed] = (0, import_react.useState)(false);
	const legacyFallback = placement === "footer" || placement === "seo_share" ? company?.logo_url || company?.logo_small_url : company?.logo_small_url || company?.logo_url;
	const resolvedUrl = overrideUrl && overrideUrl.trim() || previewLogos?.[placement] || logos?.[placement] || legacyFallback || DEFAULT_BRAND_LOGOS[placement];
	const isVideo = isVideoMediaUrl(resolvedUrl) && !videoFailed;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center justify-center overflow-hidden", className),
		children: isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			src: resolvedUrl,
			autoPlay: true,
			muted: true,
			loop: true,
			playsInline: true,
			"aria-label": alt || void 0,
			"aria-hidden": !alt,
			onError: () => setVideoFailed(true),
			className: cn("h-full w-full object-contain", hueHover && "effect-hue-circle", imgClassName)
		}, resolvedUrl) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZeroBrokenImage, {
			src: resolvedUrl,
			alt,
			className: cn("h-full w-full object-contain", hueHover && "effect-hue-circle", imgClassName)
		})
	});
};
export { BrandLogo as t };
