import { main } from "../controllers/Twitter";

export default function handler(req, res) {
    main()
    res.status(200).end('Cron!');
  }