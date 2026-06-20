import React from 'react'

function getCategoryLabel(category) {
  return category === 'All' ? '全部 / All' : category
}

function CategoryFilter({ categories, activeCategory, onChange }) {
  return (
    <section className="category-console" aria-label="Signal categories">
      <div className="section-title">
        <span>
          <strong>分类浏览</strong>
          <small>Browse Folders</small>
        </span>
        <span>{getCategoryLabel(activeCategory)}</span>
      </div>
      <div className="category-list">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-button ${activeCategory === category ? 'is-active' : ''}`}
            onClick={() => onChange(category)}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>
    </section>
  )
}

export default CategoryFilter
