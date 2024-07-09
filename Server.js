const express = require('express');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
const { connect, Schema, model } = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs/promises'); // Using fs.promises for async file operations

// Middleware
app.use(bodyParser.json());

app.listen(port, async () => {
    try {
        console.log(`Server is running on port ${port}`);
        await connect('mongodb+srv://Paul:Paul%40270414@cluster.1cbatru.mongodb.net/booksDB');
        console.log("db connection established");
    } catch (err) {
        console.error(err.message);
        process.exit(1); 
    }
});

// Counter Schema and Model
const counterSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    seq: {
        type: Number,
        default: 0
    }
});
const Counter = model('Counter', counterSchema);

// Book Schema and Model
const bookSchemaStructure = new Schema({
    id: {
        type: Number,
        unique: true
    },
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    pages: {
        type: Number,
        required: true,
    },
    analytics: {
        type: Schema.Types.ObjectId,
        ref: 'Analytics',
    },
});

// Pre-hook to remove references from users' favorites before deleting a book
bookSchemaStructure.pre('findOneAndDelete', async function(next) {
    try {
        const book = await this.model.findOne(this.getFilter());
        if (book) {
            console.log(`Removing book references for book ID: ${book._id}`);
            await User.updateMany(
                { favorites: book._id },
                { $pull: { favorites: book._id } }
            );
        }
        next();
    } catch (error) {
        console.error('Error in pre-hook:', error);
        next(error);
    }
});

const Book = model("Book", bookSchemaStructure);

// User Schema and Model
const userSchema = new Schema({
    userId: {
        type: Number,
        unique: true,
    },
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    favorites: [{
        type: Schema.Types.ObjectId,  // Ensure favorites are stored as ObjectId references
        ref: 'Book'
    }]
});
const User = model('User', userSchema);

// POST endpoint to add a new book
app.post("/Book", async (req, res) => {
    try {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'bookId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const bookId = counter.seq;

        const newBook = new Book({
            id: bookId,
            ...req.body
        });

        await newBook.save();

        res.send({
            id: bookId,
            message: 'Book added successfully',
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// GET endpoint to fetch all books
app.get("/books", async (req, res) => {
    try {
        const books = await Book.find();
        const formattedBooks = books.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            pages: book.pages,
        }));

        res.send(formattedBooks);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// GET endpoint to fetch a book by ID
app.get("/books/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Book.findOne({ id: parseInt(id) });

        if (!book) {
            return res.status(404).send({ message: "Book not found" });
        }

        const formattedBook = {
            id: book.id,
            title: book.title,
            author: book.author,
            pages: book.pages,
        };

        res.send(formattedBook);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// POST endpoint to create a new user
app.post("/users", async (req, res) => {
    const { userName } = req.body;

    try {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'userId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const userId = counter.seq;

        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(400).send({ message: "Username already exists" });
        }

        const newUser = new User({
            userId,
            userName
        });

        await newUser.save();

        res.status(201).send(newUser);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// POST endpoint to add a book to user favorites
app.post("/favorites/users/:userId", async (req, res) => {
    const { userId } = req.params;
    const { bookId } = req.body;

    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const book = await Book.findOne({ id: bookId });
        if (!book) {
            return res.status(404).send({ message: "Book not found" });
        }

        if (user.favorites.includes(book._id)) {
            return res.status(400).send({ message: "Book already in favorites" });
        }

        user.favorites.push(book._id);
        await user.save();

        res.send({ message: "Book added to favorites" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// GET endpoint to fetch user favorites
app.get("/favorites/users/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({ userId }).populate('favorites');

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const formattedFavorites = {
            userId: user.userId,
            favorites: user.favorites.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                pages: book.pages,
            })),
        };

        res.send(formattedFavorites);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// DELETE endpoint to delete a book by ID
app.delete("/books/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Book.findOneAndDelete({ id: parseInt(id) });

        if (!book) {
            return res.status(404).send({ message: "Book not found" });
        }

        // Decrement the bookId counter
        await Counter.findByIdAndUpdate(
            { _id: 'bookId' },
            { $inc: { seq: -1 } }
        );

        res.send({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


// DELETE endpoint to remove a book from a user's favorites
app.delete("/favorites/users/:userId", async (req, res) => {
    const { userId } = req.params;
    const { bookId } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check if the book exists in the user's favorites
        const bookObjectId = await Book.findOne({ id: bookId }).select('_id');
        if (!bookObjectId) {
            return res.status(404).send({ message: "Book not found" });
        }

        if (!user.favorites.includes(bookObjectId._id)) {
            return res.status(404).send({ message: "Book not found in user's favorites" });
        }

        // Remove the book from the user's favorites
        user.favorites.pull(bookObjectId._id);
        await user.save();

        res.send({ message: "Book removed from favorites" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


app.put("/books/:id", async (req, res) => {
    const { id } = req.params;
    const { title, author, pages } = req.body;

    try {
        // Find the book by its ID and update its details
        const book = await Book.findOneAndUpdate(
            { id: parseInt(id) },
            { title, author, pages },
            { new: true, runValidators: true } // Options: return the updated document, validate before update
        );

        // If book is not found, return 404 Not Found
        if (!book) {
            return res.status(404).send({ message: "Book not found" });
        }

        res.send({ message: "Book updated successfully" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const analyticsSchema = new Schema({
    bookId: {
        type: Number,
        required: true,
        unique: true,
    },
    totalReads: {
        type: Number,
        default: 0,
    },
    mostPopularSection: {
        type: String,
        default: "N/A",
    },
    uniqueReaders: {
        type: Number,
        default: 0,
    },
});

const Analytics = model('Analytics', analyticsSchema);


app.post('/books/analytics', async (req, res) => {
    const { bookId, totalReads, mostPopularSection, uniqueReaders } = req.body;

    try {
        // Create a new Analytics instance
        const newAnalytics = new Analytics({
            bookId,
            totalReads,
            mostPopularSection,
            uniqueReaders,
        });

        // Save the new analytics document to MongoDB
        await newAnalytics.save();

        // Update corresponding Book document with analytics _id
        const book = await Book.findOneAndUpdate(
            { id: bookId },
            { $set: { analytics: newAnalytics._id } },
            { new: true }
        );

        res.status(201).send({ message: 'Analytics data saved successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


// GET route to fetch analytics for a specific book
app.get('/books/analytics/:bookId', async (req, res) => {
    const { bookId } = req.params;

    try {
        // Find the analytics data for the specified bookId
        const analytics = await Analytics.findOne({ bookId });

        // If no analytics data found, return 404 Not Found
        if (!analytics) {
            return res.status(404).send({ message: "Analytics data not found for the specified bookId" });
        }

        // Format the response to match the specified structure
        const formattedAnalytics = {
            bookId: analytics.bookId,
            totalReads: analytics.totalReads,
            mostPopularSection: analytics.mostPopularSection,
            uniqueReaders: analytics.uniqueReaders,
        };

        res.send(formattedAnalytics);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


// Ensure the qrcodes directory exists and create it if it doesn't
const qrcodesDirectory = path.join(__dirname, '../public/qrcodes');

// Ensure the directory exists
fs.mkdir(qrcodesDirectory, { recursive: true })
    .then(() => {
        console.log(`Directory '${qrcodesDirectory}' created or already exists`);
    })
    .catch(err => {
        console.error(`Error creating directory '${qrcodesDirectory}':`, err);
        process.exit(1); // Exit the process if directory creation fails
    });

// GET route to generate and fetch QR code for a specific book
app.get('/books/qrcode/:bookId', async (req, res) => {
    const { bookId } = req.params;

    try {
        // Generate QR code data (e.g., a URL, text, etc. for the bookId)
        const qrCodeData = `https://example.com/books/${bookId}`; // Example URL for QR code data

        // Generate QR code image
        const qrCodeImageBuffer = await QRCode.toBuffer(qrCodeData, {
            errorCorrectionLevel: 'H', // Higher error correction level
            type: 'png', // Image type (png, svg, etc.)
            quality: 0.92, // Image quality factor
            margin: 1, // Margin around the QR code
        });

        // Save QR code image to a file
        const qrCodeImagePath = path.join(qrcodesDirectory, `${bookId}.png`);
        await fs.writeFile(qrCodeImagePath, qrCodeImageBuffer);

        // Construct URL to serve the QR code image
        const qrCodeUrl = `https://example.com/qrcodes/${bookId}.png`; // Example URL format

        // Respond with the QR code URL
        res.json({
            bookId: parseInt(bookId),
            qrcodeUrl: qrCodeUrl,
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send({ error: 'Failed to generate QR code' });
    }
});
