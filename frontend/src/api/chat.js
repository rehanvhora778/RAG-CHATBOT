import api from './axios'

export const chatAPI = {
  listSessions:   (params)         => api.get('/api/chat/sessions/', { params }),
  createSession:  (data)           => api.post('/api/chat/sessions/', data),
  getSession:     (id)             => api.get(`/api/chat/sessions/${id}/`),
  updateSession:  (id, data)       => api.patch(`/api/chat/sessions/${id}/`, data),
  deleteSession:  (id)             => api.delete(`/api/chat/sessions/${id}/`),
  sendMessage:    (id, data)       => api.post(`/api/chat/sessions/${id}/message/`, data),
  exportPDF:      (id)             => api.get(`/api/chat/sessions/${id}/export/`, { responseType: 'blob' }),
  search:         (params)         => api.get('/api/chat/search/', { params }),
}
