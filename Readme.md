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
npm run dev
```

The server will start on port 4000.

## API Endpoints

## 1. Books
- POST /Book

http://localhost:4000/Book

Add a new book.

Request Body:
```bash
{ 
  "title": "To Kill a Mockingbird", 
  "author": "Harper Lee",
  "pages": 281 
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

http://localhost:4000/books

Fetch all books.

Response:
```bash
[
    {
        "id": 1,
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "pages": 281
    }
]
```

- GET /books/:id

http://localhost:4000/books/1

Fetch a specific book by its ID.

Response:
```bash
{
    "id": 1,
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "pages": 281
}
```

- DELETE /books/:id

http://localhost:4000/books/1

Delete a book by its ID.

Response:
```bash
{
  "message": "Book deleted successfully"
}
```

- PUT /books/:id

http://localhost:4000/books/1

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
Note: Make sure you add a book after deleting it so that the book wont go empty. If so while updating through put request it shows an error of "Book not found".

- POST /books/analytics

http://localhost:4000/books/analytics

Post analytics data for a specific book.

Request Body:
```bash
{
  "bookId": 1,
  "totalReads": 250,
  "mostPopularSection": "Chapter 2",
  "uniqueReaders": 25
}
```
Response:
```bash
{
  "message": "Analytics data saved successfully"
}
```

- GET /books/analytics/:bookId

http://localhost:4000/books/analytics/1

Get analytics for a specific book, such as the number of reads, most popular sections, etc.

Response:
```bash
{
    "bookId": 1,
    "totalReads": 250,
    "mostPopularSection": "Chapter 2",
    "uniqueReaders": 25
}
```



- GET /books/qrcode/:bookId

http://localhost:4000/books/qrcode/1

Generate a QR code for a specific book.

Response:
```bash
{
    "bookId": 1,
    "qrcodeUrl": "https://example.com/qrcodes/1.png"
}
```
Note: Make sure you have specific folders for storing qr code. Or it will show an error.

## 2. Users

- POST /users

http://localhost:4000/users

Create a new user.

Request Body:
```bash
{
    "userName":"Jonath"
}
```
Response:
```bash
{
    "userId": 1,
    "userName": "Jonath",
    "favorites": [],
    "_id": "668ec543a9ee1b3ced0ee23a",
    "__v": 0
}
```
Note: Post more than one user so that it helps while sharing one book from person 1 to person 2. That end point is comming below in this doc.

- POST /favorites/users/:userId

http://localhost:4000/favorites/users/1

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

http://localhost:4000/favorites/users/1

Fetch a user’s favorite books.

Response:
```bash
{
    "userId": 1,
    "favorites": [
        {
            "id": 1,
            "title": "To Kill a Mockingbird",
            "author": "Harper Lee",
            "pages": 281
        }
    ]
}
```

- DELETE /favorites/users/:userId

http://localhost:4000/favorites/users/1

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

- PUT /favorites/users/userId

http://localhost:4000/favorites/users/1

Share a book from one user to another. The userId from which the book is shared is mentioned in the end url. The userId to which the book is shared and bookId is mentioned in the body/json.
Before Make sure you added 2 users and atleast 1 book. And the book which is being shared is in the favourites list of user1.

Request Body:
```bash
{
"userId": 2,
"bookId":1
}
```
Response:
```bash
{
    "message": "Book shared successfully"
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
