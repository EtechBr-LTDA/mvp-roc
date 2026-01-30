(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/admin/app/components/DataTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DataTable",
    ()=>DataTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$phosphor$2d$icons$2f$react$2f$dist$2f$csr$2f$MagnifyingGlass$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/@phosphor-icons/react/dist/csr/MagnifyingGlass.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$phosphor$2d$icons$2f$react$2f$dist$2f$csr$2f$CaretLeft$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/@phosphor-icons/react/dist/csr/CaretLeft.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$phosphor$2d$icons$2f$react$2f$dist$2f$csr$2f$CaretRight$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/@phosphor-icons/react/dist/csr/CaretRight.es.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function DataTable({ columns, data, pagination, isLoading = false, emptyMessage = "Nenhum registro encontrado.", onSearch }) {
    _s();
    const [searchValue, setSearchValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const handleSearchChange = (e)=>{
        const value = e.target.value;
        setSearchValue(value);
        onSearch?.(value);
    };
    // Loading skeleton
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-xl shadow-soft overflow-hidden",
            children: [
                onSearch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 border-b border-[var(--color-border)]",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-10 w-72 bg-slate-100 rounded-lg animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/admin/app/components/DataTable.tsx",
                        lineNumber: 50,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/admin/app/components/DataTable.tsx",
                    lineNumber: 49,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-x-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-b border-[var(--color-border)] bg-slate-50",
                                    children: columns.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider",
                                            children: col.label
                                        }, col.key, false, {
                                            fileName: "[project]/admin/app/components/DataTable.tsx",
                                            lineNumber: 60,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/admin/app/components/DataTable.tsx",
                                    lineNumber: 58,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/admin/app/components/DataTable.tsx",
                                lineNumber: 57,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: Array.from({
                                    length: 5
                                }).map((_, rowIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-b border-[var(--color-border)]",
                                        children: columns.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-4 bg-slate-100 rounded animate-pulse w-3/4"
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/app/components/DataTable.tsx",
                                                    lineNumber: 77,
                                                    columnNumber: 23
                                                }, this)
                                            }, col.key, false, {
                                                fileName: "[project]/admin/app/components/DataTable.tsx",
                                                lineNumber: 76,
                                                columnNumber: 21
                                            }, this))
                                    }, rowIdx, false, {
                                        fileName: "[project]/admin/app/components/DataTable.tsx",
                                        lineNumber: 71,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/admin/app/components/DataTable.tsx",
                                lineNumber: 69,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/app/components/DataTable.tsx",
                        lineNumber: 56,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/admin/app/components/DataTable.tsx",
                    lineNumber: 55,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/admin/app/components/DataTable.tsx",
            lineNumber: 46,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-xl shadow-soft overflow-hidden",
        children: [
            onSearch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-[var(--color-border)]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative w-full max-w-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$phosphor$2d$icons$2f$react$2f$dist$2f$csr$2f$MagnifyingGlass$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MagnifyingGlass"], {
                            size: 18,
                            className: "absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]"
                        }, void 0, false, {
                            fileName: "[project]/admin/app/components/DataTable.tsx",
                            lineNumber: 95,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Buscar...",
                            value: searchValue,
                            onChange: handleSearchChange,
                            className: "w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-dark)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 focus:border-[var(--color-roc-primary)] transition-colors"
                        }, void 0, false, {
                            fileName: "[project]/admin/app/components/DataTable.tsx",
                            lineNumber: 99,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/app/components/DataTable.tsx",
                    lineNumber: 94,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/app/components/DataTable.tsx",
                lineNumber: 93,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                className: "border-b border-[var(--color-border)] bg-slate-50",
                                children: columns.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider",
                                        children: col.label
                                    }, col.key, false, {
                                        fileName: "[project]/admin/app/components/DataTable.tsx",
                                        lineNumber: 119,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/admin/app/components/DataTable.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/admin/app/components/DataTable.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: data.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: columns.length,
                                    className: "px-4 py-12 text-center text-sm text-[var(--color-text-light)]",
                                    children: emptyMessage
                                }, void 0, false, {
                                    fileName: "[project]/admin/app/components/DataTable.tsx",
                                    lineNumber: 131,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/admin/app/components/DataTable.tsx",
                                lineNumber: 130,
                                columnNumber: 15
                            }, this) : data.map((row, rowIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors",
                                    children: columns.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-4 py-3 text-sm text-[var(--color-text-dark)] whitespace-nowrap",
                                            children: col.render ? col.render(row[col.key], row) : row[col.key] ?? "-"
                                        }, col.key, false, {
                                            fileName: "[project]/admin/app/components/DataTable.tsx",
                                            lineNumber: 145,
                                            columnNumber: 21
                                        }, this))
                                }, rowIdx, false, {
                                    fileName: "[project]/admin/app/components/DataTable.tsx",
                                    lineNumber: 140,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/admin/app/components/DataTable.tsx",
                            lineNumber: 128,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/app/components/DataTable.tsx",
                    lineNumber: 115,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/app/components/DataTable.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            pagination && pagination.totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>pagination.onPageChange(pagination.page - 1),
                        disabled: pagination.page <= 1,
                        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-text-medium)] hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$phosphor$2d$icons$2f$react$2f$dist$2f$csr$2f$CaretLeft$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CaretLeft"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/admin/app/components/DataTable.tsx",
                                lineNumber: 171,
                                columnNumber: 13
                            }, this),
                            "Previous"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/app/components/DataTable.tsx",
                        lineNumber: 164,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-[var(--color-text-medium)]",
                        children: [
                            "Pagina",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold text-[var(--color-text-dark)]",
                                children: pagination.page
                            }, void 0, false, {
                                fileName: "[project]/admin/app/components/DataTable.tsx",
                                lineNumber: 177,
                                columnNumber: 13
                            }, this),
                            " ",
                            "de",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold text-[var(--color-text-dark)]",
                                children: pagination.totalPages
                            }, void 0, false, {
                                fileName: "[project]/admin/app/components/DataTable.tsx",
                                lineNumber: 181,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/app/components/DataTable.tsx",
                        lineNumber: 175,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>pagination.onPageChange(pagination.page + 1),
                        disabled: pagination.page >= pagination.totalPages,
                        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-text-medium)] hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                        children: [
                            "Next",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$phosphor$2d$icons$2f$react$2f$dist$2f$csr$2f$CaretRight$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CaretRight"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/admin/app/components/DataTable.tsx",
                                lineNumber: 194,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/app/components/DataTable.tsx",
                        lineNumber: 186,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/app/components/DataTable.tsx",
                lineNumber: 163,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/app/components/DataTable.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
_s(DataTable, "F12Wsjogj0HVecr0VGWn/MCEg+A=");
_c = DataTable;
var _c;
__turbopack_context__.k.register(_c, "DataTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/app/components/StatusBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusBadge",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function getStatusStyle(status, type) {
    const normalized = status.toLowerCase();
    // Green: active, available, ativo
    if ([
        "active",
        "available",
        "ativo",
        "ativa"
    ].includes(normalized)) {
        return {
            bg: "bg-green-100",
            text: "text-green-700",
            label: status
        };
    }
    // Blue: used, utilizado
    if ([
        "used",
        "utilizado",
        "validated"
    ].includes(normalized)) {
        return {
            bg: "bg-blue-100",
            text: "text-blue-700",
            label: status
        };
    }
    // Red: suspended, suspenso, cancelled
    if ([
        "suspended",
        "suspenso",
        "suspensa",
        "cancelled",
        "cancelado"
    ].includes(normalized)) {
        return {
            bg: "bg-red-100",
            text: "text-red-700",
            label: status
        };
    }
    // Yellow/amber: pending, pendente
    if ([
        "pending",
        "pendente"
    ].includes(normalized)) {
        return {
            bg: "bg-amber-100",
            text: "text-amber-700",
            label: status
        };
    }
    // Gray: inactive, expired, inativo, expirado
    if ([
        "inactive",
        "expired",
        "inativo",
        "inativa",
        "expirado",
        "expirada"
    ].includes(normalized)) {
        return {
            bg: "bg-gray-100",
            text: "text-gray-600",
            label: status
        };
    }
    // Default gray
    return {
        bg: "bg-gray-100",
        text: "text-gray-600",
        label: status
    };
}
function StatusBadge({ status, type }) {
    const style = getStatusStyle(status, type);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${style.bg} ${style.text}`,
        children: style.label
    }, void 0, false, {
        fileName: "[project]/admin/app/components/StatusBadge.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c = StatusBadge;
var _c;
__turbopack_context__.k.register(_c, "StatusBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/app/components/ConfirmDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfirmDialog",
    ()=>ConfirmDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
"use client";
;
;
function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirmar", variant = "primary" }) {
    const confirmButtonClass = variant === "danger" ? "bg-[var(--color-roc-danger)] hover:bg-red-700 text-white" : "bg-[var(--color-roc-primary)] hover:bg-[var(--color-roc-primary-dark)] text-white";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-50 flex items-center justify-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    transition: {
                        duration: 0.2
                    },
                    className: "absolute inset-0 bg-black/50",
                    onClick: onClose
                }, void 0, false, {
                    fileName: "[project]/admin/app/components/ConfirmDialog.tsx",
                    lineNumber: 34,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        scale: 0.95,
                        y: 10
                    },
                    animate: {
                        opacity: 1,
                        scale: 1,
                        y: 0
                    },
                    exit: {
                        opacity: 0,
                        scale: 0.95,
                        y: 10
                    },
                    transition: {
                        duration: 0.2,
                        ease: "easeOut"
                    },
                    className: "relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-medium p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold text-[var(--color-text-dark)]",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/admin/app/components/ConfirmDialog.tsx",
                            lineNumber: 52,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 text-sm text-[var(--color-text-medium)] leading-relaxed",
                            children: message
                        }, void 0, false, {
                            fileName: "[project]/admin/app/components/ConfirmDialog.tsx",
                            lineNumber: 57,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 flex items-center justify-end gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-medium)] bg-gray-100 hover:bg-gray-200 transition-colors duration-150",
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/admin/app/components/ConfirmDialog.tsx",
                                    lineNumber: 63,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        onConfirm();
                                        onClose();
                                    },
                                    className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                  ${confirmButtonClass}`,
                                    children: confirmLabel
                                }, void 0, false, {
                                    fileName: "[project]/admin/app/components/ConfirmDialog.tsx",
                                    lineNumber: 72,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/app/components/ConfirmDialog.tsx",
                            lineNumber: 62,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/app/components/ConfirmDialog.tsx",
                    lineNumber: 44,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/admin/app/components/ConfirmDialog.tsx",
            lineNumber: 32,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/app/components/ConfirmDialog.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c = ConfirmDialog;
var _c;
__turbopack_context__.k.register(_c, "ConfirmDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/app/dashboard/restaurants/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RestaurantsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$phosphor$2d$icons$2f$react$2f$dist$2f$csr$2f$Plus$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/@phosphor-icons/react/dist/csr/Plus.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/app/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$app$2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/app/components/DataTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$app$2f$components$2f$StatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/app/components/StatusBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$app$2f$components$2f$ConfirmDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/app/components/ConfirmDialog.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
function RestaurantsPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [restaurants, setRestaurants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [totalPages, setTotalPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [activeFilter, setActiveFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmRestaurant, setConfirmRestaurant] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchRestaurants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RestaurantsPage.useCallback[fetchRestaurants]": async ()=>{
            setLoading(true);
            try {
                const params = {
                    page
                };
                if (search) params.search = search;
                if (activeFilter !== "all") params.active = activeFilter;
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["adminApi"].getRestaurants(params);
                setRestaurants(res.data);
                setTotalPages(res.totalPages);
            } catch (err) {
                console.error("Erro ao buscar restaurantes:", err);
            } finally{
                setLoading(false);
            }
        }
    }["RestaurantsPage.useCallback[fetchRestaurants]"], [
        page,
        search,
        activeFilter
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RestaurantsPage.useEffect": ()=>{
            fetchRestaurants();
        }
    }["RestaurantsPage.useEffect"], [
        fetchRestaurants
    ]);
    const handleSearch = (term)=>{
        setSearch(term);
        setPage(1);
    };
    const handleActiveFilterChange = (value)=>{
        setActiveFilter(value);
        setPage(1);
    };
    const handleToggleActive = (restaurant)=>{
        setConfirmRestaurant(restaurant);
        setConfirmOpen(true);
    };
    const confirmToggleActive = async ()=>{
        if (!confirmRestaurant) return;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$app$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["adminApi"].toggleRestaurant(confirmRestaurant.id);
            fetchRestaurants();
        } catch (err) {
            console.error("Erro ao alterar status do restaurante:", err);
        }
    };
    const columns = [
        {
            key: "id",
            label: "ID"
        },
        {
            key: "name",
            label: "Nome"
        },
        {
            key: "city",
            label: "Cidade"
        },
        {
            key: "category",
            label: "Categoria",
            render: (value)=>value || "—"
        },
        {
            key: "discount_label",
            label: "Desconto"
        },
        {
            key: "active",
            label: "Status",
            render: (value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$app$2f$components$2f$StatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatusBadge"], {
                    status: value ? "Ativo" : "Inativo",
                    type: "restaurant"
                }, void 0, false, {
                    fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                    lineNumber: 96,
                    columnNumber: 9
                }, this)
        },
        {
            key: "actions",
            label: "Acoes",
            render: (_, row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: `/dashboard/restaurants/${row.id}/edit`,
                            className: "px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-roc-primary)] bg-blue-50 hover:bg-blue-100 transition-colors",
                            children: "Editar"
                        }, void 0, false, {
                            fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>handleToggleActive(row),
                            className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${row.active ? "text-red-700 bg-red-50 hover:bg-red-100" : "text-green-700 bg-green-50 hover:bg-green-100"}`,
                            children: row.active ? "Desativar" : "Ativar"
                        }, void 0, false, {
                            fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this)
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold text-[var(--color-text-dark)]",
                        children: "Restaurantes"
                    }, void 0, false, {
                        fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/dashboard/restaurants/new",
                        className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--color-roc-primary)] hover:bg-[var(--color-roc-primary-dark)] transition-colors shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f40$phosphor$2d$icons$2f$react$2f$dist$2f$csr$2f$Plus$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plus"], {
                                size: 18,
                                weight: "bold"
                            }, void 0, false, {
                                fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this),
                            "Novo Restaurante"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                lineNumber: 132,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row gap-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                    value: activeFilter,
                    onChange: (e)=>handleActiveFilterChange(e.target.value),
                    className: "px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-dark)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 focus:border-[var(--color-roc-primary)] transition-colors",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: "all",
                            children: "Todos os status"
                        }, void 0, false, {
                            fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                            lineNumber: 157,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: "active",
                            children: "Ativos"
                        }, void 0, false, {
                            fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                            lineNumber: 158,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: "inactive",
                            children: "Inativos"
                        }, void 0, false, {
                            fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                            lineNumber: 159,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                    lineNumber: 149,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$app$2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataTable"], {
                columns: columns,
                data: restaurants,
                isLoading: loading,
                emptyMessage: "Nenhum restaurante encontrado.",
                onSearch: handleSearch,
                pagination: {
                    page,
                    totalPages,
                    onPageChange: setPage
                }
            }, void 0, false, {
                fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$app$2f$components$2f$ConfirmDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConfirmDialog"], {
                open: confirmOpen,
                onClose: ()=>{
                    setConfirmOpen(false);
                    setConfirmRestaurant(null);
                },
                onConfirm: confirmToggleActive,
                title: confirmRestaurant?.active ? "Desativar Restaurante" : "Ativar Restaurante",
                message: confirmRestaurant?.active ? `Deseja desativar o restaurante "${confirmRestaurant?.name}"? Ele nao aparecera mais para os usuarios.` : `Deseja ativar o restaurante "${confirmRestaurant?.name}"?`,
                confirmLabel: confirmRestaurant?.active ? "Desativar" : "Ativar",
                variant: confirmRestaurant?.active ? "danger" : "primary"
            }, void 0, false, {
                fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/app/dashboard/restaurants/page.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
}
_s(RestaurantsPage, "WDukxxiFsZyMovC1uLXBMmA1jTc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = RestaurantsPage;
var _c;
__turbopack_context__.k.register(_c, "RestaurantsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=admin_app_516391bc._.js.map