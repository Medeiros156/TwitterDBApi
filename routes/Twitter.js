import express from 'express';
import { getTweetsFromDb, getRefFromDb, getUser } from '../controllers/Twitter.js'


const router = express.Router();


router.get('/tweets', getTweetsFromDb);
router.get('/user', getUser);
router.get('/ref', getRefFromDb);
// router.post('/', );
 
// router.get('/:id', );

// router.delete('/:id', );

// router.patch('/:id', );

export default router;