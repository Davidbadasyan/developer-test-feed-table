import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import isArray from 'lodash/isArray'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table'

const API_URL = '/api/developer/QueryFeed' // proxied via vite.config.js
const DEVELOPER_KEY = 'usearch-dev-2025'

const DEFAULT_PAGE_SIZE = 50
const PAGE_SIZE_OPTIONS = [25, 50, 100]

export default function FeedTable() {
  const [data, setData] = useState([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [error, setError] = useState('')
  const [totalRecords, setTotalRecords] = useState(undefined)
  const [totalPages, setTotalPages] = useState(undefined)

  const abortRef = useRef(null)

  const fetchPage = useCallback(async (page, size) => {
    setIsLoading(true)
    setError('')

    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'DeveloperKey': DEVELOPER_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageNumber: page,
          pageSize: size,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Request failed (${res.status}): ${text || res.statusText}`)
      }

      const json = await res.json()

      let rows = []
      if (isArray(json)) {
        rows = json
      } else if (isArray(json?.data)) {
        rows = json.data
      } else if (isArray(json?.items)) {
        rows = json.items
      } else {
        if (json && typeof json === 'object') {
          const possibleArray = Object.values(json).find(v => isArray(v))
          rows = isArray(possibleArray) ? possibleArray : []
        }
      }

      const totalRecs =
        json?.totalRecords ??
        json?.total ??
        json?.count ??
        json?.TotalRecords ??
        undefined

      const totalPgs =
        json?.totalPages ??
        json?.TotalPages ??
        (typeof totalRecs === 'number' ? Math.max(1, Math.ceil(totalRecs / size)) : undefined)

      setData(rows ?? [])
      setTotalRecords(typeof totalRecs === 'number' ? totalRecs : undefined)
      setTotalPages(typeof totalPgs === 'number' ? totalPgs : undefined)
    } catch (e) {
      if (e?.name !== 'AbortError') {
        setError(e?.message || 'Unknown error')
      }
    } finally {
      setIsLoading(false)
      setHasLoadedOnce(true)
    }
  }, [])

  useEffect(() => {
    fetchPage(pageNumber, pageSize)
  }, [fetchPage, pageNumber, pageSize])

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper()
    const first = data?.[0]
    if (!first || typeof first !== 'object') return []

    return Object.keys(first).map((key) =>
      columnHelper.accessor(row => row?.[key], {
        id: key,
        header: () => key,
        cell: info => {
          const value = info.getValue()
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') {
            try {
              return JSON.stringify(value)
            } catch {
              return String(value)
            }
          }
          return String(value)
        },
      })
    )
  }, [data])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const canGoPrev = pageNumber > 1
  const canGoNext = totalPages ? pageNumber < totalPages : data.length === pageSize

  const onFirst = () => canGoPrev && setPageNumber(1)
  const onPrev = () => canGoPrev && setPageNumber(p => Math.max(1, p - 1))
  const onNext = () => canGoNext && setPageNumber(p => p + 1)
  const onLast = () => { if (totalPages) setPageNumber(totalPages) }

  const onJump = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements['jumpPage']
    const raw = input.value.trim()
    if (!raw) return
    const num = Number(raw)
    if (Number.isNaN(num)) return

    if (totalPages) {
      const clamped = Math.min(Math.max(1, num), totalPages)
      setPageNumber(clamped)
    } else {
      setPageNumber(Math.max(1, num))
    }
  }

  const visibleRows = data?.length ?? 0
  const visibleCols = columns?.length ?? 0

  return (
    <div className="card">
      <div className="tableWrap">
        {(!hasLoadedOnce || isLoading) && (
          <div className="loadingOverlay" aria-live="polite" aria-busy="true">
            <div className="spinner" />
            <div className="loadingText">Loading…</div>
          </div>
        )}
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {(!hasLoadedOnce || isLoading) ? (
              <tr>
                <td colSpan={Math.max(1, visibleCols)} className="center">
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={Math.max(1, visibleCols)} className="error">
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={Math.max(1, visibleCols)} className="center">
                  No data
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="paginationBar">
        <div className="pager">
          <button onClick={onFirst} disabled={!canGoPrev} aria-label="First page">«</button>
          <button onClick={onPrev} disabled={!canGoPrev} aria-label="Previous page">‹</button>
          <button onClick={onNext} disabled={!canGoNext} aria-label="Next page">›</button>
          <button onClick={onLast} disabled={!totalPages || pageNumber === totalPages} aria-label="Last page">»</button>

          <span className="sep">|</span>
          <span className="pageInfo">Page <strong>{pageNumber}</strong>{totalPages ? <> of <strong>{totalPages}</strong></> : null}</span>

          <span className="sep">|</span>
          <form className="jumpForm" onSubmit={onJump}>
            <label htmlFor="jumpPage" className="srOnly">Go to page</label>
            <span>Go to page:</span>
            <input
              id="jumpPage"
              name="jumpPage"
              type="number"
              min={1}
              max={totalPages || undefined}
              inputMode="numeric"
            />
            <button type="submit">Go</button>
          </form>

          <span className="sep">|</span>
          <div className="pageSize">
            <span>Show</span>
            <label htmlFor="pageSize" className="srOnly">Rows per page</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                const next = Number(e.target.value)
                setPageSize(next)
                setPageNumber(1)
              }}
            >
              {PAGE_SIZE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {typeof totalRecords === 'number' && (
            <span className="sep">|</span>
          )}
          {typeof totalRecords === 'number' && (
            <span className="totalRows">{totalRecords.toLocaleString()} rows</span>
          )}
        </div>
      </div>
    </div>
  )
}
