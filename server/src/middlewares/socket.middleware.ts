type SocketPacket = [string, ...unknown[]];

export const jsonParseMiddleware = (
    packet: SocketPacket,
    next: (err?: Error) => void,
) => {
    console.log("packet", packet);
    for (let i = 1; i < packet.length; i++) {
        const arg = packet[i];
        console.log("packet type", typeof arg);

        if (typeof arg === "string") {
            try {
                const trimmed = arg.trim();
                if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
                    packet[i] = JSON.parse(arg) as unknown;
                }
            } catch {
                // Do nothing
            }
        }
    }

    next();
};
