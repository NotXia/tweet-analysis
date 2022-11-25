import nock from "nock";

function generateParams(query, pagination_token="", quantity=10, start_time = '', end_time = '') {
    let params = {
        query: `${query} -is:reply -is:retweet`,                            // Filtra per parola chiave e rimuove i retweet e le risposte
        "max_results": quantity,                                            // Numero massimo Tweet per pagina
        "tweet.fields": "created_at,geo,text,public_metrics,attachments",   // Campi del Tweet
        "expansions": "geo.place_id,author_id,attachments.media_keys",      // Espansioni del campo Tweet
        "place.fields": "country,full_name,geo",                            // Campi della località
        "media.fields": "url,variants",                                     // Campi degli allegati
        "user.fields": "name,profile_image_url,username"                    // Campi dell'utente

    };
    if (pagination_token != "") {
        params["pagination_token"] = pagination_token;
    }
    if (start_time != "") {
        params["start_time"] = start_time;
    }
    if (end_time != "") {
        params["end_time"] = end_time;
    }
    
    return params;
}

function generateTweets(quantity, isLast=false) {
    let out = {
        "data": [ ],
        "includes": {
          "users": [ ],
          "media": [ ],
          "places": [ ]
        },
        "meta": {
          "newest_id": "0000000000000000000",
          "oldest_id": "0000000000000000000",
          "result_count": quantity,
          "next_token": isLast ? "" : _generateNextToken()
        }
    }

    for (let i = 0; i < quantity; i++) {
        const tweet = _generateTweet();
        out.data.push(tweet.tweet);
        out.includes.users.push(tweet.user);
        out.includes.media = out.includes.media.concat(tweet.media);
        out.includes.places.push(tweet.places);
    }

    return out;
}

function _generateTweet() {
    let tweetId = _generateTweetId();
    let authorId = _generateTweetId();
    let mediaId = _generateMediaId();
    let placeId = _generatePlaceId();
    return {
        tweet: {
            "id": tweetId,
            "attachments": {
              "media_keys": [ mediaId ]
            },
            "author_id": authorId,
            "created_at": "2022-10-30T22:52:52.000Z",
            "edit_history_tweet_ids": [ tweetId ],
            "geo": {
              "place_id": placeId
            },
            "public_metrics": {
              "retweet_count": _generateNumber(1, 100),
              "reply_count": _generateNumber(1, 200),
              "like_count": _generateNumber(1, 500),
              "quote_count": _generateNumber(1, 50)
            },
            "text": "#uniboswe2122 https://t.co/LS655lKPU3"
        },
        user: {
            "username": "SWETeam12",
            "id": authorId,
            "profile_image_url": "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
            "name": "SWE Team 12"
        },
        media: [
            {
                "media_key": mediaId,
                "type": "photo",
                "url": "https://pbs.twimg.com/media/FgWiyoiXgAcrMkY.png"
            }
        ],
        places: {
            "country": "Francia",
            "full_name": "Parigi, Francia",
            "geo": {
                "type": "Feature",
                "bbox": [
                2.2241006,
                48.8155214,
                2.4699053,
                48.9021461
                ],
                "properties": {}
            },
            "id": placeId
        }
    }
}

function _generateTweetId() {
    let id;
    let date = Date.now();
    
    // Restituisce un numero a caso tra 0 e 999999:
    let randNum = Math.floor(Math.random() * 1000000);

    randNum = String(randNum).padStart(6, '0');

    id = date + randNum;

    return id;
}

function _generateMediaId() {
    let id = _generateTweetId();

    return "3_" + id;
}

function _generateString(length) {
    var result           = '';
    var chars       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charsLen = chars.length;
    for ( var i = 0; i < length; i++ ) {
        result += chars.charAt(Math.floor(Math.random() * charsLen));
    }
    return result;
}

function _generatePlaceId() {
    return _generateString(16);
}

function _generateNextToken() {
    return _generateString(45);
}

function _generateNumber(from, to) {
    return Math.floor(Math.random() * to) + from;
}

function nockTwitterUsersByUsername(username, exists=true) {
    if(exists) {
        return nock("https://api.twitter.com") 
                .get(`/2/users/by/username/${username}`).query({'user.fields': 'name,username,profile_image_url'})
                .reply(200, {
                    "data": {
                        username: username,
                        profile_image_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
                        name: _generateString(10),
                        id: _generateTweetId()
                    }
                });
    } else {
        return nock("https://api.twitter.com") 
                .get(`/2/users/by/username/${username}`).query({'user.fields': 'name,username,profile_image_url'})
                .reply(200, {
                    "errors": [
                      {
                        "value": username,
                        "detail": `Could not find user with username: [${username}].`,
                        "title": "Not Found Error",
                        "resource_type": "user",
                        "parameter": "username",
                        "resource_id": username,
                        "type": "https://api.twitter.com/2/problems/resource-not-found"
                      }
                    ]
                })
    }
}

module.exports = {
    generateParams: generateParams,
    generateTweets: generateTweets,
    nockTwitterUsersByUsername: nockTwitterUsersByUsername
}