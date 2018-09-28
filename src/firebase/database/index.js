import firebase from '../'
import 'firebase/firestore';

const db = firebase.firestore();

db.settings({
    timestampsInSnapshots: true
});

export default db;