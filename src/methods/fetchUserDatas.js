import store from '@/store';
import db from '@/database';

/**
 * Fetch user's profile data from Firestore
 * 
 * @export
 * @param {string} userID 
 */
export default function (userID) {
	if(!(store.state.user.isAdmin || userID == store.state.user.uid)){   /// Don't fetch user data if current user is not admin
		return;
	}

	if (!store.state.users.hasOwnProperty(userID)) {

		let tempData = { /// Prevent fetch multiple time same user's data
			uid: userID,
			loading: true
		};
		store.commit('addUser', tempData);

		db.collection('users').doc(userID).get().then(snapshot => {
			let userData = snapshot.data();
			userData.uid = userID;
			userData.loading = false;
			store.commit('addUser', userData);
		})
	}
}
