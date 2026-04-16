import { Router }    from 'express'
import * as ctrl     from './auth.controller.js'
import bruteForce    from '../../middleware/bruteForce.js'

const router = Router()

router.get('/', ctrl.getAllUsers)
router.post('/register', ctrl.register)
router.post('/login',    bruteForce, ctrl.login)

export default router
