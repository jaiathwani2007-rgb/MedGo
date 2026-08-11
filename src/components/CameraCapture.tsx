'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Camera, Upload, X, Loader2 } from 'lucide-react'

// Quick helper to calculate Laplacian Variance for blur detection
function checkBlurriness(imageSrc: string): Promise<{ isBlurry: boolean; score: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject('No canvas context')

      // Scale down for performance
      const MAX_WIDTH = 500
      const scale = Math.min(MAX_WIDTH / img.width, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const width = canvas.width
      const height = canvas.height

      const grayscale = new Uint8Array(width * height)
      for (let i = 0; i < data.length; i += 4) {
        grayscale[i / 4] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      }

      let sum = 0
      let sumSq = 0
      let count = 0

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x
          const val =
            grayscale[idx - width] +
            grayscale[idx - 1] -
            4 * grayscale[idx] +
            grayscale[idx + 1] +
            grayscale[idx + width]
          
          sum += val
          sumSq += val * val
          count++
        }
      }

      const mean = sum / count
      const variance = (sumSq / count) - (mean * mean)

      // Variance threshold for blur (adjust based on real-world testing)
      const threshold = 150 
      resolve({ isBlurry: variance < threshold, score: variance })
    }
    img.onerror = (err) => reject(err)
    img.src = imageSrc
  })
}

export function CameraCapture({ onUploadComplete }: { onUploadComplete: (path: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const objectUrl = URL.createObjectURL(selectedFile)
    
    try {
      const { isBlurry, score } = await checkBlurriness(objectUrl)
      if (isBlurry) {
        setError('Photo is unclear or blurry. Please retake in good light.')
        URL.revokeObjectURL(objectUrl)
        setFile(null)
        setPreview(null)
        return
      }
      
      setFile(selectedFile)
      setPreview(objectUrl)
    } catch (err) {
      console.error(err)
      setError('Failed to process image.')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('You must be logged in to upload a prescription.')
      setUploading(false)
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    // Save record to prescription_uploads
    const { error: dbError } = await supabase.from('prescription_uploads').insert({
      profile_id: user.id,
      storage_path: filePath
    })

    if (dbError) {
      setError(dbError.message)
      setUploading(false)
      return
    }

    setUploading(false)
    onUploadComplete(filePath)
    setFile(null)
    setPreview(null)
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Upload Prescription</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2">
          <X className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!preview ? (
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Camera className="w-8 h-8 text-blue-500" />
            <span className="font-medium text-gray-700">Tap to capture or choose photo</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img src={preview} alt="Preview" className="w-full h-auto object-cover max-h-64" />
            <button
              onClick={() => { setPreview(null); setFile(null) }}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {uploading ? 'Uploading...' : 'Confirm & Upload'}
          </button>
        </div>
      )}
    </div>
  )
}
