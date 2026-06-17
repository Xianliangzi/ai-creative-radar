import React from 'react'

function CategoryFilter({ categories, activeCategory, onChange }) {
  return (
    <section className="category-console" aria-label="Signal categories">
      <div className="section-title">
        <span>Browse folders</span>
        <span>{activeCategory}</span>
      </div>
      <div className="category-list">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-button ${activeCategory === category ? 'is-active' : ''}`}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  )
}

export default CategoryFilter
