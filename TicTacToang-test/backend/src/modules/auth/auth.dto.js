export const registerResponseDTO = (user) => ({
  id:       user._id,
  username: user.username,
  email:    user.email,
  country:  user.country,
  role:     user.role,
})

export const loginResponseDTO = (user, token) => ({
  token,
  user: {
    id:        user._id,
    username:  user.username,
    email:     user.email,
    role:      user.role,
    isPremium: user.isPremium,
    avatar:    user.avatar,
    country:   user.country,
  },
})