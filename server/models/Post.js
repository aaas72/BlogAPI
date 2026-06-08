import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title must not exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt must not exceed 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featuredImage: {
    type: String,
    default: 'default-post.jpg'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  readTime: {
    type: Number, // in minutes
    default: 1
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: likes count
PostSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

PostSchema.pre('save', function (next) {
  if (this.content) {
    const wordsCount = this.content.split(' ').length;
    this.readTime = Math.ceil(wordsCount / 200);
  }
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 150) + '...';
  }
  next();
});

// Indexes for search
PostSchema.index({
  title: 'text', 
  content: 'text', 
  tags: 'text' 
});
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ status: 1, createdAt: -1 });



export default mongoose.model('Post', PostSchema);