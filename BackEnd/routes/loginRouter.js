import express from 'express';

import {
	signIn
} from '../controllers/loginController.js';

const router = express.Router();

//Sign in route
router.post('/sign-in', signIn);


export default router;