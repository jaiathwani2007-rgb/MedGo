import { getCatalog, addMedicine, updateMedicine } from '@/app/actions/catalog'
import { SubmitButton } from '@/components/SubmitButton'
import { Plus, Check } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''
  const medicines = await getCatalog(query)

  async function handleAdd(formData: FormData) {
    'use server'
    await addMedicine(formData)
    revalidatePath('/admin/catalog')
  }

  async function handleUpdate(id: string, formData: FormData) {
    'use server'
    await updateMedicine(id, formData)
    revalidatePath('/admin/catalog')
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Catalog Management</h1>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-8 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-emerald-400 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add New Medicine
        </h2>
        <form action={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input required name="name" placeholder="Name" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
          <input name="generic_name" placeholder="Generic Name" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
          <input name="brand_name" placeholder="Brand Name" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
          <input required name="price" type="number" step="0.01" placeholder="Price (₹)" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
          <input required name="stock" type="number" placeholder="Initial Stock" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
          <select name="category" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" defaultValue="General">
            <option value="General">General</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Headache">Headache</option>
            <option value="Fever">Fever</option>
            <option value="Cold & Cough">Cold & Cough</option>
            <option value="First Aid">First Aid</option>
            <option value="Supplements">Supplements</option>
          </select>
          
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="requires_prescription" className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-emerald-500 focus:ring-emerald-500" />
            Requires Prescription
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_otc_whitelisted" className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-emerald-500 focus:ring-emerald-500" />
            OTC Whitelisted
          </label>
          
          <SubmitButton className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-medium transition-colors lg:col-span-1">
            Add Medicine
          </SubmitButton>
        </form>
      </div>

      <div className="mb-6">
        <form className="flex gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={query} 
            placeholder="Search catalog..." 
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" 
          />
          <button className="bg-gray-700 hover:bg-gray-600 px-4 rounded-lg font-medium transition-colors">Search</button>
        </form>
      </div>

      <div className="space-y-4">
        {medicines.map(med => (
          <div key={med.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                {med.name} 
                {med.requires_prescription && <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded border border-amber-700">Rx</span>}
                {med.is_otc_whitelisted && <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded border border-emerald-700">OTC</span>}
              </h3>
              <p className="text-sm text-gray-400">
                <span className="text-blue-400 font-medium mr-2">[{med.category || 'General'}]</span>
                {med.generic_name} {med.brand_name && `(${med.brand_name})`}
              </p>
            </div>
            
            <form action={handleUpdate.bind(null, med.id)} className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex flex-col gap-1 w-28">
                <label className="text-xs text-gray-400">Category</label>
                <select name="category" defaultValue={med.category || 'General'} className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                  <option value="General">General</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Headache">Headache</option>
                  <option value="Fever">Fever</option>
                  <option value="Cold & Cough">Cold & Cough</option>
                  <option value="First Aid">First Aid</option>
                  <option value="Supplements">Supplements</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 w-20">
                <label className="text-xs text-gray-400">Price (₹)</label>
                <input name="price" type="number" step="0.01" defaultValue={med.price} className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" />
              </div>
              <div className="flex flex-col gap-1 w-24">
                <label className="text-xs text-gray-400">Stock</label>
                <input name="stock" type="number" defaultValue={med.stock} className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" />
              </div>
              <div className="flex flex-col gap-1 items-center">
                <label className="text-xs text-gray-400">Rx</label>
                <input name="requires_prescription" type="checkbox" defaultChecked={med.requires_prescription} className="rounded bg-gray-700 border-gray-600 text-emerald-500" />
              </div>
              <div className="flex flex-col gap-1 items-center">
                <label className="text-xs text-gray-400">OTC</label>
                <input name="is_otc_whitelisted" type="checkbox" defaultChecked={med.is_otc_whitelisted} className="rounded bg-gray-700 border-gray-600 text-emerald-500" />
              </div>
              <SubmitButton className="mt-4 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
                <Check className="w-4 h-4" />
              </SubmitButton>
            </form>
          </div>
        ))}
      </div>
    </main>
  )
}
