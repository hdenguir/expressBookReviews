const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

function booksPromise() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const bks = await booksPromise();
        res.send(JSON.stringify(bks, null, 4));
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

function isbnPromise(isbn) {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({ status: 404, message: `ISBN ${isbn} not found` });
        }
    })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    isbnPromise(isbn)
        .then(result => res.send(result))
        .catch(error => res.status(error.status).json({ message: error.message }));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    booksPromise()
        .then((bookEntries) => Object.values(bookEntries))
        .then((books) => books.filter((book) => book.author === author))
        .then((filteredBooks) => res.send(filteredBooks));

});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    booksPromise()
        .then((bookEntries) => Object.values(bookEntries))
        .then((books) => books.filter((book) => book.title === title))
        .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews);
});

module.exports.general = public_users;
