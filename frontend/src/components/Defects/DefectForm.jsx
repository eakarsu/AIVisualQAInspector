import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DefectForm({ initialData = {}, onSubmit, onCancel }) {
  const [products, setProducts] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [formData, setFormData] = useState({
    product_id: initialData.product_id || '',
    inspection_id: initialData.inspection_id || '',
    defect_type: initialData.defect_type || '',
    severity: initialData.severity || 'medium',
    description: initialData.description || '',
    location: initialData.location || '',
    image_url: initialData.image_url || ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, inspectionsRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/inspections')
        ]);
        setProducts(productsRes.data);
        setInspections(inspectionsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.inspection_id) {
      delete payload.inspection_id;
    }
    onSubmit(payload);
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
        <label>Related Inspection (Optional)</label>
        <select
          name="inspection_id"
          value={formData.inspection_id}
          onChange={handleChange}
        >
          <option value="">None</option>
          {inspections.map((inspection) => (
            <option key={inspection.id} value={inspection.id}>
              #{inspection.id} - {inspection.product?.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Defect Type</label>
        <input
          type="text"
          name="defect_type"
          value={formData.defect_type}
          onChange={handleChange}
          placeholder="e.g., Scratch, Dent, Crack"
          required
        />
      </div>
      <div className="form-group">
        <label>Severity</label>
        <select
          name="severity"
          value={formData.severity}
          onChange={handleChange}
          required
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Upper right corner"
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
          {initialData.id ? 'Save Changes' : 'Report Defect'}
        </button>
      </div>
    </form>
  );
}

export default DefectForm;
