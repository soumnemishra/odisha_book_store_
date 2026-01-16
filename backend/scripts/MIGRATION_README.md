# MongoDB Books Collection Schema Migration

## Overview
Production-ready migration scripts to upgrade the `books` collection from flat structure to nested schema with Odia language support.

## What Changed

### Old Schema (Flat)
```javascript
{
  title: "ଓଡ଼ିଆ ସାହିତ୍ୟ",      // String
  price: 250                  // Number
}
```

### New Schema (Nested)
```javascript
{
  title: {
    display: "ଓଡ଼ିଆ ସାହିତ୍ୟ",
    odia: "ଓଡ଼ିଆ ସାହିତ୍ୟ",
    english: undefined
  },
  price: {
    original: 250,
    discounted: 250,
    discountPercent: 0
  },
  language: "Odia",           // NEW
  academicGrade: null,        // NEW
  tags: []                    // NEW
}
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run migrate:books:test` | Run tests to validate migration logic |
| `npm run migrate:books:dry-run` | Preview migration without making changes |
| `npm run migrate:books` | Execute migration (LIVE) |
| `npm run migrate:books:rebuild-indexes` | Rebuild MongoDB indexes after migration |
| `npm run migrate:books:rollback:dry-run` | Preview rollback |
| `npm run migrate:books:rollback` | Rollback migration (LIVE) |

## Migration Steps

### 1. Backup Database (CRITICAL!)
```bash
# Create backup before migration
mongodump --uri="mongodb://localhost:27017/odisha_bookstore" --out=./backup-$(date +%Y%m%d)
```

### 2. Run Tests
```bash
npm run migrate:books:test
```
Expected output:
```
✅ Passed: 13
❌ Failed: 0
🎉 ALL TESTS PASSED!
```

### 3. Dry Run (Preview)
```bash
npm run migrate:books:dry-run
```
This shows:
- How many docs will be migrated
- Sample transformations (first 5 documents)
- Language detection results
- No actual database changes

### 4. Execute Migration
```bash
npm run migrate:books
```

### 5. Rebuild Indexes
```bash
npm run migrate:books:rebuild-indexes
```
This:
- Drops old `title_text` and `title_1` indexes
- Creates new indexes on `title.display`, `title.english`, `title.odia`
- Adds indexes on `language` and `tags` fields

### 6. Verify
```bash
# Check a few documents in MongoDB Compass or shell
db.books.findOne()

# Test API endpoints
curl http://localhost:5000/api/books
```

## Backward Compatibility

The updated `Book.js` model includes **virtuals** to maintain API compatibility:

```javascript
// Old API code still works!
book.titleDisplay  // → book.title.display
book.finalPrice    // → book.price.discounted || book.price.original
book.hasDiscount   // → book.price.discountPercent > 0
book.savings       // → original - discounted
```

Enable virtuals in queries:
```javascript
// In your controllers
const books = await Book.find().select('+titleDisplay +finalPrice');

// Virtuals are automatically included in JSON responses
res.json(book); // includes titleDisplay, finalPrice, etc.
```

## Language Detection

Uses Unicode range **U+0B00–U+0B7F** (Odia script block):
- If title contains Odia characters → `language: 'Odia'`, `title.odia: value`
- If title is English only → `language: 'English'`, `title.english: value`

## Safety Features

✅ **Idempotent**: Running twice won't double-migrate (checks if `title` is already an object)  
✅ **Memory Efficient**: Uses MongoDB cursors, not `.find()` (safe for large collections)  
✅ **Error Handling**: Logs failed documents, continues processing  
✅ **Dry-Run Mode**: Preview changes before committing  
✅ **Rollback Script**: Revert to original schema if needed  
✅ **Progress Tracking**: Real-time console output with counts

## Rollback

If something goes wrong:
```bash
# Preview rollback
npm run migrate:books:rollback:dry-run

# Execute rollback
npm run migrate:books:rollback
```

⚠️ **Note**: After rollback, you must also revert `src/models/Book.js` to the old schema (git checkout).

## Frontend Updates Required

After migration, update frontend code to use nested fields:

### Before
```javascript
<h3>{book.title}</h3>
<p>Price: ₹{book.price}</p>
```

### After (Option 1: Use virtuals)
```javascript
<h3>{book.titleDisplay}</h3>
<p>Price: ₹{book.finalPrice}</p>
```

### After (Option 2: Use nested fields)
```javascript
<h3>{book.title.display}</h3>
<p>Price: ₹{book.price.discounted || book.price.original}</p>
{book.hasDiscount && <span>Save ₹{book.savings}</span>}
```

## Troubleshooting

**Error: "title_text index not found"**  
→ Ignore this; it means the index was already dropped or never existed.

**Error: "Cannot read property 'display' of string"**  
→ Some documents weren't migrated. Run migration again (it's idempotent).

**Frontend shows `[object Object]` for titles**  
→ Update frontend to use `book.titleDisplay` or `book.title.display`.

## Environment Variables

Required in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/odisha_bookstore
# or
MONGODB_URI=mongodb://localhost:27017/odisha_bookstore
```

## Files Created

```
backend/
├── scripts/
│   ├── migrate-books-schema.js          # Main migration script
│   ├── rollback-books-schema.js         # Rollback to old schema
│   ├── rebuild-indexes.js               # Index management
│   └── test-migration.js                # Validation tests
├── src/models/Book.js                   # Updated schema with virtuals
└── scripts/MIGRATION_README.md          # This file
```

## Support

If migration fails or produces unexpected results:
1. Check error logs in console output
2. Verify `.env` has correct `MONGO_URI`
3. Restore from backup if needed: `mongorestore ./backup-YYYYMMDD`
4. Contact the development team with error logs
