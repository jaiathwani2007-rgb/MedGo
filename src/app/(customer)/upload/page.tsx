'use client'

import { CameraCapture } from '@/components/CameraCapture'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()

  const handleUploadComplete = (path: string) => {
    // Navigate to cart or somewhere to continue order.
    // For now, just alert and redirect home.
    alert('Upload successful! Path: ' + path)
    router.push('/')
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
