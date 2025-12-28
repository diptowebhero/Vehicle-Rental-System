import app from './app';
import initDB from './config/db';
import { errorHandler } from './middlewares/error.middleware';
app.use(errorHandler);
// initialize database
initDB()

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))