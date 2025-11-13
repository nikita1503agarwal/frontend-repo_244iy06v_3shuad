import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image as ImageIcon, X, Plus, GalleryHorizontalEnd } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function VintageGallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploader, setShowUploader] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', artist: '', tags: '', image_data: '' })
  const [dragOver, setDragOver] = useState(false)

  const loadArt = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/art`)
      const data = await res.json()
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArt()
  }, [])

  const handleFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setForm((f) => ({ ...f, image_data: e.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.image_data || !form.title) return
    const payload = {
      title: form.title,
      description: form.description || undefined,
      artist: form.artist || undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      image_data: form.image_data,
    }
    const res = await fetch(`${API_BASE}/api/art`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setForm({ title: '', description: '', artist: '', tags: '', image_data: '' })
      setShowUploader(false)
      loadArt()
    }
  }

  const frameVariants = {
    hidden: { opacity: 0, y: 20, rotate: -1 },
    show: (i) => ({ opacity: 1, y: 0, rotate: (i % 2 ? -2 : 2), transition: { delay: 0.05 * i, type: 'spring', stiffness: 120 } }),
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1760764541302-e3955fbc6b2b?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRtYWRlfGVufDB8MHx8fDE3NjMwMzQ4MDl8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center">
      <div className="backdrop-brightness-90 min-h-screen">
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GalleryHorizontalEnd className="text-amber-600" />
            <h1 className="text-2xl sm:text-3xl font-serif text-amber-900 drop-shadow">Vintage Art & Craft Gallery</h1>
          </div>
          <button onClick={() => setShowUploader(true)} className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-amber-50 px-4 py-2 rounded-md shadow">
            <Plus size={18} /> Upload
          </button>
        </header>

        <main className="px-6 pb-16">
          {loading ? (
            <div className="grid place-items-center py-20">
              <div className="animate-pulse text-amber-900">Loading gallery…</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    className="relative group"
                    custom={idx}
                    initial="hidden"
                    animate="show"
                    variants={frameVariants}
                  >
                    <div className="bg-[url('https://images.unsplash.com/photo-1760764541302-e3955fbc6b2b?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRtYWRlfGVufDB8MHx8fDE3NjMwMzQ4MDl8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80')] p-3 rounded-lg shadow-lg">
                      <div className="bg-amber-50 border-4 border-amber-800 rounded-md overflow-hidden shadow-inner">
                        <div className="aspect-[4/3] overflow-hidden">
                          <img src={item.image_data} alt={item.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                        </div>
                        <div className="p-3">
                          <h3 className="font-serif text-amber-900 text-lg">{item.title}</h3>
                          {item.artist && <p className="text-sm text-amber-800/80">by {item.artist}</p>}
                          {item.description && <p className="mt-2 text-sm text-amber-900/80 line-clamp-3">{item.description}</p>}
                          {item.tags?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.tags.map((t) => (
                                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">#{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showUploader && (
          <motion.div className="fixed inset-0 bg-black/50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-xl bg-amber-50 rounded-lg shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-amber-900 text-amber-50">
                <div className="inline-flex items-center gap-2">
                  <Upload size={18} />
                  <span>Upload Artwork</span>
                </div>
                <button onClick={() => setShowUploader(false)} className="hover:opacity-80">
                  <X />
                </button>
              </div>
              <form onSubmit={submit} className="p-4">
                <div className="grid gap-3">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="px-3 py-2 rounded border border-amber-300 bg-white" />
                  <input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder="Artist (optional)" className="px-3 py-2 rounded border border-amber-300 bg-white" />
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="px-3 py-2 rounded border border-amber-300 bg-white" />
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="px-3 py-2 rounded border border-amber-300 bg-white" />

                  <div
                    onDrop={onDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    className={classNames(
                      'mt-1 border-2 border-dashed rounded-md p-6 grid place-items-center text-center transition',
                      dragOver ? 'border-amber-700 bg-amber-100' : 'border-amber-300 bg-amber-50'
                    )}
                  >
                    {form.image_data ? (
                      <div className="w-full">
                        <img src={form.image_data} alt="preview" className="max-h-64 mx-auto rounded shadow" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-amber-800">
                        <ImageIcon />
                        <p>Drag & drop an image here, or click to select</p>
                        <input type="file" accept="image/*" onChange={onFileChange} className="hidden" id="fileInput" />
                        <label htmlFor="fileInput" className="cursor-pointer px-3 py-1 rounded bg-amber-800 text-amber-50">Choose File</label>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 text-amber-50 px-4 py-2 rounded-md">
                    <Upload size={18} /> Upload
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
