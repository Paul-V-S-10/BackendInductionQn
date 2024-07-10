## Books API

This is a RESTful API for managing books and users’ favorite books. It supports various operations such as adding books, updating book details, adding/removing books from user favorites, and generating QR codes for books.

## Table of Contents

1. Installation
2. Running the Server
3. API Endpoints
	1. Books
        1. POST /Book
	    2. GET /books
	    3. GET /books/:id
	    4. DELETE /books/:id
	    5. PUT /books/:id
	    6. GET /books/analytics/:bookId
	    7. POST /books/analytics
	    8. GET /books/qrcode/:bookId
	2. Users
	    1. POST /users
	    2. POST /favorites/users/:userId
	    3. GET /favorites/users/:userId
	    4. DELETE /favorites/users/:userId

## Installation

1.	Clone the repository:

```bash
git clone <repository-url>
cd <repository-directory>
```

2.	Install the dependencies:

```bash
npm install
```
3. Create the necessary directories:

```bash
mkdir -p public/qrcodes
```

## Running the Server

Start the server with the following command:

```bash
node <your-main-file>.js
```

The server will start on port 4000.

## API Endpoints

## 1. Books
- POST /Book

Add a new book.

Request Body:
```bash
{
  "title": "1984",
  "author": "George Orwell",
  "pages": 328
}
```
Response:
```bash
{
  "id": 1,
  "message": "Book added successfully"
}
```

- GET /books

Fetch all books.

Response:
```bash
[
  {
    "id": 1,
    "title": "1984",
    "author": "George Orwell",
    "pages": 328
  }
]
```

- GET /books/:id

Fetch a specific book by its ID.

Response:
```bash
{
  "id": 1,
  "title": "1984",
  "author": "George Orwell",
  "pages": 328
}
```

- DELETE /books/:id

Delete a book by its ID.

Response:
```bash
{
  "message": "Book deleted successfully"
}
```

- PUT /books/:id

Update details of a specific book by its ID.

Request Body:
```bash
{
  "title": "Brave New World (Updated)",
  "author": "Aldous Huxley",
  "pages": 270
}
```
Response:
```bash
{
  "message": "Book updated successfully"
}
```

- GET /books/analytics/:bookId

Get analytics for a specific book, such as the number of reads, most popular sections, etc.

Response:
```bash
{
  "bookId": 1,
  "totalReads": 150,
  "mostPopularSection": "Chapter 1",
  "uniqueReaders": 75
}
```

- POST /books/analytics

Post analytics data for a specific book.

Request Body:
```bash
{
  "bookId": 1,
  "totalReads": 150,
  "mostPopularSection": "Chapter 1",
  "uniqueReaders": 75
}
```
Response:
```bash
{
  "message": "Analytics data saved successfully"
}
```

- GET /books/qrcode/:bookId

Generate a QR code for a specific book.

Response:
```bash
{
  "bookId": 1,
  "qrcodeUrl": "https://example.com/qrcodes/1.png"
}
```

## 2. Users

- POST /users

Create a new user.

Request Body:
```bash
{
  "userName": "JohnDoe"
}
```
Response:
```bash
{
  "userId": 1,
  "userName": "JohnDoe"
}
```

- POST /favorites/users/:userId

Add a book to a user’s favorites.

Request Body:
```bash
{
  "bookId": 1
}
```
Response:
```bash
{
  "message": "Book added to favorites"
}
```

- GET /favorites/users/:userId

Fetch a user’s favorite books.

Response:
```bash
{
  "userId": 1,
  "favorites": [
    {
      "id": 1,
      "title": "1984",
      "author": "George Orwell",
      "pages": 328
    }
  ]
}
```

- DELETE /favorites/users/:userId

Remove a book from a user’s favorites.

Request Body:
```bash
{
  "bookId": 1
}
```
Response:
```bash
{
  "message": "Book removed from favorites"
}
```

## Directory Structure

	•	public/qrcodes: Directory to store generated QR code images.

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in case of failures.

## Dependencies

	•	express
	•	mongoose
	•	body-parser
	•	qrcode
	•	path
	•	fs/promises
