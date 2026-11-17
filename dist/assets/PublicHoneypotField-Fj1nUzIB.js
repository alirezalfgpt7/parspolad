import { a as createLucideIcon, l as require_react, m as __toESM, n as cn, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { O as InlineLoader } from "./index-Dacn8Sc3.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var RefreshCw = createLucideIcon("refresh-cw", [
	["path", {
		d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
		key: "v9h5vc"
	}],
	["path", {
		d: "M21 3v5h-5",
		key: "1q7to0"
	}],
	["path", {
		d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
		key: "3uifl3"
	}],
	["path", {
		d: "M8 16H3v5",
		key: "1cv678"
	}]
]);
// src/components/forms/SelfHostedCaptcha.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function isCaptchaChallenge(value) {
	return typeof value === "object" && value !== null && "key" in value && typeof value.key === "string" && "img" in value && typeof value.img === "string";
}
var SelfHostedCaptcha = ({ registration, refreshToken, onKeyChange, onRefresh, error, appearance = "default", mode = "standard" }) => {
	const [challenge, setChallenge] = (0, import_react.useState)(null);
	const [loadError, setLoadError] = (0, import_react.useState)("");
	const [imageError, setImageError] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let active = true;
		setChallenge(null);
		setLoadError("");
		setImageError(false);
		onKeyChange("");
		(mode === "mixed" ? apiRequest("/captcha/challenge", { cache: "no-store" }) : fetch("/captcha/api/public", {
			headers: { Accept: "application/json" },
			cache: "no-store"
		}).then(async (response) => {
			if (!response.ok) throw new Error(`CAPTCHA request failed with status ${response.status}`);
			return response.json();
		})).then((payload) => {
			if (!isCaptchaChallenge(payload)) throw new TypeError("CAPTCHA response did not contain an image and challenge key.");
			if (active) {
				setChallenge(payload);
				onKeyChange(payload.key);
			}
		}).catch((cause) => {
			if (active) setLoadError(cause instanceof Error ? cause.message : "خطا در دریافت کد امنیتی");
		});
		return () => {
			active = false;
		};
	}, [
		refreshToken,
		onKeyChange,
		mode
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-2", appearance === "glass" && "auth-glass-captcha"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: registration.name,
				className: "block text-xs font-medium",
				children: mode === "mixed" ? "عبارت یا حروف داخل تصویر را وارد کنید" : "کد امنیتی را از تصویر وارد کنید"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [challenge && !imageError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: challenge.img,
					alt: "تصویر کد امنیتی",
					onError: () => setImageError(true),
					className: cn("h-14 w-56 max-w-full rounded-lg border object-contain", appearance === "glass" ? "border-white/20 bg-white/10" : "border-slate-200 bg-slate-100 dark:border-slate-700")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("flex h-14 w-56 max-w-full items-center justify-center rounded-lg border text-xs", appearance === "glass" ? "border-white/20 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800"),
					children: loadError || imageError ? "تصویر امنیتی بارگذاری نشد" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineLoader, { label: "در حال بارگذاری تصویر امنیتی..." })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onRefresh,
					"aria-label": "تولید تصویر امنیتی جدید",
					className: cn("inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors", appearance === "glass" ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : "border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), "تصویر جدید"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				...registration,
				id: registration.name,
				type: "text",
				inputMode: "text",
				autoComplete: "off",
				dir: "ltr",
				maxLength: 20,
				"aria-invalid": Boolean(error),
				className: cn("w-full rounded-lg border px-3 py-2 text-sm", appearance === "glass" ? "auth-glass-input text-white" : "border-slate-200 dark:border-slate-700 dark:bg-slate-800")
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-xs text-red-600",
				children: error
			}),
			loadError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-xs text-red-600",
				children: "دریافت CAPTCHA ناموفق بود. برای تلاش دوباره «تصویر جدید» را بزنید."
			})
		]
	});
};
// src/components/forms/PublicHoneypotField.tsx
var PublicHoneypotField = ({ registration }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	"aria-hidden": "true",
	className: "sr-only",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		htmlFor: registration.name,
		children: "این فیلد را خالی بگذارید"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...registration,
		id: registration.name,
		type: "text",
		tabIndex: -1,
		autoComplete: "off"
	})]
});
export { SelfHostedCaptcha as n, PublicHoneypotField as t };
