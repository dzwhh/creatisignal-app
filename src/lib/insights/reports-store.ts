"use client"

import { useSyncExternalStore } from "react"

export type ReportItem = {
  id: string
  name: string
  description?: string
  template?: string
  platform?: string
  folderId?: string  // null/undefined = root
  createdAt: string
}

export type ReportFolder = {
  id: string
  name: string
  createdAt: string
}

type ReportsState = {
  folders: ReportFolder[]
  reports: ReportItem[]
}

// ─── Initial seed (1 root folder) ──────────────────────────────────────────
let state: ReportsState = {
  folders: [
    { id: "folder_default", name: "默认", createdAt: new Date().toISOString() },
  ],
  reports: [],
}

const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot(): ReportsState {
  return state
}

// ─── Public API ────────────────────────────────────────────────────────────

export function addReport(report: Omit<ReportItem, "id" | "createdAt"> & Partial<Pick<ReportItem, "id" | "createdAt">>): ReportItem {
  const now = Date.now()
  const item: ReportItem = {
    id: report.id ?? `report_${now.toString(36)}`,
    name: report.name,
    description: report.description,
    template: report.template,
    platform: report.platform,
    folderId: report.folderId,
    createdAt: report.createdAt ?? new Date().toISOString(),
  }
  state = { ...state, reports: [item, ...state.reports] }
  emit()
  return item
}

export function addFolder(name: string): ReportFolder {
  const item: ReportFolder = {
    id: `folder_${Date.now().toString(36)}`,
    name,
    createdAt: new Date().toISOString(),
  }
  state = { ...state, folders: [...state.folders, item] }
  emit()
  return item
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useReportsStore() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return {
    folders: snap.folders,
    reports: snap.reports,
    addReport,
    addFolder,
  }
}
