## Books API

This is a RESTful API for managing books and users’ favorite books. It supports various operations such as adding books, updating book details, adding/removing books from user favorites, and generating QR codes for books.

## Table of Contents

	•	Installation
	•	Running the Server
	•	API Endpoints
	•	Books
	•	POST /Book
	•	GET /books
	•	GET /books/:id
	•	DELETE /books/:id
	•	PUT /books/:id
	•	GET /books/analytics/:bookId
	•	POST /books/analytics
	•	GET /books/qrcode/:bookId
	•	Users
	•	POST /users
	•	POST /favorites/users/:userId
	•	GET /favorites/users/:userId
	•	DELETE /favorites/users/:userId

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

