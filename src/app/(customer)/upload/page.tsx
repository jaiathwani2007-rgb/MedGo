'use client'

import { CameraCapture } from '@/components/CameraCapture'
import { useRouter } from 'next/navigation'
import { submitOrder } from '@/app/actions/orders'

export default function UploadPage() {
  const router = useRouter()

  const handleUploadComplete = async (path: string) => {
    try {
      const res = await submitOrder([], path, false)
      if (res?.error) {
        alert(res.error)
      } else {
        alert('Prescription uploaded successfully! The pharmacist will review it shortly.')
        router.push('/orders')
      }
    } catch (err) {
      alert('An error occurred while submitting.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pt-8 pb-20">
      <div className="max-w-md mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Prescription</h1>
        <p className="text-gray-600">Please take a clear photo of your doctor's prescription or an old medicine strip.</p>
      </div>
      
      <CameraCapture onUploadComplete={handleUploadComplete} />
    </main>
  )
}
