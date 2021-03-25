exports.surveyModal = {
	type: "modal",
	callback_id: "Survey_Modal_Block",
	title: {
		type: "plain_text",
		text: "Project Feedback",
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
				text: "We'd love to hear from you.",
				emoji: true,
			},
		},
		{
			type: "divider",
		},
		{
			type: "input",
			block_id: "CurrentProject",
			element: {
				type: "static_select",
				action_id: "CurrentProjectActionid",
				placeholder: {
					type: "plain_text",
					text: "Select a Project",
					emoji: true,
				},
				options: [
					{
						text: {
							type: "plain_text",
							text: "In-House Project",
						},
						value: "in_house",
					},
					"withNew",
					{
						text: {
							type: "plain_text",
							text: "Other/Project Not Listed Here",
						},
						value: "other",
					},
				],
			},
			label: {
				type: "plain_text",
				text: "Please Select your project.",
				emoji: true,
			},
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
							text: "1 (Serious Issues...)",
							emoji: true,
						},
						value: "1",
					},
					{
						text: {
							type: "plain_text",
							text: "2",
							emoji: true,
						},
						value: "2",
					},
					{
						text: {
							type: "plain_text",
							text: "3",
							emoji: true,
						},
						value: "3",
					},
					{
						text: {
							type: "plain_text",
							text: "4",
							emoji: true,
						},
						value: "4",
					},
					{
						text: {
							type: "plain_text",
							text: "5 (Going Great!)",
							emoji: true,
						},
						value: "5",
					},
				],
			},
			label: {
				type: "plain_text",
				text: "How would you rate the status of your current project.",
				emoji: true,
			},
		},
		{
			type: "input",
			block_id: "ProjectCommentBlock",
			label: {
				type: "plain_text",
				text: "Please provide feedback.",
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

exports.test = {
	blocks: [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "*Time for Quick Feedaback*",
			},
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "Do you foresee any potential risk or issues in the project?",
			},
			accessory: {
				type: "image",
				image_url: "https://api.slack.com/img/blocks/bkb_template_images/approvalsNewDevice.png",
				alt_text: "computer thumbnail",
			},
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						emoji: true,
						text: "Approve",
					},
					style: "primary",
					value: "click_me_123",
				},
				{
					type: "button",
					text: {
						type: "plain_text",
						emoji: true,
						text: "Deny",
					},
					style: "danger",
					value: "click_me_123",
				},
			],
		},
	],
};

exports.addProjectView = {
	response_action: "update",
	view: {
		type: "modal",
		title: {
			type: "plain_text",
			text: "Add Project",
		},
		submit: {
			type: "plain_text",
			text: "Submit",
			emoji: true,
		},
		blocks: [
			{
				type: "input",
				block_id: "newProject",
				label: {
					type: "plain_text",
					text: "What is the name of your new project.",
					emoji: true,
				},
				element: {
					type: "plain_text_input",
					action_id: "newProject",
					multiline: true,
				},
				optional: true,
			},
		],
	},
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
			type: "divider",
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					action_id: "Click_1",
					text: {
						type: "plain_text",
						text: "1 (Serious Issues)",
						emoji: true,
					},
					style: "primary",
					value: "click_me_1",
				},
				{
					type: "button",
					action_id: "Click_2",
					text: {
						type: "plain_text",
						text: "2",
						emoji: true,
					},
					style: "primary",
					value: "click_me_2",
				},
				{
					type: "button",
					action_id: "Click_3",
					text: {
						type: "plain_text",
						text: "3",
						emoji: true,
					},
					style: "primary",
					value: "click_me_3",
				},
				{
					type: "button",
					action_id: "Click_4",
					text: {
						type: "plain_text",
						text: "4",
						emoji: true,
					},
					style: "primary",
					value: "4",
				},
				{
					type: "button",
					action_id: "Click_5",
					text: {
						type: "plain_text",
						text: "5 (Awesome!)",
						emoji: true,
					},
					style: "primary",
					value: "5",
				},
			],
		},
		{
			type: "divider",
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "If you are working on something new click here to add/change your current project",
			},
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					action_id: "Change_Project",
					text: {
						type: "plain_text",
						text: "Change/Add Project",
						emoji: true,
					},
					style: "primary",
					value: "Change_Project",
				},
			],
		},
	],
};

exports.negativeModal = {
	type: "modal",
	callback_id: "Negative_Modal_Block",
	title: {
		type: "plain_text",
		text: "Project Feedback",
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
				text: "We'd love to hear from you.",
				emoji: true,
			},
		},
		{
			type: "divider",
		},
		{
			type: "input",
			block_id: "ProjectCommentBlock",
			label: {
				type: "plain_text",
				text: "Give your comments about other project:",
				emoji: true,
			},
			element: {
				type: "plain_text_input",
				action_id: "CommentAction",
				multiline: true,
			},
		},
	],
};

exports.projectList = {
	blocks: [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: "Current Delivery Health Projects",
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

exports.userList = {
	blocks: [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: "Current Delivery Health Users",
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
