import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  const db = await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'lostStoriesDB',
  });
  isConnected = db.connections[0].readyState === 1;
}

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  banLevel: { type: String, default: 'State' },
  originDistrict: { type: String, default: 'Community Submission' },
  banReason: { type: String, default: 'Under Community Verification' },
  category: { type: String, default: 'User Submitted' },
  getWays: [String],
  localStores: [String],
  userShare: { type: String, default: '' },
  mediaLink: { type: String, default: '' },
  imagePreview: { type: String, default: '' },
  creditedAuthor: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);