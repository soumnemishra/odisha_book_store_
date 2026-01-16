import User from '../models/User.js';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

/**
 * @desc    Get dashboard statistics with real database data
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
    // Get current date references
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Use aggregation for efficient counting
    const [
        totalBooks,
        totalUsers,
        totalOrders,
        currentMonthStats,
        prevMonthStats,
        recentOrders,
        topProductsAgg,
        categoryStats,
        chartData,
    ] = await Promise.all([
        // Total books count
        Book.countDocuments(),

        // Total customers (non-admin users)
        User.countDocuments({ role: 'user' }),

        // Total orders
        Order.countDocuments(),

        // Current month aggregation
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 },
                },
            },
        ]),

        // Previous month aggregation
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 },
                },
            },
        ]),

        // Recent orders with pagination (limit 5 for dashboard)
        Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .lean(),

        // Top selling products aggregation
        Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.bookId',
                    title: { $first: '$items.title' },
                    soldCount: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                },
            },
            { $sort: { soldCount: -1 } },
            { $limit: 5 },
        ]),

        // Sales by category
        Order.aggregate([
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'books',
                    localField: 'items.bookId',
                    foreignField: '_id',
                    as: 'book',
                },
            },
            { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$book.category',
                    sales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    count: { $sum: '$items.quantity' },
                },
            },
            { $sort: { sales: -1 } },
            { $limit: 6 },
        ]),

        // Revenue chart data (last 14 days) - single aggregation
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
    ]);

    // Calculate current and previous month values
    const currentRevenue = currentMonthStats[0]?.revenue || 0;
    const prevRevenue = prevMonthStats[0]?.revenue || 0;
    const currentOrderCount = currentMonthStats[0]?.count || 0;
    const prevOrderCount = prevMonthStats[0]?.count || 0;

    // Get customer counts for this month vs previous
    const [currentCustomers, prevCustomers] = await Promise.all([
        User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
        User.countDocuments({
            role: 'user',
            createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        }),
    ]);

    // Populate book details for top products
    const topProducts = await Promise.all(
        topProductsAgg.map(async (item) => {
            const book = await Book.findById(item._id)
                .select('title.display author image price.original price.discounted')
                .lean();
            return {
                book: book
                    ? {
                        _id: book._id,
                        title: book.title?.display || item.title || 'Unknown',
                        author: book.author || 'Unknown',
                        coverImage: book.image || '',
                        price: book.price?.discounted || book.price?.original || 0,
                    }
                    : { _id: item._id, title: item.title || 'Deleted Book', author: 'N/A' },
                soldCount: item.soldCount,
                revenue: item.revenue,
            };
        })
    );

    // Format recent orders for frontend
    const formattedOrders = recentOrders.map((order) => ({
        _id: order._id,
        user: order.user || { name: order.customerName },
        shippingAddress: { fullName: order.customerName },
        orderItems: order.items?.map((item) => ({
            book: item.bookId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
        })) || [],
        totalPrice: order.totalAmount || 0,
        status: order.status?.toLowerCase() || 'pending',
        createdAt: order.createdAt,
    }));

    // Fill in missing days for chart data
    const filledChartData = [];
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const existing = chartData.find((d) => d._id === dateStr);
        filledChartData.push({
            date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            revenue: existing?.revenue || 0,
            orders: existing?.orders || 0,
        });
    }

    // Calculate percentage changes safely
    const calcChange = (current, prev) => {
        if (prev === 0) return current > 0 ? 100 : 0;
        return ((current - prev) / prev) * 100;
    };

    res.json({
        success: true,
        data: {
            totalRevenue: currentRevenue,
            totalOrders,
            totalCustomers: totalUsers,
            totalProducts: totalBooks,
            revenueChange: calcChange(currentRevenue, prevRevenue),
            ordersChange: calcChange(currentOrderCount, prevOrderCount),
            customersChange: calcChange(currentCustomers, prevCustomers),
            productsChange: 0,
            recentOrders: formattedOrders,
            topProducts,
            salesByCategory: categoryStats.map((c) => ({
                category: c._id || 'Uncategorized',
                sales: c.sales,
                count: c.count,
            })),
            revenueChart: filledChartData,
        },
    });
});

/**
 * @desc    Get all users with pagination and search
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100); // Cap at 100
    const search = req.query.search || '';
    const role = req.query.role;

    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    if (role && ['user', 'admin'].includes(role)) {
        query.role = role;
    }

    const [total, users] = await Promise.all([
        User.countDocuments(query),
        User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
    ]);

    res.json({
        success: true,
        data: users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

/**
 * @desc    Get user by ID with order history
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
    const [user, orders, orderStats] = await Promise.all([
        User.findById(req.params.id).select('-password').lean(),
        Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(10).lean(),
        Order.aggregate([
            { $match: { user: req.params.id } },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 },
                },
            },
        ]),
    ]);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.json({
        success: true,
        data: {
            user,
            orders,
            stats: {
                totalSpent: orderStats[0]?.totalSpent || 0,
                orderCount: orderStats[0]?.orderCount || 0,
            },
        },
    });
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        throw new BadRequestError('Invalid role. Must be "user" or "admin"');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
        throw new BadRequestError('Cannot change your own role');
    }

    user.role = role;
    await user.save();

    res.json({
        success: true,
        data: { user: { ...user.toObject(), password: undefined } },
    });
});

/**
 * @desc    Get all orders with filtering and pagination
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const status = req.query.status;
    const search = req.query.search;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const query = {};

    if (status && status !== 'all') {
        // Handle case-insensitive status matching
        query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    if (search) {
        query.$or = [
            { customerName: { $regex: search, $options: 'i' } },
            { customerPhone: { $regex: search, $options: 'i' } },
        ];
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [total, orders] = await Promise.all([
        Order.countDocuments(query),
        Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
    ]);

    // Format orders for frontend compatibility
    const formattedOrders = orders.map((order) => ({
        _id: order._id,
        user: order.user || { name: order.customerName, email: null },
        shippingAddress: {
            fullName: order.customerName,
            phone: order.customerPhone,
            street: order.customerAddress,
        },
        orderItems: order.items?.map((item) => ({
            book: item.bookId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
        })) || [],
        totalPrice: order.totalAmount,
        shippingPrice: order.shippingCost || 50,
        status: order.status?.toLowerCase() || 'pending',
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    }));

    res.json({
        success: true,
        data: formattedOrders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

/**
 * @desc    Update order status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    // Case-insensitive matching
    const matchedStatus = validStatuses.find(
        (s) => s.toLowerCase() === status?.toLowerCase()
    );

    if (!matchedStatus) {
        throw new BadRequestError(
            `Invalid status. Valid options: ${validStatuses.join(', ')}`
        );
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new NotFoundError('Order not found');
    }

    order.status = matchedStatus;
    if (matchedStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
        success: true,
        data: { order },
        message: `Order status updated to ${matchedStatus}`,
    });
});

/**
 * @desc    Get sales analytics with time range
 * @route   GET /api/admin/analytics/sales
 * @access  Private/Admin
 */
export const getAnalyticsSales = asyncHandler(async (req, res) => {
    const period = req.query.period || '7d';
    let days = 7;

    switch (period) {
        case '30d':
            days = 30;
            break;
        case '90d':
            days = 90;
            break;
        case '1y':
            days = 365;
            break;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [salesData, summaryStats] = await Promise.all([
        Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalAmount' },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalAmount' },
                    maxOrder: { $max: '$totalAmount' },
                    minOrder: { $min: '$totalAmount' },
                },
            },
        ]),
    ]);

    res.json({
        success: true,
        data: {
            dailyData: salesData,
            summary: summaryStats[0] || {
                totalRevenue: 0,
                totalOrders: 0,
                avgOrderValue: 0,
            },
            period,
        },
    });
});

/**
 * @desc    Get top selling products
 * @route   GET /api/admin/analytics/top-products
 * @access  Private/Admin
 */
export const getTopProducts = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const topProducts = await Order.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.bookId',
                title: { $first: '$items.title' },
                soldCount: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                orderCount: { $sum: 1 },
            },
        },
        { $sort: { soldCount: -1 } },
        { $limit: limit },
    ]);

    // Populate full book details efficiently
    const bookIds = topProducts.map((p) => p._id);
    const books = await Book.find({ _id: { $in: bookIds } })
        .select('title.display author image price.original price.discounted category stock')
        .lean();

    const bookMap = new Map(books.map((b) => [b._id.toString(), b]));

    const populatedProducts = topProducts.map((item) => {
        const book = bookMap.get(item._id?.toString());
        return {
            book: book
                ? {
                    _id: book._id,
                    title: book.title?.display || item.title,
                    author: book.author,
                    coverImage: book.image || '',
                    price: book.price?.discounted || book.price?.original || 0,
                    category: book.category,
                    stock: book.stock,
                }
                : { _id: item._id, title: item.title || 'Deleted Book' },
            soldCount: item.soldCount,
            revenue: item.revenue,
            orderCount: item.orderCount,
        };
    });

    res.json({
        success: true,
        data: populatedProducts,
    });
});

/**
 * @desc    Get all books for admin (with full details)
 * @route   GET /api/admin/books
 * @access  Private/Admin
 */
export const getAllBooks = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const search = req.query.search || '';
    const category = req.query.category;
    const language = req.query.language;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const lowStock = req.query.lowStock === 'true';

    const query = {};

    if (search) {
        query.$or = [
            { 'title.display': { $regex: search, $options: 'i' } },
            { 'title.english': { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { isbn: { $regex: search, $options: 'i' } },
        ];
    }

    if (category) {
        query.category = category;
    }

    if (language) {
        query.language = language;
    }

    if (lowStock) {
        query.stock = { $lte: 5 };
    }

    const sortConfig = {};
    sortConfig[sortBy] = sortOrder;

    const [total, books, categories, languages] = await Promise.all([
        Book.countDocuments(query),
        Book.find(query)
            .sort(sortConfig)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Book.distinct('category'),
        Book.distinct('language'),
    ]);

    // Format books for frontend
    const formattedBooks = books.map((book) => ({
        _id: book._id,
        title: book.title?.display || '',
        titleEnglish: book.title?.english || '',
        titleOdia: book.title?.odia || '',
        author: book.author,
        description: book.description,
        price: book.price?.discounted || book.price?.original || 0,
        originalPrice: book.price?.original || 0,
        discountPercent: book.price?.discountPercent || 0,
        category: book.category,
        isbn: book.isbn,
        stock: book.stock,
        coverImage: book.image || '',
        rating: book.rating || 0,
        language: book.language,
        academicGrade: book.academicGrade,
        tags: book.tags || [],
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
    }));

    res.json({
        success: true,
        data: formattedBooks,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
        filters: {
            categories,
            languages,
        },
    });
});

/**
 * @desc    Get inventory summary
 * @route   GET /api/admin/inventory
 * @access  Private/Admin
 */
export const getInventorySummary = asyncHandler(async (req, res) => {
    const [
        totalBooks,
        outOfStock,
        lowStock,
        categoryBreakdown,
        stockValue,
    ] = await Promise.all([
        Book.countDocuments(),
        Book.countDocuments({ stock: 0 }),
        Book.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
        Book.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalStock: { $sum: '$stock' },
                    avgPrice: { $avg: '$price.original' },
                },
            },
            { $sort: { count: -1 } },
        ]),
        Book.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: {
                        $sum: { $multiply: ['$stock', '$price.original'] },
                    },
                    totalUnits: { $sum: '$stock' },
                },
            },
        ]),
    ]);

    res.json({
        success: true,
        data: {
            totalBooks,
            outOfStock,
            lowStock,
            totalUnits: stockValue[0]?.totalUnits || 0,
            totalValue: stockValue[0]?.totalValue || 0,
            categoryBreakdown,
        },
    });
});
