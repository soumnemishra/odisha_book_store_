import logger from './logger.js';

/**
 * In-Memory Cache Manager
 * LRU (Least Recently Used) cache with TTL support
 * Redis-compatible interface for easy migration
 * 
 * Used by Amazon/Flipkart to reduce database load
 */

/**
 * Default cache configuration
 */
const DEFAULT_OPTIONS = {
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
    defaultTTL: parseInt(process.env.CACHE_TTL_DEFAULT || '300', 10) * 1000, // 5 minutes
    cleanupInterval: 60000, // Cleanup every minute
    enableStats: true,
};

/**
 * Cache Entry class
 */
class CacheEntry {
    constructor(value, ttl) {
        this.value = value;
        this.createdAt = Date.now();
        this.expiresAt = ttl ? Date.now() + ttl : null;
        this.lastAccessed = Date.now();
        this.accessCount = 0;
    }

    isExpired() {
        return this.expiresAt !== null && Date.now() > this.expiresAt;
    }

    touch() {
        this.lastAccessed = Date.now();
        this.accessCount++;
    }
}

/**
 * LRU Cache Implementation
 */
class CacheManager {
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
        };

        // Start cleanup interval
        this.cleanupTimer = setInterval(
            () => this.cleanup(),
            this.options.cleanupInterval
        );
        this.cleanupTimer.unref(); // Don't prevent process exit

        logger.debug('Cache manager initialized', {
            maxSize: this.options.maxSize,
            defaultTTL: this.options.defaultTTL,
        });
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {*} Cached value or undefined
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            this.stats.misses++;
            return undefined;
        }

        if (entry.isExpired()) {
            this.delete(key);
            this.stats.misses++;
            return undefined;
        }

        entry.touch();
        this.stats.hits++;

        // Move to end for LRU
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    /**
     * Set a value in cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - TTL in milliseconds (optional)
     * @returns {boolean} Success
     */
    set(key, value, ttl = this.options.defaultTTL) {
        // Evict if at capacity
        if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }

        const entry = new CacheEntry(value, ttl);
        this.cache.set(key, entry);
        this.stats.sets++;

        return true;
    }

    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     * @returns {boolean} Whether key existed
     */
    delete(key) {
        const existed = this.cache.has(key);
        if (existed) {
            this.cache.delete(key);
            this.stats.deletes++;
        }
        return existed;
    }

    /**
     * Check if key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        if (entry.isExpired()) {
            this.delete(key);
            return false;
        }
        return true;
    }

    /**
     * Get multiple values
     * @param {Array<string>} keys - Cache keys
     * @returns {Object} Object with key-value pairs
     */
    mget(keys) {
        const result = {};
        for (const key of keys) {
            result[key] = this.get(key);
        }
        return result;
    }

    /**
     * Set multiple values
     * @param {Object} entries - Object with key-value pairs
     * @param {number} ttl - TTL in milliseconds
     */
    mset(entries, ttl) {
        for (const [key, value] of Object.entries(entries)) {
            this.set(key, value, ttl);
        }
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        logger.info('Cache cleared');
    }

    /**
     * Get cache size
     * @returns {number}
     */
    size() {
        return this.cache.size;
    }

    /**
     * Get all keys
     * @returns {Array<string>}
     */
    keys() {
        return Array.from(this.cache.keys());
    }

    /**
     * Evict least recently used entry
     */
    evictLRU() {
        // Map maintains insertion order, first is LRU
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
            this.cache.delete(firstKey);
            this.stats.evictions++;
        }
    }

    /**
     * Cleanup expired entries
     */
    cleanup() {
        let cleaned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.isExpired()) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            logger.debug('Cache cleanup', { entriesRemoved: cleaned });
        }
    }

    /**
     * Get cache statistics
     * @returns {Object}
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            ...this.stats,
            size: this.cache.size,
            maxSize: this.options.maxSize,
            hitRate: total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + '%' : '0%',
            memoryUsage: this.estimateMemoryUsage(),
        };
    }

    /**
     * Estimate memory usage (rough approximation)
     * @returns {string}
     */
    estimateMemoryUsage() {
        let bytes = 0;
        for (const [key, entry] of this.cache.entries()) {
            bytes += key.length * 2; // Key size
            bytes += JSON.stringify(entry.value).length * 2; // Value size (approximate)
            bytes += 64; // Entry metadata
        }

        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
        };
    }

    /**
     * Wrap a function with caching
     * @param {string} keyPrefix - Cache key prefix
     * @param {Function} fn - Async function to wrap
     * @param {Object} options - Cache options
     * @returns {Function} Wrapped function
     */
    wrap(keyPrefix, fn, options = {}) {
        const { ttl, keyGenerator } = options;

        return async (...args) => {
            const cacheKey = keyGenerator
                ? `${keyPrefix}:${keyGenerator(...args)}`
                : `${keyPrefix}:${JSON.stringify(args)}`;

            // Check cache
            const cached = this.get(cacheKey);
            if (cached !== undefined) {
                logger.debug('Cache hit', { key: cacheKey });
                return cached;
            }

            // Execute function
            const result = await fn(...args);

            // Cache result
            this.set(cacheKey, result, ttl);
            logger.debug('Cache set', { key: cacheKey });

            return result;
        };
    }

    /**
     * Invalidate cache entries by pattern
     * @param {string} pattern - Key pattern (supports * wildcard)
     * @returns {number} Number of entries removed
     */
    invalidatePattern(pattern) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        let removed = 0;

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                removed++;
            }
        }

        logger.debug('Cache invalidation', { pattern, entriesRemoved: removed });
        return removed;
    }

    /**
     * Stop the cache manager
     */
    stop() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        logger.info('Cache manager stopped');
    }
}

// Singleton instance
let defaultCache = null;

/**
 * Get default cache instance
 * @returns {CacheManager}
 */
export const getCache = () => {
    if (!defaultCache) {
        defaultCache = new CacheManager();
    }
    return defaultCache;
};

/**
 * Common cache key generators
 */
export const CacheKeys = {
    /**
     * Generate key for book listing
     */
    bookList: (filters) => `books:list:${JSON.stringify(filters)}`,

    /**
     * Generate key for single book
     */
    book: (id) => `books:${id}`,

    /**
     * Generate key for categories
     */
    categories: () => 'books:categories',

    /**
     * Generate key for user
     */
    user: (id) => `users:${id}`,

    /**
     * Generate key for filter stats
     */
    filterStats: () => 'books:filter-stats',
};

/**
 * Cache TTL presets (in milliseconds)
 */
export const CacheTTL = {
    SHORT: 60 * 1000,         // 1 minute
    MEDIUM: 5 * 60 * 1000,    // 5 minutes
    LONG: 30 * 60 * 1000,     // 30 minutes
    HOUR: 60 * 60 * 1000,     // 1 hour
    DAY: 24 * 60 * 60 * 1000, // 1 day
};

export { CacheManager };
export default getCache;
