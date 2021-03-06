import React from "react";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { db } from "../../backend/Firebase";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";

// the position of the modal
function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

// creating style for the modal 
const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 200,
    height: 100,
    backgroundColor: "#fafafa",
    border: "2px solid #DDDFE2",
    outline: "none !important",
    boxShadow: theme.shadows[5],
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
  },
}));

// deletes a post
export default function Delete(props) {
  
  // obtaining variables passed in from Post and searchFeedPost
  const { profile, userId, postId } = props;
  // used for the modal
  const [open, setOpen] = React.useState(false);
  const [modalStyle] = React.useState(getModalStyle);
  const classes = useStyles();

  // set Open to false to close the modal 
  const handleClose = () => {
    setOpen(false);
  };

  // when delete button is clicked, it opens the modal 
  const handleDelete = () => {
    setOpen(true);
  };

  // removes the post from firebase, and closes the modal 
  const removePost = () => {
    db.collection("posts").doc(postId).delete();
    setOpen(false);
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <div style={modalStyle} className={classes.paper}>
          <div className="deleteHeading">
            <p>Delete Post?</p>
          </div>
          <div className="deleteYesNo">
            <div className="YesNo">
              <button className="deletebutton" onClick={removePost}>
                Yes
              </button>
            </div>
            <div className="YesNo">
              <button className="deletebutton" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>
      {/*the delete button only appears on a post if it is the user's post*/}
      {profile === userId ? (
        <IconButton
          aria-label="delete"
          className="deleteButton"
          onClick={handleDelete}
        >
          <DeleteIcon />
        </IconButton>
      ) : undefined}
    </>
  );
}
