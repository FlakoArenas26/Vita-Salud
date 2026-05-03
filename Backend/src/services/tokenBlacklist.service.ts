/**
 * Servicio de blacklist de tokens JWT
 * En desarrollo usa un Set en memoria
 * En producción, debería usar Redis para persistencia
 */

class TokenBlacklistService {
    private blacklist: Set<string> = new Set();
    private tokenExpirations: Map<string, number> = new Map();

    /**
     * Agregar token a la blacklist
     * @param token Token JWT a invalidar
     * @param expiresAt Timestamp de expiración del token
     */
    addToBlacklist(token: string, expiresAt: number): void {
        this.blacklist.add(token);
        this.tokenExpirations.set(token, expiresAt);

        // Programar limpieza automática cuando el token expire
        const timeToExpiry = (expiresAt * 1000) - Date.now();
        if (timeToExpiry > 0) {
            setTimeout(() => {
                this.removeFromBlacklist(token);
            }, timeToExpiry + 1000); // +1s buffer
        }
    }

    /**
     * Verificar si un token está en la blacklist
     * @param token Token JWT a verificar
     * @returns true si está en la blacklist, false si no
     */
    isBlacklisted(token: string): boolean {
        return this.blacklist.has(token);
    }

    /**
     * Remover token de la blacklist
     * @param token Token JWT a remover
     */
    removeFromBlacklist(token: string): void {
        this.blacklist.delete(token);
        this.tokenExpirations.delete(token);
    }

    /**
     * Obtener el tamaño actual de la blacklist
     * @returns Número de tokens en la blacklist
     */
    getSize(): number {
        return this.blacklist.size;
    }

    /**
     * Limpiar toda la blacklist (útil para testing)
     */
    clear(): void {
        this.blacklist.clear();
        this.tokenExpirations.clear();
    }
}

export default new TokenBlacklistService();
