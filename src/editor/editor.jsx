import React from 'react';
import ReactQuill from 'react-quill';
import EditorToolbar, { modules, formats } from "./editorToolbar";
import debounce from '../helpers';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import "react-quill/dist/quill.snow.css";

class EditorComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      text: '',
      title: '',
      id: ''
    };
  }

  componentDidMount = () => {
    this.setState({
      text: this.props.selectedNote.body,
      title: this.props.selectedNote.title,
      id: this.props.selectedNote.id
    });
  }

  componentDidUpdate = () => { //run twice, 第一次是选了不一样的note, 第二次triggered by that first setState, but not enter if block due to same id
    if(this.props.selectedNote.id !== this.state.id) {
      this.setState({
        text: this.props.selectedNote.body,
        title: this.props.selectedNote.title,
        id: this.props.selectedNote.id
      });
    }
  }

  render() {

    const { classes } = this.props;

    return(
      <div className={classes.editorContainer}>
        <BorderColorIcon className={classes.editIcon}></BorderColorIcon>
        <input
          className={classes.titleInput}
          placeholder='Note title...'
          value={this.state.title ? this.state.title : ''}
          onChange={(e) => this.updateTitle(e.target.value)}>
        </input>
      
        <EditorToolbar />
        <ReactQuill 
          theme="snow"
          value={this.state.text} 
          onChange={this.updateBody}
          modules={modules}
          formats={formats}
          placeholder={"Write something awesome..."} />
      </div>
    );
  }
  updateBody = async (val) => {//no need for async
    //await this.setState({ text: val }); //setState is async, not return promise
    this.setState({ text: val });
    this.update();
  };
  updateTitle = async (txt) => {//no need for async
    //await this.setState({ title: txt }); //setState is async, not return promise
    this.setState({ title: txt });
    this.update();
  }
  update = debounce(() => {
    this.props.noteUpdate(this.state.id, { //when the function runs, state.title and state.text already updated
      title: this.state.title,
      body: this.state.text
    })
  }, 1500);
}

export default withStyles(styles)(EditorComponent);