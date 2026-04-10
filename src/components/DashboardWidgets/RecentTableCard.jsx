import React from 'react';

export default function RecentTableCard({ title, columns, data, onActionClick }) {
  return (
    <div className="bg-white rounded-lg shadow-sm w-full overflow-hidden border border-gray-100">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-600 bg-gray-50 border-b border-gray-100 uppercase">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 font-medium tracking-wider">
                  {col.label}
                </th>
              ))}
              {onActionClick && <th className="px-6 py-3 text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
                data.map((row, idx) => (
                    <tr key={row.id || idx} className="bg-white border-b hover:bg-indigo-50/30 transition-colors">
                        {columns.map((col, cIdx) => (
                        <td key={cIdx} className="px-6 py-3 whitespace-nowrap text-gray-700">
                            {col.render ? col.render(row) : row[col.key]}
                        </td>
                        ))}
                        {onActionClick && (
                            <td className="px-6 py-3 text-center">
                                <button 
                                    onClick={() => onActionClick(row)}
                                    className="text-indigo-600 hover:text-indigo-900 font-medium text-xs px-3 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                >
                                    View
                                </button>
                            </td>
                        )}
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={columns.length + (onActionClick ? 1 : 0)} className="px-6 py-8 text-center text-gray-400">
                        No recent records found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
