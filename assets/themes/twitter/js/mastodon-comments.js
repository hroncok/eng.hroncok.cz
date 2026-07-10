(function () {
  var container = document.getElementById("mastodon-comments");
  if (!container) return;

  var postUrl = container.getAttribute("data-post-url");
  if (!postUrl) return;

  var parts = postUrl.match(/^https?:\/\/([^/]+)\/@[^/]+\/(\d+)$/);
  if (!parts) return;

  var host = parts[1];
  var statusId = parts[2];
  var apiBase = "https://" + host + "/api/v1/statuses/" + statusId;

  function relativeTime(dateStr) {
    var seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + "m";
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h";
    var days = Math.floor(hours / 24);
    if (days < 30) return days + "d";
    var months = Math.floor(days / 30);
    if (months < 12) return months + "mo";
    return Math.floor(months / 12) + "y";
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderEmoji(text, emojis) {
    if (!emojis || !emojis.length) return escapeHtml(text);
    var result = escapeHtml(text);
    emojis.forEach(function (e) {
      var re = new RegExp(":" + e.shortcode + ":", "g");
      result = result.replace(
        re,
        '<img class="mastodon-emoji" src="' + e.url + '" alt=":' + e.shortcode + ':" title=":' + e.shortcode + ':">'
      );
    });
    return result;
  }

  function renderComment(reply) {
    var acct = reply.account.acct;
    if (acct.indexOf("@") === -1) acct = acct + "@" + host;

    return (
      '<div class="mastodon-comment">' +
        '<div class="mastodon-comment-header">' +
          '<a href="' + reply.account.url + '" target="_blank" rel="noopener">' +
            '<img class="mastodon-avatar" src="' + reply.account.avatar_static + '" alt="">' +
          '</a>' +
          '<div class="mastodon-comment-meta">' +
            '<a class="mastodon-author" href="' + reply.account.url + '" target="_blank" rel="noopener">' +
              renderEmoji(reply.account.display_name || reply.account.username, reply.account.emojis) +
            '</a>' +
            '<span class="mastodon-acct">@' + escapeHtml(acct) + '</span>' +
          '</div>' +
          '<a class="mastodon-time" href="' + reply.url + '" target="_blank" rel="noopener">' +
            relativeTime(reply.created_at) +
          '</a>' +
        '</div>' +
        '<div class="mastodon-comment-content">' + reply.content + '</div>' +
      '</div>'
    );
  }

  function buildTree(replies, parentId) {
    var html = "";
    replies.forEach(function (reply) {
      if (reply.in_reply_to_id !== parentId) return;
      html += renderComment(reply);
      var children = buildTree(replies, reply.id);
      if (children) {
        html += '<div class="mastodon-comment-replies">' + children + '</div>';
      }
    });
    return html;
  }

  function renderStats(status) {
    return (
      '<div class="mastodon-stats">' +
        '<a href="' + postUrl + '" target="_blank" rel="noopener">' +
          '<span class="mastodon-stat">' + status.replies_count + ' replies</span>' +
          '<span class="mastodon-stat">' + status.reblogs_count + ' boosts</span>' +
          '<span class="mastodon-stat">' + status.favourites_count + ' favourites</span>' +
          (status.quotes_count ? '<span class="mastodon-stat">' + status.quotes_count + ' quotes</span>' : '') +
        '</a>' +
      '</div>'
    );
  }

  Promise.all([
    fetch(apiBase).then(function (r) { return r.json(); }),
    fetch(apiBase + "/context").then(function (r) { return r.json(); }),
  ])
    .then(function (results) {
      var status = results[0];
      var context = results[1];

      var replies = (context.descendants || []).filter(function (r) {
        return r.visibility === "public" || r.visibility === "unlisted";
      });

      var html = '<h3>Mastodon responses</h3>';
      html += renderComment(status);
      html += renderStats(status);

      if (replies.length) {
        html += buildTree(replies, statusId);
      } else {
        html += '<p class="mastodon-no-comments">No comments yet.</p>';
      }

      html +=
        '<p class="mastodon-join">' +
          'Reply to <a href="' + postUrl + '" target="_blank" rel="noopener">this toot</a> to join the conversation.' +
        '</p>';

      container.innerHTML = html;
    })
    .catch(function () {
      container.innerHTML =
        '<p>Comments could not be loaded. ' +
          '<a href="' + postUrl + '" target="_blank" rel="noopener">Join the discussion on Mastodon.</a>' +
        '</p>';
    });
})();
