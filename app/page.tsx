'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  Sun, Moon, School, Plus, Pencil, Trash2, X, Check, MapPin,
  ClipboardList, Monitor, Wrench, Bath, Hammer, BrickWall, Lock,
  Lightbulb, Sparkles, Paintbrush, HardHat, PanelTop, ShowerHead,
  Nut, Briefcase, Package, Container, Plug, GitBranchPlus, Settings,
  ListChecks, PartyPopper, CircleDot,
} from 'lucide-react'

function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ── Types ──
interface Seccion {
  id: number
  nombre: string
  emoji: string
  orden: number
}

interface Tarea {
  id: number
  seccion_id: number
  descripcion: string
  ubicacion: string
  reportado_por: string
  completado: boolean
  orden: number
  created_at: string
}

// ── Icon Map ──
const ICON_OPTIONS: { key: string; icon: React.ReactNode; label: string }[] = [
  { key: 'clipboard', icon: <ClipboardList size={18} />, label: 'General' },
  { key: 'monitor', icon: <Monitor size={18} />, label: 'Informática' },
  { key: 'wrench', icon: <Wrench size={18} />, label: 'Plomería' },
  { key: 'bath', icon: <Bath size={18} />, label: 'Sanitarios' },
  { key: 'hammer', icon: <Hammer size={18} />, label: 'Carpintería' },
  { key: 'brick', icon: <BrickWall size={18} />, label: 'Albañilería' },
  { key: 'lock', icon: <Lock size={18} />, label: 'Cerrajería' },
  { key: 'lightbulb', icon: <Lightbulb size={18} />, label: 'Electricidad' },
  { key: 'sparkles', icon: <Sparkles size={18} />, label: 'Limpieza' },
  { key: 'paintbrush', icon: <Paintbrush size={18} />, label: 'Pintura' },
  { key: 'hardhat', icon: <HardHat size={18} />, label: 'Obra' },
  { key: 'panel', icon: <PanelTop size={18} />, label: 'Ventanas' },
  { key: 'shower', icon: <ShowerHead size={18} />, label: 'Duchas' },
  { key: 'nut', icon: <Nut size={18} />, label: 'Tornillería' },
  { key: 'briefcase', icon: <Briefcase size={18} />, label: 'Admin' },
  { key: 'package', icon: <Package size={18} />, label: 'Materiales' },
  { key: 'bucket', icon: <Container size={18} />, label: 'Balde' },
  { key: 'plug', icon: <Plug size={18} />, label: 'Conexiones' },
  { key: 'ladder', icon: <GitBranchPlus size={18} />, label: 'Escalera' },
  { key: 'settings', icon: <Settings size={18} />, label: 'Config' },
]

function getIconByKey(key: string, size = 18) {
  const map: Record<string, React.ReactNode> = {
    clipboard: <ClipboardList size={size} />,
    monitor: <Monitor size={size} />,
    wrench: <Wrench size={size} />,
    bath: <Bath size={size} />,
    hammer: <Hammer size={size} />,
    brick: <BrickWall size={size} />,
    lock: <Lock size={size} />,
    lightbulb: <Lightbulb size={size} />,
    sparkles: <Sparkles size={size} />,
    paintbrush: <Paintbrush size={size} />,
    hardhat: <HardHat size={size} />,
    panel: <PanelTop size={size} />,
    shower: <ShowerHead size={size} />,
    nut: <Nut size={size} />,
    briefcase: <Briefcase size={size} />,
    package: <Package size={size} />,
    bucket: <Container size={size} />,
    plug: <Plug size={size} />,
    ladder: <GitBranchPlus size={size} />,
    settings: <Settings size={size} />,
  }
  // Fallback: si es un emoji viejo, mapearlo
  const emojiMap: Record<string, string> = {
    '📋': 'clipboard', '💻': 'monitor', '🔧': 'wrench', '🚽': 'bath',
    '🪵': 'hammer', '🧱': 'brick', '🔒': 'lock', '💡': 'lightbulb',
    '🧹': 'sparkles', '🎨': 'paintbrush', '🏗️': 'hardhat', '🪟': 'panel',
    '🚿': 'shower', '🔩': 'nut', '🧰': 'briefcase', '📦': 'package',
    '🪣': 'bucket', '🔌': 'plug', '🪜': 'ladder', '🛠️': 'settings',
    '🖨️': 'monitor',
  }
  const resolved = emojiMap[key] || key
  return map[resolved] || <ClipboardList size={size} />
}

// ── Theme Toggle ──
function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
      title={dark ? 'Modo claro' : 'Modo oscuro'}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

// ── Icon Picker ──
function IconPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors text-indigo-600 dark:text-indigo-400"
      >
        {getIconByKey(value, 22)}
      </button>
      {open && (
        <div className="absolute top-12 left-0 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 grid grid-cols-5 gap-1 w-56">
          {ICON_OPTIONS.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => { onChange(opt.key); setOpen(false) }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                value === opt.key ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
              }`}
              title={opt.label}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Modal ──
function Modal({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[slideUp_0.2s_ease]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Confirm Dialog ──
function ConfirmDialog({ open, onClose, onConfirm, message }: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  message: string
}) {
  return (
    <Modal open={open} onClose={onClose} title="Confirmar">
      <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          Cancelar
        </button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">
          Eliminar
        </button>
      </div>
    </Modal>
  )
}

// ── Input classes ──
const inputClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors"
const btnPrimary = "px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
const btnSecondary = "px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"

// ══════════════════════════════════════════════
// ── Main Page ──
// ══════════════════════════════════════════════
export default function ArreglosPage() {
  const supabase = useMemo(() => getSupabase(), [])
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'completadas'>('todas')

  // Modals
  const [seccionModal, setSeccionModal] = useState<{ open: boolean; editing?: Seccion }>({ open: false })
  const [tareaModal, setTareaModal] = useState<{ open: boolean; seccionId?: number; editing?: Tarea }>({ open: false })
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; type: 'seccion' | 'tarea'; id: number; message: string } | null>(null)

  // Form states
  const [secForm, setSecForm] = useState({ nombre: '', emoji: 'clipboard' })
  const [tareaForm, setTareaForm] = useState({ descripcion: '', ubicacion: '', reportado_por: '' })

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    const [secRes, tarRes] = await Promise.all([
      supabase.from('secciones').select('*').order('orden'),
      supabase.from('tareas').select('*').order('orden'),
    ])
    if (secRes.data) setSecciones(secRes.data)
    if (tarRes.data) setTareas(tarRes.data)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Realtime ──
  useEffect(() => {
    const channel = supabase
      .channel('arreglos-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'secciones' }, () => {
        supabase.from('secciones').select('*').order('orden').then(({ data }) => {
          if (data) setSecciones(data)
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, () => {
        supabase.from('tareas').select('*').order('orden').then(({ data }) => {
          if (data) setTareas(data)
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── CRUD Secciones ──
  const openNewSeccion = () => {
    setSecForm({ nombre: '', emoji: 'clipboard' })
    setSeccionModal({ open: true })
  }

  const openEditSeccion = (s: Seccion) => {
    setSecForm({ nombre: s.nombre, emoji: s.emoji })
    setSeccionModal({ open: true, editing: s })
  }

  const saveSeccion = async () => {
    if (!secForm.nombre.trim()) return
    if (seccionModal.editing) {
      const updated = { ...seccionModal.editing, nombre: secForm.nombre.trim(), emoji: secForm.emoji }
      setSecciones(prev => prev.map(s => s.id === updated.id ? updated : s))
      await supabase.from('secciones').update({ nombre: updated.nombre, emoji: updated.emoji }).eq('id', updated.id)
    } else {
      const maxOrden = secciones.length > 0 ? Math.max(...secciones.map(s => s.orden)) : 0
      const { data } = await supabase.from('secciones').insert({ nombre: secForm.nombre.trim(), emoji: secForm.emoji, orden: maxOrden + 1 }).select().single()
      if (data) setSecciones(prev => [...prev, data])
    }
    setSeccionModal({ open: false })
  }

  const deleteSeccion = async (id: number) => {
    setSecciones(prev => prev.filter(s => s.id !== id))
    setTareas(prev => prev.filter(t => t.seccion_id !== id))
    setConfirmDelete(null)
    await supabase.from('secciones').delete().eq('id', id)
  }

  // ── CRUD Tareas ──
  const openNewTarea = (seccionId: number) => {
    setTareaForm({ descripcion: '', ubicacion: '', reportado_por: '' })
    setTareaModal({ open: true, seccionId })
  }

  const openEditTarea = (t: Tarea) => {
    setTareaForm({ descripcion: t.descripcion, ubicacion: t.ubicacion, reportado_por: t.reportado_por })
    setTareaModal({ open: true, editing: t })
  }

  const saveTarea = async () => {
    if (!tareaForm.descripcion.trim()) return
    if (tareaModal.editing) {
      const updated = {
        ...tareaModal.editing,
        descripcion: tareaForm.descripcion.trim(),
        ubicacion: tareaForm.ubicacion.trim(),
        reportado_por: tareaForm.reportado_por.trim(),
        updated_at: new Date().toISOString(),
      }
      setTareas(prev => prev.map(t => t.id === updated.id ? updated : t))
      await supabase.from('tareas').update({
        descripcion: updated.descripcion,
        ubicacion: updated.ubicacion,
        reportado_por: updated.reportado_por,
        updated_at: updated.updated_at,
      }).eq('id', updated.id)
    } else {
      const tareasDeSeccion = tareas.filter(t => t.seccion_id === tareaModal.seccionId)
      const maxOrden = tareasDeSeccion.length > 0 ? Math.max(...tareasDeSeccion.map(t => t.orden)) : 0
      const { data } = await supabase.from('tareas').insert({
        seccion_id: tareaModal.seccionId,
        descripcion: tareaForm.descripcion.trim(),
        ubicacion: tareaForm.ubicacion.trim(),
        reportado_por: tareaForm.reportado_por.trim(),
        orden: maxOrden + 1,
      }).select().single()
      if (data) setTareas(prev => [...prev, data])
    }
    setTareaModal({ open: false })
  }

  const deleteTarea = async (id: number) => {
    setTareas(prev => prev.filter(t => t.id !== id))
    setConfirmDelete(null)
    await supabase.from('tareas').delete().eq('id', id)
  }

  const toggleTarea = async (tarea: Tarea) => {
    const newValue = !tarea.completado
    setTareas(prev => prev.map(t => t.id === tarea.id ? { ...t, completado: newValue } : t))
    await supabase.from('tareas').update({ completado: newValue, updated_at: new Date().toISOString() }).eq('id', tarea.id)
  }

  // ── Stats ──
  const totalTareas = tareas.length
  const completadas = tareas.filter(t => t.completado).length
  const porcentaje = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0

  const tareasFiltradas = tareas.filter(t => {
    if (filtro === 'pendientes') return !t.completado
    if (filtro === 'completadas') return t.completado
    return true
  })

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Cargando tareas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <School size={30} />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Arreglos de la Escuela
              </h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="text-indigo-200 text-sm mt-1 flex items-center gap-2">
            Listado de tareas de mantenimiento
            <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full text-xs">
              <CircleDot size={8} className="text-green-400 animate-pulse" />
              Sincronizado
            </span>
          </p>

          {/* Barra de progreso */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-indigo-200">Progreso</span>
              <span className="font-semibold">
                {completadas}/{totalTareas} ({porcentaje}%)
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* ── Filtros + Botón nueva sección ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['todas', 'pendientes', 'completadas'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filtro === f
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {f === 'todas' && `Todas (${totalTareas})`}
                {f === 'pendientes' && `Pendientes (${totalTareas - completadas})`}
                {f === 'completadas' && `Completadas (${completadas})`}
              </button>
            ))}
          </div>
          <button onClick={openNewSeccion} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md">
            <Plus size={16} />
            Nueva sección
          </button>
        </div>

        {/* ── Secciones y tareas ── */}
        <div className="space-y-6">
          {secciones.map(sec => {
            const tareasDeSeccion = tareasFiltradas.filter(t => t.seccion_id === sec.id)
            const totalSec = tareas.filter(t => t.seccion_id === sec.id).length
            const completadasSec = tareas.filter(t => t.seccion_id === sec.id && t.completado).length

            if (filtro !== 'todas' && tareasDeSeccion.length === 0) return null

            return (
              <div key={sec.id} className="group/sec">
                {/* Cabecera sección */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    {getIconByKey(sec.emoji, 18)}
                    <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {sec.nombre}
                    </h2>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      ({completadasSec}/{totalSec})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover/sec:opacity-100 transition-opacity">
                    <button
                      onClick={() => openNewTarea(sec.id)}
                      className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-colors"
                      title="Agregar tarea"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => openEditSeccion(sec)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                      title="Editar sección"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ open: true, type: 'seccion', id: sec.id, message: `¿Eliminar la sección "${sec.nombre}" y todas sus tareas?` })}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition-colors"
                      title="Eliminar sección"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Tareas */}
                <div className="space-y-2">
                  {tareasDeSeccion.map(tarea => (
                    <div
                      key={tarea.id}
                      className={`group/task flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                        tarea.completado
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="mt-0.5 flex-shrink-0" onClick={() => toggleTarea(tarea)}>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          tarea.completado
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-300 dark:border-slate-600 group-hover/task:border-indigo-400'
                        }`}>
                          {tarea.completado && <Check size={16} className="text-white" strokeWidth={3} />}
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0" onClick={() => toggleTarea(tarea)}>
                        <p className={`text-sm sm:text-base font-medium transition-all ${
                          tarea.completado ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-800 dark:text-white'
                        }`}>
                          {tarea.descripcion}
                        </p>
                        {(tarea.ubicacion || tarea.reportado_por) && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            {tarea.ubicacion && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <MapPin size={12} />
                                {tarea.ubicacion}
                              </span>
                            )}
                            {tarea.reportado_por && (
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                por {tarea.reportado_por}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1 flex-shrink-0 sm:opacity-0 sm:group-hover/task:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditTarea(tarea) }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, type: 'tarea', id: tarea.id, message: `¿Eliminar "${tarea.descripcion}"?` }) }}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Badge mobile */}
                      <div className="flex-shrink-0 sm:hidden self-start">
                        {tarea.completado ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 block mt-2" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-400 block mt-2" />
                        )}
                      </div>

                      {/* Badge desktop */}
                      <div className="flex-shrink-0 hidden sm:block">
                        {tarea.completado ? (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full">
                            Hecho
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Botón agregar tarea inline */}
                  {filtro !== 'completadas' && (
                    <button
                      onClick={() => openNewTarea(sec.id)}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-500 transition-all text-sm"
                    >
                      <Plus size={16} />
                      Agregar tarea
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Sin secciones */}
        {secciones.length === 0 && (
          <div className="text-center py-16">
            <ListChecks size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">No hay secciones todavía</p>
            <button onClick={openNewSeccion} className={btnPrimary}>Crear primera sección</button>
          </div>
        )}

        {/* Sin resultados con filtro */}
        {secciones.length > 0 && tareasFiltradas.length === 0 && (
          <div className="text-center py-16">
            {filtro === 'completadas' ? (
              <ListChecks size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            ) : (
              <PartyPopper size={48} className="mx-auto mb-3 text-emerald-400" />
            )}
            <p className="text-slate-500 dark:text-slate-400">
              {filtro === 'completadas' ? 'Todavía no se completó ninguna tarea' : '¡Todas las tareas están completadas!'}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500">
          Arreglos de la Escuela — Sincronizado en tiempo real
        </div>
      </main>

      {/* ══ Modal Sección ══ */}
      <Modal
        open={seccionModal.open}
        onClose={() => setSeccionModal({ open: false })}
        title={seccionModal.editing ? 'Editar sección' : 'Nueva sección'}
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <IconPicker value={secForm.emoji} onChange={emoji => setSecForm(f => ({ ...f, emoji }))} />
            <input
              className={inputClass}
              placeholder="Nombre de la sección"
              value={secForm.nombre}
              onChange={e => setSecForm(f => ({ ...f, nombre: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && saveSeccion()}
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setSeccionModal({ open: false })} className={btnSecondary}>Cancelar</button>
            <button onClick={saveSeccion} disabled={!secForm.nombre.trim()} className={btnPrimary}>
              {seccionModal.editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ══ Modal Tarea ══ */}
      <Modal
        open={tareaModal.open}
        onClose={() => setTareaModal({ open: false })}
        title={tareaModal.editing ? 'Editar tarea' : 'Nueva tarea'}
      >
        <div className="space-y-3">
          <input
            className={inputClass}
            placeholder="Descripción de la tarea *"
            value={tareaForm.descripcion}
            onChange={e => setTareaForm(f => ({ ...f, descripcion: e.target.value }))}
            autoFocus
          />
          <input
            className={inputClass}
            placeholder="Ubicación (opcional)"
            value={tareaForm.ubicacion}
            onChange={e => setTareaForm(f => ({ ...f, ubicacion: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Reportado por (opcional)"
            value={tareaForm.reportado_por}
            onChange={e => setTareaForm(f => ({ ...f, reportado_por: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && saveTarea()}
          />
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setTareaModal({ open: false })} className={btnSecondary}>Cancelar</button>
            <button onClick={saveTarea} disabled={!tareaForm.descripcion.trim()} className={btnPrimary}>
              {tareaModal.editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ══ Confirm Delete ══ */}
      {confirmDelete && (
        <ConfirmDialog
          open={confirmDelete.open}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => confirmDelete.type === 'seccion' ? deleteSeccion(confirmDelete.id) : deleteTarea(confirmDelete.id)}
          message={confirmDelete.message}
        />
      )}
    </div>
  )
}
