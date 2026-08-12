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
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4">
      <h4 className="text-sm font-medium text-blue-400 mb-3">Manage Order Items</h4>
      
      {/* Existing Items */}
      {currentItems.length > 0 && (
        <ul className="mb-4 space-y-2">
          {currentItems.map((item, idx) => (
            <li key={item.id || idx} className="flex justify-between items-center bg-gray-900 px-3 py-2 rounded border border-gray-700 text-sm text-gray-300">
              <span>{item.quantity}x {item.medicine_name}</span>
              <div className="flex items-center gap-4">
                <span className="font-medium text-white">₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                {item.id && (
                  <button onClick={() => handleRemove(item.id)} disabled={loading} className="text-red-400 hover:text-red-300 transition-colors p-1 bg-red-400/10 rounded">
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
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">
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
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          {isCustom ? 'Switch to Catalog Search' : 'Add Custom Item Manually'}
        </button>
      </div>

      <div className="flex gap-2 items-end">
        {isCustom ? (
          <>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Name</label>
              <input 
                type="text" 
                value={customName} 
                onChange={e => setCustomName(e.target.value)} 
                placeholder="e.g. Paracetamol 500mg" 
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs text-gray-400 mb-1">Price (₹)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={customPrice} 
                onChange={e => setCustomPrice(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="0.00"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 relative">
            <label className="block text-xs text-gray-400 mb-1">Search Catalog</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value={search} 
                onChange={e => { setSearch(e.target.value); setSelectedMedId('') }} 
                placeholder="Type medicine name..." 
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
            {search && filteredMeds.length > 0 && !selectedMedId && (
              <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-40 overflow-y-auto">
                {filteredMeds.map(med => (
                  <li 
                    key={med.id} 
                    onClick={() => { setSelectedMedId(med.id); setSearch(med.name) }}
                    className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
                  >
                    <div className="font-medium text-white">{med.name}</div>
                    <div className="text-xs text-emerald-400">₹{med.price.toFixed(2)} / unit • Stock: {med.stock}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="w-16">
          <label className="block text-xs text-gray-400 mb-1">Qty</label>
          <input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={e => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-2 py-2 text-sm text-white text-center focus:border-blue-500 outline-none"
          />
        </div>
        <button 
          onClick={handleAdd} 
          disabled={(isCustom ? (!customName || !customPrice) : !selectedMedId) || loading} 
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors h-[38px]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Manual Delivery Fee */}
      <div className="mt-6 pt-4 border-t border-gray-700 flex items-end gap-2">
        <div className="w-32">
          <label className="block text-xs text-gray-400 mb-1">Set Delivery Fee (₹)</label>
          <input 
            type="number" 
            min="0"
            step="0.01"
            value={deliveryFee} 
            onChange={e => setDeliveryFee(e.target.value ? parseFloat(e.target.value) : '')}
            placeholder="e.g. 50"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
          />
        </div>
        <button 
          onClick={handleUpdateDelivery} 
          disabled={deliveryFee === '' || updatingDelivery} 
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors h-[38px]"
        >
          {updatingDelivery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Update Delivery
        </button>
      </div>
    </div>
  )
}
