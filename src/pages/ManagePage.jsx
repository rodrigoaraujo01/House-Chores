import { useState, useRef, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useChores, useCategories, useUpsertChore, useUpsertCategory, useDeleteChore, useDeleteCategory } from '../hooks/useChores'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

const EMOJIS = ['🏠', '🧹', '🍳', '👶', '🐾', '🌿', '🧺', '🚿', '🛒', '🔧', '📦', '✨']

export function ManagePage() {
  const [tab, setTab] = useState('chores')
  const { profile } = useAuth()

  return (
    <Layout>
      <div className="px-4 pt-safe">
        <div className="pt-3 pb-4">
          <h1 className="text-lg font-semibold text-text-primary">Manage</h1>
        </div>

        {/* Underline tab switch */}
        <div className="flex gap-6 mb-5">
          <button
            onClick={() => setTab('chores')}
            className={`pb-2 text-sm font-medium transition-colors ${
              tab === 'chores'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary'
            }`}
          >
            Chores
          </button>
          <button
            onClick={() => setTab('categories')}
            className={`pb-2 text-sm font-medium transition-colors ${
              tab === 'categories'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary'
            }`}
          >
            Categories
          </button>
        </div>

        {tab === 'chores' ? <ChoresTab profile={profile} /> : <CategoriesTab profile={profile} />}
      </div>
    </Layout>
  )
}

function ChoresTab({ profile }) {
  const { data: chores = [] } = useChores()
  const { data: categories = [] } = useCategories()
  const upsert = useUpsertChore()
  const remove = useDeleteChore()
  const [form, setForm] = useState(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (form && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [form])

  async function handleSave() {
    if (!form?.name?.trim()) return toast.error('Name is required')
    try {
      await upsert.mutateAsync({
        ...form,
        weight: parseFloat(form.weight) || 1,
        category_id: form.category_id || null,
        created_by: form.id ? form.created_by : profile?.id,
      })
      toast.success(form.id ? 'Chore updated' : 'Chore created')
      setForm(null)
    } catch (err) {
      toast.error(err?.message ?? 'Something went wrong')
    }
  }

  async function handleDelete(id) {
    try {
      await remove.mutateAsync(id)
      toast.success('Chore archived')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  return (
    <div className="pb-8">
      <Button onClick={() => setForm({ name: '', weight: '1', category_id: '' })} className="w-full mb-4">
        <Plus size={16} />
        Add chore
      </Button>

      {form && (
        <div ref={formRef} className="mb-4">
          <ChoreForm
            form={form}
            categories={categories}
            onChange={(f) => setForm(f)}
            onSave={handleSave}
            onCancel={() => setForm(null)}
            saving={upsert.isPending}
          />
        </div>
      )}

      {chores.length === 0 && !form && (
        <p className="text-center text-text-secondary text-sm py-8">No chores yet. Add one!</p>
      )}

      {chores.map((chore, i) => (
        <div key={chore.id} className={`flex items-center gap-3 py-3 ${i < chores.length - 1 ? 'hairline' : ''}`}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{chore.name}</p>
            <p className="text-xs text-text-secondary">
              {chore.weight}pt · {catMap[chore.category_id]?.emoji} {catMap[chore.category_id]?.name ?? 'No category'}
            </p>
          </div>
          <button onClick={() => setForm({ ...chore, weight: String(chore.weight) })} className="p-2 text-text-secondary hover:text-accent rounded-lg hover:bg-surface">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(chore.id)} className="p-2 text-text-secondary hover:text-red-500 rounded-lg hover:bg-red-50">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

function ChoreForm({ form, categories, onChange, onSave, onCancel, saving }) {
  return (
    <div className="bg-surface rounded-xl p-4 space-y-3">
      <Input
        label="Chore name"
        placeholder="e.g. Wash dishes"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <Select
            label="Category"
            value={form.category_id ?? ''}
            onChange={(e) => onChange({ ...form, category_id: e.target.value || null })}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </Select>
        </div>
        <div className="w-24">
          <Input
            label="Weight"
            type="number"
            step="0.5"
            min="0.5"
            max="10"
            value={form.weight}
            onChange={(e) => onChange({ ...form, weight: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onSave} className="flex-1" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

function CategoriesTab({ profile }) {
  const { data: categories = [] } = useCategories()
  const upsert = useUpsertCategory()
  const remove = useDeleteCategory()
  const [form, setForm] = useState(null)

  async function handleSave() {
    if (!form?.name?.trim()) return toast.error('Name is required')
    try {
      await upsert.mutateAsync({
        ...form,
        created_by: form.id ? form.created_by : profile?.id,
      })
      toast.success(form.id ? 'Category updated' : 'Category created')
      setForm(null)
    } catch (err) {
      toast.error(err?.message ?? 'Something went wrong')
    }
  }

  async function handleDelete(id) {
    try {
      await remove.mutateAsync(id)
      toast.success('Category deleted')
    } catch {
      toast.error('Failed to delete — remove chores first')
    }
  }

  return (
    <div className="pb-8">
      <Button onClick={() => setForm({ name: '', emoji: '🏠' })} className="w-full mb-4">
        <Plus size={16} />
        Add category
      </Button>

      {form && (
        <div className="mb-4">
          <CategoryForm
            form={form}
            onChange={setForm}
            onSave={handleSave}
            onCancel={() => setForm(null)}
            saving={upsert.isPending}
          />
        </div>
      )}

      {categories.length === 0 && !form && (
        <p className="text-center text-text-secondary text-sm py-8">No categories yet.</p>
      )}

      {categories.map((cat, i) => (
        <div key={cat.id} className={`flex items-center gap-3 py-3 ${i < categories.length - 1 ? 'hairline' : ''}`}>
          <span className="text-2xl">{cat.emoji}</span>
          <span className="flex-1 text-sm font-medium text-text-primary">{cat.name}</span>
          <button onClick={() => setForm({ ...cat })} className="p-2 text-text-secondary hover:text-accent rounded-lg hover:bg-surface">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(cat.id)} className="p-2 text-text-secondary hover:text-red-500 rounded-lg hover:bg-red-50">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

function CategoryForm({ form, onChange, onSave, onCancel, saving }) {
  return (
    <div className="bg-surface rounded-xl p-4 space-y-3">
      <Input
        label="Category name"
        placeholder="e.g. House"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
      />
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">Emoji</p>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => onChange({ ...form, emoji: e })}
              className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-colors ${
                form.emoji === e ? 'bg-accent/10 ring-2 ring-accent' : 'bg-surface hover:bg-border-line'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onSave} className="flex-1" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
