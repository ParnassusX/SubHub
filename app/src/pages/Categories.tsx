import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Tag, Palette } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useSubscriptions } from '../contexts/SubscriptionContext'
import { Database } from '../types/supabase'

type Category = Database['public']['Tables']['categories']['Row'] & {
  subscription_count?: number
}

export default function Categories() {
  const { user } = useAuth()
  const { subscriptions } = useSubscriptions()
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3b82f6'
  })

  // Default categories that every user gets
  const defaultCategories = [
    { name: 'Entertainment', color: '#ef4444' },
    { name: 'Productivity', color: '#3b82f6' },
    { name: 'Health & Fitness', color: '#10b981' },
    { name: 'Education', color: '#f59e0b' },
    { name: 'Business', color: '#8b5cf6' },
    { name: 'Other', color: '#6b7280' }
  ]

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  // Update category counts when subscriptions change
  useEffect(() => {
    if (categories.length > 0) {
      const updatedCategories = categories.map((category) => {
        const count = subscriptions.filter(sub => sub.category === category.name).length
        return { ...category, subscription_count: count }
      })
      setCategories(updatedCategories)
    }
  }, [subscriptions])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.categories.getAll()

      if (error) throw error

      // If no categories exist, create default ones
      if (!data || data.length === 0) {
        await createDefaultCategories()
        return
      }

      // Add subscription counts for each category using context data
      const categoriesWithCounts = data.map((category) => {
        const count = subscriptions.filter(sub => sub.category === category.name).length
        return { ...category, subscription_count: count }
      })

      setCategories(categoriesWithCounts)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback to showing default categories
      setCategories(defaultCategories.map((cat, index) => ({
        id: `default-${index}`,
        ...cat,
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: null,
        subscription_count: 0
      })))
    } finally {
      setLoading(false)
    }
  }

  const createDefaultCategories = async () => {
    try {
      const promises = defaultCategories.map(cat =>
        db.categories.create({
          name: cat.name,
          color: cat.color,
          user_id: user?.id || ''
        })
      )

      const results = await Promise.all(promises)
      const newCategories = results.map(result => result.data).filter((data): data is Category => data !== null)

      // Add subscription counts to new categories
      const categoriesWithCounts = newCategories.map(cat => ({
        ...cat,
        subscription_count: 0
      }))

      setCategories(categoriesWithCounts)
    } catch (error) {
      console.error('Error creating default categories:', error)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim() || !user?.id) return

    try {
      const { data, error } = await db.categories.create({
        name: newCategory.name,
        color: newCategory.color,
        user_id: user.id
      })

      if (error) throw error
      if (data) {
        setCategories(prev => [...prev, { ...data, subscription_count: 0 }])
        setNewCategory({ name: '', color: '#3b82f6' })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await db.categories.update(id, updates)

      if (error) throw error
      if (data) {
        setCategories(prev => prev.map(cat =>
          cat.id === id
            ? { ...data, subscription_count: cat.subscription_count }
            : cat
        ))
        setEditingCategory(null)
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const { error } = await db.categories.delete(id)

      if (error) throw error
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex-1 bg-[#0f1a24] text-white">
        <div className="w-full max-w-full min-w-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading categories...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#0f1a24] text-white">
      <div className="w-full max-w-full min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b border-[#2e4e6b]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Categories</h1>
            <p className="text-gray-400 mt-1">Organize your subscriptions by category</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Search */}
        <div className="p-4 sm:p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a2332] border border-[#2e4e6b] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Add Category Form */}
        {showAddForm && (
          <div className="p-4 sm:p-6 border-b border-[#2e4e6b]">
            <div className="bg-[#1a2332] rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0f1a24] border border-[#2e4e6b] rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 bg-[#0f1a24] border border-[#2e4e6b] rounded-lg cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#0f1a24] border border-[#2e4e6b] rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.name.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                >
                  Add Category
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewCategory({ name: '', color: '#3b82f6' })
                  }}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-[#1a2332] rounded-xl p-4 border border-[#2e4e6b] hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    {editingCategory === category.id ? (
                      <input
                        type="text"
                        defaultValue={category.name}
                        onBlur={(e) => {
                          if (e.target.value.trim() && e.target.value !== category.name) {
                            handleUpdateCategory(category.id, { name: e.target.value.trim() })
                          } else {
                            setEditingCategory(null)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          } else if (e.key === 'Escape') {
                            setEditingCategory(null)
                          }
                        }}
                        className="flex-1 bg-[#0f1a24] border border-[#2e4e6b] rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <h3 className="font-semibold text-white">{category.name}</h3>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingCategory(category.id)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Tag className="w-4 h-4" />
                    <span>{category.subscription_count || 0} subscription{(category.subscription_count || 0) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gray-400" />
                    <input
                      type="color"
                      value={category.color}
                      onChange={(e) => handleUpdateCategory(category.id, { color: e.target.value })}
                      className="w-6 h-6 rounded border border-[#2e4e6b] cursor-pointer"
                      title="Change color"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No categories found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first category to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Add Category
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
