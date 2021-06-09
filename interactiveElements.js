exports.surveyModal = {
	type: "modal",
	callback_id: "*surveyURL",
	title: {
		type: "plain_text",
		text: "Project Health Checkup!",
		emoji: true,
	},
	submit: {
		type: "plain_text",
		text: "Submit",
		emoji: true,
	},
	close: {
		type: "plain_text",
		text: "Cancel",
		emoji: true,
	},
	blocks: [
		{
			type: "section",
			text: {
				type: "plain_text",
				text: "We'd love to hear comments from you on *project.",
				emoji: true,
			},
		},
		{
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: "Please rate your assigned project on the following scale.\n1. Serious issues that need immediate help\n2. Could be better, project timeline and deliverables are at risk\n3. Going well, no complaints from the customer but not a lot of enthusiasm so far\n4. We’re on schedule and the customer is happy\n5. Ahead of schedule and the customer is already asking us what else can be done with UiPath",
				},
			],
		},
		{
			type: "divider",
		},
		{
			type: "input",
			block_id: "ProjectIssueBlock",
			element: {
				type: "static_select",
				action_id: "ProjectIssueAction",
				placeholder: {
					type: "plain_text",
					text: "Rate your project status",
					emoji: true,
				},
				options: [
					{
						text: {
							type: "plain_text",
							text: "1",
							emoji: true,
						},
						value: "*project_1",
					},
					{
						text: {
							type: "plain_text",
							text: "2",
							emoji: true,
						},
						value: "*project_2",
					},
					{
						text: {
							type: "plain_text",
							text: "3",
							emoji: true,
						},
						value: "*project_3",
					},
					{
						text: {
							type: "plain_text",
							text: "4",
							emoji: true,
						},
						value: "*project_4",
					},
					{
						text: {
							type: "plain_text",
							text: "5",
							emoji: true,
						},
						value: "*project_5",
					},
				],
				initial_option: {
					value: "*initialValue",
					text: {
						type: "plain_text",
						text: "*initialText",
						emoji: true,
					},
				},
			},
			optional: false,
			label: {
				type: "plain_text",
				text: "How would you rate the status of *project?",
				emoji: true,
			},
		},
		{
			type: "input",
			block_id: "ProjectCommentBlock",
			label: {
				type: "plain_text",
				text: "Please provide feedback for *project.",
				emoji: true,
			},
			element: {
				type: "plain_text_input",
				action_id: "CommentAction",
				multiline: true,
			},
			optional: false,
		},
	],
};

exports.surveyModalDefault = {
	type: "modal",
	callback_id: "*surveyURL",
	title: {
		type: "plain_text",
		text: "Project Health Checkup!",
		emoji: true,
	},
	submit: {
		type: "plain_text",
		text: "Submit",
		emoji: true,
	},
	close: {
		type: "plain_text",
		text: "Cancel",
		emoji: true,
	},
	blocks: [
		{
			type: "section",
			text: {
				type: "plain_text",
				text: "We'd love to hear comments from you on *project.",
				emoji: true,
			},
		},
		{
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: "Please rate your assigned project on the following scale.\n1. Serious issues that need immediate help\n2. Could be better, project timeline and deliverables are at risk\n3. Going well, no complaints from the customer but not a lot of enthusiasm so far\n4. We’re on schedule and the customer is happy\n5. Ahead of schedule and the customer is already asking us what else can be done with UiPath",
				},
			],
		},
		{
			type: "divider",
		},
		{
			type: "input",
			block_id: "ProjectIssueBlock",
			element: {
				type: "static_select",
				action_id: "ProjectIssueAction",
				placeholder: {
					type: "plain_text",
					text: "Rate your project status",
					emoji: true,
				},
				options: [
					{
						text: {
							type: "plain_text",
							text: "1",
							emoji: true,
						},
						value: "*project_1",
					},
					{
						text: {
							type: "plain_text",
							text: "2",
							emoji: true,
						},
						value: "*project_2",
					},
					{
						text: {
							type: "plain_text",
							text: "3",
							emoji: true,
						},
						value: "*project_3",
					},
					{
						text: {
							type: "plain_text",
							text: "4",
							emoji: true,
						},
						value: "*project_4",
					},
					{
						text: {
							type: "plain_text",
							text: "5",
							emoji: true,
						},
						value: "*project_5",
					},
				],
			},
			optional: false,
			label: {
				type: "plain_text",
				text: "How would you rate the status of *project?",
				emoji: true,
			},
		},
		{
			type: "input",
			block_id: "ProjectCommentBlock",
			label: {
				type: "plain_text",
				text: "Please provide feedback for *project.",
				emoji: true,
			},
			element: {
				type: "plain_text_input",
				action_id: "CommentAction",
				multiline: true,
			},
			optional: false,
		},
	],
};

exports.surveyHeader = {
	blocks: [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: "Project Health Checkup!",
			},
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					action_id: "outofoffice",
					text: {
						type: "plain_text",
						text: "Update Out Of Office",
						emoji: true
					},
					style: "primary",
					value: "outofoffice"
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Remove Out Of Office",
						emoji: true
					},
					value: "removeooo",
					action_id: "removeooo",
					style: "danger"
				},
				{
					type: "button",
					action_id: "timezone",
					text: {
						type: "plain_text",
						text: "Sync Timezone",
						emoji: true
					},
					style: "primary",
					value: "timezone"
				},
			]
		},
		{
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: "Please rate your assigned projects on the following scale. Anything a 3 or below will prompt for comments.\n1. Serious issues that need immediate help\n2. Could be better, project timeline and deliverables are at risk\n3. Going well, no complaints from the customer but not a lot of enthusiasm so far\n4. We’re on schedule and the customer is happy\n5. Ahead of schedule and the customer is already asking us what else can be done with UiPath",
				},
			]
		},
		{
			type: "divider",
		},
	],
};

exports.surveyHeaderOOO = {
	blocks: [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: "Project Health Checkup!",
			},
		},
		{
			type: "section",
			text: {
					type: "plain_text",
					text: "You are currently out of office from *outofofficeStart to *outofofficeEnd",
					emoji: true
				},
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					action_id: "outofoffice",
					text: {
						type: "plain_text",
						text: "Update Out Of Office",
						emoji: true
					},
					style: "primary",
					value: "outofoffice"
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Remove Out Of Office",
						emoji: true
					},
					value: "removeooo",
					action_id: "removeooo",
					style: "danger"
				},
				{
					type: "button",
					action_id: "timezone",
					text: {
						type: "plain_text",
						text: "Sync Timezone",
						emoji: true
					},
					style: "primary",
					value: "timezone"
				},
			]
		},
		{
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: "Please rate your assigned projects on the following scale. Anything a 3 or below will prompt for comments.\n1. Serious issues that need immediate help\n2. Could be better, project timeline and deliverables are at risk\n3. Going well, no complaints from the customer but not a lot of enthusiasm so far\n4. We’re on schedule and the customer is happy\n5. Ahead of schedule and the customer is already asking us what else can be done with UiPath",
				},
			]
		},
		{
			type: "divider",
		},
	],
};

exports.surveryQuestion = {
	blocks: [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: "How well is *project going?",
			},
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					action_id: "click1",
					text: {
						type: "plain_text",
						text: "1",
						emoji: true,
					},
					style: "primary",
					value: "*projectID",
				},
				{
					type: "button",
					action_id: "click2",
					text: {
						type: "plain_text",
						text: "2",
						emoji: true,
					},
					style: "primary",
					value: "*projectID",
				},
				{
					type: "button",
					action_id: "click3",
					text: {
						type: "plain_text",
						text: "3",
						emoji: true,
					},
					style: "primary",
					value: "*projectID",
				},
				{
					type: "button",
					action_id: "click4",
					text: {
						type: "plain_text",
						text: "4",
						emoji: true,
					},
					style: "primary",
					value: "*projectID",
				},
				{
					type: "button",
					action_id: "click5",
					text: {
						type: "plain_text",
						text: "5",
						emoji: true,
					},
					style: "primary",
					value: "*projectID",
				},
				{
					type: "button",
					action_id: "comments6",
					text: {
						type: "plain_text",
						text: "Enter Comments and Rating",
						emoji: true,
					},
					style: "primary",
					value: "*projectID",
				},
			],
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					action_id: "Remove_Project",
					text: {
						type: "plain_text",
						text: "Remove Project",
						emoji: true
					},
					style: "danger",
					value: "*projectID"
				}
			]
		},
		{
			type: "divider",
		},
	],
};

exports.surveryQuestionResubmit = {
	blocks: [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: "How well is *project going?"
			}
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					action_id: "click1",
					text: {
						type: "plain_text",
						text: "1",
						emoji: true
					},
					style: "primary",
					value: "*projectID"
				},
				{
					type: "button",
					action_id: "click2",
					text: {
						type: "plain_text",
						text: "2",
						emoji: true
					},
					style: "primary",
					value: "*projectID"
				},
				{
					type: "button",
					action_id: "click3",
					text: {
						type: "plain_text",
						text: "3",
						emoji: true
					},
					style: "primary",
					value: "*projectID"
				},
				{
					type: "button",
					action_id: "click4",
					text: {
						type: "plain_text",
						text: "4",
						emoji: true
					},
					style: "primary",
					value: "*projectID"
				},
				{
					type: "button",
					action_id: "click5",
					text: {
						type: "plain_text",
						text: "5",
						emoji: true
					},
					style: "primary",
					value: "*projectID"
				},
				{
					type: "button",
					action_id: "comments6",
					text: {
						type: "plain_text",
						text: "Enter Comments and Rating",
						emoji: true
					},
					style: "primary",
					value: "*projectID"
				}
			]
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "*_You last submitted the following for this project:_*\n *Rating*: *ProjectRating \t*Comment*: *ProjectComment"
			}
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					action_id: "Resubmit_Last",
					text: {
						type: "plain_text",
						text: "Resubmit Last Status",
						emoji: true
					},
					value: "*projectID"
				},
				{
					type: "button",
					action_id: "Remove_Project",
					text: {
						type: "plain_text",
						text: "Remove Project",
						emoji: true
					},
					style: "danger",
					value: "*projectID"
				}
			]
		},
		{
			type: "divider"
		}
	]
};

exports.projectList = {
	blocks: [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: "titleHere",
				emoji: true,
			},
		},
		{
			type: "divider",
		},
		{
			type: "section",
			fields: "projectList",
		},
	],
};

exports.surveryRequestsHeader = {
	blocks: [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: "Latest *x Surveys for *project!",
			},
		},
	],
};

exports.surveyList = {
	"blocks": [
		{
			type: "divider",
		},
		{
			"type": "section",
			"fields": [
				{
					"type": "mrkdwn",
					"text": "*User:*\n&username"
				},
				{
					"type": "mrkdwn",
					"text": "*Time Submitted:*\n&date"
				}
			]
		},
		{
			"type": "section",
			"fields": [
				{
					"type": "mrkdwn",
					"text": "*Rating:*\n&rating"
				},
			]
		},
		{
			"type": "section",
			"text": 
				{
					"type": "mrkdwn",
					"text": "*Comment:*\n&comment"
				}
			
		},
	]
};

exports.userList = {
	blocks: [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: "titleHere",
				emoji: true,
			},
		},
		{
			type: "divider",
		},
		{
			type: "section",
			fields: "userList",
		},
	],
};

exports.oooModal = {
	type: "modal",
	title: {
		type: "plain_text",
		text: "Project Health Checkup!",
		emoji: true,
	},
	submit: {
		type: "plain_text",
		text: "Submit Out Of Office",
		emoji: true,
	},
	close: {
		type: "plain_text",
		text: "Close",
		emoji: true,
	},
	blocks: [
		{
			type: "section",
			text: {
				type: "plain_text",
				text: "Please update your Out of Office schedule :palm_tree:",
				emoji: true,
			},
		},
		{
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: "Input the date range you'll be out of office below, press submit, and Project Health Checkup won't ping you on those days.\n\nIf you're only out of office one day, please submit the same start and end date.\n\n",
				},
			],
		},
		{
			type: "divider",
		},
		{
			type: "section",
			block_id: "startDateBlock",
			text: {
				type: "mrkdwn",
				text: "Pick the first day you are OOO."
			},
			accessory: {
				type: "datepicker",
				initial_date: "*initialStartDate",
				placeholder: {
					type: "plain_text",
					text: "Select a date",
					emoji: true
				},
				action_id: "OOOStartAction"
			}
		},
		{
			type: "section",
			block_id: "endDateBlock",
			text: {
				type: "mrkdwn",
				text: "Pick the last day you are OOO."
			},
			accessory: {
				type: "datepicker",
				initial_date: "*initialEndDate",
				placeholder: {
					type: "plain_text",
					text: "Select a date",
					emoji: true
				},
				action_id: "OOOEndAction"
			}
		},
	],
};