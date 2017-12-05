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

function roleCheck() {
	let user = firebase.auth().currentUser;

	return firestore.collection('admins').get().then(() => {
		console.log('Admin account verified');
		return true;
	}).catch((err) => { // The account is not in admin-list
		console.log('Not a admin account');
		return false;
	});

}

export {
	roleCheck,
	validAccountCheck
};
