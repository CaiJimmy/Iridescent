import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

function validAccountCheck() {
	let user = firebase.auth().currentUser;

	return firestore.collection('users').doc(user.uid).set({
		'displayName': user.displayName,
		'email': user.email,
		'photoURL': user.photoURL
	}, {
		merge: true
	}).then(() => {
		return true;
	}).catch((err) => { // Not a while-listed domain
		console.log(err);
		return false;
	});
}

export {
	validAccountCheck
};
