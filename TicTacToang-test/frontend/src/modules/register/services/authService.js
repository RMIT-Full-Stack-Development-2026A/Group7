import { httpHelper } from '../../../services/httpHelper'
import { AUTH_API }   from '../../../config/api/auth.api' 
export const registerPlayer = async (formData) => {
  const { confirmPassword, ...payload } = formData
  return httpHelper.post(AUTH_API.register, payload)
}