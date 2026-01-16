// screens/HomeScreenWithQuery.jsx - React Query version with 2-column grid
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteBooks, useFilters } from '../hooks/useBooks';
import BookCardWithCover from '../components/BookCardWithCover';
import SearchBar from '../components/SearchBar';

export default function HomeScreenWithQuery() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Fetch filters (languages & categories)
    const { data: filters } = useFilters();

    // Fetch books with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteBooks({
        language: selectedLanguage,
        category: selectedCategory,
        search: searchValue,
    });

    // Flatten pages into single array
    const allBooks = data?.pages.flatMap(page => page.books) || [];
    const totalBooks = data?.pages[0]?.totalBooks || 0;

    const handleBookPress = (bookId) => {
        router.push({ pathname: '/(tabs)/book-details', params: { bookId } });
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* App Title */}
            <View style={styles.titleRow}>
                <View>
                    <Text style={styles.headerTitle}>Odisha Book Store</Text>
                    <Text style={styles.headerSubtitle}>Discover your next great read</Text>
                </View>
            </View>

            {/* Search Bar */}
            <SearchBar
                value={searchValue}
                onChangeText={setSearchValue}
                placeholder="Search books..."
            />

            {/* Language Filter */}
            {filters?.languages && (
                <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Language</Text>
                    <View style={styles.filterChips}>
                        <TouchableOpacity
                            style={[styles.chip, !selectedLanguage && styles.chipActive]}
                            onPress={() => setSelectedLanguage(null)}
                        >
                            <Text style={[styles.chipText, !selectedLanguage && styles.chipTextActive]}>
                                All
                            </Text>
                        </TouchableOpacity>
                        {filters.languages.map(lang => (
                            <TouchableOpacity
                                key={lang}
                                style={[styles.chip, selectedLanguage === lang && styles.chipActive]}
                                onPress={() => setSelectedLanguage(lang)}
                            >
                                <Text style={[styles.chipText, selectedLanguage === lang && styles.chipTextActive]}>
                                    {lang === 'Odia' ? 'ଓଡ଼ିଆ' : lang}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Results Count */}
            {totalBooks > 0 && (
                <Text style={styles.resultsText}>
                    {totalBooks} book{totalBooks !== 1 ? 's' : ''} found
                    {selectedLanguage && ` in ${selectedLanguage}`}
                </Text>
            )}
        </View>
    );

    const renderBook = ({ item }) => (
        <BookCardWithCover book={item} onPress={handleBookPress} />
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>No books found</Text>
            {(searchValue || selectedLanguage) && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => { setSearchValue(''); setSelectedLanguage(null); refetch(); }}
                >
                    <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#059669" />
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.loadingText}>Loading books...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
                <Text style={styles.errorText}>Error loading books</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={allBooks}
                renderItem={renderBook}
                keyExtractor={(item) => item._id}
                numColumns={2}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={() => hasNextPage && fetchNextPage()}
                onEndReachedThreshold={0.5}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    listContent: { paddingBottom: 20 },
    headerContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: 26, fontWeight: '700', color: '#111827' },
    headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    filterSection: { marginTop: 12 },
    filterLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
    filterChips: { flexDirection: 'row', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#D1D5DB' },
    chipActive: { backgroundColor: '#059669', borderColor: '#059669' },
    chipText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
    chipTextActive: { color: '#FFF' },
    resultsText: { fontSize: 12, color: '#6B7280', marginTop: 12 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#9CA3AF', marginTop: 16, marginBottom: 24 },
    clearButton: { backgroundColor: '#059669', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    clearButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    footerLoader: { paddingVertical: 20, alignItems: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    errorText: { fontSize: 16, fontWeight: '600', color: '#EF4444', marginTop: 12, marginBottom: 20 },
    retryButton: { backgroundColor: '#EF4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    retryButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
