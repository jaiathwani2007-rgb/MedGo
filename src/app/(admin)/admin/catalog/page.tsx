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
    <div className="pb-20 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-ink">Catalog Management</h1>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8 shadow-sm">
        <h2 className="text-xl font-serif font-bold mb-4 text-slate-azure flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add New Medicine
        </h2>
        <form action={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input required name="name" placeholder="Name" className="bg-parchment border border-gray-300 rounded-lg px-4 py-2.5 text-ink focus:ring-2 focus:ring-slate-azure outline-none" />
          <input name="generic_name" placeholder="Generic Name" className="bg-parchment border border-gray-300 rounded-lg px-4 py-2.5 text-ink focus:ring-2 focus:ring-slate-azure outline-none" />
          <input name="brand_name" placeholder="Brand Name" className="bg-parchment border border-gray-300 rounded-lg px-4 py-2.5 text-ink focus:ring-2 focus:ring-slate-azure outline-none" />
          <input required name="price" type="number" step="0.01" placeholder="Price (₹)" className="bg-parchment border border-gray-300 rounded-lg px-4 py-2.5 text-ink focus:ring-2 focus:ring-slate-azure outline-none" />
          <input required name="stock" type="number" placeholder="Initial Stock" className="bg-parchment border border-gray-300 rounded-lg px-4 py-2.5 text-ink focus:ring-2 focus:ring-slate-azure outline-none" />
          <select name="category" className="bg-parchment border border-gray-300 rounded-lg px-4 py-2.5 text-ink focus:ring-2 focus:ring-slate-azure outline-none" defaultValue="General">
            <option value="General">General</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Headache">Headache</option>
            <option value="Fever">Fever</option>
            <option value="Cold & Cough">Cold & Cough</option>
            <option value="First Aid">First Aid</option>
            <option value="Supplements">Supplements</option>
          </select>
          
          <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
            <input type="checkbox" name="requires_prescription" className="w-4 h-4 rounded border-gray-300 text-slate-azure focus:ring-slate-azure" />
            Requires Prescription
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
            <input type="checkbox" name="is_otc_whitelisted" className="w-4 h-4 rounded border-gray-300 text-slate-azure focus:ring-slate-azure" />
            OTC Whitelisted
          </label>
          
          <SubmitButton className="bg-slate-azure hover:bg-[#1a445e] text-white py-2.5 rounded-lg font-bold transition-colors lg:col-span-1 shadow-sm">
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
            className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-ink shadow-sm focus:ring-2 focus:ring-slate-azure outline-none" 
          />
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 px-6 rounded-lg font-bold transition-colors shadow-sm">Search</button>
        </form>
      </div>

      <div className="space-y-4">
        {medicines.map(med => (
          <div key={med.id} className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm hover:border-slate-azure transition-colors">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-ink flex items-center gap-2">
                {med.name} 
                {med.requires_prescription && <span className="text-xs bg-clay/10 text-clay px-2 py-0.5 rounded border border-clay/20">Rx</span>}
                {med.is_otc_whitelisted && <span className="text-xs bg-sage/10 text-sage px-2 py-0.5 rounded border border-sage/20">OTC</span>}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                <span className="text-slate-azure font-bold mr-2">[{med.category || 'General'}]</span>
                {med.generic_name} {med.brand_name && `(${med.brand_name})`}
              </p>
            </div>
            
            <form action={handleUpdate.bind(null, med.id)} className="flex items-center gap-3 w-full md:w-auto bg-parchment p-3 rounded-lg border border-gray-100">
              <div className="flex flex-col gap-1 w-28">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select name="category" defaultValue={med.category || 'General'} className="bg-white border border-gray-300 rounded px-2 py-1.5 text-ink text-sm">
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                <input name="price" type="number" step="0.01" defaultValue={med.price} className="bg-white border border-gray-300 rounded px-2 py-1.5 text-ink text-sm" />
              </div>
              <div className="flex flex-col gap-1 w-20">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock</label>
                <input name="stock" type="number" defaultValue={med.stock} className="bg-white border border-gray-300 rounded px-2 py-1.5 text-ink text-sm" />
              </div>
              <div className="flex flex-col gap-1 items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rx</label>
                <input name="requires_prescription" type="checkbox" defaultChecked={med.requires_prescription} className="rounded border-gray-300 text-slate-azure w-4 h-4 cursor-pointer" />
              </div>
              <div className="flex flex-col gap-1 items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">OTC</label>
                <input name="is_otc_whitelisted" type="checkbox" defaultChecked={med.is_otc_whitelisted} className="rounded border-gray-300 text-slate-azure w-4 h-4 cursor-pointer" />
              </div>
              <SubmitButton className="mt-4 bg-slate-azure hover:bg-[#1a445e] text-white p-2 rounded-lg transition-colors shadow-sm">
                <Check className="w-5 h-5" />
              </SubmitButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
