import { connectDB, Book } from './_db.js';

export default async function handler(req, res) {
  // CORS configuration if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const books = await Book.find({}).sort({ createdAt: -1 });
      return res.status(200).json(books);
    }

    if (req.method === 'POST') {
      const newBook = new Book(req.body);
      const savedBook = await newBook.save();
      return res.status(201).json(savedBook);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database Connection Failed', details: error.message });
  }
}