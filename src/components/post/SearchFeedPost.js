import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import CardHeader from "../CardHeader";
import { db } from "../../backend/Firebase";
import "./Post.css";
import useAppUser from "../../hooks/useAppUser";
import Likes from "./Likes";
import Download from "./Download";
import Purchase from "./Purchase";
import Bookmark from "./Bookmark";
import Comments from "./Comments";
import TagChips from "./TagChips";
import Delete from "./Delete";
import { calculateDate } from "./Post";

// Style for the Search Feed Post
const useStyles = makeStyles((theme) => ({
  // --------------
  root: {
    marginLeft: 30,
    marginTop: 20,
    width: "90%",
    marginBottom: 20,
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
  downloadButton: {
    margin: theme.spacing(1),
    marginLeft: 20,
  },
}));

// Function for the Post component in the Search Feed
export function Post(props) {
  const { id: userId } = useAppUser() || {};
  const {
    id: postId,
    bookmarked,
    imageURL: imageURLProp,
    imageURLWatermarked,
    profile,
    postDescription,
    imageTitle,
    tags,
    numberOfLikes,
    price,
    priceCurrency,
    timeStamp,
  } = props;
  const classes = useStyles();

  const [imageURL, setImageURL] = React.useState("");
  const [purchased, setPurchased] = React.useState([]);
  const [hasPurchased, setHasPurchased] = React.useState(false);

  // Getting from Firebase all the users that liked the post
  React.useEffect(() => {
    let unsubscribePurchased;
    if (postId) {
      unsubscribePurchased = db
        .collection("posts")
        .doc(postId)
        .collection("purchased")
        .onSnapshot((snapshot) => {
          setPurchased(snapshot.docs.map(({ id }) => id));
        });
    }
    return () => {
      unsubscribePurchased();
    };
  }, [postId]);

  // Checking if the current user have purchased the image of the post or not
  React.useEffect(() => {
    var docRef = db // quering
      .collection("posts")
      .doc(postId)
      .collection("purchased")
      .doc(userId); // checking if a certain user ID has a post purchased
    docRef.get().then(function (doc) {
      if (doc.exists) {
        // if they have bought the image
        setHasPurchased(true);
      } else if (profile === userId) {
        db.collection("posts")
          .doc(postId)
          .collection("purchased")
          .doc(userId)
          .set({});
        setHasPurchased(true);
      } else {
        setHasPurchased(false);
      }
    });
  }, [purchased, hasPurchased, postId, userId, profile]);

  // Determining and rendering the watermarked and unwatermarked images
  React.useEffect(() => {
    var docRef = db
      .collection("posts")
      .doc(postId)
      .collection("purchased")
      .doc(userId);

    docRef.get().then(function (doc) {
      if (doc.exists) {
        // then this person has bought this image, so show the original
        setImageURL(imageURLProp);
      } else {
        // they didn't buy it, so show watermarked version
        // set the watermarked image to be a constructed get request
        if (typeof imageURLWatermarked !== "undefined") {
          // then the image has a watermarked version stored in the database
          setImageURL(imageURLWatermarked);
        } else {
          // there is no version, so generate it
          var parsedURL = encodeURI(imageURLProp);
          var watermarkedAPIURLRequest =
            "https://textoverimage.moesif.com/image?image_url=" +
            parsedURL +
            "&text=SAMPLE&text_color=000000ff&text_size=64&x_align=center&y_align=middle";
          setImageURL(watermarkedAPIURLRequest);
        }
      }
    });
  }, [purchased, postId, userId, imageURLProp, imageURLWatermarked]);

  // Rendering the post
  return (
    <Card className={classes.root}>
      {/* Rendering the header and image */}
      <CardHeader
        title={profile}
        subheader={postDescription}
        postId={postId}
        timeStamp={calculateDate(timeStamp.toDate())}
      />
      <CardMedia
        className={classes.media}
        image={imageURL}
        title={imageTitle}
      />
      {/* Rendering all the elements of the posts */}
      <CardActions disableSpacing>
        <div className="div1">
          <div className="div4">
            <Likes tags={tags} id={postId} numberOfLikes={numberOfLikes} />
            <Typography paragraph style={{ marginTop: 17.5, marginLeft: 20 }}>
              {price}
              {priceCurrency}
            </Typography>

            {hasPurchased === true ? (
              <Download
                hasPurchased={hasPurchased}
                imageURL={imageURL}
                data="searchFeedPost"
              />
            ) : (
              <Purchase
                tags={tags}
                id={postId}
                setHasPurchased={setHasPurchased}
              />
            )}
          </div>
          <div className="div3">
            <Bookmark tags={tags} id={postId} bookmarked={bookmarked} />
            <Delete profile={profile} userId={userId} postId={postId} />
          </div>
        </div>
      </CardActions>
      {/* Rendering all of the tags in the posts and the comments */}
      <TagChips tags={tags} />
      <Comments id={postId} profile={profile} data="searchFeedPost" />
    </Card>
  );
}
