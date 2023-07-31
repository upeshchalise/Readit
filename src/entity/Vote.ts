import { Column, JoinColumn, ManyToOne, Entity as TOEntity } from "typeorm";
import Entity from "./Entity";
import User from "./User";
import Post from "./Post";
import Comment from "./Comment";

@TOEntity("votes")
export default class Vote extends Entity {
  constructor(vote?: Partial<Vote>) {
    super();
    Object.assign(this, vote);
  }

  @Column()
  value: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @Column()
  username: string;

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => Comment)
  comment: Comment;
}
