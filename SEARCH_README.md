# Advanced Search Functionality

This BBC News application now features advanced search capabilities powered by MongoDB's `$text` search with fallback to regex search.

## Features

### 🚀 **MongoDB Text Search**
- **Automatic Relevance Scoring**: MongoDB provides built-in relevance scoring based on term frequency
- **Weighted Search**: Different fields have different weights (title: 10, summary: 6, content: 3, tags: 2, category: 1)
- **Language Support**: Supports multiple languages and stemming
- **Performance**: Uses indexes for fast text search

### 🔍 **Advanced Search Capabilities**
- **Fuzzy Matching**: Handles typos and partial matches
- **Multi-field Search**: Searches across title, summary, content, tags, and category
- **Filtering**: Combine search with category, type, region, and country filters
- **Pagination**: Efficient pagination with total result counts
- **Fallback**: Automatic fallback to regex search if text search fails

### 📊 **Relevance Scoring**
The search results are scored based on:
- **Text Match Score**: MongoDB's built-in text relevance score
- **Featured Boost**: Featured articles get +2 points
- **Trending Boost**: Trending articles get +1 point
- **Recency Boost**: Recent articles get slight boost

## Setup

### 1. Build Indexes
Before using the search functionality, you need to build the MongoDB indexes:

```bash
cd backend
npm run build-indexes
```

This will create:
- Text index on title, summary, content, tags, and category
- Compound indexes for filtering by category, type, region
- Index for featured/trending articles

### 2. Verify Indexes
You can verify the indexes were created by checking the console output or running:

```javascript
// In MongoDB shell
db.articles.getIndexes()
```

## API Usage

### Search Endpoint
```
GET /api/articles/search
```

### Query Parameters
- `q` (string): Search query
- `category` (string): Filter by category
- `type` (string): Filter by article type
- `region` (string): Filter by region
- `country` (string): Filter by country
- `limit` (number): Results per page (default: 20)
- `page` (number): Page number (default: 1)

### Example Requests

#### Basic Search
```
GET /api/articles/search?q=technology
```

#### Search with Filters
```
GET /api/articles/search?q=AI&category=tech&type=news&region=Global
```

#### Paginated Search
```
GET /api/articles/search?q=politics&page=2&limit=10
```

### Response Format
```json
{
  "articles": [
    {
      "_id": "...",
      "title": "Article Title",
      "summary": "Article summary...",
      "content": "Full article content...",
      "category": "tech",
      "region": "Global",
      "type": "news",
      "tags": ["AI", "technology"],
      "image": { "url": "...", "public_id": "..." },
      "author": "Admin",
      "isFeatured": true,
      "isTrending": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "relevanceScore": 15.5,
      "matches": ["text_match"]
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "hasNext": true,
    "hasPrev": false,
    "totalResults": 100
  }
}
```

## Frontend Integration

The frontend components (`SearchBar.jsx` and `SearchResults.jsx`) are already configured to work with this advanced search API.

### Search Bar Features
- **Debounced Search**: 300ms delay to avoid excessive API calls
- **Real-time Results**: Shows results as you type
- **Recent Searches**: Stores and displays recent search queries
- **Advanced Filters**: Category, type, and region filters
- **Mobile Responsive**: Works on all screen sizes

### Search Results Features
- **Highlighted Matches**: Search terms are highlighted in results
- **Relevance Sorting**: Results sorted by relevance score
- **Pagination**: Navigate through multiple pages
- **Filter Sidebar**: Advanced filtering options
- **No Results Handling**: Helpful messages when no results found

## Performance Benefits

### Before (Regex Search)
- ❌ Slow performance on large datasets
- ❌ No relevance scoring
- ❌ Inefficient fuzzy matching
- ❌ Memory-intensive operations

### After (MongoDB Text Search)
- ✅ Fast indexed searches
- ✅ Built-in relevance scoring
- ✅ Efficient fuzzy matching
- ✅ Optimized memory usage
- ✅ Automatic fallback to regex

## Troubleshooting

### Search Not Working
1. **Check Indexes**: Ensure indexes are built with `npm run build-indexes`
2. **Database Connection**: Verify MongoDB connection
3. **Text Search Fallback**: Check console for fallback messages

### Performance Issues
1. **Index Size**: Large text indexes may take time to build
2. **Query Complexity**: Complex filters may impact performance
3. **Database Size**: Consider database optimization for very large datasets

### Common Issues
- **Text Search Fails**: System automatically falls back to regex search
- **No Results**: Check if search terms match your data
- **Slow Queries**: Ensure indexes are properly built

## Future Enhancements

Potential improvements for the search functionality:
- **Elasticsearch Integration**: For even more advanced search capabilities
- **Search Analytics**: Track popular searches and improve relevance
- **Auto-complete**: Suggest search terms based on existing content
- **Search History**: User-specific search history
- **Advanced Filters**: Date range, author, and more filtering options 