import "allocator/arena";
export { memory };

import { context, storage, near, collections } from "./near";

import { Tweet } from "./model.near";

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
export function addTweet(text: string, author: string, created: string, avatar: string, img: string): void {
  // Create a new instance of Tweet object
  let tweet = new Tweet();
  tweet.id = tweets.length;
  tweet.sender = context.sender;
  tweet.text = text;
  tweet.author = author;
  tweet.created = created;
  tweet.avatar = avatar;
  tweet.img = img;

  tweets.push(tweet);
}

// Returns an array of N messages from a given position (defaults to end).
// NOTE: This is a view method. Which means it should NOT modify the state.
export function getTweets(end:i32 = -1): Array<Tweet> {
  let numTweets = min(TWEET_LIMIT, tweets.length);

  let startIndex = (end === -1 ? tweets.length : end) - numTweets;

  let result = new Array<Tweet>(numTweets);
  for (let i = 0; i < numTweets; i++) {
    result[i] = tweets[i + startIndex];

    let likesMap = collections.map<string, string>('likes:' + result[i].id.toString());
    result[i].likes = likesMap.count();
  }
  return result;
}

// Update the "likes" count of a tweet.
// NOTE: This is a change method. Which means it will modify the state.
// But right now we don't distinguish them with annotations yet.
export function toggleLike(id: i32): void {
  let likesMap = collections.map<string, string>('likes:' + id.toString());

  if (likesMap.contains(context.sender)) {
    // Like already exists. Remove it.
    likesMap.delete(context.sender);
  } else {
    // Add a like.
    likesMap.set(context.sender, "");
  }
}
