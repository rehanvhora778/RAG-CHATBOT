import api from './axios'

export const analyticsAPI = {
  getUserAnalytics: () => api.get('/api/analytics/'),
  getDashboard:     () => api.get('/api/analytics/dashboard/'),
}

export const adminAPI = {
  getStats:       ()               => api.get('/api/admin-panel/stats/'),
  getUsers:       (params)         => api.get('/api/admin-panel/users/', { params }),
  getUser:        (id)             => api.get(`/api/admin-panel/users/${id}/`),
  updateUser:     (id, data)       => api.patch(`/api/admin-panel/users/${id}/`, data),
  deleteUser:     (id)             => api.delete(`/api/admin-panel/users/${id}/`),
  getDocuments:   (params)         => api.get('/api/admin-panel/documents/', { params }),
  deleteDocument: (id)             => api.delete(`/api/admin-panel/documents/${id}/`),
  getChats:       (params)         => api.get('/api/admin-panel/chats/', { params }),
  deleteChat:     (id)             => api.delete(`/api/admin-panel/chats/${id}/`),
}
