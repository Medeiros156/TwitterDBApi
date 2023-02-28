import { main } from "../TwitterBotDb.js";

export default function handler(req, res) {
    main()
    res.status(200).end('Cron!');
  }