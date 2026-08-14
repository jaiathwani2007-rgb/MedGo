'use client'

import { useState, useEffect } from 'react'
import { getCatalog, type Medicine } from '@/app/actions/catalog'
import { addMedicineToOrder, removeMedicineFromOrder, addCustomMedicineToOrder, updateDeliveryFee } from '@/app/actions/orders'
import { Plus, Trash2, Search, Loader2, Save } from 'lucide-react'

export function AdminOrderItemEditor({ orderId, currentItems }: { orderId: string, currentItems: any[] }) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [search, setSearch] = useState('')
  const [selectedMedId, setSelectedMedId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isCustom, setIsCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState<number | ''>('')
  
  // Try to find the order's existing delivery fee if passed, but it's not passed. 
  // Let's assume the user will just type the new one.
  const [deliveryFee, setDeliveryFee] = useState<number | ''>('')
  const [updatingDelivery, setUpdatingDelivery] = useState(false)

  useEffect(() => {
    getCatalog().then(setMedicines)
  }, [])

  const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

  const handleAdd = async () => {
    if (isCustom) {
      if (!customName || !customPrice) return
    } else {
      if (!selectedMedId) return
    }

    setLoading(true)
    try {
      if (isCustom) {
        await addCustomMedicineToOrder(orderId, customName, Number(customPrice), quantity)
      } else {
        await addMedicineToOrder(orderId, selectedMedId, quantity)
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error adding item')
    }
    setLoading(false)
    setSelectedMedId('')
    setSearch('')
    setCustomName('')
    setCustomPrice('')
    setQuantity(1)
  }

  const handleRemove = async (itemId: string) => {
    setLoading(true)
    try {
      await removeMedicineFromOrder(orderId, itemId)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error removing item')
    }
    setLoading(false)
  }

  const handleUpdateDelivery = async () => {
    if (deliveryFee === '') return
    setUpdatingDelivery(true)
    try {
      await updateDeliveryFee(orderId, Number(deliveryFee))
      setDeliveryFee('')
      alert('Delivery fee updated!')
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error updating delivery fee')
    }
    setUpdatingDelivery(false)
  }

  return (
    <div className="bg-parchment p-5 rounded-xl border border-gray-200 mb-4 font-sans">
      <h4 className="text-sm font-bold text-slate-azure mb-3 font-serif">Manage Order Items</h4>
      
      {/* Existing Items */}
      {currentItems.length > 0 && (
        <ul className="mb-4 space-y-2">
          {currentItems.map((item, idx) => (
            <li key={item.id || idx} className="flex justify-between items-center bg-white px-3 py-3 rounded border border-gray-200 text-sm text-ink shadow-sm">
              <span className="font-medium">{item.quantity}x {item.medicine_name}</span>
              <div className="flex items-center gap-4">
                <span className="font-bold text-ink">₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                {item.id && (
                  <button onClick={() => handleRemove(item.id)} disabled={loading} className="text-clay hover:text-[#a64b3c] transition-colors p-1 bg-clay/10 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add New Item */}
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">
          {isCustom ? 'Add Custom Medicine' : 'Search Catalog'}
        </label>
        <button 
          onClick={() => {
            setIsCustom(!isCustom)
            setSearch('')
            setCustomName('')
            setCustomPrice('')
            setSelectedMedId('')
          }}
          className="text-xs text-slate-azure hover:text-[#1a445e] underline font-medium"
        >
          {isCustom ? 'Switch to Catalog Search' : 'Add Custom Item Manually'}
        </button>
      </div>

      <div className="flex gap-3 items-end">
        {isCustom ? (
          <>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1 font-medium">Name</label>
              <input 
                type="text" 
                value={customName} 
                onChange={e => setCustomName(e.target.value)} 
                placeholder="e.g. Paracetamol 500mg" 
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-ink focus:ring-2 focus:ring-slate-azure outline-none shadow-sm"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs text-slate-500 mb-1 font-medium">Price (₹)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={customPrice} 
                onChange={e => setCustomPrice(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="0.00"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-ink focus:ring-2 focus:ring-slate-azure outline-none shadow-sm"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 relative">
            <label className="block text-xs text-slate-500 mb-1 font-medium">Search Catalog</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={search} 
                onChange={e => { setSearch(e.target.value); setSelectedMedId('') }} 
                placeholder="Type medicine name..." 
                className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-ink focus:ring-2 focus:ring-slate-azure outline-none shadow-sm"
              />
            </div>
            {search && filteredMeds.length > 0 && !selectedMedId && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                {filteredMeds.map(med => (
                  <li 
                    key={med.id} 
                    onClick={() => { setSelectedMedId(med.id); setSearch(med.name) }}
                    className="px-4 py-3 text-sm text-ink hover:bg-slate-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <div className="font-bold">{med.name}</div>
                    <div className="text-xs text-sage mt-1">₹{med.price.toFixed(2)} / unit • Stock: {med.stock}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="w-16">
          <label className="block text-xs text-slate-500 mb-1 font-medium">Qty</label>
          <input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={e => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2.5 text-sm text-ink text-center focus:ring-2 focus:ring-slate-azure outline-none shadow-sm"
          />
        </div>
        <button 
          onClick={handleAdd} 
          disabled={(isCustom ? (!customName || !customPrice) : !selectedMedId) || loading} 
          className="bg-slate-azure hover:bg-[#1a445e] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors h-[42px] shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* Manual Delivery Fee */}
      <div className="mt-6 pt-5 border-t border-gray-200 flex items-end gap-3">
        <div className="w-32">
          <label className="block text-xs text-slate-500 mb-1 font-medium">Set Delivery Fee (₹)</label>
          <input 
            type="number" 
            min="0"
            step="0.01"
            value={deliveryFee} 
            onChange={e => setDeliveryFee(e.target.value ? parseFloat(e.target.value) : '')}
            placeholder="e.g. 50"
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-ink focus:ring-2 focus:ring-slate-azure outline-none shadow-sm"
          />
        </div>
        <button 
          onClick={handleUpdateDelivery} 
          disabled={deliveryFee === '' || updatingDelivery} 
          className="bg-sage hover:bg-[#346b52] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors h-[42px] font-bold shadow-sm"
        >
          {updatingDelivery ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          Update Delivery
        </button>
      </div>
    </div>
  )
}
