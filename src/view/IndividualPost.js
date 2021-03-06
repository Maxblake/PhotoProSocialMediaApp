import React from "react";
import { Post } from "../components/post/Post";
import { db } from "../backend/Firebase";
import useAppUser from "../hooks/useAppUser";
import NavigationBar from "../components/NavigationBar";
import CircularProgress from "@material-ui/core/CircularProgress";

// Function to view individual posts
export function IndividualPost(props) {
  const { user } = props;
  const [post, setPost] = React.useState(null);
  const { bookmarks } = useAppUser();

  // Getting the post based on the post id from firebase
  React.useEffect(() => {
    db.collection("posts")
      .doc(props.match.params.postId)
      .onSnapshot((doc) =>
        setPost(
          Object.assign(
            {
              id: doc.id,
              bookmarked: bookmarks.includes(doc.id),
            },
            doc.data()
          )
        )
      );
  }, [props.match.params.postId, bookmarks]);

  // Rendering the single post
  return (
    <>
      <NavigationBar user={user} />
      <div className="Container">
        {post !== null ? (
          <Post key={post.id} {...post} />
        ) : (
          <CircularProgress />
        )}
      </div>
    </>
  );
}
