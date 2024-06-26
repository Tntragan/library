'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookSchema = new Schema({
  comments: Array,
  title: { type: String, required: true },
  commentcount: Number
});

const Book = mongoose.model("Book", BookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(async (req, res) => {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const findBooks = await Book.find({});
        if (!findBooks) {
          res.send("No books exist in the database");
        } else {
          res.json(findBooks);
        }
      } catch (err) {
        console.log(err);
      }
    })

    .post(async (req, res) => {
      let title = req.body.title;
      try {
        let bookModel = await Book.findOne({ title: title });
        if (!bookModel) {
          bookModel = new Book({
            comments: [],
            title: title,
            commentcount: 0
          })
          const book = await bookModel.save();
          res.json({
            _id: book._id,
            title: book.title
          });
        } else {
          res.send("That book already exists in the database")
        }
      } catch (err) {
        res.json("missing required field title")
      }
    })

    .delete(async (req, res) => {
      //if successful response will be 'complete delete successful'

      try {
        const result = await Book.deleteMany({});
        res.send("complete delete successful");
      } catch (err) {
        res.send("unable to delete")
      }

    });



  app.route('/api/books/:id')
    .get(async (req, res) => {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const findBook = await Book.findOne({ _id: bookid });
        if (!findBook) {
          res.send("no book exists");
        } else {
          res.json({
            title: findBook.title,
            _id: findBook._id,
            comments: findBook.comments
          });
        }
      } catch (err) {
        console.log(err);
      }
    })

    .post(async (req, res) => {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        res.send("missing required field comment")
      }
      try {
        let bookModel = await Book.findOne({ _id: bookid });

        if (!bookModel) {
          res.send("no book exists");
        } else {
          let { title, _id, commentcount, comments } = bookModel;
          const newCount = commentcount + 1;
          const newComments = [comment, ...comments];
          const update = { comments: newComments, commentcount: newCount };
          bookModel = await Book.findByIdAndUpdate(bookid, update);
          await bookModel.save();
          res.json({
            title,
            _id,
            comments: newComments,
            commentcount: newCount
          })
        }
      } catch (err) {
        console.log(err);
      }
    })

    .delete(async (req, res) => {
      let bookid = req.params.id;
      const bookToFind = await Book.findOne({ _id: bookid });
      if (!bookToFind) {
        res.send("no book exists");
      }
      try {
        const deleteBook = await Book.deleteOne({ _id: bookid });
        res.send("delete successful")
      } catch (err) {
        console.log(err);
      }
      //if successful response will be 'delete successful'
    });

};
