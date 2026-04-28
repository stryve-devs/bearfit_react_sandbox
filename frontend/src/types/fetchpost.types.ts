export type PostFolder = 'Post/Images' | 'Post/Videos';

export type UploadFileAsset = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
};

export type UploadedMedia = {
  url: string;
  key: string;
  folder: string;
  type?: 'Images' | 'Videos';
  originalName: string;
  size: number;
  mimeType?: string;
};

export type PostVisibility = 'public' | 'private' | 'friends';

export type CreatePostResponse = {
  success: boolean;
  message: string;
  visibility: PostVisibility;
  summary: {
    totalFiles: number;
    imagesCount: number;
    videosCount: number;
  };
  images: UploadedMedia[];
  videos: UploadedMedia[];
  files: UploadedMedia[];
};

export type UploadResponse = {
  success: boolean;
  message: string;
  file?: UploadedMedia;
  files?: UploadedMedia[];
};

export type R2Object = {
  key: string;
  size: number;
  lastModified: string;
  storageClass: string;
};

export type ListFilesResponse = {
  files: R2Object[];
  count: number;
};

export type DiscoverMedia = {
  url: string;
  type: 'IMAGE' | 'VIDEO';
};

export type DiscoverComment = {
  id: string;
  user: string;
  avatarUrl: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  replies: DiscoverComment[];
};

export type DiscoverPostExercise = {
  name: string;
  setsCount: number;
  imagePath?: string;
};

export type DiscoverPost = {
  id: string;
  userId: number;
  title?: string;
  caption: string;
  time: string;
  stats: {
    time: string;
    bpm?: string;
    reps?: string;
    weight?: string;
    distance?: string;
  };
  athlete: {
    name: string;
    username: string;
    avatarUrl: string;
  };
  media: DiscoverMedia[];
  exercises: DiscoverPostExercise[];
  likesCount: number;
  likedByMe: boolean;
  likedByUsername?: string;
  likedByAvatarUrls?: string[];
  commentsCount: number;
  comments: DiscoverComment[];
};

export type DiscoverFeedResponse = {
  posts: DiscoverPost[];
  nextCursor: string | null;
};

export type DiscoverPostResponse = {
  post: DiscoverPost;
};

export type TogglePostLikeResponse = {
  liked: boolean;
  likesCount: number;
  likedByUsername?: string;
  likedByAvatarUrls?: string[];
};

export type CreateCommentResponse = {
  comment: DiscoverComment;
};
