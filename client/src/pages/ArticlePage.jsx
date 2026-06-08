import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import commentsService from '../services/commentsService';
import { Trash2, Heart, MessageSquare } from 'lucide-react';
import useDocumentMetadata from '../hooks/useDocumentMetadata';

// ── Recursive State Helper Functions ───────────────────────────

const addReplyToComments = (commentList, parentId, newReply) => {
  return commentList.map(c => {
    if (String(c.id) === String(parentId)) {
      return {
        ...c,
        replies: [...(c.replies || []), newReply]
      };
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: addReplyToComments(c.replies, parentId, newReply)
      };
    }
    return c;
  });
};

const removeCommentFromList = (commentList, commentId) => {
  return commentList
    .filter(c => String(c.id) !== String(commentId))
    .map(c => {
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: removeCommentFromList(c.replies, commentId)
        };
      }
      return c;
    });
};

const toggleCommentLikeInList = (commentList, commentId, liked, likesCount, userId) => {
  return commentList.map(c => {
    if (String(c.id) === String(commentId)) {
      let updatedLikes = [...(c.likes || [])];
      if (liked) {
        if (userId && !updatedLikes.some(l => String(l.user || l) === String(userId))) {
          updatedLikes.push({ user: userId });
        }
      } else {
        updatedLikes = updatedLikes.filter(l => String(l.user || l) !== String(userId));
      }
      return {
        ...c,
        likesCount,
        likes: updatedLikes
      };
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: toggleCommentLikeInList(c.replies, commentId, liked, likesCount, userId)
      };
    }
    return c;
  });
};

const countTotalComments = (list) => {
  let count = 0;
  for (const item of list) {
    count += 1;
    if (item.replies && item.replies.length > 0) {
      count += countTotalComments(item.replies);
    }
  }
  return count;
};

// ── Recursive Comment Node Component ───────────────────────────

function CommentNode({ comment, depth = 0, user, onDelete, onLike, onReply }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
    } catch (err) {
      console.error("Failed to submit reply:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasLiked = user && comment.likes && comment.likes.some(like => String(like.user || like) === String(user.id || user._id));
  const canDelete = user && (
    String(user.id || user._id) === String(comment.authorId) || 
    user.role === 'admin'
  );

  return (
    <div className="flex flex-col bg-neutral-50 p-4 border border-neutral-100 shadow-sm relative group/comment">
      {/* Header */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-bold mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-800">{comment.author}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{comment.timestamp}</span>
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-neutral-400 hover:text-red-600 transition-colors p-0.5 rounded hover:bg-neutral-100 cursor-pointer"
              title="Delete Comment"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-neutral-700 text-[13px] leading-relaxed mb-3 select-text whitespace-pre-wrap">
        {comment.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-[11px] font-bold pt-2 border-t border-neutral-100">
        <button
          onClick={() => onLike(comment.id)}
          className={`flex items-center gap-1 transition-colors cursor-pointer ${
            hasLiked ? 'text-red-600' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Heart size={11} fill={hasLiked ? "currentColor" : "none"} />
          <span>{comment.likesCount || 0} Likes</span>
        </button>

        {user && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <MessageSquare size={11} />
            <span>Reply</span>
          </button>
        )}
      </div>

      {/* Inline Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-3 space-y-2 pt-2 border-t border-neutral-100">
          <textarea
            rows="2"
            placeholder={`Reply to ${comment.author}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-white border border-neutral-200 text-black px-3 py-2 text-xs focus:outline-none focus:border-neutral-400 rounded-none transition-colors resize-none"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 pl-3 md:pl-4 border-l border-neutral-200 space-y-4">
          {comment.replies.map(reply => (
            <CommentNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              user={user}
              onDelete={onDelete}
              onLike={onLike}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ArticlePage Component ─────────────────────────────────

export default function ArticlePage() {
  const { id } = useParams();
  const { posts, user, toggleLikePost } = useApp();
  const post = posts.find(p => String(p.id) === String(id));

  useDocumentMetadata({
    title: post ? post.title : 'Article Details',
    description: post ? (post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 150)) : 'Read the full story on Daily Pulse.',
    keywords: post ? `${post.category?.toLowerCase()}, article, story, daily pulse` : 'article, daily pulse'
  });

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState('');

  // Fetch comments of the post from the database
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const data = await commentsService.getByPostId(id);
        setComments(data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setCommentsLoading(false);
      }
    };

    if (post) {
      fetchComments();
    }
  }, [id, post]);

  const handlePostLike = async () => {
    if (!user) {
      alert("Please sign in to like this article.");
      return;
    }
    try {
      await toggleLikePost(post.id);
    } catch (err) {
      console.error("Failed to like post:", err);
      alert(err.message || "Failed to like post");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;

    try {
      const newComment = await commentsService.create(id, newCommentContent);
      setComments(prev => [newComment, ...prev]);
      setNewCommentContent('');
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert(err.message || "Failed to add comment");
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      try {
        await commentsService.delete(commentId);
        setComments(prev => removeCommentFromList(prev, commentId));
      } catch (err) {
        console.error("Failed to delete comment:", err);
        alert(err.message || "Failed to delete comment");
      }
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!user) {
      alert("Please sign in to like comments.");
      return;
    }
    try {
      const result = await commentsService.toggleLike(commentId);
      const userId = user.id || user._id;
      setComments(prev => toggleCommentLikeInList(prev, commentId, result.liked, result.likesCount, userId));
    } catch (err) {
      console.error("Failed to toggle comment like:", err);
      alert(err.message || "Failed to toggle comment like");
    }
  };

  const handleCommentReply = async (commentId, replyText) => {
    if (!user) {
      alert("Please sign in to reply.");
      return;
    }
    try {
      const newReply = await commentsService.create(id, replyText, commentId);
      setComments(prev => addReplyToComments(prev, commentId, newReply));
    } catch (err) {
      console.error("Failed to reply to comment:", err);
      alert(err.message || "Failed to submit reply");
      throw err;
    }
  };

  if (!post) {
    return (
      <div className="bg-white text-black py-32 text-center font-serif text-xl flex-grow">
        Article not found. <Link to="/" className="text-blue-600 underline">Return to Home</Link>
      </div>
    );
  }

  // Get 3 related posts (from same category, or just other posts)
  const relatedPosts = posts
    .filter(p => String(p.id) !== String(post.id) && (p.category === post.category || true))
    .slice(0, 3);

  const userId = user?.id || user?._id;
  const isPostLiked = userId && post.likes && post.likes.some(like => String(like.user || like) === String(userId));

  return (
    <article className="bg-white text-black py-16 px-4 md:px-8 flex-grow border-b border-neutral-100">
      <div className="max-w-4xl mx-auto">

        {/* Category & Header */}
        <div className="space-y-4 mb-8">
          <span className="inline-block bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-neutral-950 tracking-tight leading-tight select-text">
            {post.title}
          </h1>

          {/* Author / Date & Like byline */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-2 border-t border-neutral-100 mt-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500 font-sans font-bold">
              <span className="text-neutral-800">By {post.author}</span>
              <span className="text-neutral-300">•</span>
              <span>{post.date}</span>
              <span className="text-neutral-300">•</span>
              <span className="text-neutral-400 font-black">{post.readTime}</span>
            </div>

            <button
              onClick={handlePostLike}
              className={`flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer text-xs font-bold font-sans uppercase tracking-wider ${
                isPostLiked 
                  ? 'text-red-600' 
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Heart size={13} fill={isPostLiked ? "currentColor" : "none"} />
              <span>{post.likesCount || 0} Likes</span>
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative w-full aspect-[1.8] overflow-hidden border border-neutral-100 bg-neutral-50 shadow-sm mb-10">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Rich Body Content */}
        <div
          className="max-w-4xl mx-auto font-serif text-base md:text-lg text-neutral-800 leading-relaxed space-y-6 select-text article-body"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* RELATED ARTICLES SECTION */}
        <div className="max-w-3xl mx-auto pt-16 border-t border-neutral-100 mt-16 space-y-6">
          <h3 className="text-lg md:text-xl font-black font-serif text-neutral-950 tracking-tight">
            Related Stories
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((story) => (
              <Link key={story.id} to={`/article/${story.id}`} className="group flex flex-col cursor-pointer">
                <div className="relative w-full aspect-[1.58] overflow-hidden bg-neutral-100 border border-neutral-100 mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h4 className="text-neutral-900 text-sm font-extrabold font-serif leading-snug line-clamp-2 group-hover:text-neutral-700 transition-colors select-text">
                  {story.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="max-w-2xl mx-auto pt-16 border-t border-neutral-100 mt-16 space-y-8 animate-fade-in">
          <h3 className="text-lg md:text-xl font-black font-serif text-neutral-950 tracking-tight">
            Discussion ({countTotalComments(comments)})
          </h3>

          {/* Comments List */}
          <div className="space-y-6">
            {commentsLoading ? (
              <p className="text-center text-xs text-neutral-400 py-6">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-center text-xs text-neutral-400 py-6">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <CommentNode
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  user={user}
                  onDelete={handleCommentDelete}
                  onLike={handleCommentLike}
                  onReply={handleCommentReply}
                />
              ))
            )}
          </div>

          {/* Comment Form */}
          <div className="bg-neutral-50 p-6 md:p-8 border border-neutral-100 shadow-sm">
            <h4 className="text-sm font-black font-sans uppercase tracking-wider text-neutral-900 mb-4">
              Leave a Comment
            </h4>
            {user ? (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-3">
                    Commenting as <span className="font-bold text-neutral-800">{user.name}</span> (@{user.email ? user.email.split('@')[0] : 'user'})
                  </p>
                  <label htmlFor="commenter-content" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Your Comment *
                  </label>
                  <textarea
                    id="commenter-content"
                    rows="4"
                    placeholder="Share your thoughts on this article..."
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    className="w-full bg-white border border-neutral-200 text-black px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400 rounded-none transition-colors resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 transition-colors duration-150 cursor-pointer"
                >
                  Post Comment
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-neutral-600 text-sm font-serif mb-3">
                  Please sign in or register to join the discussion.
                </p>
                <Link
                  to="/auth"
                  className="inline-block bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 transition-colors"
                >
                  Sign In / Register
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </article>
  );
}
