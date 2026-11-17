import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as DataTable } from "./DataTable-CJgvJLS4.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
import { t as ConfirmDialog } from "./ConfirmDialog-5fpwSoSk.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
// src/pages/admin/MessagesRfqAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var MessagesRfqAdminPage = () => {
	const { addToast, user } = useAppStore();
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const [selectedTicketId, setSelectedTicketId] = (0, import_react.useState)(null);
	const [ticket, setTicket] = (0, import_react.useState)(null);
	const [ticketReply, setTicketReply] = (0, import_react.useState)("");
	const [assigneeIdText, setAssigneeIdText] = (0, import_react.useState)("");
	const [internalReply, setInternalReply] = (0, import_react.useState)(false);
	const canManageMessages = Boolean(user?.permissions.includes("messages.manage"));
	const load = async (targetPage = page) => {
		try {
			const response = await apiRequest(`/admin/messages?page=${targetPage}&per_page=8`);
			if (targetPage > response.meta.last_page) {
				setPage(Math.max(1, response.meta.last_page));
				return;
			}
			setMessages(response.data);
			setLastPage(response.meta.last_page);
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "بارگذاری پیام‌ها ناموفق بود.");
		}
	};
	(0, import_react.useEffect)(() => {
		load(page);
	}, [page]);
	(0, import_react.useEffect)(() => {
		if (selectedTicketId === null) {
			setTicket(null);
			return;
		}
		apiRequest(`/admin/tickets/${selectedTicketId}`).then((response) => {
			setTicket(response.data);
			setAssigneeIdText(response.data.assignee_id?.toString() ?? "");
		}).catch((error) => addToast("error", error instanceof Error ? error.message : "دریافت گفتگو ناموفق بود."));
	}, [selectedTicketId, addToast]);
	const updateTicket = async (data) => {
		if (!ticket) return;
		try {
			const response = await apiRequest(`/admin/tickets/${ticket.id}`, {
				method: "PUT",
				body: JSON.stringify(data)
			});
			setTicket((current) => current ? {
				...current,
				...response.data
			} : current);
			addToast("success", "تنظیمات تیکت بروزرسانی شد.");
			await load();
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "بروزرسانی تیکت ناموفق بود.");
		}
	};
	const sendTicketReply = async () => {
		if (!ticket || !ticketReply.trim()) return;
		try {
			await apiRequest(`/admin/tickets/${ticket.id}/messages`, {
				method: "POST",
				body: JSON.stringify({
					message: ticketReply,
					is_internal: internalReply
				})
			});
			setTicketReply("");
			const response = await apiRequest(`/admin/tickets/${ticket.id}`);
			setTicket(response.data);
			addToast("success", internalReply ? "یادداشت داخلی ثبت شد." : "پاسخ به مشتری ارسال شد.");
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "ارسال پاسخ تیکت ناموفق بود.");
		}
	};
	const cols = [
		{
			key: "sender",
			header: "فرستنده و شرکت",
			render: (m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-bold",
				children: m.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-slate-500",
				children: [
					m.company || m.email,
					" · ",
					m.phone
				]
			})] })
		},
		{
			key: "subject",
			header: "موضوع و شرح",
			render: (m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-semibold text-xs text-(--theme-primary)",
					children: [
						m.type.toUpperCase(),
						" · ",
						m.subject
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-slate-600 dark:text-slate-300",
					children: m.message
				})]
			})
		},
		{
			key: "status",
			header: "وضعیت پیگیری",
			render: (m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-36",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
					options: [
						{
							value: "new",
							label: "جدید"
						},
						{
							value: "reviewed",
							label: "بررسی‌شده"
						},
						{
							value: "replied",
							label: "پاسخ‌داده‌شده"
						}
					],
					value: m.status,
					onChange: async (val) => {
						try {
							await apiRequest(`/admin/messages/${m.id}`, {
								method: "PUT",
								body: JSON.stringify({ status: val })
							});
							addToast("success", "وضعیت پیام بروزرسانی شد.");
							await load();
						} catch (error) {
							addToast("error", error instanceof Error ? error.message : "بروزرسانی پیام ناموفق بود.");
						}
					}
				})
			})
		},
		{
			key: "ticket",
			header: "پیگیری تیکت",
			render: (message) => message.type === "ticket" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-mono text-[11px]",
					children: message.tracking_number
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSelectedTicketId(message.id),
					className: "text-xs font-semibold text-(--theme-primary) hover:underline",
					children: "مشاهده گفتگو"
				})]
			}) : null
		},
		{
			key: "actions",
			header: "عملیات",
			render: (message) => canManageMessages ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setDeleteTarget(message),
				"aria-label": "حذف پیام",
				className: "rounded p-1.5 text-red-600 hover:bg-red-50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
			}) : null
		}
	];
	const removeMessage = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await apiRequest(`/admin/messages/${deleteTarget.id}`, { method: "DELETE" });
			setDeleteTarget(null);
			addToast("success", "پیام به‌صورت نرم حذف شد.");
			await load();
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف پیام ناموفق بود.");
		} finally {
			setDeleting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-extrabold",
				children: "مدیریت پیام‌های تماس، استعلام‌های RFQ و تیکت‌ها"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				data: messages,
				columns: cols,
				pageSize: 8,
				searchKeys: [
					(m) => m.name,
					(m) => m.subject,
					(m) => m.company || ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				lastPage,
				onChange: setPage
			}),
			ticket && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-bold",
							children: ticket.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-slate-500",
							children: [
								ticket.tracking_number,
								" · ",
								ticket.name,
								" · ",
								ticket.email,
								" · ",
								ticket.phone
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSelectedTicketId(null),
							className: "text-xs text-slate-500 hover:underline",
							children: "بستن"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: ticket.ticket_status ?? "open",
								onChange: (event) => updateTicket({ ticket_status: event.target.value }),
								disabled: !canManageMessages,
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "open",
										children: "باز"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "in_progress",
										children: "در حال بررسی"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "waiting_customer",
										children: "منتظر مشتری"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "resolved",
										children: "حل‌شده"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "closed",
										children: "بسته"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: ticket.priority ?? "normal",
								onChange: (event) => updateTicket({ priority: event.target.value }),
								disabled: !canManageMessages,
								className: "rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "low",
										children: "کم"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "normal",
										children: "عادی"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "high",
										children: "زیاد"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "urgent",
										children: "فوری"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: "1",
									value: assigneeIdText,
									disabled: !canManageMessages,
									onChange: (event) => setAssigneeIdText(event.target.value),
									placeholder: "شناسه مسئول",
									className: "min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: !canManageMessages,
									onClick: () => updateTicket({ assignee_id: assigneeIdText ? Number(assigneeIdText) : null }),
									className: "rounded-lg border border-slate-200 px-3 py-2 text-xs disabled:opacity-50 dark:border-slate-700",
									children: "ثبت مسئول"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-80 space-y-3 overflow-auto",
						children: ticket.ticket_messages?.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: `rounded-lg p-3 text-sm ${message.is_internal ? "bg-amber-50 dark:bg-amber-950/30" : "bg-slate-50 dark:bg-slate-800"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex justify-between text-xs text-slate-500",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [message.author_name, message.is_internal ? " · داخلی" : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", { children: new Date(message.created_at).toLocaleString("fa-IR") })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "whitespace-pre-wrap",
								children: message.body
							})]
						}, message.id))
					}),
					canManageMessages && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: ticketReply,
								onChange: (event) => setTicketReply(event.target.value),
								rows: 3,
								placeholder: "پاسخ یا یادداشت داخلی",
								className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: internalReply,
									onChange: (event) => setInternalReply(event.target.checked)
								}), "یادداشت داخلی (برای مشتری نمایش داده نشود)"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: sendTicketReply,
								disabled: !ticketReply.trim(),
								className: "rounded-lg bg-(--theme-primary) px-4 py-2 text-xs font-semibold text-white disabled:opacity-50",
								children: "ثبت پاسخ"
							})
						]
					}),
					ticket.ticket_history?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "cursor-pointer font-semibold",
							children: "تاریخچه تغییرات"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-1 text-slate-500",
							children: ticket.ticket_history.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								event.action,
								" · ",
								new Date(event.created_at).toLocaleString("fa-IR")
							] }, event.id))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(deleteTarget),
				onClose: () => setDeleteTarget(null),
				onConfirm: removeMessage,
				loading: deleting,
				message: "این پیام به‌صورت نرم حذف می‌شود و از فهرست خارج خواهد شد. ادامه می‌دهید؟"
			})
		]
	});
};
export { MessagesRfqAdminPage };
