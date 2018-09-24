import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
/**
 * Check if the account used for login is valid
 * 
 * @returns {Promise} Boolean which indicates account is valid or not
 */
function validAccountCheck() {
	const user = firebase.auth().currentUser;

	return firebase.firestore().collection('users').doc(user.uid).set({
		'displayName': user.displayName,
		'email': user.email,
		'photoURL': user.photoURL
	}, {
		merge: true
	}).then(() => {
		return true;
	}).catch((err) => { // Not a while-listed domain
		console.error(err);
		return false;
	});
}

export {
	validAccountCheck
};
