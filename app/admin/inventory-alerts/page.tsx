import { prisma } from '@/lib/prisma'
import { AlertTriangle, Package } from 'lucide-react'
import AdjustStockForm from './AdjustStockForm'

function variantLabel(v: { color: string | null; length: string | null; texture: string | null; sku: string | null }) {
  const parts = [v.color, v.length, v.texture].filter(Boolean)
  const label = parts.join(' / ') || 'Default'
  return v.sku ? `${label} (${v.sku})` : label
}

export default async function InventoryAlertsPage() {
  const [lowStockVariants, recentLogs] = await Promise.all([
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: { select: { title: true, slug: true } } },
      orderBy: { stock: 'asc' },
    }),
    prisma.inventoryLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { variant: { include: { product: { select: { title: true } } } } },
    }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {lowStockVariants.length} variant{lowStockVariants.length !== 1 ? 's' : ''} at or below the low-stock threshold
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Low stock table */}
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Low Stock Alerts</h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F]">
                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-[#6B7280]">Product</th>
                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-[#6B7280]">Variant</th>
                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-[#6B7280]">Stock</th>
                  <th className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-[#6B7280]">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockVariants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-14 text-center text-sm text-[#555555]">
                      No low-stock variants. Everything looks healthy.
                    </td>
                  </tr>
                ) : (
                  lowStockVariants.map((v) => (
                    <tr key={v.id} className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors">
                      <td className="px-5 py-4 align-middle text-[#D1D5DB]">{v.product.title}</td>
                      <td className="px-5 py-4 align-middle text-[#D1D5DB]">{variantLabel(v)}</td>
                      <td className="px-5 py-4 align-middle">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            v.stock === 0
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {v.stock} in stock
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <AdjustStockForm variantId={v.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Package size={16} className="text-[#9CA3AF]" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Recent Activity</h2>
          </div>

          <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] divide-y divide-[#1A1A1A] max-h-[640px] overflow-y-auto">
            {recentLogs.length === 0 ? (
              <p className="px-5 py-14 text-center text-sm text-[#555555]">No inventory activity yet.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-white truncate">{log.variant.product.title}</p>
                    <span className={`text-xs font-semibold shrink-0 ${log.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {log.change >= 0 ? '+' : ''}{log.change}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">{log.reason.replace('_', ' ')}</p>
                  {log.note && <p className="text-xs text-[#6B7280] mt-0.5 truncate">{log.note}</p>}
                  <p className="text-[10px] text-[#4B5563] mt-1">
                    {log.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
