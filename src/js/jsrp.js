module.exports.client = require('./lib/client');
module.exports.server = require('./lib/server');
var jsrp = require('jsrp');
var client = new jsrp.client();
var server = new jsrp.server();
$(function(){

   //Registration

	 var inputs ={
		 eth_address:$("#eth_address"),
	   fname:$("#fname"),
		 lname:$("#lname"),
		 email:$("#email"),
		 gender:$("#gender"),
		 phone:$("#phone"),
		 email:$("#email"),
		 address:$("#address"),
		 dob:$("#dob"),
		 user:$("#username"),
		 pass:$("#password"),
		 imgSpinner:$("#img-loader"),
		 errorBox: $("#error-box"),
		 errorMsg:$("#error-msg")
   }

	 $(".btn-clear").click(function(){
		 inputs.fname.val("");
		 inputs.lname.val("");
		 inputs.eth_address.val("");
		 inputs.email.val("");
		 inputs.gender.val("");
		 inputs.phone.val("");
		 inputs.address.val("");
		 inputs.dob.val("");
		 inputs.user.val("");
		 inputs.pass.val("");
	 });
		$(".btn-register-main").click(function(){
			var eth = inputs.eth_address.val();
			var fname = inputs.fname.val();
			var lname = inputs.lname.val();
			var email = inputs.email.val();
			var gender = inputs.gender.val();
			var phone = inputs.phone.val();
			var address = inputs.address.val();
			var dob = inputs.dob.val();
			var user = inputs.user.val();
			var pass = inputs.pass.val();
      inputs.imgSpinner.show();
			//Below code does validation
	    if(user && pass && eth && fname && lname && email && gender && phone && email && address && dob){
				//This is where JSRP generates the verifier and salt for saving to database, for future authentication
				client.init({ username: user, password: pass}, function () {
					client.createVerifier(function(err, result) {
						//basicall calling a standalone PHP webservice to save the user's verifier and salt and username
						$.ajax({
										 type: 'GET',
										 url: "http://127.0.0.1/MediblockAccountApi/register.php?salt="+result.salt+"&verifier="+result.verifier+"&username="+user+"&p_key="+eth+"",
										 success: function(response) {
												 console.log(response.status);
												 if(response.status === 1){
													 //When is successful it triggers the blockchain event for saving user info to blockchain
												    $('.btn-register').trigger('click');

													}
														else {
															inputs.errorBox.show();
															inputs.errorMsg.empty().html("Could not save username or password (Server error)!");
													}
													inputs.imgSpinner.hide();
										 },
										 error: function(error) {
											 	inputs.imgSpinner.hide();
												 console.log(error);
										 }
								});
					});
				});
			}
			else{
				inputs.errorBox.show();
				inputs.errorMsg.empty().html("All fields are required please!");
				inputs.imgSpinner.hide();
			}



  	});

		//Login

		$(".btn-patient-login").click(function(){
			var user = $("#login-username").val();
			var eth = $("#login-account").val();
			var pass = $("#login-password").val();



			if(user && eth && pass){
			inputs.imgSpinner.show();
				$.ajax({
								 type: 'GET',
								 url: "http://127.0.0.1/MediblockAccountApi/login.php?username="+user+"&p_key="+eth+"",
								 success: function(response) {

										 console.log(response.status);
										 if(response.status === 1){
												server.init({ salt: String(response.salt), verifier:String(response.verifier)}, function () {
												});
												client.init({ username: user, password: pass }, function() {
													cPubKey = client.getPublicKey();
													server.setClientPublicKey(cPubKey);
												 salt = server.getSalt();
												 client.setSalt(salt);
												 sPubKey = server.getPublicKey();
												 client.setServerPublicKey(sPubKey);
												 if(client.getSharedKey()=== server.getSharedKey()){
													  $('.btn-login').trigger('click');
												 }
												 else{
													 inputs.errorBox.show();
													 inputs.errorMsg.empty().html("Incorrect credentilas!");
												 }

											 });

											}
											else {
													inputs.errorBox.show();
													inputs.errorMsg.empty().html("Username or password is incorrect!");
											}
											inputs.imgSpinner.hide();
								 },
								 error: function(error) {
										 inputs.imgSpinner.hide();
								 }
						});
			 }
			 else{
				 inputs.errorBox.show();
				 inputs.errorMsg.empty().html("All fields are required!");
				 inputs.imgSpinner.hide();
			 }



		})

});
