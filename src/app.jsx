import React from 'react';
import SidebarComponent from './sidebar/sidebar';
import EditorComponent from './editor/editor';
import './app.css';
import { db } from "./firebase_config";
import firebase from "firebase";

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      selectedNoteIndex: null,
      selectedNote: null,
      notes: null
    };
  }

  render() {
    return(
      <div className="app-container">
        <SidebarComponent 
          selectedNoteIndex={this.state.selectedNoteIndex}
          notes={this.state.notes}
          deleteNote={this.deleteNote}
          selectNote={this.selectNote}
          newNote={this.newNote}></SidebarComponent>
        {
          this.state.selectedNote ?
          <EditorComponent selectedNote={this.state.selectedNote}
          noteUpdate={this.noteUpdate}></EditorComponent> :
          null
        }
      </div>
    );
  }

  componentDidMount = () => { //fetch notes from firebase
    db
      .collection('notes')
      .onSnapshot(serverUpdate => {
        const notes = serverUpdate.docs.map(_doc => {
          const data = _doc.data();
          data['id'] = _doc.id;
          return data;
        });
        console.log('in loading', notes);
        console.log("setState to notes");
        this.setState({ notes: notes });
      });
  }
  //after first rendering or refresh the page, Quill not showing until you select one note

  selectNote = (note, index) => this.setState({ selectedNoteIndex: index, selectedNote: note });
  noteUpdate = (id, noteObj) => {
    db
      .collection('notes')
      .doc(id)
      .update({
        title: noteObj.title,
        body: noteObj.body,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
  }
  newNote = async (title) => {
    const note = {
      title: title,
      body: ''
    };
    console.log("start adding");
    const newFromDB = await db //firebase operation returns Promise, unlike this.setState
      .collection('notes')
      .add({
        title: note.title,
        body: note.body,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }); //return firebase doc which is newly added
    const newID = newFromDB.id;
    console.log("finish adding", newID, this.state.notes) 
    //this.state.notes already have inserted note by set by firebase async function
    //IMPORTANT,  the reason for above is because await NOT BLOCKING MAIN TRREAD EVEN IT LOOKS LIKE BLOCKING
    /* indented的部分是另一个aync func
    in console I saw
    App.js:72 start adding
      App.js:49 in loading (5) [{…}, {…}, {…}, {…}, {…}]
      App.js:50 setState to notes
    App.js:82 finish adding dHMoFhfc3TOrBUFSr93z
    say you remove await part, then will console show finish right after start, this.state.notes show the old list before, even if you keep async and put a long running counter in the middle
    */
    //await this.setState({ notes: [...this.state.notes, note] }); //teacher has this, but is it really needed?
    //you shouldn't havee await before this.setState anyeay, not returnimg Promis
    //not needed, even you want to avoid race condition fine, but the note object doesn't have id to be used later anyway
    //console.log('in add', this.state.notes); -- before this step, this.state.notes already include the just-inserted note
    /*
      a.z.m
      2 years ago
      I have a question in newNote why are you adding note to the notes state 
      isn't firebase updating the notes automatically?

      PortEXE
      2 years ago
      ​ @a.z.m  The difference here is that we want to be able to automatically select the new note for the user, 
      so that when they create a new note, it will open up for them without having to then select the new note. 
      We could put that functionality inside the onSnapshot, 
      but then we would need to check every time, and we would also need to make it async.
    */
    
    //IMPORTANT! you can leave the notes state to firebase snapshot reloading, but you still need to set selectedNote and selectedNoteIndex in order to be 
    //automatically select the newly created card and open the the Quill automaticallu
    const newNoteIndex = this.state.notes.indexOf(this.state.notes.filter(_note => _note.id === newID)[0]);
    this.setState({ selectedNote: this.state.notes[newNoteIndex], selectedNoteIndex: newNoteIndex });
  }
// teacher version:
//   deleteNote = async (note) => {
//     const noteIndex = this.state.notes.indexOf(note);
//     await this.setState({ notes: this.state.notes.filter(_note => _note !== note) });
//     if(this.state.selectedNoteIndex === noteIndex) {
//       this.setState({ selectedNoteIndex: null, selectedNote: null });
//     } else {  //如果删除的不是本来选中的，那就本来选中的仍然选中, but doesn't work
//       this.state.notes.length > 1 ? this.selectNote(this.state.notes[this.state.selectedNoteIndex - 1], this.state.selectedNoteIndex - 1) : this.setState({ selectedNoteIndex: null, selectedNote: null });
//     }

//     firebase
//       .firestore()
//       .collection('notes')
//       .doc(note.id)
//       .delete();
//   }
  
//  my simplified version (better):
  deleteNote = note => {
    const noteToBeDeletedIndex = this.state.notes.indexOf(note);
    if (noteToBeDeletedIndex === this.state.selectedNoteIndex) { //如果删除的是本来选中的，那就清空, 删除以后就什么也不选中，造成Quill hidden
      this.setState({ selectedNoteIndex: null, selectedNote: null });
    } else if (this.state.selectedNote) { //如果删除的不是本来选中的，那就本来选中的仍然选中, 但前提是要有选中
      const prevSelectedNoteId = this.state.selectedNote.id;
      const otherNotes = this.state.notes.filter(_note => _note !== note)
      this.setState({ selectedNoteIndex: otherNotes.indexOf(otherNotes.filter(_note => _note.id === prevSelectedNoteId)[0])});
    }
    //就算本来没有任何的note被选中，依然work
    db
      .collection('notes')
      .doc(note.id)
      .delete(); //利用firebase自己会update component local state
  }
}

export default App;
