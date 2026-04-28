"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverWorkoutPostById = exports.createWorkoutPostComment = exports.toggleWorkoutPostLike = exports.discoverWorkoutPosts = exports.createWorkoutPost = void 0;
const workout_service_1 = require("../../services/workout/workout.service");
const validationSchemas_1 = require("../../utils/validationSchemas");
const createWorkoutPost = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const payload = req.body;
        const result = await (0, workout_service_1.saveWorkoutPost)(userId, payload);
        return res.status(201).json({
            message: 'Workout saved successfully',
            workoutId: result.workoutId,
            postId: result.postId,
            isFirstWorkout: result.isFirstWorkout,
            createdAt: result.createdAt,
        });
    }
    catch (error) {
        console.error('Error saving workout post:', error);
        return res.status(500).json({ message: error?.message || 'Failed to save workout post' });
    }
};
exports.createWorkoutPost = createWorkoutPost;
const discoverWorkoutPosts = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const query = validationSchemas_1.discoverFeedQuerySchema.parse(req.query);
        const limit = query.limit ?? 3;
        const result = await (0, workout_service_1.getDiscoverPosts)(userId, limit, query.cursor);
        return res.status(200).json({
            posts: result.posts,
            nextCursor: result.nextCursor,
        });
    }
    catch (error) {
        console.error('Error fetching discover posts:', error);
        return res.status(500).json({ message: error?.message || 'Failed to fetch discover posts' });
    }
};
exports.discoverWorkoutPosts = discoverWorkoutPosts;
const toggleWorkoutPostLike = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const params = validationSchemas_1.postIdParamsSchema.parse(req.params);
        const result = await (0, workout_service_1.togglePostLike)(userId, params.postId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Error toggling post like:', error);
        return res.status(500).json({ message: error?.message || 'Failed to toggle like' });
    }
};
exports.toggleWorkoutPostLike = toggleWorkoutPostLike;
const createWorkoutPostComment = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const params = validationSchemas_1.postIdParamsSchema.parse(req.params);
        const payload = req.body;
        const comment = await (0, workout_service_1.createPostComment)(userId, params.postId, payload);
        return res.status(201).json({ comment });
    }
    catch (error) {
        console.error('Error creating post comment:', error);
        return res.status(500).json({ message: error?.message || 'Failed to create comment' });
    }
};
exports.createWorkoutPostComment = createWorkoutPostComment;
const discoverWorkoutPostById = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const params = validationSchemas_1.postIdParamsSchema.parse(req.params);
        const post = await (0, workout_service_1.getDiscoverPostById)(userId, params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        return res.status(200).json({ post });
    }
    catch (error) {
        console.error('Error fetching discover post:', error);
        return res.status(500).json({ message: error?.message || 'Failed to fetch discover post' });
    }
};
exports.discoverWorkoutPostById = discoverWorkoutPostById;
