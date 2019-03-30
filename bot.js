const Discord = require("discord.js");
const fetch = require('node-fetch');
const ytdl = require("ytdl-core");
var youtube = require('./youtube.js');
var request = require('superagent');
var ffmpeg = require('ffmpeg');
var opus = require('opusscript');
var fetchVideoInfo = require('youtube-info');
const client = new Discord.Client();
const talkedRecently = new Set();

var server;
var owner;
var membercount;
var user;
var servername;
var thing;
var voiceChannel = null;
var dispatcher = null;
var userinserver = null;

var servers = {};
var playinglist = ["with bubbles", "with Patrick", "the song - Where's Gary?"];

const connection = require('mysql').createConnection({
    host: 'remotemysql.com',
    user: 'ogILbLFhJA',
    password: 'Yam9BLYwFi',
    insecureAuth: true,
    database: 'ogILbLFhJA'
});
connection.connect(function (err) {    if (err) throw err; });

client.on("ready", () => {
	console.log("I am ready!");
	client.user.setActivity(playinglist.shift());
	
	setInterval(() => {
		if(playinglist[0] == null){
			playinglist.unshift("with bubbles");
			playinglist.unshift("with Patrick");
			playinglist.unshift("the song - Where's Gary?");
		}else{
			client.user.setActivity(playinglist.shift());
		}
		
	}, 600000);
	
});

client.on("message", async message => {
	var enable;
	var messageParts = message.content.split(' ');
	var parameters = messageParts.splice(1, messageParts.length);
	if(!servers[message.guild.id]) servers[message.guild.id] = {
		queue: [],
		videodescription: [],
        videolength: [],
        videotitle: [],
        videothumbnailUrl: [],
        videourl: []
	};
	var server = servers[message.guild.id];
	if(message.author.username != "FuhrerBot"){
		connection.query("SELECT * FROM servers WHERE serverid = '" + message.guild.id + "'", function (err, result, fields){
			if(err) throw err;
			if(result.length){
				enable = result[0].toggled;
				//commands only admins can use
				if(message.member.hasPermission("ADMINISTRATOR")){
					toggle(message, enable);
					displaycmds(message);
					poll(message, enable);
				}
				
				//commands that are ran by the server
				getUsers(message);
				checkServerTable(message);
				updateServerTable(message, result[0].xp);
				
				handleUserLevelSystem(message);
				
				
				//commands that everyone can use
				displayServerLevel(message, result[0].serverrank);
				displayServerXP(message, result[0].xp, enable);
				rank(message, enable);
				cat(message, enable);
				pizzatime(message, enable);
				dankmeme(message, enable);
				PlayCommand(message, server, enable);
				PlayQueueCommand(message, server, enable);
				SkipSong(message, server);
				f(message, enable);
				LeaveChat(message, server);
				getChannelFromUser(message);
				nsfw(message, enable);
				hentai(message, enable);
			}else{
				checkServerTable(message);
			}
		});
	}
});

//gets channel from user requesting bot
function getChannelFromUser(message){
	var author = message.member.voiceChannelID;
	if(author != null){
		return author;
	}else{
		
	}
}

//plays audio based on results from youtube search
function PlayCommand(message, server, enabled) {
	if(message.isMentioned(client.user) && message.content.includes(" play") && message.author != "FuhrerBot" && enabled == 1){
		var x = message.content.lastIndexOf(' play ');
		var result = message.content.substring(x + 6);
		var defaultVoiceChannel = client.channels.find(val => val.type === 'voice').name;
		var defaultChannel = getChannelFromUser(message);
		var channelName = client.channels.get(defaultChannel).name;
		var voiceChannel = GetChannelByName(channelName);
		if (voiceChannel) {
			voiceChannel.join().then(function(connection){
				youtube.search(result, QueueYtAudioStream, server, connection, message);
			});
		}
	}
}

//lists out all music queued to play
function PlayQueueCommand(message, server, enabled) {
	if(message.isMentioned(client.user) && message.content.includes(" queue") && message.author != "FuhrerBot" && enabled == 1){
		var queueString = "";

		for(var x = 0; x < server.queue.length; x++) {
			queueString += server.queue[x].videoName + ", ";
		}

		queueString = queueString.substring(0, queueString.length - 2);
		message.reply(queueString);
	}
}

//kicks the bot out of the voice chat
function LeaveChat(message, server){
	if(message.isMentioned(client.user) && message.content.includes(" leave") && message.author != "FuhrerBot"){
		if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
	}
}

//this skips the song
function SkipSong(message, server){
	if(message.isMentioned(client.user) && message.content.includes(" skip") && message.author != "FuhrerBot"){
		if(server.dispatcher) server.dispatcher.end();
	}
}

//returns the channel that matches the name provided
function GetChannelByName(name, server) {
    var channel = client.channels.find(val => val.name === name);
    return channel;
}

//Queues result of Youtube search into stream
function QueueYtAudioStream(videoId, videoName, server, connection, message) {
    var streamUrl = `${youtube.watchVideoUrl}${videoId}`;

	fetchVideoInfo(videoId, function (err, videoInfo) {
		if (err) throw new Error(err);
		message.reply(' The song: **' + videoInfo.title + "** has been added to the queue list.");
	
		if (!server.queue.length) {
			server.queue.push(
				{
					'streamUrl': streamUrl,
					'videoName': videoName
				}
        );
		
			server.videolength.push(videoInfo.duration);//integer
			server.videothumbnailUrl.push(videoInfo.thumbnailUrl);
			server.videourl.push(videoInfo.url);
			server.videotitle.push(videoInfo.title);
			server.videodescription.push(videoInfo.description);
			
			console.log("Queued audio " + videoName);
			PlayStream(server.queue[0].streamUrl, server, connection, message);
		}else{
			server.queue.push(
				{
					'streamUrl': streamUrl,
					'videoName': videoName,
					'videoThumbnail': videoThumbnail
				}
			);
			console.log("Queued audio " + videoName);
			
			server.videolength.push(videoInfo.duration);//integer
			server.videothumbnailUrl.push(videoInfo.thumbnailUrl);
			server.videourl.push(videoInfo.url);
			server.videotitle.push(videoInfo.title);
			server.videodescription.push(videoInfo.description);
			
			message.reply("Queued audio " + videoName);
		}
	});
        
}

//Plays a given stream
function PlayStream(streamUrl, server, connection, message) {
    const streamOptions = {seek: 0, volume: 1};
    if (streamUrl) {
        const stream = ytdl(streamUrl, {filter: 'audioonly'});
		console.log("Now checking for a null dispatcher");
		
        if (!server.dispatcher) {
                server.dispatcher = connection.playStream(stream, streamOptions);
				
				const embed = new Discord.RichEmbed()
				.setTitle(server.videotitle[0])
				.setColor(0x00AE86)
				.setImage(server.videothumbnailUrl[0])
				.setTimestamp()
				.setURL(server.videourl[0]);
				
				message.channel.send("Now playing **" + server.videotitle[0] + "**");
				message.channel.send({embed});
				
				server.queue.shift();
				
				server.videolength.shift();
				server.videothumbnailUrl.shift();
				server.videourl.shift();
				server.videotitle.shift();
				server.videodescription.shift();
			
                server.dispatcher.on('end', () => {
					server.dispatcher = null;
                    if(server.queue[0]) PlayStream(server.queue[0].streamUrl, server, connection, message);
					else connection.disconnect();
                });

                server.dispatcher.on('error', (err) => {
                    console.log(err);
                });
        }
    }
}

//this gets a cat from amazon's cat api and sends it to the channel
async function cat(message, enabled){
	try{
		if(message.isMentioned(client.user) && message.content.includes(" cat") && message.author != "FuhrerBot" && enabled == 1){
			const body = await fetch('https://www.reddit.com/r/catpictures.json?sort=top&t=week').then(response => response.json());
			const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
			
			if (!allowed.length) return message.channel.send('It seems we are out of pizza, Try again later.');
			const randomnumber = Math.floor(Math.random() * allowed.length)
			const embed = new Discord.RichEmbed()
			.setColor(0x00A2E8)
			.setTitle(allowed[randomnumber].data.title)
			.setDescription("Posted by: " + allowed[randomnumber].data.author)
			.setImage(allowed[randomnumber].data.url)
			.addField("Other info:", "Up votes: " + allowed[randomnumber].data.ups + " / Comments: " + allowed[randomnumber].data.num_comments)
			.setFooter("Cats")
			message.channel.send(embed)
		}
	} catch(err){
		return console.log(err);
	}
}

//prints a meme from the /r/dankmeme subreddit
async function dankmeme(message, enabled){
	try{
		if(message.isMentioned(client.user) && message.content.includes(" meme") && message.author != "FuhrerBot" && enabled == 1){
			const body = await fetch('https://www.reddit.com/r/DankMemes.json?sort=top&t=week').then(response => response.json());
			const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
			
			if (!allowed.length) return message.channel.send('It seems we are out of pizza, Try again later.');
			const randomnumber = Math.floor(Math.random() * allowed.length)
			const embed = new Discord.RichEmbed()
			.setColor(0x00A2E8)
			.setTitle(allowed[randomnumber].data.title)
			.setDescription("Posted by: " + allowed[randomnumber].data.author)
			.setImage(allowed[randomnumber].data.url)
			.addField("Other info:", "Up votes: " + allowed[randomnumber].data.ups + " / Comments: " + allowed[randomnumber].data.num_comments)
			.setFooter("Dank Meme")
			message.channel.send(embed)
		}
	} catch(err) {
		return console.log(err);
	}
}

//prints some nsfw stuff
async function nsfw(message, enabled){
	try{
		if(message.isMentioned(client.user) && message.content.includes(" nsfw") && message.author != "FuhrerBot" && enabled == 1){
			const body = await fetch('https://www.reddit.com/r/nsfw.json?sort=top&t=week').then(response => response.json());
			const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
			
			if (!allowed.length) return message.channel.send('It seems we are out of pizza, Try again later.');
			const randomnumber = Math.floor(Math.random() * allowed.length)
			const embed = new Discord.RichEmbed()
			.setColor(0x00A2E8)
			.setTitle(allowed[randomnumber].data.title)
			.setDescription("Posted by: " + allowed[randomnumber].data.author)
			.setImage(allowed[randomnumber].data.url)
			.addField("Other info:", "Up votes: " + allowed[randomnumber].data.ups + " / Comments: " + allowed[randomnumber].data.num_comments)
			.setFooter("Dank Meme")
			message.channel.send(embed)
		}
	} catch(err) {
		return console.log(err);
	}
}

//prints out hentai
async function hentai(message, enabled){
	try{
		if(message.isMentioned(client.user) && message.content.includes(" hentai") && message.author != "FuhrerBot" && enabled == 1){
			const body = await fetch('https://www.reddit.com/r/hentai.json?sort=top&t=week').then(response => response.json());
			const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
			
			if (!allowed.length) return message.channel.send('It seems we are out of pizza, Try again later.');
			const randomnumber = Math.floor(Math.random() * allowed.length)
			const embed = new Discord.RichEmbed()
			.setColor(0x00A2E8)
			.setTitle(allowed[randomnumber].data.title)
			.setDescription("Posted by: " + allowed[randomnumber].data.author)
			.setImage(allowed[randomnumber].data.url)
			.addField("Other info:", "Up votes: " + allowed[randomnumber].data.ups + " / Comments: " + allowed[randomnumber].data.num_comments)
			.setFooter("Dank Meme")
			message.channel.send(embed)
		}
	} catch(err) {
		return console.log(err);
	}
}

//prints pizza time
async function pizzatime(message, enabled){
	try{
		if(message.isMentioned(client.user) && message.content.includes(" pizzatime") && message.author != "FuhrerBot" && enabled == 1){
			const body = await fetch('https://www.reddit.com/r/PizzaTime.json?sort=top&t=week').then(response => response.json());
			const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
			
			if (!allowed.length) return message.channel.send('It seems we are out of pizza, Try again later.');
			const randomnumber = Math.floor(Math.random() * allowed.length)
			const embed = new Discord.RichEmbed()
			.setColor(0x00A2E8)
			.setTitle(allowed[randomnumber].data.title)
			.setDescription("Posted by: " + allowed[randomnumber].data.author)
			.setImage(allowed[randomnumber].data.url)
			.addField("Other info:", "Up votes: " + allowed[randomnumber].data.ups + " / Comments: " + allowed[randomnumber].data.num_comments)
			.setFooter("Pizzatime")
			message.channel.send(embed)
		}
	} catch(err) {
		return console.log(err);
	}
}

//this will get the author of a message and give him xp with a 6 second cooldown
function giveAuthorXP(message){
	if(message.author != "FuhrerBot"){
		setTimeout(() => {
			var userid = message.author.id;
			var serverid = message.guild.id;
			var xp;
			var sql = "SELECT * FROM users WHERE userid = '" + userid + "' AND serverid = '" + serverid + "'";
			connection.query(sql, function (err, result){ 
				if (err) throw err;
				var xp = (Number(result[0].xp) + 30);
				var sql2 = "UPDATE users SET xp = '" + xp + "' WHERE userid = '" + userid + "' AND serverid = '" + serverid + "'";
				connection.query(sql2, function (err2, result) { if (err2) throw err2; });
			});
		}, 12000);
	}
}

//handles both of the level systems
function handleUserLevelSystem(message){
	giveAuthorXP(message);
	handleAuthorLevels(message);
}

//handles levels
function handleAuthorLevels(message){
	var userid = message.author.id;
	var serverid = message.guild.id;
	var xp;
	var sql = "SELECT * FROM users WHERE userid = '" + userid + "' AND serverid = '" + serverid + "'";
	connection.query(sql, function (err, result){ 
		if (err) throw err;
		if(result.length){
			if(message.author.username != "FuhrerBot"){
				xp = result[0].xp;
				if(xp >= 600){
					var level = (Number(result[0].level) + 1);
					xp = 0;
					if(enabled == 1){
						message.channel.send("Wow " + message.author.username + " you are now level " + level);
					}
					var sql3 = "UPDATE users SET level = " + level + ", xp = " + xp + " WHERE userid = " + userid + " AND serverid = " + serverid;
					connection.query(sql3, function (err3, result) { if (err3) throw err3; });
				}
			}
		}else{
			getUsers(message);
		}
	});
}

//bot says "f" 
function f(message, enabled){
	if(message.isMentioned(client.user) && message.content.includes(" can we get an f") && message.author != "FuhrerBot" && enabled == 1){
		message.reply("f");
	}
}

//displays user rank
function rank(message, enabled){
	if(message.isMentioned(client.user) && message.content.includes(" rank") && message.author != "FuhrerBot" && enabled == 1){
		var userid = message.author.id;
		var serverid = message.guild.id;
		var sql = "SELECT * FROM users WHERE userid = '" + userid + "' AND serverid = '" + serverid + "'";
		connection.query(sql, function (err, result){ 
			if (err) throw err;
			message.channel.send({embed: {
				color: 3447003,
				author: {
					name: message.author.username,
					icon_url: message.author.avatarURL
				},
				title: "Stats",
				fields: [
				{
					name: "Level",
					value: "You are level " + result[0].level
				},
				{
					name: "XP",
					value: "You have " + result[0].xp + "xp"
				}
				],
				timestamp: new Date(),
				footer: {
					icon_url: client.user.avatarURL,
					text: "© Rank"
				}
			}
			});
		});
	}
}

//this gets all the users, and then sets them up for being written into the db
function getUsers(message){
	var serverid = message.guild.id;
	const list = client.guilds.get(serverid);
    list.members.forEach(member => writeToUserTable(message, member.user.id, serverid));
}

//this takes all the users from getUsers() and then puts them into the db
function writeToUserTable(message, userid, serverid){
	var sql1 = "SELECT * FROM users WHERE serverid = " + "'" + serverid + "' AND userid = '" + userid + "'";
	if(message.author.username != "FuhrerBot"){
		connection.query(sql1, function (err, result){ 
			if (err) throw err;
			if(!result.length){
				var sql2 = "INSERT INTO users (userid, serverid) VALUES (" + "'" + userid + "'" + "," + "'" + serverid + "')";
				connection.query(sql2, function (err2, result) { if (err2) throw err2; });
			}
		});
	}
}

//command that lets you toggle the bot
function toggle(message, enabled){
	server = message.guild.id;
	if (message.content.includes("toggle") && message.isMentioned(client.user)) {
		if(enabled == 1){
			message.channel.send("disabled");
			toggle = 0;
			var sql = "UPDATE servers SET toggled = " + toggle + " WHERE serverid = " + server;
			connection.query(sql, function (err, result) { if (err) throw err; });
		}else{
			message.channel.send("enabled");
			toggle = 1;
			var sql = "UPDATE servers SET toggled = " + toggle + " WHERE serverid = " + server;
			connection.query(sql, function (err, result) { if (err) throw err; });
		}
	}
}

//command that creates a poll for people
function poll(message, enabled){
	if(enabled == 1){
		if(message.isMentioned(client.user) && message.content.includes("poll")){
			var x = message.content.lastIndexOf(' poll ');
			var result = message.content.substring(x + 6);
			message.channel.send('@everyone');
			message.channel.send({embed: {
				color: 3447003,
				author: {
					name: client.user.username,
					icon_url: client.user.avatarURL
				},
				title: "Poll",
				description: result,
				fields: [
					{
						name: "\:white_check_mark:",
						value: "For Yes"
					},
					{
						name: "\:x:",
						value: "For No"
					}
				],
				timestamp: new Date(),
				footer: {
					icon_url: client.user.avatarURL,
					text: "© Poll"
				}
			}
			});	
			setTimeout(() => {
				client.user.lastMessage.react("✅");
				client.user.lastMessage.react("❌");
			}, 900);
		}
	}
}

//command that displays all the commands
function displaycmds(message){
	if(message.isMentioned(client.user) && message.content.includes("commands")){
		message.channel.send({embed: {
			color: 3447003,
			author: {
			  name: client.user.username,
			  icon_url: client.user.avatarURL
			},
			title: "Command List",
			description: "This shows a list of all the commands",
			fields: [
			  {
				name: "@SpungBot#1940 toggle",
				value: "This toggles the whole bot"
			  },
			  {
				name: "@SpungBot#1940 commands",
				value: "This displays a list of commands"
			  },
			  {
				name: "@SpungBot#1940 serverlevel",
				value: "This displays the server's current level"
			  },
			  {
				name: "@SpungBot#1940 serverxp",
				value: "This displays the server's current xp count"
			  },
			  {
				name: "@SpungBot#1940 rank",
				value: "This displays your current rank"
			  },
			  {
				name: "@SpungBot#1940 cat",
				value: "This displays a random cat photo"
			  },
			  {
				name: "@SpungBot#1940 nsfw",
				value: "This displays a random NSFW photo"
			  },
			  {
				name: "@SpungBot#1940 hentai",
				value: "This displays a random hentai photo"
			  },
			  {
				name: "@SpungBot#1940 pizzatime",
				value: "This displays pizza time"
			  },
			  {
				name: "@SpungBot#1940 meme",
				value: "This displays a dank a$$ meme"
			  },
			  {
				name: "@SpungBot#1940 play `video title OR youtube link`",
				value: "This will make FuhrerBot join and play some epic noises"
			  },
			  {
				name: "@SpungBot#1940 queue",
				value: "This displays the audio queue"
			  },
			  {
				name: "@SpungBot#1940 leave",
				value: "This makes FuhrerBot leave the call"
			  },
			  {
				name: "@SpungBot#1940 can we get an f",
				value: "This is so sad"
			  },
			  {
				name: "@SpungBot#1940 poll *insert text here*",
				value: "This will create a poll of whatever you'd like"
			  }
			],
			timestamp: new Date(),
			footer: {
			  icon_url: client.user.avatarURL,
			  text: "© Command List"
			}
		  }
		});
			
	}
}

//checks checks the server table for an already existing id
function checkServerTable(message){
	server = message.guild.id;
	owner = message.guild.ownerID;
	user = owner.toString();
	membercount = message.guild.memberCount;
	servername = message.guild.name;
	var sql1 = "SELECT * FROM servers WHERE serverid = " + "'" + server + "'";
	if(message.author.username != "FuhrerBot"){
		connection.query(sql1, function (err, result){ 
			if (err) throw err;
			writeToServerTable(message, result);
		});
	}
}

//writes to the server, if the id doesn't exist
function writeToServerTable(message, result){
	if(!result.length){
		var sql2 = "INSERT INTO servers (serverid, usercount, owner, servername, toggled) VALUES (" + "'" + server + "'" + "," + "'" + membercount + "'" + "," + "'" + client.users.get(user).username + "'" + "," + "'" + servername + "'" + ",'1')";
		connection.query(sql2, function (err2, result) { if (err2) throw err2; });
		console.log(server);
		console.log(client.users.get(user).username);
		console.log(membercount);
		console.log(servername);
	}
}

//this automatically uploads server xp
function uploadServerXP(message){
	server = message.guild.id;
	membercount = message.guild.memberCount;
	var exp = (membercount * 30);
	var sql2 = "UPDATE servers SET xp = " + exp + " WHERE serverid = " + server;
	connection.query(sql2, function (err2, result) { if (err2) throw err2; });
}

//this automatically uploads member count
function uploadMembercount(message){
	server = message.guild.id;
	membercount = message.guild.memberCount;
	var sql2 = "UPDATE servers SET usercount = " + membercount + " WHERE serverid = " + server;
	connection.query(sql2, function (err2, result) { if (err2) throw err2; });
}

//updates the server table after each message
function updateServerTable(message, xp){
	uploadMembercount(message);
	uploadServerXP(message);
	updateLevel(message, xp);
}

//displays server level
function displayServerLevel(message, level, enabled){
	if(message.author.username != "FuhrerBot" && enabled == 1){
		if (message.content.includes("serverlevel") && message.isMentioned(client.user)) {
			message.channel.send("The server's level is " + level);
		}
	}
}

//displays server xp
function displayServerXP(message, xp, enabled){
	if(message.author.username != "FuhrerBot" && enabled == 1){
		if (message.content.includes("serverxp") && message.isMentioned(client.user)) {
			message.channel.send("The server's current xp level is " + xp + " xp");
		}
	}
}

//updates the level of the server
function updateLevel(message, xp){
	var server = message.guild.id;
	var level = 0;
	if(message.author.username != "FuhrerBot"){
		if(xp > 150){
			level = Math.floor(xp / 150);
		}
		var sql2 = "UPDATE servers SET serverrank = " + level + " WHERE serverid = " + server;
		connection.query(sql2, function (err2, result) { if (err2) throw err2; });
	}
}
 
client.login("NTYxNTgxMjcxNjEzMTc3ODk2.XJ-UhA.xG3uOqUs6FyaWsrSKhXxZYWkwSc");