//Importing required libraries and modules

require('dotenv').config({ path: "./environment.env" });
const { Client } = require("pg"); //Library for postgresql
const dbConnect = require("./dbConnect");
const axios = require("axios");
const interactiveJson = require("./interactiveElements");
const express = require("express");
const request = require("request");
const app = express();
const interactiveMessage = require("@slack/interactive-messages");
const { WebClient } = require("@slack/web-api");
const bodyParser = require("body-parser");
const UrlEncoder = bodyParser.urlencoded({ extended: false });
const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;
const signingSecret = process.env.SLACK_SIGNING_SECRET;
const slackBotToken = process.env.SLACK_BOT_TOKEN;
const slackInteractiveCom = interactiveMessage.createMessageAdapter(signingSecret);
const webClient = new WebClient(slackBotToken);
const fs = require("fs");
const { close } = require("inspector");
const DAY = 24 * 60 * 60 * 1000;

//Server will listens this port in local host or given url
app.listen(process.env.PORT, () => {
	console.log("Server is running at: " + process.env.PORT);
});

//listening the slack actions and parsing as requestListner of salckinteractive message
//parsing the url using body parser. App use resquestlistener method or bodyparser
// extends false qs library instead of "queryString" library
//all interactive actions will be listened and processed in below URL
app.use("/slack/actions", slackInteractiveCom.requestListener());
app.use(UrlEncoder);



//server running test
app.get("/", (req, res) => {
	res.send("App is running at " + process.env.PORT);
	console.log("App is working");
});

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get("/oauth", function (req, res) {
	// When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
	if (!req.query.code) {
		res.status(500);
		res.send({ Error: "Looks like we're not getting code." });
		console.log("Looks like we're not getting code.");
	} else {
		// If it's there...

		// We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
		request(
			{
				url: "https://slack.com/api/oauth.v2.access", //URL to hit
				qs: {
					code: req.query.code,
					client_id: clientId,
					client_secret: clientSecret,
				}, //Query string data
				method: "GET", //Specify the method
			},
			function (error, response, body) {
				if (error) {
					console.log(error);
				} else {
					res.json(body);
				}
			}
		);
	}
});

//server running test
app.get("/delivery", (req, res) => {
	console.log("App is working");
	res.send("App is working");
});










// Function to send query to database
async function sendQuery(queryString) {
		const client = new Client({
			user: process.env.DBUser,
			host: process.env.DBHost,
			database: process.env.DBDatabase,
			password: process.env.DBPassword,
			port: process.env.DBPort,
			ssl: false,
		});
	try {
		client.connect();
		let result = await client.query(queryString);
		return result;
	} catch (e) {
		console.log("Issue with db query: " + e);
		return e;
	}
	finally {
		client.end();
	}
}






// ******************************** SIGN UP USER **************************
// process slash command for signup
app.post("/delivery", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	console.log("User " + req.body.user_id + " attempting to sign up with /delivery ");
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " already signed up.");
			res.end("You have already signed up for Project Health Checkup!");
		}
		else {
			let insQuery = await formatInsertUserQuery(req.body);
			try {
				let queryResult = await sendQuery(insQuery);
				if (queryResult.rowCount) {
					console.log("User " + req.body.user_id + " signed up successfully.");
					res.end("You are now signed up for Project Health Checkup!");
				} else {
					console.log("User " + req.body.user_id + " did not sign up correctly.");
					res.end("There was an error adding you to Project Health Checkup!");
				}
			} catch (e) {
				console.log(e);
				res.end("There was an error adding you to Project Health Checkup!");
			}
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error adding you to Project Health Checkup!");
	}
});

app.post("/changeTimeZone", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	console.log("User " + req.body.user_id + " attempting change time zone ");
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(!checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " not signed up, cannot change timezone.");
			res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
		}
		else {
			let insQuery = await formatTimeZoneQuery(req.body);
			try {
				let queryResult = await sendQuery(insQuery);
				if (queryResult.rowCount) {
					console.log("User " + req.body.user_id + " timezone updated.");
					res.end("Your time zone has been updated!");
				} else {
					console.log("User " + req.body.user_id + " did not change time zone correctly.");
					res.end("There was an error updating your time zone!");
				}
			} catch (e) {
				console.log(e);
				res.end("There was an error changing your timezone for Project Health Checkup!");
			}
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error changing your timezone for Project Health Checkup!");
	}
});

// Format query to update users
async function formatTimeZoneQuery(requestPayload) {
	let userId = requestPayload.user_id;
	let userInfo = await webClient.users.info({ user: userId });
	let userName = userInfo.user.real_name;
	let timeZone = userInfo.user.tz;

	console.log("Attempt to update user " + userName + ", " + userId + ", with timeZone " + timeZone);

	let insQuery =
		"Update delivery_users set username = '"+ userName + "', timezone = '"+ timeZone + "' Where user_id = '"+ userId+"';"
	return insQuery;
}

// Format query to get users
async function formatInsertUserQuery(requestPayload) {
	let userId = requestPayload.user_id;
	let userInfo = await webClient.users.info({ user: userId });
	let userName = userInfo.user.real_name;
	let timeZone = userInfo.user.tz;

	console.log("Attempt to sign up user " + userName + ", " + userId + ", with timeZone " + timeZone);

	let insQuery =
		"Insert into delivery_users (username,timezone,user_id,active) values ('" + userName + "', '" + timeZone + "', '" + userId + "', '"+ "true" +"')";
	return insQuery;
}

// Format query to get users
async function formatCheckUserQuery(requestPayload) {
	let userID = requestPayload.user_id;
	let insQuery =
		"select exists(select 1 from delivery_users where user_id = '"+ userID+"')"
	return insQuery;
}

// ******************************** END SIGN UP USER **************************







// ******************************** PROJECT INFORMATION **************************
// process add project
app.post("/addproject", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	console.log("User " + req.body.user_id + " attempting to add project " + req.body.text);
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(!checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " not signed up, cannot add project " + req.body.text);
			res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
		}
		else {
			let projectName = req.body.text;
			let checkProjectQuery = "select exists(select 1 from projects where projectname='"+ projectName+"')"
			let checkProjectQueryResult = await sendQuery(checkProjectQuery);
			if(checkProjectQueryResult.rows[0].exists) {
				let makeActiveQuery = "Update projects set active='"+ "true" +"' where projectname='"+ projectName+"';"
				let queryResult = await sendQuery(makeActiveQuery);
				if (queryResult.rowCount) {
					console.log("User " + req.body.user_id + " added project that exists, made active if it was not active. Project " + req.body.text);
					res.end("A project with the name " + projectName + " already exists for Project Health Checkup! It's been made active if it was not active.");
				} else {
					console.log("User " + req.body.user_id + " issue trying to add project " + req.body.text);
					res.end("There was an error making this project active on the project list for Project Health Checkup!");
				}
			}
			else {

				let insQuery = "Insert into Projects (projectname,active) values ('" + projectName + "', '"+ "true" + "')";
				let queryResult = await sendQuery(insQuery);
				if (queryResult.rowCount) {
					console.log("User " + req.body.user_id + " added project " + req.body.text);
					res.end(req.body.text + " has been added to the project list for Project Health Checkup!");
				} else {
					console.log("User " + req.body.user_id + " did not correctly add project " + req.body.text);
					res.end("There was an error adding this project to the project list for Project Health Checkup!");
				}
			}
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error adding this project to the project list for Project Health Checkup!");
	}
});

// process delete project
app.post("/deleteproject", UrlEncoder, async (req, res) => {
	console.log("User " + req.body.user_id + " attempting to delete project " + req.body.text);
	res.setHeader("Content-Type", "application/json");
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(!checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " not signed up, cannot delete project " + req.body.text);
			res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
		}
		else {
			let projectName = req.body.text;
			let checkProjectQuery = "select exists(select 1 from projects where projectname='"+ projectName+"' and active='true')"
			let checkProjectQueryResult = await sendQuery(checkProjectQuery);
			if(!checkProjectQueryResult.rows[0].exists) {
				console.log("User " + req.body.user_id + " attempted to delete project " + req.body.text + " that does not exist.");
				res.end("A project with the name " + projectName + " does not exist for Project Health Checkup!");
			}
			else {
				let checkProjectIDQuery = "select id from projects where projectname='"+ projectName+"' and active='true'"
				let projectIDResult = await sendQuery(checkProjectIDQuery);
				let projectID = projectIDResult.rows[0].id
				let checkProjectAssignedQuery = "select exists(select 1 from delivery_users_projects where project_id='"+ projectID+"' and active='true')"
				let checkProjectAssignedQueryResult = await sendQuery(checkProjectAssignedQuery);
				if(checkProjectAssignedQueryResult.rows[0].exists) {
					console.log("User " + req.body.user_id + " attempted to delete project " + req.body.text + " that has active users.");
					res.end("The project " + projectName + " is still actively assigned to users for Project Health Checkup! You cannot remove a project that is still assigned to a user.");
				}
				else {
					let insQuery = "Update projects set active='"+ "false" +"' where projectname='"+ projectName+"';"
					let queryResult = await sendQuery(insQuery);
					if (queryResult.rowCount) {
						console.log("User " + req.body.user_id + " deleted project " + req.body.text);
						res.end(req.body.text + " has been deleted from the project list for Project Health Checkup! It's been made inactive.");
					} else {
						console.log("User " + req.body.user_id + " did not correctly delete project " + req.body.text);
						res.end("There was an error deleting this project from the project list for Project Health Checkup!");
					}
				}
			}
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error deleting this project from the project list for Project Health Checkup!");
	}
});

// process display projects
app.post("/displayprojects", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	console.log("User " + req.body.user_id + " attempting to display projects.");
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(!checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " not signed up, cannot display projects.");
			res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
		}
		else {
			let checkProjectQuery = "select exists(select 1 from projects where active='true')"
			let checkProjectQueryResult = await sendQuery(checkProjectQuery);
			if(!checkProjectQueryResult.rows[0].exists) {
				console.log("User " + req.body.user_id + " cannot display projects, no actve projects exists");
				res.end("There are no active projects for Project Health Checkup! Create a project to be able to display projects.");
			}
			else {
				let insQuery = "SELECT * FROM projects WHERE active='true';";
				let userID = req.body.user_id;
				let queryResult = await sendQuery(insQuery);
				let projectList = JSON.stringify(buildProjectList(queryResult.rows));
				let projectResponse = JSON.stringify(interactiveJson.projectList);
				projectResponse = projectResponse.replace(/"titleHere"/, "\"All Active Project Health Checkup Projects\"");
				projectResponse = projectResponse.replace(/"projectList"/, projectList);
				projectResponse = JSON.parse(projectResponse);
				const slackMessage = {
					...projectResponse,
					...{
						channel: userID,
						text: "ProjectList",
					},
				};
				var postQuestion = await webClient.chat.postMessage(slackMessage);
				if (queryResult.rowCount) {
					console.log("User " + req.body.user_id + " displayed projects");
					res.end();
				} else {
					console.log("User " + req.body.user_id + " had an error displaying projects");
					res.end("There was an error displaying projects for Project Health Checkup!");
				}
			}
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error displaying projects for Project Health Checkup!");
	}
});

// Build list of projects from projects table
function buildProjectList(projects) {
	result = [];
	projectList = [];
	for (i = 0; i < projects.length; i++) {
		projectList.push(projects[i]["projectname"]);
	}
	projectList.sort();
	textField = "";
	for (i = 0; i < projects.length; i++) {
		textField += "•" +" " + projectList[i] + "\n"
	}
	let project = {
		type: "plain_text",
		text: textField,
		emoji: true,
	};


	result.push(project);
	return result;
}

// process assign project
app.post("/assignproject", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	console.log("User " + req.body.user_id + " attempting to assign project " + req.body.text);
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(!checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " not signed up, cannot assign project.");
			res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
		}
		else {
			let projectName = req.body.text;
			let checkProjectQuery = "select exists(select 1 from projects where projectname='"+ projectName+"' and active='true')"
			let checkProjectQueryResult = await sendQuery(checkProjectQuery);
			if(!checkProjectQueryResult.rows[0].exists) {
				console.log("User " + req.body.user_id + " attempted to assign project " + req.body.text + " that does not exist / is not active.");
				res.end("An active project with the name " + projectName + " does not exist for Project Health Checkup! Please create projects and make projects active with /deliveryhealthaddproject");
			}
			else {
				let checkProjectIDQuery = "select id from projects where projectname='"+ projectName+"' and active='true'"
				let projectIDResult = await sendQuery(checkProjectIDQuery);
				let projectID = projectIDResult.rows[0].id
				let checkProjectAssignedQuery = "select exists(select 1 from delivery_users_projects where project_id='"+ projectID+"' and user_id='"+req.body.user_id+"' and active='true')"
				let checkProjectAssignedQueryResult = await sendQuery(checkProjectAssignedQuery);
				if(checkProjectAssignedQueryResult.rows[0].exists) {
					console.log("User " + req.body.user_id + " attempted to assign project " + req.body.text + " that is already assigned.");
					res.end("The project " + projectName + " is still actively assigned to you for Project Health Checkup!");
				}
				else {
					let currentDate = new Date().toString();
					let assignQuery = "Insert into delivery_users_projects (user_id,project_id,active,date_assigned) values ('" + req.body.user_id + "', '" + projectID + "', '" + "true" + "', '"+ currentDate +"')";
					let queryResult = await sendQuery(assignQuery);
					if (queryResult.rowCount) {
						console.log("User " + req.body.user_id + " assigned project " + req.body.text);
						res.end(req.body.text + " has been actively assigned to you for Project Health Checkup!");
					} else {
						console.log("User " + req.body.user_id + " did not correctly delete project " + req.body.text);
						res.end("There was an error actively assigning this project to you for Project Health Checkup!");
					}
				}
			}
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error actively assigning this project to you for Project Health Checkup!");
	}
});

//process unassign project
app.post("/unassignproject", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	console.log("User " + req.body.user_id + " attempting to unassign project " + req.body.text);
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(!checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " not signed up, cannot unassign project.");
			res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
		}
		else {
			let projectName = req.body.text;
			let checkProjectQuery = "select exists(select 1 from projects where projectname='"+ projectName+"')"
			let checkProjectQueryResult = await sendQuery(checkProjectQuery);
			if(!checkProjectQueryResult.rows[0].exists) {
				console.log("User " + req.body.user_id + " attempted to unassign project " + req.body.text + " that does not exist.");
				res.end("A project with the name " + projectName + " does not exist for Project Health Checkup!");
			}
			else {
				let checkProjectIDQuery = "select id from projects where projectname='"+ projectName+"'"
				let projectIDResult = await sendQuery(checkProjectIDQuery);
				let projectID = projectIDResult.rows[0].id
				let checkProjectAssignedQuery = "select exists(select 1 from delivery_users_projects where project_id='"+ projectID+"' and user_id='"+req.body.user_id+"' and active='true')"
				let checkProjectAssignedQueryResult = await sendQuery(checkProjectAssignedQuery);
				if(!checkProjectAssignedQueryResult.rows[0].exists) {
					console.log("User " + req.body.user_id + " unattempted to assign project " + req.body.text + " that is not already assigned.");
					res.end("The project " + projectName + " is not actively assigned to you for Project Health Checkup!");
				}
				else {
					let currentDate = new Date().toString();
					let unassignQuery = "Update delivery_users_projects set active='"+ "false" +"', date_unassigned ='"+ currentDate + "' where project_id='"+ projectID+"' and user_id='"+req.body.user_id+"';"
					let queryResult = await sendQuery(unassignQuery);
					if (queryResult.rowCount) {
						console.log("User " + req.body.user_id + " unassigned project " + req.body.text);
						res.end(req.body.text + " has been unassigned from you for Project Health Checkup!");
					} else {
						console.log("User " + req.body.user_id + " did not correctly delete project " + req.body.text);
						res.end("There was an error unassigning this project from you for Project Health Checkup!");
					}
				}
			}
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error unassigning this project to you for Project Health Checkup!");
	}
});


// ******************************** END PROJECT INFORMATION **************************








// ******************************** USER INFORMATION **************************
// process display users
app.post("/deliveryhealthusers", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	console.log("User " + req.body.user_id + " attempting to display users.");
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(!checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " not signed up, cannot display users.");
			res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
		}
		else {
			let checkUsersQuery = "select exists(select 1 from delivery_users where active='true')"
			let checkUsersQueryResult = await sendQuery(checkUsersQuery);
			if(!checkUsersQueryResult.rows[0].exists) {
				console.log("User " + req.body.user_id + " cannot display users, no actve users exists")
				res.end("There are no active users for Project Health Checkup!");
			}
			else {
				let insQuery = "SELECT * FROM delivery_users where active='true';";
				let userID = req.body.user_id;
				let queryResult = await sendQuery(insQuery);
				let userList = JSON.stringify(buildUserList(queryResult.rows));
				let userResponse = JSON.stringify(interactiveJson.userList);
				userResponse = userResponse.replace(/"userList"/, userList);
				userResponse = userResponse.replace(/"titleHere"/, "\"Current Delivery Health Users\"");
				userResponse = JSON.parse(userResponse);

				const slackMessage = {
					...userResponse,
					...{
						channel: userID,
						text: "UserList",
					},
				};

				var postQuestion = await webClient.chat.postMessage(slackMessage);
				if (queryResult.rowCount) {
					console.log("User " + req.body.user_id + " displayed users");
					res.end();
				} else {
					console.log("User " + req.body.user_id + " had an error displaying users");
					res.end("There was an error displaying users for Project Health Checkup!");
				}
			}
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error displaying users for Project Health Checkup!");
	}
});

// process display users on project
app.post("/deliveryhealthusersonproject", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	console.log("User " + req.body.user_id + " attempting to display active users for project " + req.body.text);
	let projectName = req.body.text;
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(!checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " not signed up, cannot display users.");
			res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
		}
		else {
			let checkProjectQuery = "select exists(select 1 from projects where projectname='"+ projectName+"')"
			let checkProjectQueryResult = await sendQuery(checkProjectQuery);
			if(!checkProjectQueryResult.rows[0].exists) {
				console.log("User " + req.body.user_id + " attempted to lookup users on a project " + req.body.text + " that does not exist.");
				res.end("A project with the name " + projectName + " does not exist for Project Health Checkup!");
			}
			else {
				let checkProjectIDQuery = "select id from projects where projectname='"+ projectName+"'"
				let projectIDResult = await sendQuery(checkProjectIDQuery);
				let projectID = projectIDResult.rows[0].id
				let getUsersOnProjectQuery = "select * from delivery_users_projects inner join delivery_users using(user_id) where project_id='"+ projectID+"' and delivery_users.active = 'true' and delivery_users_projects.active='true'"
				let checkGetUsersOnProjectQuery = await sendQuery(getUsersOnProjectQuery);
				if(checkGetUsersOnProjectQuery.rowCount <= 0) {
					const slackMessage = {
						...{
							channel: req.body.user_id,
							text: "There are no active users for the project " + projectName + " for Project Health Checkup!"
						},
					};
					console.log("User " + req.body.user_id + " displayed no active users from project "+ projectName);
					var postQuestion = await webClient.chat.postMessage(slackMessage);
					res.end();
				}
				else {
					let userList = JSON.stringify(buildUserList(checkGetUsersOnProjectQuery.rows));
					let userResponse = JSON.stringify(interactiveJson.userList);
					userResponse = userResponse.replace(/"userList"/, userList);
					userResponse = userResponse.replace(/"titleHere"/, "\"Currently Active " + projectName+ " Users\"");
					userResponse = JSON.parse(userResponse);
					const slackMessage = {
						...userResponse,
						...{
							channel: req.body.user_id,
							text: "UserList",
						},
					};

					var postQuestion = await webClient.chat.postMessage(slackMessage);
					if (checkGetUsersOnProjectQuery.rowCount) {
						console.log("User " + req.body.user_id + " displayed active users from project "+ projectName);
						res.end();
					} else {
						console.log("User " + req.body.user_id + " had an error displaying active users from project "+ projectName);
						res.end("There was an error displaying active users from project "+ projectName +" for Project Health Checkup!");
					}
				}
			}
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error displaying active users from project "+ projectName +" for Project Health Checkup!");
	}
});

// process display users on project
app.post("/deliveryhealthmyprojects", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	console.log("User " + req.body.user_id + " attempting to display their active projects ");
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(!checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " not signed up, cannot display users.");
			res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
		}
		else {
			let query = "SELECT * FROM delivery_users_projects inner join projects on projects.id = delivery_users_projects.project_id WHERE delivery_users_projects.user_ID = '" + req.body.user_id + "' and delivery_users_projects.active='true';";
			let projects = await sendQuery(query);
			if(projects.rowCount <= 0) {
				const slackMessage = {
					...{
						channel: req.body.user_id,
						text: "You have no active project for Project Health Checkup!"
					},
				};
				console.log("User " + req.body.user_id + " has no active projects!");
				var postQuestion = await webClient.chat.postMessage(slackMessage);
				res.end();
			}
			else {
				let projectList = JSON.stringify(buildProjectList(projects.rows));
				let projectResponse = JSON.stringify(interactiveJson.projectList);
				projectResponse = projectResponse.replace(/"titleHere"/, "\"Your Currently Active Project Health Checkup Projects\"");
				projectResponse = projectResponse.replace(/"projectList"/, projectList);
				projectResponse = JSON.parse(projectResponse);

				const slackMessage = {
					...projectResponse,
					...{
						channel: req.body.user_id,
						text: "ProjectList",
					},
				};

				var postQuestion = await webClient.chat.postMessage(slackMessage);
				if (projects.rowCount) {
					console.log("User " + req.body.user_id + " displayed their active projects");
					res.end();
				} else {
					console.log("User " + req.body.user_id + " had an error displaying their active projects");
					res.end("There was an error displaying your active projects for Project Health Checkup!");
				}
			}
			
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error displaying your active projects for Project Health Checkup!");
	}
});

// build list of users from delivery_users table
function buildUserList(users) {
	result = [];
	userList = [];
	for (i = 0; i < users.length; i++) {
		userList.push(users[i]["username"]);
	}
	userList.sort();
	textField = "";
	for (i = 0; i < users.length; i++) {
		textField += "•" +" " + userList[i] + "\n"
	}
		let project = {
			type: "plain_text",
			text: textField,
			emoji: true,
		};

		result.push(project);
	return result;
}

// ********************************END USER INFORMATION **************************










// ******************************** SURVEY **************************

// process slash command for testing survey
app.post("/deliveryTest", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	let checkUserQuery = await formatCheckUserQuery(req.body);
	let checkUserQueryResult = await sendQuery(checkUserQuery);
	if(!checkUserQueryResult.rows[0].exists) {
		res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
	}
	else {
		let userID = [{ user_id: req.body.user_id }];
		try {
			sendSurvey(userID);
			res.end();
		} catch (e) {
			console.log(e);
		}
	}
});

// list the last 10 surveys for a project
app.post("/deliveryhealthsurveylist", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	console.log("User " + req.body.user_id + " attempting to display active users for project " + req.body.text);
	let projectName = req.body.text;
	try {
		let checkUserQuery = await formatCheckUserQuery(req.body);
		let checkUserQueryResult = await sendQuery(checkUserQuery);
		if(!checkUserQueryResult.rows[0].exists) {
			console.log("User " + req.body.user_id + " not signed up, cannot display users.");
			res.end("You must be signed up for Project Health Checkup to run this command! Run /deliveryhealth to sign up.");
		}
		else {
			let checkProjectQuery = "select exists(select 1 from projects where projectname='"+ projectName+"')"
			let checkProjectQueryResult = await sendQuery(checkProjectQuery);
			if(!checkProjectQueryResult.rows[0].exists) {
				console.log("User " + req.body.user_id + " attempted to lookup surveys on a project " + req.body.text + " that does not exist.");
				res.end("A project with the name " + projectName + " does not exist for Project Health Checkup!");
			}
			else {
				let checkProjectIDQuery = "select id from projects where projectname='"+ projectName+"'"
				let projectIDResult = await sendQuery(checkProjectIDQuery);
				let projectID = projectIDResult.rows[0].id
				let getSurveyProjectQuery = "select * from projectsurvey inner join delivery_users on delivery_users.user_id = projectsurvey.user_id where project_id='"+ projectID+"' order by id desc limit 10";
				let checkgetSurveyProjectQuery = await sendQuery(getSurveyProjectQuery);
				if(checkgetSurveyProjectQuery.rowCount <= 0) {
					const slackMessage = {
						...{
							channel: req.body.user_id,
							text: "There are no active surveys for the project " + projectName + " for Project Health Checkup!"
						},
					};
					console.log("User " + req.body.user_id + " displayed no surveys from project "+ projectName);
					var postQuestion = await webClient.chat.postMessage(slackMessage);
					res.end();
				}
				else {
					let surveyList = await JSON.stringify(buildSurveyList(checkgetSurveyProjectQuery.rows,req.body.user_id,projectName));
					if (checkgetSurveyProjectQuery.rowCount) {
						console.log("User " + req.body.user_id + " displayed active users from project "+ projectName);
						res.end();
					} else {
						console.log("User " + req.body.user_id + " had an error displaying active users from project "+ projectName);
						res.end("There was an error displaying active users from project "+ projectName +" for Project Health Checkup!");
					}
				}
			}
		}
	} catch (e) {
		console.log(e);
		res.end("There was an error displaying latest surveys from project "+ projectName +" for Project Health Checkup!");
	}
});

// build list of users from delivery_users table
async function buildSurveyList(surveys,user,projectName) {
	let surveyRequestJson = JSON.stringify(interactiveJson.surveryRequestsHeader).replace("*project", projectName).replace("*x", surveys.length);
	surveyRequestJson = JSON.parse(surveyRequestJson);
	const slackMessage = {
		...surveyRequestJson,
		...{ channel: user, text: "Project Survery List Header" },
	};
	await webClient.chat.postMessage(slackMessage);
	try {
		for (i = 0; i < surveys.length; i++) {
			let username = surveys[i].username;
			let date = surveys[i].posteddate;
			let rating = surveys[i].rating;
			let comment = surveys[i].comment;
			if(comment == null) {
				comment = "No comment entered";
			}
			let surveyListJson = JSON.stringify(interactiveJson.surveyList).replace("&username", username).replace("&date", date).replace("&rating", rating).replace("&comment", comment);
			surveyListJson = JSON.parse(surveyListJson);
			const slackMessage = {
				...surveyListJson,
				...{
					channel: user,
					text: "SurveyList",
				},
			};
			await webClient.chat.postMessage(slackMessage);
		}
	} catch (e) {

			console.log(e);
	}
}

// send survey to user
async function sendSurvey(userID) {
	for (i = 0; i < userID.length; i++) {
		try {
			let channelID = userID[i]["user_id"];
			let query = "SELECT * FROM delivery_users_projects WHERE user_ID = '" + channelID + "' and active='true';";
			let projects = await sendQuery(query);
			if (projects.rowCount <= 0) {
				console.log("No project survey notification for " + channelID);
				const slackMessage = {
				...{ channel: channelID, text: "You do not have any active projects in Project Health Checkup! Please add projects via /deliveryhealthassignproject. You can call this survey at anytime using /deliveryhealthsurvey." },
				};
				webClient.chat.postMessage(slackMessage);
			}
			else{
				try {
					let surveyHeaderJson = JSON.stringify(interactiveJson.surveryHeader)
					surveyHeaderJson = JSON.parse(surveyHeaderJson);
					const slackMessage = {
						...surveyHeaderJson,
						...{ channel: channelID, text: "Project Survery Header" },
					};
					webClient.chat.postMessage(slackMessage);
					for(j = 0; j < projects.rowCount; j++) {
						projectID = projects.rows[j].project_id;
						let checkProjectNameQuery = "select projectname from projects where id='"+ projectID+"' and active='true'"
						let projectNameResult = await sendQuery(checkProjectNameQuery);
						let projectName = projectNameResult.rows[0].projectname
						console.log("Sending project survey notification to " + channelID + " for project " + projectName + " projectid: " + projectID);
						let surveyQuestionJson = JSON.stringify(interactiveJson.surveryQuestion).replace("*project", projectName).replace(/\*projectID/g, projectID);
						surveyQuestionJson = JSON.parse(surveyQuestionJson);
						const slackMessage = {
							...surveyQuestionJson,
							...{ channel: channelID, text: projectName },
						};
						setTimeout(function () {
							webClient.chat.postMessage(slackMessage);}, 500);
					}
				} catch (e) {
					console.log("Error sending survey to user " + userID);
					console.log(e);
				}
			}
		} catch (e) {
			console.log("Error sending survey to user " + userID);
			console.log(e);
		}
	}
}

// Process Block Actions
function processBlockActions(requestPayload, res) {
	let userResponse = requestPayload.actions[0].action_id;
	let surveyQuestion = requestPayload.message.blocks[0].text.text;
	let responseURL = requestPayload.response_url;
	let sendTime = parseFloat(requestPayload.container.message_ts);
	let actionTime = parseFloat(requestPayload.actions[0].action_ts);
	let closeStatus = actionTime - sendTime <= 18 * 60 * 60 * 1000;
	if(!closeStatus) {
		closeSurvey(responseURL, "Your response was past 18 hours. The result of this survey has not been recorded.?");
	}
	else {
		if ("click1,click2,click3,comments6".includes(userResponse)) {
			let projectName = requestPayload.message.text;
			let rating = JSON.stringify(requestPayload.actions[0].action_id)[requestPayload.actions[0].action_id.length];
			let userID = requestPayload.user.id;
			let projectID = requestPayload.actions[0].value;
			expandSurvey(requestPayload,userID, rating,projectID,projectName,actionTime);
		} else if("Remove_Project".includes(userResponse)){ 
			let projectName = requestPayload.message.text;
			let userID = requestPayload.user.id;
			let projectID = requestPayload.actions[0].value;
			removeProject(responseURL,userID,projectID,projectName);
		} else {
			let projectName = requestPayload.message.text;
			let rating = JSON.stringify(requestPayload.actions[0].action_id)[requestPayload.actions[0].action_id.length];
			let userID = requestPayload.user.id;
			let projectID = requestPayload.actions[0].value;
			updatePositiveSurvey(responseURL,userID, rating,projectID,projectName,actionTime);
		}
	}
}

//remove a project via the Survey Button
async function removeProject(responseURL,userID,projectID,projectName) {
	try {
		let currentDate = new Date().toDateString();
		let unassignQuery = "Update delivery_users_projects set active='"+ "false" +"', date_unassigned ='"+ currentDate + "' where project_id='"+ projectID+"' and user_id='"+userID+"';"
		let queryResult = await sendQuery(unassignQuery);
		if (queryResult.rowCount) {
			console.log("User " + userID + " unassigned project " + projectName);
			closeSurvey(responseURL, projectName + " has been unassigned from you for Project Health Checkup!")
			
		} else {
			console.log("User " + userID + " did not correctly delete project " + projectName);
			closeSurvey(responseURL, "There was an error unassigning" + projectName + " from you for Project Health Checkup! Please try using /deliveryhealthunassignproject");
		}
	} catch (e) {
		console.log("Error: " + e);
		closeSurvey(responseURL, "There was an error unassigning" + projectName + " from you for Project Health Checkup! Please try using /deliveryhealthunassignproject");
	}
}

// update survey without comments from survey response of 4 or 5
async function updatePositiveSurvey(responseURL,userID, rating,projectID, projectName,postedDate) {
	try {
		let d1 = new Date(0);
		let d2 = new Date(0);
		d1.setUTCSeconds(postedDate);
		let insQuery = "Insert into projectsurvey (user_id,project_id,rating,posteddate) values ('" + userID + "', '"+ projectID + "', '" + rating +"', '" + d1.toString() + "')";
		let queryResult = await sendQuery(insQuery);
		if (queryResult.rowCount) {
			console.log("User " + userID + " added survey with rating " + rating + " for project " + projectID);
			closeSurvey(responseURL, "Your response rating of " + rating + " for "+ projectName + " has been recorded for Project Health Checkup!")
		} else {
			console.log("User " + userID + " did not correctly add survey for project " + projectID);
			closeSurvey(responseURL, "There was an error recording your response rating of " + rating + " for project " + projectName + " for Project Health Checkup! Please try using /deliveryhealthsurvey to get a new survey");
		}
	} catch (e) {
		console.log("Error: " + e);
		closeSurvey(responseURL, "There was an error recording your response rating of " + rating + " for project " + projectName + " for Project Health Checkup! Please try using /deliveryhealthsurvey to get a new survey");
	}
}

// open up survey modal
async function expandSurvey(requestPayload,userID, rating,projectID, projectName,postedDate) {
	try {
		let surveyQuestionJson = JSON.stringify(interactiveJson.surveyModal).replace(/\*project/g, projectName).replace(/\*surveyURL/g, requestPayload.response_url);
		surveyQuestionJson = JSON.parse(surveyQuestionJson);	
		closeSurvey(requestPayload.response_url, "If you accidently closed the popup without submitting, type /deliveryhealthsurvey to get a new survey for project " + projectName + " for Project Health Checkup.");
		webClient.views.open({
			trigger_id: requestPayload.trigger_id,
			view: surveyQuestionJson,
		});
		console.log("User " + userID + " toggled popup survey for project " + projectName);
	} catch (e) {
		console.log("User " + userID + " attempted to toggled popup survey for project " + projectName + " but had an error!");
		console.log("Error: " + e);
		closeSurvey(requestPayload.response_url, "There was an error recording your response rating of " + rating + " for project " + projectName + " for Project Health Checkup! Please try using /deliveryhealthsurvey to get a new survey");
	}
}

// replace the survey text
function closeSurvey(responseURL, responseText) {
	axios
		.post(responseURL, {
			replace_original: "true",
			text: responseText,
		})
		.catch((error) => {
			console.error(error);
		});
}

//process the survey modal
async function processViewSubmission(requestPayload, res) {
	try {
		let ratingAndProject = requestPayload.view.state.values.ProjectIssueBlock.ProjectIssueAction.selected_option.value;
		let comments = requestPayload.view.state.values.ProjectCommentBlock.CommentAction.value;
		let rating = ratingAndProject[ratingAndProject.length-1];
		let projectName = ratingAndProject.slice(0,-2);
		let userID = requestPayload.user.id;
		let responseURL = requestPayload.view.callback_id;
		let postedDate = new Date();
		let checkProjectIDQuery = "select id from projects where projectname='"+ projectName+"' and active='true'"
		let projectIDResult = await sendQuery(checkProjectIDQuery);
		let projectID = projectIDResult.rows[0].id
		let insQuery = "Insert into projectsurvey (user_id,project_id,rating,comment,posteddate) values ('" + userID + "', '"+ projectID + "', '" + rating +"', '" + comments + "', '" + postedDate.toString() + "')";
		let queryResult = await sendQuery(insQuery);
		if (queryResult.rowCount) {
			console.log("User " + userID + " added survey with comment and rating " + rating + " for project " + projectID);
			closeSurvey(requestPayload.view.callback_id, "Your response with comment and rating " + rating + " for project " + projectName + " has been recorded for Project Health Checkup!");
			res.end();
		} else {
			console.log("User " + userID + " did not correctly add survey with comment for project " + projectID);
			closeSurvey(requestPayload.view.callback_id,"There was an error trying to add your response rating of " + rating + " with comments for "+ projectName + " for Project Health Checkup! Please use /deliveryhealthsurvey to get a new survey!");
			res.end();
		}
	} catch (e) {
		console.log("User " + requestPayload.user.id + " attempted to submit popup survey but had an error!");
		console.error("Error: " + e);
		closeSurvey(requestPayload.view.callback_id,"There was an error trying to add your response rating of " + rating + " with comments for "+ projectName + " for Project Health Checkup! Please use /deliveryhealthsurvey to get a new survey!");
		res.end();
	}
}

//Get response from user action
app.post("/option/slack/actions", UrlEncoder, async (req, res) => {
	try {
		const requestPayload = JSON.parse(req.body.payload);
		// Retrieve Text from submission of comment
		if (requestPayload.type == "view_submission") {
			console.log("View submission press by: " + requestPayload.user.id);
			try {
				await processViewSubmission(requestPayload, res);
			} catch (e) {
				console.log("Error: " + e);
			}
			// Process button click
		} else if (requestPayload.type == "block_actions") {
			console.log("Block press by: " + requestPayload.user.id);
			try {
				processBlockActions(requestPayload, res);
			} catch (e) {
				console.log("Error: " + e);
			}
		}
	} catch (error) {
		console.log("Error occured: " + error);
		res.status(404).send('{"status":Innacurate request}');
	}
});


// ******************************** END SURVEY **************************











// ******************************** START AND SCHEDULE USERS **************************

// Get local time
async function getLocalHour(timezone) {
	//currently we're looking for an hour of 9 because we're sending at 9:00AM
	let newDate = new Date();
	let currentDate = new Date(newDate.toLocaleString('en-US',{timeZone:timezone}))
	let currentHours = currentDate.getHours();
	let day = currentDate.getDay();
	//no send weekened
	if(day == 0 || day == 6) {
		return false;
	}
	else {
		return (currentHours==9)
	}
}

async function userTimeZone(timezone) {
	let checkTime = await getLocalHour(timezone);
	if(checkTime) {
		console.log("Sending survey to users in timezone " + timezone);
		let usersInTimeZoneQuery = "select * from delivery_users where active='true' and timezone='" +timezone+ "';";
		let usersInTimeZoneQueryResult = await sendQuery(usersInTimeZoneQuery);
		for (let j = 0; j < usersInTimeZoneQueryResult.rows.length; j++) {
			let userID = [{ user_id: usersInTimeZoneQueryResult.rows[j].user_id }];
			await sendSurvey(userID);
		}
	}
}

// Schedules Messages based on users timezone
async function scheduleMessages() {
	console.log("Kicking off Schedule");
	try {
		let usersByTZ = {};
		let checkUsersQuery = "select exists(select 1 from delivery_users where active='true')"
		let checkUsersQueryResult = await sendQuery(checkUsersQuery);
		if(!checkUsersQueryResult.rows[0].exists) {
			console.log("Cannot ping any users, no actve users exists");
		}
		else {
			let userTimeZoneQuery = "select distinct timezone from delivery_users";
			let userTimeZoneQueryResult = await sendQuery(userTimeZoneQuery);
			for (let i = 0; i < userTimeZoneQueryResult.rowCount; i++) {
				await userTimeZone(userTimeZoneQueryResult.rows[i].timezone);
			}
		}
	} catch (e) {
		console.log("There was an error starting the schedule:")
		console.log(e);
	}
	let currentDate = new Date();
	let minutes = currentDate.getMinutes();
	minutes = 60-minutes;
	let seconds = currentDate.getSeconds();
	seconds = 60-seconds;		
	console.log("Waiting " + minutes+ " minutes and " + seconds + " seconds to kick off schedule again");
	let waitMiliseconds = (minutes * 60 + seconds) * 1000;
	setTimeout(scheduleMessages,waitMiliseconds);
}


async function startSchedule() {
	//kick off the schedule at the top of the next hour
	let currentDate = new Date();
	let minutes = currentDate.getMinutes();
	minutes = 60-minutes;
	let seconds = currentDate.getSeconds();
	seconds = 60-seconds;		
	console.log("Waiting " + minutes+ " minutes and " + seconds + " seconds to kick off schedule");
	let waitMiliseconds = (minutes * 60 + seconds) * 1000;
	setTimeout(scheduleMessages,waitMiliseconds);
}

async function startSlackBot() {
	startServer();
}

// start slack bot
const startServer = async () => {
	let retries =  5;
	while (retries) {
		try {
			let checkProjectQuery = "select exists(select 1 from projects where active='true')"
			let checkProjectQueryResult = await sendQuery(checkProjectQuery);
			console.log("log");
			console.warn("warn");
			console.error("error");
			console.log("DBConnection success, started Project Health Checkup.")
			break;
		} catch (e) {
			console.log("Error: " + JSON.stringify(e));
			retries -= 1;
			console.log("retries left: " + retries)
			if (retries > 0) {
				await new Promise(res => setTimeout(res, 5000));
			}
			else { 
				console.log("exiting, unable to connect to db")
				process.exit(1);
			}
		}
	}
	startSchedule();
}

startSlackBot();

// ******************************** END START AND SCHEDULE USERS **************************
