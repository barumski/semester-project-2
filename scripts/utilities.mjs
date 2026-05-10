export function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function getFromStorage(key) {
    const value = localStorage.getItem(key);

    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

export function removeFromStorage(key) {
    localStorage.removeItem(key);
}

export function getTimeLeft(endDate, showSeconds = false) {
    const now = new Date();
    const end = new Date(endDate);
    const difference = end - now;

    if (difference <= 0) {
        return 'Ended';
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    if (showSeconds) {
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
        }
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s left`;
        }

        if (minutes > 0) {
            return `${minutes}m ${seconds}s left`;
        }

        return `${seconds}s left`;
    }

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m left`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes}m left`;
    }

    return `${minutes}m left`;
}