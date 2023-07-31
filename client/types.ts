export interface Post {
  title: string;
  body?: string;
  identifier: string;
  username: string;
  slug: string;
  sub?: Sub;
  subName: string;
  createdAt: string;
  updatedAt: string;

  // virtual field
  url: string;
  commentCount?: number;
  voteScore?: number;
  userVote?: number;
}

export interface User {
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sub {
  createdAt: string;
  updatedAt: string;
  name: string;
  title: string;
  description: string;
  username: string;
  imageUrn: string;
  bannerUrn: string;
  posts: Post[];

  // virtuals
  imageUrl: string;
  bannerUrl: string;
  postCount: number;
}

export interface Comment {
  createdAt: string;
  updatedAt: string;
  identifier: string;
  body: string;
  username: string;
  post?: Post;

  // virtuals
  userVote: number;
  voteScore: number;
}
