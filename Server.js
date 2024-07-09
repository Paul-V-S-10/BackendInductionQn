const express = require('express');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
const { connect, Schema, model } = require('mongoose');

app.listen(port, async () => {
    try {
        console.log(`Server is running ${port}`);
        await connect('mongodb+srv://Paul:Paul%40270414@cluster.1cbatru.mongodb.net/booksDB');
        console.log("db connection established");
    } catch (err) {
        console.error(err.message);
        process.exit(1); 
    }
});

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

app.use(bodyParser.json());

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
});

const Book = model("Book", bookSchemaStructure);


app.post("/Book", async (req, res) => {
    try {
        // Find the counter document and increment the sequence
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'bookId' },  // Use 'bookId' as the identifier for the counter document
            { $inc: { seq: 1 } },  // Increment the 'seq' field by 1
            { new: true, upsert: true }  // Options: return updated document, create if not exists
        );

        // Retrieve the incremented sequence value (book ID)
        const bookId = counter.seq;

        // Create a new Book instance using data from the request body
        const newBook = new Book({
            id: bookId,
            ...req.body
        });

        // Save the new book document to MongoDB
        await newBook.save();

        // Send a response with the book ID and success message
        res.send({
            id: bookId,
            message: 'Book added successfully',
        });
    } catch (error) {
        // Handle errors and send an error response
        res.status(500).send({ error: error.message });
    }
});

app.get("/books", async (req, res) => {
    try {
        // Fetch all books from the database
        const books = await Book.find();

        // Format the response to match the specified structure
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

app.get("/books/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Find the book by its ID in the database
        const book = await Book.findOne({ id: parseInt(id) });

        // If book is not found, return 404 Not Found
        if (!book) {
            return res.status(404).send({ message: "Book not found" });
        }

        // Format the response to match the specified structure
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


//USER SCHEMA

const userSchema = new Schema({
    userId: {
        type: Number,
        unique: true,
    },
    userName: {  // Corrected field name from `username` to `userName`
        type: String,
        required: true,
        unique: true,
    },
    favorites: [{
        type: Number,
        ref: 'Book'
    }]
});

const User = model('User', userSchema);

app.post("/users", async (req, res) => {
    const { userName } = req.body;  // Corrected variable name from `userName` to `userName`

    try {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'userId' },  // Use 'userId' as the identifier for the counter document
            { $inc: { seq: 1 } },  // Increment the 'seq' field by 1
            { new: true, upsert: true }  // Options: return updated document, create if not exists
        );

        // Retrieve the incremented sequence value (user ID)
        const userId = counter.seq;

        // Check if username is already taken
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(400).send({ message: "Username already exists" });
        }

        // Create new user with auto-incremented ID
        const newUser = new User({
            userId,  // Assign auto-incremented userId
            userName
        });

        await newUser.save();

        res.status(201).send(newUser);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.post("/favorites/users/:userId", async (req, res) => {
    const { userId } = req.params;
    const { bookId } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check if the book exists
        const book = await Book.findOne({ id: bookId });
        if (!book) {
            return res.status(404).send({ message: "Book not found" });
        }

        // Check if the book is already in the user's favorites
        if (user.favorites.includes(bookId)) {
            return res.status(400).send({ message: "Book already in favorites" });
        }

        // Add the book to the user's favorites
        user.favorites.push(bookId);
        await user.save();

        res.send({ message: "Book added to favorites" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


app.get("/favorites/users/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user by userId including populated favorites
        const user = await User.findOne({ userId: parseInt(userId) }).populate('favorites');

        // If user is not found, return 404 Not Found
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Format the response to match the specified structure
        const formattedFavorites = {
            userId: user.userId,
            favorites: user.favorites.map(book => ({
                id: book.id,  // Assuming `id` is correctly populated and matches `Book` schema
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