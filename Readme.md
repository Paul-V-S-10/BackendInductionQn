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

