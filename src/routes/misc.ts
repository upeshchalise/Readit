import { Request, Response, Router } from "express";

import User from "../entity/User";
import Post from "../entity/Post";
import Vote from "../entity/Vote";
import Comment from "../entity/Comment";
import { getRepository } from "typeorm";
import AppDataSource from "../data-source";
import Sub from "../entity/Sub";

import auth from "../middleware/auth";
import user from "../middleware/user";

const vote = async (req: Request, res: Response) => {
  const { identifier, slug, commentIdentifier, value } = req.body;

  // validate vote value
  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ value: `Value must be -1, 0 or 1` });
  }

  try {
    const user: User = res.locals.user;
    let post = await Post.findOneOrFail({ where: { identifier, slug } });
    let vote: Vote | undefined;
    let comment: Comment | undefined;

    if (commentIdentifier) {
      // If there is comment identifier find comment by vote
      comment = await Comment.findOneOrFail({
        where: { identifier: commentIdentifier },
      });

      vote = await AppDataSource.getRepository(Vote)
        .createQueryBuilder("vote")
        .where("vote.username = :name AND vote.commentId = :commentId", {
          name: user.username,
          commentId: comment.id,
        })
        .getOne();
    } else {
      // else find vote by post

      vote = await AppDataSource.getRepository(Vote)
        .createQueryBuilder("vote")
        .where("vote.username = :name AND vote.postId = :postId", {
          name: user.username,
          postId: post.id,
        })
        .getOne();
    }

    //   vote = await Vote.findOne({
    //     where: { user: user as any, comment: comment as any },
    //   });
    // } else {
    // else find vote by post
    //   vote = await Vote.findOne({
    //     where: {
    //       user: user as any,
    //       post: post as any,
    //     },
    //   });

    if (!vote && value === 0) {
      //if no votes and value = 0 return error
      return res.status(404).json({ error: `Vote not found` });
    } else if (!vote) {
      // if no vote, create it
      vote = new Vote({ user, value });
      if (comment) vote.comment = comment;
      else vote.post = post;
      await vote.save();
    } else if (vote && value === 0) {
      // if vote exist and value = 0 remove vote from DB
      await vote.remove();
    } else if (vote.value !== value) {
      // if vote and value has changed, update vote
      vote.value = value;
      await vote.save();
    }

    post = await Post.findOne({
      where: {
        identifier,
        slug,
      },
      relations: ["comments", "comments.votes", "sub", "votes"],
    });

    post.setUserVote(user);
    post.comments.forEach((c) => c.setUserVote(user));

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: `something went wrong` });
  }
};

const topSubs = async (_: Request, res: Response) => {
  try {
    /**
     * SELECT s.title, s.name,
     * COALESCE('http://localhost:5000/images/' || s."imageUrn" , 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y') as imageUrl,
     * count(p.id) as "postCount"
     * FROM subs s
     * LEFT JOIN posts p ON s.name = p."subName"
     * GROUP BY s.title, s.name, imageUrl
     * ORDER BY "postCount" DESC
     * LIMIT 5;
     */
    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn" , 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')`;

    const subs = await AppDataSource.getRepository(User)
      .createQueryBuilder()
      .select(
        `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Sub, "s")
      .leftJoin(Post, "p", `s.name = p."subName"`)
      .groupBy('s.title, s.name, "imageUrl"')
      .orderBy(`"postCount"`, "DESC")
      .limit(5)
      .execute();

    return res.json(subs);
  } catch (err) {
    return res.status(500).json({ error: `Something went wrong` });
  }
};

const router = Router();
router.post("/vote", user, auth, vote);
router.get("/top-subs", topSubs);

export default router;
