import app from "./app";
import connectDB from "./config/database";
import { envConfig } from "./config/env";

const PORT = envConfig.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
