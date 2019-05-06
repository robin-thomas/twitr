const TWEET = require('./tweet.js');
const NEAR = require('./near.js');

$(document).ready(() => {

  const tweetInputDialog = $('#tweet-input-dialog');
  const tweetDiv = $('.twitr-feed-tweet');
  const tweetArea = $('#tweet-dialog-textarea');
  const tweetSubmit = $('#confirm-tweet');
  const tweetAddPic = $('#tweet-img-fake');
  const tweetAddPicReal = $('#tweet-img');
  const tweetImgShow = $('#tweet-img-show');
  const tweetImgDelete = $('#tweet-img-delete');
  const confirmTweet = $('#confirm-tweet');
  const tweetTextareaDisable = $('#tweet-textarea-disable');

  const userIcons = $('#header-navbar .user-icon');

  const twitrLogin = $('#twitr-login');

  // Show the tweet input window.
  tweetDiv.on('click', () => {
    tweetInputDialog.modal('show');
  });

  // Disable options based on tweet input
  tweetArea.on('input', () => {
    const val = tweetArea.val();

    if (val === null || val === undefined || val === 'What\'s happening?' ||
        val.length === 0) {
      tweetSubmit.attr('disabled', true);

      $('.tweet-text-progress').circleProgress('value', 0);

    } else {
      tweetSubmit.attr('disabled', false);

      const length = val.length;
      if (length === 1) {
        $('.tweet-text-progress').circleProgress({
          startAngle: -1.5,
          size: 20,
          value: length / 140,
          fill: {
            color: '#1da1f2'
          },
          animation: false,
        });
      } else {
        $('.tweet-text-progress').circleProgress('value', length / 140);
      }
    }
  });

  tweetAddPic.on('click', () => tweetAddPicReal.click());
  tweetAddPicReal.on('change', function(e) {
    const file = e.target.files[0];
    console.log(file);

    if (file.size > (1024 * 1024)) {
      $(this).val('');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(){
      const dataURL = reader.result;
      tweetImgShow.attr('src', dataURL);
      tweetImgShow.fadeIn();
      tweetImgDelete.fadeIn();
    };
    reader.readAsDataURL(file);

    $(this).val('');
  });

  tweetImgDelete.on('click', () => {
    tweetImgDelete.fadeOut();
    tweetImgShow.fadeOut();
    tweetImgShow.attr('src', '');
  });

  confirmTweet.on('click', async () => {
    const btn = confirmTweet;

    const loadingText = '<i class="fas fa-spinner fa-spin"></i>';
    btn.data('original-text', btn.html());
    btn.html(loadingText);

    tweetTextareaDisable.show();

    const text = tweetArea.val();
    const dataURI = tweetImgShow.attr('src');

    try {
      await TWEET.createTweet(text, dataURI);

      tweetInputDialog.modal('hide');
    } catch (err) {
      console.log(err);
      alert(err.message);
    }

    tweetTextareaDisable.hide();
    btn.html(btn.data('original-text'));
  });

  NEAR.init().then((loggedIn) => {
    // if logged in.
    if (loggedIn === true) {
      tweetDiv.show();
      userIcons.show();

      const avatar = `https://avatars.dicebear.com/v2/gridy/${NEAR.getAccount()}.svg`;
      $('.user-feed-icon').html(`<img src="${avatar}" style="width:30px;height:30px;margin:auto" />`);
    } else {
      tweetDiv.hide();
      userIcons.hide();
      $('.user-feed-icon').html('');
    }
  })
  .then(TWEET.downloadTweets)
  .then(TWEET.displayTweets);

  // Login/logout.
  twitrLogin.on('click', () => {
    if (twitrLogin.hasClass('twitr-login')) {
      NEAR.login();
    } else {
      NEAR.logout();
    }
  });

  $('#twitr-feed-timeline').on('click', '.tweet-action-like', async (e) => {
    const account = NEAR.getAccount();
    if (account.trim().length === 0) {
      NEAR.login();
    } else {
      // update tweet.
      try {
        const parent = $(e.currentTarget).parent().parent().parent().parent().parent();
        const json = decodeURIComponent(parent.find('.tweet-encoded').val());
        let tweet = JSON.parse(json);

        const hasLiked = tweet.hasLiked;

        $(e.currentTarget).next().html('&nbsp;&nbsp;<i class="fas fa-spinner fa-spin"></i>');
        const tweetLike = await TWEET.toggleLike(tweet.id);

        // Check if state has changed.
        if (tweetLike.hasLiked !== hasLiked) {
          tweet.hasLiked = tweetLike.hasLiked;
          tweet.likes = tweetLike.likes;

          const encodedTweet = encodeURIComponent(JSON.stringify(tweet));
          parent.find('.tweet-encoded').val(encodedTweet);
        }

        // Update the "like" UI.
        if (tweetLike.hasLiked) {
          $(e.currentTarget).addClass('tweet-action-liked');
          $(e.currentTarget).next().addClass('tweet-action-liked').html(`&nbsp;&nbsp;${tweetLike.likes}`);
        } else {
          $(e.currentTarget).removeClass('tweet-action-liked');
          $(e.currentTarget).next().removeClass('tweet-action-liked').html(`&nbsp;&nbsp;${tweetLike.likes}`);
        }
      } catch (err) {
        console.log(err);
      }
    }
  });

  $('#twitr-feed-timeline').on('click', '.tweet-action-retweet', async (e) => {
    const account = NEAR.getAccount();
    if (account.trim().length === 0) {
      NEAR.login();
    } else {
      // update tweet.
      try {
        const parent = $(e.currentTarget).parent().parent().parent().parent().parent();
        const json = decodeURIComponent(parent.find('.tweet-encoded').val());
        let tweet = JSON.parse(json);

        console.log(tweet);

        if (tweet.author === NEAR.getAccount()) {
          alert('You cannot retweet your own tweet!');
          return;
        }

        if (tweet.hasRetweeted) {
          alert('You have already retweeted this tweet!');
          return;
        }

        $(e.currentTarget).next().html('&nbsp;&nbsp;<i class="fas fa-spinner fa-spin"></i>');
        const retweet = await TWEET.retweet(tweet.id);

        // Update the JSON if retweeted.
        if (retweet.hasRetweeted) {
          tweet.hasRetweeted = retweet.hasRetweeted;
          tweet.retweets = retweet.retweets;

          const encodedTweet = encodeURIComponent(JSON.stringify(tweet));
          parent.find('.tweet-encoded').val(encodedTweet);
        }

        // Update the "retweet" UI.
        $(e.currentTarget).addClass('tweet-action-retweeted');
        $(e.currentTarget).next().addClass('tweet-action-retweeted').html(`&nbsp;&nbsp;${retweet.retweets}`);

        // Display the retweet.
        if (retweet.retweet !== null) {
          TWEET.displayTweets([retweet.retweet]);
        }
      } catch (err) {
        console.log(err);
      }
    }
  });

  $('#header-navbar .header-icon').on('click', function() {
    const id = $(this).attr('id');

    $('#header-navbar .header-icon').removeClass('header-icon-active');
    $(this).addClass('header-icon-active');

    $('#twitr-feed-timeline').html(`<div style="text-align:center;padding:15px 0">
      <i class="fas fa-circle-notch fa-spin" style="color:white;font-size:28px;color:#1da1f2"></i>
    </div>`);

    switch (id.toUpperCase()) {
      case 'HOME-TWEETS':
        TWEET.downloadTweets().then(TWEET.displayTweets);
        break;

      case 'OWN-TWEETS':
        TWEET.getTweetsOfAccount().then(TWEET.displayTweets);
        break;
    }
  });

});
