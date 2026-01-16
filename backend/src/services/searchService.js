import Fuse from 'fuse.js';
import Book from '../models/Book.js';
import logger from '../utils/logger.js';
import { getCache } from '../utils/cacheManager.js';

/**
 * Advanced Search Service
 * Uses Fuse.js for fuzzy searching, typo tolerance, and relevance scoring.
 * Ideal for catalogs < 10,000 items.
 */
class SearchService {
    constructor() {
        this.fuse = null;
        this.isInitialized = false;
        this.lastUpdated = null;

        // Configuration for "Amazon-like" search experience
        this.options = {
            isCaseSensitive: false,
            includeScore: true,
            shouldSort: true,
            includeMatches: true,
            findAllMatches: true,
            minMatchCharLength: 2,
            location: 0,
            threshold: 0.3, // 0.0 = perfect match, 1.0 = match anything. 0.3 is good for typos.
            distance: 100,
            keys: [
                { name: 'title.display', weight: 0.5 },
                { name: 'title.english', weight: 0.4 },
                { name: 'title.odia', weight: 0.4 },
                { name: 'author', weight: 0.3 },
                { name: 'tags', weight: 0.3 },
                { name: 'category', weight: 0.2 },
                { name: 'description', weight: 0.1 },
            ],
        };
    }

    /**
     * Initialize or refresh the search index
     */
    async refreshIndex() {
        try {
            const startTime = Date.now();
            logger.debug('Refreshing search index...');

            // Fetch only necessary fields to keep memory usage low
            const rawBooks = await Book.find({ isDeleted: { $ne: true } })
                .select('title author description tags category language price')
                .lean();

            // Normalize books: Ensure title is an object for Fuse.js keys
            const books = rawBooks.map(book => ({
                ...book,
                title: typeof book.title === 'string'
                    ? { display: book.title, english: book.title, odia: null }
                    : book.title
            }));

            this.fuse = new Fuse(books, this.options);

            this.lastUpdated = Date.now();
            this.isInitialized = true;

            const duration = Date.now() - startTime;
            logger.info('Search index refreshed', {
                itemCount: books.length,
                durationMs: duration
            });
        } catch (error) {
            logger.error('Failed to refresh search index', error);
        }
    }

    /**
     * Ensure index is ready (lazy load)
     */
    async ensureIndex() {
        // If not initialized or stale (> 1 hour), refresh
        if (!this.isInitialized || (Date.now() - this.lastUpdated > 3600000)) {
            await this.refreshIndex();
        }
    }

    /**
     * Perform a fuzzy search
     * @param {string} query - Search query
     * @param {number} limit - Max results
     * @returns {Array} Search results (IDs and scores)
     */
    async search(query, limit = 50) {
        if (!query) return [];
        await this.ensureIndex();

        const results = this.fuse.search(query);

        // Return formatted results
        return results.slice(0, limit).map(result => ({
            _id: result.item._id,
            score: result.score,
            item: result.item,
        }));
    }

    /**
     * Get autocompletion suggestions
     * @param {string} text - Partial text
     * @returns {Array} Suggestions
     */
    async getSuggestions(text) {
        if (!text || text.length < 2) return [];
        await this.ensureIndex();

        // Perform a search with slightly looser threshold for suggestions
        const results = this.fuse.search(text, { limit: 10 });

        const suggestions = new Set();

        results.forEach(result => {
            // Add title matches
            if (result.item.title?.display) suggestions.add(result.item.title.display);
            // Add author matches
            if (result.item.author) suggestions.add(result.item.author);
        });

        return Array.from(suggestions).slice(0, 8);
    }
}

// Singleton instance
const searchService = new SearchService();
export default searchService;
