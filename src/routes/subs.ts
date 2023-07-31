import { NextFunction, Request, Response, Router } from "express";

import { isEmpty } from "class-validator";
import User from "../entity/User";
import Sub from "../entity/Sub";
import auth from "../middleware/auth";
import dataSource from "../data-source";
import user from "../middleware/user";
import Post from "../entity/Post";
import multer, { FileFilterCallback } from "multer";
import { makeId } from "../utils/helper";
import path from "path";
import fs from "node:fs";
import { ILike } from "typeorm";

const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  const user: User = res.locals.user;

  try {
    const errors: any = {};
    if (isEmpty(name)) errors.name = "Name must not be empty";
    if (isEmpty(title)) errors.title = "Title must not be empty";

    const sub = await dataSource
      .getRepository(Sub)
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.name = "Sub already exists";

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (err) {
    return res.status(400).json(err);
  }

  try {
    const sub = new Sub({ name, title, description, user });
    await sub.save();

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;
  console.log(name);
  try {
    const sub = await Sub.findOneOrFail({
      where: { name },
      relations: ["posts"],
    });
    console.log(sub);
    const posts = await Post.find({
      where: { sub: sub as unknown },
      order: { createdAt: "DESC" },
      relations: ["comments", "votes"],
    });

    // sub.posts = posts;
    // console.log(sub);

    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ sub: `sub not found` });
  }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

    if (sub.username !== user.username) {
      return res
        .status(403)
        .json({ error: `not allowed to upload on other's sub` });
    }

    res.locals.sub = sub;
    return next();
  } catch (err) {
    return res.status(500).json({ error: `Something went wrong` });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "public/images",
    filename: (_, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname)); //e.g jdhahkjfakj + .png
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      callback(null, true);
    } else {
      callback(new Error("not an image"));
    }
  },
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;

  try {
    const type = req.body.type;
    console.log(req.file);

    if (type !== "image" && type !== "banner") {
      fs.unlinkSync(req.file.path); //if type doesn't match it deletes the uploaded file

      return res.status(400).json({ error: `invalid types` });
    }

    let oldImageUrn: string = "";
    if (type === "image") {
      oldImageUrn = sub.imageUrn || "";
      sub.imageUrn = req.file.filename;
    } else if (type === "banner") {
      oldImageUrn = sub.bannerUrn || "";
      sub.bannerUrn = req.file.filename;
    }

    await sub.save();

    if (oldImageUrn !== "") {
      fs.unlinkSync(`public\/images\/${oldImageUrn}`);
      // fs.unlinkSync(oldImageUrn);
    }

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: `something went wrong` });
  }
};

const searchSubs = async (req: Request, res: Response) => {
  try {
    const name = req.params.name;

    if (isEmpty(name)) {
      return res.status(400).json({ error: "name mustnot be empty" });
    }

    // const subs = await dataSource
    //   .getRepository(Sub)
    //   .createQueryBuilder("subs")
    //   .where("LOWER(name) LIKE :name", {
    //     name: `${name.toLowerCase().trim}%`,
    //   })
    //   .getMany();

    const subs = await dataSource
      .getRepository(Sub)
      .createQueryBuilder("subs")
      .where("subs.name ILIKE :name", {
        name: `${name.toLowerCase().trim()}%`,
      })
      .getMany();
    // const subs = await dataSource
    //   .createQueryBuilder()
    //   .select("subs")
    //   .from(Sub, "subs")
    //   .where("LOWER(sub.name) LIKE :name", {
    //     name: `${name.toLowerCase().trim}%`,
    //   })
    //   .getMany();

    return res.json(subs);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: `Something went wrong` });
  }
};

const router = Router();

router.post("/", user, auth, createSub);
router.get("/:name", user, getSub);
router.get("/search/:name", searchSubs);
router.post(
  "/:name/image",
  user,
  auth,
  ownSub,
  upload.single("file"),
  uploadSubImage
);

export default router;
