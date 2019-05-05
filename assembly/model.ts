// Exporting a new class Tweet so it can be used outside of this file.
export class Tweet {
  id: i32;
  sender: string;
  text: string;
  author: string;
  created: string;
  avatar: string;
  img: string;
  likes: i32;
  retweets: i32;
  hasLiked: bool;
  hasRetweeted: bool;
}

export class TweetLike {
  likes: i32;
  hasLiked: bool;
}

export class TweetRetweet {
  retweets: i32;
  hasRetweeted: bool;
  retweet: Tweet;
}
