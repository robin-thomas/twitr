const TWEET = require('./tweet.js');
const NEAR = require('./near.js');

$(document).ready(() => {

  const tweetInputDialog = $('#tweet-input-dialog');
  const tweetBtn = $('.twitr-feed-tweet-text');
  const tweetArea = $('#tweet-dialog-textarea');
  const tweetSubmit = $('#confirm-tweet');
  const tweetAddPic = $('#tweet-img-fake');
  const tweetAddPicReal = $('#tweet-img');
  const tweetImgShow = $('#tweet-img-show');
  const tweetImgDelete = $('#tweet-img-delete');
  const confirmTweet = $('#confirm-tweet');
  const tweetTextareaDisable = $('#tweet-textarea-disable');

  const twitrLogin = $('#twitr-login');

  // Show the tweet input window.
  tweetBtn.on('click', () => {
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
    } catch (err) {
      alert(err.message);
    }

    tweetTextareaDisable.hide();
    btn.html(btn.data('original-text'));
  });

  TWEET.downloadTweets().then(TWEET.displayTweets);
  NEAR.init().then(console.log);

  // Login/logout.
  twitrLogin.on('click', () => {
    if (twitrLogin.hasClass('twitr-login')) {
      NEAR.login();
    } else {
      NEAR.logout();
    }
  });

  $('#twitr-feed-timeline').on('click', '.tweet-action-like', () => {
    const account = NEAR.getAccount();
    if (account.trim().length === 0) {
      NEAR.login();
    } else {
      // update tweet.
    }
  })

});
