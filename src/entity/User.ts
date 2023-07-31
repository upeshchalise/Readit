import { IsEmail, Length } from "class-validator";
import {
  Entity as TOEntity,
  Column,
  Index,
  BeforeInsert,
  OneToMany,
} from "typeorm";

import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";

import Entity from "./Entity";
import Post from "./Post";
import Vote from "./Vote";
import Comment from "./Comment";
import Sub from "./Sub";

@TOEntity("users")
export default class User extends Entity {
  constructor(user?: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Index()
  @IsEmail(undefined, { message: "Must be a valid email address" })
  @Length(1, 20, { message: "Email is empty" })
  @Column({ unique: true })
  email: string;

  @Index()
  @Length(3, 20, { message: "must be at least 3 character" })
  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  @Length(6, 20, { message: "must be atleast 3 character" })
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Sub, (sub) => sub.user)
  subs: Sub[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
