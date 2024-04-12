export const toMilliseconds = (time) => {
    if (!time) return;

    const timeType = time.slice(-1);
    time = time.slice(0, -1); // Remove the last character of string.

    switch (timeType) {
        case "s":
            return time * 1000;
        case "m":
            return time * 60 * 1000;
        case "h":
            return time * 60 * 60 * 1000;
        case "d":
            return time * 24 * 60 * 60 * 1000;
        default:
            console.error("Could not convert the given time to milliseconds");
            break;
    }
};