//Importing required libraries and modules
require("dotenv").config();
const { Client } = require("pg"); //Library for postgresql
const dbConnect = require("./dbConnect");
const axios = require("axios");
const interactiveJson = require("./interactiveElements");
const express = require("express");
const request = require("request");
const moment = require("./moment-timezone-with-data");
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

// Database
try {
	let projectList = "";
	//DB Connection establishment
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
		ssl: false,
	});
	client.connect();
	selQuery = "SELECT ProjectName FROM PROJECTS";
	// Running the query
	client.query(selQuery, (err, res) => {
		if (err) throw err;
		else {
			i = 0;
			if (JSON.stringify(res.rows) != "[]" || res.rows != undefined) {
				console.log("DBConnection Success. Project List Fetched");
				for (let row of res.rows) {
					if (i == 0) {
						//Building the JSON. This will list the Projectlists in dropdown.
						projectList =
							"{" +
							projectList +
							'"text":{"type": "plain_text", "text": "' +
							String(row.projectname) +
							'"},"value": "' +
							String(row.projectname) +
							'"}';
					} else {
						//Building the JSON. This will list the Projectlists in dropdown.
						projectList =
							projectList +
							',{"text":{"type": "plain_text", "text": "' +
							String(row.projectname) +
							'"},"value": "' +
							String(row.projectname) +
							'"}';
					}
					i++;
				}
				client.end();
			}
		}
	});
} catch (e) {
	console.log(JSON.stringify(e));
}

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

//Get response from user action
app.post("/option/slack/actions", UrlEncoder, async (req, res) => {
	try {
		const requestPayload = JSON.parse(req.body.payload);
		// Retrieve Text from submission of comment
		if (requestPayload.type == "view_submission") {
			try {
				await processViewSubmission(requestPayload, res);
			} catch (e) {
				console.log("Error: " + e);
			}
			// Process button click
		} else if (requestPayload.type == "block_actions") {
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

// Send Project List to drop down
app.post("/option-load-endpoint", UrlEncoder, async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	let projectList = await getProjectList();
	res.end(projectList);
});

// process slash command for signup
app.post("/delivery", UrlEncoder, async (req, res) => {
	await getName(req.body.user_id);
	let insQuery = await formatInsertUserQuery(req.body);
	try {
		let queryResult = await sendQuery(insQuery);

		res.setHeader("Content-Type", "application/json");
		if (queryResult.rowCount) {
			res.end("You are now signed up for Project Health Checkup!");
		} else if (queryResult.code == "23505") {
			res.end("You have already signed up for Project Health Checkup!");
		} else {
			res.end("There was an error adding you to Project Health Checkup!");
		}
	} catch (e) {
		console.log(e);
	}
});

// process slash command for signup
app.post("/addproject", UrlEncoder, async (req, res) => {
	let projectName = req.body.text;
	let insQuery = "Insert into Projects (projectname) values ('" + projectName + "')";
	try {
		let queryResult = await sendQuery(insQuery);

		res.setHeader("Content-Type", "application/json");
		if (queryResult.rowCount) {
			res.end(req.body.text + " Has been added to the project list");
		} else if (queryResult.code == "23505") {
			res.end("This project already exists");
		} else {
			res.end("There was an error adding this project to the project list");
		}
	} catch (e) {
		console.log(e);
	}
});

// process slash command for signup
app.post("/displayprojects", UrlEncoder, async (req, res) => {
	let insQuery = "SELECT * FROM projects";
	let userID = req.body.user_id;
	try {
		let queryResult = await sendQuery(insQuery);
		let projectList = JSON.stringify(buildProjectList(queryResult.rows));
		let projectResponse = JSON.stringify(interactiveJson.projectList);

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
		res.setHeader("Content-Type", "application/json");
		if (queryResult.rowCount) {
			res.end();
		} else if (queryResult.code == "23505") {
			res.end("This project already exists");
		} else {
			res.end("There was an error adding this project to the project list");
		}
	} catch (e) {
		console.log(e);
	}
});

// process slash command for delivery health users
app.post("/deliveryhealthusers", UrlEncoder, async (req, res) => {
	let insQuery = "SELECT * FROM delivery_users";
	let userID = req.body.user_id;
	try {
		let queryResult = await sendQuery(insQuery);
		let userList = JSON.stringify(buildUserList(queryResult.rows));
		let userResponse = JSON.stringify(interactiveJson.userList);

		userResponse = userResponse.replace(/"userList"/, userList);

		userResponse = JSON.parse(userResponse);

		const slackMessage = {
			...userResponse,
			...{
				channel: userID,
				text: "UserList",
			},
		};

		var postQuestion = await webClient.chat.postMessage(slackMessage);

		res.setHeader("Content-Type", "application/json");
		if (queryResult.rowCount) {
			res.end();
		} else if (queryResult.code == "23505") {
			res.end("This project already exists");
		} else {
			res.end("There was an error adding this project to the project list");
		}
	} catch (e) {
		console.log(e);
	}
});

// process slash command for testing survey
app.post("/deliveryTest", UrlEncoder, async (req, res) => {
	let userID = [{ user_id: req.body.user_id }];
	try {
		sendSurvey(userID);
		res.end();
	} catch (e) {
		console.log(e);
	}
});

// process slash command for signup
app.post("/deleteproject", UrlEncoder, async (req, res) => {
	let insQuery = await formatDelProjectQuery(req.body);
	try {
		let queryResult = await sendQuery(insQuery);

		res.setHeader("Content-Type", "application/json");
		if (queryResult.rowCount) {
			res.end(req.body.text + " Has been deleted from the project list");
		} else if (queryResult.code == "23505") {
			res.end("This project already exists");
		} else {
			res.end("There was an error adding this project to the project list");
		}
	} catch (e) {
		console.log(e);
	}
});

// Build list of projects from Projectsurvey table(slash command)
function buildProjectList(projects) {
	result = [];
	for (i = 0; i < projects.length; i++) {
		let project = {
			type: "plain_text",
			text: projects[i]["projectname"],
			emoji: true,
		};

		result.push(project);
	}
	return result;
}

// build list of users from delivery_users table(slash command)
function buildUserList(users) {
	result = [];
	for (i = 0; i < users.length; i++) {
		let project = {
			type: "plain_text",
			text: users[i]["username"],
			emoji: true,
		};

		result.push(project);
	}
	return result;
}

// Process Block Actions
function processBlockActions(requestPayload, res) {
	let userResponse = requestPayload.actions[0].action_id;
	let surveyQuestion = requestPayload.message.blocks[0].text.text;
	let responseURL = requestPayload.response_url;
	let sendTime = parseFloat(requestPayload.container.message_ts);
	let actionTime = parseFloat(requestPayload.actions[0].action_ts);
	let closeStatus = actionTime - sendTime <= DAY;
	let genericMessage = "How well is your project going?";

	closeSurvey(responseURL, closeStatus);

	if ("Click_1,Click_2,Click_3,Change_Project".includes(userResponse) || surveyQuestion == genericMessage) {
		expandSurvey(requestPayload);
	} else {
		let userID = requestPayload.user.id;
		let rating = JSON.stringify(requestPayload.actions[0].value).slice(1, -1);

		updatePositiveSurvey(userID, rating);
	}
}

// Process submission of popup
///...this will update delivery_users, projects, and projectsurvey
async function processViewSubmission(requestPayload, res) {
	let userID = requestPayload.user.id;
	let userName = await getName(userID);
	if (requestPayload.view.title.text == "Add Project") {
		let projectName = requestPayload.view.state.values.newProject.newProject.value;
		let queryValues = { userID: userID, userName: userName, projectName: projectName };

		// Send queries to update Project, survey, and user tables
		updateProjects(projectName);
		updateProjectSurvey(queryValues);
		updateDeliveryUsers(queryValues);

		res.send();
	} else {
		let currentProject =
			requestPayload.view.state.values.CurrentProject.CurrentProjectActionid.selected_option.value;
		let queryValues = { userID: userID, userName: userName, projectName: currentProject };
		updateDeliveryUsers(queryValues);
		// Add Survey to ProjectSUrvey
		addProjectSurvey(requestPayload);

		// If user selects other send popup to capture new project name
		if (currentProject == "other") {
			res.send(interactiveJson.addProjectView);
		} else {
			res.send();
		}
	}
}

// Close the survey
function closeSurvey(responseURL, surveyStatus) {
	let responseText = surveyStatus ? "Thank You For Your Response!" : "Sorry, this survey has closed.";

	axios
		.post(responseURL, {
			replace_original: "true",
			text: responseText,
		})
		.then((res) => {
			console.log(`Survey Closed\nstatusCode: ${res.statusCode}`);
		})
		.catch((error) => {
			console.error(error);
		});
}

// send survey to user
async function sendSurvey(userID) {
	for (i = 0; i < userID.length; i++) {
		let channelID = userID[i]["user_id"];
		let query = "SELECT current_project FROM delivery_users WHERE user_ID = '" + channelID + "';";

		let projectName = await sendQuery(query);
		projectName = projectName.rows[0].current_project;
		console.log(projectName);
		projectName = projectName == null ? "your project" : projectName;

		let surveyQuestionJson = JSON.stringify(interactiveJson.surveryQuestion).replace("*project", projectName);
		surveyQuestionJson = JSON.parse(surveyQuestionJson);

		const slackMessage = {
			...surveyQuestionJson,
			...{ channel: channelID, text: "Project Survery poll has been posted." },
		};

		webClient.chat.postMessage(slackMessage);
	}
}

// Schedules Messages based on time wanted to send
function scheduleMessages(time, userIdDict, sendSurvey) {
	// get hour and minute from hour:minute param received, ex.: '16:00'
	const hour = Number(time.split(":")[0]);
	const minute = Number(time.split(":")[1]);

	// create a Date object at the desired timepoint
	const startTime = new Date();
	startTime.setHours(hour, minute);
	const now = new Date();

	// increase timepoint by 24 hours if in the past
	if (startTime.getTime() < now.getTime()) {
		startTime.setHours(startTime.getHours() + 24);
	}

	// get the interval in ms from now to the timepoint when to trigger the alarm
	const firstTriggerAfterMs = startTime.getTime() - now.getTime();

	// trigger the function triggerThis() at the timepoint
	// create setInterval when the timepoint is reached to trigger it every day at this timepoint
	setTimeout(function () {
		sendSurvey(userIdDict);
		setInterval(sendSurvey, 24 * 60 * 60 * 1000);
	}, firstTriggerAfterMs);
}

//Function to get real name of the user from slack environment
async function getName(userID) {
	let realName;
	try {
		realName = await webClient.users.info({ user: userID });
		return realName.user.real_name;
	} catch (e) {
		console.log(e);
		return undefined;
	}
}

// Format query to get users
async function formatInsertUserQuery(requestPayload) {
	let userId = requestPayload.user_id;
	let userInfo = await webClient.users.info({ user: userId });
	let userName = userInfo.user.real_name;
	let timeZone = userInfo.user.tz;

	let insQuery =
		"Insert into delivery_users (username,timezone,user_id) values ('" +
		userName +
		"', '" +
		timeZone +
		"', '" +
		userId +
		"')";

	return insQuery;
}

// update delivery users table
function updateDeliveryUsers(requestPayload) {
	let userID = requestPayload.userID;
	let projectName = requestPayload.projectName;
	let updateQuery =
		"UPDATE delivery_users SET current_project = '" + projectName + "' WHERE user_id = '" + userID + "';";
	sendQuery(updateQuery);
}

// Format query to delete project
async function formatDelProjectQuery(requestPayload) {
	let projectName = requestPayload.text;
	let delQuery = "DELETE FROM Projects WHERE projectName='" + projectName + "'";

	return delQuery;
}

// send query to add project to database
function updateProjects(requestPayload) {
	let projectName = requestPayload;
	let insQuery = "Insert into Projects (projectname) values ('" + projectName + "')";
	sendQuery(insQuery);
}

// send query to update project for user
function updateProjectSurvey(requestPayload) {
	let projectName = requestPayload.projectName;
	let userName = requestPayload.userName;
	let insQuery =
		"UPDATE projectsurvey SET projectname = '" +
		projectName +
		"' WHERE username = '" +
		userName +
		"' AND PostedDate = '" +
		shrtDate() +
		"';";

	sendQuery(insQuery);
}

// Function to send query to database
async function sendQuery(queryString) {
	try {
		const client = new Client({
			connectionString: process.env.DATABASE_URL,
			ssl: false,
		});
		client.connect();
		let result = await client.query(queryString);
		client.end();
		return result;
	} catch (e) {
		console.log(e);
		return e;
	}
}

// Add survey to projectSurvey
async function addProjectSurvey(requestPayload) {
	let usrID = requestPayload.user.id;
	let realUserName = await getName(usrID);
	let postedDate = shrtDate();
	let currentProject = requestPayload.view.state.values.CurrentProject.CurrentProjectActionid.selected_option.value;
	let projectRating = requestPayload.view.state.values.ProjectIssueBlock.ProjectIssueAction.selected_option.value;
	let projectComment = requestPayload.view.state.values.ProjectCommentBlock.CommentAction.value;
	let inProject = currentProject == "in_house" ? "Yes" : "No";

	let insQuery =
		"Insert into ProjectSurvey (username,inproject,projectName,rating,Comment,PostedDate,PollDate) values ('" +
		realUserName +
		"', '" +
		inProject +
		"','" +
		currentProject +
		"','" +
		projectRating +
		"','" +
		projectComment +
		"','" +
		postedDate +
		"','" +
		postedDate +
		"')";

	sendQuery(insQuery);
}

// update survey without comments(positive submission)
async function updatePositiveSurvey(userId, rating) {
	let userQuery = "SELECT * FROM delivery_users WHERE user_id='" + userId + "';";
	let queryResult = await sendQuery(userQuery);
	let currentProject = queryResult.rows[0].current_project;
	let userName = queryResult.rows[0].username;
	let postedDate = shrtDate();
	let projectComment = "N/A";
	let inProject = currentProject == "in_house" ? "Yes" : "No";

	let insQuery =
		"Insert into ProjectSurvey (username,inproject,projectName,rating,Comment,PostedDate,PollDate) values ('" +
		userName +
		"', '" +
		inProject +
		"','" +
		currentProject +
		"','" +
		rating +
		"','" +
		projectComment +
		"','" +
		postedDate +
		"','" +
		postedDate +
		"')";

	sendQuery(insQuery);
}

//Function to build the date
function shrtDate() {
	let Today = new Date();
	let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	let day = Today.getDate();
	let monthIndex = Today.getMonth();
	let monthName = monthNames[monthIndex];
	let year = Today.getFullYear();

	return `${day}-${monthName}-${year}`;
}

// open up survey modal
async function expandSurvey(requestPayload) {
	try {
		let projectList = await getProjectList();
		console.log(projectList);
		webClient.views.open({
			trigger_id: requestPayload.trigger_id,
			view: JSON.stringify(interactiveJson.surveyModal).replace(/"withNew"/, projectList),
		});
	} catch (e) {
		console.log("Error: " + e);
	}
}

//Retrieve Project list for survey drop down
async function getProjectList() {
	let projectList = "";
	let insQuery = "SELECT projectname from projects;";
	try {
		queryResult = await sendQuery(insQuery);
		projects = queryResult;
		let i = 0;
		for (let row of queryResult.rows) {
			if (i == 0) {
				//Building the JSON. This will list the Projectlists in dropdown.
				projectList =
					"{" +
					projectList +
					'"text":{"type": "plain_text", "text": "' +
					String(row.projectname) +
					'"},"value": "' +
					String(row.projectname) +
					'"}';
			} else {
				//Building the JSON. This will list the Projectlists in dropdown.
				projectList =
					projectList +
					',{"text":{"type": "plain_text", "text": "' +
					String(row.projectname) +
					'"},"value": "' +
					String(row.projectname) +
					'"}';
			}
			i++;
		}
	} catch (e) {
		console.log(e);
	}
	return projectList;
}

// Get local time
function getLocalHour(timezone) {
	//*******This is where the local time will be set to send the survey******
	let gtcTime = moment.tz("2020-03-01 10:04", timezone); // Set survey Time Here
	let localTime = moment(gtcTime).local(); // Output will look like this : 2020-03-01T06:00:00-08:00
	let sendTime = localTime.format().split("T")[1].split("-")[0];
	return sendTime;
}

// start slack bot
async function startSlackBot() {
	try {
		// get all users from delivery_users db
		let dbResult = await sendQuery("SELECT * FROM delivery_users");
		let usersByTZ = {};
		// Place all users in a dictionary of arrays sorted by timezone
		for (i = 0; i < dbResult.rows.length; i++) {
			let timezone = dbResult.rows[i].timezone;
			if (!usersByTZ[timezone]) {
				usersByTZ[timezone] = [];
			}
			usersByTZ[timezone].push(dbResult.rows[i]);
		}
		// schedule messages to be sent for users in each timezone
		for (const key in usersByTZ) {
			sendTime = getLocalHour(key);
			scheduleMessages(sendTime, usersByTZ[key], sendSurvey);
		}
	} catch (error) {
		console.error(error);
	}
}

startSlackBot();
