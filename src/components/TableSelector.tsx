'use client'

import React, { useState, useEffect } from 'react'
import { Table } from '../lib/types'
import { cn } from '../lib/utils'

interface TableSelectorProps {
  tables: Table[]
  selectedTable: Table | null
  onTableSelect: (table: Table) => void
  bookedTables?: string[]
  guests: number
}

export function TableSelector({ 
  tables, 
  selectedTable, 
  onTableSelect, 
  bookedTables = [], 
  guests 
}: TableSelectorProps) {
  const [availableTables, setAvailableTables] = useState<Table[]>([])

  useEffect(() => {
    // Filter tables based on capacity and availability
    const filtered = tables.filter(table => 
      table.capacity >= guests && 
      table.status === 'available' && 
      !bookedTables.includes(table.id)
    )
    setAvailableTables(filtered)
  }, [tables, guests, bookedTables])

  const getTableStatusColor = (table: Table) => {
    if (bookedTables.includes(table.id)) return 'bg-red-200 text-red-800'
    if (table.status === 'occupied') return 'bg-red-200 text-red-800'
    if (table.status === 'reserved') return 'bg-yellow-200 text-yellow-800'
    if (table.capacity < guests) return 'bg-gray-200 text-gray-500'
    if (selectedTable?.id === table.id) return 'bg-blue-500 text-white'
    return 'bg-green-200 text-green-800 hover:bg-green-300'
  }

  const getTableShape = (shape: Table['shape']) => {
    switch (shape) {
      case 'round':
        return 'rounded-full'
      case 'square':
        return 'rounded-lg'
      case 'rectangle':
        return 'rounded-lg'
      default:
        return 'rounded-lg'
    }
  }

  const getTableSize = (capacity: number) => {
    if (capacity <= 2) return 'w-12 h-12'
    if (capacity <= 4) return 'w-16 h-16'
    if (capacity <= 6) return 'w-20 h-16'
    return 'w-24 h-20'
  }

  const isTableSelectable = (table: Table) => {
    return table.capacity >= guests && 
           table.status === 'available' && 
           !bookedTables.includes(table.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select a Table</h3>
        <p className="text-sm text-gray-600 mb-4">
          Showing tables for {guests} guest{guests !== 1 ? 's' : ''}
        </p>
      </div>

      {availableTables.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No available tables for {guests} guest{guests !== 1 ? 's' : ''} at this time.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Try a different time slot or adjust the number of guests.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-6 gap-4 max-w-md mx-auto">
            {tables.map((table) => (
              <div
                key={table.id}
                className="flex flex-col items-center"
                style={{
                  gridColumnStart: table.position.x,
                  gridRowStart: table.position.y
                }}
              >
                <button
                  onClick={() => isTableSelectable(table) && onTableSelect(table)}
                  disabled={!isTableSelectable(table)}
                  className={cn(
                    'flex items-center justify-center text-sm font-medium transition-colors border-2 border-transparent',
                    getTableSize(table.capacity),
                    getTableShape(table.shape),
                    getTableStatusColor(table),
                    isTableSelectable(table) && 'cursor-pointer border-dashed border-gray-300',
                    !isTableSelectable(table) && 'cursor-not-allowed opacity-75'
                  )}
                >
                  {table.number}
                </button>
                <span className="text-xs text-gray-500 mt-1">
                  {table.capacity} seats
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 rounded"></div>
              <span>Occupied/Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Too Small</span>
            </div>
          </div>
        </div>
      )}

      {selectedTable && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900">Selected Table</h4>
          <p className="text-sm text-blue-700">
            Table {selectedTable.number} - Capacity: {selectedTable.capacity} guests
          </p>
        </div>
      )}
    </div>
  )
}