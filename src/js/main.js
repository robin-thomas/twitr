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
  const tweetLoading = $('#twitter-feed-loader');
  const updateTweet = $('#update-tweet');
  const searchTweets = $('#search-tweets');

  const twitrLogin = $('#twitr-login');

  // Show the tweet input window.
  tweetDiv.on('click', () => {
    // Reset.
    updateTweet.hide();
    tweetSubmit.show().attr('disabled', true);
    $('#edit-tweet-id').val('');
    tweetArea.val('').focus();
    tweetImgDelete.fadeOut();
    tweetImgShow.fadeOut().attr('src', '');
    $('.tweet-text-progress').circleProgress({
      startAngle: -1.5,
      size: 20,
      value: 0,
      fill: {
        color: '#1da1f2'
      },
      animation: false,
    });

    tweetInputDialog.modal('show');
  });

  // Disable options based on tweet input
  tweetArea.on('input', () => {
    const val = tweetArea.val();

    if (val === null || val === undefined ||
        val === 'What\'s happening?' ||
        val.length === 0) {
      tweetSubmit.attr('disabled', true);

      $('.tweet-text-progress').circleProgress('value', 0);
    } else {
      tweetSubmit.attr('disabled', false);

      $('.tweet-text-progress').circleProgress('value', val.length / 140);
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

    try {
      const text = tweetArea.val();
      const dataURI = tweetImgShow.attr('src');

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
  .then((tweets) => {
    tweetLoading.hide();
    TWEET.displayTweets(tweets);
    const scrollbar = new SimpleBar($('#twitr-feed-timeline')[0]);
    $('#tweet-scroll-up').fadeIn();

    // Set the scroll down event handler.
    const tweetScrollHandler = async function() {
      if (this.scrollTop + this.clientHeight + 25 >= this.scrollHeight) {
        console.log('scrolled to bottom');
        $(this).off('scroll');

        // Load the next set of tweets.
        const ele = $('#twitr-feed-timeline').find('.tweets-row').last();
        if (ele !== undefined && ele !== null) {
          const tweetId = parseInt(ele.attr('id').replace('tweet-display-id-', ''));

          try {
            if (tweetId > 0) {
              const tweets = await TWEET.downloadTweets(tweetId - 1);
              TWEET.displayTweets(tweets);
            }
          } catch (err) {
            console.log(err);
          }
        }

        // Turn ON the handler if there are more tweets to load.
        if ($('#twitr-feed-timeline').find('#tweet-display-id-0').length === 0) {
          $(this).on('scroll', tweetScrollHandler);
        }
      }
    };
    $(scrollbar.getScrollElement()).on('scroll', tweetScrollHandler);

  });

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

    tweetLoading.show();

    // Show the home header and tweet create option (if logged in).
    $('.twitr-feed-home').html('<span style="margin-left:10px;line-height:50px">Home</span>');
    if (NEAR.getAccount().trim().length !== 0) {
      tweetDiv.show();
    }

    switch (id.toUpperCase()) {
      case 'HOME-TWEETS':
        TWEET.downloadTweets().then((tweets) => {
          $('#twitr-feed-timeline').find('.simplebar-content').html('');
          tweetLoading.hide();
          TWEET.displayTweets(tweets);
          new SimpleBar($('#twitr-feed-timeline')[0]);
        });
        break;

      case 'OWN-TWEETS':
        TWEET.getTweetsOfAccount().then((tweets) => {
          $('#twitr-feed-timeline').find('.simplebar-content').html('');
          tweetLoading.hide();
          TWEET.displayTweets(tweets, false /* prepend */, true /* profile */);
          new SimpleBar($('#twitr-feed-timeline')[0]);
        });
        break;
    }
  });

  $('#twitr-feed-timeline').on('click', '.profile-link', function(e) {
    e.preventDefault();

    const accountId = $(this).html();

    // UI update.
    tweetDiv.hide();
    tweetLoading.show();
    $('#header-navbar .header-icon').removeClass('header-icon-active');

    // Construct the cover pic.
    $('.twitr-feed-home').html(`
      <div style="width:100%;height:175px;
        background:lightblue url(https://3.bp.blogspot.com/-FDsajzEttkc/UKjpUKE2lII/AAAAAAAABEI/Okewy8Xa3KA/s1600/Twitter-Header-Gradient-7.png) fixed;">
      </div>
      <img src="https://avatars.dicebear.com/v2/gridy/${accountId}.svg"
        style="width:60px;height:60px;position:absolute;top:70px;margin-left:15px;" />
      <div style="color:#fff;font-size:28px;position:absolute;margin-left:15px;top:135px;color:white">${accountId}</div>
    `);

    TWEET.getTweetsOfAccount(accountId).then((tweets) => {
      $('#twitr-feed-timeline').find('.simplebar-content').html('');
      tweetLoading.hide();
      TWEET.displayTweets(tweets);
      new SimpleBar($('#twitr-feed-timeline')[0]);
    });
  });

  $('#twitr-feed-timeline').on('click', '.tweet-hashtag', function(e) {
    e.preventDefault();
  });

  $('#twitr-feed-timeline').on('click', '.tweet-delete', async function(e) {
    try {
      // Get the tweet.
      const parent = $(e.currentTarget).parent().parent().parent().parent().parent();
      const json = decodeURIComponent(parent.find('.tweet-encoded').val());
      const tweet = JSON.parse(json);

      if (confirm('Are you sure you want to delete this tweet?')) {
        await TWEET.deleteTweet(tweet.id);

        // TODO: remove it from UI.
        parent.remove();
      }
    } catch (err) {
      console.log(err);
    }
  });

  $('#twitr-feed-timeline').on('click', '.tweet-edit', function(e) {
    try {
      // Get the tweet.
      const parent = $(e.currentTarget).parent().parent().parent().parent().parent();
      const json = decodeURIComponent(parent.find('.tweet-encoded').val());
      let tweet = JSON.parse(json);

      // Load the tweet.
      $('#edit-tweet-id').val(tweet.id.toString());
      updateTweet.show();
      tweetSubmit.hide();
      tweetArea.val(tweet.text);
      if (tweet.img !== undefined && tweet.img !== null && tweet.img !== '') {
        tweetImgShow.attr('src', tweet.img);
        tweetImgShow.fadeIn();
        tweetImgDelete.fadeIn();
      }

      $('.tweet-text-progress').circleProgress({
        startAngle: -1.5,
        size: 20,
        value: tweet.text.length / 140,
        fill: {
          color: '#1da1f2'
        },
        animation: false,
      });

      tweetInputDialog.modal('show');

    } catch (err) {
      console.log(err);
    }
  });

  updateTweet.on('click', async () => {
    const btn = updateTweet;

    const loadingText = '<i class="fas fa-spinner fa-spin"></i>';
    btn.data('original-text', btn.html());
    btn.html(loadingText);

    tweetTextareaDisable.show();

    const text = tweetArea.val();
    const dataURI = tweetImgShow.attr('src');

    try {
      const tweetId = parseInt($('#edit-tweet-id').val());
      const result = await TWEET.updateTweet(tweetId, text, dataURI);

      if (result === null) {
        throw new Error('Unable to update the tweet!');
      }

      console.log(result);

      const tweetPos = $(`#twitr-feed-timeline #tweet-display-id-${tweetId}`);

      // update the tweet in UI.
      const tweetEncoded = encodeURIComponent(JSON.stringify(result));
      tweetPos.find('.tweet-encoded').val(tweetEncoded);

      const decodedText = TWEET.tweetDecode(result.text);
      tweetPos.find('.tweet-parsed-text').html(decodedText);

      const created = TWEET.tweetTime(result.created);
      tweetPos.find('.tweet-created-time').html(`&nbsp;&nbsp;&#8226;&nbsp;&nbsp;${created}`);

      tweetInputDialog.modal('hide');
    } catch (err) {
      console.log(err);
      alert(err.message);
    }

    tweetTextareaDisable.hide();
    btn.html(btn.data('original-text'));
  });

  $('#tweet-scroll-up').on('click', () => {
    $('#twitr-feed-timeline .tweets-row').first()[0].scrollIntoView({ behavior: 'smooth' });
  });

  $('#emoji-select-click').on('click', () => {
    $('#emoji-select').toggle();
  });

  $('#emoji-select .emoji').on('click', function() {
    const max = tweetArea.attr('maxlength');

    let html = tweetArea.val();
    if ((html.length + 1) < max) {
      html += $(this).attr('alt');
      tweetArea.val(html);
      $('.tweet-text-progress').circleProgress('value', tweetArea.val().length / 140);
    }
  });

  tweetInputDialog.on('hide.bs.modal', (e) => {
    const html = tweetArea.val();

    // verify its not edit tweet operation.
    try {
      const tweetId = parseInt($('#edit-tweet-id').val());
      if (!isNaN(tweetId) && tweetId >= 0) {
        return;
      }
    } catch (err) {
    }

    if (html.length > 0) {
      if (!confirm('Discard draft?')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    }
  });

  searchTweets.on('input', function (e) {
    if ($(this).val().trim().length === 0) {
      tweetLoading.show();

      TWEET.downloadTweets().then((tweets) => {
        $('#twitr-feed-timeline').find('.simplebar-content').html('');
        tweetLoading.hide();
        TWEET.displayTweets(tweets);
        new SimpleBar($('#twitr-feed-timeline')[0]);

        $('#header-navbar .header-icon').removeClass('header-icon-active');
        $('#home-tweets').addClass('header-icon-active');
      });
    }
  });

  searchTweets.on('keyup', function (e) {
    if (e.keyCode === 13) {
      const keyword = $(this).val().trim();

      tweetLoading.show();
      TWEET.searchTweets(keyword).then((tweets) => {
        $('#twitr-feed-timeline').find('.simplebar-content').html('');
        tweetLoading.hide();
        TWEET.displayTweets(tweets);
        new SimpleBar($('#twitr-feed-timeline')[0]);
      });
    }
  });

});
