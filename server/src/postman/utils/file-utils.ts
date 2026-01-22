import { usersToSeed } from "../../seeds/users.seed.js";

export function extractUsersFromSeed(): string[] {
    return usersToSeed.map((user) => user.username);
}
