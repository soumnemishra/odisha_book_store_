// Helper function for Odia detection (add to top of bookController.js file)
const ODIA_CHAR_REGEX = /[\u0B00-\u0B7F]/;

// Updated createBook function - replace the existing one
export const createBook = asyncHandler(async (req, res) => {
    const bookData = { ...req.body };

    // AUTO-LOGIC 1: Smart Title Processing
    // Support both legacy format (flat title string) and new format (nested object)
    if (typeof bookData.title === 'string') {
        // Legacy format - convert to nested structure
        const titleText = bookData.title;
        const hasOdiaChars = ODIA_CHAR_REGEX.test(titleText);

        bookData.title = {
            display: titleText,
            english: !hasOdiaChars ? titleText : undefined,
            odia: hasOdiaChars ? titleText : undefined,
        };

        // Auto-detect language if not provided
        if (!bookData.language) {
            bookData.language = hasOdiaChars ? 'Odia' : 'English';
        }
    } else if (typeof bookData.title === 'object') {
        // New nested format provided
        // Validate required field
        if (!bookData.title.display) {
            logger.warn('Book creation failed: title.display is required', {
                adminId: req.user?.id,
            });
            return res.status(400).json({
                success: false,
                message: 'title.display is required',
            });
        }

        // Auto-detect language from title.display if not provided
        if (!bookData.language) {
            const hasOdiaChars = ODIA_CHAR_REGEX.test(bookData.title.display);
            bookData.language = hasOdiaChars ? 'Odia' : 'English';

            // Auto-populate title subfields if not provided
            if (hasOdiaChars && !bookData.title.odia) {
                bookData.title.odia = bookData.title.display;
            } else if (!hasOdiaChars && !bookData.title.english) {
                bookData.title.english = bookData.title.display;
            }
        }
    } else {
        logger.warn('Book creation failed: title is required', { adminId: req.user?.id });
        return res.status(400).json({
            success: false,
            message: 'title is required (either string or object with display field)',
        });
    }

    // AUTO-LOGIC 2: Smart Price Processing
    // Support both legacy format (number) and new format (object)
    if (typeof bookData.price === 'number') {
        // Legacy format - convert to nested structure
        const priceValue = bookData.price;
        bookData.price = {
            original: priceValue,
            discounted: priceValue,
            discountPercent: 0,
        };
    } else if (typeof bookData.price === 'object') {
        // New nested format provided
        // Validate required field
        if (!bookData.price.original) {
            logger.warn('Book creation failed: price.original is required', {
                adminId: req.user?.id,
            });
            return res.status(400).json({
                success: false,
                message: 'price.original is required',
            });
        }

        // Set defaults for optional fields
        if (!bookData.price.discounted) {
            bookData.price.discounted = bookData.price.original;
        }
        if (bookData.price.discountPercent === undefined) {
            bookData.price.discountPercent = 0;
        }
    } else {
        logger.warn('Book creation failed: price is required', { adminId: req.user?.id });
        return res.status(400).json({
            success: false,
            message: 'price is required (either number or object with original field)',
        });
    }

    // AUTO-LOGIC 3: Automatic Category Assignment for Educational Books
    // If academicGrade is provided but category is not, auto-assign 'Educational' category
    if (bookData.academicGrade && !bookData.category) {
        bookData.category = 'Educational';
        logger.info('Auto-assigned Educational category based on academicGrade', {
            academicGrade: bookData.academicGrade,
        });
    }

    // Set defaults for optional fields
    if (!bookData.tags) {
        bookData.tags = [];
    }
    if (bookData.academicGrade === undefined) {
        bookData.academicGrade = null;
    }

    logger.info('Creating new book', {
        title: bookData.title.display,
        language: bookData.language,
        category: bookData.category,
        academicGrade: bookData.academicGrade,
        adminId: req.user?.id,
    });

    const book = await Book.create(bookData);

    logger.info('Book created successfully', {
        bookId: book._id,
        title: book.title.display,
        language: book.language,
    });

    res.status(201).json({
        success: true,
        data: book,
        message: 'Book created successfully',
    });
});
