import { httpHelper } from '../../../services/httpHelper'
import { AUTH_API }   from '../../../config/api/auth.api' 

export const loginPlayer = async ({ identifier, password }) =>
  httpHelper.post(AUTH_API.login, {
    identifier: identifier.trim(),
    password: password.trim(),
  })
