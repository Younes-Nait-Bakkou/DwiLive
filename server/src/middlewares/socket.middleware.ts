type SocketPacket = [string, ...unknown[]];

export const jsonParseMiddleware = (
    packet: SocketPacket,
    next: (err?: Error) => void,
) => {
    for (let i = 1; i < packet.length; i++) {
        const arg = packet[i];

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
