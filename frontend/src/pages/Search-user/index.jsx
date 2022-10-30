import React from "react";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar"
// import { Link } from "react-router-dom";
import { userSearchTweet } from "../../modules/fetch-tweets/search_user.js"
import Tweet from "../../components/Tweet"

class SearchUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tweets: [],
            page: ""
        };

        this.input = {
            username: React.createRef()
        }
    }

    render() {
        return (<>
            <Helmet>
                <title>Ricerca utente</title>
            </Helmet>
            
            <Navbar />

            <form className="row align-items-start p-4" onSubmit={(e) => { this.fetchUserTweets(e) }}>
                <div className="col-4">
                    <div className="input-group flex-nowrap">
                        <span className="input-group-text bg-white" id="addon-wrapping">@</span>
                        <input ref={this.input.username} className="form-control" type="text" placeholder="Inserisci un nome utente" aria-label="Username" />
                        <input className="input-group-text bg-white" type="submit"/>
                    </div>
                </div>
            </form>

            <div className="list-group col-4 ms-4 my-2">
                {
                    this.state.tweets.map((tweet) => (
                        <Tweet key={tweet.id} tweet={tweet} />
                    ))
                }
            </div>

            
        </>);
    }

    async fetchUserTweets(e) {
        e.preventDefault()
        console.log(this.input.username.current.value)
        const tweets_data = await userSearchTweet(this.input.username.current.value)

        // const tweets_data = {"tweets":[{"id":"1586697368342257664","name":"WWE","username":"WWE","pfp":"https://pbs.twimg.com/profile_images/1383079031805972485/3sWoMX-R_normal.jpg","text":"Bray Wyatt’s address gets cut short by a mysterious and frightening figure.\n\n#SmackDown https://t.co/X5CXA0K373","time":"2022-10-30T12:31:46.000Z","likes":214,"comments":10,"retweets":35,"media":["https://video.twimg.com/amplify_video/1586697136812560389/vid/480x270/drR0lm9y5HcyhfkC.mp4?tag=14"]},{"id":"1586682261256159232","name":"WWE","username":"WWE","pfp":"https://pbs.twimg.com/profile_images/1383079031805972485/3sWoMX-R_normal.jpg","text":".@realKILLERkross takes on @MadcapMoss looking to deliver a message to @DMcIntyreWWE ahead of #WWECrownJewel. \n\n@Lady_Scarlett13 #SmackDown https://t.co/G6JmJldau9","time":"2022-10-30T11:31:44.000Z","likes":225,"comments":15,"retweets":29,"media":["https://video.twimg.com/amplify_video/1586682036252729344/vid/1280x720/sW2o9sfVF0tvB6DO.mp4?tag=14"]},{"id":"1586667092727808002","name":"WWE","username":"WWE","pfp":"https://pbs.twimg.com/profile_images/1383079031805972485/3sWoMX-R_normal.jpg","text":".@HeymanHustle cautions @WWERomanReigns to not underestimate @LoganPaul at #WWECrownJewel.\n\n#SmackDown https://t.co/kcbGjZvtvT","time":"2022-10-30T10:31:28.000Z","likes":557,"comments":27,"retweets":72,"media":["https://video.twimg.com/amplify_video/1586666937471434752/vid/480x270/Zy_ZqcI44ImZZNZz.mp4?tag=14"]},{"id":"1586652059532681218","name":"WWE","username":"WWE","pfp":"https://pbs.twimg.com/profile_images/1383079031805972485/3sWoMX-R_normal.jpg","text":"#HitRow enlists @ShinsukeN as their partner in battle against #LegadodelFantasma. \n\n#SmackDown https://t.co/IxgRjB9aBn","time":"2022-10-30T09:31:44.000Z","likes":440,"comments":19,"retweets":54,"media":["https://video.twimg.com/amplify_video/1586651837737967616/vid/1280x720/7iTkc8iBVNTj9hMW.mp4?tag=14"]},{"id":"1586636924357419008","name":"WWE","username":"WWE","pfp":"https://pbs.twimg.com/profile_images/1383079031805972485/3sWoMX-R_normal.jpg","text":"Two heated backstage altercations rock the #SmackDown Women’s Division. https://t.co/c2uAKUNOTI","time":"2022-10-30T08:31:35.000Z","likes":433,"comments":15,"retweets":58,"media":["https://video.twimg.com/amplify_video/1586636736440029184/vid/640x360/b1QBcfA76SUFWrdK.mp4?tag=14"]},{"id":"1586621861537923072","name":"WWE","username":"WWE","pfp":"https://pbs.twimg.com/profile_images/1383079031805972485/3sWoMX-R_normal.jpg","text":"Emma returns to answer @RondaRousey's Open Challenge for the #SmackDown Women's Championship. https://t.co/1LlSmMU2w2","time":"2022-10-30T07:31:44.000Z","likes":595,"comments":10,"retweets":81,"media":["https://video.twimg.com/amplify_video/1586621639436951552/vid/1280x720/Jf2n771HRS4HfSjj.mp4?tag=14"]},{"id":"1586606650236059648","name":"WWE","username":"WWE","pfp":"https://pbs.twimg.com/profile_images/1383079031805972485/3sWoMX-R_normal.jpg","text":"Braun Strowman delivers a warning to @TheGiantOmos ahead of #WWECrownJewel.\n\n#SmackDown https://t.co/tRKp8mETHC","time":"2022-10-30T06:31:17.000Z","likes":520,"comments":15,"retweets":82,"media":["https://video.twimg.com/amplify_video/1586606539225370625/vid/480x270/PiE0mvNKBbbj9n55.mp4?tag=14"]},{"id":"1586591670954594305","name":"WWE","username":"WWE","pfp":"https://pbs.twimg.com/profile_images/1383079031805972485/3sWoMX-R_normal.jpg","text":"The #NewDay battles it out with Maximum Male Models on #SmackDown. https://t.co/ZGA1aU3Vmt","time":"2022-10-30T05:31:46.000Z","likes":463,"comments":9,"retweets":66,"media":["https://video.twimg.com/amplify_video/1586591441861623809/vid/480x270/MN1c58hsvrz1tJHm.mp4?tag=14"]},{"id":"1586576575599878147","name":"WWE","username":"WWE","pfp":"https://pbs.twimg.com/profile_images/1383079031805972485/3sWoMX-R_normal.jpg","text":".@WWERomanReigns looks to resolve some conflict within #TheBloodline. \n\n@WWEUsos @SamiZayn @WWESoloSikoa @HeymanHustle #SmackDown https://t.co/pZ8MKxgzbt","time":"2022-10-30T04:31:47.000Z","likes":3231,"comments":99,"retweets":467,"media":["https://video.twimg.com/amplify_video/1586576340123361288/vid/480x270/ydjHioheEyJlQ4ut.mp4?tag=14"]},{"id":"1586561475212107780","name":"WWE","username":"WWE","pfp":"https://pbs.twimg.com/profile_images/1383079031805972485/3sWoMX-R_normal.jpg","text":"The #BrawlingBrutes look for some payback as they go up against @SamiZayn &amp; @WWESoloSikoa.\n\n#SmackDown https://t.co/MmXvU4O0Bl","time":"2022-10-30T03:31:47.000Z","likes":617,"comments":12,"retweets":80,"media":["https://video.twimg.com/amplify_video/1586561240125644801/vid/1280x720/IE_coO79NVnU61eV.mp4?tag=14"]}],"next_token":"7140dibdnow9c7btw423x55fxsaj2wn46dmgbsecpdycw"}

        this.setState({ 
            tweets: tweets_data.tweets,
            page: tweets_data.token
        })
        console.log(tweets_data)
    }
}

export default SearchUser;