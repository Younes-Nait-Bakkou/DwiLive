import connectDB from "../config/db.js";
import config from "../config/index.js";
import { seedUsers, type SeedUsersArgs } from "./users.seed.js";

console.log("process.argv0", process.argv[0]);
console.log("process.argv1", process.argv[1]);

const args = process.argv.slice(2);

const runSeeds = async () => {
    try {
        await connectDB(config.MONGODB_URI);
        console.log("Database connected!");

        const seedUsersArgs: SeedUsersArgs = {
            clearUsers: args.includes("--clear-users"),
        };

        if (args.includes("--users")) await seedUsers(seedUsersArgs);

        process.exit(0);
    } catch (error) {
        console.log("Seeding failed:", error);
        process.exit(1);
    }
};

runSeeds();
