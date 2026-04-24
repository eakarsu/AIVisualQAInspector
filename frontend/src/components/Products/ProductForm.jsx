import React, { useState } from 'react';

function ProductForm({ initialData = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    sku: initialData.sku || '',
    category: initialData.category || '',
    description: initialData.description || '',
    image_url: initialData.image_url || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>SKU</label>
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>
      <div className="form-group">
        <label>Image URL</label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
        />
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData.id ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
