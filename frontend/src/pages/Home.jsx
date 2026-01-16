import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import HeroSection from '../components/HeroSection';
import PromoBanner from '../components/PromoBanner';
import CategoryGrid from '../components/CategoryGrid';
import TrustBadges from '../components/TrustBadges';
import NewsletterSignup from '../components/NewsletterSignup';
import BestsellersCarousel from '../components/BestsellersCarousel';
import DealsSection from '../components/DealsSection';
import AuthorSpotlight from '../components/AuthorSpotlight';
import ReadingLists from '../components/ReadingLists';
import TestimonialsSlider from '../components/TestimonialsSlider';
import { useBooks } from '../services/bookService';

const Home = () => {
  // Fetch new arrivals (latest books - dynamic limit based on inventory)
  const { data: newArrivalsData, isLoading: loadingNew } = useBooks({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 8,
  });

  // Fetch featured/discounted books
  const { data: featuredData, isLoading: loadingFeatured } = useBooks({
    limit: 4,
  });

  const newArrivals = newArrivalsData?.books || [];
  const featuredBooks = featuredData?.books || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section with Typewriter Animation */}
      <HeroSection />

      {/* Promo Banner (Rotating) */}
      <PromoBanner />

      {/* Today's Deals with Countdown */}
      <DealsSection />

      {/* Bestsellers Carousel */}
      <BestsellersCarousel />

      {/* Browse by Category */}
      <CategoryGrid />

      {/* Featured Books */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-secondary">
                ⭐ Featured Books
              </h2>
              <p className="text-gray-500 mt-1">Handpicked selections for you</p>
            </div>
            <Link
              to="/books"
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loadingFeatured ? (
              Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              featuredBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Author Spotlight */}
      <AuthorSpotlight />

      {/* Curated Reading Lists */}
      <ReadingLists />

      {/* New Arrivals */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-secondary">
                🆕 New Arrivals
              </h2>
              <p className="text-gray-500 mt-1">Fresh additions to our collection</p>
            </div>
            <Link
              to="/books?sortBy=createdAt&sortOrder=desc"
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loadingNew ? (
              Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              newArrivals.map((book) => (
                <BookCard key={book._id} book={book} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <TestimonialsSlider />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
};

export default Home;