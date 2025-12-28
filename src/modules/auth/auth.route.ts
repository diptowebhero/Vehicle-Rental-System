import { Router } from 'express'
import * as controller from './auth.controller'


const router = Router()
router.post('/signup', controller.signup)
router.post('/signin', controller.signin)

export default router