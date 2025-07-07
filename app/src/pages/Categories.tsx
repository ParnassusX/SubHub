import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, Tag, Palette } from 'lucide-react'
import { useSubscriptions } from '../contexts/SubscriptionContext'
import { getCategoryDotProps } from '../utils/categoryColors'
import { useCategories } from '../hooks/useCategories'
import { ComponentLoader } from '../components/UnifiedLoading'
import { IconPicker, renderIcon } from '../components/IconPicker'

export default function Categories() {
  const { subscriptions } = useSubscriptions()
  const {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    updateSubscriptionCounts
  } = useCategories()

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3b82f6',
    icon: null as string | null
  })

  // Fixed color options for reliable color selection
  const fixedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  // Debounced color update to prevent excessive database calls
  const debouncedColorUpdate = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (categoryId: string, color: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleUpdateCategory(categoryId, { color });
        }, 500); // 500ms debounce
      };
    })(),
    []
  );




  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return

    try {
      await createCategory({
        name: newCategory.name,
        color: newCategory.color,
        icon: newCategory.icon || undefined
      });
      setNewCategory({ name: '', color: '#3b82f6', icon: null });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async (id: string, updates: { name?: string; color?: string; icon?: string | null }) => {
    try {
      await updateCategory({ id, updates });
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setDeletingCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex-1 bg-[#0f1a24] text-white">
        <div className="w-full max-w-full min-w-0">
          <ComponentLoader message="Loading categories..." />
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

                  {/* Fixed Color Options */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {fixedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          newCategory.color === color
                            ? 'border-white scale-110'
                            : 'border-[#2e4e6b] hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {/* Custom Color Picker */}
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                  <IconPicker
                    selectedIcon={newCategory.icon}
                    onIconSelect={(icon) => setNewCategory(prev => ({ ...prev, icon }))}
                  />
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
                    setNewCategory({ name: '', color: '#3b82f6', icon: null })
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
                    <div className="flex items-center gap-2">
                      <div {...getCategoryDotProps(category.name)} />
                      {category.icon && renderIcon(category.icon, 'w-4 h-4 text-gray-300')}
                    </div>
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
                      onClick={() => setDeletingCategory(category.id)}
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

                    {/* Quick Color Options */}
                    <div className="flex gap-1">
                      {fixedColors.slice(0, 3).map((color) => (
                        <button
                          key={color}
                          onClick={() => handleUpdateCategory(category.id, { color })}
                          className={`w-4 h-4 rounded border transition-all ${
                            category.color === color
                              ? 'border-white scale-110'
                              : 'border-gray-500 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={`Set color to ${color}`}
                        />
                      ))}
                    </div>

                    {/* Custom Color Picker */}
                    <input
                      type="color"
                      value={category.color}
                      onChange={(e) => debouncedColorUpdate(category.id, e.target.value)}
                      className="w-6 h-6 rounded border border-[#2e4e6b] cursor-pointer"
                      title="Custom color"
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

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a2332] border border-[#2e4e6b] rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">Delete Category</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deletingCategory)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
