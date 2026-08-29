import { useState, useRef } from 'react'
import { ArrowLeft, Camera, Image, Trash2, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import gsap from 'gsap'

interface FamilyPhoto {
  id: string
  data: string
  caption: string
  uploadedAt: string
}

export default function FamilyPage() {
  const navigate = useNavigate()
  const [photos, setPhotos] = useLocalStorage<FamilyPhoto[]>('aura-family-photos', [])
  const [caption, setCaption] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const newPhoto: FamilyPhoto = {
        id: Date.now().toString(),
        data: reader.result as string,
        caption: caption || 'A precious memory',
        uploadedAt: new Date().toLocaleDateString(),
      }
      setPhotos(prev => [...prev, newPhoto])
      setCaption('')
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/15 transition-all">
          <ArrowLeft size={24} className="text-charcoal-600 dark:text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-charcoal-800 dark:text-white">My Family</h1>
          <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">Photos and memories from your loved ones</p>
        </div>
      </div>

      {/* Upload section */}
      <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/10 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Camera size={20} className="text-rose-400" />
          <h2 className="font-semibold text-charcoal-800 dark:text-white">Add a Photo</h2>
        </div>
        <input type="text" value={caption} onChange={e => setCaption(e.target.value)}
          placeholder="Add a caption (e.g., 'My daughter Priya')"
          className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 text-charcoal-800 dark:text-white placeholder-charcoal-300 mb-3 focus:outline-none focus:ring-2 focus:ring-rose-300" />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <button onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-medium hover:shadow-[0_4px_20px_rgba(244,114,182,0.3)] transition-all">
          Choose Photo
        </button>
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16">
          <Image size={48} className="text-charcoal-200 dark:text-charcoal-600 mx-auto mb-4" />
          <p className="text-charcoal-400 dark:text-charcoal-500">No family photos yet. Upload one above!</p>
          <p className="text-charcoal-300 dark:text-charcoal-600 text-sm mt-2">Photos you add will appear in your memory games too.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="group relative rounded-2xl overflow-hidden bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10">
              <img src={photo.data} alt={photo.caption} className="w-full aspect-square object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
                <p className="text-white/60 text-xs">{photo.uploadedAt}</p>
              </div>
              <button onClick={() => deletePhoto(photo.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-12 p-6 rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/30 dark:border-white/10">
        <Heart size={24} className="text-rose-300 mx-auto mb-2" />
        <p className="text-charcoal-500 dark:text-charcoal-400 text-sm italic">Family photos help your memory games feel personal and familiar.</p>
      </div>
    </div>
  )
}
