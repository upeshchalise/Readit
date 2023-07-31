import { Request, Response, Router } from "express";
import User from "../entity/User";

import user from "../middleware/user";
import Post from "../entity/Post";
import Comment from "../entity/Comment";

const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneOrFail({
      where: { username: req.params.username },
      // select: ["username", "createdAt"],
      relations: ["posts", "comments", "votes"],
    });

    console.log(req.params.username);
    // const posts = await Post.find({
    //   where: { user: user as unknown },
    //   relations: ["comments", "votes", "sub"],
    // });

    // const comments = await Comment.find({
    //   where: { user: user as unknown },
    //   relations: ["post"],
    // });

    if (res.locals.user) {
      user.posts.forEach((p) => p.setUserVote(res.locals.user));
      user.comments.forEach((c) => c.setUserVote(res.locals.user));
    }

    let submissions: any[] = [];
    user.posts.forEach((p) =>
      submissions.push({ type: "Post", ...p.toJSON() })
    );
    user.comments.forEach((c) =>
      submissions.push({ type: "Comment", ...c.toJSON() })
    );

    submissions.sort((a, b) => {
      if (b.createdAt > a.createdAt) return 1;
      if (b.createdAt < a.createdAt) return -1;
      return 0;
    });

    res.json({ user, submissions });
  } catch (err) {
    console.log(err);
    return res.status(500).json(`something went wrong`);
  }
};

const router = Router();

router.get("/:username", user, getUserSubmissions);

export default router;
