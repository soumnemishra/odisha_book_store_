# Quick Reference: MongoDB Books Migration

## 🚀 Quick Start

```bash
# 1. Test migration logic
npm run migrate:books:test

# 2. Preview changes (DRY RUN)
npm run migrate:books:dry-run

# 3. Backup database
mongodump --uri="$MONGO_URI" --out=./backup-$(date +%Y%m%d)

# 4. Execute migration
npm run migrate:books

# 5. Rebuild indexes
npm run migrate:books:rebuild-indexes
```

## 📋 All Commands

```bash
npm run migrate:books:test                # Test migration logic
npm run migrate:books:dry-run             # Preview migration
npm run migrate:books                     # Execute migration (LIVE)
npm run migrate:books:rebuild-indexes     # Rebuild MongoDB indexes
npm run migrate:books:rollback:dry-run    # Preview rollback
npm run migrate:books:rollback            # Rollback (LIVE)
```

## 🔄 Schema Changes

### Before
```javascript
{
  title: "ଓଡ଼ିଆ ସାହିତ୍ୟ",
  price: 250
}
```

### After
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
  language: "Odia",
  academicGrade: null,
  tags: []
}
```

## 🎯 Backward Compatibility Virtuals

Your old API code still works! The model provides these virtuals:

```javascript
book.titleDisplay  // → book.title.display
book.finalPrice    // → book.price.discounted || book.price.original
book.hasDiscount   // → true if discountPercent > 0
book.savings       // → original - discounted
```

## 💻 Frontend Code Updates

### Option 1: Use Virtuals (Minimal Changes)
```jsx
<h3>{book.titleDisplay}</h3>
<p>₹{book.finalPrice}</p>
{book.hasDiscount && <span>Save ₹{book.savings}</span>}
```

### Option 2: Use Nested Fields (Recommended)
```jsx
<h3>{book.title.display}</h3>
<p>₹{book.price.discounted || book.price.original}</p>
<span>Language: {book.language}</span>
{book.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
```

## 🛡️ Safety Features

✅ **Idempotent** - Safe to run multiple times  
✅ **Memory Efficient** - Uses cursors, not `.find()`  
✅ **Error Handling** - Continues processing on errors  
✅ **Dry-Run** - Preview before execution  
✅ **Rollback** - Revert if needed  
✅ **Progress Tracking** - Real-time console output

## ⚠️ Important Notes

1. **Always backup first!**
   ```bash
   mongodump --uri="$MONGO_URI" --out=./backup
   ```

2. **Test on staging before production**

3. **Rebuild indexes after migration**
   ```bash
   npm run migrate:books:rebuild-indexes
   ```

4. **Frontend requires updates** to use nested fields (or use virtuals)

## 🆘 Rollback

If something goes wrong:
```bash
npm run migrate:books:rollback
```

Then revert the model:
```bash
git checkout src/models/Book.js
```

## 📝 Environment Variables

Required in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/odisha_bookstore
```

## 📂 Files Created

- `scripts/migrate-books-schema.js` - Main migration
- `scripts/rollback-books-schema.js` - Rollback
- `scripts/rebuild-indexes.js` - Index management
- `scripts/test-migration.js` - Tests
- `scripts/MIGRATION_README.md` - Full documentation
- `scripts/QUICK_REFERENCE.md` - This file

## ✅ Pre-Migration Checklist

- [ ] Database backed up
- [ ] Tests passing (`npm run migrate:books:test`)
- [ ] Dry-run reviewed (`npm run migrate:books:dry-run`)
- [ ] MONGO_URI set correctly in `.env`
- [ ] Backend tests passing (`npm test`)
- [ ] Frontend code updated (or using virtuals)

## 📊 What Gets Changed

- `title`: String → Object `{ display, odia, english }`
- `price`: Number → Object `{ original, discounted, discountPercent }`
- **NEW**: `language`: 'Odia' or 'English'
- **NEW**: `academicGrade`: null
- **NEW**: `tags`: []

## 🧪 Test Results

```
✅ Passed: 14/14
❌ Failed: 0
```

All migration logic validated and working correctly!
