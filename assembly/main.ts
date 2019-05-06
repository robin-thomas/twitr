import "allocator/arena";
export { memory };

import { context, storage, near, collections } from "./near";

import { Tweet, TweetLike, TweetRetweet } from "./model.near";

// --- contract code goes below

// The maximum number of latest messages the contract returns.
const TWEET_LIMIT = 20;

// collections.vector is a persistent collection. Any changes to it will
// be automatically saved in the storage.
// The parameter to the constructor needs to be unique across a single contract.
// It will be used as a prefix to all keys required to store data in the storage.
let tweets = collections.vector<Tweet>("t");

// Adds a new tweet under the name of the sender's account id.
// NOTE: This is a change method. Which means it will modify the state.
// But right now we don't distinguish them with annotations yet.
export function addTweet(tweet: Tweet): Tweet {
  tweet.id = tweets.length;
  tweet.sender = context.sender;
  tweets.push(tweet);

  let likesMap = collections.map<string, string>('likes:' + tweet.id.toString());
  likesMap.set('.count', 'likeCount_' + tweet.id.toString());

  let retweetsMap = collections.map<string, string>('retweets:' + tweet.id.toString());
  retweetsMap.set('.count', 'retweetCount_' + tweet.id.toString());

  return tweet;
}

// Returns an array of N messages from a given position (defaults to end).
// NOTE: This is a view method. Which means it should NOT modify the state.
export function getTweets(sender: string, end: i32): Array<Tweet> {
  end = end || tweets.length;
  sender = sender || ""

  let numTweets = min(TWEET_LIMIT, tweets.length);
  let startIndex = end - numTweets;

  let result = new Array<Tweet>(numTweets);
  for (let i = 0; i < numTweets; i++) {
    result[i] = tweets[i + startIndex];

    // Get the "likes" count.
    let likesMap = collections.map<string, string>('likes:' + result[i].id.toString());
    result[i].hasLiked = likesMap.contains(sender);
    result[i].likes = likesMap.count();

    // Get the "retweets" count.
    let retweetsMap = collections.map<string, string>('retweets:' + result[i].id.toString());
    result[i].hasRetweeted = retweetsMap.contains(sender);
    result[i].retweets = retweetsMap.count();
  }

  return result;
}

// Update the "likes" count of a tweet.
// NOTE: This is a change method. Which means it will modify the state.
// But right now we don't distinguish them with annotations yet.
export function toggleLike(id: i32): TweetLike {
  let likesMap = collections.map<string, string>('likes:' + id.toString());

  if (likesMap.contains(context.sender)) {
    // Like already exists. Remove it.
    likesMap.delete(context.sender);
  } else {
    // Add a like.
    likesMap.set(context.sender, "");
  }

  let tweetLike = new TweetLike();
  tweetLike.likes = likesMap.count();
  tweetLike.hasLiked = likesMap.contains(context.sender);

  return tweetLike;
}

// Update the "retweet" count of a tweet.
// NOTE: This is a change method. Which means it will modify the state.
// But right now we don't distinguish them with annotations yet.
export function retweet(id: i32, created: string, author: string, avatar: string): TweetRetweet {
  let retweetsMap = collections.map<string, string>('retweets:' + id.toString());

  let newTweet:Tweet = null;
  if (tweets[id].sender !== context.sender &&
      !retweetsMap.contains(context.sender)) {
    // Increase the retweet count.
    retweetsMap.set(context.sender, "");

    let tweet = new Tweet();
    tweet.text = tweets[id].text;
    tweet.img = tweets[id].img;
    tweet.created = created;
    tweet.author = author;
    tweet.avatar = avatar;

    // Add the retweet.
    newTweet = addTweet(tweet);
  }

  let tweetRetweet = new TweetRetweet();
  tweetRetweet.retweets = retweetsMap.count();
  tweetRetweet.hasRetweeted = retweetsMap.contains(context.sender);
  tweetRetweet.retweet = newTweet;

  return tweetRetweet;
}

// Returns an array of all tweets of an account.
// NOTE: This is a view method. Which means it should NOT modify the state.
export function getTweetsOfAccount(accountId: string): i32 {
  let numTweets = 0;
  for (let i = 0; i < tweets.length; i++) {
    if (tweets[i].sender === accountId) {
      numTweets++;
    }
  }

  return numTweets;

  // let result = new Array<Tweet>(numTweets);
  // for (let i = 0, j = -1; i < tweets.length; i++) {
  //   if (tweets[i].sender === accountId) {
  //     result[++j] = tweets[i];
  //
  //     // Get the "likes" count.
  //     let likesMap = collections.map<string, string>('likes:' + result[j].id.toString());
  //     result[j].hasLiked = likesMap.contains(accountId);
  //     result[j].likes = likesMap.count();
  //
  //     // Get the "retweets" count.
  //     let retweetsMap = collections.map<string, string>('retweets:' + result[j].id.toString());
  //     result[j].hasRetweeted = retweetsMap.contains(accountId);
  //     result[j].retweets = retweetsMap.count();
  //   }
  // }
  // return result;
}
