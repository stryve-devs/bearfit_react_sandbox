import { Request, Response } from 'express';
import {
  createPostComment,
  getDiscoverPostById,
  getDiscoverPosts,
  saveWorkoutPost,
  togglePostLike,
} from '../../services/workout/workout.service';
import {
  CreatePostCommentInput,
  discoverFeedQuerySchema,
  postIdParamsSchema,
  SaveWorkoutPostInput,
} from '../../utils/validationSchemas';

export const createWorkoutPost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = req.body as SaveWorkoutPostInput;
    const result = await saveWorkoutPost(userId, payload);

    return res.status(201).json({
      message: 'Workout saved successfully',
      workoutId: result.workoutId,
      postId: result.postId,
      isFirstWorkout: result.isFirstWorkout,
      createdAt: result.createdAt,
    });
  } catch (error: any) {
    console.error('Error saving workout post:', error);
    return res.status(500).json({ message: error?.message || 'Failed to save workout post' });
  }
};

export const discoverWorkoutPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const query = discoverFeedQuerySchema.parse(req.query);
    const limit = query.limit ?? 3;
    const result = await getDiscoverPosts(userId, limit, query.cursor);

    return res.status(200).json({
      posts: result.posts,
      nextCursor: result.nextCursor,
    });
  } catch (error: any) {
    console.error('Error fetching discover posts:', error);
    return res.status(500).json({ message: error?.message || 'Failed to fetch discover posts' });
  }
};

export const toggleWorkoutPostLike = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const params = postIdParamsSchema.parse(req.params);
    const result = await togglePostLike(userId, params.postId);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error toggling post like:', error);
    return res.status(500).json({ message: error?.message || 'Failed to toggle like' });
  }
};

export const createWorkoutPostComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const params = postIdParamsSchema.parse(req.params);
    const payload = req.body as CreatePostCommentInput;
    const comment = await createPostComment(userId, params.postId, payload);

    return res.status(201).json({ comment });
  } catch (error: any) {
    console.error('Error creating post comment:', error);
    return res.status(500).json({ message: error?.message || 'Failed to create comment' });
  }
};

export const discoverWorkoutPostById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const params = postIdParamsSchema.parse(req.params);
    const post = await getDiscoverPostById(userId, params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ post });
  } catch (error: any) {
    console.error('Error fetching discover post:', error);
    return res.status(500).json({ message: error?.message || 'Failed to fetch discover post' });
  }
};
