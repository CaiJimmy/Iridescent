'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.questionChange = functions.firestore.document('questions/{questionID}').onWrite(
	(change) => {

		const oldQuestion = change.before.data(),
			newQuestion = change.after.data();

		let oldTopic,
			oldTopicRef,
			newTopic,
			newTopicRef;

		/* Load variables */
		if (change.before.exists) {
			oldTopic = oldQuestion.topic;
			oldTopicRef = db.collection('topics').doc(oldTopic);
		};
		if (change.after.exists) {
			newTopic = newQuestion.topic;
			newTopicRef = db.collection('topics').doc(newTopic);
		}


		if (!change.before.exists) {
			// New document Created : plus one to count.total

			return newTopicRef.get().then(snap => {
				return newTopicRef.set({
					count: {
						total: snap.data().count.total + 1
					}
				}, {
					merge: true
				});
			});

		};
		
		if (!change.after.exists) {
			// Deleting question : subtract one from count.total and count.hidden if the question was hidden

			const wasHidden = oldQuestion.hidden;

			return oldTopicRef.get().then(snap => {
				return oldTopicRef.set({
					count: {
						hidden: snap.data().count.hidden + (wasHidden ? -1 : 0),
						total: snap.data().count.total - 1
					}
				}, {
					merge: true
				});
			});
		};
		
		if (change.before.exists && change.after.exists) {
			// Updating existing document
			// Two Cases:
			// 1. Question was moved from one topic to another
			// 2. Changed visibility

			if (oldTopic !== newTopic) { /* Case 1 */

				/// Subtract one from old topic count.total
				oldTopicRef.get().then(snap => {
					oldTopicRef.set({
						count: {
							total: snap.data().count.total - 1
						}
					}, {
						merge: true
					});
				});

				if (oldQuestion.hidden == true) {
					/// Subtract one from old topic count.hidden if that question was hidden
					oldTopicRef.get().then(snap => {
						oldTopicRef.set({
							count: {
								hidden: snap.data().count.hidden - 1
							}
						}, {
							merge: true
						});
					});
				};

				/// Plus one to new topic count.total
				newTopicRef.get().then(snap => {
					newTopicRef.set({
						count: {
							total: snap.data().count.total + 1
						}
					}, {
						merge: true
					});
				});

				if (newQuestion.hidden == true) {
					/// Plus one to new topic count.hidden if that question is hidden
					return newTopicRef.get().then(snap => {
						return newTopicRef.set({
							count: {
								hidden: snap.data().count.hidden + 1
							}
						}, {
							merge: true
						});
					});
				}
				else{
					return true;
				}
			} else if (oldQuestion.hidden !== newQuestion.hidden) { /* Case 2 */
				/*
					If isHidden is true, that means the question **was** visible. 
				*/

				const isHidden = newQuestion.hidden;

				return newTopicRef.get().then(snap => {
					return newTopicRef.set({
						count: {
							hidden: snap.data().count.hidden + (isHidden ? +1 : -1)
						}
					}, {
						merge: true
					});
				});
			};
		}
	});

/* HTTP Function to initialize/reset question counter manually */

const express = require('express');
const cors = require('cors')({
	origin: true
});
const app = express();
app.use(cors);

app.get('/', (req, res) => {
	const topicID = req.query.topic,
		topicRef = db.collection('topics').doc(topicID);

	if (!topicID) {
		res.send("Topic ID is required");
		return;
	};

	const allQuestions = db.collection('questions').where('topic', '==', topicID);

	allQuestions.get().then(snap => {
		let totalCount = snap.size,
			hiddenCount = 0;

		snap.forEach(item => {
			if (item.data().hidden == true) {
				hiddenCount++;
			};
		});

		topicRef.set({
			'count': {
				total: totalCount,
				hidden: hiddenCount
			}
		}, {
			merge: true
		}).then(() => {
			res.json({
				total: totalCount,
				hidden: hiddenCount
			});
		});
	})
});

exports.reCount = functions.https.onRequest(app);
