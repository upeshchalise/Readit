import { Request, Response, Router, query } from "express";

import auth from "../middleware/auth";
import Post from "../entity/Post";
import Sub from "../entity/Sub";
import Comment from "../entity/Comment";
import user from "../middleware/user";

const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;

  const user = res.locals.user;

  if (title.trim() === "") {
    return res.status(400).json({ title: `title must not be empty` });
  }

  try {
    //find sub

    const subRecord = await Sub.findOneOrFail({ where: { name: sub } });

    const post = new Post({ title, body, user, sub: subRecord });
    await post.save();

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: `Something went wrong` });
  }
};

const getPosts = async (req: Request, res: Response) => {
  const currentPage: number = (req.query.page || 0) as number;
  const postsPerPage: number = (req.query.count || 5) as number;

  try {
    const posts = await Post.find({
      order: { createdAt: "DESC" },
      relations: ["comments", "votes", "sub"],
      skip: currentPage * postsPerPage,
      take: postsPerPage,
    });

    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const post = await Post.findOneOrFail({
      relations: ["sub", "votes", "comments"],
      where: { identifier: identifier, slug: slug },
    });
    console.log(post);

    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }
    return res.json(post);
  } catch (err) {
    // console.log(err);
    return res.status(404).json({ error: "Post not found" });
  }
};

const commentOnPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const { body } = req.body;

  try {
    const post = await Post.findOneOrFail({
      where: { identifier: identifier, slug: slug },
    });

    const comment = new Comment({
      body,
      user: res.locals.user,
      post,
    });

    // console.log(comment);
    await comment.save();

    return res.json(comment);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ error: "Post not found" });
  }
};

// const getPostComment = async (req: Request, res: Response) => {
//   const { identifier, slug } = req.params;

//   try {
//     const post = await Post.findOneOrFail({
//       where: {
//         identifier: identifier,
//         slug: slug,
//       },
//     });

//     const comments = await Comment.find({
//       where: { post: post as unknown },
//       order: { createdAt: "DESC" },
//       relations: ["votes"],
//     });
//     console.log(comments);

//     if (res.locals.user) {
//       comments.forEach((c) => c.setUserVote(res.locals.user));
//     }
//     console.log(comments);
//     return res.json(comments);
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ error: `Something went wrong` });
//   }
// };

const getPostComments = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  try {
    const post = await Post.findOneOrFail({
      where: {
        identifier: identifier,
        slug: slug,
      },
      relations: ["comments", "comments.votes"], // Include comments and their votes
    });

    // const comments = await Comment.find({
    //   where: { post:post},
    //   order: { createdAt: "DESC" },
    //   relations: ["votes"],
    // });

    if (res.locals.user) {
      post.comments.forEach((c) => c.setUserVote(res.locals.user));
    }
    console.log(post.comments);

    return res.json(post.comments);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const router = Router();

router.post("/", user, auth, createPost);
router.get("/", user, getPosts);
router.get("/:identifier/:slug", user, getPost);
router.post("/:identifier/:slug/comments", user, auth, commentOnPost);
router.get("/:identifier/:slug/comments", user, getPostComments);

export default router;
