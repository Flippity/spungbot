var request = require('superagent');

var keys = ["AIzaSyDjlxXiarCozeHrfl2kDPMNRHDnEashgcg", "AIzaSyAAChKV5u1LBlrpQWAr4MO5XkpVADcpMOQ", "AIzaSyAuz35wcZyYCyvSgre8y3zVpSkXS0_hSCs", "AIzaSyDRWaAaw_RMHBAULSVJoTAygw1_H670CXU", "AIzaSyCfGkhuOWjEzk7-OxnjhuvnvaeHa8Mahnc", "AIzaSyAfXJyCcTy700sQLU5zcRLyp9yIoop6dl8", "AIzaSyCT27RzcwIYqgAzkHv2_wwNWdOp5tQXusg", "AIzaSyA8KgX4Jy9VVfJTJPHJMDubnVTgvjVoXDg", "AIzaSyCRtJ2uhgYe7p3J-QkC6kHsm7KZz0bDIok", "AIzaSyCo-PwQAtlrchgSAY0hLnE2HYSRhqdsPXk", "AIzaSyC7asPTom1oZVPmZu7UcttGNFvqzRWQiRM", "AIzaSyCgp_Uc2jj1mAd7HW9AzAATt33rGkvttVQ", "AIzaSyDUUfmvtaHY3lQ11CbkF8gplSJSXwgLe2g", "AIzaSyDzUqDdCGrb5g5YU0fo0pB9QbqurkK3GSc", "AIzaSyBgcyeGD9VK-Nu2pnlP5VQaLWqYSIPWZRk", "AIzaSyAiWjUpPAvVy1fLj2VTJitH56Gs-2PBMLY", "AIzaSyA2bieaAnufzw9YNibt0R2WI14L8uU9tbw"]
const WATCH_VIDEO_URL = "https://www.youtube.com/watch?v=";

exports.watchVideoUrl = WATCH_VIDEO_URL;

exports.search = function search(searchKeywords, callback, server, connection, message) {
    var requestUrl = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[0]}`;
	
	//first api attempt
    request(requestUrl, (error, response) => {
        if (!error && response.statusCode == 200) {
			handleRequest(callback, response, server, connection, message);
        }else {
            console.log("Unexpected error when searching YouTube, trying again");
			console.log("First attempt");
			var requestUrl2 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[1]}`;
			request(requestUrl2, (error, response) => {
			if (!error && response.statusCode == 200) {
				handleRequest(callback, response, server, connection, message);
			}else {
				console.log("Unexpected error when searching YouTube, trying again");
				console.log("Second attempt");
				var requestUrl3 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[2]}`;
				request(requestUrl3, (error, response) => {
					if (!error && response.statusCode == 200) {
						handleRequest(callback, response, server, connection, message);
					}else{
					console.log("Unexpected error when searching YouTube, trying again");
					//third api attempt
					console.log("Third attempt");
					var requestUrl4 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[3]}`;
					request(requestUrl4, (error, response) => {
					if (!error && response.statusCode == 200) {
						handleRequest(callback, response, server, connection, message);
					}
						else {
							console.log("Unexpected error when searching YouTube, trying again");
							console.log("Fourth attempt");
							var requestUrl5 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[4]}`;
							request(requestUrl5, (error, response) => {
							if (!error && response.statusCode == 200) {
								handleRequest(callback, response, server, connection, message);
							}else{
								console.log("Unexpected error when searching YouTube, trying again");
								var requestUrl6 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[5]}`;
								request(requestUrl6, (error, response) => {
									if (!error && response.statusCode == 200) {
										handleRequest(callback, response, server, connection, message);
									}else{
										console.log("Unexpected error when searching YouTube, trying again");
										console.log("Fifth attempt");
										var requestUrl7 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[6]}`;
										request(requestUrl7, (error, response) => {
											if (!error && response.statusCode == 200) {
												handleRequest(callback, response, server, connection, message);
											}else{
												console.log("Unexpected error when searching YouTube, trying again");
												console.log("Sixth attempt");
												var requestUrl8 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[7]}`;
												request(requestUrl8, (error, response) => {
													if (!error && response.statusCode == 200) {
														handleRequest(callback, response, server, connection, message);
													}else{
														console.log("Unexpected error when searching YouTube, trying again");
														console.log("Seventh attempt");
														var requestUrl9 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[8]}`;
														request(requestUrl9, (error, response) => {
															if (!error && response.statusCode == 200) {
																handleRequest(callback, response, server, connection, message);
															}else{
																console.log("Unexpected error when searching YouTube, trying again");
																console.log("Eighth attempt");
																var requestUrl10 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[9]}`;
																request(requestUrl10, (error, response) => {
																	if (!error && response.statusCode == 200) {
																		handleRequest(callback, response, server, connection, message);
																	}else{
																		console.log("Unexpected error when searching YouTube, trying again");
																		console.log("Ninth attempt");
																		var requestUrl11 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[10]}`;
																		request(requestUrl11, (error, response) => {
																			if (!error && response.statusCode == 200) {
																				handleRequest(callback, response, server, connection, message);
																			}else{
																				console.log("Unexpected error when searching YouTube, trying again");
																				console.log("Tenth attempt");
																				var requestUrl12 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[11]}`;
																				request(requestUrl12, (error, response) => {
																					if (!error && response.statusCode == 200) {
																						handleRequest(callback, response, server, connection, message);
																					}else{
																						console.log("Unexpected error when searching YouTube, trying again");
																						console.log("Eleventh attempt");
																						var requestUrl13 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[12]}`;
																						request(requestUrl13, (error, response) => {
																							if (!error && response.statusCode == 200) {
																								handleRequest(callback, response, server, connection, message);
																							}else{
																								console.log("Unexpected error when searching YouTube, trying again");
																								console.log("Twelve attempt");
																								var requestUrl14 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[13]}`;
																								request(requestUrl14, (error, response) => {
																									if (!error && response.statusCode == 200) {
																										handleRequest(callback, response, server, connection, message);
																									}else{
																										console.log("Unexpected error when searching YouTube, trying again");
																										console.log("Thirteenth attempt");
																										var requestUrl15 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[14]}`;
																										request(requestUrl15, (error, response) => {
																											if (!error && response.statusCode == 200) {
																												handleRequest(callback, response, server, connection, message);
																											}else{
																												console.log("Unexpected error when searching YouTube, trying again");
																												console.log("Fourteenth attempt");
																												var requestUrl16 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[15]}`;
																												request(requestUrl16, (error, response) => {
																													if (!error && response.statusCode == 200) {
																														handleRequest(callback, response, server, connection, message);
																													}else{
																														console.log("Unexpected error when searching YouTube, trying again");
																														console.log("Fifteenth attempt");
																														var requestUrl17 = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&key=${keys[16]}`;
																														request(requestUrl17, (error, response) => {
																															if (!error && response.statusCode == 200) {
																																handleRequest(callback, response, server, connection, message);
																															}else{
																																console.log("Unexpected error when searching YouTube, trying again");
																																return;
																															}
																														});
																														return;
																													}
																												});
																												return;
																											}
																										});
																										return;
																									}
																								});
																								return;
																							}
																						});
																						return;
																					}
																				});
																				return;
																			}
																		});
																		return;
																	}
																});
																return;
															}
														});
														return;
													}
												});
												return;
											}
										});
										return;
									}
								});
								return;
							}
							});
							
							return;
						}
					});
					return;
				}
				});
				return;
			}
		});
            return;
        }
    });

    return;
};

function handleRequest(callback, response, server, connection, message){
	var body = response.body;
	if (body.items.length == 0) {
		console.log("Your search gave 0 results");
		return;
	}
	
	for (var item of body.items) {
		if (item.id.kind === 'youtube#video') {
			callback(item.id.videoId, item.snippet.title, server, connection, message);
			return; // prevent adding entire list of youtube videos
		}
	}
}