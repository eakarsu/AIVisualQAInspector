import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InspectionForm({ initialData = {}, onSubmit, onCancel }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: initialData.product_id || '',
    inspector_name: initialData.inspector_name || '',
    status: initialData.status || 'pending',
    notes: initialData.notes || '',
    image_url: initialData.image_url || ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

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
        <label>Product</label>
        <select
          name="product_id"
          value={formData.product_id}
          onChange={handleChange}
          required
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Inspector Name</label>
        <input
          type="text"
          name="inspector_name"
          value={formData.inspector_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
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
          {initialData.id ? 'Save Changes' : 'Create Inspection'}
        </button>
      </div>
    </form>
  );
}

export default InspectionForm;
