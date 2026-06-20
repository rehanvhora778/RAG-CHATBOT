import api from './axios'

export const authAPI = {
  register:       (data)  => api.post('/api/auth/register/', data),
  login:          (data)  => api.post('/api/auth/login/', data),
  logout:         (data)  => api.post('/api/auth/logout/', data),
  refreshToken:   (data)  => api.post('/api/auth/token/refresh/', data),
  getProfile:     ()      => api.get('/api/auth/profile/'),
  updateProfile:  (data)  => api.put('/api/auth/profile/', data),
  changePassword: (data)  => api.post('/api/auth/change-password/', data),
}
