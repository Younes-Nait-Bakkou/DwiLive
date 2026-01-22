import "socket.io";
import type { IUser } from "../models/User.js";

declare module "socket.io" {
    interface Socket {
        user: IUser; // Not optional since it's required by all socket events
    }
}
