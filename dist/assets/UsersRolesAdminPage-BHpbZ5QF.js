import { l as require_react, m as __toESM, o as useAppStore, s as apiRequest, t as require_jsx_runtime } from "./jsx-runtime-Bazq1AqI.js";
import { t as Pencil } from "./pencil-DgFD3KzF.js";
import { t as Plus } from "./plus-DOUCSCbs.js";
import { P as Shield, k as Modal } from "./index-Dacn8Sc3.js";
import { t as Trash2 } from "./trash-2-uk0pNdI5.js";
import { t as DataTable } from "./DataTable-CJgvJLS4.js";
import { t as Pagination } from "./Pagination-Cy7ez7lz.js";
import { a as object, n as array, o as string } from "./schemas-HxyU5SsU.js";
import { t as SearchableSelect } from "./SearchableSelect-BCBuOYhg.js";
// src/pages/admin/UsersRolesAdminPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var emptyUser = {
	name: "",
	email: "",
	phone: "",
	role: "",
	password: ""
};
var emptyRole = {
	name: "",
	label_fa: "",
	label_en: "",
	permissions: []
};
var systemRoles = [
	"super-admin",
	"admin",
	"editor",
	"project_manager",
	"client",
	"content-manager",
	"operator",
	"user"
];
var userFormSchema = object({
	name: string().trim().min(1, "نام کاربر الزامی است.").max(120),
	email: string().trim().email("ایمیل معتبر وارد کنید.").max(255),
	phone: string().max(30),
	role: string().min(1, "نقش کاربر را انتخاب کنید."),
	password: string().refine((value) => value === "" || value.length >= 8, "رمز عبور باید حداقل ۸ نویسه باشد.")
});
var roleFormSchema = object({
	name: string().regex(/^[a-z][a-z0-9_-]{1,63}$/, "شناسه نقش باید با حرف کوچک شروع شود و فقط حروف کوچک، عدد، خط تیره یا زیرخط داشته باشد."),
	label_fa: string().trim().min(1, "نام فارسی نقش الزامی است.").max(120),
	label_en: string().trim().min(1, "نام انگلیسی نقش الزامی است.").max(120),
	permissions: array(string())
});
var UsersRolesAdminPage = () => {
	const { addToast } = useAppStore();
	const [users, setUsers] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [lastPage, setLastPage] = (0, import_react.useState)(1);
	const [roles, setRoles] = (0, import_react.useState)([]);
	const [permissions, setPermissions] = (0, import_react.useState)([]);
	const [userModalOpen, setUserModalOpen] = (0, import_react.useState)(false);
	const [roleModalOpen, setRoleModalOpen] = (0, import_react.useState)(false);
	const [editingUser, setEditingUser] = (0, import_react.useState)(null);
	const [editingRole, setEditingRole] = (0, import_react.useState)(null);
	const [userForm, setUserForm] = (0, import_react.useState)(emptyUser);
	const [roleForm, setRoleForm] = (0, import_react.useState)(emptyRole);
	const load = async (targetPage = page) => {
		try {
			const response = await apiRequest(`/admin/users?page=${targetPage}&per_page=8`);
			if (targetPage > response.users_meta.last_page) {
				setPage(Math.max(1, response.users_meta.last_page));
				return;
			}
			setUsers(response.users);
			setLastPage(response.users_meta.last_page);
			setRoles(response.roles);
			setPermissions(response.permissions);
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "دریافت کاربران و نقش‌ها ناموفق بود.");
		}
	};
	(0, import_react.useEffect)(() => {
		load(page);
	}, [page]);
	const openNewUser = () => {
		setEditingUser(null);
		setUserForm({
			...emptyUser,
			role: roles.find((role) => role.name !== "super-admin")?.name ?? ""
		});
		setUserModalOpen(true);
	};
	const openEditUser = (user) => {
		setEditingUser(user);
		setUserForm({
			name: user.name,
			email: user.email,
			phone: user.phone ?? "",
			role: user.role,
			password: ""
		});
		setUserModalOpen(true);
	};
	const saveUser = async (event) => {
		event.preventDefault();
		const parsed = userFormSchema.safeParse(userForm);
		if (!parsed.success) {
			addToast("error", parsed.error.issues[0]?.message ?? "اطلاعات کاربر معتبر نیست.");
			return;
		}
		const body = {
			name: parsed.data.name,
			email: parsed.data.email,
			phone: parsed.data.phone,
			role: parsed.data.role
		};
		if (parsed.data.password) body.password = parsed.data.password;
		if (!editingUser && !body.password) {
			addToast("error", "برای کاربر جدید رمز عبور الزامی است.");
			return;
		}
		try {
			await apiRequest(editingUser ? `/admin/users/${editingUser.id}` : "/admin/users", {
				method: editingUser ? "PUT" : "POST",
				body: JSON.stringify(body)
			});
			setUserModalOpen(false);
			addToast("success", editingUser ? "اطلاعات کاربر بروزرسانی شد." : "کاربر جدید ایجاد شد.");
			await load();
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "ذخیره کاربر ناموفق بود.");
		}
	};
	const deleteUser = async (user) => {
		if (!window.confirm(`حساب «${user.name}» به‌صورت نرم حذف و نشست‌های فعال آن باطل شود؟`)) return;
		try {
			await apiRequest(`/admin/users/${user.id}`, { method: "DELETE" });
			addToast("success", "کاربر حذف شد و نشست‌های فعال او باطل شدند.");
			await load();
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف کاربر ناموفق بود.");
		}
	};
	const togglePermission = async (role, permission) => {
		if (role.name === "super-admin") return;
		const nextPermissions = role.permissions.includes(permission) ? role.permissions.filter((item) => item !== permission) : [...role.permissions, permission];
		try {
			await apiRequest(`/admin/roles/${role.id}`, {
				method: "PUT",
				body: JSON.stringify({ permissions: nextPermissions })
			});
			addToast("success", `دسترسی‌های نقش ${role.label_fa} بروزرسانی شد.`);
			await load();
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "بروزرسانی دسترسی ناموفق بود.");
		}
	};
	const saveRole = async (event) => {
		event.preventDefault();
		const parsed = roleFormSchema.safeParse(roleForm);
		if (!parsed.success) {
			addToast("error", parsed.error.issues[0]?.message ?? "اطلاعات نقش معتبر نیست.");
			return;
		}
		try {
			await apiRequest(editingRole ? `/admin/roles/${editingRole.id}` : "/admin/roles", {
				method: editingRole ? "PUT" : "POST",
				body: JSON.stringify(parsed.data)
			});
			setRoleModalOpen(false);
			setEditingRole(null);
			setRoleForm(emptyRole);
			addToast("success", editingRole ? "نقش بروزرسانی شد." : "نقش جدید ایجاد شد.");
			await load();
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "ایجاد نقش ناموفق بود.");
		}
	};
	const deleteRole = async (role) => {
		if (!window.confirm(`نقش «${role.label_fa}» حذف شود؟`)) return;
		try {
			await apiRequest(`/admin/roles/${role.id}`, { method: "DELETE" });
			addToast("success", "نقش حذف شد.");
			await load();
		} catch (error) {
			addToast("error", error instanceof Error ? error.message : "حذف نقش ناموفق بود.");
		}
	};
	const openEditRole = (role) => {
		setEditingRole(role);
		setRoleForm({
			name: role.name,
			label_fa: role.label_fa,
			label_en: role.label_en,
			permissions: role.permissions.filter((permission) => permission !== "*")
		});
		setRoleModalOpen(true);
	};
	const openNewRole = () => {
		setEditingRole(null);
		setRoleForm(emptyRole);
		setRoleModalOpen(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-lg font-extrabold",
							children: "مدیریت کاربران سامانه"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: openNewUser,
							style: { backgroundColor: "var(--theme-primary)" },
							className: "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "کاربر جدید" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
						data: users,
						columns: [
							{
								key: "name",
								header: "نام کاربر",
								render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold",
									children: user.name
								})
							},
							{
								key: "email",
								header: "ایمیل",
								render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									dir: "ltr",
									className: "text-xs",
									children: user.email
								})
							},
							{
								key: "role",
								header: "نقش کاربری",
								render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-44",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										disabled: user.role === "super-admin",
										options: roles.map((role) => ({
											value: role.name,
											label: role.label_fa
										})),
										value: user.role,
										onChange: async (role) => {
											try {
												await apiRequest(`/admin/users/${user.id}`, {
													method: "PUT",
													body: JSON.stringify({ role })
												});
												addToast("success", "نقش کاربر تغییر یافت.");
												await load();
											} catch (error) {
												addToast("error", error instanceof Error ? error.message : "تغییر نقش ناموفق بود.");
											}
										}
									})
								})
							},
							{
								key: "active",
								header: "وضعیت",
								render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: user.role === "super-admin",
									onClick: async () => {
										try {
											await apiRequest(`/admin/users/${user.id}`, {
												method: "PUT",
												body: JSON.stringify({ is_active: !user.is_active })
											});
											addToast("success", user.is_active ? "کاربر غیرفعال شد و نشست‌های او باطل شدند." : "کاربر فعال شد.");
											await load();
										} catch (error) {
											addToast("error", error instanceof Error ? error.message : "تغییر وضعیت کاربر ناموفق بود.");
										}
									},
									className: `text-xs font-semibold ${user.is_active ? "text-emerald-600" : "text-red-600"}`,
									children: user.is_active ? "فعال" : "غیرفعال"
								})
							},
							{
								key: "actions",
								header: "عملیات",
								render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: user.role === "super-admin",
										onClick: () => openEditUser(user),
										className: "rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800",
										"aria-label": "ویرایش کاربر",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: user.role === "super-admin",
										onClick: () => void deleteUser(user),
										className: "rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/30",
										"aria-label": "حذف کاربر",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})]
								})
							}
						],
						pageSize: 8,
						searchKeys: [(user) => user.name, (user) => user.email]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
						page,
						lastPage,
						onChange: setPage
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 text-base font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-5 w-5 text-(--theme-primary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ماتریس نقش‌ها و دسترسی‌ها (Permission Matrix)" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: openNewRole,
						className: "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "نقش جدید" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-slate-200 dark:border-slate-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2.5 text-start font-bold",
								children: "مجوز (Permission)"
							}), roles.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
								className: "min-w-28 px-3 py-2.5 text-center font-bold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: role.label_fa }),
									!systemRoles.includes(role.name) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => openEditRole(role),
										className: "ms-2 text-slate-500 hover:text-(--theme-primary)",
										"aria-label": `ویرایش نقش ${role.label_fa}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "inline h-3.5 w-3.5" })
									}),
									!systemRoles.includes(role.name) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void deleteRole(role),
										disabled: (role.users_count ?? 0) > 0,
										className: "ms-2 text-red-600 disabled:opacity-40",
										"aria-label": `حذف نقش ${role.label_fa}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "inline h-3.5 w-3.5" })
									})
								]
							}, role.id))]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: permissions.map((permission) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 font-mono text-slate-600 dark:text-slate-300",
								children: permission
							}), roles.map((role) => {
								const checked = role.permissions.includes("*") || role.permissions.includes(permission);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										disabled: role.name === "super-admin",
										checked,
										onChange: () => void togglePermission(role, permission),
										className: "h-4 w-4 accent-(--theme-primary)",
										"aria-label": `${permission} برای ${role.label_fa}`
									})
								}, role.id);
							})] }, permission))
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: userModalOpen,
				onClose: () => setUserModalOpen(false),
				title: editingUser ? "ویرایش کاربر" : "ایجاد کاربر جدید",
				size: "md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: saveUser,
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							maxLength: 120,
							placeholder: "نام و نام خانوادگی",
							value: userForm.name,
							onChange: (event) => setUserForm({
								...userForm,
								name: event.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							type: "email",
							dir: "ltr",
							placeholder: "email@company.ir",
							value: userForm.email,
							onChange: (event) => setUserForm({
								...userForm,
								email: event.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							dir: "ltr",
							maxLength: 30,
							placeholder: "شماره تماس",
							value: userForm.phone,
							onChange: (event) => setUserForm({
								...userForm,
								phone: event.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							label: "نقش",
							options: roles.map((role) => ({
								value: role.name,
								label: role.label_fa
							})),
							value: userForm.role,
							onChange: (role) => setUserForm({
								...userForm,
								role
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: !editingUser,
							minLength: 8,
							type: "password",
							dir: "ltr",
							autoComplete: "new-password",
							placeholder: editingUser ? "رمز عبور جدید (اختیاری)" : "رمز عبور (حداقل ۸ کاراکتر)",
							value: userForm.password,
							onChange: (event) => setUserForm({
								...userForm,
								password: event.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							style: { backgroundColor: "var(--theme-primary)" },
							className: "w-full rounded-lg py-2 text-xs font-semibold text-white",
							children: editingUser ? "ذخیره تغییرات" : "ایجاد کاربر"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: roleModalOpen,
				onClose: () => {
					setRoleModalOpen(false);
					setEditingRole(null);
					setRoleForm(emptyRole);
				},
				title: editingRole ? "ویرایش نقش" : "ایجاد نقش جدید",
				size: "md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: saveRole,
					className: "space-y-4",
					children: [
						!editingRole && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							pattern: "[a-z][a-z0-9_-]*",
							maxLength: 64,
							placeholder: "شناسه نقش مانند quality-reviewer",
							value: roleForm.name,
							onChange: (event) => setRoleForm({
								...roleForm,
								name: event.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							maxLength: 120,
							placeholder: "نام فارسی نقش",
							value: roleForm.label_fa,
							onChange: (event) => setRoleForm({
								...roleForm,
								label_fa: event.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							maxLength: 120,
							dir: "ltr",
							placeholder: "Role label (English)",
							value: roleForm.label_en,
							onChange: (event) => setRoleForm({
								...roleForm,
								label_en: event.target.value
							}),
							className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "max-h-56 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-700",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "px-1 text-xs font-semibold",
								children: "دسترسی‌های نقش"
							}), permissions.map((permission) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: roleForm.permissions.includes(permission),
									onChange: () => setRoleForm((current) => ({
										...current,
										permissions: current.permissions.includes(permission) ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission]
									})),
									className: "h-4 w-4 accent-(--theme-primary)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono",
									children: permission
								})]
							}, permission))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							style: { backgroundColor: "var(--theme-primary)" },
							className: "w-full rounded-lg py-2 text-xs font-semibold text-white",
							children: editingRole ? "ذخیره نقش" : "ایجاد نقش"
						})
					]
				})
			})
		]
	});
};
export { UsersRolesAdminPage };
