# React Query Setup - Example Usage

## Basic Book List

```javascript
import { useBooks } from '../hooks/useBooks';

function BooksScreen() {
  const { data, isLoading, error, refetch } = useBooks({
    page: 1,
    limit: 20,
    language: 'Odia'
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data.books}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <BookCard 
          title={item.title.display}
          price={item.finalPrice}
          language={item.language}
        />
      )}
    />
  );
}
```

## Infinite Scroll

```javascript
import { useInfiniteBooks } from '../hooks/useBooks';

function BooksScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBooks({ language: 'English' });

  const allBooks = data?.pages.flatMap(page => page.books) || [];

  return (
    <FlatList
      data={allBooks}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator /> : null
      }
    />
  );
}
```

## Search with Filters

```javascript
import { useSearchBooks, useFilters } from '../hooks/useBooks';

function SearchScreen() {
  const [search, setSearch] = useState('');
  const { data: filters } = useFilters();
  const { data, isLoading } = useSearchBooks(search);

  return (
    <View>
      <TextInput 
        value={search}
        onChangeText={setSearch}
        placeholder="Search books..."
      />
      {/* Language filters from server */}
      {filters?.languages.map(lang => (
        <Button key={lang} title={lang} />
      ))}
    </View>
  );
}
```
