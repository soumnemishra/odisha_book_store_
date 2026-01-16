import Book from '../../models/Book.js';
import Order from '../../models/Order.js';

/**
 * Create a test book
 * @param {Object} bookData - Book data override
 * @returns {Promise<Object>} Created book
 */
export const createTestBook = async (bookData = {}) => {
  const defaultBook = {
    title: 'Test Book',
    author: 'Test Author',
    description: 'A test book description',
    price: 299,
    category: 'Fiction',
    language: 'Odia',
    publisher: 'Test Publisher',
    isbn: '978-0-123456-78-9',
    pages: 250,
    stock: 10,
    image: 'https://example.com/test-book.jpg',
  };

  const book = await Book.create({
    ...defaultBook,
    ...bookData,
  });

  return book;
};

/**
 * Create multiple test books
 * @param {number} count - Number of books to create
 * @returns {Promise<Array>} Array of created books
 */
export const createTestBooks = async (count = 5) => {
  const books = [];
  const categories = ['Fiction', 'Non-Fiction', 'Poetry', 'Drama', 'Children'];
  const languages = ['Odia', 'English', 'Hindi'];

  for (let i = 0; i < count; i += 1) {
    const book = await createTestBook({
      // eslint-disable-line no-await-in-loop
      title: `Test Book ${i + 1}`,
      author: `Author ${i + 1}`,
      price: 199 + i * 50,
      category: categories[i % categories.length],
      language: languages[i % languages.length],
      isbn: `978-0-12345-${String(i).padStart(3, '0')}-0`,
      stock: 5 + i,
    });
    books.push(book);
  }

  return books;
};

/**
 * Create a test order
 * @param {Object} userId - User ID for the order
 * @param {Array} items - Order items
 * @param {Object} orderData - Order data override
 * @returns {Promise<Object>} Created order
 */
export const createTestOrder = async (userId, items = [], orderData = {}) => {
  // If no items provided, create a default item
  let orderItems = items;
  if (orderItems.length === 0) {
    const book = await createTestBook();
    orderItems = [
      {
        book: book._id,
        quantity: 1,
        price: book.price,
      },
    ];
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const defaultOrder = {
    user: userId,
    items: orderItems,
    totalAmount,
    shippingAddress: {
      street: '123 Test Street',
      city: 'Bhubaneswar',
      state: 'Odisha',
      pincode: '751001',
      country: 'India',
    },
    paymentMethod: 'cod',
    status: 'pending',
  };

  const order = await Order.create({
    ...defaultOrder,
    ...orderData,
  });

  return order;
};

/**
 * Create multiple test orders for a user
 * @param {Object} userId - User ID
 * @param {number} count - Number of orders to create
 * @returns {Promise<Array>} Array of created orders
 */
export const createTestOrders = async (userId, count = 3) => {
  const orders = [];
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];

  for (let i = 0; i < count; i += 1) {
    const book = await createTestBook({ title: `Order Book ${i + 1}` }); // eslint-disable-line no-await-in-loop
    const order = await createTestOrder(
      // eslint-disable-line no-await-in-loop
      userId,
      [{ book: book._id, quantity: 1 + i, price: book.price }],
      { status: statuses[i % statuses.length] }
    );
    orders.push(order);
  }

  return orders;
};

/**
 * Create a complete test scenario with user, books, and orders
 * @returns {Promise<Object>} Object with user, books, and orders
 */
export const createTestScenario = async () => {
  const UserModel = (await import('../../models/User.js')).default;

  const user = await UserModel.create({
    name: 'Scenario User',
    email: 'scenario@example.com',
    password: 'Password123!',
  });

  const books = await createTestBooks(5);
  const orders = await createTestOrders(user._id, 2);

  return {
    user,
    books,
    orders,
  };
};
