"use client";

import type { RaceCard, SeasonCost } from "@tomos/api";

interface Props {
  races: RaceCard[];
  seasonCost: SeasonCost | null;
}

export function CostTracker({ races, seasonCost }: Props) {
  const activeRaces = races.filter((r) => r.entryStatus !== "dropped");
  const totalProjected = (seasonCost?.totalPaid || 0) + (seasonCost?.totalEstimated || 0);

  return (
    <div className="space-y-4">
      {/* Season summary card */}
      {seasonCost && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">2026 Season Costs</h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">
                ${seasonCost.totalPaid.toFixed(0)}
              </p>
              <p className="text-[10px] text-gray-400">Paid</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">
                ${seasonCost.totalEstimated.toFixed(0)}
              </p>
              <p className="text-[10px] text-gray-400">Estimated</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                ${totalProjected.toFixed(0)}
              </p>
              <p className="text-[10px] text-gray-400">Projected</p>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            {Object.entries(seasonCost.byCategory)
              .filter(([, amount]) => amount > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 capitalize w-24">{category}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (amount / totalProjected) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 font-medium w-14 text-right">
                    ${amount.toFixed(0)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Per-race cost table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-700">Per-Race Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="text-left px-3 py-2 font-medium">Race</th>
                <th className="text-right px-2 py-2 font-medium">Entry</th>
                <th className="text-right px-2 py-2 font-medium">Accom</th>
                <th className="text-right px-2 py-2 font-medium">Travel</th>
                <th className="text-right px-3 py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {activeRaces.map((race) => (
                <tr key={race.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {race.isARace && <span className="text-[9px]">🏆</span>}
                      <span className="font-medium text-gray-700 truncate max-w-[120px]">
                        {race.shortName}
                      </span>
                      <span className="text-gray-400 shrink-0">
                        {race.dateDisplay.split(" ").slice(0, 2).join(" ")}
                      </span>
                    </div>
                  </td>
                  <td className="text-right px-2 py-2">
                    <CostCell amount={race.costs.entryFee.amount} paid={race.costs.entryFee.paid} />
                  </td>
                  <td className="text-right px-2 py-2">
                    <CostCell
                      amount={race.costs.accommodation.booked || race.costs.accommodation.estimated}
                      paid={!!race.costs.accommodation.booked}
                    />
                  </td>
                  <td className="text-right px-2 py-2">
                    <CostCell
                      amount={race.costs.travel.booked || race.costs.travel.estimated}
                      paid={!!race.costs.travel.booked}
                    />
                  </td>
                  <td className="text-right px-3 py-2 font-medium text-gray-900">
                    {race.costs.total > 0 ? `$${race.costs.total.toFixed(0)}` : "—"}
                  </td>
                </tr>
              ))}

              {/* Total row */}
              <tr className="border-t-2 border-gray-200 bg-gray-50 font-medium">
                <td className="px-3 py-2 text-gray-700">Total</td>
                <td className="text-right px-2 py-2 text-gray-700">
                  ${seasonCost?.byCategory.entries.toFixed(0) || "0"}
                </td>
                <td className="text-right px-2 py-2 text-gray-700">
                  ${seasonCost?.byCategory.accommodation.toFixed(0) || "0"}
                </td>
                <td className="text-right px-2 py-2 text-gray-700">
                  ${seasonCost?.byCategory.travel.toFixed(0) || "0"}
                </td>
                <td className="text-right px-3 py-2 text-gray-900">
                  ${totalProjected.toFixed(0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CostCell({ amount, paid }: { amount: number | null; paid: boolean }) {
  if (!amount) return <span className="text-gray-300">—</span>;
  return (
    <span className={paid ? "text-green-600" : "text-amber-600"}>
      ${amount.toFixed(0)}
    </span>
  );
}
