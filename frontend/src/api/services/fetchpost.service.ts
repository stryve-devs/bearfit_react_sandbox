import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import api from '../client';
import {
  CreateCommentResponse,
  CreatePostResponse,
  DiscoverFeedResponse,
  DiscoverPostResponse,
  PostFolder,
  PostVisibility,
  TogglePostLikeResponse,
  UploadFileAsset,
  UploadResponse,
  UploadedMedia,
} from '../../types/fetchpost.types';

const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT || '';
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || 'bearfit-assets';
const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL || 'https://pub-d0fbe48b068b460e96f026d1d9fe3c68.r2.dev';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const ensureConfig = () => {
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    throw new Error('Missing R2 config. Set EXPO_PUBLIC_R2_ENDPOINT, EXPO_PUBLIC_R2_ACCESS_KEY_ID, EXPO_PUBLIC_R2_SECRET_ACCESS_KEY, EXPO_PUBLIC_R2_BUCKET_NAME.');
  }
};

const toBytes = async (asset: UploadFileAsset): Promise<Uint8Array> => {
  try {
    const response = await fetch(asset.uri);
    const blob = await response.blob();

    // Use FileReader to convert Blob to ArrayBuffer (RN compatible)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(new Uint8Array(arrayBuffer));
      };
      reader.onerror = () => {
        reject(new Error(`Failed to read blob: ${reader.error}`));
      };
      reader.readAsArrayBuffer(blob);
    });
  } catch (error) {
    throw new Error(`Failed to read file ${asset.name}: ${error}`);
  }
};

const buildUploaded = (key: string, asset: UploadFileAsset, folder: PostFolder): UploadedMedia => ({
  url: `${R2_PUBLIC_URL}/${key}`,
  key,
  folder,
  type: folder === 'Post/Images' ? 'Images' : 'Videos',
  originalName: asset.name,
  size: asset.size || 0,
  mimeType: asset.mimeType,
});

const uploadAsset = async (asset: UploadFileAsset, folder: PostFolder): Promise<UploadedMedia> => {
  const safeName = asset.name.replace(/\s+/g, '-');
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
  const body = await toBytes(asset);

  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: asset.mimeType || 'application/octet-stream',
  });

  await s3Client.send(cmd);
  return buildUploaded(key, asset, folder);
};

export const fetchPostService = {
  async uploadFile(key: string, body: Uint8Array | Blob | Buffer): Promise<string> {
    ensureConfig();
    const cmd = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body as any,
    });
    await s3Client.send(cmd);
    return `${R2_PUBLIC_URL}/${key}`;
  },

  async uploadMedia(files: UploadFileAsset[], folder: PostFolder): Promise<UploadResponse> {
    ensureConfig();

    if (files.length === 1) {
      const file = await uploadAsset(files[0], folder);
      return {
        success: true,
        message: 'File uploaded successfully',
        file,
      };
    }

    const uploaded = await Promise.all(files.map((asset) => uploadAsset(asset, folder)));
    return {
      success: true,
      message: 'Files uploaded successfully',
      files: uploaded,
    };
  },

  async createPost(files: UploadFileAsset[], visibility: PostVisibility = 'public'): Promise<CreatePostResponse> {
    ensureConfig();

    const detectFolder = (asset: UploadFileAsset): PostFolder => {
      const mimeType = asset.mimeType || '';
      const fileName = asset.name.toLowerCase();

      // Check mimeType first
      if (mimeType.startsWith('video/')) {
        return 'Post/Videos';
      }

      // Fallback to file extension check
      const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
      if (videoExts.some(ext => fileName.endsWith(ext))) {
        return 'Post/Videos';
      }

      // Default to images
      return 'Post/Images';
    };

    const uploaded = await Promise.all(
      files.map((asset) => {
        const folder = detectFolder(asset);
        return uploadAsset(asset, folder);
      })
    );

    const images = uploaded.filter((f) => f.type === 'Images');
    const videos = uploaded.filter((f) => f.type === 'Videos');

    return {
      success: true,
      message: 'Post created successfully',
      visibility,
      summary: {
        totalFiles: uploaded.length,
        imagesCount: images.length,
        videosCount: videos.length,
      },
      images,
      videos,
      files: uploaded,
    };
  },

  async listFiles(prefix: string): Promise<string[]> {
    ensureConfig();

    const cmd = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
    });
    const res = await s3Client.send(cmd);
    return (res.Contents || [])
      .map((obj) => obj.Key || '')
      .filter((key) => key && !key.endsWith('/'))
      .map((key) => `${R2_PUBLIC_URL}/${key}`);
  },

  publicUrlFromKey(key: string): string {
    return `${R2_PUBLIC_URL}/${key}`;
  },

  async getDiscoverPosts(limit = 3, cursor?: string): Promise<DiscoverFeedResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) {
      params.set('cursor', cursor);
    }

    const response = await api.get(`/workouts/discover?${params.toString()}`);
    return response.data;
  },

  async getDiscoverPostById(postId: string): Promise<DiscoverPostResponse> {
    const response = await api.get(`/workouts/posts/${postId}`);
    return response.data;
  },

  async togglePostLike(postId: string): Promise<TogglePostLikeResponse> {
    const response = await api.post(`/workouts/posts/${postId}/like`);
    return response.data;
  },

  async createPostComment(postId: string, text: string, parentId?: string): Promise<CreateCommentResponse> {
    const payload = parentId ? { text, parentId: Number(parentId) } : { text };
    const response = await api.post(`/workouts/posts/${postId}/comments`, payload);
    return response.data;
  },
};
