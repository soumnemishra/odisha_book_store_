import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Checkout Components
import CheckoutStepper from '../components/checkout/CheckoutStepper';
import AddressStep from '../components/checkout/AddressStep';
import PaymentStep from '../components/checkout/PaymentStep';
import OrderReviewStep from '../components/checkout/OrderReviewStep';
import OrderSummary from '../components/checkout/OrderSummary';

/**
 * Modern Multi-Step Checkout Page
 * Inspired by Amazon/Flipkart checkout experience
 * 
 * Steps: 1. Login → 2. Address → 3. Payment → 4. Review
 */
const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();

  // Current step (1-4)
  const [currentStep, setCurrentStep] = useState(user ? 2 : 1);

  // Form Data
  const [shippingAddress, setShippingAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Step definitions
  const steps = [
    { id: 1, label: 'Login', subtitle: 'Sign in or guest' },
    { id: 2, label: 'Address', subtitle: 'Delivery details' },
    { id: 3, label: 'Payment', subtitle: 'Choose method' },
    { id: 4, label: 'Review', subtitle: 'Confirm order' },
  ];

  // Calculate totals
  const subtotal = getTotalPrice;
  const shippingCost = subtotal >= 500 ? 0 : 40;
  const codCharge = paymentMethod === 'cod' && subtotal < 500 ? 40 : 0;
  const total = subtotal - discount + shippingCost + codCharge;

  // Track if we've done the initial cart check
  const [hasCheckedCart, setHasCheckedCart] = useState(false);

  // Redirect if cart is empty - but only after a brief delay to allow cart to hydrate
  useEffect(() => {
    // Wait a moment for cart to load from localStorage
    const timer = setTimeout(() => {
      setHasCheckedCart(true);
      if (cartItems.length === 0) {
        toast.error('Your cart is empty!');
        navigate('/cart');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);  // Only run on mount

  // Also check if cart becomes empty after initial load
  useEffect(() => {
    if (hasCheckedCart && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, hasCheckedCart, navigate]);

  // Load saved addresses (mock - in real app, fetch from API)
  useEffect(() => {
    if (user) {
      setCurrentStep(2);
      // Mock saved addresses
      setSavedAddresses([
        {
          fullName: user.name || 'User',
          phone: '9876543210',
          street: '123, Main Road, Sahid Nagar',
          landmark: 'Near Big Bazaar',
          city: 'Bhubaneswar',
          state: 'Odisha',
          zipCode: '751001',
          addressType: 'home',
        },
      ]);
    }
  }, [user]);

  // Handle step navigation
  const goToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  // Handle Login Step Continue
  const handleLoginContinue = () => {
    if (user) {
      setCurrentStep(2);
    }
  };

  // Handle Address Step Continue
  const handleAddressContinue = () => {
    if (shippingAddress) {
      setCurrentStep(3);
      toast.success('Address saved!', { icon: '📍' });
    }
  };

  // Handle Payment Step Continue
  const handlePaymentContinue = () => {
    if (paymentMethod) {
      setCurrentStep(4);
      toast.success('Payment method selected!', { icon: '💳' });
    }
  };

  // Handle Place Order
  const handlePlaceOrder = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real implementation, this would:
      // 1. Create order in backend
      // 2. If online payment, initiate Razorpay
      // 3. On success, clear cart and redirect

      toast.success('Order placed successfully! 🎉', {
        duration: 5000,
        style: { borderRadius: '12px', background: '#333', color: '#fff' }
      });

      clearCart();
      navigate('/order-success');

    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new address
  const handleAddNewAddress = (address) => {
    setSavedAddresses([...savedAddresses, address]);
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/cart" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>

          <div className="flex items-center gap-1 text-green-600 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            100% Secure
          </div>
        </div>

        {/* Progress Stepper */}
        <CheckoutStepper
          currentStep={currentStep}
          steps={steps}
          onStepClick={goToStep}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Login */}
              {currentStep === 1 && (
                <motion.div
                  key="login"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      1
                    </span>
                    Login or Continue as Guest
                  </h2>

                  {user ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-cta text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <svg className="w-6 h-6 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link
                        to="/login?redirect=checkout"
                        className="block w-full py-4 bg-gradient-to-r from-primary to-cta text-white text-center font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                      >
                        Login to Continue
                      </Link>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">or</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setCurrentStep(2)}
                        className="w-full py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        Continue as Guest
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleLoginContinue}
                    disabled={!user}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-primary to-cta text-white font-bold rounded-xl 
                      hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all
                      shadow-lg shadow-primary/25"
                  >
                    Continue to Address
                  </button>
                </motion.div>
              )}

              {/* Step 2: Address */}
              {currentStep === 2 && (
                <motion.div
                  key="address"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      2
                    </span>
                    Delivery Address
                  </h2>

                  <AddressStep
                    savedAddresses={savedAddresses}
                    selectedAddress={shippingAddress}
                    onAddressSelect={setShippingAddress}
                    onAddNewAddress={handleAddNewAddress}
                    onContinue={handleAddressContinue}
                  />
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="payment"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      3
                    </span>
                    Payment Method
                  </h2>

                  <PaymentStep
                    selectedMethod={paymentMethod}
                    onMethodSelect={setPaymentMethod}
                    onContinue={handlePaymentContinue}
                    orderTotal={subtotal}
                  />
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <motion.div
                  key="review"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      4
                    </span>
                    Review & Place Order
                  </h2>

                  <OrderReviewStep
                    cartItems={cartItems}
                    shippingAddress={shippingAddress}
                    paymentMethod={paymentMethod}
                    subtotal={subtotal}
                    shippingCost={shippingCost}
                    discount={discount}
                    codCharge={codCharge}
                    onEditAddress={() => setCurrentStep(2)}
                    onEditPayment={() => setCurrentStep(3)}
                    onPlaceOrder={handlePlaceOrder}
                    isLoading={isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shippingCost={shippingCost}
                discount={discount}
                codCharge={codCharge}
              />

              {/* Offers */}
              <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <span>🎁</span> Available Offers
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 10% off on first order</li>
                  <li>• Free shipping on orders above ₹500</li>
                  <li>• Extra 5% off with UPI payment</li>
                </ul>
              </div>

              {/* Help */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Need help? <a href="tel:+917777777777" className="text-primary hover:underline">Call us</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
