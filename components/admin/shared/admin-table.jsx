'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Reusable Admin Table Component
 * Handles sorting, filtering, pagination consistently
 */

export function AdminTable({
  columns = [],
  data = [],
  onSort = null,
  onRowClick = null,
  renderActions = null,
  sortable = true,
  emptyMessage = 'No data found',
  rowActions = null, // Additional actions for each row
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [expandedRow, setExpandedRow] = useState(null)

  const handleSort = (key) => {
    if (!sortable) return

    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }

    setSortConfig({ key, direction })
    onSort?.(key, direction)
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key || !sortable) return null
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />
  }

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-sm font-medium text-muted-foreground text-left",
                    sortable && column.sortable !== false && "cursor-pointer hover:bg-secondary/70 transition-colors"
                  )}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {renderActions && (
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <>
                  <tr
                    key={row.id || index}
                    className={cn(
                      "hover:bg-secondary/30 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => handleRowClick(row)}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                    {renderActions && (
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {renderActions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                  {rowActions && expandedRow === row.id && (
                    <tr key={`expanded-${row.id}`}>
                      <td
                        colSpan={columns.length + (renderActions ? 1 : 0)}
                        className="px-4 py-4 bg-secondary/20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {rowActions(row)}
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
