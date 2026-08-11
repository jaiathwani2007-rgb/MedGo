import { getCatalog } from '@/app/actions/catalog'
import { Search, AlertCircle, ShoppingCart } from 'lucide-react'

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''
  const medicines = await getCatalog(query)

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 text-white p-6 pb-10 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">MedGo Catalog</h1>
        <form className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-blue-300" />
          </div>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name, generic, or brand..."
            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-blue-700/50 text-white placeholder-blue-200 focus:ring-2 focus:ring-white transition-shadow"
          />
        </form>
      </div>

      <div className="px-4 -mt-4">
        {medicines.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">No medicines found matching "{query}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((med) => (
              <div key={med.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{med.name}</h3>
                  {med.requires_prescription && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2 py-1 rounded-md border border-amber-200">
                      <AlertCircle className="w-3 h-3" /> Rx Req.
                    </span>
                  )}
                </div>
                
                {(med.generic_name || med.brand_name) && (
                  <p className="text-sm text-gray-500 mb-4">
                    {med.generic_name} {med.brand_name && `(${med.brand_name})`}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="text-lg font-bold text-gray-900">₹{med.price.toFixed(2)}</div>
                  {med.stock > 0 ? (
                    <button className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl font-medium transition-colors">
                      <ShoppingCart className="w-4 h-4" /> Add
                    </button>
                  ) : (
                    <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
