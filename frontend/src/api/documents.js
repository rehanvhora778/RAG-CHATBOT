import api from './axios'

export const documentsAPI = {
  list:       (params) => api.get('/api/documents/', { params }),
  upload:     (formData) => api.post('/api/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  get:        (id)     => api.get(`/api/documents/${id}/`),
  delete:     (id)     => api.delete(`/api/documents/${id}/`),
  getSummary: (id)     => api.get(`/api/documents/${id}/summary/`),
  regenSummary: (id)   => api.post(`/api/documents/${id}/summary/`),
}
