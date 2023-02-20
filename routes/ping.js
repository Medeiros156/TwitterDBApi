import express from 'express';
import { pingReceive } from '../controllers/ping.js'


const router = express.Router();


router.get('/ping', pingReceive);

// router.post('/', );
 
// router.get('/:id', );

// router.delete('/:id', );

// router.patch('/:id', );

export default router;